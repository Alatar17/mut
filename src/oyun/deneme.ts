// Test menüsündeki "… dene" düğmeleri: istenen kartlar hazır dizilmiş yeni bir el (oyun bitince kalkacak).
import { kart, type Kart } from './kart'
import type { Durum } from './motor'

const ayni = (a: Kart, b: Kart) => a.renk === b.renk && a.deger === b.deger

// El başındaki durumu yeniden dizer: benim avucumun başına `avucum`, orta yığına `orta` konur,
// geri kalan kartlar rastgele yerlerine. Orta yığına giden kart sayısı kadar Mut kartı eksik açılır
// (deste sayısı değişmesin, turlar bozulmasın). İlk oynayan ben olurum.
function denemeKur(d: Durum, avucum: Kart[], orta: Kart[]): Durum {
  const ozel = [...avucum, ...orta]
  const tumu = [...d.oyuncular.flatMap(o => o.avuc), ...d.mut, ...d.deste]
  const normal = tumu.filter(k => !ozel.some(o => ayni(o, k)))
  const mutAdedi = d.mut.length - orta.length
  d.oyuncular.forEach((o, i) => (o.avuc = i === 0 ? [...avucum] : []))
  for (const o of d.oyuncular) while (o.avuc.length < 4) o.avuc.push(normal.pop()!)
  d.mut = normal.splice(normal.length - mutAdedi)
  d.orta = [...orta]
  d.deste = normal
  d.elBaslatani = 0
  d.sira = 0
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
  denemeKur(d, [kart(6, 'karo'), kart(3, 'sinek')], [kart(4, 'maca'), kart(5, 'kupa')])
