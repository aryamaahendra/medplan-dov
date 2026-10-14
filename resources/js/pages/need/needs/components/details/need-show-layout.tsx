import { useEffect, useRef } from 'react';
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

  const isManualScrollingRef = useRef(false);
  const manualScrollTimeoutRef = useRef<number | null>(null);

  // Allow sticky positioning on window scroll by releasing overflow-x constraint on the layout inset
  // exclusively while this page is mounted, restoring it immediately on unmount.
  useEffect(() => {
    const inset = document.querySelector('[data-slot="sidebar-inset"]');

    if (inset) {
      inset.classList.remove('overflow-x-hidden');

      return () => {
        inset.classList.add('overflow-x-hidden');
      };
    }
  }, []);
  const handleScrollToSection = (sectionValue: string) => {
    showState.setActiveSection(sectionValue);
    isManualScrollingRef.current = true;

    if (manualScrollTimeoutRef.current) {
      window.clearTimeout(manualScrollTimeoutRef.current);
    }

    const target = document.getElementById(`section-${sectionValue}`);

    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    manualScrollTimeoutRef.current = window.setTimeout(() => {
      isManualScrollingRef.current = false;
    }, 800);
  };

  const { sections, activeSection, setActiveSection } = showState;

  // Dynamic active section based on scroll position
  useEffect(() => {
    const sectionValues = sections.map((s) => s.value);

    if (sectionValues.length === 0) {
      return;
    }

    const handleScroll = () => {
      if (isManualScrollingRef.current) {
        return;
      }

      // Check top of the document
      if (window.scrollY < 120) {
        if (activeSection !== sectionValues[0]) {
          setActiveSection(sectionValues[0]);
        }

        return;
      }

      // Check bottom of the document
      const scrollBottom = window.innerHeight + window.scrollY;
      const documentHeight = document.documentElement.scrollHeight;

      if (scrollBottom >= documentHeight - 60) {
        const lastSection = sectionValues[sectionValues.length - 1];

        if (activeSection !== lastSection) {
          setActiveSection(lastSection);
        }

        return;
      }

      // Check middle sections by offset threshold (160px accounts for sticky header/scroll-mt)
      const threshold = 160;
      let currentActive = sectionValues[0];

      for (const val of sectionValues) {
        const el = document.getElementById(`section-${val}`);

        if (!el) {
          continue;
        }

        const rect = el.getBoundingClientRect();

        if (rect.top <= threshold) {
          currentActive = val;
        }
      }

      if (currentActive && currentActive !== activeSection) {
        setActiveSection(currentActive);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);

      if (manualScrollTimeoutRef.current) {
        window.clearTimeout(manualScrollTimeoutRef.current);
      }
    };
  }, [sections, activeSection, setActiveSection]);

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      {/* Continuous Stream of All Sections */}
      <main className="max-w-3xl min-w-0 space-y-12">
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
            variant="table"
          />
        </section>
      </main>

      {/* Sticky Mini-Map HUD on Right */}
      <aside className="w-full shrink-0 lg:sticky lg:top-6 lg:z-20 lg:w-64 lg:self-start">
        <NeedShowStreamHud
          sections={showState.sections}
          activeSection={showState.activeSection}
          onScrollToSection={handleScrollToSection}
        />
      </aside>
    </div>
  );
}
