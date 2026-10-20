import { router } from '@inertiajs/react';
import {
  RiAttachmentLine,
  RiCalendarLine,
  RiCheckLine,
  RiCompass3Line,
  RiFileTextLine,
  RiInformationLine,
} from '@remixicon/react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import NeedController from '@/actions/App/Http/Controllers/Need/NeedController';
import { usePermission } from '@/hooks/use-permission';
import type { ChecklistAnswer, Need, Sasaran, Tujuan } from '@/types';

export interface NeedSection {
  value: string;
  label: string;
  subtitle: string;
  icon: any;
  permission: string;
  count: string;
}

export interface UseNeedShowProps {
  need: Need;
  existingAnswers?: { data: ChecklistAnswer[] };
}

export function useNeedShow({ need, existingAnswers }: UseNeedShowProps) {
  const { hasPermission } = usePermission();
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [lockModalMode, setLockModalMode] = useState<'lock' | 'unlock'>('lock');
  const [isLockDialogOpen, setIsLockDialogOpen] = useState(false);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isLocked = Boolean(need.is_locked);
  const canManageLock =
    hasPermission('lock need') || hasPermission('unlock need');
  const canReviewDirector =
    Boolean(need.can?.approve ?? hasPermission('review need director')) &&
    need.status === 'submitted';
  const canSubmit =
    Boolean(need.can?.submit) &&
    !isLocked &&
    (need.status === 'draft' || need.status === 'revision');

  const handleSubmitNeed = () => {
    setIsSubmitting(true);
    router.post(
      NeedController.submit.url({ need: need.id }),
      {},
      {
        preserveScroll: true,
        onSuccess: () => {
          setIsSubmitDialogOpen(false);
          toast.success(
            need.status === 'revision'
              ? 'Usulan kebutuhan berhasil diajukan kembali.'
              : 'Usulan kebutuhan berhasil diajukan.',
          );
        },
        onError: (errs) => {
          const message =
            errs.status ||
            Object.values(errs)[0] ||
            'Gagal mengajukan usulan kebutuhan.';
          toast.error(message);
        },
        onFinish: () => {
          setIsSubmitting(false);
        },
      },
    );
  };

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
    const canSeeStrategic =
      hasPermission('view need tab strategic') ||
      hasPermission('view need tab ikk') ||
      hasPermission('view need tab rls');

    const strategicCount =
      (need.sasarans?.length || 0) +
      (need.kpi_indicators?.length || 0) +
      (need.strategic_service_plans?.length || 0);

    const allSections = [
      {
        value: 'usulan',
        label: 'Data Usulan',
        subtitle: 'Informasi pokok, volume & pagu',
        icon: RiInformationLine,
        permission: 'view need tab general',
        count: `${Number(need.volume).toLocaleString('id-ID', { maximumFractionDigits: 4 })} ${need.unit}`,
      },
      canSeeStrategic
        ? {
            value: 'strategis',
            label: 'Renstra, IKK & RLS',
            subtitle: 'Keselarasan rencana strategis, IKK & layanan',
            icon: RiCompass3Line,
            permission: '',
            count: `${strategicCount} item`,
          }
        : null,
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
    ].filter((s): s is NonNullable<typeof s> => Boolean(s));

    return allSections.filter(
      (s) => !s.permission || hasPermission(s.permission),
    );
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
    canSubmit,
    isReviewDialogOpen,
    setIsReviewDialogOpen,
    isLockDialogOpen,
    setIsLockDialogOpen,
    isSubmitDialogOpen,
    setIsSubmitDialogOpen,
    isSubmitting,
    handleSubmitNeed,
    lockModalMode,
    setLockModalMode,
    isOrphaned,
  };
}
