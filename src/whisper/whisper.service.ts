import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'child_process';
import { promises as fs, createWriteStream } from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as https from 'https';
import * as http from 'http';

@Injectable()
export class WhisperService {
  private readonly logger = new Logger(WhisperService.name);

  // On Windows Python is "python", on Unix it's "python3"
  private readonly pythonBin =
    process.env.PYTHON_BIN ??
    (process.platform === 'win32' ? 'python' : 'python3');

  private downloadFile(url: string, destPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const file = createWriteStream(destPath);
      const client = url.startsWith('https') ? https : http;
      client
        .get(url, (res) => {
          if (res.statusCode !== 200) {
            reject(new Error(`Download failed: HTTP ${res.statusCode}`));
            return;
          }
          res.pipe(file);
          file.on('finish', () => {
            file.close();
            resolve();
          });
        })
        .on('error', reject);
    });
  }

  private segmentsToLRC(
    segments: Array<{ start: number; text: string }>,
  ): string {
    return segments
      .map((seg) => {
        const t = seg.start;
        const mins = String(Math.floor(t / 60)).padStart(2, '0');
        const secs = String(Math.floor(t % 60)).padStart(2, '0');
        const cs = String(Math.floor((t % 1) * 100)).padStart(2, '0');
        return `[${mins}:${secs}.${cs}]${seg.text.trim()}`;
      })
      .join('\n');
  }

  private runWhisper(audioPath: string, model = 'base'): Promise<string> {
    return new Promise((resolve, reject) => {
      const tmpDir = os.tmpdir();
      const proc = spawn(this.pythonBin, [
        '-m',
        'whisper',
        audioPath,
        '--output_format',
        'json',
        '--output_dir',
        tmpDir,
        '--model',
        model,
      ]);

      let stderr = '';
      proc.stderr.on('data', (d: Buffer) => {
        stderr += d.toString();
      });

      proc.on('close', async (code: number) => {
        if (code !== 0) {
          return reject(
            new Error(`Whisper exited ${code}: ${stderr.slice(0, 300)}`),
          );
        }
        const jsonPath = path.join(
          tmpDir,
          path.basename(audioPath, path.extname(audioPath)) + '.json',
        );
        try {
          const raw = await fs.readFile(jsonPath, 'utf8');
          const data = JSON.parse(raw);
          const lrc = this.segmentsToLRC(data.segments ?? []);
          await fs.unlink(jsonPath).catch(() => {});
          resolve(lrc);
        } catch (err) {
          reject(err);
        }
      });
    });
  }

  async generateLRC(audioUrl: string, model = 'base'): Promise<string> {
    const ext = path.extname(new URL(audioUrl).pathname) || '.mp3';
    const tmpAudio = path.join(os.tmpdir(), `whisper_${Date.now()}${ext}`);
    try {
      await this.downloadFile(audioUrl, tmpAudio);
      return await this.runWhisper(tmpAudio, model);
    } finally {
      await fs.unlink(tmpAudio).catch(() => {});
    }
  }

  // Call this after a song is saved — fires and forgets, never blocks the response
  scheduleTranscription(songId: string, audioUrl: string, title: string, updateFn: (lrc: string) => Promise<void>) {
    this.generateLRC(audioUrl, 'base')
      .then(async (lrc) => {
        await updateFn(lrc);
        this.logger.log(`[Whisper] LRC saved for: ${title}`);
      })
      .catch((err: Error) => {
        this.logger.error(`[Whisper] Failed for "${title}": ${err.message}`);
      });
  }
}
