-- Create storage policies for uploads bucket
CREATE POLICY "Allow public read access to uploads" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'uploads');

CREATE POLICY "Allow authenticated users to upload files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'uploads');

CREATE POLICY "Allow authenticated users to update their files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'uploads');

CREATE POLICY "Allow authenticated users to delete their files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'uploads');