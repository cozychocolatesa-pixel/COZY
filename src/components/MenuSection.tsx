'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Image from 'next/image'
import { X, ChevronDown } from 'lucide-react'
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
  const [openId, setOpenId] = useState<string | null>(null)
  const contentRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const [liked, setLiked] = useState<Set<string>>(new Set())
  const [views, setViews] = useState<Record<string, number>>({})
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({})
  const [shared, setShared] = useState(false)

  useEffect(() => {
    const l = JSON.parse(localStorage.getItem('cozy_likes') || '[]')
    setLiked(new Set(l))
    const counts: Record<string, number> = {}
    const viewCounts: Record<string, number> = {}
    products.forEach(p => {
      if (p.likes != null) counts[p.id] = p.likes
      if (p.views != null) viewCounts[p.id] = p.views
    })
    setLikeCounts(counts)
    setViews(viewCounts)
  }, [products])

  const formatCount = (n: number) => n >= 1000 ? (n / 1000).toFixed(1).replace('.0', '') + 'k' : String(n)

  const openProduct = (product: Product) => {
    setSelected(product)
    const viewed = new Set<string>(JSON.parse(localStorage.getItem('cozy_viewed') || '[]'))
    if (!viewed.has(product.id)) {
      viewed.add(product.id)
      localStorage.setItem('cozy_viewed', JSON.stringify(Array.from(viewed)))
      setViews(prev => ({ ...prev, [product.id]: (prev[product.id] || 0) + 1 }))
      fetch('/api/product-stats', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: product.id, action: 'view' }) }).catch(() => {})
    }
  }

  const toggleLike = (id: string) => {
    const isLiking = !liked.has(id)
    setLiked(prev => {
      const next = new Set(prev)
      if (isLiking) { next.add(id) } else { next.delete(id) }
      localStorage.setItem('cozy_likes', JSON.stringify(Array.from(next)))
      return next
    })
    setLikeCounts(prev => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) + (isLiking ? 1 : -1)) }))
    fetch('/api/product-stats', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, action: isLiking ? 'like' : 'unlike' }) }).catch(() => {})
  }

  const shareProduct = async (product: Product) => {
    const text = `${product.name_ar} — ${product.price} ريال`
    if (navigator.share) {
      await navigator.share({ title: product.name_ar, text, url: window.location.href }).catch(() => {})
    } else {
      await navigator.clipboard.writeText(`${text}\n${window.location.href}`)
    }
    setShared(true)
    setTimeout(() => setShared(false), 2000)
  }

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(data => setCategories(data))
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(titleRef.current, {
        scrollTrigger: { trigger: titleRef.current, start: 'top 85%', toggleActions: 'play none none reverse' },
        opacity: 0, y: 50, duration: 1, ease: 'power3.out',
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  const toggleAccordion = (subId: string) => {
    const isOpening = openId !== subId

    if (openId && contentRefs.current[openId]) {
      const el = contentRefs.current[openId]!
      gsap.to(el, { height: 0, duration: 0.55, ease: 'power3.inOut' })
    }

    if (!isOpening) { setOpenId(null); return }

    setOpenId(subId)
    requestAnimationFrame(() => {
      const el = contentRefs.current[subId]
      if (!el) return
      el.style.height = 'auto'
      const h = el.scrollHeight
      el.style.height = '0px'
      gsap.to(el, {
        height: h, duration: 0.65, ease: 'power3.inOut',
        onComplete: () => { el.style.height = 'auto' },
      })
      const cards = el.querySelectorAll('.product-card')
      gsap.fromTo(cards,
        { opacity: 0, y: 50, scale: 0.85, rotateX: 8 },
        { opacity: 1, y: 0, scale: 1, rotateX: 0, duration: 0.65, stagger: 0.12, ease: 'power3.out', delay: 0.25 }
      )
    })
  }

  const renderCard = (product: Product) => (
    <div
      key={product.id}
      onClick={() => openProduct(product)}
      className="product-card group cursor-pointer flex flex-col items-center gap-3 w-[calc(33.333%-16px)] sm:w-[calc(25%-18px)]"
    >
      <div
        className="relative overflow-hidden rounded-full shadow-lg w-28 h-28 sm:w-32 sm:h-32"
        style={{ border: '2px solid rgba(212,175,55,0.3)', transition: 'transform 0.35s cubic-bezier(0.23,1,0.32,1), box-shadow 0.35s ease, border-color 0.35s ease' }}
        onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'scale(1.08)'; el.style.boxShadow = '0 12px 40px rgba(0,0,0,0.5),0 0 20px rgba(212,175,55,0.3)'; el.style.borderColor = 'rgba(212,175,55,0.8)' }}
        onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'scale(1)'; el.style.boxShadow = ''; el.style.borderColor = 'rgba(212,175,55,0.3)' }}
      >
        {product.image_url
          ? <Image src={product.image_url} alt={product.name_ar} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
          : <div className="w-full h-full" style={{ background: 'linear-gradient(135deg,#2a1a0e,#3d2b1f,#1a0f06)' }} />
        }
      </div>
      <div className="text-center transition-all duration-300 group-hover:scale-110" dir="rtl">
        <p className="text-white/70 text-sm font-semibold leading-tight line-clamp-2 transition-colors duration-300 group-hover:text-white">{product.name_ar}</p>
        <p className="text-gold-300/70 text-sm mt-1 font-bold transition-colors duration-300 group-hover:text-gold-200">{product.price} <SARSymbol className="opacity-80" /></p>
      </div>
    </div>
  )

  return (
    <section id={id} ref={sectionRef} className="py-24 px-4 md:px-8 overflow-hidden">
      <div ref={titleRef} className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold gold-gradient mb-4">{title}</h2>
        <p className="text-brand-cream/80 text-base md:text-lg">{subtitle}</p>
        <div className="w-20 h-px bg-gradient-to-r from-transparent via-gold-500/60 to-transparent mx-auto mt-6" />
      </div>

      {/* Accordion */}
      {(() => {
        const mainCat = categories.find(c => c.parent_id === null && c.name === id)
        const rawSubs = mainCat ? categories.filter(c => c.parent_id === mainCat.id && c.is_active) : []
        const seen = new Set<string>()
        const subs = rawSubs.filter(s => { if (seen.has(s.name)) return false; seen.add(s.name); return true })

        if (subs.length === 0) {
          return (
            <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-6 px-4">
              {products.map(p => renderCard(p))}
            </div>
          )
        }

        const noCategoryId = products.every(p => !p.category_id)

        return (
          <div className="max-w-2xl mx-auto" style={{border:'1.5px solid rgba(245,240,235,0.35)', borderRadius:'16px', overflow:'hidden'}}>
            {subs.map((sub, idx) => {
              const subProducts = noCategoryId
                ? (idx === 0 ? products : [])
                : products.filter(p => p.category_id === sub.id)
              const isOpen = openId === sub.id
              return (
                <div key={sub.id} style={idx > 0 ? {borderTop:'2px solid rgba(245,240,235,0.5)'} : {}}>
                  <button
                    onClick={() => toggleAccordion(sub.id)}
                    className="w-full grid px-4 py-5 group"
                    style={{ gridTemplateColumns: '32px 1fr 32px', background: isOpen ? 'rgba(245,240,235,0.06)' : 'transparent' }}
                  >
                    <div className="flex items-center">
                      <ChevronDown
                        size={16}
                        className="text-brand-cream/50 transition-transform duration-300"
                        style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                      />
                    </div>
                    <span className={`text-xl font-bold text-center tracking-wide transition-colors duration-300 ${isOpen ? 'text-brand-cream' : 'text-brand-cream/85 group-hover:text-brand-cream'}`}>
                      {sub.name_ar}
                    </span>
                    <div />
                  </button>
                  <div
                    ref={el => { contentRefs.current[sub.id] = el }}
                    style={{ height: 0, overflow: 'hidden' }}
                  >
                    <div className="py-8 flex flex-wrap justify-center gap-6 px-4" style={{ perspective: '800px' }}>
                      {subProducts.map(p => renderCard(p))}
                      {subProducts.length === 0 && (
                        <p className="text-brand-cream/30 text-sm py-4">قريباً...</p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )
      })()}

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
            <div className="relative w-full md:w-[60%] flex-shrink-0 h-[200px] md:h-auto md:min-h-[420px]">
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
            <div className="flex-1 flex flex-col gap-3 p-5 md:p-7 overflow-y-auto" style={{minHeight:'200px'}} dir="rtl">
              {/* Category badge */}
              <span className="text-xs text-gold-400/70 tracking-[0.2em] border border-gold-500/20 px-3 py-1 rounded-full w-fit">
                {selected.category === 'occasions' ? 'مناسبات' : 'بوكسات'}
              </span>

              <h2 className="text-xl md:text-2xl font-bold text-white leading-snug pr-8 md:pr-0 break-words">{selected.name_ar}</h2>
              {selected.name && <p className="text-sage-400 text-sm tracking-widest -mt-2">{selected.name}</p>}

              <div className="w-12 h-px bg-gold-500/40" />

              <span className="text-2xl font-bold text-gold-300 flex items-center gap-2">
                {selected.price}
                <SARSymbol className="text-gold-400/80" />
              </span>

              {selected.description && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <p className="text-sage-400 text-xs tracking-widest mb-2">المكونات</p>
                  <p className="text-brand-cream/80 text-sm leading-relaxed">{selected.description}</p>
                </div>
              )}

              {/* Views / Like / Share */}
              <div className="flex items-center gap-3 pt-2 border-t border-white/10">
                <span className="flex items-center gap-2 text-brand-cream/50 text-sm">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>
                  {formatCount(views[selected.id] || 1)}
                </span>
                <button
                  onClick={() => toggleLike(selected.id)}
                  className="flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-full transition-all duration-200"
                  style={{ background: liked.has(selected.id) ? 'rgba(248,113,113,0.15)' : 'rgba(255,255,255,0.06)', color: liked.has(selected.id) ? '#f87171' : 'rgba(245,240,235,0.6)', border: liked.has(selected.id) ? '1px solid rgba(248,113,113,0.3)' : '1px solid rgba(255,255,255,0.1)' }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill={liked.has(selected.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  {liked.has(selected.id) ? 'أعجبني' : 'إعجاب'} · {formatCount(likeCounts[selected.id] || 0)}
                </button>
                <button
                  onClick={() => shareProduct(selected)}
                  className="flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-full transition-all duration-200 mr-auto"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(245,240,235,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                  {shared ? '✓ تم النسخ' : 'مشاركة'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
