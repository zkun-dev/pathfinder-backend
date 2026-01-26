import { Request, Response } from 'express';
import prisma from '../config/database.js';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.js';

const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  title: z.string().optional(),
  bio: z.string().optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  location: z.string().optional(),
  socialLinks: z.union([
    z.array(z.record(z.unknown())),
    z.record(z.unknown()),
    z.null(),
  ]).optional(),
});

/**
 * 获取个人信息
 */
export const getProfile = asyncHandler(async (_req: Request, res: Response) => {
  let profile = await prisma.profile.findFirst();

  if (!profile) {
    profile = await prisma.profile.create({
      data: {
        name: '未设置',
        title: '未设置',
      },
    });
  }

  res.json(profile);
});

/**
 * 更新个人信息
 */
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const data = updateProfileSchema.parse(req.body);
  let profile = await prisma.profile.findFirst();

  if (profile) {
    profile = await prisma.profile.update({
      where: { id: profile.id },
      data,
    });
  } else {
    profile = await prisma.profile.create({
      data: {
        name: data.name || '未设置',
        title: data.title || '未设置',
        ...data,
      },
    });
  }

  res.json(profile);
});
