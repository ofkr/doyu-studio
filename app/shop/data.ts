export type ShopCategory = '인쇄물' | '굿즈' | '촬영'

export interface ShopItem {
  id: number
  category: ShopCategory
  name: string
  price: string
  durationLabel: string
  duration: string
  details: string[]
  description: string
  images: string[]
}

export const shopItems: ShopItem[] = [
  {
    id: 1,
    category: '인쇄물',
    name: '청첩장',
    price: '50,000원~',
    durationLabel: '제작기간',
    duration: '3~5일',
    details: ['수정 2회 포함', '카드형 / 접지형 등 다양한 형태 제작 가능', '디자인 시안 1종 제공 후 수정 진행'],
    description: '소중한 날을 함께할 청첩장을 감각적으로 디자인해 드립니다. 카드형, 접지형 등 원하시는 형태로 제작 가능하며, 수정 2회가 포함되어 있어 만족스러운 결과물을 받아보실 수 있습니다.',
    images: ['', '', ''],
  },
  {
    id: 2,
    category: '인쇄물',
    name: '식권',
    price: '30,000원~',
    durationLabel: '제작기간',
    duration: '2~3일',
    details: ['수정 2회 포함', '단면 / 양면 선택 가능', '수량에 따라 가격 변동'],
    description: '결혼식, 행사 등에 필요한 식권을 깔끔하게 디자인해 드립니다. 행사 컨셉에 맞는 디자인으로 통일감 있는 웨딩 소품을 완성하세요.',
    images: ['', ''],
  },
  {
    id: 3,
    category: '인쇄물',
    name: '엽서',
    price: '20,000원~',
    durationLabel: '제작기간',
    duration: '2~3일',
    details: ['수정 2회 포함', '단면 / 양면 선택 가능', '수량에 따라 가격 변동'],
    description: '일상의 감성을 담은 엽서를 제작해 드립니다. 선물용, 기념품, 브랜드 굿즈 등 다양한 목적에 맞게 디자인해 드립니다.',
    images: ['', '', ''],
  },
  {
    id: 4,
    category: '굿즈',
    name: '폰케이스',
    price: '20,000~35,000원',
    durationLabel: '제작기간',
    duration: '3~5일',
    details: ['에폭시케이스', '기종별 사이즈 확인 후 제작', '커스텀 이미지 / 텍스트 적용 가능'],
    description: '나만의 사진이나 디자인으로 세상에 하나뿐인 폰케이스를 만들어 드립니다. 하드케이스와 젤리케이스 중 원하시는 재질로 선택 가능합니다.',
    images: ['', '', ''],
  },
  {
    id: 5,
    category: '굿즈',
    name: '마우스패드',
    price: '15,000~25,000원',
    durationLabel: '제작기간',
    duration: '3~5일',
    details: ['사이즈 소(220×180) / 중(300×250) / 대(400×300)', '논슬립 고무 재질 기본 적용', '커스텀 이미지 / 텍스트 적용 가능'],
    description: '매일 사용하는 마우스패드를 나만의 디자인으로 꾸며보세요. 소·중·대 세 가지 사이즈 중 선택 가능하며 논슬립 재질로 제작됩니다.',
    images: ['', ''],
  },
  {
    id: 6,
    category: '촬영',
    name: '웨딩 스냅',
    price: '200,000~500,000원',
    durationLabel: '촬영시간',
    duration: '2~4시간',
    details: ['서울 / 경기 지역 (타 지역 별도 협의)', '원본 + 보정본 전체 제공', '야외 / 실내 촬영 모두 가능', '촬영 장소 추천 가능'],
    description: '두 분의 빛나는 순간을 감성적인 스냅 사진으로 담아드립니다. 자연스러운 포즈와 감각적인 구도로 오래 간직할 수 있는 사진을 남겨드립니다. 원본과 보정본을 모두 제공해 드립니다.',
    images: ['', '', '', '', ''],
  },
  {
    id: 7,
    category: '촬영',
    name: '웨딩 영상',
    price: '200,000~500,000원',
    durationLabel: '촬영시간',
    duration: '2~4시간',
    details: ['서울 / 경기 지역 (타 지역 별도 협의)', '시네마틱 편집본 영상 제공', '배경음악 삽입 기본 포함', '촬영 장소 추천 가능'],
    description: '결혼식 당일의 소중한 순간들을 시네마틱한 영상으로 담아드립니다. 감각적인 편집과 어울리는 배경음악으로 평생 간직할 수 있는 웨딩 필름을 제작해 드립니다.',
    images: ['', '', '', ''],
  },
]

export const KAKAO_URL = 'http://pf.kakao.com/_eMixjX'
