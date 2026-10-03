import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Health } from './health.entity';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @InjectRepository(Health)
    private readonly healthRepository: Repository<Health>,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('db-test')
  async testDb() {
    try {
      const count = await this.healthRepository.count();
      return {
        status: 'Connected to PostgreSQL!',
        entityCount: count,
      };
    } catch (error) {
      return {
        status: 'Error connecting to database',
        error: error.message,
      };
    }
  }
}
