import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// This guard is used for refreshing access tokens using refresh tokens
@Injectable()
export class RtGuard extends AuthGuard('jwt-rt') {
  constructor() {
    super();
  }
}
