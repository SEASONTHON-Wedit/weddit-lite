import { PrismaClient } from '@prisma/client'
import fs from 'node:fs'
import path from 'node:path'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function ensureSqliteDbOnVercel() {
  // Vercel Serverless에서는 배포된 파일 시스템이 읽기 전용이라 sqlite 저널/락 파일 생성 때문에 500이 나기 쉽다.
  // 따라서 "배포된 DB 파일"을 /tmp(쓰기 가능)로 복사한 뒤 Prisma가 그 파일을 보도록 DATABASE_URL을 조정한다.
  if (!process.env.VERCEL) return

  const url = process.env.DATABASE_URL
  const isFile = !url || url.startsWith('file:')
  if (!isFile) return // Postgres 등 외부 DB를 쓰는 경우는 건드리지 않음

  const target = '/tmp/weddit-lite.db'

  // 소스 DB 파일 찾기: (1) DATABASE_URL이 file:로 주어졌다면 그 경로, (2) prisma/dev.db, (3) dev.db
  const candidates: string[] = []
  if (url && url.startsWith('file:')) {
    const raw = url.slice('file:'.length)
    // file:./prisma/dev.db 형태 대응
    const resolved = path.isAbsolute(raw) ? raw : path.resolve(process.cwd(), raw)
    candidates.push(resolved)
  }
  candidates.push(path.resolve(process.cwd(), 'prisma', 'dev.db'))
  candidates.push(path.resolve(process.cwd(), 'dev.db'))

  const source = candidates.find((p) => fs.existsSync(p))
  if (!source) {
    // 여기서 억지로 DATABASE_URL을 세팅하면 더 헷갈리므로, Prisma 원래 에러가 뜨게 둔다.
    return
  }

  try {
    // /tmp에 복사(없거나, 사이즈가 다르면 갱신)
    const needCopy =
      !fs.existsSync(target) ||
      fs.statSync(target).size !== fs.statSync(source).size
    if (needCopy) {
      fs.copyFileSync(source, target)
    }
    process.env.DATABASE_URL = `file:${target}`
  } catch {
    // 복사 실패 시에는 Prisma가 원래 경로를 쓰도록 둔다(로그는 API에서 확인)
  }
}

ensureSqliteDbOnVercel()

export const prisma: PrismaClient = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

