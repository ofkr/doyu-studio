'use client'
import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { LoginModal } from '../../LoginModal'
import { supabase } from '../../supabase'

const KAKAO_URL = 'http://pf.kakao.com/_eMixjX'

interface WorkItem {
  id: string
  category: string
  title: string
  custom_available: boolean
  description: string
  images: string[]
  detail_images: string[]
  video_url?: string
  is_published: boolean
}

const parseDescription = (desc: unknown): string[] => {
  if (Array.isArray(desc)) return desc
  if (typeof desc === 'string' && desc) {
    try { const parsed = JSON.parse(desc); if (Array.isArray(parsed)) return parsed } catch {}
    return desc.split('\n').filter(Boolean)
  }
  return []
}

const toEmbedUrl = (url: string): string => {
  const params = 'autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&loop=1'
  const watchMatch = url.match(/youtube\.com\/watch\?v=([^&]+)/)
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}?${params}&playlist=${watchMatch[1]}`
  const shortMatch = url.match(/youtu\.be\/([^?]+)/)
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}?${params}&playlist=${shortMatch[1]}`
  return url
}

const WORK_CAT: Record<string, string> = {
  '그래픽 디자인': 'Graphic Design',
  '웨딩 스냅': 'Wedding Snap',
  '웨딩 영상': 'Wedding Film',
}
const normWorkCat = (c: string) => WORK_CAT[c] ?? c

const navItems = ['WORK', 'SHOP', 'ABOUT']
const navLinks: Record<string, string> = { WORK: '/work', SHOP: '/shop', ABOUT: '/about' }
const navIcons = [
  { href: '/work', src: '/work.svg', alt: 'Work', label: 'Work' },
  { href: '/shop', src: '/shop.svg', alt: 'Shop', label: 'Shop' },
  { href: '/about', src: '/home.svg', alt: 'About', label: 'About' },
]

