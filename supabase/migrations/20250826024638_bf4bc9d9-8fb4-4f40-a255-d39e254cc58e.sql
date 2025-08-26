-- Create table for site settings (privacy policy, terms of service, etc.)
CREATE TABLE public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for site settings
CREATE POLICY "Admin can manage site settings" 
ON public.site_settings 
FOR ALL 
USING (true);

CREATE POLICY "Anyone can view site settings" 
ON public.site_settings 
FOR SELECT 
USING (true);

-- Add trigger for timestamps
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default values
INSERT INTO public.site_settings (key, value) VALUES
('privacy_policy', '<h1>プライバシーポリシー</h1><p>準備中...</p>'),
('terms_of_service', '<h1>利用規約</h1><p>準備中...</p>');