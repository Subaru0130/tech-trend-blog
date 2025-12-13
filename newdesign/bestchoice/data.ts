import { FeaturedCategory, SectionData } from './types';

export const featuredCategories: FeaturedCategory[] = [
  {
    title: "クレジットカード",
    subtitle: "ポイント還元率比較",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAH_shT4W6msrobWOuPuTGusQSoSM6vOOzQ-PB_Ac3ImBp47RlbctRDc4DN93aQom1h5Nulk-HAVAUPQAHzFdX07POhbfh2dFfDn1YY7vuNfjlLTblsixxJ3KRqvicDBjEZFiJQzcB5u7sNinJG7T_VbVNHc9Zj7uBO9ixHw-ToLpSXGpAzQFJBvwTY7HBADkm4VEpMA_32GUsrT1PpXlO-T0gEUVV26K2yO4SQkaTzG6yEShGLkTKHhYFnT6eptqUA_PM8y9GoIAY"
  },
  {
    title: "スマートフォン",
    subtitle: "最新機種人気ランキング",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCwG3d85SCIuD5gkeD2LWIXFNmOvy0stp9azzR_CtyauPEVZiW1oxSKierLvYSrvOENUEm4OwirHXOzJo3guWDvkoCquS6mPKKm5t9Xx7bbD26DABIbtRVcZBKd5lzhP2X5Fj8pbe0vu4kS-ikGPLqH92A3j3OztWSjZ4GwGXiPu7_O4qjlzTFZB9GW1HNfYKvKqZk7tACV5G-oySuvZsTD1PFRBDFmJGZ_88zp8yNNI5QZdSeUAbi6Wu-Qjq_yAWER1-j5HIWMtgo"
  },
  {
    title: "生活家電",
    subtitle: "家事を楽にするアイテム",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBp8FW373-siCDGxOl5JuoyOd6oVBy9Qtbh3__cNio1FJUtK6vBxJpss-nAcvxcy3sFm16ALSzjki_6Q-cJNCtWEJMLWNavb057BCmATJz31GqGWC8AYcRpajV6H8rpyT6fAc5Ucidie-oKXyovGJgdB0uCwlDhr9Trt38KA7AJ9HsXkpYx_fgyq-EzEY9BVQQUN4tYb2-yAwOQy-FJUqjs2XXu6EStEgYEc3tgCoNkdGtLOtiJ-eELLAYRVS3ZjQPxHlJxLYtVt-E"
  },
  {
    title: "インターネット回線",
    subtitle: "速度と料金を徹底比較",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuC0_3Mqd0qOkjMDhB7Xzz2gmcobuSOJa5HzAPNUFgHaeFOwJ0l83phQ-XHYEsBckpIHsnOG3tnxppdk1X0eC-VHTMafWwq22ZUY-wmu7Dvp8HjWPCZoKJIVLKI2z0L3_WO0U7TKBXZB9NhvbtV8chOo2A5LVer4iDK0ybZHr4xGsa4iv57ugQFYCyfjXxFo5i8jVfdPaxb-hSBoXOfynuJXcfkcz8cQZ9gTdvvmFCxnlA6EUE3CG_XZcd8rYYXvKtWSfBD_6pJwPWw"
  }
];

export const sections: SectionData[] = [
  {
    id: "digital",
    title: "パソコン・デジタル家電",
    icon: "devices",
    color: "blue",
    linkText: "デジタル家電をもっと見る",
    items: [
      { name: "ノートパソコン", subtitle: "PC / Mac", icon: "laptop_mac" },
      { name: "デジタルカメラ", subtitle: "一眼 / ミラーレス", icon: "photo_camera" },
      { name: "オーディオ", subtitle: "イヤホン / ヘッドホン", icon: "headphones" },
      { name: "ウェアラブル", subtitle: "スマートウォッチ", icon: "watch" },
      { name: "テレビ・映像", subtitle: "テレビ / レコーダー", icon: "tv" },
      { name: "タブレット", subtitle: "iPad / Android", icon: "tablet_mac" },
      { name: "PC周辺機器", subtitle: "マウス / キーボード", icon: "mouse" },
    ]
  },
  {
    id: "lifestyle",
    title: "生活家電・キッチン",
    icon: "chair",
    color: "green",
    linkText: "生活家電をもっと見る",
    items: [
      { name: "洗濯機", subtitle: "ドラム式 / 縦型", icon: "local_laundry_service" },
      { name: "冷蔵庫", subtitle: "大型 / 一人暮らし", icon: "kitchen" },
      { name: "キッチン家電", subtitle: "コーヒー / 調理機器", icon: "coffee_maker" },
      { name: "掃除機", subtitle: "ロボット / スティック", icon: "vacuum" },
      { name: "空調家電", subtitle: "空気清浄機 / 扇風機", icon: "air" },
      { name: "電子レンジ", subtitle: "オーブンレンジ", icon: "microwave" },
      { name: "エアコン", subtitle: "冷暖房 / 除湿", icon: "ac_unit" },
    ]
  },
  {
    id: "finance",
    title: "金融・サービス",
    icon: "payments",
    color: "purple",
    linkText: "金融・サービスをもっと見る",
    items: [
      { name: "クレジットカード", subtitle: "ポイント / マイル", icon: "credit_card" },
      { name: "カードローン", subtitle: "金利比較 / 即日", icon: "account_balance" },
      { name: "保険", subtitle: "自動車 / 生命保険", icon: "shield" },
      { name: "通信サービス", subtitle: "光回線 / Wi-Fi", icon: "router" },
      { name: "エネルギー", subtitle: "電気 / ガス", icon: "bolt" },
    ]
  }
];