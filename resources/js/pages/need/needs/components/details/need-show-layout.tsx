import type { ChecklistAnswer, ChecklistQuestion, Need } from '@/types';

import { NeedShowBanners } from './need-show-banners';
import { NeedShowStreamHud } from './need-show-stream-hud';
import type { useNeedShow } from './use-need-show';
import { NeedAttachmentsVariant } from './variants/need-attachments-variant';
import { NeedChecklistVariant } from './variants/need-checklist-variant';
import { NeedDetailKakVariant } from './variants/need-detail-kak-variant';
import { NeedGeneralVariant } from './variants/need-general-variant';
import { NeedPlanningVariant } from './variants/need-planning-variant';
import { NeedStrategicVariant } from './variants/need-strategic-variant';

interface NeedShowLayoutProps {
  need: Need;
  users: { id: number; name: string; nip: string | null }[];
  showState: ReturnType<typeof useNeedShow>;
  checklistQuestions: { data: ChecklistQuestion[] };
  checklistAnswers: { data: ChecklistAnswer[] };
}

export function NeedShowLayout({
  need,
  users,
  showState,
  checklistQuestions,
  checklistAnswers,
}: NeedShowLayoutProps) {
  const technicalAttachments =
    need.attachments?.filter(
      (a) => a.category === 'technical_specifications',
    ) ?? [];

  const handleScrollToSection = (sectionValue: string) => {
    showState.setActiveSection(sectionValue);
    const target = document.getElementById(`section-${sectionValue}`);

    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      {/* Continuous Stream of All Sections */}
      <main className="min-w-0 flex-1 space-y-12">
        <NeedShowBanners need={need} isOrphaned={showState.isOrphaned} />

        {/* Section 01: Identifikasi Usulan */}
        <section
          id="section-usulan"
          className="scroll-mt-24 space-y-4 border-b border-border/80 pb-12"
        >
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <span className="font-mono text-xs font-bold text-primary uppercase">
              [ SEKSI 01 // IDENTIFIKASI USULAN ]
            </span>
            <span className="text-xs text-muted-foreground">
              Parameter Pokok
            </span>
          </div>
          <NeedGeneralVariant need={need} variant="datasheet" />
        </section>

        {/* Section 02: Keselarasan Strategis */}
        <section
          id="section-strategis"
          className="scroll-mt-24 space-y-4 border-b border-border/80 pb-12"
        >
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <span className="font-mono text-xs font-bold text-primary uppercase">
              [ SEKSI 02 // KESELARASAN STRATEGIS ]
            </span>
            <span className="text-xs text-muted-foreground">
              Renstra, IKK & RLS
            </span>
          </div>
          <NeedStrategicVariant
            need={need}
            groupedRenstra={showState.groupedRenstra}
            variant="datasheet"
          />
        </section>

        {/* Section 03: Rincian Kegiatan */}
        <section
          id="section-perencanaan"
          className="scroll-mt-24 space-y-4 border-b border-border/80 pb-12"
        >
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <span className="font-mono text-xs font-bold text-primary uppercase">
              [ SEKSI 03 // RINCIAN KEGIATAN ]
            </span>
            <span className="text-xs text-muted-foreground">
              Versi Perencanaan & Anggaran
            </span>
          </div>
          <NeedPlanningVariant need={need} variant="datasheet" />
        </section>

        {/* Section 04: KAK */}
        <section
          id="section-detail"
          className="scroll-mt-24 space-y-4 border-b border-border/80 pb-12"
        >
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <span className="font-mono text-xs font-bold text-primary uppercase">
              [ SEKSI 04 // SPESIFIKASI KAK ]
            </span>
            <span className="text-xs text-muted-foreground">
              Kerangka Acuan Kerja
            </span>
          </div>
          <NeedDetailKakVariant
            needId={need.id}
            detail={need.detail}
            attachments={technicalAttachments}
            users={users}
            variant="datasheet"
          />
        </section>

        {/* Section 05: Lampiran */}
        <section
          id="section-lampiran"
          className="scroll-mt-24 space-y-4 border-b border-border/80 pb-12"
        >
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <span className="font-mono text-xs font-bold text-primary uppercase">
              [ SEKSI 05 // DOKUMEN LAMPIRAN ]
            </span>
            <span className="text-xs text-muted-foreground">
              Bukti Dukung Administrasi
            </span>
          </div>
          <NeedAttachmentsVariant need={need} variant="datasheet" />
        </section>

        {/* Section 06: Checklist KAK */}
        <section id="section-checklist" className="scroll-mt-24 space-y-4 pb-8">
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <span className="font-mono text-xs font-bold text-primary uppercase">
              [ SEKSI 06 // EVALUASI KESIAPAN KAK ]
            </span>
            <span className="text-xs text-muted-foreground">
              Instrumen Verifikasi
            </span>
          </div>
          <NeedChecklistVariant
            need={need}
            questions={checklistQuestions.data}
            existingAnswers={checklistAnswers.data}
            isLocked={showState.isLocked}
            variant="datasheet"
          />
        </section>
      </main>

      {/* Floating Mini-Map HUD on Right */}
      <aside className="w-full shrink-0 lg:w-56">
        <NeedShowStreamHud
          sections={showState.sections}
          activeSection={showState.activeSection}
          onScrollToSection={handleScrollToSection}
        />
      </aside>
    </div>
  );
}
