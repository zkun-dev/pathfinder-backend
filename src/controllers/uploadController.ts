import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { config } from '../config/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { logger } from '../utils/logger.js';

/**
 * 上传文件
 */
export const uploadFile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    logger.warn('文件上传请求但没有文件');
    return res.status(400).json({ error: '请选择要上传的文件' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  
  logger.info(`文件上传成功: ${req.file.filename} (${req.file.size} bytes)`);
  
  res.json({
    url: fileUrl,
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
    mimetype: req.file.mimetype,
  });
});

/**
 * 删除上传的文件
 */
export const deleteFile = asyncHandler(async (req: Request, res: Response) => {
  let filePath = req.path || (req.query.path as string) || '';
  
  if (!filePath.startsWith('/uploads/')) {
    logger.warn(`无效的文件路径: ${filePath}`);
    return res.status(400).json({ error: '无效的文件路径，必须以 /uploads/ 开头' });
  }

  const filename = filePath.replace(/^\/uploads\//, '');
  
  // 验证文件名，防止路径遍历攻击
  if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    logger.warn(`不安全的文件名: ${filename}`);
    return res.status(400).json({ error: '无效的文件名' });
  }

  const fullPath = path.join(config.upload.dir, filename);
  const uploadDir = path.resolve(config.upload.dir);
  const resolvedPath = path.resolve(fullPath);
  
  // 确保文件在 uploads 目录内（防止路径遍历攻击）
  if (!resolvedPath.startsWith(uploadDir)) {
    logger.warn(`路径遍历攻击尝试: ${resolvedPath} 不在 ${uploadDir} 内`);
    return res.status(403).json({ error: '访问被拒绝：文件路径不安全' });
  }

  // 检查文件是否存在
  if (!fs.existsSync(fullPath)) {
    logger.info(`文件不存在（可能已被删除）: ${filename}`);
    return res.json({ 
      message: '文件不存在（可能已被删除）',
      filename,
    });
  }

  try {
    fs.unlinkSync(fullPath);
    logger.info(`文件删除成功: ${filename}`);
    res.json({ 
      message: '文件删除成功',
      filename,
    });
  } catch (error) {
    logger.error(`删除文件失败: ${filename}`, error);
    return res.status(500).json({ error: '删除文件失败' });
  }
});
