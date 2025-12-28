import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Category, Region } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { name, category, region, address, phone, website, description, itemName, price } = body

    if (!name || !category || !region) {
      return NextResponse.json(
        { error: '업체명, 카테고리, 지역은 필수입니다.' },
        { status: 400 }
      )
    }

    if (!Object.values(Category).includes(category)) {
      return NextResponse.json({ error: '유효하지 않은 카테고리입니다.' }, { status: 400 })
    }
    if (!Object.values(Region).includes(region)) {
      return NextResponse.json({ error: '유효하지 않은 지역입니다.' }, { status: 400 })
    }

    // 업체 생성
    const vendor = await prisma.vendor.create({
      data: {
        name,
        category: category as any,
        region: region as any,
        address: address || null,
        phone: phone || null,
        website: website || null,
        description: description || null,
        items: itemName
          ? {
              create: [
                {
                  name: itemName,
                  description: null,
                  prices: price
                    ? {
                        create: [
                          {
                            name: null,
                            price: parseInt(price),
                            description: null,
                          },
                        ],
                      }
                    : undefined,
                },
              ],
            }
          : undefined,
      },
    })

    return NextResponse.json({
      success: true,
      vendor,
      message: '업체가 성공적으로 추가되었습니다.',
    })
  } catch (error: any) {
    console.error('업체 추가 오류:', error)
    return NextResponse.json(
      { error: error.message || '업체 추가 실패' },
      { status: 500 }
    )
  }
}

