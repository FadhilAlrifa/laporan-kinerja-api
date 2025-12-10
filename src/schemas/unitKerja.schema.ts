import { z } from 'zod';

export const unitKerjaIdSchema = z.object({
  params: z.object({
    id: z.string().refine(val => !isNaN(parseInt(val, 10)), {
      message: "ID harus berupa angka.",
    }).transform(val => parseInt(val, 10)),
  }),
});

export const createUnitKerjaSchema = z.object({
  body: z.object({
    nama: z.string().min(3, { message: "Nama Unit Kerja minimal 3 karakter." }),
    deskripsi: z.string().optional(),
  }),
});

export const updateUnitKerjaSchema = z.object({
  body: z.object({
    nama: z.string().min(3, { message: "Nama Unit Kerja minimal 3 karakter." }).optional(),
    deskripsi: z.string().optional(),
  }).partial(), 
});