
import * as dotenv from 'dotenv'; 
dotenv.config(); 

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Memulai proses seeding...');

  const passwordHash = await bcrypt.hash('password123', 10);

  const unit1 = await prisma.unitKerja.create({
    data: { nama: 'Produksi Pabrik A' },
  });
  await prisma.unitKerja.create({ 
    data: { nama: 'Pemasaran & Penjualan' },
  });
  const unit3 = await prisma.unitKerja.create({
    data: { nama: 'Keuangan & Administrasi' },
  });
  console.log('3 Unit Kerja berhasil dibuat.');

  const userList = [
    {
      name: 'Super Admin',
      email: 'superadmin@perusahaan.com',
      password: passwordHash,
      role: 'SUPER_USER',
      unitKerjaId: null,
    },
    {
      name: 'Entry User Pabrik A',
      email: 'entry.pabrik@perusahaan.com',
      password: passwordHash,
      role: 'ENTRY_USER',
      unitKerjaId: unit1.id, 
    },
    {
      name: 'User Keuangan',
      email: 'user.keuangan@perusahaan.com',
      password: passwordHash,
      role: 'USER',
      unitKerjaId: unit3.id,
    },
  ];

  await prisma.user.createMany({
    data: userList,
  });
  console.log('3 User berhasil dibuat (Password: password123).');


  // 3. SEED KATEGORI KINERJA
  const kategoriList = [
    { nama: 'Volume Produksi' },
    { nama: 'Safety Score' },
    { nama: 'Waktu Downtime Mesin' },
    { nama: 'Tingkat Kepuasan Pelanggan' },
    { nama: 'Efisiensi Biaya' },
  ];

  await prisma.kategoriKinerja.createMany({
    data: kategoriList,
  });
  console.log('5 Kategori Kinerja berhasil dibuat.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });