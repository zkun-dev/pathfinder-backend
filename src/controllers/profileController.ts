import { Request, Response } from 'express';
import prisma from '../config/database.js';
import { Prisma } from '@prisma/client';
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

  // 准备更新数据，正确处理 JSON 字段和 null 值
  const updateData: {
    name?: string;
    title?: string;
    bio?: string | null;
    avatarUrl?: string | null;
    email?: string | null;
    phone?: string | null;
    location?: string | null;
    socialLinks?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;
  } = {
    ...(data.name && { name: data.name }),
    ...(data.title !== undefined && { title: data.title }),
    ...(data.bio !== undefined && { bio: data.bio || null }),
    ...(data.phone !== undefined && { phone: data.phone || null }),
    ...(data.location !== undefined && { location: data.location || null }),
    // 处理空字符串，转换为 null
    email: data.email === '' ? null : data.email,
    avatarUrl: data.avatarUrl === '' ? null : data.avatarUrl,
    // 处理 socialLinks：null 转换为 Prisma.JsonNull，其他值直接传递
    socialLinks: data.socialLinks === null 
      ? Prisma.JsonNull 
      : data.socialLinks !== undefined 
        ? (data.socialLinks as Prisma.InputJsonValue)
        : undefined,
  };

  if (profile) {
    // 更新现有配置
    profile = await prisma.profile.update({
      where: { id: profile.id },
      data: updateData,
    });
  } else {
    // 创建新配置
    profile = await prisma.profile.create({
      data: {
        name: data.name || '未设置',
        title: data.title || '未设置',
        ...updateData,
      },
    });
  }

  res.json(profile);
});
