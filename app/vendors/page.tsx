import { Suspense } from 'react'
import VendorsPageClient from './VendorsPageClient'

export default function VendorsPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10" />}>
      <VendorsPageClient />
    </Suspense>
  )
}


