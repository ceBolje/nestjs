import { UserType } from 'src/user/types/user.types';

export type ProfileType = Pick<
  UserType,
  'id' | 'username' | 'bio' | 'image'
> & {
  following: boolean;
};
