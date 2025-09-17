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

// --- TAMBAHKAN TIPE DATA BARU DI SINI ---
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

export interface ProgramStudi {
  id: string;
  nama: string;
  jenjang: string;
  pt: string;
  pt_singkat: string;
}