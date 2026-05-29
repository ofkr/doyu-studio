import type { CSSProperties } from 'react'

interface CircleItem {
  size: number
  pos: CSSProperties
  anim: string
  dur: string
  delay: string
}

interface TagItem {
  label: string
  href: string
  pos: CSSProperties
  anim: string
  dur: string
  delay: string
}

const CIRCLES: CircleItem[] = [
  { size: 52, pos: { top: '10%',  left: '7%'   }, anim: 'hs-drift-a', dur: '7s',  delay: '0s'  },
  { size: 40, pos: { top: '15%',  right: '8%'  }, anim: 'hs-drift-b', dur: '9s',  delay: '-2s' },
  { size: 36, pos: { top: '70%',  left: '5%'   }, anim: 'hs-drift-c', dur: '8s',  delay: '-4s' },
  { size: 48, pos: { top: '75%',  right: '6%'  }, anim: 'hs-drift-d', dur: '11s', delay: '-1s' },
  { size: 36, pos: { top: '88%',  left: '12%'  }, anim: 'hs-drift-a', dur: '10s', delay: '-5s' },
  { size: 44, pos: { top: '82%',  right: '9%'  }, anim: 'hs-drift-b', dur: '8s',  delay: '-3s' },
  { size: 28, pos: { top: '45%',  left: '17%'  }, anim: 'hs-drift-c', dur: '12s', delay: '-6s' },
  { size: 36, pos: { top: '42%',  right: '18%' }, anim: 'hs-drift-d', dur: '9s',  delay: '-2s' },
  { size: 32, pos: { top: '5%',   left: '47%'  }, anim: 'hs-drift-a', dur: '10s', delay: '-3s' },
  { size: 40, pos: { top: '90%',  left: '48%'  }, anim: 'hs-drift-b', dur: '7s',  delay: '-1s' },
  { size: 24, pos: { top: '12%',  left: '28%'  }, anim: 'hs-drift-c', dur: '13s', delay: '-7s' },
  { size: 28, pos: { top: '80%',  left: '73%'  }, anim: 'hs-drift-d', dur: '11s', delay: '-4s' },
]

const TAGS: TagItem[] = [
  { label: 'Graphic Design', href: '/work', pos: { top: '28%', left: '8%'   }, anim: 'hs-drift-b', dur: '9s',  delay: '-1s' },
  { label: 'Wedding Snap',   href: '/work', pos: { top: '20%', right: '12%' }, anim: 'hs-drift-c', dur: '11s', delay: '-3s' },
  { label: 'Wedding Film',   href: '/work', pos: { top: '68%', right: '8%'  }, anim: 'hs-drift-a', dur: '10s', delay: '-5s' },
  { label: 'Paper',          href: '/shop', pos: { top: '65%', left: '9%'   }, anim: 'hs-drift-d', dur: '8s',  delay: '-2s' },
  { label: 'Objects',        href: '/shop', pos: { top: '78%', left: '68%'  }, anim: 'hs-drift-b', dur: '12s', delay: '-4s' },
]

const STYLES = `
  @keyframes hs-drift-a {
    0%, 100% { transform: translate(0px,   0px); }
    25%       { transform: translate(8px,  -14px); }
    50%       { transform: translate(-6px,  -8px); }
    75%       { transform: translate(10px,  -4px); }
  }
  @keyframes hs-drift-b {
    0%, 100% { transform: translate(0px,   0px); }
    20%      { transform: translate(-10px,-12px); }
    50%      { transform: translate(8px,   -6px); }
    80%      { transform: translate(-4px, -18px); }
  }
  @keyframes hs-drift-c {
    0%, 100% { transform: translate(0px,   0px); }
    30%      { transform: translate(12px, -10px); }
    60%      { transform: translate(-8px, -14px); }
    85%      { transform: translate(6px,   -4px); }
  }
  @keyframes hs-drift-d {
    0%, 100% { transform: translate(0px,   0px); }
    35%      { transform: translate(-12px, -8px); }
    65%      { transform: translate(10px, -16px); }
    90%      { transform: translate(-4px,  -6px); }
  }
  .hs-circle {
    border-radius: 9999px;
    background-color: #2d4a1e;
    transition: transform 0.3s ease;
  }
  .hs-circle:hover {
    transform: scale(1.2);
  }
  .hs-tag {
    display: inline-block;
    background: #111111;
    color: #ffffff;
    font-size: 13px;
    font-weight: 600;
    line-height: 1;
    padding: 10px 18px;
    border-radius: 9999px;
    white-space: nowrap;
    text-decoration: none;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    transition: transform 0.2s ease, background-color 0.2s ease;
    -webkit-tap-highlight-color: transparent;
  }
  .hs-tag:hover {
    transform: scale(1.06) translateY(-2px);
    background-color: #222222;
  }
`

export const HeroSection = () => {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div className="relative w-full h-screen overflow-hidden bg-white">

        {CIRCLES.map((c, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              ...c.pos,
              animation: `${c.anim} ${c.dur} ease-in-out ${c.delay} infinite`,
            }}
          >
            <div className="hs-circle" style={{ width: c.size, height: c.size }} />
          </div>
        ))}

        {TAGS.map((tag, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              ...tag.pos,
              animation: `${tag.anim} ${tag.dur} ease-in-out ${tag.delay} infinite`,
            }}
          >
            <a href={tag.href} className="hs-tag">{tag.label}</a>
          </div>
        ))}

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <h1 className="text-[60px] md:text-[140px] font-black leading-none text-[#2d4a1e] text-center select-none">
            DOYU<br />STUDIO
          </h1>
        </div>

      </div>
    </>
  )
}
