import { Users } from '../users/entities/user.entity';

export interface SignInResult {
  user: Partial<Users>;
  accessToken: string;
  refreshToken: string;
  role: string;
}
