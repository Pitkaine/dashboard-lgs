"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImageIcon, Loader2, Upload, X } from "lucide-react";
import { useCallback, useState } from "react";

interface ImageUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImageUploaded: (url: string) => void;
  uploadPath?: string;
}

export default function ImageUpload({
  open,
  onOpenChange,
  onImageUploaded,
  uploadPath = "pages",
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        setError("Seules les images sont acceptées");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError("L'image ne doit pas dépasser 10 Mo");
        return;
      }

      setError("");
      setPreview(URL.createObjectURL(file));
      setUploading(true);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("path", uploadPath);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Erreur lors de l'upload");
        }

        const data = await res.json();
        onImageUploaded(data.url);
        onOpenChange(false);
        setPreview(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erreur lors de l'upload"
        );
      } finally {
        setUploading(false);
      }
    },
    [onImageUploaded, onOpenChange, uploadPath]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const reset = () => {
    setPreview(null);
    setError("");
    setUploading(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="size-5" />
            Ajouter une image
          </DialogTitle>
        </DialogHeader>

        {preview ? (
          <div className="space-y-4">
            <div className="relative rounded-lg overflow-hidden bg-neutral-100">
              <img
                src={preview}
                alt="Prévisualisation"
                className="w-full max-h-64 object-contain"
              />
              {uploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="size-8 text-white animate-spin" />
                </div>
              )}
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            {!uploading && (
              <Button
                type="button"
                variant="outline"
                onClick={reset}
                className="w-full"
              >
                <X className="size-4 mr-2" />
                Changer d&apos;image
              </Button>
            )}
          </div>
        ) : (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
              ${
                isDragging
                  ? "border-amber-500 bg-amber-50"
                  : "border-neutral-300 hover:border-neutral-400"
              }
            `}
            onClick={() =>
              document.getElementById("image-upload-input")?.click()
            }
          >
            <Upload className="size-10 mx-auto text-neutral-400 mb-3" />
            <p className="text-sm font-medium text-neutral-700">
              Glissez une image ici
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              ou cliquez pour sélectionner (max 10 Mo)
            </p>
            <p className="text-xs text-neutral-400 mt-2">
              JPG, PNG, WebP — sera converti en WebP
            </p>
            <input
              id="image-upload-input"
              type="file"
              accept="image/*"
              onChange={handleInputChange}
              className="hidden"
            />
          </div>
        )}

        {error && !preview && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
