// app/types.ts

export interface Mahasiswa {
  id: string;
  nama: string;
  nim: string;
  nama_pt: string;
  nama_prodi: string;
}

export interface MahasiswaDetail {
    id: string;
    nama: string;
    nim: string;
    nama_pt: string;
    kode_pt: string;
    prodi: string;
    kode_prodi: string;
    jenis_daftar: string;
    jenis_kelamin: string;
    jenjang: string;
    status_saat_ini: string;
    tanggal_masuk: string;
}

// --- TIPE DATA BARU DITAMBAHKAN DI SINI ---
export interface Dosen {
  id: string;
  nama: string;
  nidn: string;
  nuptk: string;
  nama_pt: string;
  sinkatan_pt: string;
  nama_prodi: string;
}

export interface PerguruanTinggi {
  id: string;
  kode: string;
  nama_singkat: string;
  nama: string;
}

export interface PerguruanTinggiDetail {
  kelompok: string;
  pembina: string;
  id_sp: string;
  kode_pt: string;
  email: string;
  no_tel: string;
  no_fax: string;
  website: string;
  alamat: string;
  nama_pt: string;
  nm_singkat: string;
  kode_pos: string;
  provinsi_pt: string;
  kab_kota_pt: string;
  kecamatan_pt: string;
  lintang_pt: number;
  bujur_pt: number;
  tgl_berdiri_pt: string;
  tgl_sk_pendirian_sp: string;
  sk_pendirian_sp: string;
  status_pt: string;
  akreditasi_pt: string;
  status_akreditasi: string;
}

export interface ProgramStudi {
  id: string;
  nama: string;
  jenjang: string;
  pt: string;
  pt_singkat: string;
}

export interface ProgramStudiDetail {
  id_sp: string;
  id_sms: string;
  nama_pt: string;
  kode_pt: string;
  nama_prodi: string;
  kode_prodi: string;
  kel_bidang: string;
  jenj_didik: string;
  tgl_berdiri: string;
  tgl_sk_selenggara: string;
  sk_selenggara: string;
  no_tel: string;
  no_fax: string;
  website: string;
  email: string;
  alamat: string;
  provinsi: string;
  kab_kota: string;
  kecamatan: string;
  lintang: number;
  bujur: number;
  status: string;
  akreditasi: string;
  akreditasi_internasional: string;
  status_akreditasi: string;
}