'use client'

import { useState, useEffect } from 'react'
import { Product } from '@/lib/supabase'
import { Plus, Trash2, Eye, EyeOff, LogIn, Upload, GripVertical, Pencil, X } from 'lucide-react'
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
  const [newProduct, setNewProduct] = useState({
    name: '',
    name_ar: '',
    price: 0,
    category: 'occasions' as 'occasions' | 'boxes',
    image_url: '',
    description: '',
    is_active: true,
    sort_order: 0,
  })

  useEffect(() => {
    fetch('/api/auth/check').then(res => {
      if (res.ok) {
        setIsAuth(true)
        fetchProducts()
        fetchSettings()
      }
    })
  }, [])

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
      setNewProduct({ name: '', name_ar: '', price: 0, category: 'occasions', image_url: '', description: '', is_active: true, sort_order: 0 })
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
        <div className="rounded-2xl p-6 mb-6" style={{background:'rgba(255,255,255,0.88)', backdropFilter:'blur(12px)', border:'1px solid rgba(255,255,255,0.5)'}}>
          <h2 className="text-lg font-bold text-[#3D2B1F] mb-4">⚙️ إعدادات التواصل</h2>
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

        {/* Products Table */}
        {(['occasions', 'boxes'] as const).map(cat => {
          const catProducts = products.filter(p => p.category === cat)
          return (
          <div key={cat} className="rounded-2xl overflow-hidden mb-4" style={{background:'rgba(255,255,255,0.88)', backdropFilter:'blur(12px)', border:'1px solid rgba(255,255,255,0.5)'}}>
            <div className="flex items-center justify-between p-4 bg-[#779599]/20 border-b border-[#779599]/20">
              <span className="text-[#3D2B1F] font-bold text-sm">{cat === 'occasions' ? '🎉 مناسبات' : '📦 بوكسات'} ({catProducts.length})</span>
              <button
                onClick={() => { setShowForm(cat); setNewProduct(p => ({...p, category: cat})) }}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#D4AF37] text-[#3D2B1F] rounded-lg text-xs font-bold hover:opacity-90 transition-opacity"
              >
                <Plus size={14} /> إضافة
              </button>
            </div>

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

            <div className="grid grid-cols-[1fr_100px_100px_120px_80px] gap-4 px-4 py-2 bg-[#779599]/10 text-[#3D2B1F]/60 text-xs border-b border-[#779599]/10">
              <span>المنتج</span><span>السعر</span><span>الترتيب</span><span>الحالة</span><span></span>
            </div>

          {catProducts.map((product, index) => (
            <div
              key={product.id}
              draggable
              onDragStart={() => handleDragStart(index, cat)}
              onDragOver={(e) => handleDragOver(e, index, cat)}
              onDragEnd={() => handleDragEnd(cat)}
              className={`grid grid-cols-[1fr_100px_100px_120px_80px] gap-4 p-4 items-center border-b border-[#779599]/15 transition-colors cursor-grab active:cursor-grabbing ${
                dragIndex === index && dragCategory === cat ? 'bg-[#779599]/20 opacity-50' : 'hover:bg-[#779599]/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <GripVertical size={16} className="text-[#3D2B1F]/30" />
                <div>
                  <p className="text-[#3D2B1F] font-medium">{product.name_ar}</p>
                  <p className="text-[#3D2B1F]/50 text-sm">{product.name}</p>
                </div>
              </div>
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
              <span className="text-[#3D2B1F]/60">{product.sort_order}</span>
              <button
                onClick={() => toggleActive(product)}
                className={`flex items-center gap-1 text-sm px-3 py-1 rounded-lg transition-colors ${
                  product.is_active
                    ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                    : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
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
                onChange={(e) => setEditingProduct(p => p ? {...p, category: e.target.value as 'occasions'|'boxes'} : p)}
                className="px-4 py-3 bg-white border border-[#779599]/40 rounded-xl text-[#3D2B1F] focus:border-[#779599] focus:outline-none"
              >
                <option value="occasions">مناسبات</option>
                <option value="boxes">بوكسات</option>
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
                onClick={async () => { await updateProduct(editingProduct.id, { name: editingProduct.name, name_ar: editingProduct.name_ar, price: editingProduct.price, category: editingProduct.category, image_url: editingProduct.image_url, description: editingProduct.description }); setEditingProduct(null) }}
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
