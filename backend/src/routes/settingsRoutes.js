import { Router } from 'express';
import { getSettings, updateSettings, testGeminiConnection, testSupabase } from '../controllers/settingsController.js';

const router = Router();

router.get('/', getSettings);
router.put('/', updateSettings);
router.post('/test-gemini', testGeminiConnection);
router.post('/test-supabase', testSupabase);

export default router;
