import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from '../../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

interface JwtPayload {
  sub: number;
  email: string;
  [key: string]: any;
}

@Injectable()
export class RfStrategy extends PassportStrategy(Strategy, 'jwt-rt') {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.getOrThrow<string>('JWT_REFRESH_TOKEN_SECRET'),
      passReqToCallback: true,
      ignoreExpiration: false,
    });
  }

  async validate(req: Request, payload: JwtPayload): Promise<any> {
    const authHeader = req.get('Authorization');

    if (!authHeader) {
      throw new UnauthorizedException('No refresh token provided');
    }

    const refreshToken = authHeader.replace('Bearer ', '').trim();

    if (!refreshToken) {
      throw new UnauthorizedException('Invalid refresh token format');
    }

    console.log('Auth header:', authHeader);
    console.log('Decoded payload:', payload);
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
      select: ['id', 'email', 'role', 'hashedRefreshToken'],
    });
    console.log('User from DB:', user);
    if (user) {
      console.log('User hashedRefreshToken:', user.hashedRefreshToken);
    }
    const refreshTokenMatches =
      user && user.hashedRefreshToken
        ? await bcrypt.compare(refreshToken, user.hashedRefreshToken)
        : false;
    console.log('Refresh token matches:', refreshTokenMatches);

    if (!refreshTokenMatches || !user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
  }
}
