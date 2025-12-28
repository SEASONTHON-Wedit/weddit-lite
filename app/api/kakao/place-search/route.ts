import { NextRequest, NextResponse } from 'next/server'

type PlaceResult = { lat: number; lng: number; name?: string }

const cache = new Map<string, PlaceResult>()

function getKey() {
  return process.env.KAKAO_REST_KEY || process.env.NEXT_PUBLIC_KAKAO_REST_KEY || ''
}

export async function GET(req: NextRequest) {
  const key = getKey()
  if (!key) return NextResponse.json({ error: 'Missing Kakao REST key' }, { status: 500 })

  const q = req.nextUrl.searchParams.get('q')?.trim() || ''
  if (!q) return NextResponse.json({ error: 'Missing query' }, { status: 400 })

  const cached = cache.get(q)
  if (cached) return NextResponse.json(cached)

  try {
    const url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(q)}`
    const res = await fetch(url, {
      headers: { Authorization: `KakaoAK ${key}` },
      next: { revalidate: 60 * 60 * 24 },
    })
    if (!res.ok) return NextResponse.json({ error: 'Kakao API error' }, { status: 502 })
    const json = (await res.json()) as any
    const doc = json?.documents?.[0]
    // "검색 결과 없음"은 404로 처리하면 클라이언트에서 콘솔/네트워크 에러가 과하게 보임.
    // 200 + null 좌표로 내려서 조용히 스킵할 수 있게 한다.
    if (!doc?.y || !doc?.x) return NextResponse.json({ lat: null, lng: null, name: undefined })

    const result: PlaceResult = {
      lat: Number(doc.y),
      lng: Number(doc.x),
      name: doc.place_name ? String(doc.place_name) : undefined,
    }
    cache.set(q, result)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'Place search failed' }, { status: 500 })
  }
}


