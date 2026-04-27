'use client'

import { useState, useEffect } from 'react'
import { Product, Category } from '@/lib/supabase'
import { Plus, Trash2, Eye, EyeOff, LogIn, Upload, GripVertical, Pencil, X, ChevronDown } from 'lucide-react'
import Image from 'next/image'

export default function Dashboard() {
  const [isAuth, setIsAuth] = useState(false)
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [sendingOtp, setSendingOtp] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showForm, setShowForm] = useState<'occasions' | 'boxes' | null>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragCategory, setDragCategory] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [settings, setSettings] = useState({ whatsapp: '', instagram_occasions: '', instagram_boxes: '' })
  const [savingSettings, setSavingSettings] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [collapsedCats, setCollapsedCats] = useState<Set<string>>(new Set())
  const toggleCat = (id: string) => setCollapsedCats(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  const [dragCatIdx, setDragCatIdx] = useState<number | null>(null)
  const [dragParentId, setDragParentId] = useState<string | null>(null)
  const [productFilter, setProductFilter] = useState<Record<string, string>>({ occasions: 'all', boxes: 'all' })

  const handleCatDragStart = (idx: number, parentId: string) => { setDragCatIdx(idx); setDragParentId(parentId) }
  const handleCatDragOver = (e: React.DragEvent, idx: number, parentId: string) => {
    e.preventDefault()
    if (dragCatIdx === null || dragCatIdx === idx || dragParentId !== parentId) return
    const subs = categories.filter(c => c.parent_id === parentId)
    const rest = categories.filter(c => c.parent_id !== parentId)
    const [moved] = subs.splice(dragCatIdx, 1)
    subs.splice(idx, 0, moved)
    setCategories([...rest, ...subs])
    setDragCatIdx(idx)
  }
  const handleCatDragEnd = async (parentId: string) => {
    setDragCatIdx(null); setDragParentId(null)
    const subs = categories.filter(c => c.parent_id === parentId)
    await Promise.all(subs.map((c, i) => fetch('/api/categories', { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ id: c.id, sort_order: i }) })))
  }
  const [showCatForm, setShowCatForm] = useState<null | { parentId: string | null }>(null)
  const [newCat, setNewCat] = useState({ name: '', name_ar: '' })
  const [editingCat, setEditingCat] = useState<Category | null>(null)
  const [newProduct, setNewProduct] = useState({
    name: '',
    name_ar: '',
    price: 0,
    category: 'occasions' as 'occasions' | 'boxes',
    image_url: '',
    description: '',
    is_active: true,
    sort_order: 0,
    category_id: null as string | null,
  })

  useEffect(() => {
    fetch('/api/auth/check').then(res => {
      if (res.ok) {
        setIsAuth(true)
        fetchProducts()
        fetchSettings()
        fetchCategories()
      }
    })
  }, [])

  const fetchCategories = async () => {
    const res = await fetch('/api/categories')
    const data = await res.json()
    setCategories(data)
  }

  const addCategory = async (parentId: string | null) => {
    if (!newCat.name_ar) return
    await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCat.name || newCat.name_ar, name_ar: newCat.name_ar, parent_id: parentId, sort_order: categories.filter(c => c.parent_id === parentId).length }),
    })
    setNewCat({ name: '', name_ar: '' })
    setShowCatForm(null)
    fetchCategories()
  }

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    await fetch('/api/categories', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    })
    setEditingCat(null)
    fetchCategories()
  }

  const deleteCategory = async (id: string) => {
    await fetch(`/api/categories?id=${id}`, { method: 'DELETE' })
    fetchCategories()
  }

  const fetchSettings = async () => {
    const res = await fetch('/api/settings')
    const data = await res.json()
    setSettings(s => ({ ...s, ...data }))
  }

  const saveSettings = async () => {
    setSavingSettings(true)
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    })
    setSavingSettings(false)
  }

  const sendOtp = async () => {
    setSendingOtp(true)
    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    })
    if (res.ok) {
      setOtpSent(true)
    } else {
      const data = await res.json()
      alert(data.error || 'الرقم غير مصرح له')
    }
    setSendingOtp(false)
  }

  const login = async () => {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ otp, phone }),
    })
    if (res.ok) {
      setIsAuth(true)
      fetchProducts()
    } else {
      alert('الرمز غير صحيح أو منتهي الصلاحية')
    }
  }

  const fetchProducts = async () => {
    const res = await fetch('/api/products')
    const data = await res.json()
    setProducts(data)
  }

  const handleDragStart = (index: number, category: string) => {
    setDragIndex(index)
    setDragCategory(category)
  }

  const handleDragOver = (e: React.DragEvent, index: number, category: string) => {
    e.preventDefault()
    if (dragIndex === null || dragIndex === index || dragCategory !== category) return
    const catProducts = products.filter(p => p.category === category)
    const others = products.filter(p => p.category !== category)
    const [moved] = catProducts.splice(dragIndex, 1)
    catProducts.splice(index, 0, moved)
    setProducts([...others, ...catProducts])
    setDragIndex(index)
  }

  const handleDragEnd = async (category: string) => {
    setDragIndex(null)
    setDragCategory(null)
    const catProducts = products.filter(p => p.category === category)
    await Promise.all(
      catProducts.map((p, i) => updateProduct(p.id, { sort_order: i }))
    )
  }

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    const data = await res.json()
    return data.url
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>): Promise<string | undefined> => {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    const url = await uploadImage(file)
    setNewProduct(prev => ({ ...prev, image_url: url }))
    setLoading(false)
    return url
  }

  const addProduct = async () => {
    setLoading(true)
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct),
    })
    if (res.ok) {
      setShowForm(null)
      setNewProduct({ name: '', name_ar: '', price: 0, category: 'occasions', image_url: '', description: '', is_active: true, sort_order: 0, category_id: null })
      fetchProducts()
    }
    setLoading(false)
  }

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    await fetch('/api/products', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    })
    fetchProducts()
  }

  const deleteProduct = async (id: string) => {
    await fetch(`/api/products?id=${id}`, { method: 'DELETE' })
    fetchProducts()
    setConfirmDelete(null)
  }

  const toggleActive = async (product: Product) => {
    await updateProduct(product.id, { is_active: !product.is_active })
  }

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-[#779599] flex items-center justify-center p-4" dir="rtl">
        <div className="rounded-2xl p-8 w-full max-w-md" style={{background:'rgba(255,255,255,0.85)', backdropFilter:'blur(16px)', border:'1px solid rgba(255,255,255,0.5)'}}>
          <div className="text-center mb-8">
            <div className="relative w-16 h-16 mx-auto mb-3 animate-spin" style={{animationDuration:'8s'}}>
              <Image src="/logo-flower-gold.png" alt="Cozy" fill className="object-contain" />
            </div>
            <h1 className="text-3xl font-bold text-[#3D2B1F]">لوحة التحكم</h1>
          </div>

          {!otpSent ? (
            <div className="space-y-4">
              <p className="text-[#3D2B1F] text-center text-sm font-medium">أدخل رقم الجوال للتحقق</p>
              <input
                type="tel"
                placeholder="+966XXXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendOtp()}
                className="w-full px-4 py-3 bg-white border-2 border-[#779599]/50 rounded-xl text-[#3D2B1F] placeholder:text-[#3D2B1F]/40 focus:border-[#779599] focus:outline-none text-center tracking-wider font-medium"
                dir="ltr"
              />
              <button
                onClick={sendOtp}
                disabled={sendingOtp || !phone}
                className="w-full py-3 bg-[#25D366] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-40 text-base shadow-md"
              >
                {sendingOtp ? (
                  <span className="animate-pulse">جاري الإرسال...</span>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.533 5.854L0 24l6.335-1.521A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.015-1.374l-.36-.214-3.732.896.946-3.638-.234-.374A9.818 9.818 0 1112 21.818z"/></svg>
                    إرسال رمز عبر واتساب
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-[#3D2B1F] text-center text-sm font-medium">أدخل الرمز المرسل إلى واتساب الخاص بك</p>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="_ _ _ _ _ _"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => e.key === 'Enter' && login()}
                className="w-full px-4 py-3 bg-white border-2 border-[#779599]/50 rounded-xl text-[#3D2B1F] placeholder:text-[#3D2B1F]/30 focus:border-[#779599] focus:outline-none text-center text-2xl tracking-[0.5em] font-bold"
              />
              <button
                onClick={login}
                className="w-full py-3 bg-gradient-to-r from-gold-600 to-gold-500 text-sage-950 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                <LogIn size={20} />
                دخول
              </button>
              <button
                onClick={() => { setOtpSent(false); setOtp('') }}
                className="w-full py-2 text-[#3D2B1F]/50 text-sm hover:text-[#3D2B1F]/80 transition-colors"
              >
                إعادة إرسال الرمز
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#779599] p-4 md:p-8" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-[#3D2B1F]">لوحة التحكم</h1>
          <button
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST' })
              setIsAuth(false)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white/60 hover:bg-white/80 text-[#3D2B1F]/70 hover:text-[#3D2B1F] rounded-xl text-sm transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            تسجيل خروج
          </button>
        </div>

        {/* Settings Panel */}
        <div className="rounded-2xl mb-6 overflow-hidden" style={{background:'rgba(255,255,255,0.92)', backdropFilter:'blur(12px)', border:'2px solid rgba(119,149,153,0.55)', boxShadow:'0 4px 20px rgba(61,43,31,0.1)'}}>
          <div className="flex items-center gap-3 px-6 py-4 border-b-2 border-[#779599]/40">
            <div className="w-8 h-8 rounded-xl bg-[#779599]/15 flex items-center justify-center text-base">⚙️</div>
            <h2 className="text-base font-bold text-[#3D2B1F]">إعدادات التواصل</h2>
          </div>
          <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-[#3D2B1F]/60 mb-1 font-medium">رقم الواتساب</label>
              <input
                placeholder="966XXXXXXXXX"
                value={settings.whatsapp}
                onChange={e => setSettings(s => ({...s, whatsapp: e.target.value}))}
                dir="ltr"
                className="w-full px-3 py-2 bg-white border border-[#779599]/40 rounded-xl text-[#3D2B1F] placeholder:text-[#3D2B1F]/30 focus:border-[#779599] focus:outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-[#3D2B1F]/60 mb-1 font-medium">إنستقرام - مناسبات</label>
              <input
                placeholder="https://www.instagram.com/..."
                value={settings.instagram_occasions}
                onChange={e => setSettings(s => ({...s, instagram_occasions: e.target.value}))}
                dir="ltr"
                className="w-full px-3 py-2 bg-white border border-[#779599]/40 rounded-xl text-[#3D2B1F] placeholder:text-[#3D2B1F]/30 focus:border-[#779599] focus:outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-[#3D2B1F]/60 mb-1 font-medium">إنستقرام - بوكسات</label>
              <input
                placeholder="https://www.instagram.com/..."
                value={settings.instagram_boxes}
                onChange={e => setSettings(s => ({...s, instagram_boxes: e.target.value}))}
                dir="ltr"
                className="w-full px-3 py-2 bg-white border border-[#779599]/40 rounded-xl text-[#3D2B1F] placeholder:text-[#3D2B1F]/30 focus:border-[#779599] focus:outline-none text-sm"
              />
            </div>
          </div>
          <button
            onClick={saveSettings}
            disabled={savingSettings}
            className="mt-4 px-6 py-2 bg-gradient-to-r from-[#D4AF37] to-[#C5A55A] text-[#3D2B1F] rounded-xl font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {savingSettings ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
          </button>
          </div>
        </div>

        {/* Category Management Panel */}
        <div className="rounded-2xl mb-6 overflow-hidden" style={{background:'rgba(255,255,255,0.92)', backdropFilter:'blur(12px)', border:'2px solid rgba(119,149,153,0.55)', boxShadow:'0 4px 20px rgba(61,43,31,0.1)'}}>
          <div className="flex items-center justify-between px-6 py-4 border-b-2 border-[#779599]/40">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#779599]/15 flex items-center justify-center text-base">📂</div>
              <h2 className="text-base font-bold text-[#3D2B1F]">إدارة الأقسام</h2>
            </div>
            <span className="text-xs text-[#779599] bg-[#779599]/10 px-2 py-1 rounded-lg">🖼 أيقونة الفرع: PNG · 200×200 · 500KB</span>
          </div>
          <div className="p-6">
          {categories.filter(c => c.parent_id === null).map(main => (
            <div key={main.id} className="mb-4 rounded-xl overflow-hidden" style={{border:'2px solid rgba(119,149,153,0.55)'}}>

              {/* Main category row */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#779599]/10 cursor-pointer select-none" onClick={() => toggleCat(main.id)}>
                {editingCat?.id === main.id ? (
                  <div className="flex gap-2 flex-1">
                    <input value={editingCat.name_ar} onChange={e => setEditingCat(c => c ? {...c, name_ar: e.target.value} : c)}
                      className="px-2 py-1 border border-[#779599]/40 rounded-lg text-sm text-[#3D2B1F] focus:outline-none w-28" placeholder="عربي" />
                    <input value={editingCat.name} onChange={e => setEditingCat(c => c ? {...c, name: e.target.value} : c)}
                      className="px-2 py-1 border border-[#779599]/40 rounded-lg text-sm text-[#3D2B1F] focus:outline-none w-28" placeholder="English" dir="ltr" />
                    <button onClick={() => updateCategory(main.id, {name: editingCat.name, name_ar: editingCat.name_ar})} className="px-3 py-1 bg-[#D4AF37] text-[#3D2B1F] rounded-lg text-xs font-bold">حفظ</button>
                    <button onClick={() => setEditingCat(null)} className="px-3 py-1 border border-[#779599]/30 text-[#3D2B1F]/60 rounded-lg text-xs">إلغاء</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <ChevronDown size={14} className="text-[#3D2B1F]/40 transition-transform duration-200" style={{transform: collapsedCats.has(main.id) ? 'rotate(-90deg)' : 'rotate(0deg)'}} />
                    <span className="font-bold text-[#3D2B1F]">{main.name_ar} <span className="text-[#3D2B1F]/40 text-xs font-normal">({main.name})</span></span>
                  </div>
                )}
                <div className="flex gap-2 items-center mr-2" onClick={e => e.stopPropagation()}>
                  <button onClick={() => updateCategory(main.id, {is_active: !main.is_active})}
                    className={`text-xs px-2 py-1 rounded-lg ${main.is_active ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                    {main.is_active ? 'ظاهر' : 'مخفي'}
                  </button>
                  <button onClick={() => setEditingCat(main)} className="p-1 text-[#779599] hover:bg-[#779599]/10 rounded"><Pencil size={14} /></button>
                  <button onClick={() => deleteCategory(main.id)} className="p-1 text-red-400 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                  <button onClick={() => { setShowCatForm({parentId: main.id}); setNewCat({name:'',name_ar:''}) }}
                    className="flex items-center gap-1 px-2 py-1 bg-[#D4AF37]/20 text-[#3D2B1F] rounded-lg text-xs font-bold">
                    <Plus size={12} /> فرعي
                  </button>
                </div>
              </div>
              {/* Subcategories */}
              <div className={`px-4 py-2 space-y-1 ${collapsedCats.has(main.id) ? 'hidden' : ''}`}>
                {categories.filter(c => c.parent_id === main.id).map((sub, subIdx) => (
                  <div
                    key={sub.id}
                    draggable
                    onDragStart={() => handleCatDragStart(subIdx, main.id)}
                    onDragOver={e => handleCatDragOver(e, subIdx, main.id)}
                    onDragEnd={() => handleCatDragEnd(main.id)}
                    className={`flex items-center justify-between py-2 px-3 rounded-lg gap-2 cursor-grab active:cursor-grabbing transition-colors ${
                      dragCatIdx === subIdx && dragParentId === main.id ? 'bg-[#779599]/20 opacity-50' : 'hover:bg-[#779599]/5'
                    }`}
                  >
                    <GripVertical size={14} className="text-[#3D2B1F]/20 flex-shrink-0" />
                    {/* Icon preview + upload */}
                    <div className="relative flex-shrink-0 group">
                      {(() => {
                        const parentName = categories.find(c => c.id === sub.parent_id)?.name
                        const folder = parentName === 'occasions' ? 'munasabat' : 'boxes'
                        const localMap: Record<string,string> = {
                          chocolate:'chocolate.png', petit_four:'petit-four.png', salties:'salties.png',
                          hala_qahwa:'hala-qahwa.png', packages:'package.png', rental_trays:'rental-trays.png',
                          special_offers:'special-offers.png', chocolate_bites:'chocolate-bites.png',
                          biscuits:'biscuits.png', pudding:'pudding.png', choices_set:'choices-set.png',
                          trays:'trays.png', coffee:'coffee.png',
                        }
                        const fallback = localMap[sub.name] ? `/icons/${folder}/${localMap[sub.name]}` : null
                        const iconSrc = sub.icon_url || fallback
                        return iconSrc
                          ? <img src={iconSrc} alt={sub.name_ar} className="w-10 h-10 rounded-xl object-cover" style={{border:'2px solid rgba(119,149,153,0.4)', boxShadow:'0 1px 6px rgba(61,43,31,0.1)'}} />
                          : <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[#779599]/40" style={{border:'2px dashed rgba(119,149,153,0.3)', background:'rgba(119,149,153,0.07)'}}>🖼</div>
                      })()}
                      <label className="absolute inset-0 cursor-pointer rounded-lg opacity-0 group-hover:opacity-100 bg-black/40 flex items-center justify-center transition-opacity">
                        <Upload size={14} className="text-white" />
                        <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={async e => {
                          const file = e.target.files?.[0]; if (!file) return
                          const fd = new FormData(); fd.append('file', file)
                          const res = await fetch('/api/upload-icon', { method: 'POST', body: fd })
                          const json = await res.json()
                          if (json.url) { await updateCategory(sub.id, { icon_url: json.url }); fetchCategories() }
                        }} />
                      </label>
                    </div>
                    {editingCat?.id === sub.id ? (
                      <div className="flex gap-2 flex-1">
                        <input value={editingCat.name_ar} onChange={e => setEditingCat(c => c ? {...c, name_ar: e.target.value} : c)}
                          className="px-2 py-1 border border-[#779599]/40 rounded-lg text-sm text-[#3D2B1F] focus:outline-none w-28" placeholder="عربي" />
                        <input value={editingCat.name} onChange={e => setEditingCat(c => c ? {...c, name: e.target.value} : c)}
                          className="px-2 py-1 border border-[#779599]/40 rounded-lg text-sm text-[#3D2B1F] focus:outline-none w-28" placeholder="English" dir="ltr" />
                        <button onClick={() => updateCategory(sub.id, {name: editingCat.name, name_ar: editingCat.name_ar})} className="px-3 py-1 bg-[#D4AF37] text-[#3D2B1F] rounded-lg text-xs font-bold">حفظ</button>
                        <button onClick={() => setEditingCat(null)} className="px-3 py-1 border border-[#779599]/30 text-[#3D2B1F]/60 rounded-lg text-xs">إلغاء</button>
                      </div>
                    ) : (
                      <span className="text-[#3D2B1F]/85 text-sm font-medium flex-1">{sub.name_ar} <span className="text-[#3D2B1F]/30 text-xs font-normal">({sub.name})</span></span>
                    )}
                    <div className="flex gap-1 items-center">
                      <button onClick={() => updateCategory(sub.id, {is_active: !sub.is_active})}
                        className={`flex items-center gap-1 text-sm px-3 py-1 rounded-lg font-semibold transition-colors ${sub.is_active ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-red-400 text-white hover:bg-red-500'}`}>
                        {sub.is_active ? 'ظاهر' : 'مخفي'}
                      </button>
                      <button onClick={() => setEditingCat(sub)} className="p-2 text-[#779599] hover:bg-[#779599]/10 rounded-lg transition-colors"><Pencil size={16} /></button>
                      <button onClick={() => deleteCategory(sub.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
                {/* Add subcategory form */}
                {showCatForm?.parentId === main.id && (
                  <div className="flex gap-2 pt-1">
                    <input value={newCat.name_ar} onChange={e => setNewCat(c => ({...c, name_ar: e.target.value}))} placeholder="اسم عربي" className="px-2 py-1 border border-[#779599]/40 rounded-lg text-sm text-[#3D2B1F] focus:outline-none w-28" />
                    <input value={newCat.name} onChange={e => setNewCat(c => ({...c, name: e.target.value}))} placeholder="English" dir="ltr" className="px-2 py-1 border border-[#779599]/40 rounded-lg text-sm text-[#3D2B1F] focus:outline-none w-28" />
                    <button onClick={() => addCategory(main.id)} className="px-3 py-1 bg-[#D4AF37] text-[#3D2B1F] rounded-lg text-xs font-bold">إضافة</button>
                    <button onClick={() => setShowCatForm(null)} className="px-3 py-1 border border-[#779599]/30 text-[#3D2B1F]/60 rounded-lg text-xs">إلغاء</button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {/* Add main category */}
          {showCatForm?.parentId === null ? (
            <div className="flex gap-2 mt-2">
              <input value={newCat.name_ar} onChange={e => setNewCat(c => ({...c, name_ar: e.target.value}))} placeholder="اسم عربي" className="px-3 py-2 border border-[#779599]/40 rounded-xl text-sm text-[#3D2B1F] focus:outline-none" />
              <input value={newCat.name} onChange={e => setNewCat(c => ({...c, name: e.target.value}))} placeholder="English" dir="ltr" className="px-3 py-2 border border-[#779599]/40 rounded-xl text-sm text-[#3D2B1F] focus:outline-none" />
              <button onClick={() => addCategory(null)} className="px-4 py-2 bg-[#D4AF37] text-[#3D2B1F] rounded-xl text-sm font-bold">إضافة</button>
              <button onClick={() => setShowCatForm(null)} className="px-4 py-2 border border-[#779599]/30 text-[#3D2B1F]/60 rounded-xl text-sm">إلغاء</button>
            </div>
          ) : (
            <button onClick={() => { setShowCatForm({parentId: null}); setNewCat({name:'',name_ar:''}) }}
              className="flex items-center gap-1 mt-2 px-4 py-2 border border-dashed border-[#779599]/40 text-[#3D2B1F]/60 rounded-xl text-sm hover:border-[#779599] hover:text-[#3D2B1F] transition-colors">
              <Plus size={14} /> <span className="font-bold">قسم رئيسي جديد</span>
            </button>
          )}
          </div>
        </div>

        {/* Products Table */}
        {(['occasions', 'boxes'] as const).map(cat => {
          const mainCat = categories.find(c => c.parent_id === null && c.name === cat)
          const subs = mainCat ? categories.filter(c => c.parent_id === mainCat.id) : []
          const activeFilter = productFilter[cat] || 'all'
          const catProducts = products.filter(p => p.category === cat)
          const filteredProducts = activeFilter === 'all' ? catProducts : catProducts.filter(p => p.category_id === activeFilter)
          return (
          <div key={cat} className="rounded-2xl overflow-hidden mb-4" style={{background:'rgba(255,255,255,0.92)', backdropFilter:'blur(12px)', border:'2px solid rgba(119,149,153,0.8)', boxShadow:'0 4px 20px rgba(61,43,31,0.1)'}}>
            <div className="flex items-center justify-between p-4 border-b-2 border-[#779599]/25" style={{background:'rgba(119,149,153,0.12)'}}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#779599]/20 flex items-center justify-center text-base">{cat === 'occasions' ? '🎉' : '📦'}</div>
                <span className="text-[#3D2B1F] font-bold">{cat === 'occasions' ? 'مناسبات' : 'بوكسات'}</span>
                <span className="text-xs text-[#779599] bg-[#779599]/15 px-2 py-0.5 rounded-full font-medium">{catProducts.length}</span>
              </div>
              <button
                onClick={() => { setShowForm(cat); setNewProduct(p => ({...p, category: cat})) }}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#D4AF37] text-[#3D2B1F] rounded-lg text-xs font-bold hover:opacity-90 transition-opacity"
              >
                <Plus size={14} /> إضافة
              </button>
            </div>
            {subs.length > 0 && (
              <div className="flex flex-wrap gap-2 px-4 py-3 border-b border-[#779599]/15 bg-white/30">
                {[{id:'all', name_ar:'الكل'}, ...subs].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setProductFilter(f => ({...f, [cat]: tab.id}))}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                      activeFilter === tab.id
                        ? 'bg-[#779599] text-white'
                        : 'bg-[#779599]/10 text-[#3D2B1F]/60 hover:bg-[#779599]/20'
                    }`}
                  >
                    {tab.name_ar}
                    {tab.id !== 'all' && (
                      <span className="mr-1 opacity-60">({catProducts.filter(p => p.category_id === tab.id).length})</span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {showForm === cat && (
              <div className="p-4 border-b border-[#779599]/20 bg-white/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input placeholder="اسم المنتج (عربي)" value={newProduct.name_ar}
                    onChange={e => setNewProduct(p => ({...p, name_ar: e.target.value}))}
                    className="px-3 py-2 bg-white border border-[#779599]/40 rounded-xl text-[#3D2B1F] placeholder:text-[#3D2B1F]/40 focus:border-[#779599] focus:outline-none text-sm" />
                  <input placeholder="Product name (English)" value={newProduct.name}
                    onChange={e => setNewProduct(p => ({...p, name: e.target.value}))}
                    className="px-3 py-2 bg-white border border-[#779599]/40 rounded-xl text-[#3D2B1F] placeholder:text-[#3D2B1F]/40 focus:border-[#779599] focus:outline-none text-sm" />
                  <input type="number" placeholder="السعر" value={newProduct.price || ''}
                    onChange={e => setNewProduct(p => ({...p, price: Number(e.target.value)}))}
                    className="px-3 py-2 bg-white border border-[#779599]/40 rounded-xl text-[#3D2B1F] placeholder:text-[#3D2B1F]/40 focus:border-[#779599] focus:outline-none text-sm" />
                  <label className="px-3 py-2 bg-white border border-[#779599]/40 rounded-xl cursor-pointer hover:border-[#779599] flex items-center gap-2 text-[#3D2B1F] text-sm">
                    <Upload size={16} />{newProduct.image_url ? 'تم الرفع ✓' : 'رفع صورة'}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                  <select value={newProduct.category_id || ''} onChange={e => setNewProduct(p => ({...p, category_id: e.target.value || null}))}
                    className="px-3 py-2 bg-white border border-[#779599]/40 rounded-xl text-[#3D2B1F] focus:border-[#779599] focus:outline-none text-sm">
                    <option value="">— بدون قسم فرعي —</option>
                    {categories.filter(c => c.parent_id === categories.find(m => m.parent_id === null && m.name === cat)?.id).map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name_ar}</option>
                    ))}
                  </select>
                  <textarea placeholder="المكونات / الوصف (اختياري)" value={newProduct.description}
                    onChange={e => setNewProduct(p => ({...p, description: e.target.value}))}
                    rows={2} className="col-span-full px-3 py-2 bg-white border border-[#779599]/40 rounded-xl text-[#3D2B1F] placeholder:text-[#3D2B1F]/40 focus:border-[#779599] focus:outline-none resize-none text-sm" />
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={addProduct} disabled={loading}
                    className="px-5 py-2 bg-gradient-to-r from-[#D4AF37] to-[#C5A55A] text-[#3D2B1F] rounded-xl font-bold text-sm hover:opacity-90 disabled:opacity-50">
                    {loading ? 'جاري...' : 'حفظ'}
                  </button>
                  <button onClick={() => setShowForm(null)}
                    className="px-5 py-2 border border-[#779599]/40 text-[#3D2B1F]/70 rounded-xl text-sm hover:bg-[#779599]/10">
                    إلغاء
                  </button>
                </div>
              </div>
            )}

            <div className="grid gap-4 px-4 py-2.5 text-[#3D2B1F]/50 text-xs font-semibold tracking-wide border-b-2 border-[#779599]/20" style={{gridTemplateColumns:'1fr 70px 70px 100px 100px 80px', background:'rgba(119,149,153,0.06)'}}>
              <span>المنتج</span><span>👁 مشاهدة</span><span>❤️ إعجاب</span><span>السعر</span><span>الحالة</span><span></span>
            </div>

          {filteredProducts.map((product, index) => (
            <div
              key={product.id}
              draggable
              onDragStart={() => handleDragStart(index, cat)}
              onDragOver={(e) => handleDragOver(e, index, cat)}
              onDragEnd={() => handleDragEnd(cat)}
              className={`grid gap-4 p-4 items-center border-b border-[#779599]/20 transition-colors cursor-grab active:cursor-grabbing ${
                dragIndex === index && dragCategory === cat ? 'bg-[#779599]/20 opacity-50' : 'hover:bg-[#779599]/10'
              }`}
              style={{gridTemplateColumns:'1fr 70px 70px 100px 100px 80px'}}
            >
              <div className="flex items-center gap-3">
                <GripVertical size={16} className="text-[#3D2B1F]/30" />
                <div>
                  <p className="text-[#3D2B1F] text-sm font-medium">{product.name_ar}</p>
                  {product.name && <p className="text-[#3D2B1F]/40 text-xs">{product.name}</p>}
                </div>
              </div>
              <span className="text-[#3D2B1F]/60 text-sm font-medium">{product.views ?? 0}</span>
              <span className="text-[#3D2B1F]/60 text-sm font-medium">{product.likes ?? 0}</span>
              <div>
                {editingId === product.id ? (
                  <input
                    type="number"
                    defaultValue={product.price}
                    onBlur={(e) => {
                      updateProduct(product.id, { price: Number(e.target.value) })
                      setEditingId(null)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        updateProduct(product.id, { price: Number((e.target as HTMLInputElement).value) })
                        setEditingId(null)
                      }
                    }}
                    className="w-20 px-2 py-1 bg-white border border-[#779599] rounded text-[#3D2B1F] focus:outline-none"
                    autoFocus
                  />
                ) : (
                  <span
                    onClick={() => setEditingId(product.id)}
                    className="text-[#D4AF37] cursor-pointer hover:text-[#C5A55A]"
                  >
                    {product.price} ر.س
                  </span>
                )}
              </div>
              <button
                onClick={() => toggleActive(product)}
                className={`flex items-center gap-1 text-sm px-3 py-1 rounded-lg font-semibold transition-colors ${
                  product.is_active
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-red-400 text-white hover:bg-red-500'
                }`}
              >
                {product.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                {product.is_active ? 'ظاهر' : 'مخفي'}
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingProduct(product)}
                  className="p-2 text-[#779599] hover:bg-[#779599]/10 rounded-lg transition-colors"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => setConfirmDelete(product.id)}
                  className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          {catProducts.length === 0 && (
            <div className="p-8 text-center text-[#3D2B1F]/50 text-sm">
              لا توجد منتجات في هذا التصنيف
            </div>
          )}
          </div>
          )
        })}
      </div>

      {/* Delete Confirm Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:'rgba(0,0,0,0.5)', backdropFilter:'blur(4px)'}}>
          <div className="rounded-2xl p-6 w-full max-w-sm text-center" style={{background:'rgba(255,255,255,0.97)', border:'1px solid rgba(255,255,255,0.5)'}}>
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={22} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-[#3D2B1F] mb-2">حذف المنتج</h3>
            <p className="text-[#3D2B1F]/60 text-sm mb-6">هل أنت متأكد؟ لا يمكن التراجع عن هذا الإجراء.</p>
            <div className="flex gap-3">
              <button
                onClick={() => deleteProduct(confirmDelete)}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors"
              >
                حذف
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 border border-[#779599]/40 text-[#3D2B1F]/70 rounded-xl hover:bg-[#779599]/10 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:'rgba(0,0,0,0.5)'}}>
          <div className="rounded-2xl p-6 w-full max-w-lg" style={{background:'rgba(255,255,255,0.97)', border:'1px solid rgba(255,255,255,0.5)'}}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#3D2B1F]">تعديل المنتج</h2>
              <button onClick={() => setEditingProduct(null)} className="p-1 text-[#3D2B1F]/50 hover:text-[#3D2B1F]">
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <input
                placeholder="اسم المنتج (عربي)"
                value={editingProduct.name_ar}
                onChange={(e) => setEditingProduct(p => p ? {...p, name_ar: e.target.value} : p)}
                className="px-4 py-3 bg-white border border-[#779599]/40 rounded-xl text-[#3D2B1F] placeholder:text-[#3D2B1F]/40 focus:border-[#779599] focus:outline-none"
              />
              <input
                placeholder="Product name (English)"
                value={editingProduct.name}
                onChange={(e) => setEditingProduct(p => p ? {...p, name: e.target.value} : p)}
                className="px-4 py-3 bg-white border border-[#779599]/40 rounded-xl text-[#3D2B1F] placeholder:text-[#3D2B1F]/40 focus:border-[#779599] focus:outline-none"
              />
              <input
                type="number"
                placeholder="السعر"
                value={editingProduct.price || ''}
                onChange={(e) => setEditingProduct(p => p ? {...p, price: Number(e.target.value)} : p)}
                className="px-4 py-3 bg-white border border-[#779599]/40 rounded-xl text-[#3D2B1F] placeholder:text-[#3D2B1F]/40 focus:border-[#779599] focus:outline-none"
              />
              <select
                value={editingProduct.category}
                onChange={(e) => setEditingProduct(p => p ? {...p, category: e.target.value as 'occasions'|'boxes', category_id: null} : p)}
                className="px-4 py-3 bg-white border border-[#779599]/40 rounded-xl text-[#3D2B1F] focus:border-[#779599] focus:outline-none"
              >
                <option value="occasions">مناسبات</option>
                <option value="boxes">بوكسات</option>
              </select>
              <select
                value={editingProduct.category_id || ''}
                onChange={(e) => setEditingProduct(p => p ? {...p, category_id: e.target.value || null} : p)}
                className="px-4 py-3 bg-white border border-[#779599]/40 rounded-xl text-[#3D2B1F] focus:border-[#779599] focus:outline-none"
              >
                <option value="">— بدون قسم فرعي —</option>
                {categories.filter(c => c.parent_id === categories.find(m => m.parent_id === null && m.name === editingProduct.category)?.id).map(sub => (
                  <option key={sub.id} value={sub.id}>{sub.name_ar}</option>
                ))}
              </select>
              <textarea
                placeholder="المكونات / الوصف (اختياري)"
                value={editingProduct.description || ''}
                onChange={(e) => setEditingProduct(p => p ? {...p, description: e.target.value} : p)}
                rows={2}
                className="px-4 py-3 bg-white border border-[#779599]/40 rounded-xl text-[#3D2B1F] placeholder:text-[#3D2B1F]/40 focus:border-[#779599] focus:outline-none resize-none"
              />
              <label className="px-4 py-3 bg-white border border-[#779599]/40 rounded-xl cursor-pointer hover:border-[#779599] flex items-center gap-2 text-[#3D2B1F]">
                <Upload size={18} />
                {editingProduct.image_url ? 'تغيير الصورة ✓' : 'رفع صورة'}
                <input type="file" accept="image/*" onChange={async (e) => {
                  const url = await handleImageUpload(e)
                  setEditingProduct(p => p ? {...p, image_url: url ?? p.image_url} : p)
                }} className="hidden" />
              </label>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={async () => { await updateProduct(editingProduct.id, { name: editingProduct.name, name_ar: editingProduct.name_ar, price: editingProduct.price, category: editingProduct.category, category_id: editingProduct.category_id, image_url: editingProduct.image_url, description: editingProduct.description }); setEditingProduct(null) }}
                className="px-6 py-2 bg-gradient-to-r from-[#D4AF37] to-[#C5A55A] text-[#3D2B1F] rounded-xl font-bold hover:opacity-90 transition-opacity"
              >
                حفظ التعديلات
              </button>
              <button onClick={() => setEditingProduct(null)} className="px-6 py-2 border border-[#779599]/40 text-[#3D2B1F]/70 rounded-xl hover:bg-[#779599]/10">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
