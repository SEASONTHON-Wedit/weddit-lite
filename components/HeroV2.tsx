'use client'

import { Category } from '@/types'
import Image from 'next/image'
import { useEffect, useMemo, useRef, useState } from 'react'

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
    <>
      {/* ===== 모바일/태블릿: 배경형(이미지가 텍스트 "뒤"에 위치) ===== */}
      <button
        type="button"
        onClick={() => {
          pauseUntilRef.current = Date.now() + 6500
          setActive((v) => (v + 1) % n)
        }}
        className="relative w-full overflow-hidden bp-mobile-only text-left"
        aria-label="다음 카드 보기"
      >
        <div aria-hidden="true" className="absolute inset-0">
          {cards.map((c, i) => {
            const isOn = i === active
            return (
              <Image
                key={c.category}
                src={c.img}
                alt=""
                fill
                priority={i === 0}
                className={`object-cover transition-opacity duration-500 ease-out ${isOn ? 'opacity-100' : 'opacity-0'}`}
                sizes="100vw"
              />
            )
          })}

          {/* 상단/좌측 텍스트 가독성 오버레이 */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(90deg, rgba(0,0,0,0.64) 0%, rgba(0,0,0,0.36) 45%, rgba(0,0,0,0.0) 75%)',
            }}
          />

          {/* 하단 캡션 가독성 */}
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/55 via-black/20 to-transparent" />

          {/* 하단 캡션 */}
          <div className="absolute left-4 bottom-4 text-white pointer-events-none">
            <div className="text-xs text-white/85">{current.label}</div>
            <div className="mt-1 text-base font-semibold leading-snug break-keep whitespace-nowrap overflow-hidden text-ellipsis max-w-[44ch]">
              {current.line}
            </div>
          </div>
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4">
          <div className="min-h-[260px] pt-10 pb-14 flex flex-col justify-start">
            <div className="text-base text-white/80 tracking-wide">가격 공개 시대, 옵션/추가금까지</div>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white leading-[1.12] text-shadow">
              <span className="block">결혼업체 가격,</span>
              <span className="block mt-3 whitespace-nowrap">
                이제는 비교가 기준.
              </span>
            </h1>
          </div>
        </div>
      </button>

      {/* ===== 데스크탑(lg+): 풀블리드 배경형(이미지는 좌측 40%부터 시작) ===== */}
      <div className="relative w-full overflow-hidden bp-desktop-only">
        <div aria-hidden="true" className="absolute inset-0">
          {/* 배경 이미지: 데스크탑에서는 텍스트 "뒤"에 풀블리드로 깔리도록 */}
          <div className="absolute inset-0">
            {cards.map((c, i) => {
              const isOn = i === active
              return (
                <Image
                  key={c.category}
                  src={c.img}
                  alt=""
                  fill
                  priority={i === 0}
                  className={`object-cover transition-opacity duration-500 ease-out ${isOn ? 'opacity-100' : 'opacity-0'}`}
                  sizes="100vw"
                />
              )
            })}

            {/* 좌측 텍스트 가독성 확보용 오버레이(완전 흰색으로 가리지 않고 "보이게" 유지) */}
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'linear-gradient(90deg, rgba(0,0,0,0.64) 0%, rgba(0,0,0,0.36) 45%, rgba(0,0,0,0.0) 75%)',
              }}
            />

            {/* 하단 캡션 가독성 */}
            <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />

            {/* 하단 캡션 */}
            <div className="absolute left-6 bottom-6 text-white pointer-events-none">
              <div className="text-sm text-white/85">{current.label}</div>
              <div className="mt-1 text-xl font-semibold leading-snug break-keep whitespace-nowrap overflow-hidden text-ellipsis max-w-[44ch]">
                {current.line}
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 lg:px-8">
          <div className="min-h-[480px] py-10 flex flex-col justify-start">
            <div className="text-base text-white/80 tracking-wide">가격 공개 시대, 옵션/추가금까지</div>
            <h1 className="mt-4 text-6xl font-extrabold tracking-tight text-white leading-[1.12] text-shadow">
              <span className="block">결혼업체 가격,</span>
              <span className="block mt-3 whitespace-nowrap">
                이제는 비교가 기준.
              </span>
            </h1>
          </div>
        </div>

        {/*
          기존 데스크탑 버전은 이미지가 좌측 40% 이후에만 보여서 "텍스트 뒤" 느낌이 약했음.
          현재 구현은 이미지가 전체 영역에 깔리고, 텍스트는 오버레이 + z-index로 위에 올라감.
        */}
      </div>
    </>
  )
}


