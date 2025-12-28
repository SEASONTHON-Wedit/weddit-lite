'use client'

import Image from 'next/image'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Category } from '@/types'

type HeroCard = {
  category: Category
  label: string
  img: string
  line: string
}

export default function HeroV2() {
  const cards = useMemo<HeroCard[]>(
    () => [
      {
        category: Category.STUDIO,
        label: '스튜디오',
        img: '/mockImage/wedding1.png',
        line: '촬영 패키지 + 추가 보정/원본/야외 촬영 옵션',
      },
      {
        category: Category.DRESS,
        label: '드레스',
        img: '/mockImage/wedding2.png',
        line: '피팅/업그레이드/수선 등 추가금까지 한 번에',
      },
      {
        category: Category.MAKEUP,
        label: '메이크업',
        img: '/mockImage/wedding3.png',
        line: '담당자 지정/헤어변형/출장비 등 옵션 확인',
      },
      {
        category: Category.WEDDING_HALL,
        label: '웨딩홀',
        img: '/mockImage/photoCard4.png',
        line: '대관/식대/기본장식/필수 옵션을 분리해서 비교',
      },
    ],
    [],
  )

  const [active, setActive] = useState(0)
  const n = cards.length
  const current = cards[active % n]
  const pauseUntilRef = useRef(0)

  useEffect(() => {
    const id = window.setInterval(() => {
      if (Date.now() < pauseUntilRef.current) return
      setActive((v) => (v + 1) % n)
    }, 5200)
    return () => window.clearInterval(id)
  }, [n])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
      <div className="lg:col-span-6">
        <div className="text-sm text-gray-500 tracking-wide">가격 공개 시대, 옵션/추가금까지</div>
        <h1 className="mt-4 text-3xl sm:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.12]">
          <span className="block">결혼업체 가격,</span>
          <span className="block mt-3">
            이제는 비교가 기준.
            <span aria-hidden="true" className="inline-flex items-center align-middle ml-3 h-[0.75em]">
              <span className="hero-dot hero-dot1" />
              <span className="hero-dot hero-dot2" />
              <span className="hero-dot hero-dot3" />
            </span>
          </span>
        </h1>
      </div>

      <div className="lg:col-span-6">
        <button
          type="button"
          onClick={() => {
            pauseUntilRef.current = Date.now() + 6500
            setActive((v) => (v + 1) % n)
          }}
          className="w-full text-left rounded-3xl border border-black/10 bg-white/85 backdrop-blur-sm shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          aria-label="다음 카드 보기"
        >
          <div className="relative h-56 sm:h-80">
            {/* 모든 이미지를 항상 마운트(깜빡임 방지). opacity만 전환 */}
            {cards.map((c, i) => {
              const isOn = i === active
              return (
                <Image
                  key={c.category}
                  src={c.img}
                  alt={`${c.label} 예시 이미지`}
                  fill
                  priority={i === 0}
                  className={`object-cover transition-opacity duration-500 ease-out ${
                    isOn ? 'opacity-100' : 'opacity-0'
                  }`}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              )
            })}

            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-black/0" />

            {/* 모든 텍스트도 항상 마운트. opacity만 전환 */}
            <div className="absolute left-4 bottom-4 text-white">
              {cards.map((c, i) => {
                const isOn = i === active
                return (
                  <div
                    key={c.category}
                    className={`absolute left-0 bottom-0 transition-opacity duration-500 ease-out ${
                      isOn ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <div className="text-sm opacity-90">{c.label}</div>
                    <div className="mt-1 text-lg sm:text-xl font-semibold leading-snug break-keep whitespace-nowrap overflow-hidden text-ellipsis max-w-[44ch]">
                      {c.line}
                    </div>
                  </div>
                )
              })}
              {/* 레이아웃 기준점(absolute 스택 높이 확보) */}
              <div className="invisible">
                <div className="text-sm opacity-90">{current.label}</div>
                <div className="mt-1 text-lg sm:text-xl font-semibold leading-snug break-keep whitespace-nowrap overflow-hidden text-ellipsis max-w-[44ch]">
                  {current.line}
                </div>
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>
  )
}


