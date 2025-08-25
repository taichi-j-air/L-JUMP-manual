-- Create storage bucket for uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', true);

-- Create storage policies for uploads
CREATE POLICY "Anyone can view uploaded files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'uploads');

CREATE POLICY "Admin can upload files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'uploads');

CREATE POLICY "Admin can update files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'uploads');

CREATE POLICY "Admin can delete files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'uploads');