import { PrismaClient } from '@prisma/client'
import { PrismaD1 } from '@prisma/adapter-d1'
import { env } from 'cloudflare:workers'

type BoostSyncEnv = {
  DB: D1Database
}

const adapter = new PrismaD1((env as unknown as BoostSyncEnv).DB)

export const db = new PrismaClient({ adapter })
