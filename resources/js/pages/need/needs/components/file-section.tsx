import { FileIcon, PaperclipIcon, Trash2Icon, XIcon } from 'lucide-react';
import React, { useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { Attachment } from '../columns';

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles([...files, ...newFiles]);
      setFileNames([...fileNames, ...newFiles.map((f) => f.name)]);
    }

    // Reset input so the same file can be picked again if removed
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
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama File</TableHead>
                <TableHead className="w-[150px]">Ukuran</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Existing Attachments */}
              {existingAttachments.map((att) => (
                <TableRow
                  key={att.id}
                  className={cn(
                    deletedAttachmentIds.includes(att.id) &&
                      'bg-muted/50 line-through opacity-50',
                  )}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileIcon className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">{att.display_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatFileSize(att.file_size)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {att.extension || 'FILE'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => toggleExistingDeletion(att.id)}
                    >
                      {deletedAttachmentIds.includes(att.id) ? (
                        <XIcon className="h-4 w-4" />
                      ) : (
                        <Trash2Icon className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {/* New Files */}
              {files.map((file, index) => (
                <TableRow key={index} className="bg-blue-50/10">
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <FileIcon className="h-4 w-4 text-primary" />
                        <Input
                          value={fileNames[index]}
                          onChange={(e) =>
                            handleNameChange(index, e.target.value)
                          }
                          className="h-8 py-0 focus-visible:ring-1"
                          placeholder="Beri nama file..."
                        />
                      </div>
                      {errors?.[`attachments.${index}`] && (
                        <p className="text-[0.8rem] font-medium text-destructive">
                          {errors[`attachments.${index}`]}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatFileSize(file.size)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {file.name.split('.').pop()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => removeNewFile(index)}
                    >
                      <Trash2Icon className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
