import { ArticleType } from './article.types';

export interface ArticlesResponseInterface {
  articles: Array<ArticleType>;
  articlesCount: number;
}
