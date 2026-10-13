import { useRef, useState, useEffect, useCallback } from 'react';
import type { MutableRefObject } from 'react';
import { SelectField } from '@/components/form';
import { Label } from '@/components/ui/label';
import { getFormattedCost } from '@/lib/formatters';
import type { Attachment } from '@/types';
import { DetailFieldItem } from './detail-field-item';
import { FundingSection } from './funding-section';
import { TechSpecExtra } from './tech-spec-extra';

interface NeedDetailSectionProps {
  initialValues: any;
  detailValuesRef: MutableRefObject<any>;
  errors: any;
  technicalSpecificationAttachments: File[];
  technicalSpecificationAttachmentNames: string[];
  setTechnicalSpecificationAttachments: (files: File[]) => void;
  setTechnicalSpecificationAttachmentNames: (names: string[]) => void;
  existingTechnicalSpecificationAttachments?: Attachment[];
  deletedAttachmentIds: number[];
  setDeletedAttachmentIds: (ids: number[]) => void;
  fundingSources: { id: number; name: string }[];
  users?: { id: number; name: string; nip: string | null }[];
  kldiOptions?: { name: string; value: string }[];
  satkerOptions?: { name: string; value: string }[];
  totalPrice: string | number;
}

const DETAIL_FIELDS = [
  {
    key: 'background',
    label: 'Latar Belakang',
    placeholder: 'Uraikan latar belakang pengajuan usulan...',
  },
  {
    key: 'purpose_and_objectives',
    label: 'Maksud & Tujuan',
    placeholder: 'Jelaskan maksud & tujuan yang ingin dicapai...',
  },
  {
    key: 'target_objective',
    label: 'Target / Sasaran Kegiatan',
    placeholder: 'Siapa atau apa yang menjadi target kegiatan...',
  },
  {
    key: 'implementation_period',
    label: 'Periode Pelaksanaan',
    placeholder: 'Kapan dan berapa lama kegiatan akan dilaksanakan...',
  },
  {
    key: 'expert_or_skilled_personnel',
    label: 'Tenaga Ahli / SDM Terampil',
    placeholder: 'Uraikan kebutuhan tenaga ahli atau SDM terampil...',
  },
  {
    key: 'technical_specifications',
    label: 'Spesifikasi Teknis',
    placeholder: 'Jelaskan spesifikasi teknis barang/jasa yang dibutuhkan...',
  },
  {
    key: 'training',
    label: 'Pelatihan',
    placeholder: 'Apakah diperlukan pelatihan? Jika ya, uraikan...',
  },
] as const;

