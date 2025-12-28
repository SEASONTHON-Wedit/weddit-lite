'use client'

import { useState } from 'react'
import Reveal from '@/components/Reveal'

export default function V2ImportPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleImport = async () => {
    setLoading(true)
    setResult(null)
    try {
      const response = await fetch('/api/import', { method: 'POST' })
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
        <div>
          <div className="text-sm text-gray-600">데이터</div>
          <h1 className="mt-1 text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900">
            가격 데이터 가져오기
          </h1>
          <p className="mt-3 text-lg text-gray-700">
            공개된 가격 정보를 시트에서 불러와, Weddit Lite에 반영합니다. (운영자용)
          </p>
        </div>
      </Reveal>

      <Reveal className="mt-6">
        <div className="rounded-3xl border border-black/10 bg-white/85 backdrop-blur-sm shadow-sm p-6">
          <button
            onClick={handleImport}
            disabled={loading}
            className="w-full px-6 py-3 rounded-full bg-gray-900 text-white font-semibold hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {loading ? '가져오는 중...' : '데이터 가져오기'}
          </button>
        </div>
      </Reveal>

      {result && (
        <Reveal className="mt-6">
          <div className="rounded-3xl border border-black/10 bg-white/85 backdrop-blur-sm shadow-sm p-6">
            {result.error ? (
              <div>
                <h2 className="text-xl font-semibold text-gray-900">가져오기 실패</h2>
                <p className="mt-2 text-gray-700">{result.error}</p>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-semibold text-gray-900">가져오기 완료</h2>
                <div className="mt-3 space-y-2 text-gray-700">
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


