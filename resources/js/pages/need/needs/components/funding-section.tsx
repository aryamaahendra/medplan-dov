import {
  RiSearchLine,
  RiCheckLine,
  RiArrowDownSLine,
  RiAddLine,
} from '@remixicon/react';
import { useState, useMemo } from 'react';
import { FieldWrapper, TextareaField } from '@/components/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getFormattedCost } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { SectionWrapper } from './section-wrapper';

export function FundingSection({
  fundingSources,
  totalPrice,
  errors,
  onChange,
  initialFundingSourceIds,
}: {
  fundingSources: { id: number; name: string }[];
  totalPrice: string | number;
  errors: any;
  onChange: (key: string, value: any) => void;
  initialFundingSourceIds?: (string | number)[];
}) {
  const [sourceSearch, setSourceSearch] = useState('');
  const [sourceOpen, setSourceOpen] = useState(false);
  const [fundingSourceIds, setFundingSourceIds] = useState<(string | number)[]>(
    initialFundingSourceIds || [],
  );

  const selectedSourcesLabel = useMemo(() => {
    if (fundingSourceIds.length === 0) {
      return null;
    }

    const names = fundingSourceIds.map((id) => {
      const found = fundingSources.find(
        (s) => s.id.toString() === id.toString(),
      );

      return found ? found.name : id;
    });

    if (names.length <= 2) {
      return names.join(', ');
    }

    return `${names.length} sumber dana terpilih`;
  }, [fundingSourceIds, fundingSources]);

  const toggleSource = (id: string | number) => {
    const next = fundingSourceIds.some((i) => i.toString() === id.toString())
      ? fundingSourceIds.filter((i) => i.toString() !== id.toString())
      : [...fundingSourceIds, id];

    setFundingSourceIds(next);
    onChange('funding_source_ids', next);
  };

  const filteredSources = useMemo(
    () =>
      fundingSources.filter((s) =>
        s.name.toLowerCase().includes(sourceSearch.toLowerCase()),
      ),
    [fundingSources, sourceSearch],
  );

  const showAddNew =
    sourceSearch && !fundingSources.some((s) => s.name === sourceSearch);

  return (
    <SectionWrapper
      label="Sumber Pendanaan & Estimasi Biaya"
      footer="Pilih sumber dana pengadaan serta pantau perkiraan total anggaran kegiatan."
    >
      <div className="space-y-4">
        <FieldWrapper
          id="funding_source_ids"
          label="Sumber Dana"
          labelProps={{
            className:
              'text-xs font-medium tracking-wider text-muted-foreground uppercase',
          }}
          error={errors[`detail.funding_source_ids`]}
        >
          {({ id }) => (
            <Popover open={sourceOpen} onOpenChange={setSourceOpen}>
              <PopoverTrigger
                render={
                  <Button
                    id={id}
                    variant="outline"
                    className="w-full justify-between font-normal"
                  />
                }
              >
                <span className="truncate">
                  {selectedSourcesLabel || 'Pilih sumber dana...'}
                </span>
                <RiArrowDownSLine
                  data-icon="inline-end"
                  className="opacity-50"
                />
              </PopoverTrigger>
              <PopoverContent className="w-(--anchor-width) p-0" align="start">
                <div className="flex items-center border-b px-3">
                  <RiSearchLine className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                  <Input
                    placeholder="Cari atau tambah sumber dana..."
                    className="border-none bg-transparent shadow-none focus-visible:ring-0"
                    value={sourceSearch}
                    onChange={(e) => setSourceSearch(e.target.value)}
                  />
                </div>
                <ScrollArea className="max-h-[200px]">
                  <div className="p-1">
                    {filteredSources.map((source) => (
                      <div
                        key={source.id}
                        className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-2 text-sm hover:bg-accent"
                        onClick={() => toggleSource(source.id)}
                      >
                        <RiCheckLine
                          className={cn(
                            'h-4 w-4',
                            fundingSourceIds.some(
                              (i) => i.toString() === source.id.toString(),
                            )
                              ? 'opacity-100'
                              : 'opacity-0',
                          )}
                        />
                        {source.name}
                      </div>
                    ))}
                    {showAddNew && (
                      <div
                        className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-2 text-sm font-semibold text-foreground hover:bg-accent"
                        onClick={() => {
                          toggleSource(sourceSearch);
                          setSourceSearch('');
                        }}
                      >
                        <RiAddLine className="h-4 w-4" />
                        Tambah "{sourceSearch}"
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>
          )}
        </FieldWrapper>

        <TextareaField
          id="estimated_cost"
          label="Estimasi Biaya"
          labelProps={{
            className:
              'text-xs font-medium tracking-wider text-muted-foreground uppercase',
          }}
          disabled
          value={getFormattedCost(totalPrice)}
          className="min-h-[80px] bg-muted/50 font-medium"
          placeholder="Akan terisi otomatis dari Total Biaya..."
          error={errors[`detail.estimated_cost`]}
        />
      </div>
    </SectionWrapper>
  );
}
