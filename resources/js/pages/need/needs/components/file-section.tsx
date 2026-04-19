import {
  DownloadIcon,
  EyeIcon,
  PaperclipIcon,
  Trash2Icon,
  UploadIcon,
  XIcon,
} from 'lucide-react';
import React, { useRef } from 'react';
import NeedAttachmentController from '@/actions/App/Http/Controllers/Need/NeedAttachmentController';
import { ActionDropdown } from '@/components/action-dropdown';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { Attachment } from '@/types';

interface FileSectionProps {
  files: File[];
  fileNames: string[];
  setFiles: (files: File[]) => void;
  setFileNames: (names: string[]) => void;
  existingAttachments?: Attachment[];
  deletedAttachmentIds: number[];
  setDeletedAttachmentIds: (ids: number[]) => void;
  errors?: Record<string, string>;
}

export function FileSection({
  files,
  fileNames,
  setFiles,
  setFileNames,
  existingAttachments = [],
  deletedAttachmentIds,
  setDeletedAttachmentIds,
  errors,
}: FileSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const previewableExtensions = [
    'jpg',
    'jpeg',
    'png',
    'gif',
    'webp',
    'bmp',
    'svg',
    'pdf',
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles([...files, ...newFiles]);
      setFileNames([...fileNames, ...newFiles.map((f) => f.name)]);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeNewFile = (index: number) => {
    const nextFiles = [...files];
    const nextNames = [...fileNames];
    nextFiles.splice(index, 1);
    nextNames.splice(index, 1);
    setFiles(nextFiles);
    setFileNames(nextNames);
  };

  const handleNameChange = (index: number, name: string) => {
    const nextNames = [...fileNames];
    nextNames[index] = name;
    setFileNames(nextNames);
  };

  const toggleExistingDeletion = (id: number) => {
    if (deletedAttachmentIds.includes(id)) {
      setDeletedAttachmentIds(deletedAttachmentIds.filter((d) => d !== id));
    } else {
      setDeletedAttachmentIds([...deletedAttachmentIds, id]);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) {
      return '0 Bytes';
    }

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Bukti Dukung</h3>
          <p className="text-sm text-muted-foreground">
            Unggah dokumen pendukung seperti gambar, proposal, atau spesifikasi
            teknis (Max 10MB per file).
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
        >
          <PaperclipIcon className="mr-2 h-4 w-4" />
          Pilih File
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          multiple
          onChange={handleFileChange}
          accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.zip,.rar"
        />
      </div>

      {(files.length > 0 || existingAttachments.length > 0) && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Existing Attachments */}
          {existingAttachments.map((att) => (
            <div
              key={att.id}
              className={cn(
                'group flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-muted/50',
                deletedAttachmentIds.includes(att.id) &&
                  'bg-muted/50 line-through opacity-50',
              )}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <UploadIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className="truncate text-sm leading-tight font-medium text-foreground">
                  {att.display_name}
                </p>
                <p className="mt-1 text-[10px] leading-none text-muted-foreground uppercase">
                  {att.extension || 'FILE'} • {formatFileSize(att.file_size)}
                </p>
              </div>
              <ActionDropdown
                actions={[
                  ...(previewableExtensions.includes(
                    att.extension?.toLowerCase() || '',
                  )
                    ? [
                        {
                          label: 'Pratinjau',
                          icon: EyeIcon,
                          href: NeedAttachmentController.view.url({
                            attachment: att.id,
                          }),
                        },
                      ]
                    : []),
                  {
                    label: 'Unduh',
                    icon: DownloadIcon,
                    href: NeedAttachmentController.download.url({
                      attachment: att.id,
                    }),
                  },
                  'separator',
                  {
                    label: deletedAttachmentIds.includes(att.id)
                      ? 'Batal Hapus'
                      : 'Hapus',
                    icon: deletedAttachmentIds.includes(att.id)
                      ? XIcon
                      : Trash2Icon,
                    variant: 'destructive',
                    onClick: () => toggleExistingDeletion(att.id),
                  },
                ]}
              />
            </div>
          ))}

          {/* New Files */}
          {files.map((file, index) => (
            <div
              key={index}
              className="group flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <UploadIcon className="h-5 w-5" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex items-center gap-1">
                  <Input
                    value={fileNames[index]}
                    onChange={(e) => handleNameChange(index, e.target.value)}
                    className="h-6 border-none bg-transparent p-0 py-0 text-sm font-medium text-foreground shadow-none focus-visible:ring-0 focus-visible:ring-1"
                  />
                </div>
                <p className="text-[10px] leading-none text-muted-foreground uppercase">
                  {file.name.split('.').pop()} • {formatFileSize(file.size)}
                </p>
                {errors?.[`attachments.${index}`] && (
                  <p className="text-[0.8rem] font-medium text-destructive">
                    {errors[`attachments.${index}`]}
                  </p>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={() => removeNewFile(index)}
              >
                <Trash2Icon className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {files.length === 0 && existingAttachments.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-10 text-center">
          <PaperclipIcon className="mb-2 h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            Belum ada lampiran. Klik "Pilih File" untuk mengunggah.
          </p>
        </div>
      )}
    </div>
  );
}
