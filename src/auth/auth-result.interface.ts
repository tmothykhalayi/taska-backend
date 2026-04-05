import { User } from '../users/entities/user.entity';

export interface SignInResult {
  user: Partial<User>;
  accessToken: string;
  refreshToken: string;
  role: string;
}
