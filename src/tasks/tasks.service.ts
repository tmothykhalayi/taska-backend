import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    private readonly usersService: UsersService,
  ) {}

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const user = await this.usersService.findOne(createTaskDto.userId);
    const status = createTaskDto.status || TaskStatus.PENDING;
    const task = this.taskRepository.create({
      title: createTaskDto.title,
      description: createTaskDto.description ?? null,
      priority: createTaskDto.priority,
      dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : null,
      category: createTaskDto.category ?? null,
      status,
      completed: status === TaskStatus.COMPLETED,
      user,
    });
    return this.taskRepository.save(task);
  }

  findAll(): Promise<Task[]> {
    return this.taskRepository.find({ relations: ['user'] });
  }

  async findOne(id: number): Promise<Task> {
    const task = await this.taskRepository.findOne({ where: { id }, relations: ['user'] });
    if (!task) throw new NotFoundException(`Task with id ${id} not found`);
    return task;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id);
    if (updateTaskDto.userId) {
      const user = await this.usersService.findOne(updateTaskDto.userId);
      task.user = user;
    }

    if (updateTaskDto.title !== undefined) task.title = updateTaskDto.title;
    if (updateTaskDto.description !== undefined)
      task.description = updateTaskDto.description;
    if (updateTaskDto.priority !== undefined) task.priority = updateTaskDto.priority;
    if (updateTaskDto.category !== undefined) task.category = updateTaskDto.category;
    if (updateTaskDto.dueDate !== undefined) {
      task.dueDate = updateTaskDto.dueDate
        ? new Date(updateTaskDto.dueDate)
        : null;
    }

    if (updateTaskDto.status !== undefined) {
      task.status = updateTaskDto.status;
      task.completed = updateTaskDto.status === TaskStatus.COMPLETED;
    }

    return this.taskRepository.save(task);
  }

  async remove(id: number): Promise<void> {
    const task = await this.findOne(id);
    await this.taskRepository.remove(task);
  }
}