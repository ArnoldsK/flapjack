import { Migration } from "@mikro-orm/migrations"

// MySQL is so ass...
export class Migration20250524030000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(/* sql */ `
      alter table command_execute_entity change if exists userId user_id varchar(255) not null;
    `)
    this.addSql(/* sql */ `
      alter table command_execute_entity change if exists channelId channel_id varchar(255) not null;
    `)
    this.addSql(/* sql */ `
      alter table command_execute_entity change if exists commandName command_name varchar(255) not null;
    `)
    this.addSql(/* sql */ `
      alter table command_execute_entity change if exists createdAt created_at varchar(255) not null;
    `)
    this.addSql(/* sql */ `
      alter table credits_entity change if exists userId user_id varchar(255) not null;
    `)
    this.addSql(/* sql */ `
      alter table credits_entity change if exists updatedAt updated_at varchar(255) not null;
    `)
    this.addSql(/* sql */ `
      alter table experience_entity change if exists userId user_id varchar(255) not null;
    `)
    this.addSql(/* sql */ `
      alter table persistent_thread_entity change if exists channelId channel_id varchar(255) not null;
    `)
    this.addSql(/* sql */ `
      alter table persistent_thread_entity change if exists messageId message_id varchar(255) not null;
    `)
    this.addSql(/* sql */ `
      alter table persistent_thread_entity change if exists threadId thread_id varchar(255) not null;
    `)
    this.addSql(/* sql */ `
      alter table persistent_thread_entity change if exists userId user_id varchar(255) not null;
    `)
    this.addSql(/* sql */ `
      alter table redgifs_entity change if exists createdAt created_at varchar(255) not null;
    `)
    this.addSql(/* sql */ `
      alter table reminder_entity change if exists channelId channel_id varchar(255) not null;
    `)
    this.addSql(/* sql */ `
      alter table reminder_entity change if exists messageId message_id varchar(255) not null;
    `)
    this.addSql(/* sql */ `
      alter table reminder_entity change if exists userId user_id varchar(255) not null;
    `)
    this.addSql(/* sql */ `
      alter table reminder_entity change if exists expiresAt expires_at datetime not null;
    `)
    this.addSql(/* sql */ `
      alter table reminder_entity change if exists createdAt created_at varchar(255) not null;
    `)
    this.addSql(/* sql */ `
      alter table roles_entity change if exists userId user_id varchar(255) not null;
    `)
    this.addSql(/* sql */ `
      alter table roles_entity change if exists roleIds role_ids text not null;
    `)
    this.addSql(/* sql */ `
      alter table rs_league_entity change if exists userId user_id varchar(255) not null;
    `)
    this.addSql(/* sql */ `
      alter table stats_entity change if exists channelId channel_id varchar(255) not null;
    `)
    this.addSql(/* sql */ `
      alter table stats_entity change if exists userId user_id varchar(255) not null;
    `)
    this.addSql(/* sql */ `
      alter table video_entity change if exists userId user_id varchar(255) not null;
    `)
    this.addSql(/* sql */ `
      alter table video_entity change if exists userDisplayName user_display_name varchar(255) not null;
    `)
    this.addSql(/* sql */ `
      alter table video_entity change if exists channelId channel_id varchar(255) not null;
    `)
    this.addSql(/* sql */ `
      alter table video_entity change if exists messageId message_id varchar(255) not null;
    `)
    this.addSql(/* sql */ `
      alter table video_entity change if exists videoUrl video_url varchar(255) not null;
    `)
    this.addSql(/* sql */ `
      alter table video_entity change if exists videoId video_id varchar(255) not null;
    `)
    this.addSql(/* sql */ `
      alter table video_entity change if exists deArrowTitle de_arrow_title varchar(255) not null;
    `)
    this.addSql(/* sql */ `
      alter table video_entity change if exists thumbnailUrl thumbnail_url varchar(255) not null;
    `)
    this.addSql(/* sql */ `
      alter table video_entity change if exists authorName author_name varchar(255) not null;
    `)
    this.addSql(/* sql */ `
      alter table video_entity change if exists authorUrl author_url varchar(255) not null;
    `)
    this.addSql(/* sql */ `
      alter table video_entity change if exists createdAt created_at varchar(255) not null;
    `)
  }
}
