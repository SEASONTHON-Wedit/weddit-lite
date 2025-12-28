'use client'

import { Vendor } from '@/types'
import { CategoryLabels, RegionLabels } from '@/types'
import Link from 'next/link'

interface VendorCardProps {
  vendor: Vendor
  variant?: 'light' | 'glass'
  hrefBase?: string
}

export default function VendorCard({ vendor, variant = 'light', hrefBase = '/vendors' }: VendorCardProps) {
  const allPrices = vendor.items.flatMap((item) => item.prices.map((p) => p.price))
  const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : null
  const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) : null

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  return (
    <Link
      href={`${hrefBase}/${vendor.id}`}
      className={
        variant === 'glass'
          ? 'block rounded-3xl panel-contrast p-4 sm:p-6 transition-all hover:bg-black/55 hover:border-white/45'
          : 'block rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm transition-all hover:shadow-md hover:border-gray-300'
      }
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={
                variant === 'glass'
                  ? 'text-xs font-medium text-white bg-black/35 border border-white/35 px-2 py-1 rounded-full text-shadow'
                  : 'text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full'
              }
            >
              {CategoryLabels[vendor.category]}
            </span>
            <span className={variant === 'glass' ? 'text-xs font-medium text-white/90 text-shadow' : 'text-xs font-medium text-gray-500'}>
              {RegionLabels[vendor.region]}
            </span>
          </div>
          <h3 className={variant === 'glass' ? 'text-lg font-semibold text-white/95 mb-1' : 'text-lg font-semibold text-gray-900 mb-1'}>
            {vendor.name}
          </h3>
          {vendor.description && (
            <p className={variant === 'glass' ? 'text-sm text-white/75 line-clamp-2 mb-4' : 'text-sm text-gray-600 line-clamp-2 mb-4'}>
              {vendor.description}
            </p>
          )}
          {minPrice !== null && (
            <div className="flex items-baseline gap-1">
              <span className={variant === 'glass' ? 'text-2xl font-bold text-white/95' : 'text-2xl font-bold text-gray-900'}>
                {formatPrice(minPrice)}원
              </span>
              {maxPrice !== null && maxPrice !== minPrice && (
                <span className={variant === 'glass' ? 'text-sm text-white/70' : 'text-sm text-gray-500'}>
                  ~ {formatPrice(maxPrice)}원
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      {vendor.items.length > 0 && (
        <div className={variant === 'glass' ? 'mt-4 pt-4 border-t border-white/15' : 'mt-4 pt-4 border-t border-gray-100'}>
          <p className={variant === 'glass' ? 'text-xs text-white/85 text-shadow' : 'text-xs text-gray-500'}>
            {vendor.items.length}개 아이템 · {allPrices.length}개 가격 옵션
          </p>
        </div>
      )}
    </Link>
  )
}


