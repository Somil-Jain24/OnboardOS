-- ============================================================================
-- Migration: 20260822000001_employee_profile_approval_workflow.sql
-- Description: Adds profile completion and HR review status tracking to employees
-- ============================================================================

-- 1. Alter employees table to add profile completion columns
ALTER TABLE public.employees
  ADD COLUMN IF NOT EXISTS profile_status TEXT NOT NULL DEFAULT 'DRAFT',
  ADD COLUMN IF NOT EXISTS personal_email TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}'::TEXT[],
  ADD COLUMN IF NOT EXISTS joining_notes TEXT,
  ADD COLUMN IF NOT EXISTS hr_review_notes TEXT,
  ADD COLUMN IF NOT EXISTS profile_submitted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS profile_reviewed_at TIMESTAMPTZ;

-- 2. Mark existing active employees as APPROVED
UPDATE public.employees
SET profile_status = 'APPROVED'
WHERE profile_status = 'DRAFT' AND status = 'ACTIVE';

-- 3. Row-Level Security (RLS) policies for Employee Self-Service & HR Review
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "employee_read_own_profile" ON public.employees;
CREATE POLICY "employee_read_own_profile"
ON public.employees
FOR SELECT
TO authenticated
USING (
  auth_user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()::text AND users.role IN ('HR', 'ADMIN')
  )
  OR ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role') IN ('HR', 'ADMIN')
);

DROP POLICY IF EXISTS "employee_update_own_profile" ON public.employees;
CREATE POLICY "employee_update_own_profile"
ON public.employees
FOR UPDATE
TO authenticated
USING (
  auth_user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()::text AND users.role IN ('HR', 'ADMIN')
  )
  OR ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role') IN ('HR', 'ADMIN')
)
WITH CHECK (
  auth_user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()::text AND users.role IN ('HR', 'ADMIN')
  )
  OR ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role') IN ('HR', 'ADMIN')
);
