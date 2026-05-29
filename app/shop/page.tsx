'use client'
import { useState, useEffect } from 'react'
import { LoginModal } from '../LoginModal'
import { supabase } from '../supabase'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
const KAKAO_URL = 'http://pf.kakao.com/_eMixjX'

interface ShopItem {
  id: string
  title: string | null
  category: string | null
  price: string | null
  period: string | null
  material: string | null
  description: string[] | null
  image: string | null
  images: string[] | null
  is_published: boolean | null
}

type Category = 'All' | 'Paper' | 'Objects' | 'Photo & Film'

const SHOP_KO: Record<string, string> = {
  'Paper': '인쇄물',
  'Objects': '굿즈',
  'Photo & Film': '촬영',
}
const SHOP_EN: Record<string, string> = {
  '인쇄물': 'Paper',
  '굿즈': 'Objects',
  '촬영': 'Photo & Film',
}
const normShopCat = (cat: string | null | undefined) => (cat ? SHOP_EN[cat] ?? cat : '')

const categories: Category[] = ['All', 'Paper', 'Objects', 'Photo & Film']
const navItems = ['WORK', 'SHOP', 'ABOUT']
const navLinks: Record<string, string> = { WORK: '/work', SHOP: '/shop', ABOUT: '/about' }
const navIcons = [
  { href: '/work', src: '/work.svg', alt: 'Work', label: 'Work' },
  { href: '/shop', src: '/shop.svg', alt: 'Shop', label: 'Shop' },
  { href: '/about', src: '/home.svg', alt: 'About', label: 'About' },
]

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('All')
  const [showLogin, setShowLogin] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [nickname, setNickname] = useState<string>('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [shopItems, setShopItems] = useState<ShopItem[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchNickname = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('nickname')
      .eq('id', userId)
      .single()
    if (data?.nickname) setNickname(data.nickname)
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
    const fetchData = async () => {
      try {
        const { data, error } = await supabase.from('shops').select('*').eq('is_published', true).order('id')
        if (error) throw error
        setShopItems(data || [])
      } catch (err) {
        console.error('shop fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setNickname('')
  }

  const filteredItems = activeCategory === 'All'
    ? shopItems
    : shopItems.filter((item) => {
        const cat = item.category ?? ''
        return cat === activeCategory || cat === SHOP_KO[activeCategory]
      })

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
            <a
              key={icon.label}
              href={icon.href}
              className="flex flex-col items-center justify-center w-12 h-12 md:w-[64px] md:h-[64px] rounded-2xl hover:bg-gray-50 transition-colors"
            >
              <div className="w-5 h-5 md:w-[32px] md:h-[32px] flex items-center justify-center">
                <Image src={icon.src} alt={icon.alt} width={28} height={28} style={{ objectFit: 'contain', width: '100%', height: '100%' }} />
              </div>
              <div className="h-[13px] md:h-[16px] flex items-center justify-center">
                <span className="text-[9px] md:text-[11px] font-bold text-gray-700 tracking-wide">{icon.label}</span>
              </div>
            </a>
          ))}
          {user ? (
            <button
              onClick={() => router.push('/mypage')}
              className="flex flex-col items-center justify-center w-12 h-12 md:w-[64px] md:h-[64px] rounded-2xl hover:bg-gray-50 transition-colors"
            >
              <div className="w-5 h-5 md:w-[32px] md:h-[32px] flex items-center justify-center">
                <Image src="/Bullet.svg" alt="profile" width={28} height={28} style={{ objectFit: 'contain', width: '100%', height: '100%' }} />
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
              href={KAKAO_URL}
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
              href={KAKAO_URL}
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

        {/* 메인 컨텐츠 */}
        <main className="flex flex-col flex-1 px-5 pt-24 w-full">
          <section className="pt-[60px] md:pt-[80px] pb-[40px]">
            <h1 className="text-[48px] md:text-[100px] font-black leading-none text-[#2d4a1e]">SHOP</h1>
            <p className="text-sm text-gray-500 mt-3">DOYU STUDIO의 상품을 소개합니다.</p>
          </section>

          {/* 카테고리 탭 */}
          <div className="border-b border-gray-200 mb-0">
            <div className="flex gap-0 overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex-shrink-0 px-4 md:px-6 py-3 text-sm font-medium transition-colors border-b-2 -mb-[2px] whitespace-nowrap ${
                    activeCategory === cat
                      ? 'border-[#2d4a1e] text-[#2d4a1e]'
                      : 'border-transparent text-gray-400 hover:text-gray-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* 상품 그리드 */}
          <section className="py-8">
            {loading ? (
              <p className="text-sm text-gray-400 py-20 text-center">불러오는 중...</p>
            ) : filteredItems.length === 0 ? (
              <p className="text-sm text-gray-400 py-20 text-center">상품이 없습니다.</p>
            ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 border-t border-l border-gray-200">
              {filteredItems.map((item) => (
                <article
                  key={item.id}
                  className="border-r border-b border-gray-200 bg-white cursor-pointer group flex flex-col"
                  onClick={() => router.push(`/shop/${item.id}`)}
                >
                  <div className="px-3 pt-3 pb-1">
                    <span className="text-[9px] font-medium tracking-widest uppercase text-gray-400">
                      {normShopCat(item.category)}
                    </span>
                  </div>
                  <div className="relative w-full px-3">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.title ?? ''}
                        width={0}
                        height={0}
                        sizes="100vw"
                        style={{ width: '100%', height: 'auto', display: 'block' }}
                      />
                    ) : (
                      <div className="aspect-square bg-gray-100 w-full" />
                    )}
                    <span className="absolute inset-0 group-hover:bg-black/5 transition-colors z-10" />
                  </div>
                  <div className="px-3 pt-2 pb-4">
                    <p className="text-sm font-bold text-black leading-snug">{item.title ?? ''}</p>
                    <div className="flex justify-between items-center mt-1.5">
                      <span className="text-[10px] text-[#2d4a1e] font-medium">{item.price ?? ''}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            )}
          </section>

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
