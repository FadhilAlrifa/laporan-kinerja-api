import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { 
    createUser, 
    getUsers, 
    getUserById, 
    updateUser, 
    deleteUser 
} from '../controllers/user.controller';
import { 
    createUserSchema, 
    updateUserSchema, 
    userIdSchema 
} from '../schemas/user.schema';

const router = Router();

router.get('/', authenticateToken, getUsers); 
router.get('/:id', authenticateToken, validate(userIdSchema), getUserById);
router.post('/create', authenticateToken, validate(createUserSchema), createUser);
router.patch('/:id', authenticateToken, validate(updateUserSchema), updateUser);
router.delete('/:id', authenticateToken, validate(userIdSchema), deleteUser);

export default router;