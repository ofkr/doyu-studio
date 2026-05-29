'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../supabase'
import { LoginModal } from '../LoginModal'

const ADMIN_EMAIL = 'doyu.works@gmail.com'

interface WorkItem {
  id: string
  category: string
  title: string
  custom_available: boolean
  description: string
  image: string
  images: string[]
  detail_images: string[]
  video_url?: string
  is_published: boolean
}

interface ShopItem {
  id: string
  title: string
  category: string
  price: string
  period: string
  material: string
  description: string[]
  image: string
  images: string[]
  detail_images: string[]
  video_url?: string
  is_published: boolean
}

type Tab = 'WORK' | 'SHOP'

const workCategories = ['Graphic Design', 'Wedding Snap', 'Wedding Film']
const shopCategories = ['Paper', 'Objects', 'Photo & Film']

const getYtThumb = (url: string): string | null => {
  const w = url.match(/youtube\.com\/watch\?v=([^&]+)/)
  if (w) return `https://img.youtube.com/vi/${w[1]}/hqdefault.jpg`
  const s = url.match(/youtu\.be\/([^?]+)/)
  if (s) return `https://img.youtube.com/vi/${s[1]}/hqdefault.jpg`
  return null
}

const emptyWork: Partial<WorkItem> = { category: 'Graphic Design', title: '', custom_available: true, description: '', image: '', images: [], detail_images: [], video_url: '', is_published: false }
const emptyShop: Partial<ShopItem> = { title: '', category: 'Paper', price: '', period: '', material: '', description: [], image: '', images: [], detail_images: [], video_url: '', is_published: false }

