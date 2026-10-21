// Botlar (PROJE.md 9.1).
import { kartPuani, yiginPuani } from './kart'
import { gecerliHamleler, hamleYap, type Durum, type Hamle } from './motor'

// Rastgele bot: kurallara uygun hamlelerden birini seçer (ekransız testlerde kullanılır).
export function botHamlesi(d: Durum, rastgele: () => number = Math.random): Hamle {
  const hamleler = gecerliHamleler(d)
  if (hamleler.length === 0) throw new Error('Botun yapacak hamlesi yok')
  return hamleler[Math.floor(rastgele() * hamleler.length)]
}

// Takas ya da çekme, sonrasında yapılabilecek en iyi hamle şu ankinden en az bu kadar puan iyiyse yapılır.
const GUC_ESIGI = 10

// Basit akıllı bot: her hamleyi dener, rakiplere giden puan ile kendi ceza yığınındaki değişimi tartar (eksi elde tersi).
// Yakalama yoksa ortaya en az puanlı kartı atar (yakalanırsa az zarar versin).
// 8 ya da Kız varsa: rakiplerin avuçlarına bakar (test botu, hile serbest). Takasta yeni avuçla, çekmede
// gelebilecek her kartla en iyi hamleyi dener (çekme rastgele olduğu için ortalaması); belirgin iyiyse gücü kullanır.
export function akilliBotHamlesi(d: Durum, rastgele: () => number = Math.random): Hamle {
  const hamleler = gecerliHamleler(d)
  const adaylar = puanlanmis(d, hamleler)
  const enIyi = Math.max(...adaylar.map(x => x.puan))
  // Güçten sonra sıra yine bendeymiş gibi dene (hamleYap yeni durum döndürür, takas/çekme blok açmaz).
  const sonrasi = (h: Hamle) => {
    const t = hamleYap(d, h)
    t.sira = d.sira
    return Math.max(...puanlanmis(t).map(x => x.puan))
  }
  const guc = hamleler
    .filter(h => h.tip === 'takas' || h.tip === 'cek')
    .map(h => {
      if (h.tip === 'takas') return { h, puan: sonrasi(h) }
      const onun = d.oyuncular[h.hedef!].avuc
      return { h, puan: onun.reduce((t, _, cekilen) => t + sonrasi({ ...h, cekilen }), 0) / onun.length }
    })
    .sort((a, b) => b.puan - a.puan)[0]
  if (guc && guc.puan >= enIyi + GUC_ESIGI) return guc.h
  const secilen = adaylar.filter(x => x.puan === enIyi)
  return secilen[Math.floor(rastgele() * secilen.length)].h
}

// Takas ve çekme dışındaki geçerli hamleler ve puanları (sıradaki oyuncunun gözünden).
function puanlanmis(d: Durum, hamleler = gecerliHamleler(d)) {
  const ben = d.sira
  const cezalar = (x: Durum) => x.oyuncular.map(o => yiginPuani(o.ceza))
  const once = cezalar(d)
  return hamleler
    .filter(h => h.tip !== 'takas' && h.tip !== 'cek')
    .map(h => {
      const fark = cezalar(hamleYap(d, h)).map((p, i) => p - once[i])
      const rakiplere = fark.reduce((t, f, i) => (i === ben ? t : t + f), 0)
      const kart = d.oyuncular[ben].avuc[h.kart]
      // Eksi elde ters: kendi yığınına gelen iyi, rakiplere giden kötü.
      const isaret = d.eksi ? -1 : 1
      return { h, puan: isaret * (rakiplere - fark[ben]) - (kart ? kartPuani(kart) / 100 : 0) }
    })
}
