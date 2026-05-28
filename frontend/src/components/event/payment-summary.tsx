type PaymentSummaryProps = {
  price: number;
  quantity: number;
  discountCode: string;
  onDiscountChange: (value: string) => void;
};

export function calculateDiscount(subtotal: number, code: string) {
  const normalized = code.trim().toUpperCase();
  if (normalized === 'EVENT10') return Math.round(subtotal * 0.1);
  if (normalized === 'VIP50') return Math.min(50000, subtotal);
  return 0;
}

export function PaymentSummary({ price, quantity, discountCode, onDiscountChange }: PaymentSummaryProps) {
  const subtotal = price * quantity;
  const discount = calculateDiscount(subtotal, discountCode);
  const total = Math.max(subtotal - discount, 0);

  return (
    <div className="space-y-3 rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
      <label className="block">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Mã giảm giá</span>
        <input
          className="mt-2 w-full dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          placeholder="Nhập EVENT10"
          value={discountCode}
          onChange={(event) => onDiscountChange(event.target.value)}
        />
      </label>
      <div className="space-y-2 border-t border-slate-200 pt-3 text-sm dark:border-slate-700">
        <div className="flex justify-between text-slate-600 dark:text-slate-300">
          <span>Tạm tính</span>
          <span>{subtotal.toLocaleString('vi-VN')}đ</span>
        </div>
        <div className="flex justify-between text-slate-600 dark:text-slate-300">
          <span>Giảm giá</span>
          <span>-{discount.toLocaleString('vi-VN')}đ</span>
        </div>
        <div className="flex justify-between text-lg font-bold text-slate-950 dark:text-white">
          <span>Tổng tiền</span>
          <span>{total.toLocaleString('vi-VN')}đ</span>
        </div>
      </div>
    </div>
  );
}
