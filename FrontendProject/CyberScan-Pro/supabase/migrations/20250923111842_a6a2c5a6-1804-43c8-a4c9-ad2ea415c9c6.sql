-- Create scheduled_scans table for automated scanning
CREATE TABLE public.scheduled_scans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  target TEXT NOT NULL,
  protocol TEXT NOT NULL DEFAULT 'https',
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly')),
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.scheduled_scans ENABLE ROW LEVEL SECURITY;

-- Create policies for scheduled_scans
CREATE POLICY "Users can view their own scheduled scans" 
ON public.scheduled_scans 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own scheduled scans" 
ON public.scheduled_scans 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scheduled scans" 
ON public.scheduled_scans 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scheduled scans" 
ON public.scheduled_scans 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_scheduled_scans_updated_at
BEFORE UPDATE ON public.scheduled_scans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_scheduled_scans_user_id ON public.scheduled_scans(user_id);
CREATE INDEX idx_scheduled_scans_enabled ON public.scheduled_scans(enabled);