'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { LoginModal } from '../LoginModal'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface Profile {
  nickname: string
  name: string
  gender: string
  phone: string
  birth: string
}

const profileFields = [
  { label: '닉네임', key: 'nickname' },
  { label: '이름', key: 'name' },
  { label: '성별', key: 'gender' },
  { label: '생년월일', key: 'birth' },
  { label: '전화번호', key: 'phone' },
]

export default function MyPagePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Profile>({ nickname: '', name: '', gender: '', phone: '', birth: '' })
  const [msg, setMsg] = useState('')
  const [user, setUser] = useState<any>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()

  const navItems = ['WORK', 'SHOP', 'ABOUT']
  const navLinks: Record<string, string> = { WORK: '/work', SHOP: '/shop', ABOUT: '/about' }
  const navIcons = [
    { href: '/work', src: '/work.svg', alt: 'Work', label: 'Work' },
    { href: '/shop', src: '/shop.svg', alt: 'Shop', label: 'Shop' },
    { href: '/about', src: '/home.svg', alt: 'About', label: 'About' },
  ]

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }
      setUser(user)
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) { setProfile(data); setForm(data) }
    }
    fetchProfile()
  }, [])

  const saveProfile = async () => {
    if (!user) return
    const { error } = await supabase.from('profiles').update(form).eq('id', user.id)
    if (error) {
      setMsg('저장 실패')
    } else {
      setProfile(form)
      setEditing(false)
      setMsg('저장됐어요!')
      setTimeout(() => setMsg(''), 2000)
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const deleteAccount = async () => {
    if (!user) return
    setDeleteLoading(true)
    try {
      const res = await fetch('/api/delete-account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      })
      if (!res.ok) {
        const { error } = await res.json()
        alert(`탈퇴 실패: ${error}`)
        setDeleteLoading(false)
        return
      }
      await supabase.auth.signOut()
      router.push('/')
    } catch {
      alert('탈퇴 중 오류가 발생했습니다.')
      setDeleteLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* 상단 네비게이션 */}
      <header className="fixed top-0 left-0 right-0 flex justify-between items-center px-8 py-3 bg-white/90 backdrop-blur-sm z-10">
        <button onClick={() => router.push('/')} className="flex items-center gap-2">
          <Image src="/doyu.svg" alt="DOYU logo" width={24} height={28} style={{ objectFit: 'contain' }} />
          <span className="font-bold tracking-[0.15em] md:tracking-[0.3em] text-sm md:text-lg whitespace-nowrap">D O Y U</span>
        </button>
        <nav className="flex items-center gap-1">
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
                  {profile?.nickname || 'MY'}
                </span>
              </div>
            </button>
          ) : null}

          {/* 햄버거 메뉴 - 모바일에서만 */}
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

      {/* 히어로 */}
      <div className="pt-[70px] bg-[#1a2e10]">
        <div className="max-w-[1280px] mx-auto px-8 py-14 flex items-end justify-between">
          <div className="flex flex-col gap-3">
            <p className="text-white/40 text-xs tracking-[0.3em] uppercase">My Page</p>
            <h1
              className="text-white font-black leading-none"
              style={{ fontSize: 'clamp(56px, 10vw, 140px)' }}
            >
              {profile?.nickname || '---'}
            </h1>
            <p className="text-white/30 text-sm mt-1">{user?.email}</p>
          </div>
          <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-white/10 flex items-center justify-center shrink-0">
            <Image src="/Bullet.svg" alt="profile" width={44} height={44} />
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 — 1280px, flex, justify-center, items-start */}
      <main className="flex-1 w-full">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-center items-start gap-12 md:gap-20 px-5 py-12 md:px-8 md:py-16">

          {/* 프로필 정보 */}
          <div className="flex flex-col gap-8 w-full md:w-[680px]">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold tracking-[0.2em] text-[#2d4a1e] uppercase">Profile</h2>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="text-xs tracking-[0.15em] text-gray-400 hover:text-[#2d4a1e] border-b border-gray-300 hover:border-[#2d4a1e] pb-0.5 transition-colors"
                >
                  수정하기
                </button>
              )}
            </div>

            {!editing ? (
              <div className="divide-y divide-gray-100">
                {profileFields.map((item) => (
                  <div key={item.key} className="flex items-center py-5 gap-4">
                    <span className="w-28 text-xs text-gray-400 font-medium tracking-wide shrink-0">{item.label}</span>
                    <span className="text-sm text-gray-900">{profile?.[item.key as keyof Profile] || '---'}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {[
                  { label: '닉네임', key: 'nickname', placeholder: '닉네임' },
                  { label: '이름', key: 'name', placeholder: '이름' },
                  { label: '생년월일', key: 'birth', placeholder: '19900101' },
                  { label: '전화번호', key: 'phone', placeholder: '010-0000-0000' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center gap-4">
                    <label className="w-28 text-xs text-gray-400 shrink-0">{item.label}</label>
                    <input
                      type="text"
                      value={form[item.key as keyof Profile]}
                      onChange={e => setForm({ ...form, [item.key]: e.target.value })}
                      placeholder={item.placeholder}
                      className="flex-1 border-b border-gray-200 py-2 text-sm outline-none focus:border-[#2d4a1e] bg-transparent transition-colors"
                    />
                  </div>
                ))}
                <div className="flex items-center gap-4">
                  <label className="w-28 text-xs text-gray-400 shrink-0">성별</label>
                  <div className="flex gap-2">
                    {['남자', '여자'].map((g) => (
                      <button
                        key={g}
                        onClick={() => setForm({ ...form, gender: g })}
                        className={`px-6 py-2 text-sm border transition-colors ${
                          form.gender === g
                            ? 'bg-[#2d4a1e] text-white border-[#2d4a1e]'
                            : 'border-gray-200 text-gray-600 hover:border-[#2d4a1e]'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 mt-2 md:pl-32">
                  <button
                    onClick={() => { setEditing(false); setForm(profile!) }}
                    className="flex-1 md:flex-none px-8 py-2.5 text-sm border border-gray-200 text-gray-500 hover:border-black hover:text-black transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={saveProfile}
                    className="flex-1 md:flex-none px-8 py-2.5 text-sm bg-[#2d4a1e] text-white hover:bg-[#3d6a2e] transition-colors"
                  >
                    저장하기
                  </button>
                </div>
                {msg && <p className="text-xs text-center text-gray-400">{msg}</p>}
              </div>
            )}
            {!editing && msg && <p className="text-xs text-center text-gray-400">{msg}</p>}
          </div>

          {/* 계정 사이드바 */}
          <div className="flex flex-col gap-8 w-full md:w-[240px] md:shrink-0 md:pt-11">
            <div className="flex flex-col gap-1.5">
              <p className="text-xs font-bold tracking-[0.2em] text-[#2d4a1e] uppercase">Account</p>
              <p className="text-sm text-gray-500 break-all mt-1">{user?.email}</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="text-xs font-bold tracking-[0.2em] text-[#2d4a1e] uppercase">가입일</p>
              <p className="text-sm text-gray-500 mt-1">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString('ko-KR') : '---'}
              </p>
            </div>
            <div className="flex flex-col gap-3 pt-6 border-t border-gray-100">
              {user?.email === 'doyu.works@gmail.com' && (
                <button
                  onClick={() => router.push('/admin')}
                  className="w-full py-3 text-sm font-medium bg-[#2d4a1e] text-white hover:bg-[#3a5e27] transition-colors"
                >
                  관리자 페이지
                </button>
              )}
              <button
                onClick={logout}
                className="w-full py-3 text-sm font-medium border border-gray-200 text-gray-700 hover:border-black hover:text-black transition-colors"
              >
                로그아웃
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-xs text-gray-300 hover:text-red-400 underline transition-colors text-center py-1"
              >
                회원탈퇴
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* 회원탈퇴 확인 팝업 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-[400px] p-8 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-bold">정말 탈퇴하시겠어요?</h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                계정을 삭제하면 모든 정보가 영구적으로 삭제되며 복구할 수 없습니다.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteLoading}
                className="flex-1 py-3 text-sm border border-gray-200 text-gray-600 hover:border-black hover:text-black transition-colors"
              >
                취소
              </button>
              <button
                onClick={deleteAccount}
                disabled={deleteLoading}
                className="flex-1 py-3 text-sm bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleteLoading ? '처리 중...' : '탈퇴하기'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 푸터 */}
      <footer className="border-t border-gray-200 pt-[120px] px-5 md:px-8">
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

        <div className="w-full overflow-hidden">
          <svg
            viewBox="0 0 1200 220"
            preserveAspectRatio="xMidYMax meet"
            xmlns="http://www.w3.org/2000/svg"
            width="100%"
            height="auto"
          >
            <circle cx="160" cy="220" r="200" fill="#2d4a1e" />
            <ellipse cx="600" cy="220" rx="320" ry="140" fill="#e8f0e0" />
            <path d="M880 220 A200 200 0 0 1 1280 220 Z" fill="#3a5e27" />
          </svg>
        </div>
      </footer>
    </div>
  )
}
