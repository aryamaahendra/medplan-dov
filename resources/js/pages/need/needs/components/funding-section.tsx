import { Search, Check, ChevronDown, Plus } from 'lucide-react';
import { useState, useMemo } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { getFormattedCost } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { SectionWrapper } from './section-wrapper';

export function FundingSection({
  fundingSources,
  totalPrice,
  errors,
  onChange,
  initialFundingSourceId,
}: {
  fundingSources: { id: number; name: string }[];
  totalPrice: string | number;
  errors: any;
  onChange: (key: string, value: any) => void;
  initialFundingSourceId?: string;
}) {
  const [sourceSearch, setSourceSearch] = useState('');
  const [sourceOpen, setSourceOpen] = useState(false);
  const [fundingSourceId, setFundingSourceId] = useState(
    initialFundingSourceId || '',
  );

  const selectedSource = useMemo(() => {
    if (!fundingSourceId) {
      return null;
    }

    return (
      fundingSources.find((s) => s.id.toString() === fundingSourceId.toString())
        ?.name || fundingSourceId
    );
  }, [fundingSourceId, fundingSources]);

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
      label="Sumber Dana & Estimasi Biaya"
      footer="*Pilih sumber dana dan biaya estimasi (otomatis)."
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
            Sumber Dana
          </Label>
          <Popover open={sourceOpen} onOpenChange={setSourceOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between font-normal"
              >
                {selectedSource || 'Pilih sumber dana...'}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[--radix-popover-trigger-width] p-0"
              align="start"
            >
              <div className="flex items-center border-b px-3">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <Input
                  placeholder="Cari atau tambah sumber dana..."
                  className="h-10 border-none bg-transparent outline-none focus-visible:ring-0"
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
                      onClick={() => {
                        const id = source.id.toString();
                        onChange('funding_source_id', id);
                        setFundingSourceId(id);
                        setSourceOpen(false);
                        setSourceSearch('');
                      }}
                    >
                      <Check
                        className={cn(
                          'h-4 w-4',
                          fundingSourceId?.toString() === source.id.toString()
                            ? 'opacity-100'
                            : 'opacity-0',
                        )}
                      />
                      {source.name}
                    </div>
                  ))}
                  {showAddNew && (
                    <div
                      className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-2 text-sm font-medium text-primary hover:bg-accent"
                      onClick={() => {
                        onChange('funding_source_id', sourceSearch);
                        setFundingSourceId(sourceSearch);
                        setSourceOpen(false);
                        setSourceSearch('');
                      }}
                    >
                      <Plus className="h-4 w-4" />
                      Tambah "{sourceSearch}"
                    </div>
                  )}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>
          <InputError message={errors[`detail.funding_source_id`]} />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
            Estimasi Biaya
          </Label>
          <Textarea
            disabled
            value={getFormattedCost(totalPrice)}
            className="min-h-[80px] bg-muted/50 font-medium"
            placeholder="Akan terisi otomatis dari Total Biaya..."
          />
          <InputError message={errors[`detail.estimated_cost`]} />
        </div>
      </div>
    </SectionWrapper>
  );
}
