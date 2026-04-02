import { router, useForm } from '@inertiajs/react';
import { toast } from 'sonner';

import NeedController from '@/actions/App/Http/Controllers/NeedController';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import needRoutes from '@/routes/needs';

import type { Need } from '../columns';
import { GeneralInfoSection } from './general-info-section';
import { PriorityStatusSection } from './priority-status-section';

interface NeedFormProps {
  need?: Need | null;
  organizationalUnits: { id: number; name: string }[];
  needTypes: { id: number; name: string }[];
  className?: string;
}

export function NeedForm({
  need,
  organizationalUnits,
  needTypes,
  className,
}: NeedFormProps) {
  const isEditing = !!need;

  const { data, setData, post, patch, processing, errors } = useForm({
    organizational_unit_id: need?.organizational_unit_id?.toString() ?? '',
    need_type_id: need?.need_type_id?.toString() ?? '',
    year: need?.year?.toString() ?? new Date().getFullYear().toString(),
    title: need?.title ?? '',
    description: need?.description ?? '',
    current_condition: need?.current_condition ?? '',
    required_condition: need?.required_condition ?? '',
    unit: need?.unit ?? '',
    volume: need?.volume ?? '',
    unit_price: need?.unit_price ?? '',
    total_price: need?.total_price ?? '',
    urgency: need?.urgency ?? 'medium',
    impact: need?.impact ?? 'medium',
    is_priority: need?.is_priority ?? false,
    status: need?.status ?? 'draft',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const options = {
      onSuccess: () => {
        toast.success(
          isEditing
            ? 'Usulan kebutuhan berhasil diperbarui.'
            : 'Usulan kebutuhan berhasil dibuat.',
        );
      },
    };

    if (isEditing) {
      patch(NeedController.update.url({ need: need.id }), options);
    } else {
      post(NeedController.store.url(), options);
    }
  };

  const handleVolumeChange = (value: string) => {
    const vol = parseFloat(value) || 0;
    const price = parseFloat(data.unit_price) || 0;
    setData((d: typeof data) => ({
      ...d,
      volume: value,
      total_price: (vol * price).toFixed(2),
    }));
  };

  const handleUnitPriceChange = (value: string) => {
    const price = parseFloat(value) || 0;
    const vol = parseFloat(data.volume) || 0;
    setData((d: typeof data) => ({
      ...d,
      unit_price: value,
      total_price: (vol * price).toFixed(2),
    }));
  };

  return (
    <Card className={cn('w-full max-w-3xl overflow-hidden', className)}>
      <form onSubmit={handleSubmit}>
        <CardContent className="">
          <Tabs defaultValue="usulan" className="w-full">
            <TabsList className="">
              <TabsTrigger value="usulan" className="">
                Data Usulan
              </TabsTrigger>
              <TabsTrigger value="urgency" className="">
                Urgensi & Status
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="usulan"
              className="mt-0 focus-visible:outline-none"
            >
              <GeneralInfoSection
                data={data}
                setData={setData}
                errors={errors}
                organizationalUnits={organizationalUnits}
                needTypes={needTypes}
                handleVolumeChange={handleVolumeChange}
                handleUnitPriceChange={handleUnitPriceChange}
              />
            </TabsContent>

            <TabsContent
              value="urgency"
              className="mt-0 focus-visible:outline-none"
            >
              <PriorityStatusSection
                data={data}
                setData={setData}
                errors={errors}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.visit(needRoutes.index.url())}
          >
            Batal
          </Button>
          <Button type="submit" disabled={processing}>
            {isEditing ? 'Simpan Perubahan' : 'Tambah Usulan'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
