import { router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

import PlanningActivityVersionController from '@/actions/App/Http/Controllers/PlanningActivityVersionController';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type {
  PlanningActivityVersion,
  PlanningActivityYear,
} from '@/types/planning-version';

interface YearlyDataCellProps {
  activityId: number;
  yearableId: number;
  yearableType: 'activity' | 'indicator';
  items: PlanningActivityYear[];
  year: number;
  field: 'target' | 'budget';
  disabled?: boolean;
}

export function YearlyDataCell({
  activityId,
  yearableId,
  yearableType,
  items,
  year,
  field,
  disabled,
}: YearlyDataCellProps) {
  const yearlyData = items.find((y) => y.year === year);
  const initialValue = yearlyData
    ? yearlyData[field]
    : field === 'budget'
      ? '0'
      : '';

  const [isEditing, setIsEditing] = useState(false);
  const formatBudget = (val: string | number | null) => {
    if (!val || val === '0' || val === 0) {
      return 'Rp 0';
    }

    let numeric: number;

    if (typeof val === 'number') {
      numeric = Math.round(val);
    } else {
      const cleanValue = val.toString().trim();

      if (/[.,]\d{2}$/.test(cleanValue)) {
        const withoutDecimal = cleanValue.slice(0, -3);
        numeric = parseInt(withoutDecimal.replace(/[^0-9]/g, '')) || 0;
      } else {
        numeric = parseInt(cleanValue.replace(/[^0-9]/g, '')) || 0;
      }
    }

    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(numeric);
  };

  const [value, setValue] = useState(
    field === 'budget'
      ? formatBudget(initialValue)
      : (initialValue ?? '').toString(),
  );
  const [prevInitialValue, setPrevInitialValue] = useState(initialValue);
  const [prevField, setPrevField] = useState(field);
  const inputRef = useRef<HTMLInputElement>(null);

  if (initialValue !== prevInitialValue || field !== prevField) {
    setPrevInitialValue(initialValue);
    setPrevField(field);
    setValue(
      field === 'budget'
        ? formatBudget(initialValue)
        : (initialValue ?? '').toString(),
    );
  }

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleUpdate = () => {
    if (value === (initialValue ?? '').toString()) {
      setIsEditing(false);

      return;
    }

    if (disabled || !yearableId) {
      setIsEditing(false);

      return;
    }

    const numericValue =
      field === 'budget' ? parseInt(value.replace(/[^0-9]/g, '')) || 0 : value;

    router
      .optimistic((props: any) => ({
        activities: {
          ...props.activities,
          data: props.activities.data.map((a: PlanningActivityVersion) => {
            if (a.id !== activityId) {
              return a;
            }

            if (yearableType === 'activity') {
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
                      yearable_id: yearableId,
                      yearable_type: 'App\\Models\\PlanningActivityVersion',
                      year,
                      target: null,
                      budget: numericValue,
                    } as PlanningActivityYear,
                  ];

              return { ...a, activity_years: newYears };
            } else {
              // Update target in indicators
              const newIndicators = (a.indicators ?? []).map((ind) => {
                if (ind.id !== yearableId) {
                  return ind;
                }

                const existingYears = ind.activity_years ?? [];
                const yearExists = existingYears.some((y) => y.year === year);
                const newYears = yearExists
                  ? existingYears.map((y) =>
                      y.year === year ? { ...y, [field]: numericValue } : y,
                    )
                  : [
                      ...existingYears,
                      {
                        id: 0,
                        yearable_id: yearableId,
                        yearable_type: 'App\\Models\\PlanningActivityIndicator',
                        year,
                        target: numericValue as string,
                        budget: null,
                      } as PlanningActivityYear,
                    ];

                return { ...ind, activity_years: newYears };
              });

              return { ...a, indicators: newIndicators };
            }
          }),
        },
      }))
      .post(
        PlanningActivityVersionController.updateYearlyData.url({
          planning_activity_version: activityId,
        }),
        {
          yearable_id: yearableId,
          yearable_type: yearableType,
          year,
          target:
            field === 'target' ? numericValue : (yearlyData?.target ?? ''),
          budget: field === 'budget' ? numericValue : (yearlyData?.budget ?? 0),
        },
        {
          onSuccess: () => {
            setIsEditing(false);
            toast.success('Data berhasil diperbarui');
          },
          onError: (errors) => {
            setIsEditing(false);
            setValue(
              field === 'budget'
                ? formatBudget(initialValue)
                : (initialValue ?? '').toString(),
            );
            const firstError = Object.values(errors)[0];
            toast.error(firstError || 'Gagal memperbarui data');
          },
          preserveScroll: true,
          showProgress: false,
        },
      );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUpdate();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setValue(
        field === 'budget'
          ? formatBudget(initialValue)
          : (initialValue ?? '').toString(),
      );
    }
  };

  if (disabled) {
    return <div className="text-center text-muted-foreground">-</div>;
  }

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => {
          if (field === 'budget') {
            setValue(formatBudget(e.target.value));
          } else {
            setValue(e.target.value);
          }
        }}
        onBlur={handleUpdate}
        onKeyDown={handleKeyDown}
        className={cn('h-8 w-full', {
          'min-w-20!': field !== 'budget',
          'min-w-40!': field === 'budget',
        })}
        type="text"
      />
    );
  }

  const displayValue = field === 'budget' ? value || 'Rp 0' : value || '-';

  return (
    <div
      onClick={() => setIsEditing(true)}
      className="min-h-[24px] cursor-pointer rounded font-mono transition-colors hover:bg-muted/50"
    >
      {displayValue}
    </div>
  );
}
