'use client'

import Script from 'next/script'
import { useEffect, useMemo, useRef, useState } from 'react'

declare global {
  interface Window {
    kakao?: any
  }
}

export type MapMarker = {
  id: string
  title: string
  lat: number
  lng: number
}

type KakaoMapProps = {
  className?: string
  markers: MapMarker[]
  selectedId?: string | null
  onSelect?: (id: string) => void
}

export default function KakaoMap({ className = '', markers, selectedId, onSelect }: KakaoMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<any>(null)
  const markerObjsRef = useRef<Map<string, any>>(new Map())
  const [ready, setReady] = useState(false)

  const appKey = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY

  const initialCenter = useMemo(() => {
    if (markers.length) return { lat: markers[0]!.lat, lng: markers[0]!.lng }
    // 서울 시청 기본
    return { lat: 37.5665, lng: 126.978 }
  }, [markers])

  useEffect(() => {
    if (!ready) return
    if (!containerRef.current) return
    const kakao = window.kakao
    if (!kakao?.maps) return
    if (mapRef.current) return

    const center = new kakao.maps.LatLng(initialCenter.lat, initialCenter.lng)
    mapRef.current = new kakao.maps.Map(containerRef.current, {
      center,
      level: 6,
    })
  }, [initialCenter.lat, initialCenter.lng, ready])

  // 마커 렌더/업데이트
  useEffect(() => {
    if (!ready) return
    const kakao = window.kakao
    const map = mapRef.current
    if (!kakao?.maps || !map) return

    const byId = markerObjsRef.current

    // 제거(현재 markers에 없는 것)
    const nextIds = new Set(markers.map((m) => m.id))
    for (const [id, obj] of byId.entries()) {
      if (!nextIds.has(id)) {
        obj.setMap(null)
        byId.delete(id)
      }
    }

    // 생성/갱신
    for (const m of markers) {
      const pos = new kakao.maps.LatLng(m.lat, m.lng)
      let marker = byId.get(m.id)
      if (!marker) {
        marker = new kakao.maps.Marker({ position: pos })
        marker.setMap(map)
        byId.set(m.id, marker)
        kakao.maps.event.addListener(marker, 'click', () => onSelect?.(m.id))
      } else {
        marker.setPosition(pos)
        marker.setMap(map)
      }

      // 선택 강조: zIndex만 올려도 충분히 “위에 뜨는” 느낌이 남
      marker.setZIndex(m.id === selectedId ? 10 : 1)
    }
  }, [markers, onSelect, ready, selectedId])

  // 페이지 이동으로 컴포넌트가 재마운트될 때: 스크립트가 이미 로드돼 있으면 onLoad가 호출되지 않을 수 있음
  // 따라서 mount 시점에 window.kakao가 있으면 바로 ready를 세팅.
  useEffect(() => {
    const kakao = window.kakao
    if (kakao?.maps) {
      kakao.maps.load(() => setReady(true))
    }
  }, [])

  // 선택 마커로 센터 이동(부드럽게)
  useEffect(() => {
    if (!ready) return
    if (!selectedId) return
    const kakao = window.kakao
    const map = mapRef.current
    if (!kakao?.maps || !map) return
    const selected = markers.find((m) => m.id === selectedId)
    if (!selected) return
    map.panTo(new kakao.maps.LatLng(selected.lat, selected.lng))
  }, [markers, ready, selectedId])

  if (!appKey) {
    return (
      <div className={`rounded-2xl border border-gray-200 bg-gray-50 p-4 text-gray-700 ${className}`}>
        카카오맵 키가 설정되지 않았습니다. `.env.local`에 `NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY`를 설정해주세요.
      </div>
    )
  }

  return (
    <div className={`h-full w-full ${className}`}>
      <Script
        id="kakao-maps-sdk"
        src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false`}
        strategy="afterInteractive"
        onReady={() => {
          const kakao = window.kakao
          if (!kakao?.maps) return
          kakao.maps.load(() => setReady(true))
        }}
      />
      <div ref={containerRef} className="h-full w-full" />
    </div>
  )
}


