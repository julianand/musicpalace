"use client"

import { useRef, useEffect } from "react"

export default function RelatedScroll({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let target = el.scrollLeft
    let current = el.scrollLeft
    let rafId: number

    const animate = () => {
      current += (target - current) * 0.12
      el.scrollLeft = current

      if (Math.abs(target - current) > 0.5) {
        rafId = requestAnimationFrame(animate)
      }
    }

    const onWheel = (e: WheelEvent) => {
      if (e.deltaY === 0) return
      e.preventDefault()
      target = Math.max(0, Math.min(target + e.deltaY, el.scrollWidth - el.clientWidth))
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(animate)
    }

    el.addEventListener("wheel", onWheel, { passive: false })
    return () => {
      el.removeEventListener("wheel", onWheel)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div ref={ref} className="flex gap-5 overflow-x-auto pt-2 pb-3 scrollbar-styled">
      {children}
    </div>
  )
}