export default function AdminPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [showLogin, setShowLogin] = useState(false)
  const [tab, setTab] = useState<Tab>('WORK')

  const [works, setWorks] = useState<WorkItem[]>([])
  const [workForm, setWorkForm] = useState<Partial<WorkItem>>(emptyWork)
  const [workMode, setWorkMode] = useState<'list' | 'add' | 'edit'>('list')
  const [editWorkId, setEditWorkId] = useState<number | null>(null)

  const [shops, setShops] = useState<ShopItem[]>([])
  const [shopForm, setShopForm] = useState<Partial<ShopItem>>(emptyShop)
  const [shopMode, setShopMode] = useState<'list' | 'add' | 'edit'>('list')
  const [editShopId, setEditShopId] = useState<number | null>(null)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [workUploading, setWorkUploading] = useState(false)
  const [shopUploading, setShopUploading] = useState(false)
  const [workIframeKey, setWorkIframeKey] = useState(0)
  const [shopIframeKey, setShopIframeKey] = useState(0)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setAuthLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (user?.email === ADMIN_EMAIL) {
      fetchWorks()
      fetchShops()
    }
  }, [user])

  const uploadFiles = async (
    files: FileList,
    onUploaded: (urls: string[]) => void,
    setUploading: (v: boolean) => void
  ) => {
    setUploading(true)
    const urls: string[] = []
    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop()
      const path = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
      const { error: uploadError } = await supabase.storage.from('images').upload(path, file)
      if (!uploadError) {
        const { data } = supabase.storage.from('images').getPublicUrl(path)
        urls.push(data.publicUrl)
      }
    }
    onUploaded(urls)
    setUploading(false)
  }

  const fetchWorks = async () => {
    const { data } = await supabase.from('works').select('*').order('id')
    if (data) setWorks(data)
  }

  const normalizeDescription = (desc: unknown): string[] => {
    if (Array.isArray(desc)) return desc
    if (typeof desc === 'string' && desc) {
      try { const parsed = JSON.parse(desc); if (Array.isArray(parsed)) return parsed } catch {}
      return desc.split('\n')
    }
    return []
  }

  const fetchShops = async () => {
    const { data } = await supabase.from('shops').select('*').order('id')
    if (data) setShops(data.map((item) => ({ ...item, description: normalizeDescription(item.description) })))
  }

  const saveWorkWithStatus = async (isPublished: boolean) => {
    setSaving(true)
    setError('')
    const isGraphic = workForm.category === 'Graphic Design'
    const payload = {
      category: workForm.category,
      title: workForm.title,
      custom_available: isGraphic ? (workForm.custom_available ?? true) : false,
      description: workForm.description || '',
      image: workForm.image || '',
      images: workForm.images || [],
      detail_images: workForm.detail_images || [],
      video_url: workForm.video_url || '',
      is_published: isPublished,
    }
    if (workMode === 'add') {
      const { data, error: err } = await supabase.from('works').insert(payload).select().single()
      if (err) { setError(err.message); setSaving(false); return }
      await fetchWorks()
      setEditWorkId(data.id)
      setWorkMode('edit')
      setWorkIframeKey((k) => k + 1)
    } else if (workMode === 'edit' && editWorkId !== null) {
      const { error: err } = await supabase.from('works').update(payload).eq('id', editWorkId)
      if (err) { setError(err.message); setSaving(false); return }
      sessionStorage.removeItem(`preview_work_${editWorkId}`)
      await fetchWorks()
      setWorkIframeKey((k) => k + 1)
    }
    setSaving(false)
  }

  const deleteWork = async (id: number) => {
    if (!confirm('삭제하시겠습니까?')) return
    await supabase.from('works').delete().eq('id', id)
    fetchWorks()
  }

  const startEditWork = (item: WorkItem) => {
    setWorkForm({ ...item })
    setEditWorkId(item.id)
    setWorkMode('edit')
  }

  const saveShopWithStatus = async (isPublished: boolean) => {
    setSaving(true)
    setError('')
    const payload = {
      title: shopForm.title,
      category: shopForm.category,
      price: shopForm.price || '',
      period: shopForm.period || '',
      material: shopForm.material || '',
      description: (Array.isArray(shopForm.description) ? shopForm.description : []).map((s) => s.trim()).filter(Boolean),
      image: shopForm.image || '',
      images: shopForm.images || [],
      detail_images: shopForm.detail_images || [],
      video_url: shopForm.video_url || '',
      is_published: isPublished,
    }
    if (shopMode === 'add') {
      const { data, error: err } = await supabase.from('shops').insert(payload).select().single()
      if (err) { setError(err.message); setSaving(false); return }
      await fetchShops()
      setEditShopId(data.id)
      setShopMode('edit')
      setShopIframeKey((k) => k + 1)
    } else if (shopMode === 'edit' && editShopId !== null) {
      const { error: err } = await supabase.from('shops').update(payload).eq('id', editShopId)
      if (err) { setError(err.message); setSaving(false); return }
      sessionStorage.removeItem(`preview_shop_${editShopId}`)
      await fetchShops()
      setShopIframeKey((k) => k + 1)
    }
    setSaving(false)
  }

  const deleteShop = async (id: number) => {
    if (!confirm('삭제하시겠습니까?')) return
    await supabase.from('shops').delete().eq('id', id)
    fetchShops()
  }

  const startEditShop = (item: ShopItem) => {
    setShopForm({ ...item, description: normalizeDescription(item.description) })
    setEditShopId(item.id)
    setShopMode('edit')
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-sm text-gray-400">로딩 중...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4">
        <p className="text-sm text-gray-600">관리자 계정으로 로그인이 필요합니다.</p>
        <button
          onClick={() => setShowLogin(true)}
          className="px-6 py-2 bg-[#2d4a1e] text-white text-sm rounded-lg hover:bg-[#3a5e27] transition-colors"
        >
          로그인
        </button>
        {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      </div>
    )
  }

  if (user.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4">
        <p className="text-sm text-gray-600">접근 권한이 없습니다.</p>
        <button
          onClick={() => { supabase.auth.signOut(); router.push('/') }}
          className="px-6 py-2 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200 transition-colors"
        >
          홈으로
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#2d4a1e] text-white px-8 py-4 flex justify-between items-center">
        <button onClick={() => router.push('/')} className="font-bold tracking-widest text-sm">DOYU STUDIO</button>
        <nav className="hidden md:flex items-center gap-6">
          {[['WORK', '/work'], ['SHOP', '/shop'], ['ABOUT', '/about']].map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="text-xs text-white/70 hover:text-white transition-colors"
              onClick={(e) => {
                const isUnsaved = (workMode === 'add' || workMode === 'edit') || (shopMode === 'add' || shopMode === 'edit')
                if (isUnsaved) {
                  e.preventDefault()
                  if (confirm('관리자 페이지에서 나가시겠습니까? 저장하지 않은 내용은 사라집니다.')) router.push(href)
                }
              }}
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <span className="text-xs text-white/50 hidden sm:inline">{user.email}</span>
          <button
            onClick={() => { supabase.auth.signOut(); router.push('/') }}
            className="text-xs text-white/70 hover:text-white transition-colors"
          >
            로그아웃
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex gap-0 border-b border-gray-200 mb-8">
          {(['WORK', 'SHOP'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => {
                if (t === tab) {
                  const isUnsaved =
                    (t === 'WORK' && (workMode === 'add' || workMode === 'edit')) ||
                    (t === 'SHOP' && (shopMode === 'add' || shopMode === 'edit'))
                  if (!isUnsaved) return
                  if (!confirm('저장하지 않은 내용이 있습니다. 저장하지 않고 나가시겠습니까?')) return
                  if (t === 'WORK') { setWorkMode('list'); setWorkForm(emptyWork); setEditWorkId(null) }
                  if (t === 'SHOP') { setShopMode('list'); setShopForm(emptyShop); setEditShopId(null) }
                  setError('')
                } else {
                  const hasUnsaved =
                    (tab === 'WORK' && (workMode === 'add' || workMode === 'edit')) ||
                    (tab === 'SHOP' && (shopMode === 'add' || shopMode === 'edit'))
                  if (hasUnsaved && !confirm('저장하지 않은 내용이 있습니다. 저장하지 않고 나가시겠습니까?')) return
                  if (tab === 'WORK') { setWorkMode('list'); setWorkForm(emptyWork); setEditWorkId(null) }
                  if (tab === 'SHOP') { setShopMode('list'); setShopForm(emptyShop); setEditShopId(null) }
                  setError('')
                  setTab(t)
                }
              }}
              className={`px-8 py-3 text-sm font-bold transition-colors border-b-2 -mb-[2px] ${
                tab === t ? 'border-[#2d4a1e] text-[#2d4a1e]' : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        {/* WORK TAB */}
        {tab === 'WORK' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">작업물 관리</h2>
              {workMode === 'list' && (
                <button
                  onClick={() => { setWorkForm(emptyWork); setWorkMode('add'); setError('') }}
                  className="px-4 py-2 bg-[#2d4a1e] text-white text-sm rounded-lg hover:bg-[#3a5e27] transition-colors"
                >
                  + 추가
                </button>
              )}
            </div>

            {(workMode === 'add' || workMode === 'edit') && (
              <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                <h3 className="text-sm font-bold text-gray-700 mb-5">
                  {workMode === 'add' ? '새 작업물 추가' : '작업물 수정'}
                </h3>
                <div className="flex gap-8 items-start">
                  {/* 왼쪽: 입력 폼 */}
                  <div className="flex-1 min-w-0 flex flex-col gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">카테고리</label>
                      <select
                        value={workForm.category}
                        onChange={(e) => setWorkForm({ ...workForm, category: e.target.value })}
                        className="w-full h-[42px] border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#2d4a1e]"
                      >
                        {workCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">제목</label>
                      <input
                        type="text"
                        value={workForm.title || ''}
                        onChange={(e) => setWorkForm({ ...workForm, title: e.target.value })}
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#2d4a1e]"
                        placeholder="작업물 제목"
                      />
                    </div>
                    {workForm.category === 'Graphic Design' && (
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="work-custom_available"
                          checked={workForm.custom_available ?? true}
                          onChange={(e) => setWorkForm({ ...workForm, custom_available: e.target.checked })}
                          className="w-4 h-4 accent-[#2d4a1e]"
                        />
                        <label htmlFor="work-custom_available" className="text-sm text-gray-700">커스텀 가능</label>
                      </div>
                    )}
                    {workForm.category === 'Wedding Film' && (
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">유튜브 영상 URL</label>
                        <input
                          type="text"
                          value={workForm.video_url || ''}
                          onChange={(e) => setWorkForm({ ...workForm, video_url: e.target.value })}
                          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#2d4a1e]"
                          placeholder="https://www.youtube.com/watch?v=..."
                        />
                      </div>
                    )}
                    {(workForm.category === 'Graphic Design' || workForm.category === 'Wedding Snap') && (
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">대표 이미지 (목록 썸네일)</label>
                        <div className="flex flex-col items-start gap-3">
                          <label className={`inline-flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 rounded-lg cursor-pointer hover:border-[#2d4a1e] transition-colors ${workUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                            <span>{workUploading ? '업로드 중...' : '파일 선택'}</span>
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => { if (!e.target.files?.length) return; uploadFiles(e.target.files, (urls) => setWorkForm((prev) => ({ ...prev, image: urls[0] || prev.image })), setWorkUploading); e.target.value = '' }} />
                          </label>
                          {workForm.image && (
                            <div className="relative inline-block group">
                              <img src={workForm.image} alt="" className="w-[200px] h-auto rounded border border-gray-200 block" />
                              <button type="button" onClick={() => setWorkForm((prev) => ({ ...prev, image: '' }))} className="absolute top-1 right-1 w-5 h-5 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {(workForm.category === 'Graphic Design' || workForm.category === 'Wedding Snap') && (
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">슬라이더 이미지 (상세페이지 상단 스와이프, 여러 장 가능)</label>
                        <div className="flex flex-col items-start gap-3">
                          <label className={`inline-flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 rounded-lg cursor-pointer hover:border-[#2d4a1e] transition-colors ${workUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                            <span>{workUploading ? '업로드 중...' : '파일 선택 (여러 장 가능)'}</span>
                            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { if (!e.target.files?.length) return; uploadFiles(e.target.files, (urls) => setWorkForm((prev) => ({ ...prev, images: [...(prev.images || []), ...urls] })), setWorkUploading); e.target.value = '' }} />
                          </label>
                          {(workForm.images || []).length > 0 && (
                            <div className="flex flex-wrap gap-3">
                              {(workForm.images || []).map((url, i) => (
                                <div key={i} className="relative inline-block group">
                                  <img src={url} alt="" className="w-[200px] h-auto rounded border border-gray-200 block" />
                                  <button type="button" onClick={() => setWorkForm((prev) => ({ ...prev, images: (prev.images || []).filter((_, j) => j !== i) }))} className="absolute top-1 right-1 w-5 h-5 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">상세 설명 이미지 (상세페이지 하단 세로 나열, 여러 장 가능)</label>
                      <div className="flex flex-col items-start gap-3">
                        <label className={`inline-flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 rounded-lg cursor-pointer hover:border-[#2d4a1e] transition-colors ${workUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                          <span>{workUploading ? '업로드 중...' : '파일 선택 (여러 장 가능)'}</span>
                          <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { if (!e.target.files?.length) return; uploadFiles(e.target.files, (urls) => setWorkForm((prev) => ({ ...prev, detail_images: [...(prev.detail_images || []), ...urls] })), setWorkUploading); e.target.value = '' }} />
                        </label>
                        {(workForm.detail_images || []).length > 0 && (
                          <div className="flex flex-wrap gap-3">
                            {(workForm.detail_images || []).map((url, i) => (
                              <div key={i} className="relative inline-block group">
                                <img src={url} alt="" className="w-[200px] h-auto rounded border border-gray-200 block" />
                                <button type="button" onClick={() => setWorkForm((prev) => ({ ...prev, detail_images: (prev.detail_images || []).filter((_, j) => j !== i) }))} className="absolute top-1 right-1 w-5 h-5 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">설명</label>
                      <textarea
                        value={workForm.description || ''}
                        onChange={(e) => setWorkForm({ ...workForm, description: e.target.value })}
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#2d4a1e] resize-none"
                        rows={3}
                        placeholder="작업물 설명"
                      />
                    </div>
                  </div>

                  {/* 오른쪽: iframe 미리보기 */}
                  <div className="w-[44%] shrink-0 sticky top-[80px] self-start">
                    <p className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase mb-2">실제 페이지 미리보기</p>
                    {workMode === 'edit' && editWorkId ? (
                      <iframe
                        key={workIframeKey}
                        src={`/work/${editWorkId}?admin_preview=1`}
                        className="w-full rounded-xl border border-gray-200"
                        style={{ height: 'calc(100vh - 160px)' }}
                      />
                    ) : (
                      <div className="w-full rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center text-sm text-gray-400" style={{ height: 'calc(100vh - 160px)' }}>
                        저장 후 미리보기 가능합니다
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => saveWorkWithStatus(false)} disabled={saving} className="px-6 py-2 border border-[#2d4a1e] text-[#2d4a1e] text-sm rounded-lg hover:bg-[#e8f0e0] transition-colors disabled:opacity-50">
                    {saving ? '저장 중...' : '미리보기(임시저장)'}
                  </button>
                  <button onClick={() => saveWorkWithStatus(true)} disabled={saving} className="px-6 py-2 bg-[#2d4a1e] text-white text-sm rounded-lg hover:bg-[#3a5e27] transition-colors disabled:opacity-50">
                    {saving ? '저장 중...' : '저장(게시)'}
                  </button>
                  <button onClick={() => { setWorkMode('list'); setWorkForm(emptyWork); setEditWorkId(null); setError('') }} className="px-6 py-2 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200 transition-colors">
                    취소
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {works.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-12">작업물이 없습니다.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">ID</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">카테고리</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">제목</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">커스텀</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {works.map((item) => (
                      <tr key={item.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-400 text-xs">{item.id}</td>
                        <td className="px-4 py-3 text-gray-600">{item.category}</td>
                        <td className="px-4 py-3 font-medium text-gray-800">
                          {item.title}
                          {!item.is_published && (
                            <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-yellow-100 text-yellow-600 rounded font-medium">임시</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${item.custom_available ? 'bg-[#e8f0e0] text-[#2d4a1e]' : 'bg-gray-100 text-gray-400'}`}>
                            {item.custom_available ? '가능' : '불가'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => startEditWork(item)} className="text-xs text-[#2d4a1e] hover:underline mr-3">수정</button>
                          <button onClick={() => deleteWork(item.id)} className="text-xs text-red-400 hover:underline">삭제</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* SHOP TAB */}
        {tab === 'SHOP' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">상품 관리</h2>
              {shopMode === 'list' && (
                <button
                  onClick={() => { setShopForm(emptyShop); setShopMode('add'); setError('') }}
                  className="px-4 py-2 bg-[#2d4a1e] text-white text-sm rounded-lg hover:bg-[#3a5e27] transition-colors"
                >
                  + 추가
                </button>
              )}
            </div>

            {(shopMode === 'add' || shopMode === 'edit') && (
              <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                <h3 className="text-sm font-bold text-gray-700 mb-5">
                  {shopMode === 'add' ? '새 상품 추가' : '상품 수정'}
                </h3>
                <div className="flex gap-8 items-start">
                  {/* 왼쪽: 입력 폼 */}
                  <div className="flex-1 min-w-0 flex flex-col gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">카테고리</label>
                      <select
                        value={shopForm.category}
                        onChange={(e) => setShopForm({ ...shopForm, category: e.target.value })}
                        className="w-full h-[42px] border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#2d4a1e]"
                      >
                        {shopCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">상품명</label>
                        <input type="text" value={shopForm.title || ''} onChange={(e) => setShopForm({ ...shopForm, title: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#2d4a1e]" placeholder="상품명" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">가격</label>
                        <input type="text" value={shopForm.price || ''} onChange={(e) => setShopForm({ ...shopForm, price: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#2d4a1e]" placeholder="예: 50,000원~" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">재료 / 소재</label>
                        <input type="text" value={shopForm.material || ''} onChange={(e) => setShopForm({ ...shopForm, material: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#2d4a1e]" placeholder="예: 고급 아트지, 에폭시" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">기간</label>
                        <input type="text" value={shopForm.period || ''} onChange={(e) => setShopForm({ ...shopForm, period: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#2d4a1e]" placeholder="예: 3~5일" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">상세정보 (Enter로 항목 구분)</label>
                      <textarea
                        value={(Array.isArray(shopForm.description) ? shopForm.description : []).join('\n')}
                        onChange={(e) => setShopForm({ ...shopForm, description: e.target.value.split('\n') })}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#2d4a1e] resize-none"
                        rows={4}
                        placeholder={'항목1\n항목2\n항목3'}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">유튜브 영상 URL (선택)</label>
                      <input type="text" value={shopForm.video_url || ''} onChange={(e) => setShopForm({ ...shopForm, video_url: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#2d4a1e]" placeholder="https://www.youtube.com/watch?v=..." />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">대표 이미지 업로드</label>
                      <div className="flex flex-col items-start gap-3">
                        <label className={`inline-flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 rounded-lg cursor-pointer hover:border-[#2d4a1e] transition-colors ${shopUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                          <span>{shopUploading ? '업로드 중...' : '파일 선택'}</span>
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => { if (!e.target.files?.length) return; uploadFiles(e.target.files, (urls) => setShopForm((prev) => ({ ...prev, image: urls[0] || prev.image })), setShopUploading); e.target.value = '' }} />
                        </label>
                        {shopForm.image && (
                          <div className="relative inline-block group">
                            <img src={shopForm.image} alt="" className="w-[200px] h-auto rounded border border-gray-200 block" />
                            <button type="button" onClick={() => setShopForm((prev) => ({ ...prev, image: '' }))} className="absolute top-1 right-1 w-5 h-5 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">슬라이더 이미지 (제품 사진, 여러 장 가능)</label>
                      <div className="flex flex-col items-start gap-3">
                        <label className={`inline-flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 rounded-lg cursor-pointer hover:border-[#2d4a1e] transition-colors ${shopUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                          <span>{shopUploading ? '업로드 중...' : '파일 선택 (여러 장 가능)'}</span>
                          <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { if (!e.target.files?.length) return; uploadFiles(e.target.files, (urls) => setShopForm((prev) => ({ ...prev, images: [...(prev.images || []), ...urls] })), setShopUploading); e.target.value = '' }} />
                        </label>
                        {(shopForm.images || []).length > 0 && (
                          <div className="flex flex-wrap gap-3">
                            {(shopForm.images || []).map((url, i) => (
                              <div key={i} className="relative inline-block group">
                                <img src={url} alt="" className="w-[200px] h-auto rounded border border-gray-200 block" />
                                <button type="button" onClick={() => setShopForm((prev) => ({ ...prev, images: (prev.images || []).filter((_, j) => j !== i) }))} className="absolute top-1 right-1 w-5 h-5 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">상세 설명 이미지 (여러 장 가능)</label>
                      <div className="flex flex-col items-start gap-3">
                        <label className={`inline-flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 rounded-lg cursor-pointer hover:border-[#2d4a1e] transition-colors ${shopUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                          <span>{shopUploading ? '업로드 중...' : '파일 선택 (여러 장 가능)'}</span>
                          <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { if (!e.target.files?.length) return; uploadFiles(e.target.files, (urls) => setShopForm((prev) => ({ ...prev, detail_images: [...(prev.detail_images || []), ...urls] })), setShopUploading); e.target.value = '' }} />
                        </label>
                        {(shopForm.detail_images || []).length > 0 && (
                          <div className="flex flex-wrap gap-3">
                            {(shopForm.detail_images || []).map((url, i) => (
                              <div key={i} className="relative inline-block group">
                                <img src={url} alt="" className="w-[200px] h-auto rounded border border-gray-200 block" />
                                <button type="button" onClick={() => setShopForm((prev) => ({ ...prev, detail_images: (prev.detail_images || []).filter((_, j) => j !== i) }))} className="absolute top-1 right-1 w-5 h-5 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 오른쪽: iframe 미리보기 */}
                  <div className="w-[44%] shrink-0 sticky top-[80px] self-start">
                    <p className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase mb-2">실제 페이지 미리보기</p>
                    {shopMode === 'edit' && editShopId ? (
                      <iframe
                        key={shopIframeKey}
                        src={`/shop/${editShopId}?admin_preview=1`}
                        className="w-full rounded-xl border border-gray-200"
                        style={{ height: 'calc(100vh - 160px)' }}
                      />
                    ) : (
                      <div className="w-full rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center text-sm text-gray-400" style={{ height: 'calc(100vh - 160px)' }}>
                        저장 후 미리보기 가능합니다
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => saveShopWithStatus(false)} disabled={saving} className="px-6 py-2 border border-[#2d4a1e] text-[#2d4a1e] text-sm rounded-lg hover:bg-[#e8f0e0] transition-colors disabled:opacity-50">
                    {saving ? '저장 중...' : '미리보기(임시저장)'}
                  </button>
                  <button onClick={() => saveShopWithStatus(true)} disabled={saving} className="px-6 py-2 bg-[#2d4a1e] text-white text-sm rounded-lg hover:bg-[#3a5e27] transition-colors disabled:opacity-50">
                    {saving ? '저장 중...' : '저장(게시)'}
                  </button>
                  <button onClick={() => { setShopMode('list'); setShopForm(emptyShop); setEditShopId(null); setError('') }} className="px-6 py-2 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200 transition-colors">
                    취소
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {shops.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-12">상품이 없습니다.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">ID</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">카테고리</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">상품명</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">기간</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">가격</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shops.map((item) => (
                      <tr key={item.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-400 text-xs">{item.id}</td>
                        <td className="px-4 py-3 text-gray-600">{item.category}</td>
                        <td className="px-4 py-3 font-medium text-gray-800">
                          {item.title}
                          {!item.is_published && (
                            <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-yellow-100 text-yellow-600 rounded font-medium">임시</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{item.period}</td>
                        <td className="px-4 py-3 text-[#2d4a1e] text-xs">{item.price}</td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => startEditShop(item)} className="text-xs text-[#2d4a1e] hover:underline mr-3">수정</button>
                          <button onClick={() => deleteShop(item.id)} className="text-xs text-red-400 hover:underline">삭제</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
