import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import slugify from 'slugify';
import { FollowEntity } from 'src/profile/follow.entity';
import { UserEntity } from 'src/user/user.entity';
import { DeleteResult, getRepository, Repository } from 'typeorm';
import { ArticleEntity } from './article.entity';
import { CreateArticleDto } from './dto/createArticleDto';
import { ArticleResponseInterface } from './types/articleResponse.interface';
import { ArticlesResponseInterface } from './types/articlesResponse.interface';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,

    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,

    @InjectRepository(FollowEntity)
    private readonly followRepository: Repository<FollowEntity>,
  ) {}

  /**
   *
   * @param slug
   * @returns ArticleEntity
   */
  async getArticleBySlug(slug: string): Promise<ArticleEntity> {
    return await this.articleRepository.findOne({ slug });
  }

  async findAll(currentUserId: number, query): Promise<ArticlesResponseInterface> {
    const queryBuilder = getRepository(ArticleEntity)
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author');

    queryBuilder.orderBy('articles.createdAt', 'DESC');

    if (query.tag) {
      queryBuilder.andWhere('articles.tagList LIKE :tag', {
        tag: `%${query.tag}%`,
      });
    }

    if (query.author) {
      const author = await this.userRepository.findOne({
        username: query.author,
      });
      queryBuilder.andWhere('articles.authorId = :id', { id: author.id });
    }
    if (query.favorited) {
      const author = await this.userRepository.findOne(
        { username: query.favorited },
        { relations: ['favorites'] },
      );

      const ids = author.favorites.map((el) => el.id);

      if (ids.length) {
        queryBuilder.andWhere('articles.id IN (:...ids)', { ids: ids });
      } else {
        queryBuilder.andWhere('1=0');
      }
    }
    if (query.limit) {
      queryBuilder.limit(query.limit);
    }
    if (query.offset) {
      queryBuilder.offset(query.offset);
    }

    const articles = await queryBuilder.getMany();
    const articlesCount = await queryBuilder.getCount();
    let favoritedIds: Array<number> = [];
    if (currentUserId) {
      const user = await this.userRepository.findOne(currentUserId, {
        relations: ['favorites'],
      });

      favoritedIds = user.favorites.map((el) => el.id);
    }

    const articleWithFAvorites = articles.map((article) => {
      const favorited = favoritedIds.includes(article.id);
      return { ...article, favorited };
    });

    return { articles: articleWithFAvorites, articlesCount };
  }

  async getFeed(currentUserId: number, query: any): Promise<ArticlesResponseInterface> {
    const follows = await this.followRepository.find({
      followerId: currentUserId,
    });

    if (follows.length === 0) {
      return { articles: [], articlesCount: 0 };
    }

    const followingUserIds: Array<number> = follows.map((follow) => follow.followingId);

    const queryBuilder = getRepository(ArticleEntity)
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author')
      .where('articles.authorId IN (:...ids)', { ids: followingUserIds });

    queryBuilder.orderBy('articles.createdAt', 'DESC');

    const articlesCount = await queryBuilder.getCount();

    if (query.limit) {
      queryBuilder.limit(query.limit);
    }

    if (query.offset) {
      queryBuilder.offset(query.offset);
    }

    const articles = await queryBuilder.getMany();

    return { articles, articlesCount };
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

    article.tagList = article.tagList ?? [];
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

  /**
   *
   * @param currentUserId
   * @param slug
   * @returns DeleteResult
   */
  async deleteArticle(currentUserId: number, slug: string): Promise<DeleteResult> {
    const article = await this.getArticleBySlug(slug);
    if (!article) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }

    if (article.author.id !== currentUserId) {
      throw new HttpException('Not allowed', HttpStatus.FORBIDDEN);
    }

    return this.articleRepository.delete({ slug });
  }

  async updateArticle(
    currentUserId: number,
    slug: string,
    createArticleDto: CreateArticleDto,
  ): Promise<ArticleEntity> {
    const article = await this.getArticleBySlug(slug);
    if (!article) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }

    if (article.author.id !== currentUserId) {
      throw new HttpException('Not allowed', HttpStatus.FORBIDDEN);
    }

    Object.assign(article, createArticleDto);
    article.slug = this.getSlug(article.title);

    return await this.articleRepository.save(article);
  }

  async addArticleToFavorite(currentUserId: number, slug: string): Promise<ArticleEntity> {
    const article = await this.getArticleBySlug(slug);
    const user = await this.userRepository.findOne(currentUserId, {
      relations: ['favorites'],
    });
    if (!article) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
    const isNotFavorite: boolean =
      user.favorites.findIndex((articleInFavorites) => articleInFavorites.id === article.id) === -1;

    if (isNotFavorite) {
      user.favorites.push(article);
      article.favoriteCount++;
      await this.userRepository.save(user);
      await this.articleRepository.save(article);
    }

    return article;
  }

  async deleteArticleFromFavorite(currentUserId: number, slug: string): Promise<ArticleEntity> {
    const article = await this.getArticleBySlug(slug);
    const user = await this.userRepository.findOne(currentUserId, {
      relations: ['favorites'],
    });
    if (!article) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
    const articleIndex: number = user.favorites.findIndex(
      (articleInFavorites) => articleInFavorites.id === article.id,
    );

    if (articleIndex >= 0) {
      user.favorites.splice(articleIndex, 1);
      article.favoriteCount--;
      await this.userRepository.save(user);
      await this.articleRepository.save(article);
    }

    return article;
  }
}
