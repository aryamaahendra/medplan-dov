import { Label } from '@/components/ui/label';
import { RadioGroupItem } from '@/components/ui/radio-group';
interface ResponseOptionProps {
  id: string;
  value: string;
  label: string;
  isActive: boolean;
  activeClass: string;
  disabled?: boolean;
}

export function ResponseOption({
  id,
  value,
  label,
  isActive,
  activeClass,
  disabled = false,
}: ResponseOptionProps) {
  return (
    <Label
      htmlFor={id}
      className={`group flex rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-muted/50'} ${isActive ? activeClass : 'bg-background'}`}
    >
      <RadioGroupItem value={value} id={id} disabled={disabled} />
      {label}
    </Label>
  );
}
