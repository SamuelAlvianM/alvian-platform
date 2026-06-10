export function useFormat() {
  const formatRupiah = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value)

  const formatAngka = (value: number) =>
    new Intl.NumberFormat('id-ID').format(value)

  const formatTanggal = (value: string | Date) => {
    // String "YYYY-MM-DD" diparsing sebagai UTC — tambah T00:00 agar lokal
    const d = typeof value === 'string' && value.length === 10
      ? new Date(value + 'T00:00:00')
      : new Date(value)
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  return { formatRupiah, formatAngka, formatTanggal }
}
