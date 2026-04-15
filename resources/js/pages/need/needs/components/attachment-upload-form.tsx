import { useForm } from '@inertiajs/react';
import { Upload } from 'lucide-react';
import { useRef } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import NeedAttachmentController from '@/actions/App/Http/Controllers/Need/NeedAttachmentController';

interface AttachmentUploadFormProps {
  needId: number;
}

export function AttachmentUploadForm({ needId }: AttachmentUploadFormProps) {
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
    post(NeedAttachmentController.store.url({ need: needId }), {
      onSuccess: () => {
        toast.success('Lampiran berhasil diunggah.');
        reset();

        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      },
    });
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
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-2">
                <Label className="text-xs text-muted-foreground">
                  Ubah Nama
                </Label>
                <Input
                  placeholder="Nama tampilan (opsional)"
                  value={data.display_name}
                  onChange={(e) => setData('display_name', e.target.value)}
                />
              </div>

              <div className="rounded-md border bg-muted/50 p-3">
                <p className="truncate text-sm font-medium">
                  {data.display_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {data.extension.toUpperCase()} •{' '}
                  {formatFileSize(data.file_size)}
                </p>
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={processing || !data.file}
          >
            <Upload />
            Unggah Berkas
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
