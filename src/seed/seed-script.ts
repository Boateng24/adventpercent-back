import { Command, CommandRunner } from 'nest-commander';
import { Injectable } from '@nestjs/common';
import { SeedService } from 'src/services/seed/seed.service'; // Adjust the path as needed

@Command({ name: 'seed-quartet', description: 'Seed quartet songs' })
@Injectable()
export class QuartetSeedCommand extends CommandRunner {
  constructor(private readonly seedService: SeedService) {
    super();
  }

  async run() {
    console.log('Starting to seed quartet songs...');
    await this.seedService.seedQuartet().then(() => {
      console.log('seeding completed');
    });
    console.log('Quartet songs seeded successfully');
  }
}
