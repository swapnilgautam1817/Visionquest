import { Router } from 'express';
import { getInspections, runInspection } from '../controllers/inspectionController.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = Router();

router.get('/', getInspections);
router.post('/analyze', upload.single('file'), runInspection);

export default router;

