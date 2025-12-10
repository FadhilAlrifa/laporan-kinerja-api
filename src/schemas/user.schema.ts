import { z } from 'zod';

const roleEnum = z.union([
    z.literal("SUPER_USER"),
    z.literal("ENTRY_USER"),
    z.literal("USER")
]);

export const createUserSchema = z.object({
    body: z.object({
        name: z.string().min(3, "Nama minimal 3 karakter."),
        email: z.string().email("Format email tidak valid."),
        password: z.string().min(6, "Password minimal 6 karakter."),
        role: roleEnum,
        unitKerjaId: z.number().int().positive().nullable()
            .refine((val, ctx) => {
                if (ctx.parent.role !== 'SUPER_USER' && val === null) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Unit Kerja ID wajib diisi untuk ENTRY_USER atau USER biasa.",
                    });
                    return false;
                }
                return true;
            }, { path: ['unitKerjaId'] }),
    }),
});

export const updateUserSchema = z.object({
    params: z.object({
        id: z.string().transform(id => parseInt(id, 10)).pipe(z.number().int().positive('ID User harus positif.')),
    }),
    body: z.object({
        name: z.string().min(3, "Nama minimal 3 karakter.").optional(),
        email: z.string().email("Format email tidak valid.").optional(),
        password: z.string().min(6, "Password minimal 6 karakter.").optional(),
        role: roleEnum.optional(),
        unitKerjaId: z.number().int().positive().nullable().optional(),
    }).partial(),
});

export const userIdSchema = z.object({
    params: z.object({
        id: z.string().transform(id => parseInt(id, 10)).pipe(z.number().int().positive('ID User harus positif.')),
    }),
});