import { useRef, useState, useEffect, useCallback } from 'react';
import type { MutableRefObject } from 'react';
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
    key: 'procurement_organization_name',
    label: 'Nama Organisasi Pengadaan',
    placeholder: 'Nama unit/organisasi yang melaksanakan pengadaan...',
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
  totalPrice,
}: NeedDetailSectionProps) {
  const [initialValues] = useState(providedInitialValues);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          fundingSources={fundingSources}
          totalPrice={totalPrice}
          errors={errors}
          onChange={handleChange}
          initialFundingSourceId={initialValues?.funding_source_id}
        />

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
