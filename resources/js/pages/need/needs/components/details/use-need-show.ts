import {
  RiAttachmentLine,
  RiBarChartLine,
  RiBriefcaseLine,
  RiCalendarLine,
  RiCheckLine,
  RiCompass3Line,
  RiFileTextLine,
  RiFireLine,
  RiInformationLine,
} from '@remixicon/react';
import { useMemo, useState } from 'react';

import { usePermission } from '@/hooks/use-permission';
import type { ChecklistAnswer, Need, Sasaran, Tujuan } from '@/types';

export interface UseNeedShowProps {
  need: Need;
  existingAnswers?: { data: ChecklistAnswer[] };
}

export function useNeedShow({ need, existingAnswers }: UseNeedShowProps) {
  const { hasPermission } = usePermission();
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [lockModalMode, setLockModalMode] = useState<'lock' | 'unlock'>('lock');
  const [isLockDialogOpen, setIsLockDialogOpen] = useState(false);

  const isLocked = Boolean(need.is_locked);
  const canManageLock =
    hasPermission('lock need') || hasPermission('unlock need');
  const canReviewDirector =
    hasPermission('review need director') && need.status === 'approved';
  const checklistAnswers = useMemo(
    () => existingAnswers?.data ?? [],
    [existingAnswers?.data],
  );

  const groupedRenstra = useMemo(() => {
    if (!need.sasarans) {
      return [];
    }

    const map = new Map<number, Tujuan & { sasarans: Sasaran[] }>();

    need.sasarans.forEach((sasaran) => {
      const tujuan = sasaran.tujuan;

      if (!tujuan) {
        return;
      }

      if (!map.has(tujuan.id)) {
        map.set(tujuan.id, { ...tujuan, sasarans: [] });
      }

      const indicators =
        need.indicators?.filter((i) => i.sasaran_id === sasaran.id) ?? [];

      map.get(tujuan.id)?.sasarans.push({
        ...sasaran,
        indicators,
      });
    });

    return Array.from(map.values());
  }, [need]);

  const sections = useMemo(() => {
    return [
      {
        value: 'usulan',
        label: 'Data Usulan',
        subtitle: 'Informasi pokok, volume & pagu',
        icon: RiInformationLine,
        permission: 'view need tab general',
        count: `${need.volume} ${need.unit}`,
      },
      {
        value: 'urgency',
        label: 'Urgensi & Status',
        subtitle: 'Tingkat urgensi & prioritas',
        icon: RiFireLine,
        permission: 'view need tab urgency',
        count: need.urgency,
      },
      {
        value: 'renstra',
        label: 'Renstra',
        subtitle: 'Tujuan & sasaran strategis',
        icon: RiCompass3Line,
        permission: 'view need tab strategic',
        count: `${need.sasarans?.length || 0} sasaran`,
      },
      {
        value: 'ikk',
        label: 'IKK',
        subtitle: 'Indikator kinerja kunci',
        icon: RiBarChartLine,
        permission: 'view need tab ikk',
        count: `${need.kpi_indicators?.length || 0} indikator`,
      },
      {
        value: 'rls',
        label: 'RLS',
        subtitle: 'Rencana layanan strategis',
        icon: RiBriefcaseLine,
        permission: 'view need tab rls',
        count: `${need.strategic_service_plans?.length || 0} layanan`,
      },
      {
        value: 'perencanaan',
        label: 'Perencanaan',
        subtitle: 'Aktivitas & sub-kegiatan',
        icon: RiCalendarLine,
        permission: 'view need tab planning',
        count: `${need.planning_activity_versions?.length || 0} aktivitas`,
      },
      {
        value: 'detail',
        label: 'Detail KAK',
        subtitle: 'Kerangka acuan kerja lengkap',
        icon: RiFileTextLine,
        permission: 'view need tab detail',
        count: need.detail ? 'Tersedia' : 'Kosong',
      },
      {
        value: 'lampiran',
        label: 'Lampiran',
        subtitle: 'Berkas bukti dukung',
        icon: RiAttachmentLine,
        permission: 'view need tab lampiran',
        count: `${need.attachments?.length || 0} berkas`,
      },
      {
        value: 'checklist',
        label: 'Evaluasi KAK',
        subtitle: 'Kelayakan & kelengkapan',
        icon: RiCheckLine,
        permission: 'view need tab checklist',
        count: `${checklistAnswers.length} terjawab`,
      },
    ].filter((s) => hasPermission(s.permission));
  }, [need, checklistAnswers, hasPermission]);

  const [activeSection, setActiveSection] = useState<string>(
    sections[0]?.value ?? 'usulan',
  );

  const currentIndex = sections.findIndex((s) => s.value === activeSection);
  const currentSectionData = sections[currentIndex] || sections[0];

  const goPrev = () => {
    if (currentIndex > 0) {
      setActiveSection(sections[currentIndex - 1].value);
    }
  };

  const goNext = () => {
    if (currentIndex < sections.length - 1) {
      setActiveSection(sections[currentIndex + 1].value);
    }
  };

  const isOrphaned = Boolean(
    need.organizational_unit_id && !need.organizational_unit,
  );

  return {
    sections,
    activeSection,
    setActiveSection,
    currentIndex,
    currentSectionData,
    goPrev,
    goNext,
    groupedRenstra,
    checklistAnswers,
    isLocked,
    canManageLock,
    canReviewDirector,
    isReviewDialogOpen,
    setIsReviewDialogOpen,
    isLockDialogOpen,
    setIsLockDialogOpen,
    lockModalMode,
    setLockModalMode,
    isOrphaned,
  };
}
