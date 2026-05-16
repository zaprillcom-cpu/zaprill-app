"use client";

import { AlertCircle } from "lucide-react";
import { useCallback, useState } from "react";
import { FileUpload } from "@/components/ui/file-upload";

interface ResumeUploaderProps {
  onUpload: (file: File) => void;
  disabled?: boolean;
  file?: File | null;
}

export default function ResumeUploader({
  onUpload,
  disabled,
  file,
}: ResumeUploaderProps) {
  const [error, setError] = useState<string | null>(null);

  const ACCEPTED = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ];
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB

  const validateAndSet = useCallback(
    (file: File) => {
      setError(null);
      if (
        !ACCEPTED.includes(file.type) &&
        !file.name.match(/\.(pdf|doc|docx|txt)$/i)
      ) {
        setError("Please upload a PDF, DOC, DOCX, or TXT file");
        return;
      }
      if (file.size > MAX_SIZE) {
        setError("File size exceeds 10MB limit");
        return;
      }
      onUpload(file);
    },
    [onUpload],
  );

  return (
    <div
      className={`w-full ${disabled ? "pointer-events-none opacity-50" : ""}`}
    >
      <FileUpload
        onChange={(files) => {
          if (files && files.length > 0) {
            validateAndSet(files[0]);
          }
        }}
        value={file ? [file] : undefined}
      />
      <div className="mt-2 text-center font-medium text-[10px] text-neutral-500/60 uppercase tracking-widest dark:text-neutral-400/60">
        Supports PDF, DOCX, DOC, TXT (Max 10MB)
      </div>
      {error && (
        <div className="mt-3 flex items-center gap-2 rounded-md border border-destructive/25 bg-destructive/10 p-3 font-medium text-destructive text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
