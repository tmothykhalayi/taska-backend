
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Task } from '../../tasks/entities/task.entity';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column({ nullable: true })
  firstName!: string;

  @Column({ nullable: true })
  lastName!: string;

  @Column({ nullable: true })
  phoneNumber!: string;

  @Column()
  password!: string; // store hashed password in production

  @Column({ nullable: true })
  hashedRefreshToken?: string;

  @Column({ nullable: true })
  otp?: string;

  @Column({ nullable: true })
  secret?: string;

  @Column({ nullable: true })
  otpExpiry?: Date;

  @Column({ default: false })
  isEmailVerified!: boolean;

  @Column({ default: 'active' })
  status!: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role!: UserRole;

  @OneToMany(() => Task, task => task.user)
  tasks!: Task[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}