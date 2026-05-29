'use client'
import { useState, useEffect } from 'react'
import { LoginModal } from '../LoginModal'
import { supabase } from '../supabase'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

const KAKAO_URL = 'http://pf.kakao.com/_eMixjX'
const YOUTUBE_URL = 'https://www.youtube.com/@DOYUSTUDIO'
const navItems = ['WORK', 'SHOP', 'ABOUT']
const navLinks: Record<string, string> = { WORK: '/work', SHOP: '/shop', ABOUT: '/about' }
const navIcons = [
  { href: '/work', src: '/work.svg', alt: 'Work', label: 'Work' },
  { href: '/shop', src: '/shop.svg', alt: 'Shop', label: 'Shop' },
  { href: '/about', src: '/home.svg', alt: 'About', label: 'About' },
]

export default function AboutPage() {
  const [showLogin, setShowLogin] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [nickname, setNickname] = useState<string>('')
  const [menuOpen, setMenuOpen] = useState(false)
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

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setNickname('')
  }

  return (
    <div className="relative w-full" style={{ backgroundColor: '#2d4a1e' }}>

      {/* 상단 네비게이션 */}
      <header className="fixed top-0 left-0 right-0 flex justify-between items-center px-8 py-3 z-30"
        style={{ backgroundColor: 'rgba(45,74,30,0.92)', backdropFilter: 'blur(8px)' }}>
        <a href="/" className="flex items-center gap-2">
          <Image src="/doyu.svg" alt="DOYU logo" width={24} height={28} style={{ objectFit: 'contain', filter: 'brightness(0) saturate(100%) invert(90%) sepia(30%) saturate(400%) hue-rotate(30deg) brightness(110%)' }} />
          <span className="font-bold tracking-[0.15em] md:tracking-[0.3em] text-sm md:text-lg whitespace-nowrap text-white">D O Y U</span>
        </a>
        <nav className="flex items-center gap-0 md:gap-1">
          {navIcons.map((icon) => (
            <a
              key={icon.label}
              href={icon.href}
              className="flex flex-col items-center justify-center w-12 h-12 md:w-[64px] md:h-[64px] rounded-2xl hover:bg-white/10 transition-colors"
            >
              <div className="w-5 h-5 md:w-[32px] md:h-[32px] flex items-center justify-center opacity-80">
                <Image src={icon.src} alt={icon.alt} width={28} height={28} style={{ objectFit: 'contain', width: '100%', height: '100%', filter: 'invert(1)' }} />
              </div>
              <div className="h-[13px] md:h-[16px] flex items-center justify-center">
                <span className="text-[9px] md:text-[11px] font-bold text-white/70 tracking-wide">{icon.label}</span>
              </div>
            </a>
          ))}
          {user ? (
            <button
              onClick={() => router.push('/mypage')}
              className="flex flex-col items-center justify-center w-12 h-12 md:w-[64px] md:h-[64px] rounded-2xl hover:bg-white/10 transition-colors"
            >
              <div className="w-5 h-5 md:w-[32px] md:h-[32px] flex items-center justify-center">
                <Image src="/Bullet.svg" alt="profile" width={28} height={28} style={{ objectFit: 'contain', width: '100%', height: '100%', filter: 'invert(1)' }} />
              </div>
              <div className="h-[13px] md:h-[16px] flex items-center justify-center">
                <span className="text-[9px] md:text-[11px] font-bold text-white tracking-wide truncate max-w-[48px] md:max-w-[60px]">
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
            <span className={`block w-5 h-0.5 bg-white transition-all ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
            <span className={`block w-5 h-0.5 bg-white transition-all ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-white transition-all ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
          </button>
        </nav>
      </header>

      {/* 모바일 메뉴 */}
      {menuOpen && (
        <div className="fixed top-[70px] left-0 right-0 z-[9999] border-b border-white/10 shadow-md md:hidden"
          style={{ backgroundColor: '#2d4a1e' }}>
          <nav className="flex flex-col px-8 py-6 gap-5">
            {navItems.map((item) => (
              <a
                key={item}
                href={navLinks[item]}
                className="text-sm font-medium text-white/80 hover:text-white"
                onClick={() => setMenuOpen(false)}
              >
                {item}
              </a>
            ))}
            <a
              href="https://www.instagram.com/doyu_snap/"
              className="text-sm text-white/60 hover:text-white"
              onClick={() => setMenuOpen(false)}
            >
              Instagram
            </a>
            <a
              href={YOUTUBE_URL}
              className="text-sm text-white/60 hover:text-white"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMenuOpen(false)}
            >
              YouTube
            </a>
            <a
              href={KAKAO_URL}
              className="text-sm text-yellow-300 hover:text-yellow-200"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMenuOpen(false)}
            >
              카카오톡 문의
            </a>
            {user ? (
              <button
                onClick={() => { logout(); setMenuOpen(false) }}
                className="text-sm text-left text-white/40 hover:text-white transition-colors"
              >
                로그아웃
              </button>
            ) : (
              <button
                onClick={() => { setShowLogin(true); setMenuOpen(false) }}
                className="text-sm text-left text-white/80 hover:text-white transition-colors"
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
        <aside className="hidden md:flex relative w-[300px] sticky top-0 h-screen p-4 flex-col gap-[120px] pt-24"
          style={{ backgroundColor: '#2d4a1e' }}>
          <nav className="flex flex-col gap-5 mt-16">
            {navItems.map((item) => (
              <a key={item} href={navLinks[item]} className="text-sm text-white/70 hover:text-white transition-colors">
                {item}
              </a>
            ))}
            <a
              href="https://www.instagram.com/doyu_snap/"
              className="text-sm text-white/50 hover:text-white transition-colors mt-8"
            >
              Instagram
            </a>
            <a
              href={YOUTUBE_URL}
              className="text-sm text-white/50 hover:text-white transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              YouTube
            </a>
            <a
              href={KAKAO_URL}
              className="text-sm text-yellow-300 hover:text-yellow-200 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              카카오톡 문의
            </a>
            {user ? (
              <button
                onClick={logout}
                className="text-sm text-left text-white/40 hover:text-white transition-colors mt-2"
              >
                로그아웃
              </button>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="text-sm text-left text-white/70 hover:text-white transition-colors mt-2"
              >
                로그인
              </button>
            )}
          </nav>
        </aside>

        {/* 메인 컨텐츠 */}
        <main className="flex flex-col flex-1 px-5 pt-24 w-full min-h-screen">

          {/* 1. 스튜디오 소개 */}
          <section className="pt-[60px] md:pt-[80px] pb-[80px] md:pb-[120px]">
            <h1 className="text-[48px] md:text-[100px] font-black leading-none text-white">
              DOYU
            </h1>
            <p className="text-sm text-white/70 mt-3">
              도학영의 '도'와 이유주의 '유'에서 탄생한 크리에이티브 스튜디오입니다.<br />
              일상의 순간을 특별하게 담아내고, 감각적인 디자인으로 당신의 이야기를 완성합니다.
            </p>
          </section>

          {/* 2. 팀 소개 */}
          <section className="py-[60px] md:py-[80px] border-t border-white/10">
            <p className="text-xs tracking-[0.2em] text-white/40 uppercase mb-10">Team</p>
            <div className="flex flex-col md:flex-row gap-12 md:gap-20">
              <div className="flex flex-col gap-4">
                <div className="w-full md:w-[280px] aspect-square bg-white/5 rounded-lg" />
                <div>
                  <p className="text-lg font-bold text-white">도학영</p>
                  <p className="text-sm text-white/50 mt-1">Design · Video · Photo</p>
                  <p className="text-sm text-white/70 mt-4 leading-relaxed max-w-xs">
                    영상과 사진으로 순간을 포착하고 디자인으로 이야기를 만듭니다.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <div className="w-full md:w-[280px] aspect-square bg-white/5 rounded-lg" />
                <div>
                  <p className="text-lg font-bold text-white">이유주</p>
                  <p className="text-sm text-white/50 mt-1">Design · Photo · Goods</p>
                  <p className="text-sm text-white/70 mt-4 leading-relaxed max-w-xs">
                    감각적인 디자인과 사진으로 일상을 더 특별하게 만듭니다.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 3. 문의 섹션 */}
          <section className="py-[60px] md:py-[100px] border-t border-white/10">
            <p className="text-xs tracking-[0.2em] text-white/40 uppercase mb-8">Contact</p>
            <p className="text-xl md:text-3xl font-bold text-white mb-10 leading-snug">
              카카오톡 채널로<br />문의해주세요
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href={KAKAO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-3 bg-white text-[#2d4a1e] text-sm font-bold rounded-lg hover:bg-white/90 transition-colors"
              >
                카카오톡 문의하기
              </a>
              <a
                href="https://www.instagram.com/doyu_snap/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-3 border border-white/30 text-white text-sm font-medium rounded-lg hover:border-white/60 transition-colors"
              >
                Instagram
              </a>
              <a
                href={YOUTUBE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-3 border border-white/30 text-white text-sm font-medium rounded-lg hover:border-white/60 transition-colors"
              >
                YouTube
              </a>
            </div>
          </section>

          <footer className="border-t border-white/10 pt-[120px]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div>
                <p className="text-sm font-bold text-white mb-3">DOYU STUDIO</p>
                <p className="text-sm text-white/70 leading-relaxed">함께 살아가는 순간들을 담습니다</p>
                <p className="text-xs text-white/40 mt-1 leading-relaxed">We capture the moments we share.</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-white/40 tracking-widest uppercase mb-3">Hours</p>
                <p className="text-sm text-white/70">10:00 – 17:00</p>
                <p className="text-xs text-white/40 mt-2 leading-relaxed">운영시간 외에도 카카오톡 채널을<br />통한 상담 가능합니다</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-white/40 tracking-widest uppercase mb-3">Contact</p>
                <a href="http://pf.kakao.com/_eMixjX" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-white hover:text-white/70 transition-colors">
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
              <p className="text-xs text-white/30">© 2025 DOYU STUDIO</p>
              <nav className="flex gap-5 text-xs text-white/40">
                <a href="/" className="hover:text-white transition-colors">Home</a>
                <a href="/work" className="hover:text-white transition-colors">Work</a>
                <a href="/shop" className="hover:text-white transition-colors">Shop</a>
              </nav>
              <a href="https://www.instagram.com/doyu_snap/" target="_blank" rel="noopener noreferrer" className="text-xs text-white/40 hover:text-white transition-colors">Instagram</a>
              <a href="https://www.youtube.com/@DOYUSTUDIO" target="_blank" rel="noopener noreferrer" className="text-xs text-white/40 hover:text-white transition-colors">YouTube</a>
            </div>
          </footer>
        </main>
      </div>
    </div>
  )
}
