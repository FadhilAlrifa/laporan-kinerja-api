import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';
import { validate } from '../middleware/validation.middleware';
import { createReport, getReports, getReportById, updateReport, deleteReport, getKategori } from '../controllers/report.controller';
import { createReportSchema, updateReportSchema, reportIdSchema } from '../validators/report.validator';

const router = Router();

router.get('/', authenticateToken, getReports);

router.get('/kategori', authenticateToken, getKategori);
router.get('/:id', authenticateToken, validate(reportIdSchema), getReportById);
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

router.delete(
    '/:id',
    authenticateToken,
    authorizeRoles(['SUPER_USER']),
    validate(reportIdSchema),
    deleteReport
);


export const reportRouter = router;