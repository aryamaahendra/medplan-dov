import { FileDown } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import needRoutes from '@/routes/needs';

interface User {
  id: number;
  name: string;
  nip: string | null;
}

interface ExportPdfDialogProps {
  needId: number;
  users: User[];
  trigger?: React.ReactNode;
}

const STORAGE_KEY = 'export_pdf_settings';

interface ExportSettings {
  signer_id: string;
  paper_size: string;
  m_top: number;
  m_bottom: number;
  m_left: number;
  m_right: number;
}

const DEFAULT_SETTINGS: ExportSettings = {
  signer_id: '',
  paper_size: 'a4',
  m_top: 20,
  m_bottom: 20,
  m_left: 30,
  m_right: 20,
};

export function ExportPdfDialog({
  needId,
  users,
  trigger,
}: ExportPdfDialogProps) {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<ExportSettings>(() => {
    if (typeof window === 'undefined') {
      return DEFAULT_SETTINGS;
    }

    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch (e) {
        console.error('Failed to parse saved settings', e);
      }
    }

    return DEFAULT_SETTINGS;
  });

  const handleSaveSettings = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  };

  const handleExport = (preview = false) => {
    handleSaveSettings();
    const url = needRoutes.exportPdf.url(
      {
        need: needId,
      },
      {
        query: {
          ...settings,
          preview: preview ? '1' : undefined,
        },
      },
    );

    window.open(url, '_blank');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <FileDown className="mr-1.5 h-4 w-4" />
            Ekspor PDF
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Kustomisasi Ekspor PDF</DialogTitle>
          <DialogDescription>
            Atur parameter dokumen PDF sebelum melakukan ekspor.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2 overflow-hidden">
            <Label htmlFor="signer">Penandatangan</Label>
            <Select
              value={settings.signer_id}
              onValueChange={(v) =>
                setSettings((s) => ({ ...s, signer_id: v }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a signer" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    {user.name} {user.nip ? `(NIP. ${user.nip})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paper_size">Ukuran Kertas</Label>
            <Select
              value={settings.paper_size}
              onValueChange={(v) =>
                setSettings((s) => ({ ...s, paper_size: v }))
              }
            >
              <SelectTrigger id="paper_size" className="w-full">
                <SelectValue placeholder="Pilih ukuran kertas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="a4">A4 (210 x 297 mm)</SelectItem>
                <SelectItem value="f4">F4 / Folio (215 x 330 mm)</SelectItem>
                <SelectItem value="legal">Legal (216 x 356 mm)</SelectItem>
                <SelectItem value="letter">Letter (216 x 279 mm)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="m_top">Margin Atas (mm)</Label>
              <Input
                id="m_top"
                type="number"
                value={settings.m_top}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    m_top: parseInt(e.target.value) || 0,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="m_bottom">Margin Bawah (mm)</Label>
              <Input
                id="m_bottom"
                type="number"
                value={settings.m_bottom}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    m_bottom: parseInt(e.target.value) || 0,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="m_left">Margin Kiri (mm)</Label>
              <Input
                id="m_left"
                type="number"
                value={settings.m_left}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    m_left: parseInt(e.target.value) || 0,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="m_right">Margin Kanan (mm)</Label>
              <Input
                id="m_right"
                type="number"
                value={settings.m_right}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    m_right: parseInt(e.target.value) || 0,
                  }))
                }
              />
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="ghost"
            onClick={() => handleExport(true)}
            className="text-muted-foreground"
          >
            Pratinjau
          </Button>
          <Button onClick={() => handleExport()}>
            <FileDown className="mr-2 h-4 w-4" />
            Ekspor
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
