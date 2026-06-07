ALTER TABLE "users" ADD COLUMN "case_phase" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "users" ADD COLUMN "case_ref" VARCHAR(20);
CREATE UNIQUE INDEX "users_case_ref_key" ON "users"("case_ref");
