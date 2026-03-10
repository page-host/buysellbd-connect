
-- Add 'other' to listing_category enum
ALTER TYPE public.listing_category ADD VALUE IF NOT EXISTS 'other';

-- Add custom_category column for "other" category
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS custom_category TEXT;
