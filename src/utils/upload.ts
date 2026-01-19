import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import { config } from '../config/index.js';
import { FILE_UPLOAD } from './constants.js';
import fs from 'fs';

// 确保上传目录存在
const uploadDir = config.upload.dir;
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const ALLOWED_MIME_TYPES = [
  ...FILE_UPLOAD.ALLOWED_IMAGE_TYPES,
  ...FILE_UPLOAD.ALLOWED_DOC_TYPES,
];

const ALLOWED_EXTENSIONS = /\.(jpeg|jpg|png|gif|webp|pdf|doc|docx)$/i;

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const extname = ALLOWED_EXTENSIONS.test(path.extname(file.originalname));
  const mimetype = ALLOWED_MIME_TYPES.includes(file.mimetype as typeof ALLOWED_MIME_TYPES[number]);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error(`不支持的文件类型。允许的类型: ${ALLOWED_MIME_TYPES.join(', ')}`));
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: config.upload.maxFileSize,
  },
  fileFilter,
});
