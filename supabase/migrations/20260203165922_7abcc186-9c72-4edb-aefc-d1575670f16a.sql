-- Create storage bucket for call recordings
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('recordings', 'recordings', false, 104857600, ARRAY['video/webm', 'audio/webm', 'video/mp4', 'audio/mp4'])
ON CONFLICT (id) DO NOTHING;

-- Create table for WebRTC signaling
CREATE TABLE IF NOT EXISTS public.call_signals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  consultation_id UUID NOT NULL REFERENCES public.consultations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('offer', 'answer', 'ice-candidate', 'call-start', 'call-end')),
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for call recordings metadata
CREATE TABLE IF NOT EXISTS public.call_recordings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  consultation_id UUID NOT NULL REFERENCES public.consultations(id) ON DELETE CASCADE,
  recorded_by UUID NOT NULL,
  storage_path TEXT NOT NULL,
  duration_seconds INTEGER,
  file_size_bytes BIGINT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.call_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_recordings ENABLE ROW LEVEL SECURITY;

-- RLS policies for call_signals
CREATE POLICY "Consultation participants can read signals"
  ON public.call_signals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.consultations c
      WHERE c.id = consultation_id
      AND (c.client_id = auth.uid() OR c.lawyer_id = auth.uid())
    )
  );

CREATE POLICY "Consultation participants can insert signals"
  ON public.call_signals FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.consultations c
      WHERE c.id = consultation_id
      AND (c.client_id = auth.uid() OR c.lawyer_id = auth.uid())
    )
  );

-- RLS policies for call_recordings
CREATE POLICY "Consultation participants can view recordings"
  ON public.call_recordings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.consultations c
      WHERE c.id = consultation_id
      AND (c.client_id = auth.uid() OR c.lawyer_id = auth.uid())
    )
  );

CREATE POLICY "Consultation participants can insert recordings"
  ON public.call_recordings FOR INSERT
  WITH CHECK (
    recorded_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.consultations c
      WHERE c.id = consultation_id
      AND (c.client_id = auth.uid() OR c.lawyer_id = auth.uid())
    )
  );

-- Storage policies for recordings bucket
CREATE POLICY "Users can upload their recordings"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'recordings' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their recordings"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'recordings' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their recordings"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'recordings' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Enable realtime for signaling
ALTER PUBLICATION supabase_realtime ADD TABLE public.call_signals;