import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

type QuantitySelectorProps = {
  value: number;
  max: number;
  disabled?: boolean;
  onChange: (value: number) => void;
};

export function QuantitySelector({ value, max, disabled, onChange }: QuantitySelectorProps) {
  const safeMax = Math.max(0, max);

  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-800">
      <Button
        type="button"
        variant="outline"
        className="h-9 w-9 p-0"
        disabled={disabled || value <= 1}
        onClick={() => onChange(Math.max(1, value - 1))}
      >
        <Minus size={16} />
      </Button>
      <input
        className="mx-3 h-9 w-16 rounded border-0 bg-transparent p-0 text-center text-lg font-bold focus:ring-0 dark:text-white"
        min={safeMax > 0 ? 1 : 0}
        max={safeMax}
        value={safeMax === 0 ? 0 : value}
        disabled={disabled || safeMax === 0}
        type="number"
        onChange={(event) => {
          const next = Number(event.target.value);
          onChange(Math.min(Math.max(1, next), safeMax));
        }}
      />
      <Button
        type="button"
        variant="outline"
        className="h-9 w-9 p-0"
        disabled={disabled || value >= safeMax}
        onClick={() => onChange(Math.min(safeMax, value + 1))}
      >
        <Plus size={16} />
      </Button>
    </div>
  );
}
