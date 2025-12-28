'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

const navItems = [
  { href: '/v2', label: '홈' },
  { href: '/v2/vendors', label: '업체' },
]

export default function NavbarV2() {
  const [hidden, setHidden] = useState(false)
  const [open, setOpen] = useState(false)
  const [closing, setClosing] = useState(false)
  const lastYRef = useRef(0)
  const tickingRef = useRef(false)
  const lockUntilRef = useRef(0)
  const dirRef = useRef<'up' | 'down' | null>(null)
  const accRef = useRef(0)
  const headerRef = useRef<HTMLElement | null>(null)
  const barRef = useRef<HTMLDivElement | null>(null)

  const closeMenu = () => {
    if (!open || closing) return
    setClosing(true)
    window.setTimeout(() => {
      setOpen(false)
      setClosing(false)
    }, 180)
  }

  const toggleMenu = () => {
    if (open) {
      closeMenu()
      return
    }
    setHidden(false)
    lockUntilRef.current = Date.now() + 320
    setClosing(false)
    setOpen(true)
  }

  useEffect(() => {
    lastYRef.current = window.scrollY || 0

    const update = () => {
      tickingRef.current = false
      const y = window.scrollY || 0
      const last = lastYRef.current
      const delta = y - last
      lastYRef.current = y
      const now = Date.now()
      if (now < lockUntilRef.current) return

      if (y < 8) {
        if (hidden) setHidden(false)
        return
      }
      if (Math.abs(delta) < 6) return

      const dir: 'up' | 'down' = delta > 0 ? 'down' : 'up'
      if (dirRef.current !== dir) {
        dirRef.current = dir
        accRef.current = 0
      }
      accRef.current += Math.abs(delta)

      if (dir === 'down') {
        if (y < 80) return
        if (open && accRef.current > 12) closeMenu()
        if (!hidden && accRef.current > 24) {
          setHidden(true)
          lockUntilRef.current = now + 320
        }
        return
      }

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
  }, [hidden, open])

  useEffect(() => {
    document.documentElement.style.setProperty('--nav-offset', hidden ? '0px' : 'var(--nav-h)')
  }, [hidden])

  useEffect(() => {
    if (hidden && open) closeMenu()
  }, [hidden, open, closing])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, closing])

  useEffect(() => {
    const el = barRef.current
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
        <div className="pt-[env(safe-area-inset-top)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2 sm:py-3">
          <div className="relative">
          <div
            ref={barRef}
            className="rounded-2xl px-4 sm:px-6 py-3 flex items-center justify-between bg-white/90 backdrop-blur border border-black/10 shadow-sm"
          >
            <Link href="/v2" className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl border border-black/10 bg-white grid place-items-center">
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
                  className="px-3 py-2 rounded-full text-sm text-gray-700 border border-transparent hover:border-black/10 hover:bg-black/5 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/v2/notices"
                className="ml-1 px-3 py-2 rounded-full text-sm font-semibold text-gray-800 border border-black/10 hover:bg-black/5 transition-colors"
              >
                공지사항
              </Link>
              <Link
                href="/v2/cart"
                className="px-4 py-2 rounded-full text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800 transition-colors"
              >
                비교함
              </Link>
              <Link
                href="/v2/vendors"
                className="ml-1 px-4 py-2 rounded-full text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800 transition-colors"
              >
                업체 보기
              </Link>
            </nav>

            <div className="md:hidden flex items-center gap-2">
              <button
                type="button"
                onClick={toggleMenu}
                className="h-10 w-10 rounded-2xl border border-black/10 bg-white grid place-items-center text-gray-900"
                aria-label="메뉴 열기"
                aria-expanded={open}
              >
                ≡
              </button>
            </div>
          </div>

          {(open || closing) && (
            <div
              className={`absolute left-0 right-0 top-full mt-2 rounded-2xl border border-black/10 bg-white/95 backdrop-blur shadow-sm overflow-hidden md:hidden transition-all duration-200 ease-out ${
                closing ? 'opacity-0 -translate-y-1 pointer-events-none' : 'opacity-100 translate-y-0'
              }`}
            >
              <div className="flex flex-col">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMenu}
                    className="px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-black/5 transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href="/v2/notices"
                  onClick={closeMenu}
                  className="px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-black/5 transition-colors"
                >
                  공지사항
                </Link>
                <Link
                  href="/v2/cart"
                  onClick={closeMenu}
                  className="px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-black/5 transition-colors"
                >
                  비교함
                </Link>
                <Link
                  href="/v2/vendors"
                  onClick={closeMenu}
                  className="px-4 py-3 text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 transition-colors"
                >
                  업체 목록으로 이동
                </Link>
              </div>
            </div>
          )}
          </div>
        </div>
        </div>
      </header>

      <div
        aria-hidden="true"
        className="transition-[height] duration-300 ease-out"
        style={{ height: hidden ? '0px' : 'var(--nav-h)' }}
      />
    </>
  )
}


