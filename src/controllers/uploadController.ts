import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { config } from '../config/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { logger } from '../utils/logger.js';

/**
 * 上传文件
 */
export const uploadFile = asyncHandler(async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  if (!req.file) {
    logger.warn('文件上传请求但没有文件');
    res.status(400).json({ error: '请选择要上传的文件' });
    return;
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
 * 支持通过路径参数或查询参数指定文件路径
 */
export const deleteFile = asyncHandler(async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  // 优先使用路径参数（/api/upload/uploads/filename.jpg），否则使用查询参数
  let filePath = req.params[0] || (req.query.path as string) || '';
  
  // 如果路径不以 /uploads/ 开头，尝试添加前缀
  if (!filePath.startsWith('/uploads/')) {
    if (filePath.startsWith('uploads/')) {
      filePath = '/' + filePath;
    } else if (filePath && !filePath.includes('/')) {
      // 如果只是文件名，添加 /uploads/ 前缀
      filePath = '/uploads/' + filePath;
    } else {
      logger.warn(`无效的文件路径: ${filePath}`);
      res.status(400).json({ error: '无效的文件路径，必须指定 /uploads/ 下的文件' });
      return;
    }
  }

  const filename = filePath.replace(/^\/uploads\//, '').replace(/^uploads\//, '');
  
  // 验证文件名，防止路径遍历攻击
  if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    logger.warn(`不安全的文件名: ${filename}`);
    res.status(400).json({ error: '无效的文件名' });
    return;
  }

  const fullPath = path.join(config.upload.dir, filename);
  const uploadDir = path.resolve(config.upload.dir);
  const resolvedPath = path.resolve(fullPath);
  
  // 确保文件在 uploads 目录内（防止路径遍历攻击）
  if (!resolvedPath.startsWith(uploadDir)) {
    logger.warn(`路径遍历攻击尝试: ${resolvedPath} 不在 ${uploadDir} 内`);
    res.status(403).json({ error: '访问被拒绝：文件路径不安全' });
    return;
  }

  // 检查文件是否存在
  if (!fs.existsSync(fullPath)) {
    logger.info(`文件不存在（可能已被删除）: ${filename}`);
    res.json({ 
      message: '文件不存在（可能已被删除）',
      filename,
    });
    return;
  }

  // 使用异步方法删除文件
  try {
    await fs.promises.unlink(fullPath);
    logger.info(`文件删除成功: ${filename}`);
    res.json({ 
      message: '文件删除成功',
      filename,
    });
  } catch (error) {
    logger.error(`删除文件失败: ${filename}`, error);
    res.status(500).json({ error: '删除文件失败' });
  }
});
