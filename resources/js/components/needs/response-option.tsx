import { Label } from '@/components/ui/label';
import { RadioGroupItem } from '@/components/ui/radio-group';
interface ResponseOptionProps {
  id: string;
  value: string;
  label: string;
  isActive: boolean;
  activeClass: string;
}

export function ResponseOption({
  id,
  value,
  label,
  isActive,
  activeClass,
}: ResponseOptionProps) {
  return (
    <Label
      htmlFor={id}
      className={`group flex cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-medium transition-all hover:bg-muted/50 ${isActive ? activeClass : 'bg-background'}`}
    >
      <RadioGroupItem value={value} id={id} />
      {label}
    </Label>
  );
}
