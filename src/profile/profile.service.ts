import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { FollowEntity } from './follow.entity';
import { ProfileType } from './types/profile.types';
import { ProfileResponseInterface } from './types/profileResponse.interface';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(FollowEntity)
    private readonly followRepository: Repository<FollowEntity>,
  ) {}

  async getProfile(
    currentUserId: number,
    username: string,
  ): Promise<ProfileType> {
    const user = await this.userRepository.findOne({
      username: username,
    });

    if (!user) {
      throw new HttpException(
        'User with username not found',
        HttpStatus.NOT_FOUND,
      );
    }

    const follow = await this.followRepository.findOne({
      followerId: currentUserId,
      followingId: user.id,
    });

    return { ...user, ...{ following: Boolean(follow) } };
  }

  private async findAndCheckUser(
    currentUserId: number,
    username: string,
  ): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      username: username,
    });

    if (!user) {
      throw new HttpException(
        'User with username not found',
        HttpStatus.NOT_FOUND,
      );
    }
    if (currentUserId === user.id) {
      throw new HttpException(
        'User and folower are equal',
        HttpStatus.BAD_REQUEST,
      );
    }

    return user;
  }

  async followProfile(
    currentUserId: number,
    username: string,
  ): Promise<ProfileType> {
    const user = await this.findAndCheckUser(currentUserId, username);
    const follow = await this.followRepository.findOne({
      followerId: currentUserId,
      followingId: user.id,
    });

    if (!follow) {
      const newFollow = new FollowEntity();
      newFollow.followerId = currentUserId;
      newFollow.followingId = user.id;
      await this.followRepository.save(newFollow);
    }

    return { ...user, following: true };
  }

  async unfollowProfile(
    currentUserId: number,
    username: string,
  ): Promise<ProfileType> {
    const user = await this.findAndCheckUser(currentUserId, username);

    await this.followRepository.delete({
      followerId: currentUserId,
      followingId: user.id,
    });

    return { ...user, following: false };
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
