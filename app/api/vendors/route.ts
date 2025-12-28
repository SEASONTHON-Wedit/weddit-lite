import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const region = searchParams.get('region')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')

    const where: any = {}

    if (category) {
      where.category = category
    }

    if (region) {
      where.region = region
    }

    const vendors = await prisma.vendor.findMany({
      where,
      include: {
        items: {
          include: {
            prices: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    // 가격 필터링 (클라이언트 사이드에서도 가능하지만 서버에서 필터링)
    let filteredVendors = vendors

    if (minPrice || maxPrice) {
      filteredVendors = vendors.filter((vendor: any) => {
        const allPrices = vendor.items.flatMap((item: any) => item.prices.map((p: any) => p.price))
        if (allPrices.length === 0) return false

        const minItemPrice = Math.min(...allPrices)
        const maxItemPrice = Math.max(...allPrices)

        if (minPrice && maxItemPrice < parseInt(minPrice)) return false
        if (maxPrice && minItemPrice > parseInt(maxPrice)) return false

        return true
      })
    }

    return NextResponse.json(filteredVendors)
  } catch (error) {
    console.error('Error fetching vendors:', error)
    return NextResponse.json({ error: 'Failed to fetch vendors' }, { status: 500 })
  }
}

