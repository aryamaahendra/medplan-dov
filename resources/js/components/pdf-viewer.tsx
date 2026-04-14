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
import { Button } from '@/components/ui/button';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set worker source for react-pdf
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

interface PdfViewerProps {
  fileUrl: string;
  downloadUrl: string;
  fileName: string;
}

export default function PdfViewer({
  fileUrl,
  downloadUrl,
  fileName,
}: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.2);

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

  return (
    <div className="flex w-full flex-col items-center">
      <Document
        file={fileUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={
          <div className="flex flex-col items-center">
            <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-sm text-muted-foreground">Memuat PDF...</p>
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
          <Button variant="ghost" size="icon-sm" asChild title="Download PDF">
            <a href={downloadUrl} download={fileName}>
              <DownloadIcon className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
