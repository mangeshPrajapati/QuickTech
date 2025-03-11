import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, File, X, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onFilesChange: (files: File[]) => void;
  files: File[];
  disabled?: boolean;
}

export default function FileUpload({ 
  onFilesChange, 
  files, 
  disabled = false 
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  // Handle drag events
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle file drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  // Handle click on the upload area
  const handleClick = () => {
    inputRef.current?.click();
  };

  // Process files before adding them
  const handleFiles = (newFiles: File[]) => {
    // Validate files
    const validFiles = newFiles.filter(file => {
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds the maximum file size of 5MB.`,
          variant: "destructive",
        });
        return false;
      }
      
      // Check file type
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported file type. Please upload JPEG, PNG, or PDF files.`,
          variant: "destructive",
        });
        return false;
      }
      
      return true;
    });
    
    // Update files
    onFilesChange([...files, ...validFiles]);
  };

  // Remove a file
  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    onFilesChange(newFiles);
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " bytes";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          dragActive ? "border-primary-400 bg-primary-50" : "border-gray-300"
        } ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={disabled ? undefined : handleDrop}
        onClick={disabled ? undefined : handleClick}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled}
          accept=".jpg,.jpeg,.png,.pdf"
        />
        <div className="flex flex-col items-center">
          <Upload className="h-12 w-12 text-gray-400 mb-2" />
          <p className="text-sm font-medium mb-1">
            <span className="text-primary-600">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500">
            JPG, PNG or PDF (max 5MB per file)
          </p>
        </div>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploaded Documents ({files.length})</h4>
          <ul className="border rounded-md divide-y">
            {files.map((file, index) => (
              <li key={index} className="flex items-center justify-between p-3">
                <div className="flex items-center overflow-hidden">
                  <File className="h-5 w-5 text-blue-500 flex-shrink-0 mr-2" />
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Remove file</span>
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="flex items-start text-xs text-gray-500">
        <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0 mt-0.5" />
        <p>
          Make sure all documents are clearly visible and contain all required information.
          Blurry or incomplete documents may delay your application.
        </p>
      </div>
    </div>
  );
}
