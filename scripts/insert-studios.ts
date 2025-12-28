// 스튜디오 데이터를 데이터베이스에 넣는 스크립트
import 'dotenv/config'
import { PrismaClient, Category, Region } from '@prisma/client'

const prisma = new PrismaClient()

// 가격 파싱 함수 (만원 단위를 원 단위로 변환)
function parsePrice(priceStr: string | number | null | undefined): number | null {
  if (!priceStr) return null
  // 숫자만 추출
  const cleaned = priceStr.toString().replace(/[^0-9~-]/g, '')
  if (!cleaned) return null
  
  // 범위가 있으면 최소값 사용 (예: 130~145 -> 130)
  if (cleaned.includes('~')) {
    const [min] = cleaned.split('~')
    return parseInt(min) * 10000
  }
  
  // 하이픈이 있으면 최소값 사용 (예: 140-165 -> 140)
  if (cleaned.includes('-')) {
    const [min] = cleaned.split('-')
    return parseInt(min) * 10000
  }
  
  return parseInt(cleaned) * 10000
}

// 옵션 파싱 함수
function parseOptions(optionsStr: string | null | undefined): Array<{ name: string; price: number | null }> {
  if (!optionsStr) return []
  
  const options: Array<{ name: string; price: number | null }> = []
  const lines = optionsStr.split('\n').filter(line => line.trim())
  
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue
    
    // 가격 추출 (만원 단위)
    const priceMatch = trimmed.match(/(\d+(?:\.\d+)?)\s*만?\s*원?/g)
    if (priceMatch) {
      for (const match of priceMatch) {
        const price = parseFloat(match.replace(/[^0-9.]/g, '')) * 10000
        const name = trimmed.replace(match, '').trim()
        if (name && price) {
          options.push({ name, price })
        }
      }
    } else {
      // 가격이 명시되지 않은 경우 옵션 이름만 저장
      options.push({ name: trimmed, price: null })
    }
  }
  
  return options
}

