import {
  Controller,
  Post,
  UseGuards,
  Body,
  Get,
  Param,
  HttpException,
  HttpStatus,
  Delete,
  Put,
} from '@nestjs/common';
import { User } from 'src/user/decorators/user.decorator';
import { CreateUserDto } from 'src/user/dto/createUser.dto';
import { AuthGuard } from 'src/user/guards/auth.guard';
import { UserEntity } from 'src/user/user.entity';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/createArticleDto';
import { ArticleResponseInterface } from './types/articleResponse.type';

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  /**
   *
   * @param slug
   * @returns ArticleResponseInterface
   */
  @Get(':slug')
  async getArticleBySlug(
    @Param('slug') slug: string,
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.getArticleBySlug(slug);
    if (!article) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
    return this.articleService.buildUserResponse(article);
  }

  /**
   *
   * @param currentUser
   * @param createArticleDto
   * @returns ArticleResponseInterface
   */
  @Post('create')
  @UseGuards(AuthGuard)
  async createArticle(
    @User() currentUser: UserEntity,
    @Body('article') createArticleDto: CreateArticleDto,
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.createArticle(
      currentUser,
      createArticleDto,
    );

    return this.articleService.buildUserResponse(article);
  }

  @Delete(':slug')
  @UseGuards(AuthGuard)
  async deleteArticle(
    @User('id') curentUserId: number,
    @Param('slug') slug: string,
  ) {
    return await this.articleService.deleteArticle(curentUserId, slug);
  }

  @Put(':slug')
  @UseGuards(AuthGuard)
  async updateArticle(
    @User('id') curentUserId: number,
    @Param('slug') slug: string,
    @Body('article') createArticleDto: CreateArticleDto,
  ) {
    const article = await this.articleService.updateArticle(
      curentUserId,
      slug,
      createArticleDto,
    );
    return this.articleService.buildUserResponse(article);
  }
}
