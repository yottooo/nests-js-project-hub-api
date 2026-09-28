import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import Redis from 'ioredis';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { REDIS } from '../redis/redis.module';

@Injectable()
export class ProjectsService {
  private readonly ALL_KEY = 'projects:all';
  private readonly TTL = 60;

  constructor(
    @InjectRepository(Project) private readonly repo: Repository<Project>,
    @Inject(REDIS) private readonly redis: Redis,
    private readonly events: EventEmitter2,
  ) {}

  create(createProjectDto: CreateProjectDto) {
    return 'This action adds a new project';
  }

  async findAll() {
    const cached = await this.redis.get(this.ALL_KEY);

    if (cached) {
      return JSON.parse(cached) as Project[];
    }

    const projects = await this.repo.find({ order: { createdAt: 'DESC' } });
    await this.redis.set(
      this.ALL_KEY,
      JSON.stringify(projects),
      'EX',
      this.TTL,
    );
    return projects;
  }

  async findOne(id: number) {
    const key = `projects:${id}`;
    const cached = await this.redis.get(key);

    if (cached) {
      return JSON.parse(cached) as Project;
    }

    const project = await this.repo.findOne({ where: { id } });
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return project;
  }

  update(id: number, updateProjectDto: UpdateProjectDto) {
    return `This action updates a #${id} project`;
  }

  remove(id: number) {
    return `This action removes a #${id} project`;
  }
}
