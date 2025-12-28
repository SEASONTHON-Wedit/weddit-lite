import Link from 'next/link'
import Reveal from '@/components/Reveal'

const notices = [
  {
    id: 'launch',
    date: '2025-12-28',
    title: 'Weddit Lite 베타 오픈 안내',
    body: '공개된 결혼업체 가격과 옵션/추가금을 한 곳에서 비교할 수 있도록 베타를 시작합니다. 데이터는 계속 보강 중이며, 오류/누락은 빠르게 수정하겠습니다.',
  },
  {
    id: 'compare',
    date: '2025-12-28',
    title: '비교함(쿠키 저장) 기능 추가',
    body: '로그인 없이도 업체를 담아두고 다시 확인할 수 있도록, 브라우저 쿠키에 비교함을 저장합니다. 브라우저/기기 변경 시 목록이 달라질 수 있어요.',
  },
]

export default function NoticesPage() {
  return (
    <main className="min-h-screen px-4 sm:px-6 lg:px-8 py-10">
      <Reveal>
        <div className="max-w-3xl mx-auto">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white drop-shadow-[0_6px_18px_rgba(0,0,0,0.45)]">
              공지사항
            </h1>
            <Link href="/" className="text-sm font-semibold text-white/90 underline underline-offset-4">
              홈으로
            </Link>
          </div>
          <p className="mt-3 text-sm sm:text-base text-white/85 drop-shadow-[0_6px_18px_rgba(0,0,0,0.45)]">
            서비스 업데이트와 데이터 반영 현황을 공유합니다.
          </p>
        </div>
      </Reveal>

      <div className="mt-8 max-w-3xl mx-auto space-y-4">
        {notices.map((n) => (
          <Reveal key={n.id}>
            <article className="panel-contrast p-6 sm:p-7">
              <div className="text-xs text-white/75">{n.date}</div>
              <h2 className="mt-2 text-lg sm:text-xl font-semibold text-white">{n.title}</h2>
              <p className="mt-3 text-sm sm:text-base text-white/85 leading-relaxed">{n.body}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </main>
  )
}


