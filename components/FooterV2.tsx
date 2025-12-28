import Link from 'next/link'

export default function FooterV2() {
  return (
    <footer className="mt-14 sm:mt-20 border-t border-black/10 bg-white/60">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div>
            <div className="text-base font-semibold text-gray-900">Weddit Lite</div>
            <div className="mt-2 text-sm text-gray-600">
              공개된 결혼업체 가격을 보기 좋게 모아, 옵션/추가금까지 한 번에 비교합니다.
            </div>
            <div className="mt-4 text-xs text-gray-500">
              © {new Date().getFullYear()} Weddit Lite. All rights reserved.
            </div>
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <Link href="/v2/vendors" className="text-gray-700 hover:text-gray-900">
              업체
            </Link>
            <Link href="/v2/cart" className="text-gray-700 hover:text-gray-900">
              비교함
            </Link>
            <Link href="/v2/notices" className="text-gray-700 hover:text-gray-900">
              공지사항
            </Link>
            <Link href="/v2/stories/budget-101" className="text-gray-700 hover:text-gray-900">
              가이드
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}


