// İlk bot: kurallara uygun hamlelerden birini rastgele seçer (PROJE.md 9.1).
import { gecerliHamleler, type Durum, type Hamle } from './motor'

export function botHamlesi(d: Durum, rastgele: () => number = Math.random): Hamle {
  const hamleler = gecerliHamleler(d)
  if (hamleler.length === 0) throw new Error('Botun yapacak hamlesi yok')
  return hamleler[Math.floor(rastgele() * hamleler.length)]
}
