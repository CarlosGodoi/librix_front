export function formatISBN(value: string): string {
  const numbers = value.replace(/\D/g, '').slice(0, 13);

  if (!numbers) return '';

  const parts = [
    numbers.slice(0, 3),
    numbers.slice(3, 5),
    numbers.slice(5, 10),
    numbers.slice(10, 12),
    numbers.slice(12, 13),
  ];

  return parts.filter(Boolean).join('-');
}
