import { z } from 'zod';

export const createReportSchema = z.object({
    body: z.object({
        tanggal: z.string().min(1, 'Tanggal wajib diisi.'), 
        target: z.number().min(0, 'Target tidak boleh negatif.'),
        realisasi: z.number().min(0, 'Realisasi tidak boleh negatif.'),
        keterangan: z.string().optional(),
        
        unitKerjaId: z.number().int().positive('Unit Kerja ID harus berupa bilangan bulat positif.'),
        
        kategori: z.array(z.object({
            kategoriKinerjaId: z.number().int().positive(),
            nilai: z.number().optional().nullable(),
        })).min(1, 'Minimal satu kategori kinerja harus dilaporkan.'),
    }),
});

export const updateReportSchema = z.object({
    params: z.object({
        id: z.string().transform(id => parseInt(id, 10)).pipe(z.number().int().positive('ID Laporan harus positif.')),
    }),
    body: z.object({
        tanggal: z.string().optional(),
        target: z.number().min(0, 'Target tidak boleh negatif.').optional(),
        realisasi: z.number().min(0, 'Realisasi tidak boleh negatif.').optional(),
        keterangan: z.string().optional(),
        unitKerjaId: z.number().int().positive().optional(),
        
        kategori: z.array(z.object({
            kategoriKinerjaId: z.number().int().positive(),
            nilai: z.number().optional().nullable(),
        })).optional(),
    }).partial(), 
});

export const reportIdSchema = z.object({
    params: z.object({
        id: z.string().transform(id => parseInt(id, 10)).pipe(z.number().int().positive('ID Laporan harus positif.')),
    }),
});