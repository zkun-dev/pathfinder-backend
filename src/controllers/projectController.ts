import { Request, Response } from 'express';
import prisma from '../config/database.js';
import { z } from 'zod';
import { parsePagination, createPaginationResponse } from '../utils/pagination.js';
import { validateId } from '../utils/validation.js';
import { transformDateFields } from '../utils/date.js';
import { buildQueryConditions } from '../utils/query.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const createProjectSchema = z.object({
  title: z.string().min(1, '项目标题不能为空'),
  description: z.string().optional(),
  content: z.string().optional(),
  coverImage: z.string().optional(),
  images: z.any().optional(),
  techStack: z.any().optional(),
  type: z.string().optional(),
  links: z.any().optional(),
  featured: z.boolean().optional(),
  startDate: z.string().datetime().optional().or(z.literal('')),
  endDate: z.string().datetime().optional().or(z.literal('')),
});

const updateProjectSchema = createProjectSchema.partial();

/**
 * 获取项目列表
 */
export const getProjects = asyncHandler(async (req: Request, res: Response) => {
  const pagination = parsePagination(req.query as Record<string, string>, 10, 100);
  const where = buildQueryConditions(req.query as Record<string, string>, {
    featured: (value) => value === 'true',
  });

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where: { ...where, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      skip: pagination.skip,
      take: pagination.limit,
    }),
    prisma.project.count({ where: { ...where, deletedAt: null } }),
  ]);

  res.json(createPaginationResponse(projects, total, pagination));
});

/**
 * 获取项目详情
 */
export const getProject = asyncHandler(async (req: Request, res: Response) => {
  const id = validateId(req.params.id);
  const project = await prisma.project.findFirst({
    where: { id, deletedAt: null },
  });

  if (!project) {
    return res.status(404).json({ error: '项目不存在' });
  }

  res.json(project);
});

/**
 * 创建项目
 */
export const createProject = asyncHandler(async (req: Request, res: Response) => {
  const data = createProjectSchema.parse(req.body);
  const projectData = transformDateFields(data, ['startDate', 'endDate']);
  const project = await prisma.project.create({
    data: projectData as typeof data,
  });
  res.status(201).json(project);
});

/**
 * 更新项目
 */
export const updateProject = asyncHandler(async (req: Request, res: Response) => {
  const id = validateId(req.params.id);
  const data = updateProjectSchema.parse(req.body);
  const projectData = transformDateFields(data, ['startDate', 'endDate']);
  const project = await prisma.project.update({
    where: { id },
    data: projectData as typeof data,
  });
  res.json(project);
});

/**
 * 删除项目（软删除）
 */
export const deleteProject = asyncHandler(async (req: Request, res: Response) => {
  const id = validateId(req.params.id);
  await prisma.project.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  res.json({ message: '删除成功' });
});
