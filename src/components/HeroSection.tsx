'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import Image from 'next/image'

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const flowerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const descRef = useRef<HTMLParagraphElement>(null)
  const btnsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.3 })

      // Flower fade in
      tl.from(flowerRef.current, {
        opacity: 0,
        scale: 0.5,
        duration: 1.5,
        ease: 'power3.out',
      })

      // Continuous slow rotation on the flower only
      gsap.to(flowerRef.current, {
        rotation: 360,
        duration: 20,
        repeat: -1,
        ease: 'none',
      })

      // Logo text fade in
      tl.from(textRef.current, {
        opacity: 0,
        y: 30,
        duration: 1,
        ease: 'power3.out',
      }, '-=0.8')

      // Description
      tl.from(descRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: 'power3.out',
      }, '-=0.4')

      // Buttons
      tl.from(btnsRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: 'power3.out',
      }, '-=0.3')

    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={containerRef} className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        disablePictureInPicture
        disableRemotePlayback
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      >
        <source src="/hero-video-compressed.mp4" type="video/mp4" />
      </video>

      {/* Overlay */}
      <div className="video-overlay z-[1]" />

      {/* Content */}
      <div className="relative z-[3] text-center px-4 flex flex-col items-center">
        {/* Rotating Flower (actual logo flower) */}
        <div
          ref={flowerRef}
          className="w-28 h-28 md:w-36 md:h-36 relative mb-6"
                  >
          <Image
            src="/logo-flower-gold.png"
            alt="Cozy Chocolate"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Logo Text (COZY chocolate - actual logo image, static) */}
        <div
          ref={textRef}
          dir="ltr"
          className="relative w-64 h-20 md:w-80 md:h-24 mb-10"
                  >
          <Image
            src="/logo-text-gold.png"
            alt="COZY chocolate"
            fill
            className="object-contain"
            priority
          />
        </div>

        <p ref={descRef} className="text-lg md:text-xl text-brand-cream max-w-xl mx-auto mb-12 leading-relaxed tracking-wide drop-shadow-lg" style={{textShadow:'0 2px 12px rgba(0,0,0,0.7)'}}>
          أفخر أنواع الشوكولاتة المصنوعة يدوياً بحب
        </p>

        <div ref={btnsRef} className="flex gap-5 justify-center">
          <a
            href="#occasions"
            className="px-8 py-3.5 bg-[#779599] text-brand-cream border border-[#779599] rounded-full font-bold text-base hover:bg-[#5B7B6F] hover:scale-105 transition-all duration-300 shadow-lg shadow-black/30"
          >
            المناسبات
          </a>
          <a
            href="#boxes"
            className="px-8 py-3.5 bg-[#F0A8A5] text-[#3D2B1F] border border-[#F0A8A5] rounded-full font-bold text-base hover:bg-[#E8928A] hover:scale-105 transition-all duration-300 shadow-lg shadow-black/30"
          >
            البوكسات
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[3]">
        <div className="w-5 h-8 rounded-full border border-brand-cream/30 flex justify-center pt-1.5">
          <div className="w-1 h-2 bg-brand-cream/50 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  )
}
