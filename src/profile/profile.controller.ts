import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileResponseInterface } from './types/profileResponse.interface';

@Controller('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(':username')
  async getProfil(
    @Param('username') username: string,
  ): Promise<ProfileResponseInterface> {
    const user = await this.profileService.getProfile(username);

    return this.profileService.buildProfileResponse(user);
  }
}
