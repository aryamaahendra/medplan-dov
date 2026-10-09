import { router } from '@inertiajs/react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import SasaranController from '@/actions/App/Http/Controllers/Renstra/SasaranController';
import TujuanController from '@/actions/App/Http/Controllers/Renstra/TujuanController';
import type { Indicator, Sasaran, Tujuan } from '@/types';

export function useRenstraShow() {
  const [tujuanDialogOpen, setTujuanDialogOpen] = useState(false);
  const [editingTujuan, setEditingTujuan] = useState<Tujuan | null>(null);

  const [indicatorDialogOpen, setIndicatorDialogOpen] = useState(false);
  const [editingIndicator, setEditingIndicator] = useState<Indicator | null>(
    null,
  );
  const [activeTujuanForIndicator, setActiveTujuanForIndicator] =
    useState<Tujuan | null>(null);
  const [activeSasaranForIndicator, setActiveSasaranForIndicator] =
    useState<Sasaran | null>(null);

  const [sasaranDialogOpen, setSasaranDialogOpen] = useState(false);
  const [editingSasaran, setEditingSasaran] = useState<Sasaran | null>(null);
  const [activeTujuanForSasaran, setActiveTujuanForSasaran] =
    useState<Tujuan | null>(null);

  const [deletingSasaran, setDeletingSasaran] = useState<Sasaran | null>(null);
  const [isDeletingSasaran, setIsDeletingSasaran] = useState(false);

  const [deletingTujuan, setDeletingTujuan] = useState<Tujuan | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [view, setView] = useState<'card' | 'table'>('card');

  // Tujuan Handlers
  const onCreateTujuan = useCallback(() => {
    setEditingTujuan(null);
    setTujuanDialogOpen(true);
  }, []);

  const onEditTujuan = useCallback((tujuan: Tujuan) => {
    setEditingTujuan(tujuan);
    setTujuanDialogOpen(true);
  }, []);

  const handleDeleteTujuan = useCallback(() => {
    if (!deletingTujuan) {
      return;
    }

    setIsDeleting(true);
    router.delete(TujuanController.destroy.url({ tujuan: deletingTujuan.id }), {
      onSuccess: () => {
        toast.success('Tujuan berhasil dihapus.');
        setDeletingTujuan(null);
      },
      onFinish: () => setIsDeleting(false),
    });
  }, [deletingTujuan]);

  // Sasaran Handlers
  const onCreateSasaran = useCallback((tujuan: Tujuan) => {
    setActiveTujuanForSasaran(tujuan);
    setEditingSasaran(null);
    setSasaranDialogOpen(true);
  }, []);

  const onEditSasaran = useCallback((sasaran: Sasaran, tujuan: Tujuan) => {
    setActiveTujuanForSasaran(tujuan);
    setEditingSasaran(sasaran);
    setSasaranDialogOpen(true);
  }, []);

  const handleDeleteSasaran = useCallback(() => {
    if (!deletingSasaran) {
      return;
    }

    setIsDeletingSasaran(true);
    router.delete(
      SasaranController.destroy.url({ sasaran: deletingSasaran.id }),
      {
        onSuccess: () => {
          toast.success('Sasaran berhasil dihapus.');
          setDeletingSasaran(null);
        },
        onFinish: () => setIsDeletingSasaran(false),
      },
    );
  }, [deletingSasaran]);

  // Indicator Handlers
  const onCreateIndicator = useCallback((tujuan: Tujuan) => {
    setActiveSasaranForIndicator(null);
    setActiveTujuanForIndicator(tujuan);
    setEditingIndicator(null);
    setIndicatorDialogOpen(true);
  }, []);

  const onEditIndicator = useCallback(
    (indicator: Indicator, tujuan: Tujuan) => {
      setActiveSasaranForIndicator(null);
      setActiveTujuanForIndicator(tujuan);
      setEditingIndicator(indicator);
      setIndicatorDialogOpen(true);
    },
    [],
  );

  const onCreateIndicatorForSasaran = useCallback((sasaran: Sasaran) => {
    setActiveTujuanForIndicator(null);
    setActiveSasaranForIndicator(sasaran);
    setEditingIndicator(null);
    setIndicatorDialogOpen(true);
  }, []);

  const onEditIndicatorForSasaran = useCallback(
    (indicator: Indicator, sasaran: Sasaran) => {
      setActiveTujuanForIndicator(null);
      setActiveSasaranForIndicator(sasaran);
      setEditingIndicator(indicator);
      setIndicatorDialogOpen(true);
    },
    [],
  );

  return {
    view,
    setView,
    tujuanDialogOpen,
    setTujuanDialogOpen,
    editingTujuan,
    onCreateTujuan,
    onEditTujuan,
    handleDeleteTujuan,
    deletingTujuan,
    setDeletingTujuan,
    isDeleting,
    sasaranDialogOpen,
    setSasaranDialogOpen,
    editingSasaran,
    activeTujuanForSasaran,
    onCreateSasaran,
    onEditSasaran,
    handleDeleteSasaran,
    deletingSasaran,
    setDeletingSasaran,
    isDeletingSasaran,
    indicatorDialogOpen,
    setIndicatorDialogOpen,
    editingIndicator,
    activeTujuanForIndicator,
    activeSasaranForIndicator,
    onCreateIndicator,
    onEditIndicator,
    onCreateIndicatorForSasaran,
    onEditIndicatorForSasaran,
  };
}
