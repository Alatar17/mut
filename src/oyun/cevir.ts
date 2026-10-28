// Ağ oyununda her telefon masayı kendi gözünden görür: kendisi 0. oyuncu, sağındaki 1, solundaki 2.
// Koltuk k'da oturanın gözünden oyuncu i → (i - k + n) % n. Geri çevirmek için n - k ile çevrilir.
import type { Durum, Hamle, HamleSonucu } from './motor'

type Cevirici = (i: number) => number
const cevirici = (k: number, n: number): Cevirici => i => (((i - k) % n) + n) % n
// Yer adları: "orta", "mut", "ceza:<i>", "bomba:<i>", "avuc:<i>".
const yerCevir = (yer: string, f: Cevirici) => yer.replace(/^(\w+):(\d+)$/, (_, tur, i) => (tur === 'mut' ? `${tur}:${i}` : `${tur}:${f(Number(i))}`))

function sonucCevir(s: HamleSonucu, f: Cevirici): HamleSonucu {
  return {
    ...s,
    oyuncu: f(s.oyuncu),
    nereden: s.nereden && yerCevir(s.nereden, f),
    nereye: yerCevir(s.nereye, f),
    takas: s.takas === undefined ? undefined : f(s.takas),
    cekme: s.cekme && { ...s.cekme, hedef: f(s.cekme.hedef) },
  }
}

export function durumCevir(d: Durum, k: number): Durum {
  const n = d.oyuncular.length
  const f = cevirici(k, n)
  const dizi = <T,>(a: T[]) => a.map((_, j) => a[(j + k) % n])
  return {
    ...d,
    oyuncular: dizi(d.oyuncular),
    puanKagidi: d.puanKagidi.map(dizi),
    elBaslatani: f(d.elBaslatani),
    sira: f(d.sira),
    bomba: d.bomba && { ...d.bomba, sahip: f(d.bomba.sahip) },
    patlama: d.patlama && { ...d.patlama, sahip: f(d.patlama.sahip) },
    blok: d.blok && { ...d.blok, hedef: f(d.blok.hedef), gonderen: f(d.blok.gonderen) },
    kral: d.kral && { ...d.kral, oyuncu: f(d.kral.oyuncu) },
    sonHamle: d.sonHamle && sonucCevir(d.sonHamle, f),
  }
}

// kart ve cekilen avuçtaki sıradır, çevrilmez.
export function hamleCevir(h: Hamle, k: number, n: number): Hamle {
  const f = cevirici(k, n)
  return {
    ...h,
    hedef: h.hedef === undefined ? undefined : f(h.hedef),
    gonder: h.gonder === undefined ? undefined : f(h.gonder),
    yigin: h.yigin && yerCevir(h.yigin, f),
  }
}
