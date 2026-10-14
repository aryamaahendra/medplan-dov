import { RiArrowLeftLine, RiArrowRightLine } from '@remixicon/react';

import {
  PriorityBadge,
  ProposalStatusBadge,
  ReadinessBadge,
} from '@/components/badges';
import { ChecklistForm } from '@/components/needs/checklist-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/formatters';
import type {
  ChecklistAnswer,
  ChecklistQuestion,
  Need,
  Sasaran,
  Tujuan,
} from '@/types';

import { IkkAlignmentShow } from '../ikk-alignment-show';
import { NeedAttachmentsTab } from '../need-attachments-tab';
import { NeedDetailView } from '../need-detail-view';
import { NeedGeneralInfo } from '../need-general-info';
import { PlanningAlignmentShow } from '../planning-alignment-show';
import { RlsAlignmentShow } from '../rls-alignment-show';
import { StrategicAlignmentSection } from '../strategic-alignment-section';
import type { NeedNavSection } from './need-show-nav';

interface NeedShowCanvasProps {
  need: Need;
  users: { id: number; name: string; nip: string | null }[];
  activeSection: string;
  currentSection?: NeedNavSection;
  currentIndex: number;
  totalSections: number;
  onPrev: () => void;
  onNext: () => void;
  groupedRenstra: (Tujuan & { sasarans: Sasaran[] })[];
  checklistQuestions: { data: ChecklistQuestion[] };
  checklistAnswers: ChecklistAnswer[];
  isLocked: boolean;
}

export function NeedShowCanvas({
  need,
  users,
  activeSection,
  currentSection,
  currentIndex,
  totalSections,
  onPrev,
  onNext,
  groupedRenstra,
  checklistQuestions,
  checklistAnswers,
  isLocked,
}: NeedShowCanvasProps) {
  const Icon = currentSection?.icon;

  return (
    <div className="space-y-6">
      {/* Canvas Header without Card wrapper */}
      <div className="flex flex-col gap-3 border-b border-border/60 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {Icon && <Icon className="h-5 w-5" />}
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">
              {currentSection?.label}
            </h2>
            <p className="text-xs text-muted-foreground">
              {currentSection?.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onPrev}
            disabled={currentIndex === 0}
            className="gap-1 text-xs"
          >
            <RiArrowLeftLine className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sebelumnya</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onNext}
            disabled={currentIndex === totalSections - 1}
            className="gap-1 text-xs"
          >
            <span className="hidden sm:inline">Selanjutnya</span>
            <RiArrowRightLine className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Canvas Content */}
      <div>
        {/* Section 1: Data Usulan */}
        {activeSection === 'usulan' && (
          <div className="space-y-6">
            <NeedGeneralInfo need={need} />
          </div>
        )}

        {/* Section 2: Urgensi & Status */}
        {activeSection === 'urgency' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Card className="border-border/60">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Klasifikasi Kebutuhan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Tingkat Urgensi
                    </span>
                    <span className="text-xs font-medium text-foreground capitalize">
                      {need.urgency}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Dampak Pelayanan
                    </span>
                    <span className="text-xs font-medium text-foreground capitalize">
                      {need.impact}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Status Prioritas
                    </span>
                    <PriorityBadge isPriority={need.is_priority} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Jenis Kebutuhan
                    </span>
                    <span className="text-xs font-medium text-foreground">
                      {need.need_type?.name || 'Umum'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/60">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Status Pengusulan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Status Dokumen
                    </span>
                    <ProposalStatusBadge status={need.status} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Kesiapan Dokumen
                    </span>
                    <ReadinessBadge
                      percentage={need.checklist_percentage ?? 0}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Tanggal Usulan
                    </span>
                    <span className="text-xs text-foreground">
                      {need.created_at ? formatDate(need.created_at) : '-'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Section 3: Renstra */}
        {activeSection === 'renstra' && (
          <div className="space-y-4">
            <StrategicAlignmentSection groupedRenstra={groupedRenstra} />
          </div>
        )}

        {/* Section 4: IKK */}
        {activeSection === 'ikk' && (
          <div className="space-y-4">
            <IkkAlignmentShow need={need} />
          </div>
        )}

        {/* Section 5: RLS */}
        {activeSection === 'rls' && (
          <div className="space-y-4">
            <RlsAlignmentShow need={need} />
          </div>
        )}

        {/* Section 6: Perencanaan */}
        {activeSection === 'perencanaan' && (
          <div className="space-y-4">
            <PlanningAlignmentShow need={need} />
          </div>
        )}

        {/* Section 7: Detail KAK */}
        {activeSection === 'detail' && (
          <div className="space-y-4">
            <NeedDetailView
              needId={need.id}
              detail={need.detail}
              users={users}
              attachments={
                need.attachments?.filter(
                  (a) => a.category === 'technical_specifications',
                ) ?? []
              }
            />
          </div>
        )}

        {/* Section 8: Lampiran */}
        {activeSection === 'lampiran' && (
          <div className="space-y-4">
            <NeedAttachmentsTab need={need} />
          </div>
        )}

        {/* Section 9: Evaluasi & Checklist */}
        {activeSection === 'checklist' && (
          <div className="space-y-4">
            <ChecklistForm
              needId={need.id}
              questions={checklistQuestions.data}
              existingAnswers={checklistAnswers}
              readonly={!need.can?.performChecklist || isLocked}
            />
          </div>
        )}
      </div>
    </div>
  );
}
