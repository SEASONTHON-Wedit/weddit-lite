import { NextRequest, NextResponse } from 'next/server'

type GeoResult = { lat: number; lng: number; source: 'address' | 'keyword' }

const cache = new Map<string, GeoResult>()

function getKey() {
  // 서버에서도 NEXT_PUBLIC_* 접근 가능하지만, 가능하면 비공개 키를 우선 사용
  return process.env.KAKAO_REST_KEY || process.env.NEXT_PUBLIC_KAKAO_REST_KEY || ''
}

async function fetchJson(url: string, key: string) {
  const res = await fetch(url, {
    headers: {
      Authorization: `KakaoAK ${key}`,
    },
    next: { revalidate: 60 * 60 * 24 }, // 24h 캐시(서버)
  })
  if (!res.ok) throw new Error(`Kakao API error: ${res.status}`)
  return res.json() as Promise<any>
}

export async function GET(req: NextRequest) {
  const key = getKey()
  if (!key) {
    return NextResponse.json({ error: 'Missing Kakao REST key' }, { status: 500 })
  }

  const q = req.nextUrl.searchParams.get('q')?.trim() || ''
  if (!q) return NextResponse.json({ error: 'Missing query' }, { status: 400 })

  const cached = cache.get(q)
  if (cached) return NextResponse.json(cached)

  try {
    // 1) 주소 검색
    const addressUrl = `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(q)}`
    const a = await fetchJson(addressUrl, key)
    const doc = a?.documents?.[0]
    if (doc?.y && doc?.x) {
      const result: GeoResult = { lat: Number(doc.y), lng: Number(doc.x), source: 'address' }
      cache.set(q, result)
      return NextResponse.json(result)
    }

    // 2) 키워드 검색(상호/장소명 등)
    const keywordUrl = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(q)}`
    const k = await fetchJson(keywordUrl, key)
    const kdoc = k?.documents?.[0]
    if (kdoc?.y && kdoc?.x) {
      const result: GeoResult = { lat: Number(kdoc.y), lng: Number(kdoc.x), source: 'keyword' }
      cache.set(q, result)
      return NextResponse.json(result)
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  } catch (e) {
    return NextResponse.json({ error: 'Geocode failed' }, { status: 500 })
  }
}