export default function WorkDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [showLogin, setShowLogin] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [nickname, setNickname] = useState<string>('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [item, setItem] = useState<WorkItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [current, setCurrent] = useState(0)
  const [dragStartX, setDragStartX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const touchStartX = useRef(0)

  const fetchNickname = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('nickname').eq('id', userId).single()
    if (data) setNickname(data.nickname)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchNickname(session.user.id)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchNickname(session.user.id)
      else setNickname('')
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!id) return
    const isPreview = window.location.search.includes('admin_preview=1')
    if (isPreview) {
      const stored = sessionStorage.getItem(`preview_work_${id}`)
      if (stored) {
        try {
          setItem(JSON.parse(stored))
          setLoading(false)
          return
        } catch {}
      }
    }
    supabase
      .from('works')
      .select('id, category, title, custom_available, description, images, detail_images, video_url, is_published')
      .eq('id', id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) console.error('works fetch error:', error.message)
        setItem(data ?? null)
        setLoading(false)
      })
  }, [id])

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setNickname('')
  }

  const allImages = item ? (item.images?.length > 0 ? item.images : []) : []

  const prev = () => setCurrent((c) => (c - 1 + allImages.length) % allImages.length)
  const next = () => setCurrent((c) => (c + 1) % allImages.length)

  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX }
  const onTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev()
  }
  const onMouseDown = (e: React.MouseEvent) => { setDragStartX(e.clientX); setIsDragging(true) }
  const onMouseUp = (e: React.MouseEvent) => {
    if (!isDragging) return
    const diff = dragStartX - e.clientX
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev()
    setIsDragging(false)
  }
  const onMouseLeave = () => { if (isDragging) setIsDragging(false) }

  const normalizeImages = (val: unknown): string[] => {
    if (Array.isArray(val)) return val
    if (typeof val === 'string' && val) {
      try { const p = JSON.parse(val); if (Array.isArray(p)) return p } catch {}
    }
    return []
  }

  return (
    <div className="relative bg-white w-full">

      {/* 상단 네비게이션 */}
      <header className="fixed top-0 left-0 right-0 flex justify-between items-center px-8 py-3 bg-white/90 backdrop-blur-sm z-10">
        <a href="/" className="flex items-center gap-2">
          <Image src="/doyu.svg" alt="DOYU logo" width={24} height={28} style={{ objectFit: 'contain' }} />
          <span className="font-bold tracking-[0.15em] md:tracking-[0.3em] text-sm md:text-lg whitespace-nowrap">D O Y U</span>
        </a>
        <nav className="flex items-center gap-0 md:gap-1">
          {navIcons.map((icon) => (
            <a key={icon.label} href={icon.href} className="flex flex-col items-center justify-center w-12 h-12 md:w-[64px] md:h-[64px] rounded-2xl hover:bg-gray-50 transition-colors">
              <div className="w-5 h-5 md:w-[32px] md:h-[32px] flex items-center justify-center">
                <Image src={icon.src} alt={icon.alt} width={28} height={28} style={{ objectFit: 'contain', width: '100%', height: '100%' }} />
              </div>
              <div className="h-[13px] md:h-[16px] flex items-center justify-center">
                <span className="text-[9px] md:text-[11px] font-bold text-gray-700 tracking-wide">{icon.label}</span>
              </div>
            </a>
          ))}
          {user ? (
            <button onClick={() => router.push('/mypage')} className="flex flex-col items-center justify-center w-12 h-12 md:w-[64px] md:h-[64px] rounded-2xl hover:bg-gray-50 transition-colors">
              <div className="w-5 h-5 md:w-[32px] md:h-[32px] flex items-center justify-center">
                <Image src="/Bullet.svg" alt="profile" width={28} height={28} style={{ objectFit: 'contain', width: '100%', height: '100%' }} />
              </div>
              <div className="h-[13px] md:h-[16px] flex items-center justify-center">
                <span className="text-[9px] md:text-[11px] font-bold text-[#2d4a1e] tracking-wide truncate max-w-[48px] md:max-w-[60px]">{nickname || 'MY'}</span>
              </div>
            </button>
          ) : null}
          <button
            type="button"
            className="w-8 h-8 flex flex-col items-center justify-center gap-1 md:hidden"
            onClick={() => setMenuOpen(prev => !prev)}
          >
            <span className={`block w-5 h-0.5 bg-black transition-all ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
            <span className={`block w-5 h-0.5 bg-black transition-all ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-black transition-all ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
          </button>
        </nav>
      </header>

      {/* 모바일 메뉴 */}
      {menuOpen && (
        <div className="fixed top-[70px] left-0 right-0 bg-white z-[9999] border-b border-gray-100 shadow-md md:hidden">
          <nav className="flex flex-col px-8 py-6 gap-5">
            {navItems.map((navItem) => (
              <a key={navItem} href={navLinks[navItem]} className="text-sm font-medium text-black hover:text-green-700" onClick={() => setMenuOpen(false)}>{navItem}</a>
            ))}
            <a href="https://www.instagram.com/doyu_snap/" className="text-sm text-green-600" onClick={() => setMenuOpen(false)}>Instagram</a>
            <a href={KAKAO_URL} className="text-sm text-yellow-500" target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)}>카카오톡 문의</a>
            {user ? (
              <button onClick={() => { logout(); setMenuOpen(false) }} className="text-sm text-left text-gray-400 hover:text-black transition-colors">로그아웃</button>
            ) : (
              <button onClick={() => { setShowLogin(true); setMenuOpen(false) }} className="text-sm text-left text-black hover:text-green-700 transition-colors">로그인</button>
            )}
          </nav>
        </div>
      )}

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}

      <div className="flex items-start">
        {/* 사이드바 - 데스크탑만 */}
        <aside className="hidden md:flex relative w-[300px] sticky top-0 h-screen p-4 flex-col gap-[120px] bg-white pt-24">
          <nav className="flex flex-col gap-5 mt-16">
            {navItems.map((navItem) => (
              <a key={navItem} href={navLinks[navItem]} className="text-sm text-black hover:text-green-700">{navItem}</a>
            ))}
            <a href="https://www.instagram.com/doyu_snap/" className="text-sm text-green-600 mt-8">Instagram</a>
            <a href={KAKAO_URL} className="text-sm text-yellow-500" target="_blank" rel="noopener noreferrer">카카오톡 문의</a>
            {user ? (
              <button onClick={logout} className="text-sm text-left text-gray-400 hover:text-black transition-colors mt-2">로그아웃</button>
            ) : (
              <button onClick={() => setShowLogin(true)} className="text-sm text-left text-black hover:text-green-700 transition-colors mt-2">로그인</button>
            )}
          </nav>
        </aside>

        {/* 메인 컨텐츠 */}
        <main className="flex flex-col flex-1 px-5 pt-24 w-full">
          <div className="pt-[40px] md:pt-[60px] pb-4">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#2d4a1e] transition-colors">
              ← 목록으로
            </button>
          </div>

          {loading ? (
            <div className="py-40 text-center text-gray-400 text-sm">불러오는 중...</div>
          ) : !item ? (
            <div className="py-40 text-center text-gray-400 text-sm">작업물을 찾을 수 없습니다.</div>
          ) : !item.is_published ? (
            <div className="py-40 text-center text-gray-400 text-sm">준비 중인 페이지입니다.</div>
          ) : (
            <>
              {item.video_url ? (
                /* ── 영상 모드: 1컬럼 풀너비 레이아웃 ── */
                <section className="py-8">
                  {/* 유튜브 영상 */}
                  <div className="w-full aspect-video bg-black mb-8">
                    <iframe
                      src={toEmbedUrl(item.video_url)}
                      title={item.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                      style={{ border: 'none', display: 'block' }}
                    />
                  </div>

                  {/* 정보 영역 */}
                  <div className="flex flex-col gap-0">
                    <p className="text-xs text-gray-400 mb-4">
                      <a href="/" className="hover:text-[#2d4a1e]">Home</a>
                      <span className="mx-1.5">›</span>
                      <a href="/work" className="hover:text-[#2d4a1e]">Work</a>
                      <span className="mx-1.5">›</span>
                      <span>{normWorkCat(item.category)}</span>
                    </p>
                    <h1 className="text-2xl md:text-4xl font-black text-[#2d4a1e] mb-5">{item.title}</h1>
                    <div className="w-full h-px bg-gray-100 mb-5" />
                    {item.description && (
                      <>
                        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap mb-5">{item.description}</p>
                        <div className="w-full h-px bg-gray-100 mb-5" />
                      </>
                    )}
                    <a
                      href={KAKAO_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center py-4 bg-[#2d4a1e] text-white text-sm font-medium hover:bg-[#3a5e27] transition-colors"
                    >
                      카카오톡 문의하기
                    </a>
                  </div>
                </section>
              ) : (
                /* ── 이미지 모드: 2컬럼 레이아웃 ── */
                <section className="py-8">
                  <div className="flex flex-col md:flex-row gap-10 md:gap-12">

                    {/* 왼쪽: 이미지 갤러리 (sticky) */}
                    <div className="w-full md:w-[55%] shrink-0 md:sticky md:top-[80px] md:self-start">
                      <div
                        className="relative w-full aspect-square bg-gray-100 overflow-hidden select-none cursor-grab active:cursor-grabbing"
                        onTouchStart={onTouchStart}
                        onTouchEnd={onTouchEnd}
                        onMouseDown={onMouseDown}
                        onMouseUp={onMouseUp}
                        onMouseLeave={onMouseLeave}
                      >
                        {allImages[current] ? (
                          <Image src={allImages[current]} alt={item.title} fill className="object-contain" />
                        ) : (
                          <div className="w-full h-full bg-gray-100" />
                        )}
                        {allImages.length > 1 && (
                          <>
                            <button onClick={prev} aria-label="이전" className="absolute left-3 top-1/2 -translate-y-1/2 z-10 opacity-30 hover:opacity-70 transition-opacity">
                              <svg width="20" height="36" viewBox="0 0 20 36" fill="none">
                                <path d="M16 4L4 18L16 32" stroke="#111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                            <button onClick={next} aria-label="다음" className="absolute right-3 top-1/2 -translate-y-1/2 z-10 opacity-30 hover:opacity-70 transition-opacity">
                              <svg width="20" height="36" viewBox="0 0 20 36" fill="none">
                                <path d="M4 4L16 18L4 32" stroke="#111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 z-10">
                              {allImages.map((_, i) => (
                                <button
                                  key={i}
                                  onClick={() => setCurrent(i)}
                                  aria-label={`${i + 1}번 이미지`}
                                  className={`w-1.5 h-1.5 rounded-full transition-all ${i === current ? 'bg-[#2d4a1e] scale-125' : 'bg-gray-300'}`}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                      {allImages.length > 1 && (
                        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                          {allImages.map((src, i) => (
                            <button
                              key={i}
                              onClick={() => setCurrent(i)}
                              className={`relative w-20 h-20 shrink-0 bg-gray-100 overflow-hidden border-2 transition-colors ${i === current ? 'border-[#2d4a1e]' : 'border-transparent hover:border-gray-300'}`}
                            >
                              <Image src={src} alt={`썸네일 ${i + 1}`} fill className="object-cover" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 오른쪽: 작업물 정보 */}
                    <div className="flex flex-col md:w-[45%] gap-0">
                      <p className="text-xs text-gray-400 mb-4">
                        <a href="/" className="hover:text-[#2d4a1e]">Home</a>
                        <span className="mx-1.5">›</span>
                        <a href="/work" className="hover:text-[#2d4a1e]">Work</a>
                        <span className="mx-1.5">›</span>
                        <span>{normWorkCat(item.category)}</span>
                      </p>
                      <h1 className="text-2xl md:text-3xl font-black text-[#2d4a1e] mb-4">{item.title}</h1>
                      <span
                        className={`inline-block self-start px-3 py-1 rounded-full text-xs font-medium mb-5 ${
                          item.custom_available ? 'bg-[#e8f0e0] text-[#2d4a1e]' : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {item.custom_available ? '커스텀 가능' : '커스텀 불가'}
                      </span>
                      <div className="w-full h-px bg-gray-100 mb-5" />
                      {item.description && (
                        <>
                          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap mb-5">{item.description}</p>
                          <div className="w-full h-px bg-gray-100 mb-5" />
                        </>
                      )}
                      <a
                        href={KAKAO_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center py-4 bg-[#2d4a1e] text-white text-sm font-medium hover:bg-[#3a5e27] transition-colors"
                      >
                        카카오톡 문의하기
                      </a>
                    </div>
                  </div>
                </section>
              )}

              {/* 하단 상세정보 이미지 */}
              {normalizeImages(item.detail_images).length > 0 && (
                <section className="mt-10 border-t border-gray-200">
                  <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase py-8">상세정보</p>
                  <div className="flex flex-col gap-1">
                    {normalizeImages(item.detail_images).map((src, i) => (
                      <div key={i} className="w-full">
                        <Image
                          src={src}
                          alt={`상세 이미지 ${i + 1}`}
                          width={0}
                          height={0}
                          sizes="100vw"
                          style={{ width: '100%', height: 'auto', display: 'block' }}
                        />
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}

          <footer className="border-t border-gray-200 pt-[120px]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div>
                <p className="text-sm font-bold text-[#2d4a1e] mb-3">DOYU STUDIO</p>
                <p className="text-sm text-gray-700 leading-relaxed">함께 살아가는 순간들을 담습니다</p>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">We capture the moments we share.</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase mb-3">Hours</p>
                <p className="text-sm text-gray-700">10:00 – 17:00</p>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">운영시간 외에도 카카오톡 채널을<br />통한 상담 가능합니다</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase mb-3">Contact</p>
                <a href="http://pf.kakao.com/_eMixjX" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-[#2d4a1e] hover:underline">
                  카카오톡 채널 문의 →
                </a>
              </div>
            </div>
            <div className="flex gap-4 py-[80px]">
              <div className="relative aspect-square flex-1 overflow-hidden">
                <Image src="/graphic.png" alt="" fill className="object-cover" />
              </div>
              <div className="relative aspect-square flex-1 overflow-hidden">
                <Image src="/greencat.png" alt="" fill className="object-cover" />
              </div>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-[120px]">
              <p className="text-xs text-gray-400">© 2025 DOYU STUDIO</p>
              <nav className="flex gap-5 text-xs text-gray-400">
                <a href="/" className="hover:text-[#2d4a1e] transition-colors">Home</a>
                <a href="/work" className="hover:text-[#2d4a1e] transition-colors">Work</a>
                <a href="/shop" className="hover:text-[#2d4a1e] transition-colors">Shop</a>
              </nav>
              <a href="https://www.instagram.com/doyu_snap/" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-[#2d4a1e] transition-colors">Instagram</a>
              <a href="https://www.youtube.com/@DOYUSTUDIO" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-[#2d4a1e] transition-colors">YouTube</a>
            </div>
            <div className="w-full overflow-hidden">
              <svg viewBox="0 0 1200 220" preserveAspectRatio="xMidYMax meet" xmlns="http://www.w3.org/2000/svg" width="100%" height="auto">
                <circle cx="160" cy="220" r="200" fill="#2d4a1e" />
                <ellipse cx="600" cy="220" rx="320" ry="140" fill="#e8f0e0" />
                <path d="M880 220 A200 200 0 0 1 1280 220 Z" fill="#3a5e27" />
              </svg>
            </div>
          </footer>
        </main>
      </div>
    </div>
  )
}
