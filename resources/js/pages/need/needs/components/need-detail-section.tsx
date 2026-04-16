import { UploadCloud } from 'lucide-react';
import { useRef, useState } from 'react';
import type { MutableRefObject } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Editor } from '@/components/ui/editor';
import { Label } from '@/components/ui/label';
import type { Attachment } from '../columns';
import { AttachmentCard } from './attachment-card';
import { NewAttachmentItem } from './new-attachment-item';

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
}

interface DetailField {
  key: string;
  label: string;
  placeholder: string;
}

const DETAIL_FIELDS: DetailField[] = [
  {
    key: 'background',
    label: 'Latar Belakang',
    placeholder: 'Uraikan latar belakang pengajuan usulan...',
  },
  {
    key: 'purpose_and_objectives',
    label: 'Tujuan dan Sasaran',
    placeholder: 'Jelaskan tujuan dan sasaran yang ingin dicapai...',
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
    key: 'funding_source_and_estimated_cost',
    label: 'Sumber Dana & Estimasi Biaya',
    placeholder: 'Sebutkan sumber pendanaan dan perkiraan biaya...',
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
];

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
}: NeedDetailSectionProps) {
  const [initialValues] = useState(providedInitialValues);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const previewableExtensions = [
    'jpg',
    'jpeg',
    'png',
    'gif',
    'webp',
    'bmp',
    'svg',
    'pdf',
  ];

  const handleChange = (key: string, value: string) => {
    detailValuesRef.current = {
      ...detailValuesRef.current,
      [key]: value,
    };
  };

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
    const nextFiles = [...technicalSpecificationAttachments];
    const nextNames = [...technicalSpecificationAttachmentNames];
    nextFiles.splice(index, 1);
    nextNames.splice(index, 1);
    setTechnicalSpecificationAttachments(nextFiles);
    setTechnicalSpecificationAttachmentNames(nextNames);
  };

  const handleNameChange = (index: number, name: string) => {
    const nextNames = [...technicalSpecificationAttachmentNames];
    nextNames[index] = name;
    setTechnicalSpecificationAttachmentNames(nextNames);
  };

  const toggleExistingDeletion = (id: number) => {
    if (deletedAttachmentIds.includes(id)) {
      setDeletedAttachmentIds(deletedAttachmentIds.filter((d) => d !== id));
    } else {
      setDeletedAttachmentIds([...deletedAttachmentIds, id]);
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
    <div className="space-y-5 py-6">
      <div className="mb-4 space-y-1">
        <p className="text-sm text-muted-foreground">
          Bagian ini berisi informasi dokumen proposal untuk usulan kebutuhan.
          Semua bidang bersifat opsional.
        </p>
      </div>

      <div className="-mx-4 space-y-6">
        {DETAIL_FIELDS.map(({ key, label, placeholder }) => (
          <div key={key} className="space-y-1.5">
            <div className="flex items-center justify-between border-t bg-muted/40 px-4 py-3">
              <Label className="mb-0">{label}</Label>
              {key === 'technical_specifications' && (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <UploadCloud />
                    Unggah Dokumen
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    multiple
                    onChange={handleFileChange}
                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                  />
                </div>
              )}
            </div>

            <Editor
              id={`detail_${key}`}
              placeholder={'Type here ...'}
              value={initialValues?.[key] ?? ''}
              onChange={(value) => handleChange(key, value)}
              className="mb-0 bg-muted/10"
            />
            <InputError message={errors[`detail.${key}`]} />

            {key === 'technical_specifications' &&
              (technicalSpecificationAttachments.length > 0 ||
                existingTechnicalSpecificationAttachments.length > 0) && (
                <div className="mb-0 grid grid-cols-1 gap-2 border-b p-2 md:grid-cols-2">
                  {existingTechnicalSpecificationAttachments.map((att) => (
                    <AttachmentCard
                      key={att.id}
                      attachment={att}
                      formatFileSize={formatFileSize}
                      previewableExtensions={previewableExtensions}
                      isDeleted={deletedAttachmentIds.includes(att.id)}
                      onToggleDelete={toggleExistingDeletion}
                    />
                  ))}

                  {technicalSpecificationAttachments.map((file, index) => (
                    <NewAttachmentItem
                      key={index}
                      file={file}
                      index={index}
                      name={technicalSpecificationAttachmentNames[index]}
                      onNameChange={handleNameChange}
                      onRemove={removeNewFile}
                      formatFileSize={formatFileSize}
                    />
                  ))}
                </div>
              )}

            <Label className="mb-0 border-b bg-muted/40 px-4 py-3 text-xs text-muted-foreground italic">
              *{placeholder}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}
