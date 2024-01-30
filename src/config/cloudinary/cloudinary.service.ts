import { Injectable } from '@nestjs/common';
import * as cloudinary from 'cloudinary';
import * as fs from 'fs';

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.v2.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadMusic(filePath: string): Promise<string> {
    try {
      if (fs.existsSync(filePath)) {
        console.log(`File found ${filePath}`);
      } else {
        console.log(`File not found ${filePath}`);
        return undefined; // File not found
      }

      const result = await cloudinary.v2.uploader.upload(filePath, {
        resource_type: 'video', // Changed to 'video'
        folder: 'adadamuSongs',
      });

      return result.secure_url;
    } catch (error) {
      console.error(`Error uploading file ${filePath}:`, error);
      return undefined; // Return undefined in case of error
    }
  }

  async uploadImage(file: string | Buffer): Promise<string> {
    let uploadSource: string | Buffer;

    if (Buffer.isBuffer(file)) {
      // Convert Buffer to Data URL
      const base64Data = file.toString('base64');
      uploadSource = `data:image/jpeg;base64,${base64Data}`;
    } else {
      uploadSource = file;
    }

    const result = await cloudinary.v2.uploader.upload_large(uploadSource, {
      resource_type: 'image',
      folder: 'adadamuImages',
    });
    return result.secure_url;
  }
}
