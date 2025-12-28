import Link from 'next/link'
import Reveal from '@/components/Reveal'

export default async function V2StoryPage({ params }: { params: { slug: string } }) {
  const { slug } = params
  const title = decodeURIComponent(slug).replace(/-/g, ' ')

  return (
    <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
      <Reveal>
        <div className="rounded-3xl border border-black/10 bg-white/85 backdrop-blur-sm shadow-sm p-6 sm:p-8">
          <div className="text-sm text-gray-600">가이드</div>
          <h1 className="mt-1 text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900">
            {title}
          </h1>
          <p className="mt-4 text-lg text-gray-700 leading-relaxed">
            결혼 준비에서 예산을 흔드는 건 “추가금/옵션”입니다. 업체 비교 전에 아래 체크리스트로 총액 기준을 잡아보세요.
          </p>

          <ul className="mt-5 space-y-2 text-gray-700">
            <li>• 담당자 지정 비용, 촬영 추가(야외/시간), 원본/보정 추가 비용 확인</li>
            <li>• 패키지 포함/미포함 항목 체크(필수 옵션 분리)</li>
            <li>• 계약 전 “총액 기준”으로 비교하기</li>
          </ul>

          <div className="mt-8 flex items-center justify-between gap-4 flex-wrap border-t border-black/10 pt-6">
            <Link
              href="/v2"
              className="px-4 py-2 rounded-full border border-black/10 bg-white hover:bg-gray-50 transition-colors font-semibold text-gray-900"
            >
              ← v2 홈
            </Link>
            <Link
              href="/v2#compare"
              className="px-4 py-2 rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-colors font-semibold"
            >
              가격 비교하러 가기 →
            </Link>
          </div>
        </div>
      </Reveal>
    </main>
  )
}


