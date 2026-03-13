ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS title_en text;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS message_en text;