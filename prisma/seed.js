const { PrismaClient, Category, Region } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  // 샘플 업체 데이터
  const studio1 = await prisma.vendor.create({
    data: {
      name: '로맨틱 스튜디오',
      category: Category.STUDIO,
      region: Region.SEOUL,
      address: '서울시 강남구 테헤란로 123',
      phone: '02-1234-5678',
      website: 'https://romantic-studio.com',
      description: '프리미엄 웨딩 스튜디오',
      items: {
        create: [
          {
            name: '기본 패키지',
            description: '기본 웨딩 촬영',
            prices: {
              create: [
                { name: '평일', price: 1500000 },
                { name: '주말', price: 2000000 },
              ],
            },
          },
          {
            name: '프리미엄 패키지',
            description: '프리미엄 웨딩 촬영 + 드레스',
            prices: {
              create: [
                { name: '평일', price: 3000000 },
                { name: '주말', price: 3500000 },
              ],
            },
          },
        ],
      },
    },
  })

  const studio2 = await prisma.vendor.create({
    data: {
      name: '드림 웨딩 스튜디오',
      category: Category.STUDIO,
      region: Region.GYEONGGI,
      address: '경기도 성남시 분당구 정자동 456',
      phone: '031-1234-5678',
      description: '자연스러운 웨딩 촬영',
      items: {
        create: [
          {
            name: '기본 패키지',
            prices: {
              create: [{ name: '기본', price: 1200000 }],
            },
          },
        ],
      },
    },
  })

  const dress1 = await prisma.vendor.create({
    data: {
      name: '엘레강스 드레스샵',
      category: Category.DRESS,
      region: Region.SEOUL,
      address: '서울시 강남구 청담동 789',
      phone: '02-2345-6789',
      description: '명품 웨딩드레스 대여',
      items: {
        create: [
          {
            name: '베이직 드레스',
            prices: {
              create: [
                { name: '1일 대여', price: 500000 },
                { name: '3일 대여', price: 1200000 },
              ],
            },
          },
          {
            name: '디자이너 드레스',
            prices: {
              create: [
                { name: '1일 대여', price: 1500000 },
                { name: '3일 대여', price: 3500000 },
              ],
            },
          },
        ],
      },
    },
  })

  const makeup1 = await prisma.vendor.create({
    data: {
      name: '뷰티 메이크업',
      category: Category.MAKEUP,
      region: Region.SEOUL,
      address: '서울시 강남구 역삼동 321',
      phone: '02-3456-7890',
      description: '프로페셔널 웨딩 메이크업',
      items: {
        create: [
          {
            name: '기본 메이크업',
            prices: {
              create: [{ name: '기본', price: 300000 }],
            },
          },
          {
            name: '프리미엄 메이크업',
            prices: {
              create: [{ name: '기본', price: 600000 }],
            },
          },
        ],
      },
    },
  })

  const hall1 = await prisma.vendor.create({
    data: {
      name: '그랜드 웨딩홀',
      category: Category.WEDDING_HALL,
      region: Region.SEOUL,
      address: '서울시 강남구 논현동 654',
      phone: '02-4567-8901',
      website: 'https://grand-wedding.com',
      description: '럭셔리 웨딩홀',
      items: {
        create: [
          {
            name: '스몰홀 (50석)',
            prices: {
              create: [
                { name: '평일', price: 3000000 },
                { name: '주말', price: 5000000 },
              ],
            },
          },
          {
            name: '라지홀 (100석)',
            prices: {
              create: [
                { name: '평일', price: 5000000 },
                { name: '주말', price: 8000000 },
              ],
            },
          },
        ],
      },
    },
  })

  console.log('샘플 데이터가 생성되었습니다!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

