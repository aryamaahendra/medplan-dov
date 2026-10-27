import { RiFileDownloadLine } from '@remixicon/react';
import { useState } from 'react';
import { FormGrid, InputField, SelectField } from '@/components/form';
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
      <DialogTrigger
        render={
          trigger ? (
            (trigger as React.ReactElement)
          ) : (
            <Button variant="outline" size="sm">
              <RiFileDownloadLine data-icon="inline-start" />
              Ekspor PDF
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Kustomisasi Ekspor PDF</DialogTitle>
          <DialogDescription>
            Atur parameter dokumen PDF sebelum melakukan ekspor.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <SelectField
            id="signer"
            label="Penandatangan"
            value={settings.signer_id}
            onValueChange={(v) => {
              if (v) {
                setSettings((s) => ({ ...s, signer_id: v }));
              }
            }}
            placeholder="Choose a signer"
            options={users.map((user) => ({
              label:
                `${user.name} ${user.nip ? `(NIP. ${user.nip})` : ''}`.trim(),
              value: user.id.toString(),
            }))}
          />

          <SelectField
            id="paper_size"
            label="Ukuran Kertas"
            value={settings.paper_size}
            onValueChange={(v) => {
              if (v) {
                setSettings((s) => ({ ...s, paper_size: v }));
              }
            }}
            placeholder="Pilih ukuran kertas"
            options={[
              { label: 'A4 (210 x 297 mm)', value: 'a4' },
              { label: 'F4 / Folio (215 x 330 mm)', value: 'f4' },
              { label: 'Legal (216 x 356 mm)', value: 'legal' },
              { label: 'Letter (216 x 279 mm)', value: 'letter' },
            ]}
          />

          <FormGrid cols={2}>
            <InputField
              id="m_top"
              label="Margin Atas (mm)"
              type="number"
              value={settings.m_top}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  m_top: parseInt(e.target.value) || 0,
                }))
              }
            />
            <InputField
              id="m_bottom"
              label="Margin Bawah (mm)"
              type="number"
              value={settings.m_bottom}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  m_bottom: parseInt(e.target.value) || 0,
                }))
              }
            />
            <InputField
              id="m_left"
              label="Margin Kiri (mm)"
              type="number"
              value={settings.m_left}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  m_left: parseInt(e.target.value) || 0,
                }))
              }
            />
            <InputField
              id="m_right"
              label="Margin Kanan (mm)"
              type="number"
              value={settings.m_right}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  m_right: parseInt(e.target.value) || 0,
                }))
              }
            />
          </FormGrid>
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
            <RiFileDownloadLine data-icon="inline-start" />
            Ekspor
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
