const axios = require('axios')
const cheerio = require('cheerio')
const path = require('path')

// Prisma 클라이언트를 직접 경로로 import
const { PrismaClient, Category, Region } = require(path.join(__dirname, '../node_modules/.prisma/client'))

const prisma = new PrismaClient()

// Google Sheets pubhtml URL
const SHEETS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT-aAdZCZovkL2h_SGmhw8C3P4YArigbsTmlsz0lluzBgyDpJgDx-EHKp_Ni2ZonQl4VKx7DIGue0wc/pubhtml'

// 카테고리 매핑
const categoryMap = {
  '스튜디오': Category.STUDIO,
  '드레스': Category.DRESS,
  '메이크업': Category.MAKEUP,
  '웨딩홀': Category.WEDDING_HALL,
  '스': Category.STUDIO,
  '드': Category.DRESS,
  '메': Category.MAKEUP,
  '홀': Category.WEDDING_HALL,
}

// 지역 매핑
const regionMap = {
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

function parsePrice(priceStr) {
  if (!priceStr) return null
  // 숫자만 추출 (콤마, 원 등 제거)
  const cleaned = priceStr.toString().replace(/[^0-9]/g, '')
  return cleaned ? parseInt(cleaned) : null
}

function parseRegion(regionStr) {
  if (!regionStr) return Region.SEOUL // 기본값
  const str = regionStr.toString().trim()
  for (const [key, value] of Object.entries(regionMap)) {
    if (str.includes(key)) {
      return value
    }
  }
  return Region.SEOUL // 기본값
}

function parseCategory(categoryStr) {
  if (!categoryStr) return Category.STUDIO // 기본값
  const str = categoryStr.toString().trim()
  for (const [key, value] of Object.entries(categoryMap)) {
    if (str.includes(key)) {
      return value
    }
  }
  return Category.STUDIO // 기본값
}

async function importFromSheets() {
  try {
    console.log('Google Sheets에서 데이터 가져오는 중...')
    
    const response = await axios.get(SHEETS_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      },
      maxRedirects: 5
    })
    
    const $ = cheerio.load(response.data)
    const rows = []
    
    // 테이블에서 데이터 추출
    $('table tbody tr').each((index, element) => {
      const cells = []
      $(element).find('td').each((i, cell) => {
        cells.push($(cell).text().trim())
      })
      if (cells.length > 0 && cells.some(c => c)) {
        rows.push(cells)
      }
    })

    if (rows.length === 0) {
      console.error('데이터를 찾을 수 없습니다.')
      return
    }

    console.log(`총 ${rows.length}줄의 데이터를 찾았습니다.`)
    console.log('\n첫 5줄 미리보기:')
    rows.slice(0, 5).forEach((row, idx) => {
      console.log(`${idx + 1}:`, row.slice(0, 5).join(' | '))
    })

    // 헤더는 첫 번째 줄로 가정
    const headers = rows[0] || []
    console.log('\n컬럼:', headers)

    let imported = 0
    let skipped = 0

    // 두 번째 줄부터 데이터 처리
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]
      
      if (row.length === 0 || !row.some(cell => cell)) {
        continue
      }

      try {
        // 데이터 구조 추정 (실제 시트 구조에 맞게 수정 필요)
        // 일반적인 구조: 업체명, 카테고리, 지역, 주소, 전화번호, 아이템명, 가격 등
        const vendorName = row[0] || row[headers.indexOf('업체명')] || row[headers.indexOf('이름')] || row[headers.indexOf('상호')]
        const categoryStr = row[1] || row[headers.indexOf('카테고리')] || row[headers.indexOf('분류')] || row[headers.indexOf('구분')]
        const regionStr = row[2] || row[headers.indexOf('지역')] || row[headers.indexOf('시도')]
        const address = row[3] || row[headers.indexOf('주소')] || row[headers.indexOf('위치')] || null
        const phone = row[4] || row[headers.indexOf('전화번호')] || row[headers.indexOf('연락처')] || null
        const website = row[5] || row[headers.indexOf('웹사이트')] || row[headers.indexOf('홈페이지')] || null
        
        // 아이템 및 가격 정보 (나머지 컬럼들)
        const itemName = row[6] || row[headers.indexOf('아이템')] || row[headers.indexOf('상품명')] || row[headers.indexOf('패키지')] || null
        const priceStr = row[7] || row[headers.indexOf('가격')] || row[headers.indexOf('금액')] || null

        if (!vendorName) {
          skipped++
          continue
        }

        const category = parseCategory(categoryStr)
        const region = parseRegion(regionStr)
        const price = parsePrice(priceStr)

        // 업체 생성 또는 찾기
        let vendor = await prisma.vendor.findFirst({
          where: {
            name: vendorName,
            category: category,
            region: region,
          },
        })

        if (!vendor) {
          vendor = await prisma.vendor.create({
            data: {
              name: vendorName,
              category: category,
              region: region,
              address: address,
              phone: phone,
              website: website,
              description: null,
            },
          })
        }

        // 아이템 및 가격 정보가 있으면 추가
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

          // 가격 정보 추가 (중복 체크)
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
          // 아이템만 있고 가격이 없는 경우
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
        if (imported % 10 === 0) {
          console.log(`${imported}개 업체 처리 완료...`)
        }
      } catch (error) {
        console.error(`줄 ${i + 1} 처리 실패:`, error.message)
        skipped++
      }
    }

    console.log(`\n✅ 총 ${imported}개 업체를 임포트했습니다.`)
    if (skipped > 0) {
      console.log(`⚠️  ${skipped}개 항목을 건너뛰었습니다.`)
    }
  } catch (error) {
    console.error('임포트 실패:', error.message)
    if (error.response) {
      console.error('응답 상태:', error.response.status)
    }
  } finally {
    await prisma.$disconnect()
  }
}

// 실행
if (require.main === module) {
  importFromSheets().catch(console.error)
}

module.exports = { importFromSheets }
