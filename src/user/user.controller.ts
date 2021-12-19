import { Body, Controller, Post, UsePipes, Get, UseGuards, Put } from '@nestjs/common';
import { BackendValidationPipe } from 'src/shared/pipes';
import { UserResponseInterface } from 'src/user/types/userResponse.interface';
import { CreateUserDto } from './dto/createUser.dto';
import { LoginUserDto } from './dto/loginUser.dto';
import { UserService } from './user.service';
import { User } from './decorators/user.decorator';
import { UserEntity } from './user.entity';
import { AuthGuard } from './guards/auth.guard';
import { UpdateUserDto } from './dto/updateUser.dto';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('users')
  @UsePipes(new BackendValidationPipe())
  async createUser(@Body('user') createUserDto: CreateUserDto): Promise<UserResponseInterface> {
    const user = await this.userService.createUser(createUserDto);
    return this.userService.buildUserResponse(user);
  }

  @Post('users/login')
  @UsePipes(new BackendValidationPipe())
  async loginUser(@Body('user') loginUserDto: LoginUserDto): Promise<UserResponseInterface> {
    const user = await this.userService.loginUser(loginUserDto);
    return this.userService.buildUserResponse(user);
  }

  @Get('users')
  @UseGuards(AuthGuard)
  async currentUser(@User() user: UserEntity): Promise<UserResponseInterface> {
    return this.userService.buildUserResponse(user);
  }

  @Put('users')
  @UseGuards(AuthGuard)
  @UsePipes(new BackendValidationPipe())
  async updateCurrentUser(
    @User('id') currentUserId: number,
    @Body('user') updateUserDto: UpdateUserDto,
  ): Promise<UserResponseInterface> {
    const updatedUser = await this.userService.updateUser(currentUserId, updateUserDto);
    return this.userService.buildUserResponse(updatedUser);
  }
}
