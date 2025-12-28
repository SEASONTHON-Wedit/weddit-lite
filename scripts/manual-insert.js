// 수동으로 데이터를 데이터베이스에 넣는 스크립트
// 사용법: node scripts/manual-insert.js

const { PrismaClient, Category, Region } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('데이터베이스에 데이터 추가 중...')

  // 예시: 스튜디오 업체 추가
  const studio = await prisma.vendor.create({
    data: {
      name: '예시 스튜디오',
      category: 'STUDIO',
      region: 'SEOUL',
      address: '서울시 강남구',
      phone: '02-1234-5678',
      website: 'https://example.com',
      description: '예시 스튜디오 설명',
      items: {
        create: [
          {
            name: '기본 패키지',
            description: '기본 스튜디오 패키지',
            prices: {
              create: [
                {
                  name: '기본',
                  price: 500000,
                  description: '기본 패키지 가격'
                }
              ]
            }
          },
          {
            name: '프리미엄 패키지',
            description: '프리미엄 스튜디오 패키지',
            prices: {
              create: [
                {
                  name: '프리미엄',
                  price: 1000000,
                  description: '프리미엄 패키지 가격'
                }
              ]
            }
          }
        ]
      }
    }
  })

  console.log('✅ 업체 추가 완료:', studio.name)

  // 더 많은 데이터를 추가하려면 아래와 같이 반복하세요
  /*
  const dress = await prisma.vendor.create({
    data: {
      name: '예시 드레스샵',
      category: 'DRESS',
      region: 'SEOUL',
      items: {
        create: [
          {
            name: '웨딩드레스 A',
            prices: {
              create: [
                { name: '대여', price: 300000 },
                { name: '구매', price: 2000000 }
              ]
            }
          }
        ]
      }
    }
  })
  */

  console.log('✅ 모든 데이터 추가 완료!')
}

main()
  .catch((e) => {
    console.error('❌ 오류:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

