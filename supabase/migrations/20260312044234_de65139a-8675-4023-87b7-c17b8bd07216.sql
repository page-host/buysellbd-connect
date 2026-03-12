-- Add is_read column to support_messages
ALTER TABLE public.support_messages ADD COLUMN is_read boolean NOT NULL DEFAULT false;

-- Enable RLS on support_messages
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- Users can only see their own support messages
CREATE POLICY "Users can view own support messages"
ON public.support_messages
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role));

-- Users can insert their own support messages
CREATE POLICY "Users can insert own support messages"
ON public.support_messages
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() AND sender_id = auth.uid());

-- Admins can insert support messages (replies)
CREATE POLICY "Admins can insert support replies"
ON public.support_messages
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Users can update own support messages (mark as read)
CREATE POLICY "Users can update own support messages"
ON public.support_messages
FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role));
