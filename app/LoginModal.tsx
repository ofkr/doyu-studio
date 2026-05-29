'use client'
import { useState } from 'react'
import { supabase } from './supabase'

type Step = 'auth' | 'agree' | 'profile' | 'done'

export const LoginModal = ({ onClose }: { onClose: () => void }) => {
  const [tab, setTab] = useState<'login' | 'signup'>('login')
  const [step, setStep] = useState<Step>('auth')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [agreed, setAgreed] = useState(false)

  const [nickname, setNickname] = useState('')
  const [name, setName] = useState('')
  const [gender, setGender] = useState('')
  const [phone, setPhone] = useState('')
  const [birth, setBirth] = useState('')

  const login = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setMsg('❌ 이메일 또는 비밀번호를 확인해주세요.')
    else { setMsg('✅ 로그인 성공!'); setTimeout(onClose, 800) }
  }

  const goToAgree = () => {
    setMsg('')
    setStep('agree')
  }

  const goToProfile = () => {
    if (!agreed) { setMsg('❌ 개인정보 수집에 동의해주세요.'); return }
    setMsg('')
    setStep('profile')
  }

  const saveProfile = async () => {
    if (!email || !password) { setMsg('❌ 이메일과 비밀번호를 입력해주세요.'); return }
    if (password.length < 6) { setMsg('❌ 비밀번호는 6자 이상이어야 해요.'); return }
    if (!nickname || !name || !gender || !phone || !birth) {
      setMsg('❌ 모든 항목을 입력해주세요.'); return
    }
    if (birth.length !== 8) {
      setMsg('❌ 생년월일 8자리를 입력해주세요. (예: 19900101)'); return
    }

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
    if (signUpError) { setMsg('❌ ' + signUpError.message); return }

    const user = data.user
    if (!user) { setMsg('❌ 가입 중 오류가 발생했어요.'); return }

    const { error: profileError } = await supabase.from('profiles').insert({
      id: user.id,
      nickname,
      name,
      gender,
      phone,
      birth,
    })

    if (profileError) setMsg('❌ 저장 실패: ' + profileError.message)
    else setStep('done')
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white w-[480px] relative" onClick={e => e.stopPropagation()}>

        {/* 헤더 */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold tracking-widest">DOYU</h2>
          <button className="text-gray-400 text-xl" onClick={onClose}>✕</button>
        </div>

        {/* 1단계 - 로그인/회원가입 */}
        {step === 'auth' && (
          <div className="px-8 py-8">
            <div className="flex gap-6 border-b mb-8">
              <button
                className={`pb-3 text-sm border-b-2 transition-colors ${tab === 'login' ? 'border-[#2d4a1e] text-[#2d4a1e] font-medium' : 'border-transparent text-gray-400'}`}
                onClick={() => { setTab('login'); setMsg('') }}
              >로그인</button>
              <button
                className={`pb-3 text-sm border-b-2 transition-colors ${tab === 'signup' ? 'border-[#2d4a1e] text-[#2d4a1e] font-medium' : 'border-transparent text-gray-400'}`}
                onClick={() => { setTab('signup'); setMsg('') }}
              >회원가입</button>
            </div>

            {tab === 'login' && (
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">이메일</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full border border-gray-200 px-4 py-3 text-[16px] outline-none focus:border-[#2d4a1e] rounded-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">비밀번호</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="6자 이상"
                    className="w-full border border-gray-200 px-4 py-3 text-[16px] outline-none focus:border-[#2d4a1e] rounded-sm"
                  />
                </div>
                <button
                  onClick={login}
                  className="w-full bg-[#2d4a1e] text-white py-3 text-sm tracking-widest mt-2 rounded-sm hover:bg-[#3d6a2e] transition-colors"
                >로그인</button>
                {msg && <p className="text-xs text-center text-red-400">{msg}</p>}
              </div>
            )}

            {tab === 'signup' && (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-gray-500">회원가입을 시작하기 전에 개인정보 수집 동의가 필요해요.</p>
                <button
                  onClick={goToAgree}
                  className="w-full bg-[#2d4a1e] text-white py-3 text-sm tracking-widest mt-2 rounded-sm hover:bg-[#3d6a2e] transition-colors"
                >다음</button>
              </div>
            )}
          </div>
        )}

        {/* 2단계 - 개인정보 동의 */}
        {step === 'agree' && (
          <div className="px-8 py-8">
            <h3 className="text-base font-bold mb-1">개인정보 수집 및 이용 동의</h3>
            <p className="text-xs text-gray-400 mb-6">서비스 이용을 위해 아래 내용을 확인해주세요.</p>

            <div className="border border-gray-200 rounded-sm p-4 mb-6 h-[200px] overflow-y-auto">
              <p className="text-xs text-gray-500 leading-relaxed">
                <strong className="text-gray-700">수집하는 개인정보 항목</strong><br />
                닉네임, 이름, 성별, 전화번호, 생년월일<br /><br />
                <strong className="text-gray-700">수집 및 이용 목적</strong><br />
                회원 식별 및 서비스 제공, 본인 확인<br /><br />
                <strong className="text-gray-700">보유 및 이용 기간</strong><br />
                회원 탈퇴 시까지 보유 후 즉시 파기<br /><br />
                <strong className="text-gray-700">동의 거부 권리</strong><br />
                개인정보 수집에 동의하지 않을 권리가 있으나,
                동의 거부 시 서비스 이용이 제한될 수 있습니다.
              </p>
            </div>

            <label className="flex items-center gap-3 cursor-pointer mb-6">
              <input
                type="checkbox"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
                className="w-4 h-4 accent-[#2d4a1e]"
              />
              <span className="text-sm">개인정보 수집 및 이용에 동의합니다</span>
            </label>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('auth')}
                className="flex-1 border border-gray-200 py-3 text-sm rounded-sm hover:bg-gray-50 transition-colors"
              >이전</button>
              <button
                onClick={goToProfile}
                className="flex-1 bg-[#2d4a1e] text-white py-3 text-sm rounded-sm hover:bg-[#3d6a2e] transition-colors"
              >동의하고 계속</button>
            </div>
            {msg && <p className="text-xs text-center text-red-400 mt-3">{msg}</p>}
          </div>
        )}

        {/* 3단계 - 정보 입력 */}
        {step === 'profile' && (
          <div className="px-8 py-8">
            <h3 className="text-base font-bold mb-1">정보 입력</h3>
            <p className="text-xs text-gray-400 mb-6">아래 정보를 입력해주세요.</p>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">이메일</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full border border-gray-200 px-4 py-3 text-[16px] outline-none focus:border-[#2d4a1e] rounded-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">비밀번호</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="6자 이상"
                  className="w-full border border-gray-200 px-4 py-3 text-[16px] outline-none focus:border-[#2d4a1e] rounded-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">닉네임</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={e => setNickname(e.target.value)}
                  placeholder="닉네임을 입력하세요"
                  className="w-full border border-gray-200 px-4 py-3 text-[16px] outline-none focus:border-[#2d4a1e] rounded-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">성별</label>
                <div className="flex gap-3">
                  {['남자', '여자'].map((g) => (
                    <button
                      key={g}
                      onClick={() => setGender(g)}
                      className={`flex-1 py-3 text-sm border rounded-sm transition-colors ${
                        gender === g
                          ? 'bg-[#2d4a1e] text-white border-[#2d4a1e]'
                          : 'border-gray-200 text-gray-600 hover:border-[#2d4a1e]'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">이름</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="이름을 입력하세요"
                  className="w-full border border-gray-200 px-4 py-3 text-[16px] outline-none focus:border-[#2d4a1e] rounded-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">생년월일</label>
                <input
                  type="text"
                  value={birth}
                  onChange={e => setBirth(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="19900101 (8자리)"
                  maxLength={8}
                  className="w-full border border-gray-200 px-4 py-3 text-[16px] outline-none focus:border-[#2d4a1e] rounded-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">휴대전화번호</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="010-0000-0000"
                  className="w-full border border-gray-200 px-4 py-3 text-[16px] outline-none focus:border-[#2d4a1e] rounded-sm"
                />
              </div>
              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => setStep('agree')}
                  className="flex-1 border border-gray-200 py-3 text-sm rounded-sm hover:bg-gray-50 transition-colors"
                >이전</button>
                <button
                  onClick={saveProfile}
                  className="flex-1 bg-[#2d4a1e] text-white py-3 text-sm rounded-sm hover:bg-[#3d6a2e] transition-colors"
                >가입 완료</button>
              </div>
              {msg && <p className="text-xs text-center text-red-400 mt-2">{msg}</p>}
            </div>
          </div>
        )}

        {/* 4단계 - 완료 */}
        {step === 'done' && (
          <div className="px-8 py-12 flex flex-col items-center text-center gap-4">
            <div className="text-5xl mb-2">🎉</div>
            <h3 className="text-base font-bold">가입이 완료됐어요!</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              DOYU에 오신 것을 환영해요.<br /><br />
              로그인 버튼을 눌러<br />
              서비스를 이용해주세요.
            </p>
            <button
              onClick={() => { setStep('auth'); setTab('login'); onClose() }}
              className="w-full bg-[#2d4a1e] text-white py-3 text-sm rounded-sm hover:bg-[#3d6a2e] transition-colors mt-4"
            >로그인 하러 가기</button>
          </div>
        )}

      </div>
    </div>
  )
}