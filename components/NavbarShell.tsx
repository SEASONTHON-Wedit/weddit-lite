'use client'

import { usePathname } from 'next/navigation'
import Navbar from '@/components/Navbar'
import NavbarV2 from '@/components/NavbarV2'

export default function NavbarShell() {
  const pathname = usePathname()
  const isV2 = pathname?.startsWith('/v2')
  return isV2 ? <NavbarV2 /> : <Navbar />
}


