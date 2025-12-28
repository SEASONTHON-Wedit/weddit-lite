import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const vendor = await prisma.vendor.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            prices: {
              orderBy: {
                price: 'asc',
              },
            },
          },
        },
      },
    })

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }

    return NextResponse.json(vendor)
  } catch (error) {
    console.error('Error fetching vendor:', error)
    return NextResponse.json(
      {
        error: '업체 데이터를 불러오지 못했습니다.',
        hint:
          process.env.VERCEL
            ? 'Vercel에서는 SQLite가 500을 유발할 수 있어요. /tmp로 DB를 복사해서 사용하는 방식 또는 외부 DB(Postgres/Turso)를 권장합니다.'
            : 'DATABASE_URL 설정 및 DB 파일 경로를 확인해주세요.',
      },
      { status: 500 },
    )
  }
}

