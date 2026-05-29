'use client'
import { useState, useRef } from 'react'
import Image from 'next/image'

interface Props {
  images: string[]
  className?: string
}

export const ImageSlider = ({ images, className = '' }: Props) => {
  const [current, setCurrent] = useState(0)
  const touchStartX = useRef(0)
  const single = images.length <= 1

  const prev = () => setCurrent((c) => (c - 1 + images.length) % images.length)
  const next = () => setCurrent((c) => (c + 1) % images.length)

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev()
  }

  return (
    <div
      className={`relative select-none ${className}`}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* 현재 슬라이드 */}
      {images[current] ? (
        <Image
          src={images[current]}
          alt={`이미지 ${current + 1}`}
          width={0}
          height={0}
          sizes="100vw"
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
      ) : (
        <div className="bg-gray-100 flex items-center justify-center py-20">
          <span className="text-gray-300 text-sm">이미지 준비 중</span>
        </div>
      )}

      {/* 화살표 */}
      {!single && (
        <>
          <button
            onClick={prev}
            aria-label="이전 이미지"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-white/80 hover:bg-white rounded-full shadow-sm transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7L9 12" stroke="#2d4a1e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            onClick={next}
            aria-label="다음 이미지"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-white/80 hover:bg-white rounded-full shadow-sm transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 2L10 7L5 12" stroke="#2d4a1e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </>
      )}

      {/* 점 인디케이터 — 이미지 위 오버레이 */}
      {!single && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 z-10">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`${i + 1}번 이미지`}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                i === current ? 'bg-white scale-125' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
