import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import slugify from 'slugify';
import { UserEntity } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { ArticleEntity } from './article.entity';
import { CreateArticleDto } from './dto/createArticleDto';
import { ArticleResponseInterface } from './types/articleResponse.type';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
  ) {}

  async getArticleBySlug(slug: string): Promise<ArticleEntity> {
    return await this.articleRepository.findOne({ slug });
  }

  /**
   *
   * @param currentUser
   * @param createArticleDto
   * @returns ArticleEntity
   */
  async createArticle(
    currentUser: UserEntity,
    createArticleDto: CreateArticleDto,
  ): Promise<ArticleEntity> {
    const article = new ArticleEntity();
    Object.assign(article, createArticleDto);

    article.taglist = article.taglist ?? [];
    article.author = currentUser;
    article.slug = this.getSlug(article.title);

    return await this.articleRepository.save(article);
  }

  /**
   *
   * @param article
   * @returns ArticleResponseInterface
   */
  buildUserResponse(article: ArticleEntity): ArticleResponseInterface {
    return { article };
  }

  /**
   *
   * @returns string
   */
  private getSlug(title: string): string {
    const uniq = ((Math.random() * Math.pow(36, 6)) | 0).toString(36);
    return `${slugify(title, {
      lower: true,
    })}-${uniq}`;
  }
}
