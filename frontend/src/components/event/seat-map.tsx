'use client';

import { motion } from 'framer-motion';
import { Armchair } from 'lucide-react';
import { useCallback } from 'react';

interface SeatMapProps {
  rows: number;
  cols: number;
  bookedSeats: string[];
  selectedSeats: string[];
  maxSelectable: number;
  onSeatSelect: (seats: string[]) => void;
}

export function SeatMap({ rows, cols, bookedSeats, selectedSeats, maxSelectable, onSeatSelect }: SeatMapProps) {
  const toggleSeat = useCallback(
    (seatId: string) => {
      if (bookedSeats.includes(seatId)) return;

      if (selectedSeats.includes(seatId)) {
        onSeatSelect(selectedSeats.filter((s) => s !== seatId));
      } else {
        if (selectedSeats.length >= maxSelectable) {
          // If at max capacity and selecting a new one, we can optionally show an error or just replace the last selected
          // Here we just replace the oldest selected if maxSelectable > 0
          if (maxSelectable === 1) {
            onSeatSelect([seatId]);
          } else {
            // Can't select more than quantity
          }
          return;
        }
        onSeatSelect([...selectedSeats, seatId]);
      }
    },
    [bookedSeats, selectedSeats, maxSelectable, onSeatSelect],
  );

  const renderSeats = () => {
    const grid = [];
    for (let r = 0; r < rows; r++) {
      const rowLabel = String.fromCharCode(65 + r); // A, B, C...
      const rowSeats = [];
      for (let c = 1; c <= cols; c++) {
        const seatId = `${rowLabel}${c}`;
        const isBooked = bookedSeats.includes(seatId);
        const isSelected = selectedSeats.includes(seatId);

        rowSeats.push(
          <motion.button
            key={seatId}
            type="button"
            whileHover={!isBooked ? { scale: 1.1 } : {}}
            whileTap={!isBooked ? { scale: 0.95 } : {}}
            disabled={isBooked || (!isSelected && selectedSeats.length >= maxSelectable)}
            onClick={() => toggleSeat(seatId)}
            className={`flex h-10 w-10 flex-col items-center justify-center rounded-t-lg border-2 text-[10px] font-bold transition-colors disabled:cursor-not-allowed ${
              isBooked
                ? 'border-slate-300 bg-slate-200 text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-600'
                : isSelected
                ? 'border-[#14b8a6] bg-[#14b8a6] text-white shadow-md'
                : 'border-slate-300 bg-white text-slate-600 hover:border-[#14b8a6] hover:text-[#14b8a6] disabled:border-slate-200 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300'
            }`}
            title={seatId}
          >
            <Armchair size={16} className="mb-0.5" />
            {c}
          </motion.button>,
        );
      }
      grid.push(
        <div key={rowLabel} className="flex items-center justify-center gap-2">
          <span className="w-6 text-center text-sm font-bold text-slate-400">{rowLabel}</span>
          <div className="flex gap-2">{rowSeats}</div>
          <span className="w-6 text-center text-sm font-bold text-slate-400">{rowLabel}</span>
        </div>,
      );
    }
    return grid;
  };

  return (
    <div className="flex flex-col items-center space-y-6 overflow-x-auto p-4">
      <div className="mb-4 flex w-full max-w-2xl justify-center rounded-b-3xl border-b-8 border-slate-300 bg-gradient-to-b from-white to-slate-100 py-4 shadow-sm dark:border-slate-600 dark:from-slate-900 dark:to-slate-800">
        <span className="font-semibold uppercase tracking-widest text-slate-400">Sân Khấu</span>
      </div>

      <div className="flex flex-col gap-3">{renderSeats()}</div>

      <div className="mt-8 flex gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-t-md border-2 border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900"></div>
          <span className="text-slate-600 dark:text-slate-300">Ghế trống</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-t-md border-2 border-[#14b8a6] bg-[#14b8a6]"></div>
          <span className="text-slate-600 dark:text-slate-300">Đang chọn</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-t-md border-2 border-slate-300 bg-slate-200 dark:border-slate-700 dark:bg-slate-800"></div>
          <span className="text-slate-600 dark:text-slate-300">Đã bán</span>
        </div>
      </div>
    </div>
  );
}
