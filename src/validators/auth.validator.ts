import { z } from 'zod';

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email('Email tidak valid.').min(1, 'Email wajib diisi.'),
        password: z.string().min(6, 'Password minimal 6 karakter.').max(100, 'Password terlalu panjang.'),
    }),
});

export const registerSchema = z.object({
    body: z.object({
        name: z.string().min(3, 'Nama wajib diisi.'),
        email: z.string().email('Email tidak valid.').min(1, 'Email wajib diisi.'),
        password: z.string()
            .min(8, 'Password minimal 8 karakter.')
            .regex(/[A-Z]/, 'Password harus mengandung huruf kapital.')
            .regex(/[0-9]/, 'Password harus mengandung angka.'),
    }),
});