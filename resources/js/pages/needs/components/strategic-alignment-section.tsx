import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { Indicator, Sasaran, Tujuan } from '../columns';

interface StrategicAlignmentSectionProps {
  data: any;
  setData: (key: string | ((prev: any) => any), value?: any) => void;
  errors: any;
  tujuans: Tujuan[];
}

export function StrategicAlignmentSection({
  data,
  setData,
  errors,
  tujuans,
}: StrategicAlignmentSectionProps) {
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
          const indicatorIdsToRemove = sasaran.indicators.map((i) =>
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

  return (
    <div className="space-y-6 pt-6">
      {(errors.sasaran_ids || errors.indicator_ids) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Kesalahan Validasi</AlertTitle>
          <AlertDescription>
            {errors.sasaran_ids || errors.indicator_ids}
          </AlertDescription>
        </Alert>
      )}

      <div className="custom-scrollbar max-h-[60vh] space-y-8 overflow-y-auto pr-2 pb-6">
        {tujuans.map((tujuan) => (
          <TujuanGroup
            key={tujuan.id}
            tujuan={tujuan}
            sasaranIds={data.sasaran_ids}
            indicatorIds={data.indicator_ids}
            onSasaranToggle={handleSasaranToggle}
            onIndicatorToggle={handleIndicatorToggle}
          />
        ))}
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
}

function TujuanGroup({
  tujuan,
  sasaranIds,
  indicatorIds,
  onSasaranToggle,
  onIndicatorToggle,
}: TujuanGroupProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h4 className="text-sm font-semibold tracking-wider">
          Tujuan: {tujuan.name}
        </h4>
      </div>

      <div className="ml-2 grid gap-4 border-l-2 border-muted pl-6">
        {tujuan.sasarans.map((sasaran) => (
          <SasaranItem
            key={sasaran.id}
            sasaran={sasaran}
            isSasaranChecked={sasaranIds.includes(sasaran.id.toString())}
            indicatorIds={indicatorIds}
            onSasaranToggle={onSasaranToggle}
            onIndicatorToggle={onIndicatorToggle}
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
}

function SasaranItem({
  sasaran,
  isSasaranChecked,
  indicatorIds,
  onSasaranToggle,
  onIndicatorToggle,
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
              'cursor-pointer text-sm leading-normal font-medium transition-colors',
              isSasaranChecked
                ? 'text-foreground'
                : 'text-muted-foreground group-hover:text-foreground',
            )}
          >
            Sasaran: {sasaran.name}
          </Label>
        </div>
      </div>

      {isSasaranChecked &&
        sasaran.indicators &&
        sasaran.indicators.length > 0 && (
          <div className="ml-7 grid animate-in gap-3 pt-1 duration-200 fade-in slide-in-from-left-2">
            <div className="grid gap-3">
              {sasaran.indicators.map((indicator) => (
                <IndicatorItem
                  key={indicator.id}
                  indicator={indicator}
                  isIndicatorChecked={indicatorIds.includes(
                    indicator.id.toString(),
                  )}
                  onIndicatorToggle={onIndicatorToggle}
                />
              ))}
            </div>
          </div>
        )}

      {isSasaranChecked &&
        (!sasaran.indicators || sasaran.indicators.length === 0) && (
          <p className="ml-7 text-[11px] text-muted-foreground italic">
            Tidak ada indikator untuk sasaran ini.
          </p>
        )}
    </div>
  );
}

interface IndicatorItemProps {
  indicator: Indicator;
  isIndicatorChecked: boolean;
  onIndicatorToggle: (id: string, checked: boolean) => void;
}

function IndicatorItem({
  indicator,
  isIndicatorChecked,
  onIndicatorToggle,
}: IndicatorItemProps) {
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
      <div className="grid gap-1.5 leading-none">
        <Label
          htmlFor={`indicator-${indicator.id}`}
          className={cn(
            'cursor-pointer text-sm leading-normal font-normal transition-colors',
            isIndicatorChecked
              ? 'text-foreground'
              : 'text-muted-foreground group-hover/indicator:text-foreground',
          )}
        >
          Indikator: {indicator.name}
        </Label>
      </div>
    </div>
  );
}
