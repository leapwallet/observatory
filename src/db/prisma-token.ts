import { Token } from 'typedi';
import { PrismaClient } from '@prisma/client';

const prismaToken = new Token<PrismaClient>('Prisma');

export default prismaToken;
