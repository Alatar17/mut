// Test menüsündeki "… dene" düğmeleri: istenen kartlar hazır dizilmiş yeni bir el (oyun bitince kalkacak).
import { kart, type Kart } from './kart'
import type { Durum } from './motor'

const ayni = (a: Kart, b: Kart) => a.renk === b.renk && a.deger === b.deger

// El başındaki durumu yeniden dizer: benim avucumun başına `avucum`, orta yığına `orta`, ceza yığınlarına
// `cezalar`, Mut kartlarının başına `mut` konur, geri kalan kartlar rastgele yerlerine. Masaya konan kartlar
// desteden eksilir; son turda avuçlar eksik dağıtılır (sadece deneme için). İlk oynayan ben olurum.
// eksik: verilen diğer avuçlar 4'e tamamlanmaz.
function denemeKur(d: Durum, p: { avucum: Kart[]; digerAvuclar?: Kart[][]; orta?: Kart[]; cezalar?: Kart[][]; mut?: Kart[]; sira?: number; eksik?: boolean }): Durum {
  const orta = p.orta ?? []
  const cezalar = p.cezalar ?? []
  const diger = p.digerAvuclar ?? []
  const mut = p.mut ?? []
  const ozel = [...p.avucum, ...diger.flat(), ...orta, ...cezalar.flat(), ...mut]
  const tumu = [...d.oyuncular.flatMap(o => o.avuc), ...d.mut, ...d.deste]
  const normal = tumu.filter(k => !ozel.some(o => ayni(o, k)))
  d.oyuncular.forEach((o, i) => {
    o.avuc = i === 0 ? [...p.avucum] : [...(diger[i - 1] ?? [])]
    o.ceza = [...(cezalar[i] ?? [])]
  })
  d.oyuncular.forEach((o, i) => {
    if (p.eksik && diger[i - 1]) return
    while (o.avuc.length < 4) o.avuc.push(normal.pop()!)
  })
  d.mut = [...mut, ...normal.splice(normal.length - (4 - mut.length))]
  d.orta = [...orta]
  d.deste = normal
  d.elBaslatani = 0
  d.sira = p.sira ?? 0
  // Dağıtım animasyonu için sıra (orta yığındakiler zaten masada).
  d.dagitim = []
  for (let t = 0; t < 4; t++) {
    for (const o of d.oyuncular) if (o.avuc[t]) d.dagitim.push(o.avuc[t])
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

// Avucumda 8 ve işe yaramaz kartlar; sağdaki B'de bir 8 ve bir 2. 8'i B'nin avucuna bırak → takas; benim 8'im
// ortaya düşer, B'den gelen 8'i onun üstüne atınca yakalanır.
export const takasDenemesi = (d: Durum) =>
  denemeKur(d, {
    avucum: [kart(8, 'maca'), kart(4, 'kupa'), kart(5, 'sinek'), kart(6, 'karo')],
    digerAvuclar: [[kart(8, 'kupa'), kart(2, 'sinek')]],
    orta: [kart(9, 'maca')],
  })

// Avucumda Kız ve işe yaramaz kartlar, Mut kartlarında 9; sağdaki B'de sadece iki 9. Kız'ı B'nin avucuna bırak → çekme;
// hangi ters karta dokunsan 9 gelir, sıra yine bende, 9'u Mut 9'a bırakınca yakalanır. (9 ortada olmaz: Kız
// ortaya düşünce üstünü kapatır.) Soldaki C'nin dolu avucuyla da seçme denenir.
export const kizDenemesi = (d: Durum) =>
  denemeKur(d, {
    avucum: [kart(12, 'maca'), kart(4, 'kupa'), kart(5, 'sinek'), kart(6, 'karo')],
    digerAvuclar: [[kart(9, 'kupa'), kart(9, 'karo')]],
    mut: [kart(9, 'maca')],
    eksik: true,
  })

// Soldaki C (sırası onda) Kız ile benden çeker: avucumda üç 9 var, Mut kartlarında 9; çektiği büyük ihtimalle
// 9 olur ve Mut 9'u yakalar. Botun ters kartlarımdan birini kaldırıp düşünmesi, sonra alması görülür.
export const kizBotDenemesi = (d: Durum) =>
  denemeKur(d, {
    avucum: [kart(9, 'kupa'), kart(9, 'karo'), kart(9, 'sinek')],
    digerAvuclar: [[], [kart(12, 'kupa'), kart(4, 'maca'), kart(5, 'maca'), kart(6, 'maca')]],
    mut: [kart(9, 'maca'), kart(7, 'kupa'), kart(7, 'karo'), kart(7, 'sinek')],
    sira: 2,
  })
