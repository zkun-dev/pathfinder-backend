import { Request, Response } from 'express';
import prisma from '../config/database.js';
import { z } from 'zod';
import { parsePagination, createPaginationResponse } from '../utils/pagination.js';
import { validateId } from '../utils/validation.js';
import { transformDateFields } from '../utils/date.js';
import { buildQueryConditions } from '../utils/query.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { PrismaError } from '../types/index.js';

const createLearningSchema = z.object({
  title: z.string().min(1, '标题不能为空'),
  description: z.string().optional(),
  content: z.string().optional(),
  category: z.string().optional(),
  tags: z.any().optional(),
  resources: z.any().optional(),
  startDate: z.string().datetime().optional().or(z.literal('')),
  endDate: z.string().datetime().optional().or(z.literal('')),
  status: z.string().optional(),
});

const updateLearningSchema = createLearningSchema.partial();

export const getLearnings = asyncHandler(async (req: Request, res: Response) => {
  const pagination = parsePagination(req.query as Record<string, string>, 10, 100);
  
  const where = buildQueryConditions(req.query as Record<string, string>);

    const [learnings, total] = await Promise.all([
      prisma.learning.findMany({
      where: { ...where, deletedAt: null },
        orderBy: { createdAt: 'desc' },
      skip: pagination.skip,
      take: pagination.limit,
      }),
    prisma.learning.count({ where: { ...where, deletedAt: null } }),
    ]);

  res.json(createPaginationResponse(learnings, total, pagination));
});

export const getLearning = asyncHandler(async (req: Request, res: Response) => {
  const id = validateId(req.params.id);

    const learning = await prisma.learning.findFirst({
      where: {
      id,
        deletedAt: null,
      },
    });

    if (!learning) {
      return res.status(404).json({ error: '学习记录不存在' });
    }

    res.json(learning);
});

export const createLearning = asyncHandler(async (req: Request, res: Response) => {
    const data = createLearningSchema.parse(req.body);

  const learningData = transformDateFields(data, ['startDate', 'endDate']);

    const learning = await prisma.learning.create({
    data: learningData as typeof data,
    });

    res.status(201).json(learning);
});

export const updateLearning = asyncHandler(async (req: Request, res: Response) => {
  const id = validateId(req.params.id);
    const data = updateLearningSchema.parse(req.body);

  const learningData = transformDateFields(data, ['startDate', 'endDate']);

  try {
    const learning = await prisma.learning.update({
      where: { id },
      data: learningData as typeof data,
    });

    res.json(learning);
  } catch (error) {
    const prismaError = error as PrismaError;
    if (prismaError.code === 'P2025') {
      return res.status(404).json({ error: '学习记录不存在' });
    }
    throw error;
  }
});

export const deleteLearning = asyncHandler(async (req: Request, res: Response) => {
  const id = validateId(req.params.id);

  try {
    await prisma.learning.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    res.json({ message: '删除成功' });
  } catch (error) {
    const prismaError = error as PrismaError;
    if (prismaError.code === 'P2025') {
      return res.status(404).json({ error: '学习记录不存在' });
    }
    throw error;
  }
});
