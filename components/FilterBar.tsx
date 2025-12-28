'use client'

import { Category, Region, CategoryLabels, RegionLabels } from '@/types'
import { useState } from 'react'

interface FilterBarProps {
  selectedCategory: Category | null
  selectedRegion: Region | null
  minPrice: string
  maxPrice: string
  onCategoryChange: (category: Category | null) => void
  onRegionChange: (region: Region | null) => void
  onMinPriceChange: (price: string) => void
  onMaxPriceChange: (price: string) => void
  variant?: 'light' | 'glass'
  sticky?: boolean
  className?: string
  /** 모바일에서 줄바꿈을 최소화하는 컴팩트 레이아웃(v2 용도) */
  compact?: boolean
}

export default function FilterBar({
  selectedCategory,
  selectedRegion,
  minPrice,
  maxPrice,
  onCategoryChange,
  onRegionChange,
  onMinPriceChange,
  onMaxPriceChange,
  variant = 'light',
  sticky = true,
  className = '',
  compact = false,
}: FilterBarProps) {
  const [isOpen, setIsOpen] = useState(false)

  const isGlass = variant === 'glass'
  const wrapClass = isGlass
    ? `panel-contrast ${sticky ? 'sticky top-[var(--nav-offset)]' : ''} z-10 rounded-3xl`
    : `bg-white border-b border-gray-200 ${sticky ? 'sticky top-0' : ''} z-10`

  const labelClass = isGlass ? 'text-white/90 text-shadow' : 'text-gray-700'
  const pillSelected = isGlass
    ? 'bg-white/25 text-white border border-white/60 text-shadow'
    : 'bg-gray-900 text-white'
  const pill = isGlass
    ? 'bg-black/15 text-white hover:bg-black/25 border border-white/30 text-shadow'
    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
  const selectClass = isGlass
    ? 'px-4 py-2 rounded-full text-sm font-medium bg-black/15 text-white border border-white/35 focus:ring-2 focus:ring-white/60 focus:outline-none'
    : 'px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-700 border-0 focus:ring-2 focus:ring-gray-900 focus:outline-none'
  const toggleClass = isGlass
    ? 'px-4 py-2 rounded-full text-sm font-medium bg-black/15 text-white hover:bg-black/25 transition-colors border border-white/35 text-shadow'
    : 'px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors'
  const inputClass = isGlass
    ? 'px-4 py-2 rounded-lg text-sm border border-white/35 bg-black/15 text-white placeholder:text-white/70 focus:ring-2 focus:ring-white/60 focus:outline-none w-32'
    : 'px-4 py-2 rounded-lg text-sm border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:outline-none w-32'

  return (
    <div className={`${wrapClass} ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-4">
          {/* 카테고리(항상 1줄 스크롤) */}
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${labelClass} whitespace-nowrap`}>카테고리</span>
            <div className="flex gap-2 overflow-x-auto no-scrollbar flex-nowrap">
              <button
                onClick={() => onCategoryChange(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                  selectedCategory === null ? pillSelected : pill
                }`}
                style={{ whiteSpace: 'nowrap' }}
              >
                전체
              </button>
              {Object.entries(CategoryLabels).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => onCategoryChange(key as Category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                    selectedCategory === key ? pillSelected : pill
                  }`}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* 지역 + 가격필터: compact면 모바일에서도 한 줄 */}
          <div
            className={`mt-3 flex items-center gap-3 ${
              compact ? 'flex-nowrap justify-between' : 'flex-wrap'
            }`}
          >
            <div className={`flex items-center gap-2 ${compact ? 'min-w-0' : ''}`}>
              <span className={`text-sm font-medium ${labelClass} whitespace-nowrap`}>지역</span>
              <select
                value={selectedRegion || ''}
                onChange={(e) => onRegionChange(e.target.value ? (e.target.value as Region) : null)}
                className={`${selectClass} ${compact ? 'min-w-0' : ''}`}
              >
                <option value="">전체</option>
                {Object.entries(RegionLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`${toggleClass} ${compact ? 'shrink-0' : ''}`}
              style={{ whiteSpace: 'nowrap' }}
            >
              가격 필터 {isOpen ? '▲' : '▼'}
            </button>
          </div>
        </div>

        {/* 가격 필터 패널 */}
        {isOpen && (
          <div className={`pb-4 pt-4 ${isGlass ? 'border-t border-white/15' : 'border-t border-gray-100'}`}>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className={`text-sm font-medium ${labelClass}`}>최소 가격</label>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => onMinPriceChange(e.target.value)}
                  placeholder="0"
                  className={inputClass}
                />
                <span className={`text-sm ${isGlass ? 'text-white/60' : 'text-gray-500'}`}>원</span>
              </div>
              <span className={isGlass ? 'text-white/45' : 'text-gray-400'}>~</span>
              <div className="flex items-center gap-2">
                <label className={`text-sm font-medium ${labelClass}`}>최대 가격</label>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => onMaxPriceChange(e.target.value)}
                  placeholder="무제한"
                  className={inputClass}
                />
                <span className={`text-sm ${isGlass ? 'text-white/60' : 'text-gray-500'}`}>원</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


