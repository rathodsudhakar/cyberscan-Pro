-- Update the scans table type constraint to include 'advanced' and 'basic'
ALTER TABLE public.scans DROP CONSTRAINT scans_type_check;
ALTER TABLE public.scans ADD CONSTRAINT scans_type_check CHECK (type IN ('passive', 'active', 'authenticated', 'basic', 'advanced'));