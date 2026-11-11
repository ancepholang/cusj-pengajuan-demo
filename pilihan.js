/* ==========================================================================
   PILIHAN.JS  -  Data pilihan untuk aplikasi Staf LP (KSP CU Semandang Jaya)
   --------------------------------------------------------------------------
   Buka dengan Notepad. Untuk menambah Jenis Pinjaman baru, cukup salin satu
   baris lalu ubah kode dan namanya. Tidak perlu mengubah file lain.
   Pastikan setiap baris diakhiri koma dan tanda kutip tidak terhapus.
   ========================================================================== */
window.PILIHAN = {

  /* Identitas kantor bawaan. Bisa juga diisi langsung di aplikasi (tab Pengaturan dan Riwayat).
     Jika ingin file siap pakai per kantor, ubah di sini sebelum dibagikan. Hapus bagian ini jika tidak dipakai. */
  kantor: { koperasi: "KSP CU SEMANDANG JAYA", kode: "001", nama: "HEAD OFFICE", alamat: "Jl. Trans Kalimantan No. 25 Balai Semandang Kec. Simpang Hulu Kab. Ketapang Kal-Bar" },

  /* Baris kop surat di Form Pengajuan (alamat kantor diambil dari Pengaturan).
     kota = tempat tanda tangan pemohon. */
  kopSurat: {
    badanHukum: "Badan Hukum : 82/BH/IX.6   Tanggal 3 September 2001",
    nomorAhu:   "Nomor : AHU-0004814.AH.01.28.  Tanggal 22 Oktober 2021",
    telp:       "Kode Pos : 78854 - Telp. 082262493090",
    email:      "E-mail: semandang91@yahoo.com, Website: cusemandangjaya.com",
    kota:       "Balai Semandang"
  },

  /* Biaya administrasi pinjaman (%) di sheet Panduan Pengajuan */
  administrasiPersen: 2,

  /* [ "kode", "nama jenis pinjaman" ] */
  jenisPinjaman: [
    ["301", "Pjm Modal Usaha (P-1)"],
    ["307", "Pjm Membeli Rumah / Ruko (P-7)"],
    ["312", "Pjm Tambah Saham (P-12)"]
    /* Tambahkan baris baru di atas baris ini, contoh:
    ["302", "Pjm Konsumtif (P-2)"],                                        */
  ],

  /* [ "kode", "nama", "metode hitung" ]
     metode hitung hanya boleh salah satu: flat, menurun, annuitas        */
  caraPembayaran: [
    ["100", "Flat",     "flat"],
    ["200", "Menurun",  "menurun"],
    ["300", "Annuitas", "annuitas"]
  ],

  /* Nilai awal kolom "Tabungan Setiap Bulan" (Rp) */
  tabunganDefault: 50000,

  /* Angsuran pokok dibulatkan ke bawah ke kelipatan ini (Rp).
     Sama seperti rumus FLOOR(...,1000) di Excel.                          */
  pembulatanPokok: 1000
};
