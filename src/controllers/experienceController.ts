import { Request, Response } from 'express';
import prisma from '../config/database.js';
import { z } from 'zod';
import { validateId } from '../utils/validation.js';
import { transformDateFields } from '../utils/date.js';
import { asyncHandler } from '../utils/asyncHandler.js';

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

/**
 * 获取工作经历列表
 */
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

/**
 * 获取工作经历详情
 */
export const getExperience = asyncHandler(async (req: Request, res: Response) => {
  const id = validateId(req.params.id);
  const experience = await prisma.experience.findFirst({
    where: { id, deletedAt: null },
  });

  if (!experience) {
    return res.status(404).json({ error: '工作经历不存在' });
  }

  res.json(experience);
});

/**
 * 创建工作经历
 */
export const createExperience = asyncHandler(async (req: Request, res: Response) => {
  const data = createExperienceSchema.parse(req.body);
  const experienceData = transformDateFields(data, ['startDate', 'endDate']);
  const experience = await prisma.experience.create({
    data: experienceData as typeof data,
  });
  res.status(201).json(experience);
});

/**
 * 更新工作经历
 */
export const updateExperience = asyncHandler(async (req: Request, res: Response) => {
  const id = validateId(req.params.id);
  const data = updateExperienceSchema.parse(req.body);
  const experienceData = transformDateFields(data, ['startDate', 'endDate']);
  const experience = await prisma.experience.update({
    where: { id },
    data: experienceData as typeof data,
  });
  res.json(experience);
});

/**
 * 删除工作经历（软删除）
 */
export const deleteExperience = asyncHandler(async (req: Request, res: Response) => {
  const id = validateId(req.params.id);
  await prisma.experience.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  res.json({ message: '删除成功' });
});
