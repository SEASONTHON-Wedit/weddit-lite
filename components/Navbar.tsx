'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

const navItems = [
  { href: '/', label: '홈' },
  { href: '/vendors', label: '업체' },
]

export default function Navbar() {
  const [hidden, setHidden] = useState(false)
  const lastYRef = useRef(0)
  const tickingRef = useRef(false)
  const lockUntilRef = useRef(0)
  const dirRef = useRef<'up' | 'down' | null>(null)
  const accRef = useRef(0)
  const headerRef = useRef<HTMLElement | null>(null)

  // 스크롤 방향에 따라 숨김/표시 + 다른 sticky 요소들이 따라오도록 CSS 변수 업데이트
  useEffect(() => {
    lastYRef.current = window.scrollY || 0

    const update = () => {
      tickingRef.current = false
      const y = window.scrollY || 0
      const last = lastYRef.current
      const delta = y - last
      lastYRef.current = y
      const now = Date.now()

      // transition 중 재토글 방지(반쯤 걸린 상태 방지)
      if (now < lockUntilRef.current) return

      // 최상단은 항상 보이게
      if (y < 8) {
        if (hidden) setHidden(false)
        return
      }

      // 작은 흔들림(트랙패드) 방지
      if (Math.abs(delta) < 6) return

      const dir: 'up' | 'down' = delta > 0 ? 'down' : 'up'
      if (dirRef.current !== dir) {
        dirRef.current = dir
        accRef.current = 0
      }
      accRef.current += Math.abs(delta)

      // 히스테리시스: 내려갈 때는 조금 더 "확실히" 내려가야 숨김
      if (dir === 'down') {
        // 너무 위쪽에서는 숨기지 않음(미세 스크롤/바운스 구간)
        if (y < 80) return
        if (!hidden && accRef.current > 24) {
          setHidden(true)
          lockUntilRef.current = now + 320
        }
        return
      }

      // 올라갈 때는 비교적 빠르게 다시 보여줌
      if (hidden && accRef.current > 12) {
        setHidden(false)
        lockUntilRef.current = now + 320
      }
    }

    const onScroll = () => {
      if (tickingRef.current) return
      tickingRef.current = true
      window.requestAnimationFrame(update)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [hidden])

  useEffect(() => {
    // navbar가 숨겨지면 sticky top 간격도 0으로
    document.documentElement.style.setProperty('--nav-offset', hidden ? '0px' : 'var(--nav-h)')
  }, [hidden])

  // 실제 네브바 높이를 측정해서 --nav-h를 자동으로 맞춤(반응형/폰트 변경에도 안정)
  useEffect(() => {
    const el = headerRef.current
    if (!el) return

    const set = () => {
      const h = Math.ceil(el.getBoundingClientRect().height)
      if (h > 0) document.documentElement.style.setProperty('--nav-h', `${h}px`)
    }
    set()

    const ro = new ResizeObserver(set)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <>
      <header
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ease-out ${
          hidden ? '-translate-y-full' : 'translate-y-0'
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
          <div className="rounded-2xl px-4 sm:px-6 py-3 flex items-center justify-between bg-white border border-white shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl border border-gray-200 bg-white grid place-items-center">
              <span className="text-sm font-semibold tracking-tight text-gray-900">W</span>
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight text-gray-900">Weddit Lite</div>
              <div className="text-[11px] text-gray-600">가격 비교 · 옵션 추가금 · 통계</div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 rounded-full text-sm text-gray-700 border border-transparent hover:border-gray-200 hover:bg-gray-50 transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/notices"
              className="ml-1 px-4 py-2 rounded-full text-sm font-semibold border border-gray-200 bg-white text-gray-900 hover:bg-gray-50 transition-colors"
            >
              공지사항
            </Link>
            <Link
              href="/cart"
              className="px-4 py-2 rounded-full text-sm font-semibold border border-gray-900 bg-gray-900 text-white hover:bg-gray-800 transition-colors"
            >
              비교함
            </Link>
          </nav>

          <div className="md:hidden">
            <div className="flex items-center gap-2">
              <Link
                href="/notices"
                className="px-3 py-2 rounded-full text-sm font-semibold border border-gray-200 bg-white text-gray-900 hover:bg-gray-50 transition-colors whitespace-nowrap"
              >
                공지
              </Link>
              <Link
                href="/cart"
                className="px-3 py-2 rounded-full text-sm font-semibold border border-gray-900 bg-gray-900 text-white hover:bg-gray-800 transition-colors whitespace-nowrap"
              >
                비교함
              </Link>
            </div>
          </div>
        </div>
        </div>
      </header>

      {/* fixed navbar 공간 확보(숨김 시에는 0으로 자연스럽게 줄어듦) */}
      <div
        aria-hidden="true"
        className="transition-[height] duration-300 ease-out"
        style={{ height: hidden ? '0px' : 'var(--nav-h)' }}
      />
    </>
  )
}


