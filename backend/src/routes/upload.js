// backend/src/routes/upload.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import { authenticateToken } from '../middleware/auth.js';
import { AttachmentModel } from '../models/attachment.js';

const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), 'uploads');

// Create directory if it doesn't exist (async, called before upload)
const ensureUploadDir = async () => {
    try {
        await fs.mkdir(uploadDir, { recursive: true });
    } catch (error) {
        console.error('Upload directory creation error:', error);
    }
};

// Initialize on module load
ensureUploadDir();

// Configure multer storage
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = crypto.randomBytes(16).toString('hex');
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}-${uniqueSuffix}${ext}`);
    }
});

// File filter for security
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|zip/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images, PDFs, docs, and archives allowed.'));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024  // 10MB limit
    }
});

router.use(authenticateToken);

// POST /api/upload/todo/:todoId - Upload file to todo
router.post('/todo/:todoId', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const attachment = await AttachmentModel.create(
            req.user.userId,
            req.file.filename,
            req.file.originalname,
            req.file.path,
            req.file.mimetype,
            req.file.size,
            parseInt(req.params.todoId),
            null
        );

        res.status(201).json({
            message: 'File uploaded successfully',
            attachment
        });
    } catch (error) {
        console.error('Upload error:', error);
        // Clean up file if database insert fails
        if (req.file) {
            await fs.unlink(req.file.path).catch(console.error);
        }
        res.status(500).json({ error: 'Failed to upload file' });
    }
});

// POST /api/upload/comment/:commentId - Upload file to comment
router.post('/comment/:commentId', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const attachment = await AttachmentModel.create(
            req.user.userId,
            req.file.filename,
            req.file.originalname,
            req.file.path,
            req.file.mimetype,
            req.file.size,
            null,
            parseInt(req.params.commentId)
        );

        res.status(201).json({
            message: 'File uploaded successfully',
            attachment
        });
    } catch (error) {
        console.error('Upload error:', error);
        if (req.file) {
            await fs.unlink(req.file.path).catch(console.error);
        }
        res.status(500).json({ error: 'Failed to upload file' });
    }
});

// GET /api/upload/todo/:todoId/list - List all attachments for a todo
router.get('/todo/:todoId/list', async (req, res) => {
    try {
        const attachments = await AttachmentModel.findByTodoId(req.params.todoId);
        res.json({ attachments });
    } catch (error) {
        console.error('List attachments error:', error);
        res.status(500).json({ error: 'Failed to list attachments' });
    }
});

// GET /api/upload/:id - Download file
router.get('/:id', async (req, res) => {
    try {
        const attachment = await AttachmentModel.findById(req.params.id);

        if (!attachment) {
            return res.status(404).json({ error: 'File not found' });
        }

        // Send file
        res.download(attachment.filepath, attachment.original_filename);
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ error: 'Failed to download file' });
    }
});

// DELETE /api/upload/:id - Delete file
router.delete('/:id', async (req, res) => {
    try {
        const attachment = await AttachmentModel.findById(req.params.id);

        if (!attachment) {
            return res.status(404).json({ error: 'File not found' });
        }

        // Only file uploader or admin can delete
        if (attachment.user_id !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        await AttachmentModel.delete(req.params.id);
        res.json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error('Delete file error:', error);
        res.status(500).json({ error: 'Failed to delete file' });
    }
});

export default router;
