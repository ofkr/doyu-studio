'use client'
import { useState, useEffect } from 'react'
import { LoginModal } from './LoginModal'
import { supabase } from './supabase'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { HeroSection } from './HeroSection'

interface WorkPreview { id: string; category: string; title: string; custom_available: boolean; image: string }
interface ShopPreview { id: string; category: string; title: string; price: string; image: string }

const WORK_CAT: Record<string, string> = { '그래픽 디자인': 'Graphic Design', '웨딩 스냅': 'Wedding Snap', '웨딩 영상': 'Wedding Film' }
const SHOP_CAT: Record<string, string> = { '인쇄물': 'Paper', '굿즈': 'Objects', '촬영': 'Photo & Film' }
const normWork = (c: string) => WORK_CAT[c] ?? c
const normShop = (c: string) => SHOP_CAT[c] ?? c

export const Desktop = (): JSX.Element => {
  const [showLogin, setShowLogin] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [nickname, setNickname] = useState<string>('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [workPreviews, setWorkPreviews] = useState<WorkPreview[]>([])
  const [shopPreviews, setShopPreviews] = useState<ShopPreview[]>([])
  const navItems = ["WORK", "SHOP", "ABOUT"]
  const router = useRouter()

  const fetchNickname = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('nickname')
      .eq('id', userId)
      .single()
    if (data) setNickname(data.nickname)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchNickname(session.user.id)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) fetchNickname(session.user.id)
        else setNickname('')
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    supabase.from('works').select('id, category, title, custom_available, image').order('id', { ascending: false }).limit(4)
      .then(({ data }) => { if (data) setWorkPreviews(data) })
    supabase.from('shops').select('id, category, title, price, image').order('id', { ascending: false }).limit(4)
      .then(({ data }) => { if (data) setShopPreviews(data) })
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setNickname('')
  }

  const navLinks: Record<string, string> = { WORK: '/work', SHOP: '/shop', ABOUT: '/about' }

  const navIcons = [
    { href: '/work', src: '/work.svg', alt: 'Work', label: 'Work' },
    { href: '/shop', src: '/shop.svg', alt: 'Shop', label: 'Shop' },
    { href: '/about', src: '/home.svg', alt: 'About', label: 'About' },
  ]

  return (
    <div className="relative bg-white w-full">

      {/* 상단 네비게이션 */}
      <header className="fixed top-0 left-0 right-0 flex justify-between items-center px-8 py-3 bg-white/90 backdrop-blur-sm z-30">
        <a href="/" className="flex items-center gap-2">
          <Image src="/doyu.svg" alt="DOYU logo" width={24} height={28} style={{ objectFit: 'contain' }} />
          <span className="font-bold tracking-[0.15em] md:tracking-[0.3em] text-sm md:text-lg whitespace-nowrap">D O Y U</span>
        </a>
        <nav className="flex items-center gap-0 md:gap-1">
          {navIcons.map((icon) => (
            <a
              key={icon.label}
              href={icon.href}
              className="flex flex-col items-center justify-center w-12 h-12 md:w-[64px] md:h-[64px] rounded-2xl hover:bg-gray-50 transition-colors"
            >
              <div className="w-5 h-5 md:w-[32px] md:h-[32px] flex items-center justify-center">
                <Image src={icon.src} alt={icon.alt} width={28} height={28} style={{objectFit:'contain', width:'100%', height:'100%'}} />
              </div>
              <div className="h-[13px] md:h-[16px] flex items-center justify-center">
                <span className="text-[9px] md:text-[11px] font-bold text-gray-700 tracking-wide">{icon.label}</span>
              </div>
            </a>
          ))}

          {/* 로그인 상태 - 프로필 아이콘 */}
          {user ? (
            <button
              onClick={() => router.push('/mypage')}
              className="flex flex-col items-center justify-center w-12 h-12 md:w-[64px] md:h-[64px] rounded-2xl hover:bg-gray-50 transition-colors"
            >
              <div className="w-5 h-5 md:w-[32px] md:h-[32px] flex items-center justify-center">
                <Image src="/Bullet.svg" alt="profile" width={28} height={28} style={{objectFit:'contain', width:'100%', height:'100%'}} />
              </div>
              <div className="h-[13px] md:h-[16px] flex items-center justify-center">
                <span className="text-[9px] md:text-[11px] font-bold text-[#2d4a1e] tracking-wide truncate max-w-[48px] md:max-w-[60px]">
                  {nickname || 'MY'}
                </span>
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
            {navItems.map((item) => (
              <a
                key={item}
                href={navLinks[item]}
                className="text-sm font-medium text-black hover:text-green-700"
                onClick={() => setMenuOpen(false)}
              >
                {item}
              </a>
            ))}
            <a
              href="https://www.instagram.com/doyu_snap/"
              className="text-sm text-green-600"
              onClick={() => setMenuOpen(false)}
            >
              Instagram
            </a>
            <a
              href="http://pf.kakao.com/_eMixjX"
              className="text-sm text-yellow-500"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMenuOpen(false)}
            >
              카카오톡 문의
            </a>
            {user ? (
              <button
                onClick={() => { logout(); setMenuOpen(false) }}
                className="text-sm text-left text-gray-400 hover:text-black transition-colors"
              >
                로그아웃
              </button>
            ) : (
              <button
                onClick={() => { setShowLogin(true); setMenuOpen(false) }}
                className="text-sm text-left text-black hover:text-green-700 transition-colors"
              >
                로그인
              </button>
            )}
          </nav>
        </div>
      )}

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}

      <HeroSection />

      <div className="flex items-start">
        {/* 사이드바 - 데스크탑만 */}
        <aside className="hidden md:flex relative w-[300px] sticky top-0 h-screen p-4 flex-col gap-[120px] bg-white pt-24">
          <nav className="flex flex-col gap-5 mt-16">
            {navItems.map((item) => (
              <a key={item} href={navLinks[item]} className="text-sm text-black hover:text-green-700">
                {item}
              </a>
            ))}
            <a
              href="https://www.instagram.com/doyu_snap/"
              className="text-sm text-green-600 mt-8"
            >
              Instagram
            </a>
            <a
              href="http://pf.kakao.com/_eMixjX"
              className="text-sm text-yellow-500"
              target="_blank"
              rel="noopener noreferrer"
            >
              카카오톡 문의
            </a>
            {user ? (
              <button
                onClick={logout}
                className="text-sm text-left text-gray-400 hover:text-black transition-colors mt-2"
              >
                로그아웃
              </button>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="text-sm text-left text-black hover:text-green-700 transition-colors mt-2"
              >
                로그인
              </button>
            )}
          </nav>
        </aside>

        <main className="flex flex-col flex-1 px-5 w-full">
          <section className="pt-[80px] py-[60px]">
            <h2 className="text-2xl font-bold mb-4">About DOYU</h2>
            <p className="text-base leading-relaxed">
              DOYU is a design studio by Hakyoung and Yujoo.<br />
              We create across graphics, photography, and objects.
            </p>
            <div className="mt-8">
              <p className="text-sm font-semibold">
                With them. <span className="font-normal text-gray-500">이들과 함께</span>
              </p>
              <video
                src="/buttercream.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full aspect-[1.78] mt-4 rounded object-cover"
              />
            </div>
          </section>

          {/* WORK 미리보기 */}
          <section className="py-[80px]">
            <div className="flex justify-between items-baseline mb-6">
              <h2 className="text-xs font-medium tracking-[0.2em] text-gray-400 uppercase">Work</h2>
              <a href="/work" className="text-xs text-gray-400 hover:text-[#2d4a1e] transition-colors">See more →</a>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 border-t border-l border-gray-200">
              {workPreviews.map((item) => (
                <a href={`/work/${item.id}`} key={item.id} className="border-r border-b border-gray-200 bg-white group cursor-pointer flex flex-col">
                  <div className="px-3 pt-3 pb-1">
                    <span className="text-[9px] font-medium tracking-widest uppercase text-gray-400">{normWork(item.category)}</span>
                  </div>
                  <div className="relative w-full px-3">
                    {item.image ? (
                      <Image src={item.image} alt={item.title} width={0} height={0} sizes="100vw" style={{ width: '100%', height: 'auto', display: 'block' }} />
                    ) : (
                      <div className="aspect-square bg-gray-100 w-full" />
                    )}
                    <span className="absolute inset-0 group-hover:bg-black/5 transition-colors z-10" />
                  </div>
                  <div className="px-3 pt-2 pb-4">
                    <p className="text-sm font-bold text-black leading-snug">{item.title}</p>
                    <div className="mt-1.5">
                      {normWork(item.category) === 'Wedding Snap' ? (
                        <span className="text-[10px] text-gray-400">스냅 촬영</span>
                      ) : normWork(item.category) === 'Wedding Film' ? (
                        <span className="text-[10px] text-gray-400">영상 촬영</span>
                      ) : (
                        <span className={`text-[10px] ${item.custom_available ? 'text-[#2d4a1e]' : 'text-gray-400'}`}>
                          {item.custom_available ? '커스텀 가능' : '커스텀 불가'}
                        </span>
                      )}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </section>

          {/* SHOP 미리보기 */}
          <section className="py-[80px] border-t border-gray-100">
            <div className="flex justify-between items-baseline mb-6">
              <h2 className="text-xs font-medium tracking-[0.2em] text-gray-400 uppercase">Shop</h2>
              <a href="/shop" className="text-xs text-gray-400 hover:text-[#2d4a1e] transition-colors">See more →</a>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 border-t border-l border-gray-200">
              {shopPreviews.map((item) => (
                <a href={`/shop/${item.id}`} key={item.id} className="border-r border-b border-gray-200 bg-white group cursor-pointer flex flex-col">
                  <div className="px-3 pt-3 pb-1">
                    <span className="text-[9px] font-medium tracking-widest uppercase text-gray-400">{normShop(item.category)}</span>
                  </div>
                  <div className="relative w-full px-3">
                    {item.image ? (
                      <Image src={item.image} alt={item.title} width={0} height={0} sizes="100vw" style={{ width: '100%', height: 'auto', display: 'block' }} />
                    ) : (
                      <div className="aspect-square bg-gray-100 w-full" />
                    )}
                    <span className="absolute inset-0 group-hover:bg-black/5 transition-colors z-10" />
                  </div>
                  <div className="px-3 pt-2 pb-4">
                    <p className="text-sm font-bold text-black leading-snug">{item.title}</p>
                    <div className="mt-1.5">
                      <span className="text-[10px] text-[#2d4a1e] font-medium">{item.price}</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </section>

          <footer className="border-t border-gray-200 pt-[120px]">
            {/* 상단 3컬럼 */}
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
                <a
                  href="http://pf.kakao.com/_eMixjX"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-[#2d4a1e] hover:underline"
                >
                  카카오톡 채널 문의 →
                </a>
              </div>
            </div>

            {/* 이미지 2장 */}
            <div className="flex gap-4 py-[80px]">
              <div className="relative aspect-square flex-1 overflow-hidden">
                <Image src="/graphic.png" alt="" fill className="object-cover" />
              </div>
              <div className="relative aspect-square flex-1 overflow-hidden">
                <Image src="/greencat.png" alt="" fill className="object-cover" />
              </div>
            </div>

            {/* 하단 카피라이트 */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-[120px]">
              <p className="text-xs text-gray-400">© 2025 DOYU STUDIO</p>
              <nav className="flex gap-5 text-xs text-gray-400">
                <a href="/" className="hover:text-[#2d4a1e] transition-colors">Home</a>
                <a href="/work" className="hover:text-[#2d4a1e] transition-colors">Work</a>
                <a href="/shop" className="hover:text-[#2d4a1e] transition-colors">Shop</a>
              </nav>
              <a
                href="https://www.instagram.com/doyu_snap/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-400 hover:text-[#2d4a1e] transition-colors"
              >
                Instagram
              </a>
              <a
                href="https://www.youtube.com/@DOYUSTUDIO"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-400 hover:text-[#2d4a1e] transition-colors"
              >
                YouTube
              </a>
            </div>

            {/* 브랜드 도형 — 페이지 맨 끝에 꽉 채움 */}
            <div className="w-full overflow-hidden">
              <svg
                viewBox="0 0 1200 220"
                preserveAspectRatio="xMidYMax meet"
                xmlns="http://www.w3.org/2000/svg"
                width="100%"
                height="auto"
              >
                {/* 큰 원 — 왼쪽 */}
                <circle cx="160" cy="220" r="200" fill="#2d4a1e" />
                {/* 긴 타원 — 중앙 */}
                <ellipse cx="600" cy="220" rx="320" ry="140" fill="#e8f0e0" />
                {/* 반원 — 오른쪽 */}
                <path d="M880 220 A200 200 0 0 1 1280 220 Z" fill="#3a5e27" />
              </svg>
            </div>
          </footer>
        </main>
      </div>
    </div>
  )
}
