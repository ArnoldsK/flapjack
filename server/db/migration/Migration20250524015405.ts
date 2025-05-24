import { Migration } from "@mikro-orm/migrations"

const e = (value: string) => "`" + value + "`"

export class Migration20250524015405 extends Migration {
  override async up(): Promise<void> {
    this.addSql(/* sql */ `
      create table if not exists command_execute_entity (id varchar(255) not null, user_id varchar(255) not null, channel_id varchar(255) not null, command_name varchar(255) not null, input text not null, created_at varchar(255) not null, primary key (id)) default character set utf8mb4 engine = InnoDB;

      create table if not exists credits_entity (user_id varchar(255) not null, credits bigint unsigned not null, updated_at varchar(255) not null, primary key (user_id)) default character set utf8mb4 engine = InnoDB;

      create table if not exists experience_entity (user_id varchar(255) not null, exp int not null, primary key (user_id)) default character set utf8mb4 engine = InnoDB;

      create table if not exists persistent_thread_entity (id varchar(255) not null, channel_id varchar(255) not null, message_id varchar(255) not null, thread_id varchar(255) not null, user_id varchar(255) not null, primary key (id)) default character set utf8mb4 engine = InnoDB;

      create table if not exists redgifs_entity (id varchar(255) not null, token text not null, created_at varchar(255) not null, primary key (id)) default character set utf8mb4 engine = InnoDB;

      create table if not exists reminder_entity (id varchar(255) not null, channel_id varchar(255) not null, message_id varchar(255) not null, user_id varchar(255) not null, value text not null, expires_at datetime not null, created_at varchar(255) not null, primary key (id)) default character set utf8mb4 engine = InnoDB;

      create table if not exists roles_entity (id varchar(255) not null, user_id varchar(255) not null, role_ids text not null, primary key (id)) default character set utf8mb4 engine = InnoDB;

      create table if not exists rs_league_entity (user_id varchar(255) not null, name varchar(255) not null, primary key (user_id)) default character set utf8mb4 engine = InnoDB;

      create table if not exists setting_entity (${e("key")} varchar(255) not null, value text not null, primary key (key)) default character set utf8mb4 engine = InnoDB;

      create table if not exists static_data_entity (type varchar(255) not null, value longtext not null, primary key (type)) default character set utf8mb4 engine = InnoDB;

      create table if not exists stats_entity (id varchar(255) not null, channel_id varchar(255) not null, user_id varchar(255) not null, timestamp int not null, primary key (id)) default character set utf8mb4 engine = InnoDB;

      create table if not exists video_entity (id varchar(255) not null, user_id varchar(255) not null, user_display_name varchar(255) not null, channel_id varchar(255) not null, message_id varchar(255) not null, video_url varchar(255) not null, video_id varchar(255) not null, title varchar(255) not null, de_arrow_title varchar(255) null, thumbnail_url varchar(255) not null, author_name varchar(255) not null, author_url varchar(255) not null, created_at varchar(255) not null, primary key (id)) default character set utf8mb4 engine = InnoDB;
    `)
  }
}
