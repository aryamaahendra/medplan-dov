import {
  RiDownloadLine,
  RiEyeLine,
  RiFileLine,
  RiDeleteBinLine,
} from '@remixicon/react';

import NeedAttachmentController from '@/actions/App/Http/Controllers/Need/NeedAttachmentController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import type { Attachment } from '@/types';

export interface AttachmentLayoutProps {
  attachments: Attachment[];
  allowDelete: boolean;
  onPreview: (attachment: Attachment) => void;
  onDelete: (attachment: Attachment) => void;
  formatFileSize: (bytes: number) => string;
  previewableExtensions: string[];
}

export function AttachmentTable({
  attachments,
  allowDelete,
  onPreview,
  onDelete,
  formatFileSize,
  previewableExtensions,
}: AttachmentLayoutProps) {
  return (
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
                <RiFileLine className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{attachment.display_name}</span>
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
                    onClick={() => onPreview(attachment)}
                  >
                    <RiEyeLine />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  render={
                    <a
                      href={NeedAttachmentController.download.url({
                        attachment: attachment.id,
                      })}
                      target="_blank"
                    >
                      <RiDownloadLine />
                    </a>
                  }
                />
                {allowDelete && (
                  <Button
                    variant="destructive"
                    size="icon-sm"
                    onClick={() => onDelete(attachment)}
                  >
                    <RiDeleteBinLine />
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
