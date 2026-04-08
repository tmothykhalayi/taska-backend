import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
  ) {}

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    // If isGlobal is true, don't require userId. Otherwise, userId is required
    let user: User | null = null;
    
    if (!createTaskDto.isGlobal && createTaskDto.userId) {
      user = await this.usersService.findOne(createTaskDto.userId);
    } else if (!createTaskDto.isGlobal && !createTaskDto.userId) {
      throw new Error('userId is required for non-global tasks');
    }

    const status = createTaskDto.status || TaskStatus.PENDING;
    const task = this.taskRepository.create({
      title: createTaskDto.title,
      description: createTaskDto.description ?? null,
      priority: createTaskDto.priority,
      dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : null,
      category: createTaskDto.category ?? null,
      status,
      completed: status === TaskStatus.COMPLETED,
      isGlobal: createTaskDto.isGlobal ?? false,
      user,
    });
    
    const savedTask = await this.taskRepository.save(task);

    // Send task assigned email if task is assigned to a specific user
    if (user && user.email) {
      try {
        await this.mailService.sendTaskAssignedEmail({
          assigneeEmail: user.email,
          assigneeFirstName: user.firstName,
          taskTitle: savedTask.title,
          taskDescription: savedTask.description || undefined,
          dueDate: savedTask.dueDate ? savedTask.dueDate.toLocaleDateString() : undefined,
          priority: savedTask.priority,
        });
      } catch (emailError) {
        // Log but don't fail task creation if email fails
        console.error('Failed to send task assigned email:', emailError);
      }
    }

    return savedTask;
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
    const wasCompleted = task.completed;

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
    if (updateTaskDto.isGlobal !== undefined) task.isGlobal = updateTaskDto.isGlobal;

    if (updateTaskDto.status !== undefined) {
      task.status = updateTaskDto.status;
      task.completed = updateTaskDto.status === TaskStatus.COMPLETED;
    }

    const updatedTask = await this.taskRepository.save(task);

    // Send task completed email if task was just marked as completed
    if (!wasCompleted && updatedTask.completed && updatedTask.user && updatedTask.user.email) {
      try {
        await this.mailService.sendTaskCompletedEmail({
          userEmail: updatedTask.user.email,
          userFirstName: updatedTask.user.firstName,
          taskTitle: updatedTask.title,
          completedDate: new Date().toLocaleString(),
        });
      } catch (emailError) {
        // Log but don't fail task update if email fails
        console.error('Failed to send task completion email:', emailError);
      }
    }

    return updatedTask;
  }

  async remove(id: number): Promise<void> {
    const task = await this.findOne(id);
    await this.taskRepository.remove(task);
  }

  // Get all global tasks (for everyone)
  async findAllGlobal(): Promise<Task[]> {
    return this.taskRepository.find({
      where: { isGlobal: true },
      relations: ['user'],
    });
  }

  // Get tasks for a specific user including global tasks
  async findByUserId(userId: number): Promise<Task[]> {
    return this.taskRepository.find({
      where: [
        { user: { id: userId } }, // Tasks assigned to the user
        { isGlobal: true }, // Global tasks for everyone
      ],
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  // Get only personified tasks for a specific user (excluding global)
  async findPersonalByUserId(userId: number): Promise<Task[]> {
    return this.taskRepository.find({
      where: { user: { id: userId }, isGlobal: false },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }
}