export function NeedDetailSection({
  initialValues: providedInitialValues,
  detailValuesRef,
  errors,
  technicalSpecificationAttachments,
  technicalSpecificationAttachmentNames,
  setTechnicalSpecificationAttachments,
  setTechnicalSpecificationAttachmentNames,
  existingTechnicalSpecificationAttachments = [],
  deletedAttachmentIds,
  setDeletedAttachmentIds,
  fundingSources,
  users = [],
  kldiOptions = [],
  satkerOptions = [],
  totalPrice,
}: NeedDetailSectionProps) {
  const [initialValues] = useState(providedInitialValues);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [kldi, setKldi] = useState(initialValues?.kldi ?? '');
  const [satker, setSatker] = useState(initialValues?.satker_skpd ?? '');
  const [kpaId, setKpaId] = useState(initialValues?.kpa_id ?? '');

  const handleChange = useCallback(
    (key: string, value: any) => {
      detailValuesRef.current = {
        ...detailValuesRef.current,
        [key]: value,
      };
    },
    [detailValuesRef],
  );

  useEffect(() => {
    const formatted = getFormattedCost(totalPrice);

    if (formatted) {
      handleChange('estimated_cost', formatted);
    }
  }, [totalPrice, handleChange]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setTechnicalSpecificationAttachments([
        ...technicalSpecificationAttachments,
        ...newFiles,
      ]);
      setTechnicalSpecificationAttachmentNames([
        ...technicalSpecificationAttachmentNames,
        ...newFiles.map((f) => f.name),
      ]);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeNewFile = (index: number) => {
    setTechnicalSpecificationAttachments(
      technicalSpecificationAttachments.filter((_, i) => i !== index),
    );
    setTechnicalSpecificationAttachmentNames(
      technicalSpecificationAttachmentNames.filter((_, i) => i !== index),
    );
  };

  const handleNameChange = (index: number, name: string) => {
    const nextNames = [...technicalSpecificationAttachmentNames];
    nextNames[index] = name;
    setTechnicalSpecificationAttachmentNames(nextNames);
  };

  const toggleExistingDeletion = (id: number) => {
    setDeletedAttachmentIds(
      deletedAttachmentIds.includes(id)
        ? deletedAttachmentIds.filter((d) => d !== id)
        : [...deletedAttachmentIds, id],
    );
  };

  return (
    <div className="space-y-5 py-6">
      <div className="mb-4 space-y-1">
        <p className="text-sm text-muted-foreground">
          Bagian ini berisi informasi dokumen proposal untuk usulan kebutuhan.
          Semua bidang bersifat opsional.
        </p>
      </div>

      <div className="-mx-4 space-y-6">
        <FundingSection
          key="funding-section"
          fundingSources={fundingSources}
          totalPrice={totalPrice}
          errors={errors}
          onChange={handleChange}
          initialFundingSourceIds={initialValues?.funding_source_ids}
        />

        {/* Organization Section */}
        <div key="organization-section" className="space-y-4">
          <div className="border-t bg-muted/40 px-4 py-3">
            <Label className="mb-0">Organisasi Pengadaan Barang</Label>
          </div>

          <div className="space-y-4 px-4">
            <SelectField
              id="kldi"
              label="a. K/L/D/I"
              labelProps={{ className: 'text-xs text-muted-foreground' }}
              value={kldi}
              onValueChange={(val) => {
                setKldi(val);
                handleChange('kldi', val);
              }}
              placeholder="Pilih K/L/D/I"
              options={(kldiOptions || []).map((opt) => ({
                label: opt.name,
                value: opt.value,
              }))}
              error={errors['detail.kldi']}
            />

            <SelectField
              id="satker_skpd"
              label="b. Satker/SKPD"
              labelProps={{ className: 'text-xs text-muted-foreground' }}
              value={satker}
              onValueChange={(val) => {
                setSatker(val);
                handleChange('satker_skpd', val);
              }}
              placeholder="Pilih Satker/SKPD"
              options={(satkerOptions || []).map((opt) => ({
                label: opt.name,
                value: opt.value,
              }))}
              error={errors['detail.satker_skpd']}
            />

            <SelectField
              id="kpa_id"
              label="c. KPA"
              labelProps={{ className: 'text-xs text-muted-foreground' }}
              value={kpaId.toString()}
              onValueChange={(val) => {
                setKpaId(val);
                handleChange('kpa_id', val);
              }}
              placeholder="Pilih KPA"
              options={(users || []).map((u) => ({
                label: `${u.name}${u.nip ? ` (NIP: ${u.nip})` : ''}`,
                value: u.id.toString(),
              }))}
              error={errors['detail.kpa_id']}
            />
          </div>

          <Label className="mb-0 block border-b bg-muted/40 px-4 py-3 text-xs text-muted-foreground italic">
            *Nama organisasi yang menyelanggarakan/melaksanakan pengadaan barang
          </Label>
        </div>

        {DETAIL_FIELDS.map(({ key, ...field }) => (
          <DetailFieldItem
            key={key}
            {...field}
            initialValue={initialValues?.[key] ?? ''}
            error={errors[`detail.${key}`]}
            onChange={(val) => handleChange(key, val)}
          >
            {key === 'technical_specifications' && (
              <TechSpecExtra
                fileInputRef={fileInputRef}
                onFileChange={handleFileChange}
                existingAttachments={existingTechnicalSpecificationAttachments}
                newAttachments={technicalSpecificationAttachments}
                newAttachmentNames={technicalSpecificationAttachmentNames}
                deletedIds={deletedAttachmentIds}
                onToggleDelete={toggleExistingDeletion}
                onRemoveNew={removeNewFile}
                onNameChange={handleNameChange}
              />
            )}
          </DetailFieldItem>
        ))}
      </div>
    </div>
  );
}
