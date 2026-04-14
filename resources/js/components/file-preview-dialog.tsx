import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
  Loader2Icon,
  SearchIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from 'lucide-react';
import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Set worker source for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

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
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.2);

  const ext = extension.toLowerCase();
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(
    ext,
  );
  const isVideo = ['mp4', 'webm', 'ogg'].includes(ext);
  const isPdf = ext === 'pdf';

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  function changePage(offset: number) {
    setPageNumber((prevPageNumber) => prevPageNumber + offset);
  }

  function handleZoomIn() {
    setScale((prev) => Math.min(prev + 0.2, 3));
  }

  function handleZoomOut() {
    setScale((prev) => Math.max(prev - 0.2, 0.5));
  }

  function handleResetZoom() {
    setScale(1.2);
  }

  const handleClose = () => {
    onOpenChange(false);
    setPageNumber(1);
    setNumPages(null);
    setScale(1.2);
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

            {isPdf && (
              <div className="flex w-full flex-col items-center">
                <Document
                  file={fileUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  loading={
                    <div className="flex flex-col items-center">
                      <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        Memuat PDF...
                      </p>
                    </div>
                  }
                  error={
                    <div className="p-4 text-center text-destructive">
                      Gagal memuat PDF. <br />
                      Silakan unduh file untuk melihat kontennya.
                    </div>
                  }
                >
                  <Page
                    pageNumber={pageNumber}
                    className="overflow-hidden rounded-xl border"
                    renderAnnotationLayer={false}
                    renderTextLayer={false}
                    scale={scale}
                  />
                </Document>

                <div className="sticky bottom-4 z-10 mt-4 flex items-center gap-2 rounded-full border bg-background/80 p-2 shadow-sm backdrop-blur">
                  <div className="mr-2 flex items-center border-r pr-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={pageNumber <= 1}
                      onClick={() => changePage(-1)}
                    >
                      <ChevronLeftIcon className="h-4 w-4" />
                    </Button>
                    <p className="min-w-[100px] text-center text-xs font-medium">
                      Halaman {pageNumber} dari {numPages || '?'}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={pageNumber >= (numPages || 0)}
                      onClick={() => changePage(1)}
                    >
                      <ChevronRightIcon className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={handleZoomOut}
                      title="Zoom Out"
                    >
                      <ZoomOutIcon />
                    </Button>
                    <span className="w-12 text-center text-xs font-medium">
                      {Math.round(scale * 100)}%
                    </span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={handleZoomIn}
                      title="Zoom In"
                    >
                      <ZoomInIcon />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={handleResetZoom}
                      title="Reset Zoom"
                    >
                      <SearchIcon />
                    </Button>
                  </div>

                  <div className="ml-1 flex items-center border-l pl-2">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      asChild
                      title="Download PDF"
                    >
                      <a href={downloadUrl} download={fileName}>
                        <DownloadIcon className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
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