const studios = [
  {
    name: '아우라',
    basePrice: 135,
    managerPrice: '11~16.5',
    outdoor: 11,
    night: 11,
    options: `5시간 외 추가시 1시간당 11
의상 1벌 투가시 10
들러리 촬영 1인 11
애견 동반 촬영 5.5`
  },
  {
    name: '르안스튜디오',
    basePrice: 138,
    managerPrice: 10,
    outdoor: 11,
    night: 11,
    options: `5시간 이상 촬영시 1시간당 11
들러리 촬영 1인당 5.5`
  },
  {
    name: '페레',
    basePrice: 145,
    managerPrice: '22~99',
    outdoor: 22,
    night: 22,
    options: `의상 추가시 1벌당 11
들러리 촬영 1인 11`
  },
  {
    name: '테라스 스튜디오',
    basePrice: '130~145',
    managerPrice: '30~50',
    outdoor: 11,
    night: 11,
    options: `선수정본 5장 5만 5천원
주간 로드씬 촬영 비용 11만원
야간전구씬 + 프로젝트씬 11만원`
  },
  {
    name: '보어하우스',
    basePrice: '165~187',
    managerPrice: '11~55',
    outdoor: 33,
    night: null,
    options: `로드씬 33만원 추가
의상 추가 22만원`
  },
  {
    name: '비포원',
    basePrice: '136~149',
    managerPrice: null,
    outdoor: 11,
    night: null,
    options: `선수정본 5장 5.5
애견촬영 1마리당 5.5
들러리 촬영 1인 5.5
의상 1벌 추가시 11`
  },
  {
    name: '글렌하우스',
    basePrice: '151~173',
    managerPrice: '11~16.5',
    outdoor: 11,
    night: null,
    options: `5시간 외 추가시 1시간당 11
의상 1벌 투가시 10
들러리 촬영 1인 11
애견 동반 촬영 5.5`
  },
  {
    name: '아르센',
    basePrice: '157~167',
    managerPrice: '11~16.5',
    outdoor: 11,
    night: null,
    options: `5시간 외 추가시 1시간당 11
의상 1벌 투가시 10
들러리 촬영 1인 11
애견 동반 촬영 5.5`
  },
  {
    name: '아키 스튜디오',
    basePrice: 140,
    managerPrice: '11~22',
    outdoor: 11,
    night: null,
    options: `의상추가 1벌당 22
들러리 촬영 1인 11
서브추가(2시간) : 11
6시간 이후 추가 촬영 시간당 22`
  },
  {
    name: '줄리의정원',
    basePrice: '142~162',
    managerPrice: '5.5~11',
    outdoor: null,
    night: null,
    options: `의상 추가 1벌당 11
촬영시간 추가 : 일반 5시간 30분 촬영,
세미 2시간 30분 촬영부터 30분당 5.5`
  },
  {
    name: '메이든스튜디오',
    basePrice: '135~166',
    managerPrice: '11~33',
    outdoor: 11,
    night: null,
    options: `로드씬 : 110,000원
야간씬 : 포함
들러리 비용: 40만원 (4인기준, 1인추가 +10만원)
의상 1벌 : 110,000원`
  },
  {
    name: '플레하우스',
    basePrice: '150~160',
    managerPrice: '11~22',
    outdoor: 11,
    night: null,
    options: `의상 추가 1벌당 22
들러리 촬영 1 인당 11
서브추가 (2시간 촬영) 11
6시간 이후 추가 촬영 -1시간당 22`
  },
  {
    name: '소율',
    basePrice: '145~165',
    managerPrice: '33~55',
    outdoor: null,
    night: 10,
    options: `소율 스냅 작가 추가시 22
촬영의상 5벌 / 추가시 1벌당 11
들러리 촬영시 인당 22
애견동반 촬영 1마리 한정 추가비용 11`
  },
  {
    name: '라크마스튜디오',
    basePrice: '140-165',
    managerPrice: '5.5~11',
    outdoor: null,
    night: null,
    options: `의상 추가 1벌당 11
촬영시간 추가 : 일반 5시간 30분 촬영,
세미 2시간 30분 촬영부터 30분당 5.5`
  },
  {
    name: '스튜디오랑게',
    basePrice: 135,
    managerPrice: '11~22',
    outdoor: 11,
    night: null,
    options: `의상추가 1벌당 22
들러리 촬영) 11
서브추가(2시간) 11
6시간 이후 추가 촬영 시간당 22`
  },
  {
    name: '레이디로즈',
    basePrice: '145-170',
    managerPrice: '33~55',
    outdoor: 22,
    night: null,
    options: `들러리 촬영 3인 기준 22/ 1명 추가시 11
의상 1벌 추가시 11
반려견 동반 촬영 11 (2마리 기준)`
  },
  {
    name: '디하우스',
    basePrice: '168~188',
    managerPrice: '22~99',
    outdoor: 22,
    night: 22,
    options: `의상 추가 1벌당 11
들러리 촬영 1인 11
촬영시간 5시간 이상 경과시 11`
  },
  {
    name: '멜린스튜디오',
    basePrice: 172,
    managerPrice: '33~55',
    outdoor: null,
    night: 11,
    options: `벌수 1벌당 11
앨범 장수 1장당 3.3 / 액자 변경 15~48
서브스냅 22
들러리 촬영 22 / 반려견 촬영 22`
  },
  {
    name: '비슈어',
    basePrice: '180~185',
    managerPrice: '11~33',
    outdoor: null,
    night: 22,
    options: `의상 1벌 추가시 벌당 11
들러리 1인 11
서브스냅 : 2시간 16. 5 / 4시간 33
선수정컷 5컷 : 11`
  },
  {
    name: '아테소',
    basePrice: '200~385',
    managerPrice: '11~110',
    outdoor: null,
    night: null,
    options: null
  },
  {
    name: '노우드',
    basePrice: '130~220',
    managerPrice: '11~55',
    outdoor: 33,
    night: null,
    options: `의상 1벌 추가 : 22
들러리 촬영 1인당 22/3인 이상시 인당 15
야외 근교 촬영 1시간 33`
  },
  {
    name: '로그에이',
    basePrice: '330~440',
    managerPrice: null,
    outdoor: null,
    night: null,
    options: `의상 1벌 추가시 22
스타일리스트 진행 추가시 33
(드레스 1벌, 2시간 기준)→1시간 진행 추가시 22`
  },
  {
    name: '어바이드',
    basePrice: 'A타입 187\nB타입 230',
    managerPrice: '22~110',
    outdoor: null,
    night: null,
    options: `의상(드레스) 1벌 추가 22만원
RAW 파일 구매 22만원`
  },
  {
    name: '바로오늘이그날',
    basePrice: 165,
    managerPrice: '20~50',
    outdoor: null,
    night: null,
    options: null
  },
  {
    name: '볼라르',
    basePrice: '160~380',
    managerPrice: '15~40',
    outdoor: null,
    night: null,
    options: `의상 1벌 추가 15만원
들러리 촬영시 2인 기준 30만원, 1인 추가시 10만원
반려견 촬영시 1시간 11만원`
  },
  {
    name: '꼼세보마리아주',
    basePrice: '165~450',
    managerPrice: 77,
    outdoor: null,
    night: null,
    options: `컨페티 촬영 33
리터치 10컷 추가 44
10P앨범 1권 제작 33
앨범 2페이지 추가 5
리터치 1컷 추가 5.5
고속 납품 10주 > 2주 33`
  }
]

