// src/components/ui/FileUpload.tsx
"use client";

import React, { useState, useRef } from "react";
import { Button } from "./button";
import { Progress } from "./progress";
import { validateFile } from "@/lib/firebase/storage";
import {
  Upload,
  X,
  FileImage,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";

interface FileUploadProps {
  onFileSelected: (file: File) => void;
  onFileRemoved: () => void;
  uploadedUrl?: string;
  isUploading?: boolean;
  uploadProgress?: number;
  disabled?: boolean;
  accept?: string;
  maxSize?: number; // in MB
  placeholder?: string;
  showPreview?: boolean;
  error?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelected,
  onFileRemoved,
  uploadedUrl,
  isUploading = false,
  uploadProgress = 0,
  disabled = false,
  accept = "image/*",
  maxSize = 5,
  placeholder = "Click to upload or drag and drop",
  showPreview = true,
  error,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelection = async (file: File) => {
    setValidationError(null);

    // Validate file
    const validation = await validateFile(file, {
      maxSize: maxSize * 1024 * 1024,
      allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
    });

    if (!validation.valid) {
      setValidationError(validation.error || "Invalid file");
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith("image/") && showPreview) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }

    onFileSelected(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    if (disabled || isUploading) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreview(null);
    setValidationError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onFileRemoved();
  };

  const openFilePicker = () => {
    if (disabled || isUploading) return;
    fileInputRef.current?.click();
  };

  // Show uploaded file if we have a URL and no file is selected
  const showUploadedFile = uploadedUrl && !selectedFile && !isUploading;
  const showSelectedFile = selectedFile && !isUploading;
  const showUploadArea = !showUploadedFile && !showSelectedFile && !isUploading;

  return (
    <div className="space-y-3">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {/* Upload Area */}
      {showUploadArea && (
        <div
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${dragOver ? "border-purple-400 bg-purple-50" : "border-gray-300"}
            ${
              disabled
                ? "opacity-50 cursor-not-allowed"
                : "hover:border-purple-400 hover:bg-gray-50"
            }
          `}
          onClick={openFilePicker}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled && !isUploading) setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
        >
          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-1">{placeholder}</p>
          <p className="text-xs text-gray-500">
            PNG, JPG, WEBP hasta {maxSize}MB
          </p>
        </div>
      )}

      {/* Selected File Preview */}
      {showSelectedFile && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileImage className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            {!disabled && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveFile}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Image Preview */}
          {preview && showPreview && (
            <div className="mt-3">
              <img
                src={preview}
                alt="Preview"
                className="max-w-full h-32 object-cover rounded border"
              />
            </div>
          )}
        </div>
      )}

      {/* Uploaded File Display */}
      {showUploadedFile && (
        <div className="border rounded-lg p-4 bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm font-medium text-green-900">
                  Archivo subido exitosamente
                </p>
                <a
                  href={uploadedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-green-600 hover:underline"
                >
                  Ver archivo →
                </a>
              </div>
            </div>
            {!disabled && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  openFilePicker();
                }}
                className="text-green-600 hover:text-green-700"
              >
                Cambiar
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">
                Subiendo archivo...
              </p>
              <Progress value={uploadProgress} className="mt-2 h-2" />
              <p className="text-xs text-blue-600 mt-1">
                {uploadProgress.toFixed(0)}% completado
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Messages */}
      {(validationError || error) && (
        <div className="flex items-center space-x-2 text-red-600 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{validationError || error}</span>
        </div>
      )}
    </div>
  );
};
