import { useEffect, useRef } from 'react';
import type { ChecklistAnswer, ChecklistQuestion, Need } from '@/types';

import { NeedShowBanners } from './need-show-banners';
import { NeedShowStreamHud } from './need-show-stream-hud';
import { NeedAttachmentsSection } from './sections/need-attachments-section';
import { NeedChecklistSection } from './sections/need-checklist-section';
import { NeedDetailKakSection } from './sections/need-detail-kak-section';
import { NeedGeneralSection } from './sections/need-general-section';
import { NeedPlanningSection } from './sections/need-planning-section';
import { NeedStrategicSection } from './sections/need-strategic-section';
import type { useNeedShow } from './use-need-show';
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

  const { sections, setActiveSection } = showState;

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
        setActiveSection(sectionValues[0]);

        return;
      }

      // Check bottom of the document
      const scrollBottom = window.innerHeight + window.scrollY;
      const documentHeight = document.documentElement.scrollHeight;

      if (scrollBottom >= documentHeight - 60) {
        const lastSection = sectionValues[sectionValues.length - 1];
        setActiveSection(lastSection);

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

      if (currentActive) {
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
  }, [sections, setActiveSection]);

  return (
    <div className="flex flex-col gap-12 pt-8 lg:flex-row lg:items-start">
      {/* Continuous Stream of All Sections */}
      <main className="max-w-3xl min-w-0 space-y-12">
        <NeedShowBanners need={need} isOrphaned={showState.isOrphaned} />

        {/* Section 01: Identifikasi Usulan */}
        <NeedShowSection
          id="section-usulan"
          code="SEKSI 01 // IDENTIFIKASI USULAN"
          subtitle=""
        >
          <NeedGeneralSection need={need} />
        </NeedShowSection>

        {/* Section 02: Keselarasan Strategis */}
        <NeedShowSection
          id="section-strategis"
          code="SEKSI 02 // KESELARASAN STRATEGIS"
          subtitle="Renstra, IKK & RLS"
        >
          <NeedStrategicSection
            need={need}
            groupedRenstra={showState.groupedRenstra}
          />
        </NeedShowSection>

        {/* Section 03: Rincian Kegiatan */}
        <NeedShowSection
          id="section-perencanaan"
          code="SEKSI 03 // RINCIAN KEGIATAN"
          subtitle="Versi Perencanaan & Anggaran"
        >
          <NeedPlanningSection need={need} />
        </NeedShowSection>

        {/* Section 04: KAK */}
        <NeedShowSection
          id="section-detail"
          code="SEKSI 04 // SPESIFIKASI KAK"
          subtitle="Kerangka Acuan Kerja"
        >
          <NeedDetailKakSection
            needId={need.id}
            detail={need.detail}
            attachments={technicalAttachments}
            users={users}
          />
        </NeedShowSection>

        {/* Section 05: Lampiran */}
        <NeedShowSection
          id="section-lampiran"
          code="SEKSI 05 // DOKUMEN LAMPIRAN"
          subtitle="Bukti Dukung Administrasi"
        >
          <NeedAttachmentsSection need={need} />
        </NeedShowSection>

        {/* Section 06: Checklist KAK */}
        <NeedShowSection
          id="section-checklist"
          code="SEKSI 06 // EVALUASI KESIAPAN KAK"
          subtitle="Instrumen Verifikasi"
          isLast
        >
          <NeedChecklistSection
            need={need}
            questions={checklistQuestions.data}
            existingAnswers={checklistAnswers.data}
            isLocked={showState.isLocked}
          />
        </NeedShowSection>
      </main>

      {/* Sticky Mini-Map HUD on Right */}
      <aside className="w-full shrink-0 lg:sticky lg:top-6 lg:z-20 lg:w-56 lg:self-start">
        <NeedShowStreamHud
          sections={showState.sections}
          activeSection={showState.activeSection}
          onScrollToSection={handleScrollToSection}
        />
      </aside>
    </div>
  );
}
interface NeedShowSectionProps {
  id: string;
  code: string;
  subtitle: string;
  children: React.ReactNode;
  isLast?: boolean;
}

function NeedShowSection({
  id,
  code,
  subtitle,
  children,
  isLast = false,
}: NeedShowSectionProps) {
  return (
    <section
      id={id}
      className={
        isLast
          ? 'scroll-mt-24 space-y-4 pb-8'
          : 'scroll-mt-24 space-y-4 border-b border-border/80 pb-12'
      }
    >
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <span className="font-mono text-xs font-medium text-foreground/50 uppercase">
          [ {code} ]
        </span>
        <span className="text-xs text-foreground/50 uppercase">{subtitle}</span>
      </div>
      {children}
    </section>
  );
}
