/* =====================================================================
   DEMO-BRIDGE.JS  -  hanya untuk versi demo online.
   Menyediakan window.desktop (jalur yang sama dengan aplikasi Electron),
   tetapi datanya disimpan di localStorage browser. Folder kotak surat
   disimulasikan, sehingga Staf LP dan Master Admin saling terhubung.
   Aplikasi asli (StafLP.html, MasterAdmin.html) tidak diubah sama sekali.
   ===================================================================== */
(function () {
  "use strict";
  var PFX = "ksdemo2:";
  var FOLDER = "\\\\PC-ADMIN\\KotakSurat (demo)";
  var MEM = {};                                   /* cadangan jika localStorage ditolak */
  var LS = {
    get: function (k) { try { var v = localStorage.getItem(PFX + k); return v == null ? (MEM[k] == null ? null : MEM[k]) : v; } catch (e) { return MEM[k] == null ? null : MEM[k]; } },
    set: function (k, v) { MEM[k] = v; try { localStorage.setItem(PFX + k, v); } catch (e) {} },
    del: function (k) { delete MEM[k]; try { localStorage.removeItem(PFX + k); } catch (e) {} },
    ok: (function () { try { localStorage.setItem(PFX + "t", "1"); localStorage.removeItem(PFX + "t"); return true; } catch (e) { return false; } })()
  };
  var jget = function (k, d) { var v = LS.get(k); if (v == null) return d; try { return JSON.parse(v); } catch (e) { return d; } };
  var jset = function (k, v) { LS.set(k, JSON.stringify(v)); };

  /* Nama aplikasi menentukan ruang simpan (Staf LP dan Admin terpisah, seperti di dua PC). */
  var path = (location.pathname || "").toLowerCase();
  var APP = "app";

  function lapor(msg, tipe) { try { if (typeof window.toast === "function") window.toast(msg, tipe || ""); } catch (e) {} }

  /* ---------------- data fiktif ---------------- */
  var ANGGOTA = [
    { n: "ANTONIUS BUJANG",  ba: "01-05-037-00001302", t: "2016-02-15", lahir: "1975-11-02", riwayat: 3, tunggak: 0 },
    { n: "BERNADUS ULIN",    ba: "01-05-037-00001777", t: "2021-03-08", lahir: "1979-12-11", riwayat: 3, tunggak: 0 },
    { n: "ELISABET NURI",    ba: "01-05-037-00002015", t: "2018-05-30", lahir: "1992-02-03", riwayat: 4, tunggak: 0 },
    { n: "FRANSISKUS LEJU",  ba: "01-05-037-00001904", t: "2013-07-22", lahir: "1983-08-19", riwayat: 5, tunggak: 0 },
    { n: "KRISTINA DAYANG",  ba: "01-05-037-00002237", t: "2023-02-14", lahir: "1998-10-27", riwayat: 3, tunggak: 0 },
    { n: "MARIA SUMIATI",    ba: "01-05-037-00001188", t: "2019-08-12", lahir: "1990-07-21", riwayat: 4, tunggak: 0 },
    { n: "PAULUS AJAT",      ba: "01-05-037-00001530", t: "2008-06-20", lahir: "1968-01-30", riwayat: 2, tunggak: 0 },
    { n: "STEFANUS AMAN",    ba: "01-05-037-00002126", t: "2005-11-11", lahir: "1966-04-05", riwayat: 5, tunggak: 0 },
    { n: "SUSANTI",          ba: "01-05-037-00001642", t: "2014-10-05", lahir: "1985-09-17", riwayat: 5, tunggak: 0 },
    { n: "THERESIA INAS",    ba: "01-05-037-00001893", t: "2010-01-18", lahir: "1987-06-25", riwayat: 1, tunggak: 120 },
    { n: "VERONIKA LINA",    ba: "01-05-037-00001415", t: "2026-09-01", lahir: "1995-04-09", riwayat: 3, tunggak: 0 },
    { n: "YOHANES ADING",    ba: "01-05-037-00001021", t: "2011-03-14", lahir: "1982-03-14", riwayat: 5, tunggak: 0 }
  ];
  var KANTOR = { kop: "KSP CU SEMANDANG JAYA", kode: "001", nama: "HEAD OFFICE", alamat: "Jl. Trans Kalimantan No. 25 Balai Semandang Kec. Simpang Hulu Kab. Ketapang Kal-Bar" };

  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function iso(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function hariLalu(h) { var d = new Date(); d.setDate(d.getDate() - h); d.setHours(9, 15, 0, 0); return d; }
  function lama(t, ref) {
    var a = new Date(t), m = (ref.getFullYear() - a.getFullYear()) * 12 + (ref.getMonth() - a.getMonth()) - (ref.getDate() < a.getDate() ? 1 : 0);
    if (m < 0) m = 0; return Math.floor(m / 12) + " Tahun " + (m % 12) + " Bulan";
  }
  function angsuranPertama(P, n, bungaPct, metode) {
    var r = bungaPct / 100, pokok, bunga;
    if (metode === "annuitas") { var tot = P * r / (1 - Math.pow(1 + r, -n)); bunga = P * r; pokok = tot - bunga; }
    else { pokok = Math.floor(P / n / 1000) * 1000; bunga = P * r; }
    return { pokok: Math.round(pokok), bunga: Math.round(bunga) };
  }
  var PG = ["gaji","pasangan","usaha","sawit","walet","karet","warung","sewa","lain"];
  var PK = ["belanja","listrik","transport","sekolah","kesehatan","asuransi","angs_bank","angs_kendaraan","kos","servis","tabungan","angs_cu"];
  var AS = ["tab_cu_lain","tab_bank","rumah_tinggal","rumah_kontrakan","tanah_kosong","kebun_sawit","kebun_karet","sawah","mobil","motor","perhiasan","lain"];
  var HT = ["pasangan","cu_lain","bank","rumah","kendaraan","toko"];
  function blok(keys, isi) { var o = {}, t = 0; keys.forEach(function (k) { o[k] = isi[k] || 0; t += o[k]; }); return [o, t]; }

  function buatPengajuan(c) {
    var a = ANGGOTA.filter(function (x) { return x.n === c.nama; })[0];
    var dibuat = hariLalu(c.hari), id = dibuat.getFullYear() + pad(dibuat.getMonth() + 1) + pad(dibuat.getDate()) + "-" + pad(dibuat.getHours()) + pad(dibuat.getMinutes()) + "00-" + c.kodeAcak;
    var cara = { "100": ["Flat", "flat"], "200": ["Menurun", "menurun"], "300": ["Annuitas", "annuitas"] }[c.cara];
    var jenisNama = { "301": "Pjm Modal Usaha (P-1)", "307": "Pjm Membeli Rumah / Ruko (P-7)", "312": "Pjm Tambah Saham (P-12)" }[c.jenis];
    var ang = angsuranPertama(c.jumlah, c.jangka, c.bunga, cara[1]);
    var simp = c.saham + c.taman, tab = 50000;
    var pg = blok(PG, c.pg), pk = blok(PK, c.pk), as = blok(AS, c.as), ht = blok(HT, c.ht || {});
    var saldo = 0, jml = 0; (c.berjalan || []).forEach(function (x) { saldo += x.saldo; jml += x.jml; });
    var asetTot = simp + as[1], hutTot = saldo + ht[1];
    var jam = { nama_barang: "", legalitas: "", atas_nama: "", hubungan: "", nomor: "", luas: "", jarak: "", batas_utara: "", batas_selatan: "", batas_barat: "", batas_timur: "", nilai_taksiran: 0 };
    for (var k in (c.jaminan || {})) jam[k] = c.jaminan[k];
    return {
      jenis: "pengajuan", versi: 2, id: id, dibuat: dibuat.toISOString(), staf: c.staf, kantor: { kode: c.kantorKode, nama: c.kantorNama },
      anggota: { nama: a.n, no_ba: a.ba, tgl_jadi_anggota: a.t, anggota_baru: false },
      lama_anggota: lama(a.t, dibuat), pinjaman_ke: c.ke, tgl_pengajuan: iso(dibuat), jumlah: c.jumlah, terbilang: "", tujuan: c.tujuan, riwayat_bayar: c.riwayatBayar, tunggakan_hari: c.tunggak || 0,
      jenis_pinjaman: { kode: c.jenis, nama: jenisNama },
      cara_pembayaran: { kode: c.cara, nama: cara[0], metode: cara[1] },
      jangka_bulan: c.jangka, suku_bunga_persen_per_bulan: c.bunga,
      plafon: { simpanan: simp, persen: c.persen, selisih: simp - c.jumlah * c.persen / 100, plafon_seharusnya: Math.round(simp / (c.persen / 100)) },
      rincian: { angsuran_pokok: ang.pokok, bunga: ang.bunga, tabungan: tab, jumlah: ang.pokok + ang.bunga + tab },
      pinjaman_berjalan: c.berjalan || [], total_saldo_berjalan: saldo, total_jml_berjalan: jml,
      wawancara: {
        versi: 2, modal: { saham: c.saham, taman: c.taman }, tanggungan: c.tanggungan, tunggakan_bunga: 0, lapangan: c.lap,
        penjamin: c.penjamin || { nama: "", no_ba: "" }, jaminan: jam,
        penghasilan: pg[0], pengeluaran: pk[0], aset: as[0], hutang: ht[0],
        total: { aset: asetTot, hutang: hutTot, aset_bersih: asetTot - hutTot, penghasilan: pg[1], pengeluaran: pk[1], penghasilan_bersih: pg[1] - pk[1] }
      }
    };
  }
  function namaFile(p) { return "PENGAJUAN_" + p.id.slice(0, 15) + "_" + p.anggota.nama.replace(/[^A-Z0-9]+/g, "_") + "_" + p.id.slice(-4) + ".json"; }

  var CONTOH = [
    { nama: "YOHANES ADING", riwayatBayar: 5, tunggak: 0, lap: { kerja: "5", sumber: "bulanan", tinggal: "2", setuju: "1", legal: "1", aman: "1" }, hari: 8, kodeAcak: "A1Y7", staf: "AGUSTINUS", kantorKode: "002", kantorNama: "KC BALAI SEBUT", ke: 3,
      jumlah: 60000000, tujuan: "Tambah modal perawatan kebun sawit", jenis: "301", cara: "200", jangka: 36, bunga: 1.2, persen: 30, saham: 3000000, taman: 15500000, tanggungan: 3,
      berjalan: [{ rek: "301-0001021-02", desk: "Pjm Modal Usaha (P-1)", saldo: 6000000, jml: 30000000 }],
      pg: { sawit: 7500000, pasangan: 2000000 }, pk: { belanja: 2500000, listrik: 300000, transport: 400000, sekolah: 800000, angs_cu: 1650000 },
      as: { rumah_tinggal: 120000000, kebun_sawit: 150000000, motor: 15000000 },
      jaminan: { nama_barang: "Kebun sawit 2 ha", legalitas: "SHM", atas_nama: "Yohanes Ading", hubungan: "Sendiri", nomor: "SHM 00412", luas: "2 ha", jarak: "4 km", nilai_taksiran: 85000000 } },
    { nama: "MARIA SUMIATI", riwayatBayar: 4, tunggak: 0, lap: { kerja: "5", sumber: "bulanan", tinggal: "1", setuju: "1", legal: "1", aman: "1" }, hari: 6, kodeAcak: "B2M4", staf: "FRANSISKA", kantorKode: "001", kantorNama: "HEAD OFFICE", ke: 1,
      jumlah: 80000000, tujuan: "Membeli rumah tinggal", jenis: "307", cara: "300", jangka: 60, bunga: 1.0, persen: 30, saham: 2000000, taman: 7000000, tanggungan: 2,
      pg: { gaji: 4800000, pasangan: 2500000 }, pk: { belanja: 2200000, listrik: 250000, transport: 300000, sekolah: 500000, asuransi: 150000 },
      as: { tab_bank: 5000000, motor: 12000000 },
      jaminan: { nama_barang: "Rumah yang dibeli", legalitas: "SHM", atas_nama: "Maria Sumiati", hubungan: "Sendiri", nomor: "SHM 01177", luas: "300 m2", jarak: "2 km", nilai_taksiran: 100000000 } },
    { nama: "THERESIA INAS", riwayatBayar: 1, tunggak: 120, lap: { kerja: "3", sumber: "bulanan", tinggal: "2", setuju: "1", legal: "1", aman: "1" }, hari: 5, kodeAcak: "C3T9", staf: "YULIANUS", kantorKode: "003", kantorNama: "KC NANGA TAMAN", ke: 2,
      jumlah: 15000000, tujuan: "Membeli mesin jahit baru", jenis: "301", cara: "100", jangka: 24, bunga: 1.5, persen: 30, saham: 1000000, taman: 2000000, tanggungan: 2,
      berjalan: [{ rek: "301-0001893-01", desk: "Pjm Modal Usaha (P-1)", saldo: 12000000, jml: 20000000 }],
      pg: { usaha: 3500000 }, pk: { belanja: 1500000, listrik: 200000, transport: 150000, angs_cu: 1100000 },
      as: { rumah_tinggal: 60000000, motor: 8000000 },
      jaminan: { nama_barang: "Sepeda motor", legalitas: "BPKB", atas_nama: "Theresia Inas", hubungan: "Sendiri", nilai_taksiran: 8000000 } },
    { nama: "ANTONIUS BUJANG", riwayatBayar: 3, tunggak: 0, lap: { kerja: "5", sumber: "bulanan", tinggal: "2", setuju: "1", legal: "1", aman: "1" }, hari: 2, kodeAcak: "D4A2", staf: "FRANSISKA", kantorKode: "001", kantorNama: "HEAD OFFICE", ke: 4,
      jumlah: 50000000, tujuan: "Tambah stok toko sembako", jenis: "301", cara: "200", jangka: 36, bunga: 1.2, persen: 30, saham: 4000000, taman: 8000000, tanggungan: 4,
      berjalan: [{ rek: "301-0001302-03", desk: "Pjm Modal Usaha (P-1)", saldo: 25000000, jml: 50000000 }],
      pg: { warung: 8000000 }, pk: { belanja: 2500000, listrik: 400000, transport: 300000, sekolah: 1000000, angs_cu: 2400000 },
      as: { rumah_tinggal: 150000000, rumah_kontrakan: 90000000, motor: 10000000 },
      jaminan: { nama_barang: "Ruko 1 pintu", legalitas: "SHM", atas_nama: "Antonius Bujang", hubungan: "Sendiri", nomor: "SHM 00988", luas: "120 m2", nilai_taksiran: 70000000 } },
    { nama: "PAULUS AJAT", riwayatBayar: 2, tunggak: 0, lap: { kerja: "3", sumber: "bulanan", tinggal: "2", setuju: "1", legal: "1", aman: "0" }, hari: 1, kodeAcak: "E5P6", staf: "AGUSTINUS", kantorKode: "002", kantorNama: "KC BALAI SEBUT", ke: 1,
      jumlah: 15000000, tujuan: "Renovasi dapur", jenis: "301", cara: "100", jangka: 24, bunga: 1.5, persen: 30, saham: 1000000, taman: 1500000, tanggungan: 3,
      pg: { gaji: 2400000, karet: 900000 }, pk: { belanja: 1300000, listrik: 150000, transport: 200000, sekolah: 300000 },
      as: { rumah_tinggal: 45000000, kebun_karet: 30000000, motor: 6000000 },
      jaminan: { nama_barang: "Sepeda motor", legalitas: "BPKB", atas_nama: "Paulus Ajat", hubungan: "Sendiri", nilai_taksiran: 12000000 } }
  ];

  function seed() {
    var daftar = ANGGOTA.map(function (a) { return { n: a.n, ba: a.ba, t: a.t, l: a.lahir }; });
    var dibuat = hariLalu(10).toISOString();
    var peng = CONTOH.map(buatPengajuan);
    jset("kv:users", [
      { u: "admin", nama: "ADMIN DEMO", peran: "admin", setPin: "0000" },
      { u: "staf", nama: "STAF DEMO", peran: "staf", setPin: "1111" }
    ]);
    jset("kv:kantor", KANTOR);
    jset("kv:anggota", { daftar: daftar, dibuat: dibuat });
    jset("kv:folderPath", FOLDER);
    jset("kv:riwayat", []);
    jset("kv:peng", peng.slice(0, 3).map(function (p) { return { id: p.id, impor: hariLalu(4).toISOString(), selesai: false, file: namaFile(p), data: p }; }));
    jset("kv:baru", []);
    jset("kotak", peng.slice(3).map(function (p) { return { nama: namaFile(p), teks: JSON.stringify(p, null, 1), waktu: p.dibuat, pindah: false }; }));
    var nilai = {}, kep = {};
    nilai[peng[0].id] = { K3: 2, K4: 1, K5: 0, K7: 1, K8: 1, K9: 1, M1: 1.5, M3: 1, M4: 1, J1: 1, J3: 1, J4: 0 };
    nilai[peng[2].id] = { K3: 0, K4: 1, K5: 0, K7: 1, K8: 1, K9: 1, M3: 0, M4: 0, J1: 1, J3: 1 };
    kep[peng[0].id] = { hasil: "Disetujui", plafon: 60000000, catatan: "Sesuai pengajuan.", oleh: "Komite Kredit KC", tgl: hariLalu(3).toISOString() };
    kep[peng[2].id] = { hasil: "Ditolak", plafon: 0, catatan: "Selesaikan tunggakan lebih dulu.", oleh: "Komite Kredit KC", tgl: hariLalu(3).toISOString() };
    jset("kv:nilai5c", nilai); jset("kv:keputusan", kep);
    LS.set("seeded", "app2");
  }
  function reset() {
    try { Object.keys(localStorage).forEach(function (k) { if (k.indexOf(PFX) === 0) localStorage.removeItem(k); }); } catch (e) {}
    MEM = {}; seed();
  }
  if (LS.get("seeded") !== "app2") reset();

  /* ---------------- window.desktop ---------------- */
  function kvKey(k) { if (!/^[A-Za-z0-9_-]{1,40}$/.test(String(k))) throw new Error("Kunci tidak valid."); return "kv:" + k; }
  function cekFolder(dir) { if (!dir || !String(dir).trim()) throw new Error("Alamat folder kotak surat belum diisi."); }
  var desktop = {
    ada: true,
    demo: true,
    kvGet: function (k) { return Promise.resolve(jget(kvKey(k), undefined)); },
    kvSet: function (k, v) { jset(kvKey(k), v); return Promise.resolve(true); },
    tulis: function (dir, nama, teks) {
      return new Promise(function (res, rej) {
        try {
          cekFolder(dir);
          var kotak = jget("kotak", []);
          if (kotak.some(function (f) { return f.nama === nama; })) throw new Error("File dengan nama itu sudah ada.");
          if (/^_TES_/.test(nama)) { lapor("Tes berhasil: file tes masuk ke kotak surat (simulasi).", "ok"); return res(true); }
          kotak.push({ nama: nama, teks: String(teks), waktu: new Date().toISOString(), pindah: false });
          jset("kotak", kotak);
          lapor("File " + nama + " masuk ke kotak surat. Buka Master Admin untuk mengimpor.", "ok");
          res(true);
        } catch (e) { rej(e); }
      });
    },
    daftarJson: function (dir) {
      return new Promise(function (res, rej) {
        try { cekFolder(dir); res(jget("kotak", []).filter(function (f) { return !f.pindah && /\.json$/i.test(f.nama) && f.nama.charAt(0) !== "_"; }).map(function (f) { return { nama: f.nama, teks: f.teks }; })); }
        catch (e) { rej(e); }
      });
    },
    pindah: function (dir, nama) {
      var kotak = jget("kotak", []);
      kotak.forEach(function (f) { if (f.nama === nama) f.pindah = true; });
      jset("kotak", kotak); return Promise.resolve(true);
    },
    pilihFolder: function () { return Promise.resolve(FOLDER); },
    pilihanTeks: function () { return null; }
  };
  window.desktop = desktop;

  /* API kecil untuk portal dan halaman Analisa Kelayakan */
  window.KSDEMO = { jget: jget, jset: jset, reset: reset, app: APP, penyimpananOk: LS.ok, folder: FOLDER };

  /* Dialog bawaan browser diblokir di demo online: konfirmasi dianggap "Ya". */
  window.confirm = function () { return true; };
  window.alert = function (m) { lapor(String(m), ""); };

  /* Unduhan diblokir di demo online. Daftar anggota dari Master Admin langsung dikirim ke Staf LP. */
  var asliClick = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function () {
    if (!this.download) return asliClick.apply(this, arguments);
    var nama = this.download, href = this.href;
    fetch(href).then(function (r) { return r.text(); }).then(function (teks) {
      var j = null; try { j = JSON.parse(teks); } catch (e) {}
      var arr = j && (Array.isArray(j) ? j : j.anggota);
      if (Array.isArray(arr) && arr.length && arr[0].n) {
        
        lapor("Demo online tidak bisa mengunduh file. Di kantor, " + nama + " tersimpan di komputer lalu diberikan ke perangkat staf (" + arr.length + " anggota).", "");
      } else {
        lapor("Demo online tidak bisa mengunduh file (" + nama + "). Di aplikasi kantor, file ini tersimpan di komputer.", "");
      }
    }).catch(function () { lapor("Demo online tidak bisa mengunduh file " + nama + ".", ""); });
  };
})();
