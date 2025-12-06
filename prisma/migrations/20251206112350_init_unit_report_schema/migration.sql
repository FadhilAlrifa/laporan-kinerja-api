-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "unitKerjaId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_unitKerjaId_fkey" FOREIGN KEY ("unitKerjaId") REFERENCES "UnitKerja" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UnitKerja" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "LaporanKinerja" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tanggal" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "target" REAL NOT NULL,
    "realisasi" REAL NOT NULL,
    "keterangan" TEXT,
    "unitKerjaId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LaporanKinerja_unitKerjaId_fkey" FOREIGN KEY ("unitKerjaId") REFERENCES "UnitKerja" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "KategoriKinerja" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nama" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "LaporanKinerjaKategoriKinerja" (
    "laporanKinerjaId" INTEGER NOT NULL,
    "kategoriKinerjaId" INTEGER NOT NULL,
    "nilai" REAL,

    PRIMARY KEY ("laporanKinerjaId", "kategoriKinerjaId"),
    CONSTRAINT "LaporanKinerjaKategoriKinerja_laporanKinerjaId_fkey" FOREIGN KEY ("laporanKinerjaId") REFERENCES "LaporanKinerja" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LaporanKinerjaKategoriKinerja_kategoriKinerjaId_fkey" FOREIGN KEY ("kategoriKinerjaId") REFERENCES "KategoriKinerja" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UnitKerja_nama_key" ON "UnitKerja"("nama");

-- CreateIndex
CREATE INDEX "UnitKerja_nama_idx" ON "UnitKerja"("nama");

-- CreateIndex
CREATE INDEX "LaporanKinerja_tanggal_idx" ON "LaporanKinerja"("tanggal");

-- CreateIndex
CREATE INDEX "LaporanKinerja_unitKerjaId_idx" ON "LaporanKinerja"("unitKerjaId");

-- CreateIndex
CREATE UNIQUE INDEX "LaporanKinerja_tanggal_unitKerjaId_key" ON "LaporanKinerja"("tanggal", "unitKerjaId");

-- CreateIndex
CREATE UNIQUE INDEX "KategoriKinerja_nama_key" ON "KategoriKinerja"("nama");
