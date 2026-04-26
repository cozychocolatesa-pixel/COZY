'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Image from 'next/image'
import { X } from 'lucide-react'
import SARSymbol from './SARSymbol'
import { Product } from '@/lib/supabase'

gsap.registerPlugin(ScrollTrigger)

interface MenuSectionProps {
  id: string
  title: string
  subtitle: string
  products: Product[]
}

export default function MenuSection({ id, title, subtitle, products }: MenuSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const [selected, setSelected] = useState<Product | null>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(titleRef.current, {
        scrollTrigger: { trigger: titleRef.current, start: 'top 85%', toggleActions: 'play none none reverse' },
        opacity: 0, y: 50, duration: 1, ease: 'power3.out',
      })
      const cards = sectionRef.current?.querySelectorAll('.product-card')
      if (cards) {
        gsap.to(cards, {
          scrollTrigger: { trigger: sectionRef.current, start: 'top 65%', toggleActions: 'play none none reverse' },
          opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.12, ease: 'power3.out',
        })
      }
    }, sectionRef)
    return () => ctx.revert()
  }, [products.length])

  return (
    <section id={id} ref={sectionRef} className="py-24 px-4 md:px-8 overflow-hidden">
      <div ref={titleRef} className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold gold-gradient mb-4">{title}</h2>
        <p className="text-brand-cream/80 text-base md:text-lg">{subtitle}</p>
        <div className="w-20 h-px bg-gradient-to-r from-transparent via-gold-500/60 to-transparent mx-auto mt-6" />
      </div>

      <div
        className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
        style={{ perspective: '1000px' }}
      >
        {products.map((product) => (
          <div
            key={product.id}
            onClick={() => setSelected(product)}
            className="product-card group cursor-pointer relative overflow-hidden rounded-xl shadow-xl"
            style={{
              border: '1px solid rgba(212,175,55,0.18)',
              transition: 'transform 0.4s cubic-bezier(0.23,1,0.32,1), box-shadow 0.4s ease',
              transformStyle: 'preserve-3d',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLDivElement
              el.style.transform = 'perspective(800px) translateZ(25px) scale(1.03)'
              el.style.boxShadow = '0 40px 80px rgba(0,0,0,0.6), 0 0 40px rgba(212,175,55,0.2)'
              el.style.borderColor = 'rgba(212,175,55,0.6)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLDivElement
              el.style.transform = 'perspective(800px) translateZ(0) scale(1)'
              el.style.boxShadow = ''
              el.style.borderColor = 'rgba(212,175,55,0.18)'
            }}
          >
            {/* Full image */}
            <div className="relative aspect-square overflow-hidden bg-sage-900">
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.name_ar}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                  style={{ transitionTimingFunction: 'cubic-bezier(0.25,0.46,0.45,0.94)' }}
                />
              ) : (
                <div className="w-full h-full bg-sage-800 flex items-center justify-center">
                  <span className="text-6xl opacity-15">🍫</span>
                </div>
              )}

              {/* Permanent bottom gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

              {/* Static info - always visible at bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-0 transition-transform duration-400">
                <h3 className="font-bold text-white text-base leading-tight drop-shadow-sm" dir="rtl">{product.name_ar}</h3>
                <div className="flex items-center justify-between mt-1" dir="rtl">
                  <span className="text-gold-300 font-bold text-lg drop-shadow-sm">
                    {product.price} <SARSymbol className="opacity-80" />
                  </span>
                </div>
              </div>

              {/* Hover slide-up panel */}
              <div
                className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-400 ease-out p-4 flex flex-col gap-2"
                style={{ background: 'linear-gradient(to top, rgba(15,8,2,0.97) 0%, rgba(15,8,2,0.9) 100%)' }}
              >
                <h3 className="font-bold text-white text-base" dir="rtl">{product.name_ar}</h3>
                {product.description && (
                  <p className="text-sage-300 text-xs leading-relaxed line-clamp-2" dir="rtl">{product.description}</p>
                )}
                <div className="flex items-center justify-between mt-1" dir="rtl">
                  <span className="text-gold-300 font-bold text-lg">{product.price} <SARSymbol /></span>
                  <span className="text-xs text-gold-400/80 tracking-widest border border-gold-500/30 px-3 py-1 rounded-full">تفاصيل</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-20">
          <p className="text-brand-cream/60 text-lg">قريباً...</p>
        </div>
      )}

      {/* Product Detail Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
          style={{ background: 'rgba(8,4,2,0.92)', backdropFilter: 'blur(12px)', animation: 'fadeIn 0.25s ease' }}
          onClick={() => setSelected(null)}
        >
          <div
            className="relative w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
            style={{
              background: '#120a04',
              border: '1px solid rgba(212,175,55,0.25)',
              animation: 'popIn 0.3s cubic-bezier(0.34,1.56,0.64,1)',
              maxHeight: '90vh',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setSelected(null)}
              className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all"
            >
              <X size={16} />
            </button>

            {/* Image — 60% */}
            <div className="relative w-full md:w-[60%] aspect-square md:aspect-auto min-h-[260px] md:min-h-[420px] flex-shrink-0">
              {selected.image_url ? (
                <Image
                  src={selected.image_url}
                  alt={selected.name_ar}
                  fill
                  className="object-cover"
                  sizes="(max-width:768px) 100vw, 60vw"
                />
              ) : (
                <div className="w-full h-full bg-sage-900 flex items-center justify-center">
                  <span className="text-8xl opacity-10">🍫</span>
                </div>
              )}
              {/* fade into details panel */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#120a04] hidden md:block" />
            </div>

            {/* Details — 40% */}
            <div className="flex-1 flex flex-col justify-center gap-4 p-7 md:p-9" dir="rtl">
              {/* Category badge */}
              <span className="text-xs text-gold-400/70 tracking-[0.2em] border border-gold-500/20 px-3 py-1 rounded-full w-fit">
                {selected.category === 'occasions' ? 'مناسبات' : 'بوكسات'}
              </span>

              <h2 className="text-2xl md:text-3xl font-bold text-white leading-snug">{selected.name_ar}</h2>
              {selected.name && <p className="text-sage-400 text-sm tracking-widest -mt-2">{selected.name}</p>}

              <div className="w-12 h-px bg-gold-500/40" />

              <span className="text-3xl font-bold text-gold-300 flex items-center gap-2">
                {selected.price}
                <SARSymbol className="text-gold-400/80" />
              </span>

              {selected.description && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <p className="text-sage-400 text-xs tracking-widest mb-2">المكونات</p>
                  <p className="text-brand-cream/80 text-sm leading-relaxed">{selected.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
