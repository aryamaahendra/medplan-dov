import { router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

import PlanningActivityVersionController from '@/actions/App/Http/Controllers/PlanningActivityVersionController';
import { Input } from '@/components/ui/input';
import type {
  PlanningActivityVersion,
  PlanningActivityYear,
} from '@/types/planning-version';

interface YearlyDataCellProps {
  activity: PlanningActivityVersion;
  year: number;
  field: 'target' | 'budget';
  activities: PlanningActivityVersion[];
}

export function YearlyDataCell({
  activity,
  year,
  field,
  activities,
}: YearlyDataCellProps) {
  const yearlyData = activity.activity_years?.find((y) => y.year === year);
  const initialValue = yearlyData
    ? yearlyData[field]
    : field === 'budget'
      ? '0'
      : '';

  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(initialValue.toString());
  }, [initialValue]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleUpdate = () => {
    if (value === initialValue.toString()) {
      setIsEditing(false);

      return;
    }

    const numericValue =
      field === 'budget'
        ? parseFloat(value.replace(/[^0-9.]/g, '')) || 0
        : value;

    router
      .optimistic(() => ({
        activities: activities.map((a) => {
          if (a.id !== activity.id) {
            return a;
          }

          const existingYears = a.activity_years ?? [];
          const yearExists = existingYears.some((y) => y.year === year);

          const newYears = yearExists
            ? existingYears.map((y) =>
                y.year === year ? { ...y, [field]: numericValue } : y,
              )
            : [
                ...existingYears,
                {
                  id: 0,
                  planning_activity_version_id: activity.id,
                  year,
                  target: field === 'target' ? value : '',
                  budget: field === 'budget' ? numericValue : 0,
                } as PlanningActivityYear,
              ];

          return { ...a, activity_years: newYears };
        }),
      }))
      .post(
        PlanningActivityVersionController.updateYearlyData.url({
          planning_activity_version: activity.id,
        }),
        {
          year,
          target: field === 'target' ? value : (yearlyData?.target ?? ''),
          budget: field === 'budget' ? numericValue : (yearlyData?.budget ?? 0),
        },
        {
          onSuccess: () => {
            setIsEditing(false);
          },
          onError: (errors) => {
            setIsEditing(false);
            setValue(initialValue.toString());
            const firstError = Object.values(errors)[0];
            toast.error(firstError || 'Gagal memperbarui data');
          },
        },
      );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUpdate();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setValue(initialValue.toString());
    }
  };

  if (activity.type === 'program' || activity.type === 'activity') {
    // Programs and Activities usually don't have targets/budgets in SIPD snapshots,
    // but let's allow it if the data exists, otherwise show empty or total
    // For now, we only allow editing for sub_activity and output as per common practice
    if (activity.type === 'program' || activity.type === 'activity') {
      return null;
    }
  }

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleUpdate}
        onKeyDown={handleKeyDown}
        className="h-8 w-full text-xs"
        type={field === 'budget' ? 'text' : 'text'}
      />
    );
  }

  const displayValue =
    field === 'budget'
      ? new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          maximumFractionDigits: 0,
        }).format(parseFloat(value) || 0)
      : value || '-';

  return (
    <div
      onClick={() => setIsEditing(true)}
      className="min-h-[24px] cursor-pointer rounded p-1 text-xs transition-colors hover:bg-muted/50"
    >
      {displayValue}
    </div>
  );
}
