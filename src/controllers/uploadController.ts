import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { config } from '../config/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const uploadFile = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
    return res.status(400).json({ error: '请选择要上传的文件' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    res.json({
      url: fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
    });
});

/**
 * 删除上传的文件
 * 路由：DELETE /api/upload/uploads/filename.jpg
 * req.path 会是 /uploads/filename.jpg（因为路由已经匹配了 /api/upload）
 */
export const deleteFile = asyncHandler(async (req: Request, res: Response) => {
    // 从请求路径中获取文件路径
    // req.path 会是 /uploads/filename.jpg（Express 路由匹配后剩余的路径）
    let filePath = req.path;
    
    // 如果路径为空或只是 /，尝试从查询参数获取
    if (!filePath || filePath === '/') {
      filePath = req.query.path as string || '';
    }
    
    // 确保路径以 /uploads/ 开头
    if (!filePath.startsWith('/uploads/')) {
      return res.status(400).json({ error: '无效的文件路径，必须以 /uploads/ 开头' });
  }

    // 提取文件名（移除 /uploads/ 前缀）
    const filename = filePath.replace(/^\/uploads\//, '');
    
    // 验证文件名，防止路径遍历攻击
    if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ error: '无效的文件名' });
    }

    // 构建完整的文件路径
    const fullPath = path.join(config.upload.dir, filename);
    
    // 确保文件在 uploads 目录内（防止路径遍历攻击）
    const uploadDir = path.resolve(config.upload.dir);
    const resolvedPath = path.resolve(fullPath);
    
    if (!resolvedPath.startsWith(uploadDir)) {
      return res.status(403).json({ error: '访问被拒绝：文件路径不安全' });
    }

    // 检查文件是否存在
    if (!fs.existsSync(fullPath)) {
      // 文件不存在时返回成功（幂等性），因为可能已经被删除
      return res.json({ 
        message: '文件不存在（可能已被删除）',
        filename: filename 
      });
    }

    // 删除文件
    fs.unlinkSync(fullPath);

    res.json({ 
      message: '文件删除成功',
      filename: filename 
    });
});
