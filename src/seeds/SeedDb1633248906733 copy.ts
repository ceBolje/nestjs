import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedDb1633248906733 implements MigrationInterface {
  name = 'SeedDb1633248906733';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO tags (name) VALUES ('dragons'), ('coffee'), ('nestjs')`,
    );
    //password 1123456
    await queryRunner.query(
      `INSERT INTO users (username, email, password) VALUES ('Yany', 'Yany@gmail.com', '$2b$10$jqClo2sfQHFzQ88t88HkmufSChklBYsNSTX3znljhNCHn8XhYIUKW')`,
    );
    await queryRunner.query(
      `INSERT INTO articles (slug, title, description, body, "tagList", "authorId") VALUES 
      ('first-article','First article t','First article d', 'First article b', 'dragons,coffee', 1)`,
    );
    await queryRunner.query(
      `INSERT INTO articles (slug, title, description, body, "tagList", "authorId") VALUES 
      ('second-article','second article t','second article d', 'second article b', 'dragons,nestjs', 1)`,
    );
  }

  public async down(): Promise<void> {}
}
