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
export const getProfile = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
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
export const updateProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const data = updateProfileSchema.parse(req.body);
  let profile = await prisma.profile.findFirst();

  if (profile) {
    // 处理 socialLinks，转换为 Prisma 接受的格式
    const updateData: Record<string, unknown> = { ...data };
    if ('socialLinks' in updateData) {
      if (updateData.socialLinks === null) {
        // Prisma 使用 Prisma.JsonNull 表示 JSON null
        updateData.socialLinks = null;
      } else if (updateData.socialLinks !== undefined) {
        // 保持原值
        updateData.socialLinks = updateData.socialLinks;
      }
    }

    profile = await prisma.profile.update({
      where: { id: profile.id },
      data: updateData as Parameters<typeof prisma.profile.update>[0]['data'],
    });
  } else {
    const createData: Record<string, unknown> = {
      name: data.name || '未设置',
      title: data.title || '未设置',
      ...data,
    };
    if ('socialLinks' in createData && createData.socialLinks === null) {
      createData.socialLinks = null;
    }

    profile = await prisma.profile.create({
      data: createData as Parameters<typeof prisma.profile.create>[0]['data'],
    });
  }

  res.json(profile);
});
