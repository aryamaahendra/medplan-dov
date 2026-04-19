import { Head } from '@inertiajs/react';

import needRoutes from '@/routes/needs';
import type { Attachment, Need } from '@/types';
import { AttachmentList } from './components/attachment-list';
import { AttachmentUploadForm } from './components/attachment-upload-form';
import { NeedHeader } from './components/need-header';

interface AttachmentsPageProps {
  need: Need & { attachments: Attachment[] };
}

export default function AttachmentsPage({ need }: AttachmentsPageProps) {
  return (
    <>
      <Head title={`Manajemen Lampiran: ${need.title}`} />

      <div className="flex flex-col gap-4 p-4 md:p-8">
        <NeedHeader need={need} />

        <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <AttachmentList attachments={need.attachments} />
          </div>

          <div>
            <AttachmentUploadForm needId={need.id} />
          </div>
        </div>
      </div>
    </>
  );
}

AttachmentsPage.layout = {
  breadcrumbs: [
    {
      title: 'Usulan Kebutuhan',
      href: needRoutes.index.url(),
    },
    {
      title: 'Detail Usulan',
      href: '#', // TODO: Add actual link back
    },
    {
      title: 'Manajemen Lampiran',
      href: '#',
    },
  ],
};
