import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

type TourPage = 'global' | 'bahan-baku' | 'resep' | 'klien' | 'penjualan' | 'hpp'

const STORAGE_KEY = (page: TourPage) => `alvian_tour_${page}_done`

function makeDriver(steps: any[], onDone?: () => void) {
  return driver({
    showProgress: true,
    progressText: 'Langkah {{current}} dari {{total}}',
    nextBtnText: 'Lanjut →',
    prevBtnText: '← Kembali',
    doneBtnText: 'Selesai 🎉',
    overlayColor: '#0f2635',
    overlayOpacity: 0.75,
    smoothScroll: true,
    allowClose: true,
    popoverClass: 'alvian-tour-popover',
    steps,
    onDestroyed: () => { onDone?.() },
  })
}

const tourSteps: Record<TourPage, any[]> = {
  global: [
    {
      element: '#tour-sidebar',
      popover: {
        title: '👋 Selamat Datang di Alvian\'s Kitchen!',
        description: 'Ini platform manajemen internal tokomu. Semua fitur ada di sidebar kiri. Yuk kenalan satu per satu!',
        side: 'right', align: 'start',
      },
    },
    {
      element: '#tour-nav-dashboard',
      popover: {
        title: '🏠 Dashboard',
        description: 'Ringkasan bisnis hari ini — total bahan, menu aktif, transaksi & pemasukan bulan ini, dan jumlah menu per kategori.',
        side: 'right',
      },
    },
    {
      element: '#tour-nav-bahan',
      popover: {
        title: '🧂 Bahan Baku',
        description: 'Catat semua bahan yang kamu pakai: nama, satuan, stok, dan harga per satuan. Data ini dipakai otomatis untuk hitung HPP.',
        side: 'right',
      },
    },
    {
      element: '#tour-nav-resep',
      popover: {
        title: '🍽️ Resep & Menu',
        description: 'Buat menu kue, masakan, minuman, atau snack. Pilih bahan-bahannya → HPP dan margin langsung terhitung otomatis!',
        side: 'right',
      },
    },
    {
      element: '#tour-nav-klien',
      popover: {
        title: '🏪 Klien & Toko',
        description: 'Daftarkan toko atau klien yang memesan. Nanti laporan penjualan bisa dikelompokkan dan difilter per klien.',
        side: 'right',
      },
    },
    {
      element: '#tour-nav-penjualan',
      popover: {
        title: '🛒 Penjualan & Laporan',
        description: 'Dua fitur dalam satu halaman:\n• Tab Transaksi → catat penjualan harian\n• Tab Laporan → HPP, laba bersih per klien, download Excel',
        side: 'right',
      },
    },
    {
      element: '#tour-nav-hpp',
      popover: {
        title: '📊 Analisis HPP',
        description: 'Lihat perbandingan HPP vs harga jual. Margin hijau (≥30%) = bagus, kuning = perlu perhatian, merah = evaluasi harga.',
        side: 'right',
      },
    },
    {
      element: '#tour-repeat-btn',
      popover: {
        title: '📖 Tutorial Halaman',
        description: 'Tombol ini menampilkan tutorial khusus halaman yang sedang kamu buka. Tersedia di setiap halaman fitur!',
        side: 'right', align: 'end',
      },
    },
  ],

  'bahan-baku': [
    {
      element: '#bahan-header',
      popover: {
        title: '🧂 Halaman Bahan Baku',
        description: 'Di sini kamu catat semua bahan baku: tepung, gula, telur, mentega, dll. Harga yang kamu masukkan akan dipakai untuk menghitung HPP resep secara otomatis.',
        side: 'bottom',
      },
    },
    {
      element: '#btn-tambah-bahan',
      popover: {
        title: '➕ Tambah Bahan Baru',
        description: 'Klik tombol ini untuk menambahkan bahan baku pertamamu. Misalnya: Tepung Terigu, 1 kg, harga Rp 12.000.',
        side: 'left',
      },
    },
    {
      element: '#form-nama-bahan',
      popover: {
        title: '✏️ Nama Bahan',
        description: 'Isi nama bahan baku. Gunakan nama yang jelas, contoh: "Tepung Terigu Segitiga", "Gula Pasir", "Telur Ayam".',
        side: 'bottom',
      },
    },
    {
      element: '#form-satuan-bahan',
      popover: {
        title: '⚖️ Satuan',
        description: 'Pilih satuan yang sesuai: gram/kg untuk bahan kering, ml/liter untuk cair, butir/buah untuk satuan biji.',
        side: 'bottom',
      },
    },
    {
      element: '#form-stok-bahan',
      popover: {
        title: '📦 Stok & Harga',
        description: 'Isi stok saat ini dan harga per satuan. Contoh: stok 5 kg, harga per kg = Rp 12.000. Platform akan menghitung nilai stok otomatis.',
        side: 'bottom',
      },
    },
    {
      element: '#btn-simpan-bahan',
      popover: {
        title: '💾 Simpan Bahan',
        description: 'Klik "Tambah Bahan" untuk menyimpan. Setelah tersimpan, bahan akan muncul di tabel dan bisa dipilih saat membuat resep.',
        side: 'top',
      },
    },
  ],

  resep: [
    {
      element: '#resep-header',
      popover: {
        title: '🍽️ Halaman Resep & Menu',
        description: 'Di sini kamu buat semua menu yang dijual — kue, masakan, minuman, snack. Setiap menu bisa punya foto, daftar bahan, dan harga jual.',
        side: 'bottom',
      },
    },
    {
      element: '#filter-kategori-resep',
      popover: {
        title: '🔍 Filter Kategori',
        description: 'Gunakan filter ini untuk melihat menu berdasarkan kategori: Kue, Masakan, Minuman, Snack, atau Lainnya.',
        side: 'bottom',
      },
    },
    {
      element: '#btn-tambah-resep',
      popover: {
        title: '➕ Tambah Menu Baru',
        description: 'Klik di sini untuk membuat menu baru. Pastikan kamu sudah menambahkan bahan baku terlebih dahulu agar HPP bisa dihitung.',
        side: 'left',
      },
    },
    {
      element: '#form-foto-resep',
      popover: {
        title: '📷 Foto Menu',
        description: 'Upload foto produkmu — akan disimpan di server dan ditampilkan di kartu menu. Foto membuat katalog lebih menarik!',
        side: 'right',
      },
    },
    {
      element: '#form-nama-resep',
      popover: {
        title: '✏️ Nama & Kategori',
        description: 'Isi nama menu dan pilih kategori yang sesuai. Kategori mempengaruhi tampilan di dashboard dan filter.',
        side: 'bottom',
      },
    },
    {
      element: '#form-harga-resep',
      popover: {
        title: '💰 Harga Jual',
        description: 'Harga jual per porsi/pcs. Setelah kamu pilih bahan-bahan di bawah, HPP akan dihitung otomatis dan kamu bisa lihat estimasi margin.',
        side: 'bottom',
      },
    },
    {
      element: '#form-bahan-resep',
      popover: {
        title: '🧂 Daftar Bahan',
        description: 'Tambahkan bahan-bahan yang dipakai untuk 1 porsi/pcs menu ini. Pilih bahan dari dropdown, lalu isi jumlahnya. HPP otomatis terhitung dari harga × jumlah tiap bahan.',
        side: 'top',
      },
    },
  ],

  klien: [
    {
      element: '#klien-header',
      popover: {
        title: '🏪 Halaman Klien & Toko',
        description: 'Catat toko dan klien yang secara rutin memesan produk Alvian\'s Kitchen. Data klien akan muncul saat mencatat penjualan dan di laporan.',
        side: 'bottom',
      },
    },
    {
      element: '#btn-tambah-klien',
      popover: {
        title: '➕ Tambah Klien',
        description: 'Klik untuk mendaftarkan toko atau klien baru. Cukup nama sudah cukup — alamat dan telepon opsional.',
        side: 'left',
      },
    },
    {
      element: '#form-nama-klien',
      popover: {
        title: '🏪 Nama Toko / Klien',
        description: 'Isi nama toko atau klien. Contoh: "Toko Bu Sari", "Warung Pak Budi", "Kantin SD 01", "Perorangan".',
        side: 'bottom',
      },
    },
    {
      element: '#form-kontak-klien',
      popover: {
        title: '📞 Kontak & Alamat',
        description: 'Nomor telepon dan alamat lengkap toko. Ini membantu kamu menghubungi klien saat ada keperluan pengiriman atau pesanan mendadak.',
        side: 'bottom',
      },
    },
    {
      element: '#btn-simpan-klien',
      popover: {
        title: '💾 Simpan Klien',
        description: 'Setelah disimpan, nama klien akan tersedia sebagai pilihan saat mencatat penjualan dan muncul di laporan per klien.',
        side: 'top',
      },
    },
  ],

  penjualan: [
    {
      element: '#penjualan-header',
      popover: {
        title: '🛒 Halaman Penjualan & Laporan',
        description: 'Halaman ini punya dua fungsi: catat transaksi harian dan lihat laporan lengkap per klien. Semuanya terintegrasi dalam satu tempat.',
        side: 'bottom',
      },
    },
    {
      element: '#tabs-penjualan',
      popover: {
        title: '📋 Dua Tab Utama',
        description: '• Tab Transaksi → input dan lihat data penjualan\n• Tab Laporan per Klien → analisis HPP, laba bersih, dan download Excel\n\nFilter tanggal & klien berlaku untuk keduanya.',
        side: 'bottom',
      },
    },
    {
      element: '#filter-penjualan',
      popover: {
        title: '🔍 Filter Data',
        description: 'Filter berdasarkan rentang tanggal dan/atau klien tertentu. Klik "Terapkan" untuk memuat data. Berlaku di tab Transaksi maupun Laporan.',
        side: 'bottom',
      },
    },
    {
      element: '#btn-catat-penjualan',
      popover: {
        title: '➕ Catat Penjualan',
        description: 'Klik untuk mencatat transaksi baru. Isi:\n• Tanggal transaksi\n• Klien / toko (opsional)\n• Produk yang dijual\n• Jumlah pesanan vs jumlah terjual\n• Harga jual per pcs',
        side: 'left',
      },
    },
    {
      element: '#info-sisa-pesanan',
      popover: {
        title: '📊 Pesanan vs Terjual vs Sisa',
        description: '• Pesanan = qty yang dipesan klien\n• Terjual = yang benar-benar laku terjual\n• Sisa = otomatis dihitung (pesanan − terjual)\n\nIni penting untuk tracking produk tidak terjual.',
        side: 'top',
      },
    },
    {
      element: '#tab-laporan-info',
      popover: {
        title: '📈 Tab Laporan per Klien',
        description: 'Di tab Laporan, data dikelompokkan per klien. Setiap baris punya:\n• Total pendapatan\n• Total HPP (biaya bahan)\n• Laba bersih (pendapatan − HPP)\n\nKlik "Download Excel" untuk export ke spreadsheet.',
        side: 'top',
      },
    },
  ],

  hpp: [
    {
      element: '#hpp-header',
      popover: {
        title: '📊 Analisis HPP',
        description: 'HPP = Harga Pokok Produksi. Halaman ini menampilkan perbandingan biaya bahan vs harga jual untuk setiap menu.',
        side: 'bottom',
      },
    },
    {
      element: '#hpp-table',
      popover: {
        title: '📋 Tabel Ringkasan',
        description: 'Setiap baris menampilkan:\n• HPP (total biaya bahan per porsi)\n• Harga jual\n• Keuntungan per pcs\n• Persentase margin dengan progress bar',
        side: 'top',
      },
    },
    {
      element: '#hpp-margin-info',
      popover: {
        title: '🎨 Kode Warna Margin',
        description: '🟢 Hijau (≥30%) = Margin bagus, harga jual sudah tepat\n🟡 Kuning (15–30%) = Cukup, bisa ditingkatkan\n🔴 Merah (<15%) = Perlu evaluasi — naikkan harga atau kurangi biaya bahan',
        side: 'top',
      },
    },
    {
      element: '#hpp-detail-btn',
      popover: {
        title: '🔍 Tombol Rincian',
        description: 'Klik "Rincian" di kolom paling kanan untuk melihat breakdown HPP per bahan baku — berapa porsi tiap bahan dan berapa kontribusinya ke total HPP.',
        side: 'left',
      },
    },
  ],
}

export function useAppTour() {
  const route = useRoute()

  function currentPage(): TourPage {
    const p = route.path
    if (p.startsWith('/bahan-baku')) return 'bahan-baku'
    if (p.startsWith('/resep')) return 'resep'
    if (p.startsWith('/klien')) return 'klien'
    if (p.startsWith('/penjualan')) return 'penjualan'
    if (p.startsWith('/hpp')) return 'hpp'
    return 'global'
  }

  function startTour(page?: TourPage) {
    const p = page ?? currentPage()
    const steps = tourSteps[p]
    const d = makeDriver(steps, () => {
      if (import.meta.client) localStorage.setItem(STORAGE_KEY(p), '1')
    })
    d.drive()
  }

  function autoStartIfNew() {
    if (!import.meta.client) return
    const p = currentPage()
    if (!localStorage.getItem(STORAGE_KEY(p))) {
      localStorage.setItem(STORAGE_KEY(p), '1') // set dulu agar tidak muncul lagi walau navigasi saat tour jalan
      setTimeout(() => startTour(p), 600)
    }
  }

  return { startTour, autoStartIfNew }
}
