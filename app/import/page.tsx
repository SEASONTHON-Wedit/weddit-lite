'use client'

import { useState } from 'react'
import Reveal from '@/components/Reveal'

export default function ImportPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleImport = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      const response = await fetch('/api/import', {
        method: 'POST',
      })
      
      const data = await response.json()
      setResult(data)
    } catch (error: any) {
      setResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
      <Reveal>
        <div className="text-shadow">
          <div className="text-base text-white/90">데이터</div>
          <h1 className="mt-1 text-3xl sm:text-4xl font-semibold tracking-tight text-white">
            가격 데이터 가져오기
          </h1>
          <p className="mt-3 text-lg text-white/90">
            공개된 가격 정보를 시트에서 불러와, Weddit Lite에 반영합니다. (운영자용)
          </p>
        </div>
      </Reveal>

      <Reveal className="mt-6">
        <div className="panel-contrast rounded-3xl p-6 border border-white/20">
          <button
            onClick={handleImport}
            disabled={loading}
            className="w-full px-6 py-3 rounded-full border border-white/45 bg-white/15 hover:bg-white/20 transition-colors font-semibold text-white text-shadow disabled:opacity-50 disabled:hover:bg-white/15"
          >
            {loading ? '가져오는 중...' : '데이터 가져오기'}
          </button>
        </div>
      </Reveal>

      {result && (
        <Reveal className="mt-6">
          <div className="panel-contrast rounded-3xl p-6 border border-white/20 text-shadow">
            {result.error ? (
              <div>
                <h2 className="text-xl font-semibold text-white">가져오기 실패</h2>
                <p className="mt-2 text-white/90">{result.error}</p>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-semibold text-white">가져오기 완료</h2>
                <div className="mt-3 space-y-2 text-white/90">
                  <p>총 데이터: {result.total}개</p>
                  <p>반영: {result.imported}개</p>
                  {result.skipped > 0 && <p>건너뛴 항목: {result.skipped}개</p>}
                </div>
              </div>
            )}
          </div>
        </Reveal>
      )}
    </main>
  )
}


