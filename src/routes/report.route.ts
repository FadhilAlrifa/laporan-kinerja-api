import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';
import { validate } from '../middleware/validation.middleware';
import { createReport, getReports, getReportById, updateReport, deleteReport, getKategori } from '../controllers/report.controller';
import { createReportSchema, updateReportSchema, reportIdSchema } from '../validators/report.validator';

const router = Router();

// ------------------------------------
// PUBLIC READ ACCESS (Semua role)
// ------------------------------------
router.get('/', authenticateToken, getReports);
router.get('/:id', authenticateToken, validate(reportIdSchema), getReportById);

// ------------------------------------
// CATEGORY ACCESS (Semua role)
// ------------------------------------
router.get('/kategori', authenticateToken, getKategori);

// ------------------------------------
// ENTRY & SUPER USER ACCESS
// ------------------------------------
router.post(
    '/',
    authenticateToken,
    authorizeRoles(['ENTRY_USER', 'SUPER_USER']),
    validate(createReportSchema),
    createReport
);

router.patch(
    '/:id',
    authenticateToken,
    authorizeRoles(['ENTRY_USER', 'SUPER_USER']),
    validate(updateReportSchema),
    updateReport
);

// ------------------------------------
// SUPER USER ONLY ACCESS
// ------------------------------------
router.delete(
    '/:id',
    authenticateToken,
    authorizeRoles(['SUPER_USER']),
    validate(reportIdSchema),
    deleteReport
);


export const reportRouter = router;