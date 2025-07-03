import { Migration } from '@mikro-orm/migrations'

export class Migration20250101EmployeeInvite extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table if not exists "employee_invite" ("id" text not null, "email" text not null, "first_name" text not null, "last_name" text not null, "company_id" text not null, "inviter_id" text not null, "token" text not null, "status" text check ("status" in (\'pending\', \'accepted\', \'expired\')) not null default \'pending\', "expires_at" timestamptz not null, "accepted_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "employee_invite_pkey" primary key ("id"));'
    )

    this.addSql(
      'CREATE INDEX IF NOT EXISTS "IDX_employee_invite_company_id" ON "employee_invite" (company_id) WHERE deleted_at IS NULL;'
    )

    this.addSql(
      'CREATE INDEX IF NOT EXISTS "IDX_employee_invite_token" ON "employee_invite" (token) WHERE deleted_at IS NULL;'
    )

    this.addSql(
      'CREATE INDEX IF NOT EXISTS "IDX_employee_invite_email" ON "employee_invite" (email) WHERE deleted_at IS NULL;'
    )

    this.addSql(
      'alter table if exists "employee_invite" add constraint "employee_invite_company_id_foreign" foreign key ("company_id") references "company" ("id") on update cascade;'
    )
  }

  async down(): Promise<void> {
    this.addSql(
      'alter table if exists "employee_invite" drop constraint if exists "employee_invite_company_id_foreign";'
    )

    this.addSql('drop table if exists "employee_invite" cascade;')
  }
}
