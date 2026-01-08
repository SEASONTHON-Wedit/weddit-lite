'use client'

import HeroV2 from '@/components/HeroV2'
import PhotoCardsLight from '@/components/PhotoCardsLight'
import PriceGoStatsLight from '@/components/PriceGoStatsLight'
import Reveal from '@/components/Reveal'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* 히어로 */}
      <section className="w-full pt-10 lg:pt-20">
        <HeroV2 />
      </section>

      {/* 통계 */}
      <section id="stats" className="mt-6 lg:mt-14">
        <div className="w-full px-4 lg:px-8">
          <Reveal>
            <PriceGoStatsLight />
          </Reveal>
        </div>
      </section>

      {/* 가이드 */}
      <section id="stories" className="w-full px-4 lg:px-8 mt-6 lg:mt-14">
        <Reveal>
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <h2 className="mt-1 text-2xl lg:text-4xl font-semibold tracking-tight text-gray-900">
                추가금/옵션 체크리스트
              </h2>
            </div>
          </div>
          <div className="mt-6">
            <PhotoCardsLight />
          </div>
        </Reveal>
      </section>
    </div>
  )
}


