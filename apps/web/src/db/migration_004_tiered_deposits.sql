-- Migration 004: Add tiered deposit fields
-- Adds deposit_charged, deposit_tier, estimated_job_value to leads and jobs tables

ALTER TABLE IF EXISTS leads ADD COLUMN IF NOT EXISTS deposit_charged NUMERIC DEFAULT 49;
ALTER TABLE IF EXISTS leads ADD COLUMN IF NOT EXISTS deposit_tier TEXT DEFAULT '';
ALTER TABLE IF EXISTS leads ADD COLUMN IF NOT EXISTS estimated_job_value NUMERIC DEFAULT 0;

ALTER TABLE IF EXISTS jobs ADD COLUMN IF NOT EXISTS deposit_charged NUMERIC DEFAULT 49;
ALTER TABLE IF EXISTS jobs ADD COLUMN IF NOT EXISTS deposit_tier TEXT DEFAULT '';
ALTER TABLE IF EXISTS jobs ADD COLUMN IF NOT EXISTS estimated_job_value NUMERIC DEFAULT 0;
