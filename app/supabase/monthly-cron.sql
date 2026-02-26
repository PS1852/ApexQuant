-- =========================================================
-- MONTHLY 2000 RUPEES CRON JOB
-- =========================================================

-- Step 1: Enable the pg_cron extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Step 2: Clear an existing schedule if you are re-running this script
SELECT cron.unschedule('monthly-2000-rupees-allowance');

-- Step 3: Schedule the job to run at 00:00 on the 1st of EVERY month
-- The cron format is: Minute Hour Day Month DayOfWeek
-- '0 0 1 * *' means exactly 12:00 AM on the 1st day of the month.
SELECT cron.schedule(
  'monthly-2000-rupees-allowance',
  '0 0 1 * *', 
  $$
    -- The actual query to run: Add 2000.00 to every existing profile
    UPDATE public.profiles 
    SET balance = balance + 2000.00,
        updated_at = NOW();
  $$
);

-- =========================================================
-- MANUAL TRIGGER (Optional)
-- Run this line manually if you want to test giving everyone 2000 right now
-- UPDATE public.profiles SET balance = balance + 2000.00, updated_at = NOW();
-- =========================================================
