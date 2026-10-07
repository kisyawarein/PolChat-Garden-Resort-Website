-- ====================================================================
-- POLCHAT GARDEN RESORT - DATABASE MIGRATION
-- Add payment_proof_url column to resort_reservations table
-- ====================================================================

-- 1. Add payment_proof_url column to resort_reservations
ALTER TABLE public.resort_reservations
ADD COLUMN IF NOT EXISTS payment_proof_url text;

-- 2. (Optional) Create Supabase Storage Bucket for Payment Proofs
-- You can also create a public bucket named 'payment-proofs' in Supabase Dashboard -> Storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage access policy for public upload and view
CREATE POLICY IF NOT EXISTS "Allow Public Uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'payment-proofs');

CREATE POLICY IF NOT EXISTS "Allow Public Read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'payment-proofs');
