import { Head, router } from '@inertiajs/react';
import { DownloadIcon, FileIcon, PaperclipIcon } from 'lucide-react';
import { useMemo } from 'react';
import NeedAttachmentController from '@/actions/App/Http/Controllers/Need/NeedAttachmentController';
import { ChecklistForm } from '@/components/needs/checklist-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import needRoutes from '@/routes/needs';
import type { ChecklistQuestion, ChecklistAnswer } from '@/types';

import type { Need, Sasaran, Tujuan } from './columns';
import { IkkAlignmentShow } from './components/ikk-alignment-show';
import { NeedDetailView } from './components/need-detail-view';
import { NeedGeneralInfo } from './components/need-general-info';
import { NeedHeader } from './components/need-header';
import { NeedSidebar } from './components/need-sidebar';
import { RlsAlignmentShow } from './components/rls-alignment-show';
import { StrategicAlignmentSection } from './components/strategic-alignment-section';

interface NeedShowProps {
  need: Need;
  checklistQuestions: { data: ChecklistQuestion[] };
  existingAnswers: { data: ChecklistAnswer[] };
}

export default function NeedShow({
  need,
  checklistQuestions,
  existingAnswers,
}: NeedShowProps) {
  const groupedRenstra = useMemo(() => {
    if (!need.sasarans) {
      return [];
    }

    const tujuanMap = new Map<number, Tujuan & { sasarans: Sasaran[] }>();

    need.sasarans.forEach((sasaran) => {
      const tujuan = sasaran.tujuan;

      if (!tujuan) {
        return;
      }

      if (!tujuanMap.has(tujuan.id)) {
        tujuanMap.set(tujuan.id, { ...tujuan, sasarans: [] });
      }

      const indicators =
        need.indicators?.filter((i) => i.sasaran_id === sasaran.id) ?? [];

      tujuanMap.get(tujuan.id)?.sasarans.push({
        ...sasaran,
        indicators,
      });
    });

    return Array.from(tujuanMap.values());
  }, [need]);

  return (
    <>
      <Head title={`Detail Usulan: ${need.title}`} />

      <div className="flex flex-col gap-4 p-4 md:p-8">
        <NeedHeader need={need} />

        <div className="grid grid-cols-1 items-start gap-4 pt-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="general">
              <TabsList>
                <TabsTrigger value="general">Informasi Umum</TabsTrigger>
                <TabsTrigger value="strategic">Renstra</TabsTrigger>
                <TabsTrigger value="ikk">IKK</TabsTrigger>
                <TabsTrigger value="rls">RLS</TabsTrigger>
                <TabsTrigger value="detail">Detail KAK</TabsTrigger>
                <TabsTrigger value="lampiran">Lampiran</TabsTrigger>
                <TabsTrigger value="checklist">Checklist</TabsTrigger>
              </TabsList>
              <TabsContent value="general" className="mt-0">
                <div className="mt-4">
                  <div className="mb-6 space-y-1">
                    <h2 className="text-xl font-semibold">Informasi Umum</h2>
                    <p className="text-sm text-muted-foreground">
                      Informasi umum mengenai usulan kebutuhan.
                    </p>
                  </div>

                  <NeedGeneralInfo need={need} />
                </div>
              </TabsContent>
              <TabsContent value="strategic" className="mt-0">
                <StrategicAlignmentSection groupedRenstra={groupedRenstra} />
              </TabsContent>
              <TabsContent value="ikk" className="mt-0">
                <IkkAlignmentShow need={need} />
              </TabsContent>
              <TabsContent value="rls" className="mt-0">
                <RlsAlignmentShow need={need} />
              </TabsContent>
              <TabsContent value="checklist" className="mt-0">
                <ChecklistForm
                  key={need.id}
                  needId={need.id}
                  questions={checklistQuestions.data}
                  existingAnswers={existingAnswers.data}
                />
              </TabsContent>
              <TabsContent value="detail" className="mt-0">
                <div className="mt-4 space-y-1">
                  <h2 className="text-xl font-semibold">Detail Proposal</h2>
                  <p className="text-sm text-muted-foreground">
                    Informasi dokumen proposal usulan kebutuhan.
                  </p>
                </div>
                <NeedDetailView detail={need.detail} />
              </TabsContent>
              <TabsContent value="lampiran" className="mt-0">
                <div className="mt-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h2 className="text-xl font-semibold">
                        Dokumen Lampiran
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Dokumen bukti dukung usulan kebutuhan.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        router.visit(
                          NeedAttachmentController.index.url({ need: need.id }),
                        )
                      }
                    >
                      <PaperclipIcon className="mr-2 h-4 w-4" />
                      Kelola Lampiran
                    </Button>
                  </div>

                  {need.attachments && need.attachments.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {need.attachments.map((attachment) => (
                        <Card key={attachment.id} className="overflow-hidden">
                          <CardContent className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                <FileIcon className="h-5 w-5" />
                              </div>
                              <div className="overflow-hidden">
                                <p
                                  className="truncate font-medium"
                                  title={attachment.display_name}
                                >
                                  {attachment.display_name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {attachment.mime_type
                                    .split('/')[1]
                                    .toUpperCase()}{' '}
                                  •{' '}
                                  {(attachment.file_size / 1024 / 1024).toFixed(
                                    2,
                                  )}{' '}
                                  MB
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              asChild
                              className="shrink-0"
                            >
                              <a
                                href={NeedAttachmentController.download.url({
                                  attachment: attachment.id,
                                })}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <DownloadIcon className="h-4 w-4" />
                              </a>
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
                      <PaperclipIcon className="mb-4 h-12 w-12 text-muted-foreground/20" />
                      <h3 className="text-lg font-medium">
                        Belum Ada Lampiran
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Tidak ada dokumen bukti dukung yang dilampirkan untuk
                        usulan ini.
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="sticky top-4">
            <NeedSidebar need={need} />
          </div>
        </div>
      </div>
    </>
  );
}

NeedShow.layout = {
  breadcrumbs: [
    {
      title: 'Usulan Kebutuhan',
      href: needRoutes.index.url(),
    },
    {
      title: 'Detail Usulan',
      href: '#',
    },
  ],
};
