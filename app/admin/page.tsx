'use client'

import { useState } from 'react'
import Reveal from '@/components/Reveal'

export default function AdminPage() {
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
        headers: {
          'Content-Type': 'application/json',
        },
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
        <div className="text-shadow">
          <div className="text-base text-white/90">관리</div>
          <h1 className="mt-1 text-3xl sm:text-4xl font-semibold tracking-tight text-white">
            업체/가격표 등록
          </h1>
          <p className="mt-3 text-lg text-white/90">
            업체 기본 정보와 패키지/옵션 가격(추가비용 포함)을 등록합니다. (운영자용)
          </p>
        </div>
      </Reveal>

      <Reveal className="mt-6">
        <form onSubmit={handleSubmit} className="panel-contrast rounded-3xl px-6 sm:px-8 pt-6 pb-8 border border-white/20">
          <div className="mb-4">
            <label className="block text-white/90 text-sm font-semibold mb-2 text-shadow">
              업체명 *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full py-2.5 px-3 rounded-xl border border-white/25 bg-black/15 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/40"
            />
          </div>

          <div className="mb-4">
            <label className="block text-white/90 text-sm font-semibold mb-2 text-shadow">
              카테고리 *
            </label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full py-2.5 px-3 rounded-xl border border-white/25 bg-black/15 text-white focus:outline-none focus:ring-2 focus:ring-white/40"
            >
              <option value="STUDIO">스튜디오</option>
              <option value="DRESS">드레스</option>
              <option value="MAKEUP">메이크업</option>
              <option value="WEDDING_HALL">웨딩홀</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-white/90 text-sm font-semibold mb-2 text-shadow">
              지역 *
            </label>
            <select
              required
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              className="w-full py-2.5 px-3 rounded-xl border border-white/25 bg-black/15 text-white focus:outline-none focus:ring-2 focus:ring-white/40"
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
            <label className="block text-white/90 text-sm font-semibold mb-2 text-shadow">
              주소
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full py-2.5 px-3 rounded-xl border border-white/25 bg-black/15 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/40"
            />
          </div>

          <div className="mb-4">
            <label className="block text-white/90 text-sm font-semibold mb-2 text-shadow">
              전화번호
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full py-2.5 px-3 rounded-xl border border-white/25 bg-black/15 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/40"
            />
          </div>

          <div className="mb-4">
            <label className="block text-white/90 text-sm font-semibold mb-2 text-shadow">
              웹사이트
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full py-2.5 px-3 rounded-xl border border-white/25 bg-black/15 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/40"
            />
          </div>

          <div className="mb-4">
            <label className="block text-white/90 text-sm font-semibold mb-2 text-shadow">
              설명
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full py-2.5 px-3 rounded-xl border border-white/25 bg-black/15 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/40"
              rows={3}
            />
          </div>

          <div className="mb-4">
            <label className="block text-white/90 text-sm font-semibold mb-2 text-shadow">
              아이템명
            </label>
            <input
              type="text"
              value={formData.itemName}
              onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
              className="w-full py-2.5 px-3 rounded-xl border border-white/25 bg-black/15 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/40"
              placeholder="예: 기본 패키지"
            />
          </div>

          <div className="mb-6">
            <label className="block text-white/90 text-sm font-semibold mb-2 text-shadow">
              가격 (원)
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full py-2.5 px-3 rounded-xl border border-white/25 bg-black/15 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/40"
              placeholder="예: 1500000"
            />
          </div>

          {message && (
            <div
              className={`mb-4 p-3 rounded-2xl border text-shadow ${
                message.includes('✅')
                  ? 'border-white/25 bg-white/10 text-white'
                  : 'border-white/25 bg-black/20 text-white'
              }`}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 rounded-full border border-white/45 bg-white/15 hover:bg-white/20 transition-colors font-semibold text-white text-shadow disabled:opacity-50 disabled:hover:bg-white/15"
          >
            {loading ? '추가 중...' : '업체 추가'}
          </button>
        </form>
      </Reveal>
    </main>
  )
}


