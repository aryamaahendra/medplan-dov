import { Head, router, useForm } from '@inertiajs/react';
import {
  DownloadIcon,
  FileIcon,
  PaperclipIcon,
  Trash2Icon,
  ArrowLeftIcon,
  PlusIcon,
} from 'lucide-react';
import { useRef } from 'react';
import { toast } from 'sonner';

import NeedAttachmentController from '@/actions/App/Http/Controllers/Need/NeedAttachmentController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import needRoutes from '@/routes/needs';
import type { Attachment, Need } from './columns';
import { NeedHeader } from './components/need-header';

interface AttachmentsPageProps {
  need: Need & { attachments: Attachment[] };
}

export default function AttachmentsPage({ need }: AttachmentsPageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, setData, post, processing, reset, errors } = useForm({
    file: null as File | null,
    display_name: '',
    extension: '',
    file_size: 0,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      const ext = file.name.split('.').pop() || '';
      setData((d) => ({
        ...d,
        file: file,
        display_name: file.name,
        extension: ext,
        file_size: file.size,
      }));
    }
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    post(NeedAttachmentController.store.url({ need: need.id }), {
      onSuccess: () => {
        toast.success('Lampiran berhasil diunggah.');
        reset();

        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      },
    });
  };

  const handleDelete = (attachmentId: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus lampiran ini?')) {
      router.delete(
        NeedAttachmentController.destroy.url({ attachment: attachmentId }),
        {
          onSuccess: () => {
            toast.success('Lampiran berhasil dihapus.');
          },
        },
      );
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
    <>
      <Head title={`Manajemen Lampiran: ${need.title}`} />

      <div className="flex flex-col gap-4 p-4 md:p-8">
        <div className="mb-2 flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.visit(needRoutes.show.url({ need: need.id }))}
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Manajemen Lampiran</h1>
        </div>

        <NeedHeader need={need} />

        <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Daftar Lampiran</CardTitle>
                <CardDescription>
                  Semua berkas yang telah diunggah untuk usulan ini.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {need.attachments.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama File</TableHead>
                        <TableHead>Ukuran</TableHead>
                        <TableHead>Tipe</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {need.attachments.map((attachment) => (
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
                              <Button variant="ghost" size="icon" asChild>
                                <a
                                  href={NeedAttachmentController.download.url({
                                    attachment: attachment.id,
                                  })}
                                  target="_blank"
                                >
                                  <DownloadIcon className="h-4 w-4" />
                                </a>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive"
                                onClick={() => handleDelete(attachment.id)}
                              >
                                <Trash2Icon className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <PaperclipIcon className="mb-4 h-12 w-12 text-muted-foreground/20" />
                    <p className="text-muted-foreground">Belum ada lampiran.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Unggah Lampiran Baru</CardTitle>
                <CardDescription>
                  Pilih berkas untuk ditambahkan ke usulan ini.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpload} className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.zip,.rar"
                    />
                    {errors.file && (
                      <p className="text-sm text-destructive">{errors.file}</p>
                    )}
                  </div>

                  {data.file && (
                    <div className="space-y-2">
                      <div className="rounded-md border bg-muted/50 p-3">
                        <p className="truncate text-sm font-medium">
                          {data.display_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {data.extension.toUpperCase()} •{' '}
                          {formatFileSize(data.file_size)}
                        </p>
                      </div>
                      <Input
                        placeholder="Nama tampilan (opsional)"
                        value={data.display_name}
                        onChange={(e) =>
                          setData('display_name', e.target.value)
                        }
                      />
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={processing || !data.file}
                  >
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Unggah Berkas
                  </Button>
                </form>
              </CardContent>
            </Card>
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
