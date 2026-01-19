import { Request, Response } from 'express';
import prisma from '../config/database.js';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.js';
import { logger } from '../utils/logger.js';

const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  title: z.string().optional(),
  bio: z.string().optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  location: z.string().optional(),
  socialLinks: z.any().optional(),
});

export const getProfile = asyncHandler(async (_req: Request, res: Response) => {
    let profile = await prisma.profile.findFirst();

    if (!profile) {
      // 创建默认profile
      profile = await prisma.profile.create({
        data: {
          name: '未设置',
          title: '未设置',
        },
      });
    logger.info('创建默认个人信息');
    }

    res.json(profile);
});

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
    logger.info('创建新的个人信息');
    }

    res.json(profile);
});
