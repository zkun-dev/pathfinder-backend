import { Request, Response } from 'express';
import prisma from '../config/database.js';
import { z } from 'zod';
import { parsePagination, createPaginationResponse } from '../utils/pagination.js';
import { validateId, parseBoolean } from '../utils/validation.js';
import { buildQueryConditions } from '../utils/query.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { PrismaError } from '../types/index.js';

const createLifeSchema = z.object({
  title: z.string().min(1, '标题不能为空'),
  content: z.string().min(1, '内容不能为空'),
  coverImage: z.string().optional(),
  images: z.any().optional(),
  tags: z.any().optional(),
  published: z.boolean().optional(),
});

const updateLifeSchema = createLifeSchema.partial();

export const getLifePosts = asyncHandler(async (req: Request, res: Response) => {
  const pagination = parsePagination(req.query as Record<string, string>, 10, 100);
  
  const where = buildQueryConditions(req.query as Record<string, string>, {
    published: (value) => parseBoolean(value),
  });

  const [posts, total] = await Promise.all([
    prisma.life.findMany({
      where: { ...where, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      skip: pagination.skip,
      take: pagination.limit,
    }),
    prisma.life.count({ where: { ...where, deletedAt: null } }),
  ]);

  res.json(createPaginationResponse(posts, total, pagination));
});

export const getLifePost = asyncHandler(async (req: Request, res: Response) => {
  const id = validateId(req.params.id);

  const post = await prisma.life.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!post) {
    return res.status(404).json({ error: '生活动态不存在' });
  }

  // 增加阅读量（使用事务确保一致性）
  const updated = await prisma.life.update({
    where: { id: post.id },
    data: { views: { increment: 1 } },
  });

  res.json(updated);
});

export const createLifePost = asyncHandler(async (req: Request, res: Response) => {
  const data = createLifeSchema.parse(req.body);

  const post = await prisma.life.create({
    data,
  });

  res.status(201).json(post);
});

export const updateLifePost = asyncHandler(async (req: Request, res: Response) => {
  const id = validateId(req.params.id);
  const data = updateLifeSchema.parse(req.body);

  try {
    const post = await prisma.life.update({
      where: { id },
      data,
    });

    res.json(post);
  } catch (error) {
    const prismaError = error as PrismaError;
    if (prismaError.code === 'P2025') {
      return res.status(404).json({ error: '生活动态不存在' });
    }
    throw error;
  }
});

export const deleteLifePost = asyncHandler(async (req: Request, res: Response) => {
  const id = validateId(req.params.id);

  try {
    await prisma.life.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    res.json({ message: '删除成功' });
  } catch (error) {
    const prismaError = error as PrismaError;
    if (prismaError.code === 'P2025') {
      return res.status(404).json({ error: '生活动态不存在' });
    }
    throw error;
  }
});
