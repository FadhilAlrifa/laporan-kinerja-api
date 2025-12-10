import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { 
    createUnitKerja, 
    getUnitKerjas, 
    getUnitKerjaById, 
    updateUnitKerja, 
    deleteUnitKerja 
} from '../controllers/unitKerja.controller';
import { 
    unitKerjaIdSchema, 
    createUnitKerjaSchema, 
    updateUnitKerjaSchema 
} from '../schemas/unitKerja.schema';

const router = Router();

router.get('/', authenticateToken, getUnitKerjas);
router.post('/', authenticateToken, validate(createUnitKerjaSchema), createUnitKerja);
router.get('/:id', authenticateToken, validate(unitKerjaIdSchema), getUnitKerjaById);
router.patch('/:id', authenticateToken, validate(unitKerjaIdSchema), validate(updateUnitKerjaSchema), updateUnitKerja);
router.delete('/:id', authenticateToken, validate(unitKerjaIdSchema), deleteUnitKerja);

export default router;