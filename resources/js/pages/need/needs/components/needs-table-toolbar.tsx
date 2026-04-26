import {
  CheckCheck,
  Clock,
  LayoutGrid,
  SendIcon,
  Table,
  TriangleAlert,
} from 'lucide-react';
import { useMemo } from 'react';

import { DataTableFacetedFilter } from '@/components/data-table/data-table-faceted-filter';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import type { DataTableFilters } from '@/hooks/use-data-table';
import { cn } from '@/lib/utils';

interface NeedsTableToolbarProps {
  filters: DataTableFilters & {
    year?: string | string[];
    status?: string | string[];
    need_type_id?: string | string[];
    organizational_unit_id?: string | string[];
    urgency?: string | string[];
    impact?: string | string[];
    is_priority?: string | string[];
    is_approved_by_director?: string | string[];
    min_checklist_score?: string | string[];
  };
  organizationalUnits: { id: number; name: string; parent_id: number | null }[];
  needTypes: { id: number; name: string }[];
  mergeParams: (params: Record<string, any>) => void;
  viewMode: 'table' | 'grid' | 'loading';
  setViewMode: (mode: 'table' | 'grid') => void;
}

export function NeedsTableToolbar({
  filters,
  organizationalUnits,
  needTypes,
  mergeParams,
  viewMode,
  setViewMode,
}: NeedsTableToolbarProps) {
  const statusOptions = [
    { label: 'Draft', value: 'draft', icon: Clock },
    { label: 'Submitted', value: 'submitted', icon: SendIcon },
    { label: 'Approved', value: 'approved', icon: CheckCheck },
    { label: 'Rejected', value: 'rejected', icon: TriangleAlert },
  ];

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();

    return Array.from({ length: currentYear - 2020 + 1 }, (_, i) => 2020 + i)
      .reverse()
      .map((year) => ({ label: year.toString(), value: year.toString() }));
  }, []);

  const typeOptions = useMemo(
    () =>
      needTypes.map((type) => ({
        label: type.name,
        value: type.id.toString(),
      })),
    [needTypes],
  );

  const unitOptions = useMemo(
    () =>
      organizationalUnits.map((unit) => ({
        label: unit.name,
        value: unit.id.toString(),
      })),
    [organizationalUnits],
  );

  const urgencyOptions = [
    { label: 'Tinggi', value: 'high' },
    { label: 'Sedang', value: 'medium' },
    { label: 'Rendah', value: 'low' },
  ];

  const impactOptions = [
    { label: 'Tinggi', value: 'high' },
    { label: 'Sedang', value: 'medium' },
    { label: 'Rendah', value: 'low' },
  ];

  const priorityOptions = [
    { label: 'Ya', value: '1' },
    { label: 'Tidak', value: '0' },
  ];

  const directorReviewOptions = [
    { label: 'Sudah Direview', value: '1' },
    { label: 'Belum Direview', value: '0' },
  ];

  const scoreOptions = [{ label: '≥ 85%', value: '85' }];

  const getFilterArray = (value: string | string[] | undefined) => {
    if (!value) {
      return [];
    }

    return Array.isArray(value) ? value : [value];
  };

  return (
    <>
      <ButtonGroup>
        <Button
          variant={'outline'}
          size={'icon'}
          onClick={() => setViewMode('table')}
          className={cn('border-dashed', {
            'bg-muted': viewMode === 'table',
          })}
        >
          <Table />
          <span className="sr-only">Table view</span>
        </Button>
        <Button
          variant={'outline'}
          size={'icon'}
          onClick={() => setViewMode('grid')}
          className={cn('border-dashed', {
            'bg-muted': viewMode === 'grid',
          })}
        >
          <LayoutGrid />
          <span className="sr-only">Grid view</span>
        </Button>
      </ButtonGroup>

      <DataTableFacetedFilter
        title="Tahun"
        options={yearOptions}
        selectedValues={getFilterArray(filters.year)}
        onSelect={(values) => mergeParams({ year: values, page: 1 })}
      />
      <DataTableFacetedFilter
        title="Status"
        options={statusOptions}
        selectedValues={getFilterArray(filters.status)}
        onSelect={(values) => mergeParams({ status: values, page: 1 })}
      />
      <DataTableFacetedFilter
        title="Jenis"
        options={typeOptions}
        selectedValues={getFilterArray(filters.need_type_id)}
        onSelect={(values) => mergeParams({ need_type_id: values, page: 1 })}
      />
      <DataTableFacetedFilter
        title="Unit Kerja"
        options={unitOptions}
        selectedValues={getFilterArray(filters.organizational_unit_id)}
        onSelect={(values) =>
          mergeParams({ organizational_unit_id: values, page: 1 })
        }
      />
      <DataTableFacetedFilter
        title="Urgensi"
        options={urgencyOptions}
        selectedValues={getFilterArray(filters.urgency)}
        onSelect={(values) => mergeParams({ urgency: values, page: 1 })}
      />
      <DataTableFacetedFilter
        title="Dampak"
        options={impactOptions}
        selectedValues={getFilterArray(filters.impact)}
        onSelect={(values) => mergeParams({ impact: values, page: 1 })}
      />
      <DataTableFacetedFilter
        title="Prioritas"
        options={priorityOptions}
        selectedValues={getFilterArray(filters.is_priority)}
        onSelect={(values) => mergeParams({ is_priority: values, page: 1 })}
      />
      <DataTableFacetedFilter
        title="Review Direktur"
        options={directorReviewOptions}
        selectedValues={getFilterArray(filters.is_approved_by_director)}
        onSelect={(values) =>
          mergeParams({ is_approved_by_director: values, page: 1 })
        }
      />
      <DataTableFacetedFilter
        title="Skor Checklist"
        options={scoreOptions}
        selectedValues={getFilterArray(filters.min_checklist_score)}
        onSelect={(values) =>
          mergeParams({ min_checklist_score: values, page: 1 })
        }
      />
    </>
  );
}
