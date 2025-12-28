 'use client'

 import { useEffect, useRef, useState } from 'react'

 interface RevealProps {
   children: React.ReactNode
   className?: string
   /** 0~1, 교차 비율 */
   threshold?: number
   /** 처음 한 번만 애니메이션 */
   once?: boolean
 }

 export default function Reveal({
   children,
   className = '',
   threshold = 0.18,
   once = true,
 }: RevealProps) {
   const ref = useRef<HTMLDivElement | null>(null)
   const [inView, setInView] = useState(false)

   useEffect(() => {
     const el = ref.current
     if (!el) return

     const observer = new IntersectionObserver(
       (entries) => {
         const entry = entries[0]
         if (!entry) return
         if (entry.isIntersecting) {
           setInView(true)
           if (once) observer.disconnect()
         } else if (!once) {
           setInView(false)
         }
       },
       { threshold }
     )

     observer.observe(el)
     return () => observer.disconnect()
   }, [once, threshold])

   return (
     <div ref={ref} className={`reveal ${inView ? 'reveal-in' : ''} ${className}`}>
       {children}
     </div>
   )
 }


