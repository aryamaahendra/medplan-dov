import { DownloadIcon, Loader2Icon } from 'lucide-react';
import { lazy, Suspense, useSyncExternalStore } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const PdfViewer = lazy(() => import('./pdf-viewer'));

const emptySubscribe = () => () => {};
const mountedStore = {
  subscribe: emptySubscribe,
  getSnapshot: () => true,
  getServerSnapshot: () => false,
};

interface FilePreviewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  fileName: string;
  fileUrl: string;
  extension: string;
  downloadUrl: string;
}

export function FilePreviewDialog({
  isOpen,
  onOpenChange,
  fileName,
  fileUrl,
  extension,
  downloadUrl,
}: FilePreviewDialogProps) {
  const mounted = useSyncExternalStore(
    mountedStore.subscribe,
    mountedStore.getSnapshot,
    mountedStore.getServerSnapshot,
  );

  const ext = extension.toLowerCase();
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(
    ext,
  );
  const isVideo = ['mp4', 'webm', 'ogg'].includes(ext);
  const isPdf = ext === 'pdf';

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="flex h-[95vh] w-full max-w-[95vw] min-w-[50vw] flex-col overflow-hidden p-0">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 border-b p-4">
          <DialogTitle className="truncate pr-8">{fileName}</DialogTitle>
          <div className="flex items-center gap-2 pr-8">
            {/* Download button removed from here */}
          </div>
        </DialogHeader>

        <div className="flex flex-1 overflow-auto p-4">
          <div className="m-auto flex flex-col items-center">
            {isImage && (
              <img
                src={fileUrl}
                alt={fileName}
                className="max-h-full max-w-full rounded object-contain shadow-lg"
              />
            )}

            {isVideo && (
              <video
                src={fileUrl}
                controls
                className="max-h-full max-w-full rounded shadow-lg"
              >
                Browsermu tidak mendukung tag video.
              </video>
            )}

            {isPdf && mounted && (
              <Suspense
                fallback={
                  <div className="flex flex-col items-center">
                    <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Menyiapkan viewer...
                    </p>
                  </div>
                }
              >
                <PdfViewer
                  fileUrl={fileUrl}
                  downloadUrl={downloadUrl}
                  fileName={fileName}
                />
              </Suspense>
            )}

            {!isImage && !isVideo && !isPdf && (
              <div className="p-12 text-center">
                <p className="mb-4 text-muted-foreground">
                  Preview tidak tersedia untuk tipe file ini.
                </p>
                <Button asChild>
                  <a href={downloadUrl}>Unduh File</a>
                </Button>
              </div>
            )}
          </div>
        </div>

        {!isPdf && (
          <div className="absolute right-6 bottom-6 z-50">
            <Button
              variant="default"
              size="lg"
              className="rounded-full shadow-2xl transition-transform hover:scale-105"
              asChild
            >
              <a href={downloadUrl} download={fileName}>
                <DownloadIcon />
                Download File
              </a>
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
