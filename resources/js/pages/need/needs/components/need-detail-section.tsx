import { useRef, useState, useEffect, useCallback } from 'react';
import type { MutableRefObject } from 'react';
import { SelectField } from '@/components/form';

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
    label: '1. Latar Belakang',
    description:
      'Uraikan konteks, dasar hukum, serta alasan diperlukannya pengadaan barang/jasa ini.',
  },
  {
    key: 'purpose_and_objectives',
    label: '2. Maksud & Tujuan',
    description:
      'Jelaskan maksud pelaksanaan kegiatan serta target capaian/hasil yang ingin diperoleh.',
  },
  {
    key: 'target_objective',
    label: '3. Target / Sasaran Kegiatan',
    description:
      'Tentukan penerima manfaat, unit, atau target output yang menjadi sasaran langsung kegiatan.',
  },
  {
    key: 'implementation_period',
    label: '6. Periode Pelaksanaan',
    description:
      'Jelaskan jangka waktu, jadwal tahapan, atau durasi yang dibutuhkan untuk penyelesaian.',
  },
  {
    key: 'expert_or_skilled_personnel',
    label: '7. Tenaga Ahli / SDM Terampil',
    description:
      'Uraikan kualifikasi, jumlah personil ahli, atau keahlian khusus tenaga pelaksana yang disyaratkan.',
  },
  {
    key: 'technical_specifications',
    label: '8. Spesifikasi Teknis',
    description:
      'Rincikan standar mutu, volume, rincian teknis barang/jasa, serta unggah dokumen pendukung bila ada.',
  },
  {
    key: 'training',
    label: '9. Pelatihan & Alih Pengetahuan',
    description:
      'Uraikan kebutuhan transfer pengetahuan, bimbingan teknis, atau pelatihan jika dipersyaratkan.',
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
  const [prevInitialValues, setPrevInitialValues] = useState(
    providedInitialValues,
  );
  const [initialValues, setInitialValues] = useState(providedInitialValues);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [kldi, setKldi] = useState(initialValues?.kldi ?? '');
  const [satker, setSatker] = useState(initialValues?.satker_skpd ?? '');
  const [kpaId, setKpaId] = useState(initialValues?.kpa_id?.toString() ?? '');

  if (providedInitialValues !== prevInitialValues) {
    setPrevInitialValues(providedInitialValues);
    setInitialValues(providedInitialValues);
    setKldi(providedInitialValues?.kldi ?? '');
    setSatker(providedInitialValues?.satker_skpd ?? '');
    setKpaId(providedInitialValues?.kpa_id?.toString() ?? '');
  }

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
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">
          Bagian ini memuat instrumen teknis Kerangka Acuan Kerja (KAK) usulan
          kebutuhan pengadaan.
        </p>
      </div>

      <div className="space-y-8">
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
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-foreground">
              4. Organisasi Pengadaan Barang / Jasa
            </h3>
            <p className="text-xs text-muted-foreground">
              Pilih organisasi yang menyelenggarakan dan melaksanakan pengadaan
              barang/jasa.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <SelectField
              id="kldi"
              label="K/L/D/I"
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
              label="Satuan Kerja / SKPD"
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
              label="Kuasa Pengguna Anggaran (KPA)"
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
