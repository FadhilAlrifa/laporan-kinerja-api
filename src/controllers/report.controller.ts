import { Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

const handleKategori = (laporanId: number, kategoriData: any[]) => {
    return kategoriData.map((item) => ({
        laporanKinerjaId: laporanId,
        kategoriKinerjaId: item.kategoriKinerjaId,
        nilai: item.nilai,
    }));
};

export const createReport = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { tanggal, target, realisasi, keterangan, unitKerjaId, kategori } = req.body;
    const user = req.user!;
    
    if (user.role !== 'SUPER_USER' && user.role !== 'ENTRY_USER') {
        return next({ statusCode: 403, message: 'Hanya Entry User dan Super User yang dapat membuat laporan.' });
    }

    if (user.role === 'ENTRY_USER' && user.unitKerjaId !== unitKerjaId) {
        return next({ statusCode: 403, message: 'Entry User hanya dapat membuat laporan untuk Unit Kerjanya sendiri.' });
    }

    try {
        const newReport = await prisma.laporanKinerja.create({
            data: {
                tanggal: new Date(tanggal), 
                target,
                realisasi,
                keterangan,
                unitKerjaId,
            },
        });

        const mappedKategori = handleKategori(newReport.id, kategori);
        await prisma.laporanKinerjaKategoriKinerja.createMany({
            data: mappedKategori,
            // skipDuplicates: true,
        });

        res.status(201).json({
            success: true,
            message: 'Laporan kinerja berhasil dibuat.',
            data: { id: newReport.id, tanggal: newReport.tanggal },
        });

    } catch (error) {
        next(error);
    }
};

export const getReports = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user!;
    
    let whereCondition: any = {};
    const unitKerjaIdQuery = req.query.unitKerjaId ? parseInt(req.query.unitKerjaId as string, 10) : undefined;
    
    if (user.role === 'ENTRY_USER' && user.unitKerjaId) {
        whereCondition.unitKerjaId = user.unitKerjaId;
    } else if (unitKerjaIdQuery) {
        whereCondition.unitKerjaId = unitKerjaIdQuery;
    }

    try {
        const reports = await prisma.laporanKinerja.findMany({
            where: whereCondition,
            include: {
                unitKerja: { select: { nama: true } },
                kategori: {
                    include: { kategoriKinerja: { select: { nama: true } } },
                },
            },
            orderBy: { tanggal: 'desc' },
        });

        res.json({ success: true, count: reports.length, data: reports });
    } catch (error) {
        next(error);
    }
};

export const getReportById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user!;
    const id = parseInt(req.params.id!, 10);
    
    try {
        const report = await prisma.laporanKinerja.findUnique({
            where: { id },
            include: { unitKerja: true, kategori: { include: { kategoriKinerja: true } } },
        });

        if (!report) {
            return next({ statusCode: 404, message: 'Laporan tidak ditemukan.' });
        }

        if (user.role === 'ENTRY_USER' && user.unitKerjaId !== report.unitKerjaId) {
            return next({ statusCode: 403, message: 'Akses ditolak. Anda tidak berhak melihat laporan ini.' });
        }

        res.json({ success: true, data: report });
    } catch (error) {
        next(error);
    }
};

export const updateReport = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user!;
    const id = parseInt(req.params.id!, 10);
    const { kategori, tanggal, ...dataToUpdate } = req.body;
    
    try {
        const existingReport = await prisma.laporanKinerja.findUnique({ where: { id } });

        if (!existingReport) {
            return next({ statusCode: 404, message: 'Laporan tidak ditemukan.' });
        }
        
        if (user.role === 'ENTRY_USER' && user.unitKerjaId !== existingReport.unitKerjaId) {
            return next({ statusCode: 403, message: 'Akses ditolak. Anda hanya dapat mengubah laporan Unit Kerja Anda.' });
        }
        
        const finalData: any = { ...dataToUpdate };
        if (tanggal) finalData.tanggal = new Date(tanggal);

        const updatedReport = await prisma.laporanKinerja.update({
            where: { id },
            data: finalData,
        });

        if (kategori && kategori.length > 0) {
            await prisma.laporanKinerjaKategoriKinerja.deleteMany({
                where: { laporanKinerjaId: id },
            });
            const mappedKategori = handleKategori(id, kategori);
            await prisma.laporanKinerjaKategoriKinerja.createMany({
                data: mappedKategori,
            });
        }

        res.json({ success: true, message: 'Laporan berhasil diperbarui.', data: updatedReport });

    } catch (error) {
        next(error);
    }
};

export const deleteReport = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user!;
    const id = parseInt(req.params.id!, 10);

    if (user.role !== 'SUPER_USER') {
        return next({ statusCode: 403, message: 'Akses ditolak. Hanya Super User yang dapat menghapus laporan.' });
    }
    
    try {
        const existingReport = await prisma.laporanKinerja.findUnique({ where: { id } });
        if (!existingReport) {
            return next({ statusCode: 404, message: 'Laporan tidak ditemukan.' });
        }

        await prisma.laporanKinerja.delete({ where: { id } });


        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

export const getKategori = async (_req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const kategori = await prisma.kategoriKinerja.findMany({
            orderBy: { nama: 'asc' }
        });
        res.json({ success: true, data: kategori });
    } catch (error) {
        next(error);
    }
};