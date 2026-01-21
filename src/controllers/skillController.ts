import { Request, Response } from 'express';
import prisma from '../config/database.js';
import { z } from 'zod';
import { validateId } from '../utils/validation.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const createSkillSchema = z.object({
  name: z.string().min(1, '技能名称不能为空'),
  category: z.string().optional(),
  proficiency: z.number().min(1).max(5).optional(),
  icon: z.string().optional(),
  description: z.string().optional(),
  sortOrder: z.number().optional(),
});

const updateSkillSchema = createSkillSchema.partial();

/**
 * 获取技能列表
 */
export const getSkills = asyncHandler(async (_req: Request, res: Response) => {
  const skills = await prisma.skill.findMany({
    orderBy: [
      { sortOrder: 'asc' },
      { createdAt: 'desc' },
    ],
  });

  res.json(skills);
});

/**
 * 创建技能
 */
export const createSkill = asyncHandler(async (req: Request, res: Response) => {
  const data = createSkillSchema.parse(req.body);
  const skill = await prisma.skill.create({ data });
  res.status(201).json(skill);
});

/**
 * 更新技能
 */
export const updateSkill = asyncHandler(async (req: Request, res: Response) => {
  const id = validateId(req.params.id);
  const data = updateSkillSchema.parse(req.body);
  const skill = await prisma.skill.update({ where: { id }, data });
  res.json(skill);
});

/**
 * 删除技能
 */
export const deleteSkill = asyncHandler(async (req: Request, res: Response) => {
  const id = validateId(req.params.id);
  await prisma.skill.delete({ where: { id } });
  res.json({ message: '删除成功' });
});
