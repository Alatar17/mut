// Botlar (PROJE.md 9.1).
import { kartPuani, yiginPuani } from './kart'
import { gecerliHamleler, hamleYap, type Durum, type Hamle } from './motor'

// Rastgele bot: kurallara uygun hamlelerden birini seçer (ekransız testlerde kullanılır).
export function botHamlesi(d: Durum, rastgele: () => number = Math.random): Hamle {
  const hamleler = gecerliHamleler(d)
  if (hamleler.length === 0) throw new Error('Botun yapacak hamlesi yok')
  return hamleler[Math.floor(rastgele() * hamleler.length)]
}

// Takas, yeni avuçla yapılabilecek en iyi hamle şu ankinden en az bu kadar puan iyiyse yapılır.
const TAKAS_ESIGI = 10

// Basit akıllı bot: her hamleyi dener, rakiplere giden puan ile kendi ceza yığınındaki değişimi tartar.
// Yakalama yoksa ortaya en az puanlı kartı atar (yakalanırsa az zarar versin).
// 8 varsa: rakiplerin avuçlarına bakar (test botu, hile serbest); belirgin daha iyi bir avuç varsa takas yapar.
export function akilliBotHamlesi(d: Durum, rastgele: () => number = Math.random): Hamle {
  const hamleler = gecerliHamleler(d)
  const adaylar = puanlanmis(d, hamleler)
  const enIyi = Math.max(...adaylar.map(x => x.puan))
  const takas = hamleler
    .filter(h => h.tip === 'takas')
    .map(h => {
      // Takastan sonra sıra yine bendeymiş gibi yeni avucu dene (hamleYap yeni durum döndürür, takas blok açmaz).
      const t = hamleYap(d, h)
      t.sira = d.sira
      return { h, puan: Math.max(...puanlanmis(t).map(x => x.puan)) }
    })
    .sort((a, b) => b.puan - a.puan)[0]
  if (takas && takas.puan >= enIyi + TAKAS_ESIGI) return takas.h
  const secilen = adaylar.filter(x => x.puan === enIyi)
  return secilen[Math.floor(rastgele() * secilen.length)].h
}

// Takas dışındaki geçerli hamleler ve puanları (sıradaki oyuncunun gözünden).
function puanlanmis(d: Durum, hamleler = gecerliHamleler(d)) {
  const ben = d.sira
  const cezalar = (x: Durum) => x.oyuncular.map(o => yiginPuani(o.ceza))
  const once = cezalar(d)
  return hamleler
    .filter(h => h.tip !== 'takas')
    .map(h => {
      const fark = cezalar(hamleYap(d, h)).map((p, i) => p - once[i])
      const rakiplere = fark.reduce((t, f, i) => (i === ben ? t : t + f), 0)
      const kart = d.oyuncular[ben].avuc[h.kart]
      return { h, puan: rakiplere - fark[ben] - (kart ? kartPuani(kart) / 100 : 0) }
    })
}
