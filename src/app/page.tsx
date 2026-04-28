'use client'

import { useEffect, useState } from 'react'
import { supabase, Product } from '@/lib/supabase'
import SmoothScroll from '@/components/SmoothScroll'
import HeroSection from '@/components/HeroSection'
import MenuSection from '@/components/MenuSection'
import Footer from '@/components/Footer'
import WorksSection from '@/components/WorksSection'

export default function Home() {
  const [occasions, setOccasions] = useState<Product[]>([])
  const [boxes, setBoxes] = useState<Product[]>([])
  const [siteSettings, setSiteSettings] = useState({ occasions_subtitle: 'شوكولاتة فاخرة لكل مناسبة تستحق التميّز', boxes_subtitle: 'بوكسات هدايا مصممة بعناية لمن تحب' })

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(d => {
      setSiteSettings({
        occasions_subtitle: d.occasions_subtitle || 'شوكولاتة فاخرة لكل مناسبة تستحق التميّز',
        boxes_subtitle: d.boxes_subtitle || 'بوكسات هدايا مصممة بعناية لمن تحب',
      })
    }).catch(() => {})
  }, [])

  useEffect(() => {
    async function fetchProducts() {
      if (!supabase) return
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (data) {
        setOccasions(data.filter((p: Product) => p.category === 'occasions'))
        setBoxes(data.filter((p: Product) => p.category === 'boxes'))
      }
    }
    fetchProducts()
  }, [])

  return (
    <SmoothScroll>
      <main className="relative">
        <HeroSection />
        <MenuSection
          id="occasions"
          title="منيو المناسبات"
          subtitle={siteSettings.occasions_subtitle}
          products={occasions}
        />
        <MenuSection
          id="boxes"
          title="منيو البوكسات"
          subtitle={siteSettings.boxes_subtitle}
          products={boxes}
        />
        <WorksSection />
        <Footer />
      </main>
    </SmoothScroll>
  )
}
