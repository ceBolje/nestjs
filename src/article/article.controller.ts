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
  UsePipes,
  ValidationPipe,
  Query,
} from '@nestjs/common';
import { User } from 'src/user/decorators/user.decorator';
import { AuthGuard } from 'src/user/guards/auth.guard';
import { UserEntity } from 'src/user/user.entity';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/createArticleDto';
import { ArticleResponseInterface } from './types/articleResponse.interface';
import { ArticlesResponseInterface } from './types/articlesResponse.interface';

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get()
  async getAll(
    @User('id') currentUserId: number,
    @Query() query: any,
  ): Promise<ArticlesResponseInterface> {
    return this.articleService.findAll(currentUserId, query);
  }

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
  @UsePipes(new ValidationPipe())
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
  @UsePipes(new ValidationPipe())
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

  @Post(':slug/favorite')
  @UseGuards(AuthGuard)
  async addArticleToFavorite(
    @User('id') curentUserId: number,
    @Param('slug') slug: string,
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.addArticleToFavorite(
      curentUserId,
      slug,
    );
    return this.articleService.buildUserResponse(article);
  }

  @Delete(':slug/favorite')
  @UseGuards(AuthGuard)
  async deleteArticleFromFavorite(
    @User('id') curentUserId: number,
    @Param('slug') slug: string,
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.deleteArticleFromFavorite(
      curentUserId,
      slug,
    );
    return this.articleService.buildUserResponse(article);
  }
}
