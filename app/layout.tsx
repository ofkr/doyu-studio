import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: "DOYU STUDIO",
  description: "함께 살아가는 순간들을 담습니다 | 그래픽 디자인, 웨딩 스냅, 웨딩 영상",
  keywords: "도유스튜디오, DOYU STUDIO, 웨딩스냅, 웨딩영상, 그래픽디자인, 청첩장디자인, 굿즈제작, 식전영상, 감성영상, 프로포즈영상, 커스텀디자인, 반팔티, 그래픽, 웨딩촬영, 감성사진, 커플사진, 돌스냅, 가족사진, 포스터디자인, 엽서제작, 폰케이스제작, 마우스패드제작, 서울웨딩스냅, 경기웨딩스냅, doyu, 도유, 웨딩필름, 시네마틱영상",
  verification: {
    google: 'h1AUV3cliF3GXxa3kbE7_gq2MHFtsIqHyWXj42yVD6M',
  },
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
