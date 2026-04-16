import { router } from '@inertiajs/react';
import { PaperclipIcon } from 'lucide-react';

import NeedAttachmentController from '@/actions/App/Http/Controllers/Need/NeedAttachmentController';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import type { Need } from '../columns';
import { AttachmentList } from './attachment-list';

interface NeedAttachmentsTabProps {
  need: Need;
}

export function NeedAttachmentsTab({ need }: NeedAttachmentsTabProps) {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Dokumen Lampiran</CardTitle>
        <CardDescription>
          Dokumen bukti dukung usulan kebutuhan.
        </CardDescription>

        <CardAction>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              router.visit(
                NeedAttachmentController.index.url({
                  need: need.id,
                }),
              )
            }
          >
            <PaperclipIcon />
            Kelola Lampiran
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="px-0">
        <div className="border-y">
          <AttachmentList
            attachments={
              need.attachments?.filter(
                (a) => a.category !== 'technical_specifications',
              ) ?? []
            }
            showHeader={false}
            allowDelete={false}
            showCard={false}
          />
        </div>
      </CardContent>
    </Card>
  );
}
