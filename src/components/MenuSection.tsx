'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Image from 'next/image'
import { X } from 'lucide-react'
import SARSymbol from './SARSymbol'
import { Product, Category } from '@/lib/supabase'

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
  const [categories, setCategories] = useState<Category[]>([])
  const [activeTab, setActiveTab] = useState<string>('all')

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(data => setCategories(data))
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(titleRef.current, {
        scrollTrigger: { trigger: titleRef.current, start: 'top 85%', toggleActions: 'play none none reverse' },
        opacity: 0, y: 50, duration: 1, ease: 'power3.out',
      })
      const cards = sectionRef.current?.querySelectorAll('.product-card')
      if (cards) {
        gsap.fromTo(cards,
          { opacity: 0, y: 40, scale: 0.95 },
          { scrollTrigger: { trigger: sectionRef.current, start: 'top 65%', toggleActions: 'play none none reverse' },
            opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.08, ease: 'power3.out' }
        )
      }
    }, sectionRef)
    return () => ctx.revert()
  }, [products.length, activeTab])

  return (
    <section id={id} ref={sectionRef} className="py-24 px-4 md:px-8 overflow-hidden">
      <div ref={titleRef} className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold gold-gradient mb-4">{title}</h2>
        <p className="text-brand-cream/80 text-base md:text-lg">{subtitle}</p>
        <div className="w-20 h-px bg-gradient-to-r from-transparent via-gold-500/60 to-transparent mx-auto mt-6" />
      </div>

      {/* Subcategory Tabs */}
      {(() => {
        const mainCat = categories.find(c => c.parent_id === null && c.name === id)
        const rawSubs = mainCat ? categories.filter(c => c.parent_id === mainCat.id && c.is_active) : []
        const seen = new Set<string>(); const subs = rawSubs.filter(s => { if (seen.has(s.name)) return false; seen.add(s.name); return true })
        if (subs.length === 0) return null
        const folder = id === 'occasions' ? 'munasabat' : 'boxes'
        const iconFiles: Record<string, string> = {
          chocolate:       `${folder}/chocolate.png`,
          petit_four:      'munasabat/petit-four.png',
          salties:         'munasabat/salties.png',
          hala_qahwa:      `${folder}/hala-qahwa.png`,
          packages:        'munasabat/package.png',
          rental_trays:    'munasabat/rental-trays.png',
          special_offers:  'boxes/special-offers.png',
          chocolate_bites: 'boxes/chocolate-bites.png',
          biscuits:        'boxes/biscuits.png',
          pudding:         'boxes/pudding.png',
          choices_set:     'boxes/choices-set.png',
          trays:           'boxes/trays.png',
          coffee:          'boxes/coffee.png',
        }
        const allTabs = [{id:'all', name_ar:'الكل', name:'all'}, ...subs]
        return (
          <div className="mb-10 px-4">
            <div className="flex flex-wrap justify-center gap-3">
              {allTabs.map(tab => {
                const isActive = activeTab === tab.id
                const dbIcon = 'icon_url' in tab ? tab.icon_url : null
                const src = tab.name === 'all' ? null : (dbIcon || (iconFiles[tab.name] ? `/icons/${iconFiles[tab.name]}` : null))
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex flex-col items-center gap-2 w-[90px] py-3 rounded-2xl font-medium transition-all duration-300 ${
                      isActive ? 'text-[#1a0f00] scale-105' : 'text-brand-cream/60 hover:text-brand-cream/90 hover:scale-105'
                    }`}
                    style={isActive
                      ? {background:'linear-gradient(145deg,#D4AF37,#B8902E)', boxShadow:'0 6px 20px rgba(212,175,55,0.45)'}
                      : {background:'rgba(255,255,255,0.04)', border:'1px solid rgba(212,175,55,0.15)'}}
                  >
                    {src
                      ? <img src={src} alt={tab.name_ar} width={56} height={56} className="rounded-xl object-cover" />
                      : <span className="text-3xl">✨</span>
                    }
                    <span className="text-xs leading-snug text-center w-full px-1">{tab.name_ar}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })()}

      <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-6 md:gap-10">
        {products.filter(p => activeTab === 'all' || p.category_id === activeTab).map((product) => (
          <div
            key={product.id}
            onClick={() => setSelected(product)}
            className="product-card group cursor-pointer flex flex-col items-center gap-3"
          >
            {/* Circle image */}
            <div
              className="relative overflow-hidden rounded-full shadow-lg w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36"
              style={{
                border: '2px solid rgba(212,175,55,0.3)',
                transition: 'transform 0.35s cubic-bezier(0.23,1,0.32,1), box-shadow 0.35s ease, border-color 0.35s ease',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLDivElement
                el.style.transform = 'scale(1.08)'
                el.style.boxShadow = '0 12px 40px rgba(0,0,0,0.5), 0 0 20px rgba(212,175,55,0.3)'
                el.style.borderColor = 'rgba(212,175,55,0.8)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLDivElement
                el.style.transform = 'scale(1)'
                el.style.boxShadow = ''
                el.style.borderColor = 'rgba(212,175,55,0.3)'
              }}
            >
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.name_ar}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full" style={{background:'linear-gradient(135deg, #2a1a0e 0%, #3d2b1f 50%, #1a0f06 100%)'}} />
              )}
            </div>

            {/* Name + Price below circle */}
            <div className="text-center transition-all duration-300 group-hover:scale-110" dir="rtl">
              <p className="text-white/70 text-sm font-semibold leading-tight line-clamp-2 transition-colors duration-300 group-hover:text-white">{product.name_ar}</p>
              <p className="text-gold-300/70 text-sm mt-1 font-bold transition-colors duration-300 group-hover:text-gold-200">{product.price} <SARSymbol className="opacity-80" /></p>
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
            <div className="relative w-full md:w-[60%] aspect-square md:aspect-auto min-h-[220px] md:min-h-[420px] flex-shrink-0">
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
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#120a04] hidden md:block" />
            </div>

            {/* Details — 40% — scrollable on mobile */}
            <div className="flex-1 flex flex-col justify-center gap-4 p-6 md:p-9 overflow-y-auto" dir="rtl">
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
