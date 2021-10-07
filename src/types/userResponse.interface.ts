import { UserEntity } from 'src/user/user.entity';

export interface UserResponseInterface {
  user: Omit<UserEntity, 'password' | 'hashPassword'> & { token: string };
}
