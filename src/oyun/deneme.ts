// Test menüsündeki "… dene" düğmeleri: istenen kartlar hazır dizilmiş yeni bir el (oyun bitince kalkacak).
import { kart, type Kart } from './kart'
import type { Durum } from './motor'

const ayni = (a: Kart, b: Kart) => a.renk === b.renk && a.deger === b.deger

// El başındaki durumu yeniden dizer: benim avucumun başına `avucum`, orta yığına `orta`, ceza yığınlarına
// `cezalar` konur, geri kalan kartlar rastgele yerlerine. Masaya konan kartlar desteden eksilir; son turda
// avuçlar eksik dağıtılır (sadece deneme için). İlk oynayan ben olurum.
function denemeKur(d: Durum, p: { avucum: Kart[]; digerAvuclar?: Kart[][]; orta?: Kart[]; cezalar?: Kart[][]; sira?: number }): Durum {
  const orta = p.orta ?? []
  const cezalar = p.cezalar ?? []
  const diger = p.digerAvuclar ?? []
  const ozel = [...p.avucum, ...diger.flat(), ...orta, ...cezalar.flat()]
  const tumu = [...d.oyuncular.flatMap(o => o.avuc), ...d.mut, ...d.deste]
  const normal = tumu.filter(k => !ozel.some(o => ayni(o, k)))
  d.oyuncular.forEach((o, i) => {
    o.avuc = i === 0 ? [...p.avucum] : [...(diger[i - 1] ?? [])]
    o.ceza = [...(cezalar[i] ?? [])]
  })
  for (const o of d.oyuncular) while (o.avuc.length < 4) o.avuc.push(normal.pop()!)
  d.mut = normal.splice(normal.length - 4)
  d.orta = [...orta]
  d.deste = normal
  d.elBaslatani = 0
  d.sira = p.sira ?? 0
  // Dağıtım animasyonu için sıra (orta yığındakiler zaten masada).
  d.dagitim = []
  for (let t = 0; t < 4; t++) {
    for (const o of d.oyuncular) d.dagitim.push(o.avuc[t])
    if (d.mut[t]) d.dagitim.push(d.mut[t])
  }
  return d
}

// Ortada 4-5, avucumda 6 (seri) ve 3 (azalan sırayı denemek için).
export const seriDenemesi = (d: Durum) =>
  denemeKur(d, { avucum: [kart(6, 'karo'), kart(3, 'sinek')], orta: [kart(4, 'maca'), kart(5, 'kupa')] })

// Soldaki C (sırası onda) ortadaki 9'u yakalayıp bana yollar; bende iki 2, C'de bir 2 var:
// ben bloklarım → C geri bloklar → ben tekrar bloklarım (zincir).
export const blokDenemesi = (d: Durum) =>
  denemeKur(d, {
    avucum: [kart(2, 'maca'), kart(2, 'sinek')],
    digerAvuclar: [[], [kart(9, 'kupa'), kart(2, 'kupa')]],
    orta: [kart(9, 'maca')],
    sira: 2,
  })

// Herkesin ceza yığınında 4-5-6, avucumda üç 7: kendi yığınını boşalt, sağdakine üstüne yığ / ilerlet, soldakine üstüne yığ.
export const cezaSerisiDenemesi = (d: Durum) =>
  denemeKur(d, {
    avucum: [kart(7, 'maca'), kart(7, 'kupa'), kart(7, 'karo')],
    cezalar: (['maca', 'kupa', 'karo'] as const).map(r => [kart(4, r), kart(5, r), kart(6, r)]),
  })
