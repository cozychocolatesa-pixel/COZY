'use client'

import { useEffect, useState, useRef } from 'react'
import { X, Play } from 'lucide-react'

type Work = {
  id: string
  type: 'image' | 'video'
  url: string
  sort_order: number
}

export default function WorksSection() {
  const [works, setWorks] = useState<Work[]>([])
  const [selected, setSelected] = useState<Work | null>(null)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    fetch('/api/works').then(r => r.json()).then(setWorks).catch(() => {})
  }, [])

  if (works.length === 0) return null

  return (
    <section ref={sectionRef} className="py-24 px-4 md:px-8">
      <div className="text-center mb-14">
        <h2 className="text-4xl md:text-5xl font-bold gold-gradient mb-4">أعمالنا</h2>
        <p className="text-brand-cream/70 text-base md:text-lg">لحظات من الفخامة والتميّز</p>
        <div className="w-20 h-px bg-gradient-to-r from-transparent via-gold-500/60 to-transparent mx-auto mt-6" />
      </div>

      <div className="max-w-5xl mx-auto columns-2 sm:columns-3 md:columns-4 gap-3 space-y-3">
        {works.map(work => (
          <div
            key={work.id}
            onClick={() => setSelected(work)}
            className="break-inside-avoid cursor-pointer relative group overflow-hidden rounded-xl"
            style={{ border: '1.5px solid rgba(212,175,55,0.15)' }}
          >
            {work.type === 'video' ? (
              <div className="relative">
                <video
                  src={work.url}
                  className="w-full object-cover"
                  muted
                  playsInline
                  preload="metadata"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-gold-500/80 flex items-center justify-center">
                    <Play size={20} className="text-white fill-white ml-0.5" />
                  </div>
                </div>
              </div>
            ) : (
              <img
                src={work.url}
                alt="أعمالنا"
                className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(5,2,1,0.95)', backdropFilter: 'blur(16px)' }}
          onClick={() => setSelected(null)}
        >
          <button
            onClick={() => setSelected(null)}
            className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
          >
            <X size={20} />
          </button>
          <div
            className="max-w-4xl w-full rounded-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {selected.type === 'video' ? (
              <video
                src={selected.url}
                controls
                autoPlay
                className="w-full max-h-[85vh] object-contain bg-black"
              />
            ) : (
              <img
                src={selected.url}
                alt="أعمالنا"
                className="w-full max-h-[85vh] object-contain"
              />
            )}
          </div>
        </div>
      )}
    </section>
  )
}
