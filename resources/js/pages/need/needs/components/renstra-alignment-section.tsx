import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { Sasaran, Tujuan } from '@/types';

interface RenstraAlignmentSectionProps {
  data: any;
  setData: (key: string | ((prev: any) => any), value?: any) => void;
  errors: any;
  tujuans: any[];
  year: number;
}

export function RenstraAlignmentSection({
  data,
  setData,
  errors,
  tujuans,
  year,
}: RenstraAlignmentSectionProps) {
  const handleSasaranToggle = (sasaranId: string, checked: boolean) => {
    setData((prev: any) => {
      const newSasaranIds = checked
        ? [...prev.sasaran_ids, sasaranId]
        : prev.sasaran_ids.filter((id: string) => id !== sasaranId);

      // If unchecking, also remove indicators belonging to this sasaran
      let newIndicatorIds = [...prev.indicator_ids];

      if (!checked) {
        // Find all indicators that belong to this sasaran
        const sasaran = tujuans
          .flatMap((t) => t.sasarans)
          .find((s) => s.id.toString() === sasaranId);

        if (sasaran?.indicators) {
          const indicatorIdsToRemove = sasaran.indicators.map((i: any) =>
            i.id.toString(),
          );
          newIndicatorIds = newIndicatorIds.filter(
            (id) => !indicatorIdsToRemove.includes(id),
          );
        }
      }

      return {
        ...prev,
        sasaran_ids: newSasaranIds,
        indicator_ids: newIndicatorIds,
      };
    });
  };

  const handleIndicatorToggle = (indicatorId: string, checked: boolean) => {
    setData((prev: any) => ({
      ...prev,
      indicator_ids: checked
        ? [...prev.indicator_ids, indicatorId]
        : prev.indicator_ids.filter((id: string) => id !== indicatorId),
    }));
  };

  const renstraErrors = errors.sasaran_ids || errors.indicator_ids;

  return (
    <div className="space-y-6">
      {renstraErrors && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Kesalahan Validasi</AlertTitle>
          <AlertDescription>{renstraErrors}</AlertDescription>
        </Alert>
      )}

      <div className="pt-2 pr-2 pb-6">
        <div className="space-y-8 pl-1">
          {tujuans.map((tujuan) => (
            <TujuanGroup
              key={tujuan.id}
              tujuan={tujuan}
              sasaranIds={data.sasaran_ids}
              indicatorIds={data.indicator_ids}
              onSasaranToggle={handleSasaranToggle}
              onIndicatorToggle={handleIndicatorToggle}
              year={year}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface TujuanGroupProps {
  tujuan: Tujuan;
  sasaranIds: string[];
  indicatorIds: string[];
  onSasaranToggle: (id: string, checked: boolean) => void;
  onIndicatorToggle: (id: string, checked: boolean) => void;
  year: number;
}

function TujuanGroup({
  tujuan,
  sasaranIds,
  indicatorIds,
  onSasaranToggle,
  onIndicatorToggle,
  year,
}: TujuanGroupProps) {
  const renstra = tujuan.renstra;
  const isOutOfRange =
    renstra && (year < renstra.year_start || year > renstra.year_end);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h4 className="text-sm font-semibold tracking-wider uppercase">
          Tujuan: {tujuan.name}
        </h4>
        {isOutOfRange && (
          <span className="text-xs font-medium text-destructive">
            (Di luar jangkauan tahun Renstra: {renstra?.year_start} -{' '}
            {renstra?.year_end})
          </span>
        )}
      </div>

      <div className="grid gap-4 border-l border-dashed pl-4">
        {tujuan.sasarans.map((sasaran) => (
          <SasaranItem
            key={sasaran.id}
            sasaran={sasaran}
            isSasaranChecked={sasaranIds.includes(sasaran.id.toString())}
            indicatorIds={indicatorIds}
            onSasaranToggle={onSasaranToggle}
            onIndicatorToggle={onIndicatorToggle}
            year={year}
          />
        ))}
      </div>
    </div>
  );
}

interface SasaranItemProps {
  sasaran: Sasaran;
  isSasaranChecked: boolean;
  indicatorIds: string[];
  onSasaranToggle: (id: string, checked: boolean) => void;
  onIndicatorToggle: (id: string, checked: boolean) => void;
  year: number;
}

function SasaranItem({
  sasaran,
  isSasaranChecked,
  indicatorIds,
  onSasaranToggle,
  onIndicatorToggle,
  year,
}: SasaranItemProps) {
  return (
    <div className="space-y-3">
      <div className="group flex items-start space-x-3">
        <Checkbox
          id={`sasaran-${sasaran.id}`}
          checked={isSasaranChecked}
          onCheckedChange={(checked) =>
            onSasaranToggle(sasaran.id.toString(), !!checked)
          }
          className="mt-1"
        />
        <div className="grid gap-1.5 leading-none">
          <Label
            htmlFor={`sasaran-${sasaran.id}`}
            className={cn(
              'cursor-pointer text-sm leading-normal transition-colors hover:underline',
              isSasaranChecked ? 'font-medium' : 'font-normal',
            )}
          >
            Sasaran: {sasaran.name}
          </Label>
        </div>
      </div>

      {isSasaranChecked &&
        sasaran.indicators &&
        sasaran.indicators.length > 0 && (
          <div className="grid animate-in gap-3 border-l border-dashed pl-4 duration-200 fade-in slide-in-from-left-2">
            <div className="grid gap-3">
              {sasaran.indicators.map((indicator) => (
                <IndicatorItem
                  key={indicator.id}
                  indicator={indicator as any}
                  isIndicatorChecked={indicatorIds.includes(
                    indicator.id.toString(),
                  )}
                  onIndicatorToggle={onIndicatorToggle}
                  year={year}
                />
              ))}
            </div>
          </div>
        )}

      {isSasaranChecked &&
        (!sasaran.indicators || sasaran.indicators.length === 0) && (
          <p className="ml-7 text-sm text-muted-foreground italic">
            Tidak ada indikator untuk sasaran ini.
          </p>
        )}
    </div>
  );
}

function IndicatorItem({
  indicator,
  isIndicatorChecked,
  onIndicatorToggle,
  year,
}: {
  indicator: any;
  isIndicatorChecked: boolean;
  onIndicatorToggle: (id: string, checked: boolean) => void;
  year: number;
}) {
  const targetForYear = indicator.targets?.find((t: any) => t.year === year);

  return (
    <div className="group/indicator flex items-start space-x-3">
      <Checkbox
        id={`indicator-${indicator.id}`}
        checked={isIndicatorChecked}
        onCheckedChange={(checked) =>
          onIndicatorToggle(indicator.id.toString(), !!checked)
        }
        className="mt-1"
      />
      <div className="mt-1 grid gap-1.5 leading-none">
        <Label
          htmlFor={`indicator-${indicator.id}`}
          className={cn(
            'cursor-pointer text-sm leading-normal font-medium transition-colors',
            isIndicatorChecked
              ? 'text-foreground'
              : 'text-muted-foreground group-hover/indicator:text-foreground',
          )}
        >
          {indicator.name}
        </Label>
        <div className="mt-0.5">
          {targetForYear ? (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="text-[10px] font-medium text-muted-foreground/70 uppercase">
                Target {year}:
              </span>
              <span className="font-medium text-foreground">
                {targetForYear.target || '-'}
              </span>
            </div>
          ) : (
            <span className="text-[10px] font-medium text-destructive italic">
              (Target tahun {year} tidak tersedia)
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
