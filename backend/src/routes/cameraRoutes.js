import { Router } from 'express';
import { getCameras, getCameraById, createCamera, updateCamera, deleteCamera } from '../controllers/cameraController.js';

const router = Router();

router.get('/', getCameras);
router.get('/:id', getCameraById);
router.post('/', createCamera);
router.put('/:id', updateCamera);
router.delete('/:id', deleteCamera);

export default router;

