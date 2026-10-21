// Botlar (PROJE.md 9.1).
import { kartPuani, yiginPuani } from './kart'
import { gecerliHamleler, hamleYap, type Durum, type Hamle } from './motor'

// Rastgele bot: kurallara uygun hamlelerden birini seçer (ekransız testlerde kullanılır).
export function botHamlesi(d: Durum, rastgele: () => number = Math.random): Hamle {
  const hamleler = gecerliHamleler(d)
  if (hamleler.length === 0) throw new Error('Botun yapacak hamlesi yok')
  return hamleler[Math.floor(rastgele() * hamleler.length)]
}

// Basit akıllı bot: her hamleyi dener, rakiplere giden puan ile kendi ceza yığınındaki değişimi tartar.
// Yakalama yoksa ortaya en az puanlı kartı atar (yakalanırsa az zarar versin).
export function akilliBotHamlesi(d: Durum, rastgele: () => number = Math.random): Hamle {
  const ben = d.sira
  const cezalar = (x: Durum) => x.oyuncular.map(o => yiginPuani(o.ceza))
  const once = cezalar(d)
  const puanla = (h: Hamle) => {
    const sonra = cezalar(hamleYap(d, h))
    const fark = sonra.map((p, i) => p - once[i])
    const rakiplere = fark.reduce((t, f, i) => (i === ben ? t : t + f), 0)
    const kart = d.oyuncular[ben].avuc[h.kart]
    return rakiplere - fark[ben] - (kart ? kartPuani(kart) / 100 : 0)
  }
  const hamleler = gecerliHamleler(d).map(h => ({ h, puan: puanla(h) }))
  const enIyi = Math.max(...hamleler.map(x => x.puan))
  const adaylar = hamleler.filter(x => x.puan === enIyi)
  return adaylar[Math.floor(rastgele() * adaylar.length)].h
}
