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
  activity: PlanningActivityVersion;
  year: number;
  field: 'target' | 'budget';
}

export function YearlyDataCell({ activity, year, field }: YearlyDataCellProps) {
  const yearlyData = activity.activity_years?.find((y) => y.year === year);
  const initialValue = yearlyData
    ? yearlyData[field]
    : field === 'budget'
      ? '0'
      : '';

  const [isEditing, setIsEditing] = useState(false);
  const formatBudget = (val: string | number) => {
    if (!val || val === '0' || val === 0) {
      return 'Rp 0';
    }

    let numeric: number;

    if (typeof val === 'number') {
      numeric = Math.round(val);
    } else {
      const cleanValue = val.toString().trim();

      // HEURISTIC: Check if this string looks like it has a decimal part at the end
      // e.g. "123.00", "1.234,00", "Rp 1.234,00"
      if (/[.,]\d{2}$/.test(cleanValue)) {
        // Remove the decimal part (.00 or ,00) before stripping non-digits
        // to avoid "100.00" becoming "10000"
        const withoutDecimal = cleanValue.slice(0, -3);
        numeric = parseInt(withoutDecimal.replace(/[^0-9]/g, '')) || 0;
      } else {
        // Standard strip everything except digits
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
    field === 'budget' ? formatBudget(initialValue) : initialValue.toString(),
  );
  const [prevInitialValue, setPrevInitialValue] = useState(initialValue);
  const [prevField, setPrevField] = useState(field);
  const inputRef = useRef<HTMLInputElement>(null);

  if (initialValue !== prevInitialValue || field !== prevField) {
    setPrevInitialValue(initialValue);
    setPrevField(field);
    setValue(
      field === 'budget' ? formatBudget(initialValue) : initialValue.toString(),
    );
  }

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
      field === 'budget' ? parseInt(value.replace(/[^0-9]/g, '')) || 0 : value;

    router
      .optimistic((props: any) => ({
        activities: {
          ...props.activities,
          data: props.activities.data.map((a: PlanningActivityVersion) => {
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
        },
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
            toast.success('Data berhasil diperbarui');
          },
          onError: (errors) => {
            setIsEditing(false);
            setValue(
              field === 'budget'
                ? formatBudget(initialValue)
                : initialValue.toString(),
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
          : initialValue.toString(),
      );
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

  console.log(`${initialValue} ${value}`);

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
