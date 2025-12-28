export enum Category {
  STUDIO = 'STUDIO',
  DRESS = 'DRESS',
  MAKEUP = 'MAKEUP',
  WEDDING_HALL = 'WEDDING_HALL',
}

export enum Region {
  SEOUL = 'SEOUL',
  GYEONGGI = 'GYEONGGI',
  BUSAN = 'BUSAN',
  DAEGU = 'DAEGU',
  INCHEON = 'INCHEON',
  GWANGJU = 'GWANGJU',
  DAEJEON = 'DAEJEON',
  ULSAN = 'ULSAN',
  GANGWON = 'GANGWON',
  CHUNGBUK = 'CHUNGBUK',
  CHUNGNAM = 'CHUNGNAM',
  JEONBUK = 'JEONBUK',
  JEONNAM = 'JEONNAM',
  GYEONGBUK = 'GYEONGBUK',
  GYEONGNAM = 'GYEONGNAM',
  JEJU = 'JEJU',
}

export const CategoryLabels: Record<Category, string> = {
  [Category.STUDIO]: '스튜디오',
  [Category.DRESS]: '드레스',
  [Category.MAKEUP]: '메이크업',
  [Category.WEDDING_HALL]: '웨딩홀',
}

export const RegionLabels: Record<Region, string> = {
  [Region.SEOUL]: '서울',
  [Region.GYEONGGI]: '경기',
  [Region.BUSAN]: '부산',
  [Region.DAEGU]: '대구',
  [Region.INCHEON]: '인천',
  [Region.GWANGJU]: '광주',
  [Region.DAEJEON]: '대전',
  [Region.ULSAN]: '울산',
  [Region.GANGWON]: '강원',
  [Region.CHUNGBUK]: '충북',
  [Region.CHUNGNAM]: '충남',
  [Region.JEONBUK]: '전북',
  [Region.JEONNAM]: '전남',
  [Region.GYEONGBUK]: '경북',
  [Region.GYEONGNAM]: '경남',
  [Region.JEJU]: '제주',
}

export interface Price {
  id: string
  itemId: string
  name: string | null
  price: number
  description: string | null
  /** 추후 데이터 정리용: 기본값(최저가)로 간주되는 옵션 */
  isDefault?: boolean
}

export interface Item {
  id: string
  vendorId: string
  name: string
  description: string | null
  prices: Price[]
  /** 추후 데이터 정리용: 옵션 선택 방식 */
  selectionMode?: 'single' | 'multi'
  /** 추후 데이터 정리용: 필수 선택 여부 (true면 '선택 안함' 없음) */
  required?: boolean
}

export interface Vendor {
  id: string
  name: string
  category: Category
  region: Region
  address: string | null
  phone: string | null
  website: string | null
  description: string | null
  items: Item[]
}


