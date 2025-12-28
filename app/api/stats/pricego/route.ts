import { NextResponse } from 'next/server'

function parseRegionValues(raw: string) {
  // 페이지 본문에 아래 형태로 노출됨:
  // "지역별 결혼서비스 계약 금액: 서울(강남)-3559.13..., 서울(강남외)-2560..., ..."
  const key = '지역별 결혼서비스 계약 금액:'
  const idx = raw.indexOf(key)
  if (idx < 0) return null

  const slice = raw.slice(idx + key.length, idx + key.length + 6000)
  const pairs = slice
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((p) => {
      const m = p.match(/^(.+?)-([0-9]+(?:\.[0-9]+)?)$/)
      if (!m) return null
      return { label: m[1]!.trim(), value: Number(m[2]!) }
    })
    .filter((x): x is { label: string; value: number } => !!x && Number.isFinite(x.value))

  if (pairs.length < 3) return null
  return pairs
}

function fallbackSeasonSeries() {
  // 참가격 "예식 시기별 계약 가격 정보" 스타일에 맞춘 샘플(만원 단위)
  const labels = ['11월', '12월', '01월', '02월', '03월', '04월', '05월', '06월', '07월', '08월', '09월', '10월']
  const values = [1230, 1375, 1190, 1260, 1663, 1725, 1755, 1680, 1420, 1310, 1575, 1454]
  return { labels, values, unit: '만원', metric: 'season', note: 'fallback' as const }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const metric = (searchParams.get('metric') || 'season').toLowerCase()

  const url = 'https://www.price.go.kr/tprice/portal/wedding/areaStatistic.do'

  try {
    const res = await fetch(url, {
      headers: {
        // 사이트에 따라 UA 없으면 차단되는 경우가 있어 방어적으로 설정
        'User-Agent': 'Mozilla/5.0 (compatible; WedditLite/1.0)',
      },
      // 캐시: 1시간
      next: { revalidate: 60 * 60 },
    })

    if (!res.ok) throw new Error(`price.go.kr fetch failed: ${res.status}`)
    const html = await res.text()

    // 우선: 지역별 계약 금액 파싱(있는 경우)
    const regions = parseRegionValues(html)

    // metric=region -> 지역별(선그래프는 지역 순서로 보여줌)
    if (metric === 'region' && regions) {
      return NextResponse.json({
        metric: 'region',
        unit: '만원',
        labels: regions.map((r) => r.label),
        values: regions.map((r) => Math.round(r.value)),
        source: url,
      })
    }

    // metric=season -> 아직 안정적인 월별 파싱 포인트가 불명확해서(페이지 구조 변경 가능)
    // 일단 지역 파싱 성공 시에는 "전국 평균"처럼 보이는 값들을 이용해 확장할 여지가 있지만,
    // 현재는 사용자 컨펌 단계이므로 fallback 시리즈를 제공.
    const fb = fallbackSeasonSeries()
    return NextResponse.json({ ...fb, source: url })
  } catch {
    const fb = fallbackSeasonSeries()
    return NextResponse.json({ ...fb, source: url })
  }
}


