export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ar-EG').format(amount) + ' جنيه';
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('ar-EG').format(num);
}
