import Image from 'next/image'
import Link from 'next/link'

const cards = [
  {
    slug: 'budget-101',
    title: '예산 짜는 법',
    desc: '스드메·홀·예물, 어디서부터 얼마를 잡아야 할까?',
    img: '/mockImage/photoCard1.png',
  },
  {
    slug: 'studio-checklist',
    title: '스튜디오 체크리스트',
    desc: '촬영 전 꼭 확인해야 할 옵션/추가금 포인트 정리',
    img: '/mockImage/photoCard2.png',
  },
  {
    slug: 'dress-fitting',
    title: '드레스 피팅 팁',
    desc: '체형별 추천 실루엣과 피팅 때 질문 리스트',
    img: '/mockImage/photoCard3.png',
  },
  {
    slug: 'hall-tour',
    title: '홀 투어 가이드',
    desc: '계약 전 “이거” 안 보면 나중에 후회합니다',
    img: '/mockImage/photoCard4.png',
  },
]

export default function PhotoCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <Link
          key={c.slug}
          href={`/stories/${c.slug}`}
          className="group relative overflow-hidden rounded-3xl border border-white/30 bg-white/5 hover:bg-white/10 transition-colors"
        >
          <div className="relative h-64 sm:h-72 lg:h-80">
            <Image
              src={c.img}
              alt={c.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              sizes="(max-width: 1024px) 50vw, 25vw"
            />
            {/* 카드 하단 그림자/가독성 */}
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 p-5">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <h4 className="text-2xl font-semibold text-white tracking-tight text-shadow">
                    {c.title}
                  </h4>
                  <p className="mt-2 text-base text-white/90 leading-relaxed text-shadow">
                    {c.desc}
                  </p>
                </div>
                <span className="shrink-0 h-10 w-10 rounded-2xl border border-white/45 bg-white/10 grid place-items-center text-white text-shadow">
                  →
                </span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}


