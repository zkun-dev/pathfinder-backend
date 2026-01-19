#!/usr/bin/env node

/**
 * 生成 JWT Secret 密钥
 * 用于生产环境配置
 */

import crypto from 'crypto';

const secret = crypto.randomBytes(32).toString('hex');

console.log('\n🔐 生成的 JWT_SECRET:');
console.log('─'.repeat(60));
console.log(secret);
console.log('─'.repeat(60));
console.log('\n📝 请将此值设置到环境变量 JWT_SECRET 中');
console.log('⚠️  请妥善保管，不要泄露！\n');
