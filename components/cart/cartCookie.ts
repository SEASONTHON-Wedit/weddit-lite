'use client'

const COOKIE_KEY = 'weddit_compare'

export type CompareSelection = {
  single?: Record<string, string> // itemId -> priceId | '__none__'
  multi?: Record<string, string[]> // itemId -> priceIds
}

export type CompareEntry = {
  id: string // vendorId
  selection?: CompareSelection
  savedAt?: number
}

function readCookie(key: string) {
  if (typeof document === 'undefined') return null
  const all = document.cookie.split(';').map((s) => s.trim())
  const hit = all.find((c) => c.startsWith(`${key}=`))
  if (!hit) return null
  return hit.slice(key.length + 1)
}

function writeCookie(key: string, value: string) {
  if (typeof document === 'undefined') return
  // 180일 유지, path=/ 로 전역 사용
  const maxAge = 60 * 60 * 24 * 180
  document.cookie = `${key}=${value}; Max-Age=${maxAge}; Path=/; SameSite=Lax`
}

export function getCompareEntries(): CompareEntry[] {
  try {
    const raw = readCookie(COOKIE_KEY)
    if (!raw) return []
    const decoded = decodeURIComponent(raw)
    const parsed = JSON.parse(decoded)
    if (!Array.isArray(parsed)) return []

    // v1(이전): string[] 형태(업체 id만 저장)도 호환
    if (parsed.every((x) => typeof x === 'string')) {
      return (parsed as string[]).map((id) => ({ id }))
    }

    // v2: CompareEntry[]
    return (parsed as any[])
      .map((x) => {
        if (!x || typeof x !== 'object') return null
        if (typeof x.id !== 'string') return null
        return {
          id: x.id as string,
          selection: x.selection as CompareSelection | undefined,
          savedAt: typeof x.savedAt === 'number' ? x.savedAt : undefined,
        } satisfies CompareEntry
      })
      .filter(Boolean) as CompareEntry[]
  } catch {
    return []
  }
}

export function getCompareIds(): string[] {
  return getCompareEntries().map((e) => e.id)
}

export function setCompareIds(ids: string[]) {
  const normalized = Array.from(new Set(ids.filter(Boolean))).slice(0, 50)
  const entries: CompareEntry[] = normalized.map((id) => ({ id }))
  writeCookie(COOKIE_KEY, encodeURIComponent(JSON.stringify(entries)))
  // 같은 탭에서도 UI가 즉시 반응할 수 있게 이벤트 브로드캐스트
  window.dispatchEvent(new CustomEvent('weddit:compare-changed'))
}

export function setCompareEntries(entries: CompareEntry[]) {
  const normalized = entries
    .filter((e) => e && typeof e.id === 'string')
    .slice(0, 50)
  // 같은 업체는 마지막 저장값으로 덮어쓰기
  const map = new Map<string, CompareEntry>()
  for (const e of normalized) map.set(e.id, e)
  writeCookie(COOKIE_KEY, encodeURIComponent(JSON.stringify(Array.from(map.values()))))
  window.dispatchEvent(new CustomEvent('weddit:compare-changed'))
}

export function addCompareId(id: string) {
  setCompareEntries([...getCompareEntries(), { id, savedAt: Date.now() }])
}

export function upsertCompareEntry(entry: CompareEntry) {
  const entries = getCompareEntries()
  const next = entries.filter((e) => e.id !== entry.id)
  next.push({ ...entry, savedAt: Date.now() })
  setCompareEntries(next)
}

export function removeCompareId(id: string) {
  setCompareEntries(getCompareEntries().filter((e) => e.id !== id))
}

export function clearCompare() {
  setCompareEntries([])
}


