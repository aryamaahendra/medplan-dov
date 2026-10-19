import { router } from '@inertiajs/react';
import { RiAttachmentLine } from '@remixicon/react';

import NeedAttachmentController from '@/actions/App/Http/Controllers/Need/NeedAttachmentController';
import { Button } from '@/components/ui/button';
import { usePermission } from '@/hooks/use-permission';
import type { Need } from '@/types';

import { AttachmentList } from '../../attachment-list';

interface NeedAttachmentsSectionProps {
  need: Need;
}

export function NeedAttachmentsSection({ need }: NeedAttachmentsSectionProps) {
  const { hasPermission } = usePermission();

  const canManageLampiran =
    (need.can?.update ?? false) &&
    (hasPermission('create need-attachments') ||
      hasPermission('update need-attachments') ||
      hasPermission('delete need-attachments'));

  const supportingAttachments =
    need.attachments?.filter(
      (a) => a.category !== 'technical_specifications',
    ) ?? [];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col gap-3 border-b border-border/60 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="mt-1 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Dokumen Lampiran Pengadaan
          </h3>
          <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
            Berkas bukti dukung administrasi dan kelayakan usulan kebutuhan.
          </p>
        </div>

        {canManageLampiran && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              router.visit(
                NeedAttachmentController.index.url({
                  need: need.id,
                }),
              )
            }
            className="gap-2 text-xs"
          >
            <RiAttachmentLine className="h-4 w-4" />
            <span>Kelola Lampiran</span>
          </Button>
        )}
      </div>

      {/* Attachments List */}
      {supportingAttachments.length > 0 ? (
        <AttachmentList
          attachments={supportingAttachments}
          showHeader={false}
          allowDelete={false}
          showCard={false}
          variant="grid"
        />
      ) : (
        <div className="py-12 text-center text-sm text-muted-foreground italic">
          Belum ada dokumen lampiran pendukung yang diunggah.
        </div>
      )}
    </div>
  );
}
