import { router } from '@inertiajs/react';
import { PaperclipIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import NeedAttachmentController from '@/actions/App/Http/Controllers/Need/NeedAttachmentController';
import { ConfirmDialog } from '@/components/confirm-dialog';

import { FilePreviewDialog } from '@/components/file-preview-dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Attachment } from '../columns';
import { AttachmentGrid } from './attachment-grid';
import { AttachmentTable } from './attachment-table';

interface AttachmentListProps {
  attachments: Attachment[];
  title?: string;
  description?: string;
  showHeader?: boolean;
  allowDelete?: boolean;
  className?: string;
  showCard?: boolean;
  variant?: 'table' | 'grid';
}

export function AttachmentList({
  attachments,
  title = 'Daftar Lampiran',
  description = 'Semua berkas yang telah diunggah untuk usulan ini.',
  showHeader = true,
  allowDelete = true,
  className,
  showCard = true,
  variant = 'table',
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

  const MainContent = (
    <div className={className}>
      {attachments.length > 0 ? (
        variant === 'table' ? (
          <AttachmentTable
            attachments={attachments}
            allowDelete={allowDelete}
            onPreview={handlePreview}
            onDelete={handleDelete}
            formatFileSize={formatFileSize}
            previewableExtensions={previewableExtensions}
          />
        ) : (
          <AttachmentGrid
            attachments={attachments}
            allowDelete={allowDelete}
            onPreview={handlePreview}
            onDelete={handleDelete}
            formatFileSize={formatFileSize}
            previewableExtensions={previewableExtensions}
          />
        )
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

  return (
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
            <div className="border-y">{MainContent}</div>
          </CardContent>
        </Card>
      ) : (
        MainContent
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
}
