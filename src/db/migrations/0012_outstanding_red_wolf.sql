CREATE TYPE "public"."influencer_commission_type" AS ENUM('flat', 'per_user', 'percentage');--> statement-breakpoint
CREATE TYPE "public"."referral_status" AS ENUM('signed_up', 'converted', 'expired', 'fraudulent');--> statement-breakpoint
CREATE TYPE "public"."referral_type" AS ENUM('user', 'influencer');--> statement-breakpoint
CREATE TYPE "public"."resource_type" AS ENUM('course', 'book', 'tutorial', 'documentation', 'practice');--> statement-breakpoint
CREATE TABLE "app_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text DEFAULT '' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_title_aliases" (
	"id" text PRIMARY KEY NOT NULL,
	"job_title_id" text NOT NULL,
	"alias" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_titles" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"popularity_score" integer DEFAULT 0,
	"search_count" integer DEFAULT 0,
	"source" text DEFAULT 'static',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_visit" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"analysis_id" text,
	"job_id" text NOT NULL,
	"title" text NOT NULL,
	"company" text NOT NULL,
	"location" text,
	"url" text NOT NULL,
	"match_percentage" integer,
	"visited_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learning_resources" (
	"id" text PRIMARY KEY NOT NULL,
	"skill" text NOT NULL,
	"type" "resource_type" NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"is_affiliate" boolean DEFAULT false NOT NULL,
	"is_free" boolean DEFAULT false NOT NULL,
	"estimated_time" text,
	"click_count" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referral_rewards" (
	"id" text PRIMARY KEY NOT NULL,
	"referral_id" text NOT NULL,
	"recipient_user_id" text NOT NULL,
	"recipient_role" text NOT NULL,
	"reward_type" text NOT NULL,
	"coupon_id" text,
	"commission_amount" numeric(10, 2),
	"commission_currency" text DEFAULT 'INR',
	"commission_status" text DEFAULT 'pending',
	"commission_paid_at" timestamp,
	"commission_payment_ref" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referrals" (
	"id" text PRIMARY KEY NOT NULL,
	"referrer_user_id" text NOT NULL,
	"referred_user_id" text,
	"referral_code" text NOT NULL,
	"type" "referral_type" DEFAULT 'user' NOT NULL,
	"status" "referral_status" DEFAULT 'signed_up' NOT NULL,
	"referred_email" text,
	"conversion_invoice_id" text,
	"influencer_config" jsonb,
	"converted_at" timestamp,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resource_clicks" (
	"id" text PRIMARY KEY NOT NULL,
	"resource_id" text NOT NULL,
	"user_id" text,
	"ip_address" text,
	"user_agent" text,
	"clicked_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "job_title_index" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "job_title_index" CASCADE;--> statement-breakpoint
ALTER TABLE "coupons" ADD COLUMN "is_public" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "referral_code" text;--> statement-breakpoint
ALTER TABLE "job_title_aliases" ADD CONSTRAINT "job_title_aliases_job_title_id_job_titles_id_fk" FOREIGN KEY ("job_title_id") REFERENCES "public"."job_titles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_visit" ADD CONSTRAINT "job_visit_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_visit" ADD CONSTRAINT "job_visit_analysis_id_resume_analysis_id_fk" FOREIGN KEY ("analysis_id") REFERENCES "public"."resume_analysis"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_rewards" ADD CONSTRAINT "referral_rewards_referral_id_referrals_id_fk" FOREIGN KEY ("referral_id") REFERENCES "public"."referrals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_rewards" ADD CONSTRAINT "referral_rewards_recipient_user_id_user_id_fk" FOREIGN KEY ("recipient_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_rewards" ADD CONSTRAINT "referral_rewards_coupon_id_coupons_id_fk" FOREIGN KEY ("coupon_id") REFERENCES "public"."coupons"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referrer_user_id_user_id_fk" FOREIGN KEY ("referrer_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referred_user_id_user_id_fk" FOREIGN KEY ("referred_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_conversion_invoice_id_invoice_id_fk" FOREIGN KEY ("conversion_invoice_id") REFERENCES "public"."invoice"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_clicks" ADD CONSTRAINT "resource_clicks_resource_id_learning_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."learning_resources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_clicks" ADD CONSTRAINT "resource_clicks_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "job_title_aliases_alias_idx" ON "job_title_aliases" USING btree ("alias");--> statement-breakpoint
CREATE INDEX "job_title_aliases_job_title_id_idx" ON "job_title_aliases" USING btree ("job_title_id");--> statement-breakpoint
CREATE UNIQUE INDEX "job_titles_title_idx" ON "job_titles" USING btree ("title");--> statement-breakpoint
CREATE UNIQUE INDEX "job_titles_slug_idx" ON "job_titles" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "job_titles_popularity_idx" ON "job_titles" USING btree ("popularity_score");--> statement-breakpoint
CREATE INDEX "job_visit_user_id_idx" ON "job_visit" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "learning_resources_skill_idx" ON "learning_resources" USING btree ("skill");--> statement-breakpoint
CREATE INDEX "learning_resources_is_active_idx" ON "learning_resources" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "referral_rewards_referral_id_idx" ON "referral_rewards" USING btree ("referral_id");--> statement-breakpoint
CREATE INDEX "referral_rewards_recipient_user_id_idx" ON "referral_rewards" USING btree ("recipient_user_id");--> statement-breakpoint
CREATE INDEX "referral_rewards_commission_status_idx" ON "referral_rewards" USING btree ("commission_status");--> statement-breakpoint
CREATE INDEX "referrals_referrer_user_id_idx" ON "referrals" USING btree ("referrer_user_id");--> statement-breakpoint
CREATE INDEX "referrals_referred_user_id_idx" ON "referrals" USING btree ("referred_user_id");--> statement-breakpoint
CREATE INDEX "referrals_referral_code_idx" ON "referrals" USING btree ("referral_code");--> statement-breakpoint
CREATE INDEX "referrals_status_idx" ON "referrals" USING btree ("status");--> statement-breakpoint
CREATE INDEX "referrals_type_idx" ON "referrals" USING btree ("type");--> statement-breakpoint
CREATE UNIQUE INDEX "referrals_referred_user_id_unique" ON "referrals" USING btree ("referred_user_id");--> statement-breakpoint
CREATE INDEX "resource_clicks_resource_id_idx" ON "resource_clicks" USING btree ("resource_id");--> statement-breakpoint
CREATE INDEX "resource_clicks_clicked_at_idx" ON "resource_clicks" USING btree ("clicked_at");--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_referral_code_unique" UNIQUE("referral_code");