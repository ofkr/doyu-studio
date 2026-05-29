export type WorkCategory = '그래픽 디자인' | '웨딩 스냅' | '웨딩 영상'

export interface WorkItem {
  id: number
  category: WorkCategory
  title: string
  customizable: boolean
  description: string
  images: string[]
}

export const workItems: WorkItem[] = [
  {
    id: 1,
    category: '그래픽 디자인',
    title: '청첩장 디자인 A',
    customizable: true,
    description: '감각적인 타이포그래피와 미니멀한 레이아웃으로 제작된 청첩장 디자인입니다. 이름, 날짜, 장소 등 원하시는 내용으로 커스텀 제작이 가능합니다.',
    images: ['', '', ''],
  },
  {
    id: 2,
    category: '그래픽 디자인',
    title: '청첩장 디자인 B',
    customizable: true,
    description: '따뜻한 컬러 팔레트와 일러스트를 활용한 감성적인 청첩장 디자인입니다. 커플의 취향에 맞게 색상과 내용을 자유롭게 커스텀할 수 있습니다.',
    images: ['', '', ''],
  },
  {
    id: 3,
    category: '그래픽 디자인',
    title: '포스터 디자인',
    customizable: false,
    description: '전시회를 위해 제작된 아트 포스터입니다. 독창적인 그래픽 구성으로 완성된 단독 작품으로, 별도 커스텀 제작은 진행하지 않습니다.',
    images: ['', ''],
  },
  {
    id: 4,
    category: '그래픽 디자인',
    title: '브랜드 패키지',
    customizable: false,
    description: '소규모 브랜드를 위한 아이덴티티 패키지 작업물입니다. 로고, 명함, 봉투 등 브랜드 전반의 디자인을 통일성 있게 구성했습니다.',
    images: ['', '', '', ''],
  },
  {
    id: 5,
    category: '웨딩 스냅',
    title: '웨딩 스냅 01',
    customizable: false,
    description: '야외 공원에서 진행된 봄날의 웨딩 스냅 촬영입니다. 자연광을 활용한 따뜻하고 감성적인 분위기로 담아냈습니다.',
    images: ['', '', '', '', ''],
  },
  {
    id: 6,
    category: '웨딩 스냅',
    title: '웨딩 스냅 02',
    customizable: false,
    description: '웨딩홀 내부에서 진행된 포말한 분위기의 웨딩 스냅입니다. 두 분의 소중한 순간을 세심하게 기록했습니다.',
    images: ['', '', '', ''],
  },
  {
    id: 7,
    category: '웨딩 스냅',
    title: '웨딩 스냅 03',
    customizable: false,
    description: '해질녘 골든아워에 촬영된 로맨틱한 웨딩 스냅입니다. 노을빛과 어우러진 아름다운 순간들을 담았습니다.',
    images: ['', '', '', ''],
  },
  {
    id: 8,
    category: '웨딩 영상',
    title: '웨딩 영상 01',
    customizable: false,
    description: '결혼식 당일의 감동적인 순간들을 영상으로 담은 하이라이트 필름입니다. 시네마틱한 편집으로 특별한 날을 영원히 기억할 수 있도록 제작했습니다.',
    images: ['', '', ''],
  },
  {
    id: 9,
    category: '웨딩 영상',
    title: '웨딩 영상 02',
    customizable: false,
    description: '식전 준비부터 피로연까지 하루 전체를 담은 풀데이 웨딩 영상입니다. 놓칠 수 없는 모든 순간을 세심하게 기록했습니다.',
    images: ['', '', ''],
  },
]

export const KAKAO_URL = 'http://pf.kakao.com/_eMixjX'
