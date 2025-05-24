import { Migration } from '@mikro-orm/migrations';

export class Migration20250524010852 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table \`command_execute_entity\` (\`id\` varchar(255) not null, \`user_id\` varchar(255) not null, \`channel_id\` varchar(255) not null, \`command_name\` varchar(255) not null, \`input\` text not null, \`created_at\` datetime not null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);

    this.addSql(`create table \`credits_entity\` (\`user_id\` varchar(255) not null, \`credits\` bigint unsigned not null, \`updated_at\` datetime not null, primary key (\`user_id\`)) default character set utf8mb4 engine = InnoDB;`);

    this.addSql(`create table \`experience_entity\` (\`user_id\` varchar(255) not null, \`exp\` int not null, primary key (\`user_id\`)) default character set utf8mb4 engine = InnoDB;`);

    this.addSql(`create table \`persistent_thread_entity\` (\`id\` varchar(255) not null, \`channel_id\` varchar(255) not null, \`message_id\` varchar(255) not null, \`thread_id\` varchar(255) not null, \`user_id\` varchar(255) not null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`persistent_thread_entity\` add unique \`persistent_thread_entity_thread_id_unique\`(\`thread_id\`);`);

    this.addSql(`create table \`redgifs_entity\` (\`id\` varchar(255) not null, \`token\` text not null, \`created_at\` datetime not null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);

    this.addSql(`create table \`reminder_entity\` (\`id\` varchar(255) not null, \`channel_id\` varchar(255) not null, \`message_id\` varchar(255) not null, \`user_id\` varchar(255) not null, \`value\` text not null, \`expires_at\` datetime not null, \`created_at\` datetime not null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);

    this.addSql(`create table \`roles_entity\` (\`id\` int unsigned not null auto_increment primary key, \`user_id\` varchar(255) not null, \`role_ids\` text not null) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`roles_entity\` add unique \`roles_entity_user_id_unique\`(\`user_id\`);`);

    this.addSql(`create table \`rs_league_entity\` (\`user_id\` varchar(255) not null, \`name\` varchar(255) not null, primary key (\`user_id\`)) default character set utf8mb4 engine = InnoDB;`);

    this.addSql(`create table \`setting_entity\` (\`key\` varchar(255) not null, \`value\` text not null, primary key (\`key\`)) default character set utf8mb4 engine = InnoDB;`);

    this.addSql(`create table \`static_data_entity\` (\`type\` varchar(255) not null, \`value\` longtext not null, primary key (\`type\`)) default character set utf8mb4 engine = InnoDB;`);

    this.addSql(`create table \`stats_entity\` (\`id\` varchar(255) not null, \`channel_id\` varchar(255) not null, \`user_id\` varchar(255) not null, \`timestamp\` int not null default 1748048932, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);

    this.addSql(`create table \`video_entity\` (\`id\` varchar(255) not null, \`user_id\` varchar(255) not null, \`user_display_name\` varchar(255) not null, \`channel_id\` varchar(255) not null, \`message_id\` varchar(255) not null, \`video_url\` varchar(255) not null, \`video_id\` varchar(255) not null, \`title\` varchar(255) not null, \`de_arrow_title\` varchar(255) null, \`thumbnail_url\` varchar(255) not null, \`author_name\` varchar(255) not null, \`author_url\` varchar(255) not null, \`created_at\` datetime not null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);
  }

}
