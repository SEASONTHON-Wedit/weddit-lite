import Image from 'next/image'
import Link from 'next/link'
import Reveal from '@/components/Reveal'

export default async function StoryPage({
  params,
}: {
  params: { slug: string }
}) {
  const { slug } = params

  return (
    <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
      <Reveal>
        <div className="panel-contrast rounded-3xl overflow-hidden border border-white/20">
          <div className="relative h-56 sm:h-72">
            <Image
              src="/mockImage/wedding2.png"
              alt="스토리 헤더 이미지"
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/0" />
            <div className="absolute left-6 bottom-6 text-shadow">
              <div className="text-sm text-white/90">STORY</div>
              <h1 className="mt-1 text-3xl sm:text-4xl font-semibold tracking-tight text-white">
                {decodeURIComponent(slug).replace(/-/g, ' ')}
              </h1>
            </div>
          </div>

          <div className="p-6 sm:p-8 text-shadow">
            <p className="text-white/90 leading-relaxed text-lg">
              결혼 준비에서 가장 예산이 흔들리는 지점은 “추가금/옵션”입니다.
              Weddit Lite 가이드는 업체 비교 전에 꼭 확인해야 할 포인트를 짧고 명확하게 정리합니다.
            </p>
            <ul className="mt-5 space-y-2 text-white/90 text-shadow">
              <li>• 담당자 지정 비용, 촬영 추가, 헤어/메이크업 추가 등 옵션 가격 확인</li>
              <li>• 패키지에 포함/미포함 항목 체크</li>
              <li>• 계약 전 “총액 기준”으로 비교하기</li>
            </ul>

            <div className="mt-8 flex items-center justify-between gap-4 flex-wrap soft-divider pt-6">
              <Link
                href="/"
                className="px-4 py-2 rounded-full border border-white/45 bg-white/15 hover:bg-white/20 transition-colors font-semibold text-white"
              >
                ← 메인으로
              </Link>
              <Link
                href="/#compare"
                className="px-4 py-2 rounded-full border border-white/55 bg-white/20 hover:bg-white/25 transition-colors font-semibold text-white"
              >
                가격 비교하러 가기 →
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </main>
  )
}


