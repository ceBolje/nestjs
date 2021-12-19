import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { sign } from 'jsonwebtoken';
import { T_SECRET } from 'src/config';
import { UserResponseInterface } from 'src/user/types/userResponse.interface';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/createUser.dto';
import { LoginUserDto } from './dto/loginUser.dto';
import { UserEntity } from './user.entity';
import { compare } from 'bcrypt';
import { UpdateUserDto } from './dto/updateUser.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  /**
   *
   * @param createUserDto
   * @returns
   */
  async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    const errorResponse = { errors: {} };
    const userByEmail = await this.userRepository.findOne({
      email: createUserDto.email,
    });
    const userByUsername = await this.userRepository.findOne({
      username: createUserDto.username,
    });

    if (userByEmail) {
      errorResponse.errors['email'] = 'Email are taken';
    }

    if (userByUsername) {
      errorResponse.errors['username'] = 'Username are taken';
    }
    if (userByEmail || userByUsername) {
      throw new HttpException(errorResponse, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    const newUser = new UserEntity();
    Object.assign(newUser, createUserDto);
    return await this.userRepository.save(newUser);
  }

  /**
   *
   * @param loginUserDto
   * @returns
   */
  async loginUser(loginUserDto: LoginUserDto): Promise<UserEntity> {
    const errorResponse = {
      errors: {
        'email or password': 'are invalid',
      },
    };
    const user = await this.userRepository.findOne({
      email: loginUserDto.email,
    });
    if (!user) {
      throw new HttpException(errorResponse, HttpStatus.NOT_FOUND);
    }
    const isMatch = await compare(loginUserDto.password, user.password);
    if (!isMatch) {
      throw new HttpException(errorResponse, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    return await this.userRepository.save(user);
  }

  /**
   *
   * @param user
   * @param updateUserDto
   * @returns
   */
  async updateUser(userId: number, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    const user = await this.findUserById(userId);
    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  findUserById(id: number): Promise<UserEntity> {
    return this.userRepository.findOne(id);
  }

  generateJwt(user: UserEntity): string {
    return sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      T_SECRET,
    );
  }

  buildUserResponse(user: UserEntity): UserResponseInterface {
    return {
      user: {
        ...user,
        token: this.generateJwt(user),
      },
    };
  }
}
