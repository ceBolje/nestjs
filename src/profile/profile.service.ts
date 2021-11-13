import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { ProfileType } from './types/profile.types';
import { ProfileResponseInterface } from './types/profileResponse.interface';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async getProfile(username: string): Promise<ProfileType> {
    const user = await this.userRepository.findOne({
      username: username,
    });

    if (!user) {
      throw new HttpException(
        'User with username not found',
        HttpStatus.NOT_FOUND,
      );
    }

    return { ...user, ...{ following: false } };
  }

  buildProfileResponse(profile: ProfileType): ProfileResponseInterface {
    const { id, username, bio, image, following } = profile;
    return {
      profile: {
        id,
        username,
        bio,
        image,
        following,
      },
    };
  }
}
