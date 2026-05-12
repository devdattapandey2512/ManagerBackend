import { Router } from 'express';
import multer from 'multer';
import * as controller from '../controllers/profilesController.js';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

// CRUD
router.get('/', controller.listProfiles);
router.post('/', controller.createProfile);
router.put('/:id', controller.updateProfile);
router.patch('/:id/verdict', controller.updateVerdict);
router.patch('/:id/notes', controller.updateNotes);
router.delete('/:id', controller.deleteProfile);

// Export
router.get('/export/sql', controller.exportSQL);
router.get('/export/excel', controller.exportExcel);
router.get('/export/pdf', controller.exportPDF);

// Import
router.post('/import/excel', upload.single('file'), controller.importExcel);

export default router;
