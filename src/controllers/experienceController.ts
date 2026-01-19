import { Request, Response } from 'express';
import prisma from '../config/database.js';
import { z } from 'zod';
import { validateId } from '../utils/validation.js';
import { transformDateFields } from '../utils/date.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { PrismaError } from '../types/index.js';

const createExperienceSchema = z.object({
  companyName: z.string().min(1, '公司名称不能为空'),
  companyLogo: z.string().optional(),
  position: z.string().min(1, '职位不能为空'),
  description: z.string().optional(),
  content: z.string().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional().or(z.literal('')),
  achievements: z.any().optional(),
  techStack: z.any().optional(),
  sortOrder: z.number().optional(),
});

const updateExperienceSchema = createExperienceSchema.partial();

export const getExperiences = asyncHandler(async (_req: Request, res: Response) => {
    const experiences = await prisma.experience.findMany({
      where: { deletedAt: null },
      orderBy: [
        { sortOrder: 'asc' },
        { startDate: 'desc' },
      ],
    });

    res.json(experiences);
});

export const getExperience = asyncHandler(async (req: Request, res: Response) => {
  const id = validateId(req.params.id);

    const experience = await prisma.experience.findFirst({
      where: {
      id,
        deletedAt: null,
      },
    });

    if (!experience) {
      return res.status(404).json({ error: '工作经历不存在' });
    }

    res.json(experience);
});

export const createExperience = asyncHandler(async (req: Request, res: Response) => {
    const data = createExperienceSchema.parse(req.body);

  const experienceData: Record<string, unknown> = {
      ...data,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
    };

    const experience = await prisma.experience.create({
    data: experienceData as typeof data,
    });

    res.status(201).json(experience);
});

export const updateExperience = asyncHandler(async (req: Request, res: Response) => {
  const id = validateId(req.params.id);
    const data = updateExperienceSchema.parse(req.body);

  const experienceData = transformDateFields(data, ['startDate', 'endDate']);

  try {
    const experience = await prisma.experience.update({
      where: { id },
      data: experienceData as typeof data,
    });

    res.json(experience);
  } catch (error) {
    const prismaError = error as PrismaError;
    if (prismaError.code === 'P2025') {
      return res.status(404).json({ error: '工作经历不存在' });
    }
    throw error;
  }
});

export const deleteExperience = asyncHandler(async (req: Request, res: Response) => {
  const id = validateId(req.params.id);

  try {
    await prisma.experience.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    res.json({ message: '删除成功' });
  } catch (error) {
    const prismaError = error as PrismaError;
    if (prismaError.code === 'P2025') {
      return res.status(404).json({ error: '工作经历不存在' });
    }
    throw error;
  }
});
