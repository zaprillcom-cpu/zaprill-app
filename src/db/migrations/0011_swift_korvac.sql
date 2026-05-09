CREATE TABLE "job_title_index" (
	"id" text PRIMARY KEY NOT NULL,
	"normalized_title" text NOT NULL,
	"aliases" text[] DEFAULT '{}',
	"popularity_score" integer DEFAULT 0,
	"search_count" integer DEFAULT 0,
	"source" text DEFAULT 'static',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "job_title_normalized_idx" ON "job_title_index" USING btree ("normalized_title");--> statement-breakpoint
CREATE INDEX "job_title_popularity_idx" ON "job_title_index" USING btree ("popularity_score");