async function main() {
  console.log('스튜디오 데이터 추가 중...')
  
  let success = 0
  let failed = 0

  for (const studio of studios) {
    try {
      // 기본 가격 파싱
      const basePrice = parsePrice(studio.basePrice)
      
      // 업체 생성 또는 찾기
      let vendor = await prisma.vendor.findFirst({
        where: {
          name: studio.name,
          category: Category.STUDIO,
        }
      })

      if (!vendor) {
        vendor = await prisma.vendor.create({
          data: {
            name: studio.name,
            category: Category.STUDIO,
            region: Region.SEOUL, // 기본값으로 서울 설정
            description: null,
          }
        })
      }

      // 기본 패키지 아이템 생성
      if (basePrice) {
        let baseItem = await prisma.item.findFirst({
          where: {
            vendorId: vendor.id,
            name: '기본 패키지',
          }
        })

        if (!baseItem) {
          baseItem = await prisma.item.create({
            data: {
              vendorId: vendor.id,
              name: '기본 패키지',
              description: '기본 촬영 패키지 (앨범 20P, 액자 20R 기준)',
            }
          })
        }

        // 기본 가격 추가
        const existingBasePrice = await prisma.price.findFirst({
          where: {
            itemId: baseItem.id,
            price: basePrice,
          }
        })

        if (!existingBasePrice) {
          await prisma.price.create({
            data: {
              itemId: baseItem.id,
              name: '기본',
              price: basePrice,
              description: '기본 가격',
            }
          })
        }
      }

      // 옵션 아이템들 추가
      const optionItems: Array<{ name: string; price: number; description?: string | null }> = []
      
      // 담당자 지정
      if (studio.managerPrice) {
        const managerPrice = parsePrice(studio.managerPrice)
        if (managerPrice) {
          optionItems.push({
            name: '담당자 지정',
            price: managerPrice,
            description: '담당자 지정 추가 비용'
          })
        }
      }

      // 야외 촬영
      if (studio.outdoor) {
        optionItems.push({
          name: '야외 촬영',
          price: studio.outdoor * 10000,
          description: '야외 촬영 추가 비용'
        })
      }

      // 야간 촬영
      if (studio.night) {
        optionItems.push({
          name: '야간 촬영',
          price: studio.night * 10000,
          description: '야간 촬영 추가 비용'
        })
      }

      // 기타 옵션 파싱
      if (studio.options) {
        const options = parseOptions(studio.options)
        for (const opt of options) {
          if (opt.price) {
            optionItems.push({
              name: opt.name,
              price: opt.price,
              description: null
            })
          }
        }
      }

      // 옵션 아이템들 저장
      for (const option of optionItems) {
        if (!option.name || !option.price) continue

        let optionItem = await prisma.item.findFirst({
          where: {
            vendorId: vendor.id,
            name: option.name,
          }
        })

        if (!optionItem) {
          optionItem = await prisma.item.create({
            data: {
              vendorId: vendor.id,
              name: option.name,
              description: option.description || null,
            }
          })
        }

        const existingPrice = await prisma.price.findFirst({
          where: {
            itemId: optionItem.id,
            price: option.price,
          }
        })

        if (!existingPrice) {
          await prisma.price.create({
            data: {
              itemId: optionItem.id,
              name: null,
              price: option.price,
              description: null,
            }
          })
        }
      }

      success++
      console.log(`✅ ${studio.name} 추가 완료`)
    } catch (error: any) {
      failed++
      console.error(`❌ ${studio.name} 추가 실패:`, error.message)
    }
  }

  console.log(`\n완료! 성공: ${success}, 실패: ${failed}`)
}

main()
  .catch((e) => {
    console.error('오류:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

