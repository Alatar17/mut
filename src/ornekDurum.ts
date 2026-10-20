// Masa taslağı için elle yazılmış sabit bir an. Kural motoru gelince kalkacak.
import { kart, type Kart } from './oyun/kart'

export interface OyuncuDurumu {
  ad: string
  avuc: Kart[]
  ceza: Kart[]
  bot: boolean
}

export const ornekDurum = {
  el: 2,
  toplamEl: 10,
  tur: 2,
  toplamTur: 4,
  siradaki: 0,
  aktifKurallar: ['Serbest el', '×2'],
  carpan: 2,
  mut: [kart(3, 'maca'), kart(9, 'karo'), kart(11, 'sinek'), kart(5, 'kupa')],
  orta: [kart(13, 'sinek'), kart(10, 'karo'), kart(6, 'kupa'), kart(4, 'sinek'), kart(5, 'karo'), kart(7, 'maca')],
  desteKalan: 24,
  // Her satır bir el; sütunlar oyuncular sırasıyla.
  puanKagidi: [[84, -100, 116]],
  // 0 = sen (alt), 1 = sağdaki (sıradaki), 2 = soldaki
  oyuncular: [
    { ad: 'Sen', bot: false, avuc: [kart(2, 'kupa'), kart(6, 'maca'), kart(12, 'karo'), kart(9, 'sinek')], ceza: [kart(5, 'sinek'), kart(5, 'karo')] },
    { ad: 'Bot B', bot: true, avuc: [kart(8, 'kupa'), kart(1, 'maca'), kart(4, 'kupa'), kart(13, 'karo')], ceza: [kart(7, 'kupa'), kart(8, 'sinek'), kart(8, 'karo')] },
    { ad: 'Bot C', bot: true, avuc: [kart(10, 'maca'), kart(3, 'kupa'), kart(12, 'sinek')], ceza: [] },
  ] as OyuncuDurumu[],
}
