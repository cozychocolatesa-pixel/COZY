'use client'

import { useEffect, useState } from 'react'
import { supabase, Product } from '@/lib/supabase'
import SmoothScroll from '@/components/SmoothScroll'
import HeroSection from '@/components/HeroSection'
import MenuSection from '@/components/MenuSection'
import Footer from '@/components/Footer'

export default function Home() {
  const [occasions, setOccasions] = useState<Product[]>([])
  const [boxes, setBoxes] = useState<Product[]>([])

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
          subtitle="شوكولاتة فاخرة لكل مناسبة تستحق التميّز"
          products={occasions}
        />
        <MenuSection
          id="boxes"
          title="منيو البوكسات"
          subtitle="بوكسات هدايا مصممة بعناية لمن تحب"
          products={boxes}
        />
        <Footer />
      </main>
    </SmoothScroll>
  )
}
