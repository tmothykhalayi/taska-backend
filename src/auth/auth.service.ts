import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginAuthDto } from './dto/login.dto';
import { CreateAuthDto } from './dto/create-auth.dto';
import { Users, UserRole } from '../users/entities/user.entity';
import { MailService } from '../mail/mail.service';
import * as speakeasy from 'speakeasy';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    private readonly usersService: UsersService,
  ) {}

  // ===== SIGN UP =====
  async signUp(createAuthDto: CreateAuthDto): Promise<{
    accessToken: string;
    refreshToken: string;
    user: {
      id: number;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
    };
  }> {
    // 1. Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createAuthDto.email },
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // 2. Create user with role-specific profile using UsersService
    const user = await this.usersService.createUserWithRole({
      email: createAuthDto.email,
      firstName: createAuthDto.firstName,
      lastName: createAuthDto.lastName,
      phoneNumber: createAuthDto.phoneNumber,
      password: createAuthDto.password,
      role: createAuthDto.role as unknown as UserRole,
      isEmailVerified: false,
    });

    // 3. Generate tokens
    const { accessToken, refreshToken } = await this.getTokens(
      user.id,
      user.email,
      user.role,
    );
    await this.updateRefreshToken(user.id, refreshToken);

    // 4. Return tokens and user info
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  // ===== SIGN IN =====
  async signIn(loginAuthDto: LoginAuthDto): Promise<{
    accessToken: string;
    refreshToken: string;
    user: {
      id: number;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
    };
  }> {
    try {
      const user = await this.userRepository.findOne({
        where: { email: loginAuthDto.email },

        select: [
          'id',
          'email',
          'password',
          'firstName',
          'lastName',
          'role',
          'hashedRefreshToken',
        ],
      });

      if (!user) {
        this.logger.warn(
          `Login failed - user not found: ${loginAuthDto.email}`,
        );
        throw new UnauthorizedException('Invalid credentials');
      }

      // Compare against 'user.password' which contains the hashed password
      const isPasswordValid = await bcrypt.compare(
        loginAuthDto.password,
        user.password,
      );
      if (!isPasswordValid) {
        this.logger.warn(
          `Login failed - invalid password: ${loginAuthDto.email}`,
        );
        throw new UnauthorizedException('Invalid credentials');
      }

      const { accessToken, refreshToken, role } = await this.getTokens(
        user.id,
        user.email,
        user.role,
      );

      await this.updateRefreshToken(user.id, refreshToken);

      // Login notification email disabled
      // try {
      //   await this.mailService.sendLoginNotification(user, new Date());
      // } catch (emailError) {
      //   this.logger.warn(
      //     `Failed to send login notification email: ${emailError.message}`,
      //   );
      // }

      // Destructure password and hashedRefreshToken to remove sensitive data
      const { password, hashedRefreshToken, ...userWithoutSensitive } = user;

      this.logger.log(`User logged in successfully: ${user.email}`);

      return {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      };
    } catch (error) {
      this.logger.error(`Sign in error: ${error.message}`);
      throw error;
    }
  }

  ///SEND A WELCOME EMAIL
  async sendWelcomeEmail(email: string): Promise<void> {
    try {
      const user = await this.userRepository.findOne({
        where: { email },
        select: ['id', 'email', 'firstName', 'lastName', 'role'],
      });
      if (!user) {
        this.logger.warn(
          `Welcome email requested for non-existent email: ${email}`,
        );
        throw new NotFoundException('User not found');
      }
      await this.mailService.sendWelcomeEmail(user);
      this.logger.log(`Welcome email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email: ${error.message}`);
      throw error;
    }
  }
  // ===== REFRESH TOKENS =====
  async refreshTokens(userId: number, refreshToken: string) {
    try {
      if (!refreshToken) {
        this.logger.error('No refresh token provided');
        throw new UnauthorizedException('No refresh token provided');
      }

      const user = await this.userRepository.findOne({
        where: { id: userId },
        select: ['id', 'email', 'role', 'hashedRefreshToken'],
      });

      if (!user || !user.hashedRefreshToken) {
        this.logger.warn(
          `Refresh failed - Invalid user or missing refresh token for ID: ${userId}`,
        );
        throw new UnauthorizedException('Access Denied');
      }

      const refreshTokenMatches = await bcrypt.compare(
        refreshToken,
        user.hashedRefreshToken,
      );

      if (!refreshTokenMatches) {
        this.logger.warn(
          `Refresh failed - Token mismatch for user ID: ${userId}`,
        );
        throw new UnauthorizedException('Access Denied');
      }

      const tokens = await this.getTokens(user.id, user.email, user.role);
      await this.updateRefreshToken(user.id, tokens.refreshToken);

      this.logger.log(`Tokens refreshed successfully for user ID: ${userId}`);

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        role: user.role,
      };
    } catch (error) {
      this.logger.error(`Token refresh failed: ${error.message}`);
      throw new UnauthorizedException('Unable to refresh tokens');
    }
  }

  // ===== VALIDATE TOKEN =====
  async validateToken(token: string): Promise<any> {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      });
      return payload;
    } catch (error) {
      this.logger.warn(`Token validation failed: ${error.message}`);
      throw new UnauthorizedException('Invalid token');
    }
  }

  // ===== SIGN OUT =====
  async signOut(userId: number) {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });

      if (!user) {
        this.logger.warn(`Sign out failed - user not found: ID ${userId}`);
        throw new NotFoundException(`User not found: ${userId}`);
      }

      await this.userRepository.update(userId, {
        hashedRefreshToken: undefined,
      });

      this.logger.log(`User signed out successfully: ID ${userId}`);

      return { message: 'Successfully signed out' };
    } catch (error) {
      this.logger.error(`Sign out error: ${error.message}`);
      throw error;
    }
  }

  // ===== GET TOKENS =====
  private async getTokens(
    userId: number,
    email: string,
    role: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    role: string | undefined;
  }> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email, role },
        {
          secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
          expiresIn: '36000000',
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, email, role },
        {
          secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
          expiresIn: '7d',
        },
      ),
    ]);

    return { accessToken, refreshToken, role };
  }

  // ===== UPDATE REFRESH TOKEN =====
  private async updateRefreshToken(userId: number, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    this.logger.log(`Updating hashed refresh token for user ID: ${userId}`);

    const result = await this.userRepository.update(userId, {
      hashedRefreshToken,
    });
    if (result.affected === 0) {
      this.logger.warn(`Failed to update refresh token for user ID: ${userId}`);
    } else {
      this.logger.log(
        `Refresh token updated successfully for user ID: ${userId}`,
      );
    }
  }

  // ===== PASSWORD RESET =====
  private generateOtp(): { otp: string; secret: string } {
    const secret = speakeasy.generateSecret({ length: 20 }).base32;
    const otp = speakeasy.totp({
      secret: secret,
      encoding: 'base32',
      step: 240, // 4 minutes
      digits: 6,
    });
    return { otp, secret };
  }
  // ===== SEND PASSWORD RESET EMAIL =====
  async sendPasswordResetEmail(email: string): Promise<{ message: string }> {
    try {
      const user = await this.userRepository.findOne({
        where: { email },
        select: ['id', 'email', 'firstName', 'lastName', 'role'],
      });

      if (!user) {
        this.logger.warn(
          `Password reset requested for non-existent email: ${email}`,
        );
        throw new NotFoundException('User not found');
      }

      const { otp, secret } = this.generateOtp();

      // Store OTP and secret in user record
      await this.userRepository.update(user.id, {
        otp: otp,
        secret: secret,
        otpExpiry: new Date(Date.now() + 4 * 60 * 1000), // 4 minutes from now
      });

      // Send password reset email
      await this.mailService.sendPasswordResetEmail(user, otp);

      this.logger.log(`Password reset email sent to ${email}`);

      return { message: 'Password reset email sent successfully' };
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email: ${error.message}`,
      );
      throw error;
    }
  }

  async resetPassword(
    email: string,
    otp: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    try {
      const user = await this.userRepository.findOne({
        where: { email },
        select: [
          'id',
          'email',
          'firstName',
          'lastName',
          'role',
          'otp',
          'secret',
          'otpExpiry',
        ],
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (!user.otp || !user.secret || !user.otpExpiry) {
        throw new BadRequestException('No password reset request found');
      }

      // Check if OTP has expired
      if (new Date() > user.otpExpiry) {
        throw new BadRequestException('OTP has expired');
      }

      // Verify OTP
      const isValidOtp = speakeasy.totp.verify({
        secret: user.secret,
        encoding: 'base32',
        token: otp,
        step: 240,
        digits: 6,
        window: 0,
      });

      if (!isValidOtp) {
        throw new BadRequestException('Invalid OTP');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password and clear OTP data
      await this.userRepository.update(user.id, {
        password: hashedPassword,
        otp: undefined,
        secret: undefined,
        otpExpiry: undefined,
      });

      // Send password reset success email
      try {
        await this.mailService.sendPasswordResetSuccessEmail(user);
      } catch (emailError) {
        this.logger.warn(
          `Failed to send password reset success email: ${emailError.message}`,
        );
      }

      this.logger.log(`Password reset successful for ${email}`);

      return { message: 'Password reset successful' };
    } catch (error) {
      this.logger.error(`Password reset failed: ${error.message}`);
      throw error;
    }
  }

  //
}
