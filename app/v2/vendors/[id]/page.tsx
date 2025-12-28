'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Reveal from '@/components/Reveal'
import { Vendor } from '@/types'
import { CategoryLabels, RegionLabels } from '@/types'
import { upsertCompareEntry } from '@/components/cart/cartCookie'

function getBasePriceId(item: Vendor['items'][number]) {
  const byFlag = item.prices.find((p) => p.isDefault)
  if (byFlag) return byFlag.id
  const byName = item.prices.find((p) => (p.name ?? '').trim() === '' || (p.name ?? '').includes('기본'))
  if (byName) return byName.id
  if (!item.prices.length) return null
  const minP = item.prices.reduce((a, b) => (a.price <= b.price ? a : b))
  return minP.id
}

const NONE_OPTION = '__none__'
function getMinPriceId(item: Vendor['items'][number]) {
  if (!item.prices.length) return null
  return item.prices.reduce((a, b) => (a.price <= b.price ? a : b)).id
}

export default function V2VendorDetailPage() {
  const params = useParams()
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [loading, setLoading] = useState(true)
  // single 선택: priceId 또는 NONE_OPTION
  const [selectedSingleByItemId, setSelectedSingleByItemId] = useState<Record<string, string>>({})
  // multi 선택: 선택된 priceId 배열
  const [selectedMultiByItemId, setSelectedMultiByItemId] = useState<Record<string, string[]>>({})
  const [toast, setToast] = useState<string | null>(null)
  const toastTimerRef = useRef<number | null>(null)

  useEffect(() => {
    if (params.id) fetchVendor(params.id as string)
  }, [params.id])

  const fetchVendor = async (id: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/vendors/${id}`)
      const data = await response.json()
      setVendor(data)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => new Intl.NumberFormat('ko-KR').format(price)

  // 아래 계산/이펙트들은 loading/vendor 여부와 관계없이 훅 순서가 고정되도록 “항상” 호출한다.
  const pricedItems = useMemo(() => {
    return (vendor?.items ?? []).filter((it) => it.prices.length > 0)
  }, [vendor])

  const allPricesCount = useMemo(() => {
    return (vendor?.items ?? []).reduce((sum, it) => sum + it.prices.length, 0)
  }, [vendor])

  const baseTotal = useMemo(() => {
    if (!vendor) return 0
    return pricedItems.reduce((sum, it) => {
      const required = it.required === true
      if (!required) return sum
      const mode = it.selectionMode ?? 'single'

      if (mode === 'multi') {
        // 다중+필수: “최소 1개 선택”이므로 최저가는 기본 지정(isDefault)이 있으면 그 합, 없으면 최저 1개
        const defaults = it.prices.filter((p) => p.isDefault)
        if (defaults.length) return sum + defaults.reduce((s, p) => s + p.price, 0)
        const minP = it.prices.reduce((a, b) => (a.price <= b.price ? a : b))
        return sum + (minP?.price ?? 0)
      }

      // 필수+단일: 기본 옵션(없으면 최저가)
      const baseId = getBasePriceId(it)
      const base = it.prices.find((p) => p.id === baseId) ?? it.prices.reduce((a, b) => (a.price <= b.price ? a : b))
      return sum + (base?.price ?? 0)
    }, 0)
  }, [pricedItems, vendor])

  const maxTotal = useMemo(() => {
    if (!vendor) return 0
    return pricedItems.reduce((sum, it) => {
      const mode = ((it as any)?.selectionMode as 'single' | 'multi' | undefined) ?? 'single'
      if (mode === 'multi') {
        // 중복선택 가능: 최대는 “전부 선택”으로 가정(전부 합)
        return sum + it.prices.reduce((s, p) => s + p.price, 0)
      }
      const maxP = it.prices.reduce((a, b) => (a.price >= b.price ? a : b))
      return sum + (maxP?.price ?? 0)
    }, 0)
  }, [pricedItems, vendor])

  // 기본 선택값 세팅(업체 로드 후 1회)
  useEffect(() => {
    if (!vendor) return
    const nextSingle: Record<string, string> = {}
    const nextMulti: Record<string, string[]> = {}

    pricedItems.forEach((it) => {
      const mode = it.selectionMode ?? 'single'
      const required = it.required === true

      if (mode === 'multi') {
        const defaults = it.prices.filter((p) => p.isDefault).map((p) => p.id)
        if (required) {
          // 최소 1개는 선택되어야 함: 기본 지정이 있으면 그걸, 없으면 최저 1개
          const minId = getMinPriceId(it)
          nextMulti[it.id] = defaults.length ? defaults : (minId ? [minId] : [])
        } else {
          // 선택사항 multi: 기본은 “0개 선택”. (추후 원하면 defaults를 미리 체크하도록 변경 가능)
          nextMulti[it.id] = []
        }
      } else {
        const baseId = getBasePriceId(it)
        // 필수 단일: 기본값. 선택사항 단일: 기본은 '선택 안함'(0원)로 시작.
        nextSingle[it.id] = required ? (baseId ?? NONE_OPTION) : NONE_OPTION
      }
    })

    setSelectedSingleByItemId(nextSingle)
    setSelectedMultiByItemId(nextMulti)
  }, [vendor, pricedItems])

  const selectedTotal = useMemo(() => {
    if (!vendor) return 0
    return pricedItems.reduce((sum, it) => {
      const mode = ((it as any)?.selectionMode as 'single' | 'multi' | undefined) ?? 'single'
      if (mode === 'multi') {
        const ids = selectedMultiByItemId[it.id] ?? []
        return sum + ids.reduce((s, id) => s + (it.prices.find((p) => p.id === id)?.price ?? 0), 0)
      }
      const selId = selectedSingleByItemId[it.id] ?? NONE_OPTION
      if (!selId || selId === NONE_OPTION) return sum
      const sel = it.prices.find((p) => p.id === selId) ?? null
      return sum + (sel?.price ?? 0)
    }, 0)
  }, [pricedItems, selectedMultiByItemId, selectedSingleByItemId, vendor])

  const showToast = (message: string) => {
    setToast(message)
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current)
    toastTimerRef.current = window.setTimeout(() => setToast(null), 2200)
  }

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current)
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-10">
        <div className="h-10 w-40 rounded-full bg-black/5" />
        <div className="mt-6 h-7 w-64 rounded bg-black/5" />
        <div className="mt-3 h-10 w-[80%] max-w-[520px] rounded bg-black/5" />
        <div className="mt-8 rounded-3xl border border-black/10 bg-white/85 backdrop-blur-sm shadow-sm p-6 sm:p-8">
          <div className="h-6 w-28 rounded bg-black/5" />
          <div className="mt-4 h-4 w-[70%] rounded bg-black/5" />
          <div className="mt-2 h-4 w-[55%] rounded bg-black/5" />
          <div className="mt-2 h-4 w-[60%] rounded bg-black/5" />
        </div>
      </div>
    )
  }

  if (!vendor) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        업체를 찾을 수 없습니다.
      </div>
    )
  }

  return (
    <main className="w-full px-4 sm:px-6 lg:px-8 py-10">
      <Reveal>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <Link
            href="/v2/vendors"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-black/10 bg-white hover:bg-gray-50 transition-colors text-sm font-semibold text-gray-900"
          >
            ← 업체 목록
          </Link>

          {pricedItems.length > 0 && (
            <div className="text-right">
              <div className="text-xs text-gray-500">가격 범위(기본~최대)</div>
              <div className="mt-1 text-lg font-semibold text-gray-900">
                {formatPrice(baseTotal)}원
                {maxTotal !== baseTotal && <span className="text-gray-600"> ~ {formatPrice(maxTotal)}원</span>}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-gray-700 bg-black/5 border border-black/10 px-2 py-1 rounded-full">
            {CategoryLabels[vendor.category]}
          </span>
          <span className="text-xs font-medium text-gray-600">{RegionLabels[vendor.region]}</span>
          {vendor.website && (
            <a
              href={vendor.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-gray-800 underline underline-offset-4"
            >
              웹사이트
            </a>
          )}
        </div>

        <h1 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900">
          {vendor.name}
        </h1>
        {vendor.description && (
          <p className="mt-3 text-base text-gray-700 max-w-[78ch]">
            {vendor.description}
          </p>
        )}
      </Reveal>

      <Reveal className="mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          <div className="lg:col-span-5 rounded-3xl border border-black/10 bg-white/85 backdrop-blur-sm shadow-sm p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-gray-900">기본 정보</h2>
            <div className="mt-4 space-y-4 text-gray-700">
              {vendor.address && (
                <div>
                  <div className="text-sm font-semibold text-gray-900">주소</div>
                  <p className="mt-1">{vendor.address}</p>
                </div>
              )}
              {vendor.phone && (
                <div>
                  <div className="text-sm font-semibold text-gray-900">전화번호</div>
                  <p className="mt-1">{vendor.phone}</p>
                </div>
              )}
              {!vendor.address && !vendor.phone && !vendor.website && (
                <div className="text-sm text-gray-600">등록된 기본 정보가 없습니다.</div>
              )}
              {vendor.website && (
                <div>
                  <div className="text-sm font-semibold text-gray-900">웹사이트</div>
                  <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block underline">
                    {vendor.website}
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-7 rounded-3xl border border-black/10 bg-white/85 backdrop-blur-sm shadow-sm p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-gray-900">가격 요약</h2>
            <div className="mt-4 flex gap-3 overflow-x-auto no-scrollbar flex-nowrap">
              <div className="min-w-[140px] rounded-2xl border border-black/10 bg-white px-4 py-3">
                <div className="text-xs text-gray-500">아이템</div>
                <div className="mt-1 text-lg font-semibold text-gray-900">{vendor.items.length}개</div>
              </div>
              <div className="min-w-[140px] rounded-2xl border border-black/10 bg-white px-4 py-3">
                <div className="text-xs text-gray-500">가격 옵션</div>
                <div className="mt-1 text-lg font-semibold text-gray-900">{allPricesCount}개</div>
              </div>
              <div className="min-w-[180px] rounded-2xl border border-black/10 bg-white px-4 py-3">
                <div className="text-xs text-gray-500">기본가 합(최저)</div>
                <div className="mt-1 text-lg font-semibold text-gray-900">
                  {pricedItems.length === 0 ? '—' : `${formatPrice(baseTotal)}원`}
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              패키지/옵션별 추가금은 아래 가격표에서 확인할 수 있어요.
            </p>
          </div>
        </div>
      </Reveal>

      <Reveal className="mt-6">
        <div className="rounded-3xl border border-black/10 bg-white/85 backdrop-blur-sm shadow-sm p-6 sm:p-8">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <h2 className="text-xl font-semibold text-gray-900">가격표(메뉴별 옵션 선택)</h2>
            {pricedItems.length > 0 && (
              <div className="text-right">
                <div className="text-xs text-gray-500">선택 합계</div>
                <div className="mt-1 text-lg font-semibold text-gray-900 tabular-nums">
                  {formatPrice(selectedTotal)}원
                </div>
              </div>
            )}
          </div>

          {/* 옵션 선택 후 “담기” UX를 위해 가격표 섹션 상단에 배치 */}
          <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href="/v2/cart"
                className="inline-flex items-center px-4 py-2 rounded-full border border-black/10 bg-white hover:bg-black/5 transition-colors text-sm font-semibold text-gray-900"
              >
                비교함 보기
              </Link>
              <button
                type="button"
                onClick={() => {
                  upsertCompareEntry({
                    id: vendor.id,
                    selection: {
                      single: selectedSingleByItemId,
                      multi: selectedMultiByItemId,
                    },
                  })
                  showToast('비교함에 담았어요')
                }}
                className="inline-flex items-center px-4 py-2 rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-colors text-sm font-semibold"
              >
                비교함에 담기
              </button>
            </div>
            <div className="text-xs text-gray-500">
              쿠키에 저장돼요(로그인 불필요)
            </div>
          </div>
          {vendor.items.length === 0 ? (
            <div className="text-gray-600 text-center py-10">등록된 아이템이 없습니다.</div>
          ) : (
            <div className="mt-5 space-y-4">
              {vendor.items.map((item) => (
                <details key={item.id} className="rounded-2xl border border-black/10 bg-white overflow-hidden">
                  <summary className="px-4 py-3 cursor-pointer list-none">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-900 truncate">{item.name}</div>
                        {item.description && <div className="mt-1 text-xs text-gray-600 line-clamp-1">{item.description}</div>}
                      </div>
                      {item.prices.length > 0 ? (
                        <div className="shrink-0 text-right">
                          {(() => {
                            const mode = ((item as any)?.selectionMode as 'single' | 'multi' | undefined) ?? 'single'
                            const required = item.required === true
                            if (mode === 'multi') {
                              const ids = selectedMultiByItemId[item.id] ?? []
                              const sum = ids.reduce((s, id) => s + (item.prices.find((p) => p.id === id)?.price ?? 0), 0)
                              return (
                                <>
                                  <div className="text-xs text-gray-500">
                                    {ids.length ? `${ids.length}개 선택` : required ? '1개 이상 선택' : '선택 안함'}
                                  </div>
                                  <div className="text-sm font-semibold text-gray-900 tabular-nums">
                                    {formatPrice(sum)}원
                                  </div>
                                </>
                              )
                            }

                            const selId = selectedSingleByItemId[item.id] ?? (required ? (getBasePriceId(item) ?? NONE_OPTION) : NONE_OPTION)
                            const sel = selId && selId !== NONE_OPTION ? (item.prices.find((p) => p.id === selId) ?? null) : null
                            return (
                              <>
                                <div className="text-xs text-gray-500">
                                  {selId === NONE_OPTION ? '선택 안함' : sel?.name || '옵션'}
                                </div>
                                <div className="text-sm font-semibold text-gray-900 tabular-nums">
                                  {selId === NONE_OPTION ? '0원' : sel ? `${formatPrice(sel.price)}원` : '—'}
                                </div>
                              </>
                            )
                          })()}
                        </div>
                      ) : (
                        <div className="shrink-0 text-xs text-gray-500">옵션 없음</div>
                      )}
                    </div>
                  </summary>

                  {item.prices.length === 0 ? (
                    <div className="px-4 pb-4 text-sm text-gray-600">가격 정보가 없습니다.</div>
                  ) : (
                    <div className="px-4 pb-4">
                      <div className="mt-2 space-y-2">
                        {(() => {
                          const mode = item.selectionMode ?? 'single'
                          const required = item.required === true
                          const baseId = getBasePriceId(item)
                          const base = baseId ? (item.prices.find((p) => p.id === baseId) ?? null) : null
                          const ordered = base ? [base, ...item.prices.filter((p) => p.id !== baseId)] : item.prices

                          return (
                            <>
                              {/* 선택사항이면 '선택 안함(0원)' 제공, 필수면 제공하지 않음 */}
                              {!required && mode === 'single' && (
                                <label className="flex items-start justify-between gap-4 rounded-xl border border-black/10 bg-white px-3 py-2 hover:bg-gray-50">
                                  <div className="flex items-start gap-3 min-w-0">
                                    <input
                                      type="radio"
                                      name={`item-${item.id}`}
                                      checked={(selectedSingleByItemId[item.id] ?? NONE_OPTION) === NONE_OPTION}
                                      onChange={() => setSelectedSingleByItemId((prev) => ({ ...prev, [item.id]: NONE_OPTION }))}
                                      className="mt-1"
                                    />
                                    <div className="min-w-0">
                                      <div className="text-sm font-semibold text-gray-900 truncate">선택 안함</div>
                                      <div className="mt-1 text-xs text-gray-600">이 옵션은 합계에 포함하지 않아요.</div>
                                    </div>
                                  </div>
                                  <div className="shrink-0 text-right">
                                    <div className="text-sm font-semibold text-gray-900 tabular-nums">0원</div>
                                  </div>
                                </label>
                              )}

                              {mode === 'multi' ? (
                                ordered.map((price) => {
                                  const checked = (selectedMultiByItemId[item.id] ?? []).includes(price.id)
                                  return (
                                    <label
                                      key={price.id}
                                      className="flex items-start justify-between gap-4 rounded-xl border border-black/10 bg-white px-3 py-2 hover:bg-gray-50"
                                    >
                                      <div className="flex items-start gap-3 min-w-0">
                                        <input
                                          type="checkbox"
                                          checked={checked}
                                          onChange={(e) => {
                                            const on = e.target.checked
                                            setSelectedMultiByItemId((prev) => {
                                              const cur = prev[item.id] ?? []
                                              const next = on ? Array.from(new Set([...cur, price.id])) : cur.filter((x) => x !== price.id)
                                              // 다중+필수: 최소 1개 선택 강제 (마지막 1개 해제 금지)
                                              if (required && next.length === 0) return prev
                                              return { ...prev, [item.id]: next }
                                            })
                                          }}
                                          className="mt-1"
                                        />
                                        <div className="min-w-0">
                                          <div className="text-sm font-semibold text-gray-900 truncate">{price.name || '옵션'}</div>
                                          {price.description && <div className="mt-1 text-xs text-gray-600 line-clamp-2">{price.description}</div>}
                                        </div>
                                      </div>
                                      <div className="shrink-0 text-right">
                                        <div className="text-sm font-semibold text-gray-900 tabular-nums">{formatPrice(price.price)}원</div>
                                      </div>
                                    </label>
                                  )
                                })
                              ) : (
                                ordered.map((price) => {
                                  const checked = (selectedSingleByItemId[item.id] ?? (required ? (baseId ?? NONE_OPTION) : NONE_OPTION)) === price.id
                                  return (
                                    <label
                                      key={price.id}
                                      className="flex items-start justify-between gap-4 rounded-xl border border-black/10 bg-white px-3 py-2 hover:bg-gray-50"
                                    >
                                      <div className="flex items-start gap-3 min-w-0">
                                        <input
                                          type="radio"
                                          name={`item-${item.id}`}
                                          checked={checked}
                                          onChange={() => setSelectedSingleByItemId((prev) => ({ ...prev, [item.id]: price.id }))}
                                          className="mt-1"
                                        />
                                        <div className="min-w-0">
                                          <div className="text-sm font-semibold text-gray-900 truncate">{price.name || '기본'}</div>
                                          {price.description && <div className="mt-1 text-xs text-gray-600 line-clamp-2">{price.description}</div>}
                                        </div>
                                      </div>
                                      <div className="shrink-0 text-right">
                                        <div className="text-sm font-semibold text-gray-900 tabular-nums">{formatPrice(price.price)}원</div>
                                      </div>
                                    </label>
                                  )
                                })
                              )}
                            </>
                          )
                        })()}
                      </div>
                    </div>
                  )}
                </details>
              ))}
            </div>
          )}

          {pricedItems.length > 0 && (
            <div className="mt-6 pt-4 border-t border-black/10 flex items-center justify-between gap-4 flex-wrap">
              <div className="text-sm text-gray-600">
                선택한 옵션 합계(메뉴별 1개 선택)
              </div>
              <div className="text-lg font-semibold text-gray-900 tabular-nums">
                {formatPrice(selectedTotal)}원
              </div>
            </div>
          )}
        </div>
      </Reveal>

      {toast && (
        <div className="fixed left-0 right-0 bottom-0 z-[60] pointer-events-none px-4 sm:px-6 lg:px-8 pb-[calc(env(safe-area-inset-bottom)+16px)]">
          <div className="mx-auto max-w-5xl">
            <div className="pointer-events-none inline-flex items-center rounded-full bg-gray-900 text-white px-4 py-2 text-sm font-semibold shadow-lg">
              {toast}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}


