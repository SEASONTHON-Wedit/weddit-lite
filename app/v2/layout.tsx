import type { Metadata } from 'next'
import FooterV2 from '@/components/FooterV2'

export const metadata: Metadata = {
  title: 'Weddit Lite (v2) | 결혼업체 가격 비교',
  description: '라이트 톤 UI(v2)에서 결혼업체 가격과 옵션 추가금을 비교하세요.',
}

export default function V2Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* v2 배경: 과한 효과 제거(잔디를 “완전” 덮는 흰 배경) */}
      <div aria-hidden="true" className="fixed inset-0 z-0 bg-white" />
      <div aria-hidden="true" className="fixed inset-x-0 top-0 z-0 h-56 bg-gradient-to-b from-emerald-50/70 to-transparent" />
      <div className="relative z-10">
        {children}
        <FooterV2 />
      </div>
    </div>
  )
}


