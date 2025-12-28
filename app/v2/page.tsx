'use client'

import HeroV2 from '@/components/HeroV2'
import PhotoCardsLight from '@/components/PhotoCardsLight'
import PriceGoStatsLight from '@/components/PriceGoStatsLight'
import Reveal from '@/components/Reveal'

export default function V2Home() {
  return (
    <div className="min-h-screen">
        {/* 히어로 */}
        <section className="w-full px-4 sm:px-6 lg:px-8 pt-10 sm:pt-20">
          <Reveal>
            <HeroV2 />
          </Reveal>
        </section>

        {/* 통계 */}
        <section id="stats" className="mt-6 sm:mt-14">
          {/* 타이틀은 기존 그리드 정렬 유지 */}
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <Reveal>
              <PriceGoStatsLight />
            </Reveal>
          </div>

          {/* 그래프는 화면 폭을 꽉 채우도록(컨테이너/패딩 제거) */}
          
        </section>

      {/* (서비스 소개 섹션 제거: 히어로를 이미지+탭으로 대체) */}

        {/* 가이드 */}
        <section id="stories" className="w-full px-4 sm:px-6 lg:px-8 mt-6 sm:mt-14">
          <Reveal>
            <div className="flex items-end justify-between gap-6 flex-wrap">
              <div>
                <div className="text-sm text-gray-600">가이드</div>
                <h2 className="mt-1 text-2xl sm:text-4xl font-semibold tracking-tight text-gray-900">
                  추가금/옵션 체크리스트
                </h2>
              </div>
            </div>
            <div className="mt-6">
              <PhotoCardsLight />
            </div>
          </Reveal>
        </section>

        {/* 메인에서는 '가격 비교' 섹션 제거(더 미니멀하게) */}
    </div>
  )
}


