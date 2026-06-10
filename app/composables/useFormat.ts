export function useFormat() {
  const formatRupiah = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value)

  const formatAngka = (value: number) =>
    new Intl.NumberFormat('id-ID').format(value)

  const formatTanggal = (value: string | Date) =>
    new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

  return { formatRupiah, formatAngka, formatTanggal }
}
