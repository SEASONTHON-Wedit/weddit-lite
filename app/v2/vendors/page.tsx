import { Suspense } from 'react'
import V2VendorsPageClient from './V2VendorsPageClient'

export default function V2VendorsPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10" />}>
      <V2VendorsPageClient />
    </Suspense>
  )
}


