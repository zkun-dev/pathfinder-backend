import { Router } from 'express';
import { uploadFile, deleteFile } from '../controllers/uploadController.js';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../utils/upload.js';

const router = Router();

// 上传文件
router.post('/', authenticate, upload.single('file'), uploadFile);

// 删除文件 - 支持通配符路径匹配
// 例如：DELETE /api/upload/uploads/filename.jpg
router.delete('/*', authenticate, deleteFile);

export default router;
