export type Renk = 'maca' | 'kupa' | 'karo' | 'sinek'

// As=1, 2…10, Vale=11, Kız=12, Papaz=13 (seri sıralaması, PROJE.md 6.3)
export type Deger = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13

export interface Kart {
  renk: Renk
  deger: Deger
}

export const kart = (deger: Deger, renk: Renk): Kart => ({ deger, renk })

// Kart boyu / eni.
export const KART_ORANI = 1.4
export const kartBoyu = (en: number) => Math.round(en * KART_ORANI)

const SEMBOL: Record<Renk, string> = { maca: '♠', kupa: '♥', karo: '♦', sinek: '♣' }
const YAZI: Partial<Record<Deger, string>> = { 1: 'A', 11: 'J', 12: 'Q', 13: 'K' }

export const renkSembolu = (r: Renk) => SEMBOL[r]
export const degerYazisi = (d: Deger) => YAZI[d] ?? String(d)
export const kirmiziMi = (r: Renk) => r === 'kupa' || r === 'karo'
export const resimliMi = (d: Deger) => d >= 11

// PROJE.md Bölüm 7
export function kartPuani(k: Kart): number {
  switch (k.deger) {
    case 3: return 30
    case 11: return 25
    case 1: case 12: case 13: return 10
    default: return k.deger
  }
}

export const yiginPuani = (kartlar: Kart[]) => kartlar.reduce((t, k) => t + kartPuani(k), 0)
