import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import * as cheerio from 'cheerio'
import { prisma } from '@/lib/prisma'
import { Category, Region } from '@/types'

const SHEETS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT-aAdZCZovkL2h_SGmhw8C3P4YArigbsTmlsz0lluzBgyDpJgDx-EHKp_Ni2ZonQl4VKx7DIGue0wc/pubhtml'

const categoryMap: Record<string, Category> = {
  '스튜디오': Category.STUDIO,
  '드레스': Category.DRESS,
  '메이크업': Category.MAKEUP,
  '웨딩홀': Category.WEDDING_HALL,
  '스': Category.STUDIO,
  '드': Category.DRESS,
  '메': Category.MAKEUP,
  '홀': Category.WEDDING_HALL,
}

const regionMap: Record<string, Region> = {
  '서울': Region.SEOUL,
  '경기': Region.GYEONGGI,
  '부산': Region.BUSAN,
  '대구': Region.DAEGU,
  '인천': Region.INCHEON,
  '광주': Region.GWANGJU,
  '대전': Region.DAEJEON,
  '울산': Region.ULSAN,
  '강원': Region.GANGWON,
  '충북': Region.CHUNGBUK,
  '충남': Region.CHUNGNAM,
  '전북': Region.JEONBUK,
  '전남': Region.JEONNAM,
  '경북': Region.GYEONGBUK,
  '경남': Region.GYEONGNAM,
  '제주': Region.JEJU,
}

function parsePrice(priceStr: string | null): number | null {
  if (!priceStr) return null
  const cleaned = priceStr.toString().replace(/[^0-9]/g, '')
  return cleaned ? parseInt(cleaned) : null
}

function parseRegion(regionStr: string | null): Region {
  if (!regionStr) return Region.SEOUL
  const str = regionStr.toString().trim()
  for (const [key, value] of Object.entries(regionMap)) {
    if (str.includes(key)) {
      return value
    }
  }
  return Region.SEOUL
}

function parseCategory(categoryStr: string | null): Category {
  if (!categoryStr) return Category.STUDIO
  const str = categoryStr.toString().trim()
  for (const [key, value] of Object.entries(categoryMap)) {
    if (str.includes(key)) {
      return value
    }
  }
  return Category.STUDIO
}

export async function POST(request: NextRequest) {
  try {
    console.log('Google Sheets에서 데이터 가져오는 중...')
    
    const response = await axios.get(SHEETS_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      },
      maxRedirects: 5
    })
    
    const $ = cheerio.load(response.data)
    const rows: string[][] = []
    
    $('table tbody tr').each((index, element) => {
      const cells: string[] = []
      $(element).find('td').each((i, cell) => {
        cells.push($(cell).text().trim())
      })
      if (cells.length > 0 && cells.some(c => c)) {
        rows.push(cells)
      }
    })

    if (rows.length === 0) {
      return NextResponse.json({ error: '데이터를 찾을 수 없습니다.' }, { status: 404 })
    }

    const headers = rows[0] || []
    let imported = 0
    let skipped = 0

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]
      
      if (row.length === 0 || !row.some(cell => cell)) {
        continue
      }

      try {
        const vendorName = row[0] || row[headers.indexOf('업체명')] || row[headers.indexOf('이름')] || row[headers.indexOf('상호')]
        const categoryStr = row[1] || row[headers.indexOf('카테고리')] || row[headers.indexOf('분류')] || row[headers.indexOf('구분')]
        const regionStr = row[2] || row[headers.indexOf('지역')] || row[headers.indexOf('시도')]
        const address = row[3] || row[headers.indexOf('주소')] || row[headers.indexOf('위치')] || null
        const phone = row[4] || row[headers.indexOf('전화번호')] || row[headers.indexOf('연락처')] || null
        const website = row[5] || row[headers.indexOf('웹사이트')] || row[headers.indexOf('홈페이지')] || null
        
        const itemName = row[6] || row[headers.indexOf('아이템')] || row[headers.indexOf('상품명')] || row[headers.indexOf('패키지')] || null
        const priceStr = row[7] || row[headers.indexOf('가격')] || row[headers.indexOf('금액')] || null

        if (!vendorName) {
          skipped++
          continue
        }

        const category = parseCategory(categoryStr)
        const region = parseRegion(regionStr)
        const price = parsePrice(priceStr)

        let vendor = await prisma.vendor.findFirst({
          where: {
            name: vendorName,
            category: category as any,
            region: region as any,
          },
        })

        if (!vendor) {
          vendor = await prisma.vendor.create({
            data: {
              name: vendorName,
              category: category as any,
              region: region as any,
              address: address,
              phone: phone,
              website: website,
              description: null,
            },
          })
        }

        if (itemName && price) {
          let item = await prisma.item.findFirst({
            where: {
              vendorId: vendor.id,
              name: itemName,
            },
          })

          if (!item) {
            item = await prisma.item.create({
              data: {
                vendorId: vendor.id,
                name: itemName,
                description: null,
              },
            })
          }

          const existingPrice = await prisma.price.findFirst({
            where: {
              itemId: item.id,
              price: price,
            },
          })

          if (!existingPrice) {
            await prisma.price.create({
              data: {
                itemId: item.id,
                name: null,
                price: price,
                description: null,
              },
            })
          }
        } else if (itemName) {
          let item = await prisma.item.findFirst({
            where: {
              vendorId: vendor.id,
              name: itemName,
            },
          })

          if (!item) {
            await prisma.item.create({
              data: {
                vendorId: vendor.id,
                name: itemName,
                description: null,
              },
            })
          }
        }

        imported++
      } catch (error: any) {
        console.error(`줄 ${i + 1} 처리 실패:`, error.message)
        skipped++
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      skipped,
      total: rows.length - 1,
    })
  } catch (error: any) {
    console.error('임포트 실패:', error)
    return NextResponse.json(
      { error: error.message || '임포트 실패' },
      { status: 500 }
    )
  }
}

