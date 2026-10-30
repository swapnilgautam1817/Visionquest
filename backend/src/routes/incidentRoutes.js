import { Router } from 'express';
import { getIncidents, getIncidentById, createIncident, updateIncident, resolveIncident } from '../controllers/incidentController.js';

const router = Router();

router.get('/', getIncidents);
router.get('/:id', getIncidentById);
router.post('/', createIncident);
router.put('/:id', updateIncident);
router.post('/:id/resolve', resolveIncident);

export default router;

