import { router } from '@inertiajs/react';
import {
  DownloadIcon,
  EyeIcon,
  FileIcon,
  PaperclipIcon,
  Trash2Icon,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import NeedAttachmentController from '@/actions/App/Http/Controllers/Need/NeedAttachmentController';
import { ConfirmDialog } from '@/components/confirm-dialog';

import { FilePreviewDialog } from '@/components/file-preview-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Attachment } from '../columns';

interface AttachmentListProps {
  attachments: Attachment[];
  title?: string;
  description?: string;
  showHeader?: boolean;
  allowDelete?: boolean;
  className?: string;
  showCard?: boolean;
}

export function AttachmentList({
  attachments,
  title = 'Daftar Lampiran',
  description = 'Semua berkas yang telah diunggah untuk usulan ini.',
  showHeader = true,
  allowDelete = true,
  className,
  showCard = true,
}: AttachmentListProps) {
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(
    null,
  );
  const [deletingAttachment, setDeletingAttachment] =
    useState<Attachment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = (attachment: Attachment) => {
    setDeletingAttachment(attachment);
  };

  const handleConfirmDelete = () => {
    if (!deletingAttachment) {
      return;
    }

    setIsDeleting(true);
    router.delete(
      NeedAttachmentController.destroy.url({
        attachment: deletingAttachment.id,
      }),
      {
        onSuccess: () => {
          toast.success('Lampiran berhasil dihapus.');
          setDeletingAttachment(null);
        },
        onFinish: () => {
          setIsDeleting(false);
        },
      },
    );
  };

  const previewableExtensions = [
    'jpg',
    'jpeg',
    'png',
    'gif',
    'webp',
    'bmp',
    'svg',
    'mp4',
    'webm',
    'ogg',
    'pdf',
  ];

  const handlePreview = (attachment: Attachment) => {
    setPreviewAttachment(attachment);
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

  const TableContent = (
    <div className={className}>
      {attachments.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama File</TableHead>
              <TableHead>Ukuran</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead className="w-1"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attachments.map((attachment) => (
              <TableRow key={attachment.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <FileIcon className="h-4 w-4 text-primary" />
                    <span className="font-medium">
                      {attachment.display_name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatFileSize(attachment.file_size)}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="uppercase">
                    {attachment.extension || 'FILE'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {previewableExtensions.includes(
                      attachment.extension?.toLowerCase() || '',
                    ) && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handlePreview(attachment)}
                      >
                        <EyeIcon />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon-sm" asChild>
                      <a
                        href={NeedAttachmentController.download.url({
                          attachment: attachment.id,
                        })}
                        target="_blank"
                      >
                        <DownloadIcon />
                      </a>
                    </Button>
                    {allowDelete && (
                      <Button
                        variant="destructive"
                        size="icon-sm"
                        onClick={() => handleDelete(attachment)}
                      >
                        <Trash2Icon />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <PaperclipIcon className="mb-4 h-12 w-12 text-muted-foreground/20" />
          <p className="font-medium text-muted-foreground">
            Belum ada lampiran.
          </p>
        </div>
      )}
    </div>
  );

  const Content = (
    <>
      {showCard ? (
        <Card className="h-full">
          {showHeader && (
            <CardHeader>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
          )}
          <CardContent className="px-0">
            <div className="border-y">{TableContent}</div>
          </CardContent>
        </Card>
      ) : (
        TableContent
      )}

      {previewAttachment && (
        <FilePreviewDialog
          isOpen={!!previewAttachment}
          onOpenChange={(open) => !open && setPreviewAttachment(null)}
          fileName={previewAttachment.display_name}
          extension={previewAttachment.extension || ''}
          fileUrl={NeedAttachmentController.view.url({
            attachment: previewAttachment.id,
          })}
          downloadUrl={NeedAttachmentController.download.url({
            attachment: previewAttachment.id,
          })}
        />
      )}

      <ConfirmDialog
        open={!!deletingAttachment}
        onOpenChange={(open) => !open && setDeletingAttachment(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Lampiran"
        description={`Apakah Anda yakin ingin menghapus lampiran "${deletingAttachment?.display_name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus Lampiran"
        variant="destructive"
        loading={isDeleting}
      />
    </>
  );

  return Content;
}
