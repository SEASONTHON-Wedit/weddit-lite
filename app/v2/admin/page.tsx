'use client'

import { useState } from 'react'
import Reveal from '@/components/Reveal'

export default function V2AdminPage() {
  const [formData, setFormData] = useState({
    name: '',
    category: 'STUDIO',
    region: 'SEOUL',
    address: '',
    phone: '',
    website: '',
    description: '',
    itemName: '',
    price: '',
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/admin/add-vendor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      if (response.ok) {
        setMessage('업체가 성공적으로 추가되었습니다.')
        setFormData({
          name: '',
          category: 'STUDIO',
          region: 'SEOUL',
          address: '',
          phone: '',
          website: '',
          description: '',
          itemName: '',
          price: '',
        })
      } else {
        setMessage(`오류: ${data.error}`)
      }
    } catch (error: any) {
      setMessage(`오류: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
      <Reveal>
        <div>
          <div className="text-sm text-gray-600">관리</div>
          <h1 className="mt-1 text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900">
            업체/가격표 등록
          </h1>
          <p className="mt-3 text-lg text-gray-700">
            업체 기본 정보와 패키지/옵션 가격(추가비용 포함)을 등록합니다. (운영자용)
          </p>
        </div>
      </Reveal>

      <Reveal className="mt-6">
        <form onSubmit={handleSubmit} className="rounded-3xl border border-black/10 bg-white/85 backdrop-blur-sm shadow-sm px-6 sm:px-8 pt-6 pb-8">
          <div className="mb-4">
            <label className="block text-gray-800 text-sm font-semibold mb-2">업체명 *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full py-2.5 px-3 rounded-xl border border-black/10 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-800 text-sm font-semibold mb-2">카테고리 *</label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full py-2.5 px-3 rounded-xl border border-black/10 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            >
              <option value="STUDIO">스튜디오</option>
              <option value="DRESS">드레스</option>
              <option value="MAKEUP">메이크업</option>
              <option value="WEDDING_HALL">웨딩홀</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-800 text-sm font-semibold mb-2">지역 *</label>
            <select
              required
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              className="w-full py-2.5 px-3 rounded-xl border border-black/10 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            >
              <option value="SEOUL">서울</option>
              <option value="GYEONGGI">경기</option>
              <option value="BUSAN">부산</option>
              <option value="DAEGU">대구</option>
              <option value="INCHEON">인천</option>
              <option value="GWANGJU">광주</option>
              <option value="DAEJEON">대전</option>
              <option value="ULSAN">울산</option>
              <option value="GANGWON">강원</option>
              <option value="CHUNGBUK">충북</option>
              <option value="CHUNGNAM">충남</option>
              <option value="JEONBUK">전북</option>
              <option value="JEONNAM">전남</option>
              <option value="GYEONGBUK">경북</option>
              <option value="GYEONGNAM">경남</option>
              <option value="JEJU">제주</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-800 text-sm font-semibold mb-2">주소</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full py-2.5 px-3 rounded-xl border border-black/10 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-800 text-sm font-semibold mb-2">전화번호</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full py-2.5 px-3 rounded-xl border border-black/10 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-800 text-sm font-semibold mb-2">웹사이트</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full py-2.5 px-3 rounded-xl border border-black/10 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-800 text-sm font-semibold mb-2">설명</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full py-2.5 px-3 rounded-xl border border-black/10 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              rows={3}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-800 text-sm font-semibold mb-2">아이템명</label>
            <input
              type="text"
              value={formData.itemName}
              onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
              className="w-full py-2.5 px-3 rounded-xl border border-black/10 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              placeholder="예: 기본 패키지"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-800 text-sm font-semibold mb-2">가격 (원)</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full py-2.5 px-3 rounded-xl border border-black/10 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              placeholder="예: 1500000"
            />
          </div>

          {message && (
            <div className="mb-4 p-3 rounded-2xl border border-black/10 bg-white text-gray-900">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 rounded-full bg-gray-900 text-white font-semibold hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {loading ? '추가 중...' : '업체 추가'}
          </button>
        </form>
      </Reveal>
    </main>
  )
}


