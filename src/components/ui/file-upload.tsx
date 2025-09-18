import React, { useCallback, useState, useId } from 'react';
import { Upload, X, File as FileIcon } from 'lucide-react'; // Renamed File to FileIcon to avoid conflict
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button'; // Import Button component

interface FileUploadProps {
  onFileSelect: (files: FileList) => void;
  accept?: string;
  multiple?: boolean;
  className?: string;
  children?: React.ReactNode;
  value?: string; // Added value prop for controlled component
  onClear?: () => void; // Added onClear prop
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  accept = "image/*",
  multiple = false,
  className,
  children,
  value, // Destructure value
  onClear // Destructure onClear
}) => {
  const id = useId();
  const [isDragOver, setIsDragOver] = useState(false);
  // selectedFiles is now only for internal temporary display before parent takes over
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]); 

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        onFileSelect(files);
        setSelectedFiles([]); // Clear internal state after passing to parent
      }
    },
    [onFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        onFileSelect(files);
        setSelectedFiles([]); // Clear internal state after passing to parent
        e.target.value = ''; // Clear the input field to allow re-uploading the same file
      }
    },
    [onFileSelect]
  );

  // removeFile is no longer needed as parent manages the value

  return (
    <div className="space-y-2"> {/* Changed space-y-4 to space-y-2 for compactness */}
      {value ? ( // If value is present, show preview and clear button
        <div className="relative w-full h-32 rounded-lg overflow-hidden border border-border flex items-center justify-center">
          <img src={value} alt="Uploaded preview" className="object-cover w-full h-full" />
          {onClear && (
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6 rounded-full"
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering file input click
                onClear();
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      ) : ( // Otherwise, show the upload area
        <div
          className={cn(
            "border-2 border-dashed border-border rounded-lg p-6 text-center transition-colors cursor-pointer hover:border-primary",
            isDragOver && "border-primary bg-primary/5",
            className
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => document.getElementById(id)?.click()}
        >
          <input
            id={id}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleFileInput}
            className="hidden"
          />
          
          {children || (
            <div className="space-y-2">
              <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-sm text-foreground">
                  <span className="font-medium text-primary">クリックしてファイルを選択</span>
                  または ドラッグ＆ドロップ
                </p>
                <p className="text-xs text-muted-foreground">
                  {accept.includes('image') ? 'PNG, JPG, GIF up to 10MB' : 'ファイルを選択してください'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Removed selectedFiles display as parent now manages value */}
    </div>
  );
};