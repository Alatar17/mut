// Botlar (PROJE.md 9.1).
import { kartPuani, yiginPuani } from './kart'
import { elPuanlari, gecerliHamleler, hamleYap, toplamPuanlar, type Durum, type Hamle } from './motor'

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
    const t = hamleYap(d, h, false)
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
  // Bomba sahibine el sonunda patlayacak kartlar (bomba, orta yığın, Mut'ta kalanlar) şimdiden ceza sayılır.
  const cezalar = (x: Durum) =>
    x.oyuncular.map((o, i) => yiginPuani(o.ceza) + (x.bomba?.sahip === i ? yiginPuani([...x.bomba.kartlar, ...x.orta, ...x.mut]) : 0))
  const once = cezalar(d)
  // Serbest elde rakiplere giden puan aynıysa kartlar kazanmakta olana (oyun toplamı + bu el en az olan) gider.
  const toplam = toplamPuanlar(d).map((t, i) => t + elPuanlari(d)[i])
  const lider = d.oyuncular.map((_, i) => i).filter(i => i !== ben).sort((a, b) => toplam[a] - toplam[b])[0]
  // Eksi elde ters: kendi yığınına gelen iyi, rakiplere giden kötü.
  const isaret = d.eksi ? -1 : 1
  // Kral gücünde Papaz'lar sonunda zaten gidecek: bir grubu almak ancak kartlar kazandırıyorsa değer (Papaz puanı düşülür).
  const papazPuani = (h: Hamle) =>
    !d.kral ? 0 : h.tip === 'kralAl' ? kartPuani(d.kral.papazlar[0]) : h.tip === 'kralBitir' ? yiginPuani(d.kral.papazlar) : 0
  return hamleler
    .filter(h => h.tip !== 'takas' && h.tip !== 'cek')
    .map(h => {
      const sonra = h.tip === 'kral' ? kraliBitir(hamleYap(d, h, false)) : hamleYap(d, h, false)
      const fark = cezalar(sonra).map((p, i) => p - once[i])
      const rakiplere = fark.reduce((t, f, i) => (i === ben ? t : t + f), 0)
      const kart = d.oyuncular[ben].avuc[h.kart]
      const lidere = h.gonder === lider ? 0.005 : 0
      return { h, puan: isaret * (rakiplere - fark[ben] - papazPuani(h)) - (kart ? kartPuani(kart) / 100 : 0) + lidere }
    })
}

// Kral hamlesinden sonra güçleri en iyi adımlarla (her adımda en kârlısı) bitirir; Kral hamlesinin değeri buradan ölçülür.
function kraliBitir(d: Durum): Durum {
  while (d.kral) {
    const adaylar = puanlanmis(d)
    const enIyi = Math.max(...adaylar.map(x => x.puan))
    d = hamleYap(d, adaylar.find(x => x.puan === enIyi)!.h, false)
  }
  return d
}
