// Kural motoru (ekransız). Kurallar: PROJE.md Bölüm 5–8.
// Kapsam: özel kartların etkisi yok (hepsi sadece puanlı kart), seri yok, hedef her zaman sıradaki.
// Yığınlarda dizinin sonu = en üstteki kart.
import { yiginPuani, type Deger, type Kart, type Renk } from './kart'
import { karistir, rastgele } from './rastgele'

export interface Oyuncu {
  ad: string
  avuc: Kart[]
  ceza: Kart[]
}

export type Asama = 'oyun' | 'elSonu' | 'oyunSonu'

export interface Durum {
  oyuncular: Oyuncu[]
  mut: Kart[]
  orta: Kart[]
  deste: Kart[]
  el: number
  toplamEl: number
  tur: number
  toplamTur: number
  elBaslatani: number
  sira: number
  carpan: number
  asama: Asama
  // Her satır bir el; sütunlar oyuncular sırasıyla.
  puanKagidi: number[][]
  tohum: number
  // Son yapılan hamlenin sonucu (ekran animasyonu bundan okur); el başında yok.
  sonHamle?: HamleSonucu
  // Son dağıtımda kartların dağıtılma sırası (ekran dağıtım animasyonu bundan okur).
  dagitim: Kart[]
}

// Yer: "orta", "mut", "ceza:<oyuncu>".
export interface HamleSonucu {
  oyuncu: number
  kart: Kart
  // Oynanan kartın eşleştiği (birlikte alınan) kartlar ve geldikleri yer; eşleşme yoksa boş.
  eslesen: Kart[]
  nereden: string | null
  // Oynanan kartın (ve eşleşenlerin) gittiği yer.
  nereye: string
}

export type HamleTipi =
  | 'ortayaAt' // orta yığına at (üstteki eşleşirse yakalanır)
  | 'mutEslestir' // Mut kartlarıyla eşleştir (aynı sayılı Mut kartlarının hepsi)
  | 'cezaBosalt' // kendi ceza yığınının üstünü eşleştirip gönder
  | 'ustuneYig' // sıradakinin ceza yığınının üstüne ekle
  | 'alIlerlet' // sıradakinin ceza yığınının üstünü alıp onun sıradakine gönder

// kart = avuçtaki sırası
export interface Hamle {
  tip: HamleTipi
  kart: number
}

const RENKLER: Renk[] = ['maca', 'kupa', 'karo', 'sinek']

export function yeniDeste(): Kart[] {
  const deste: Kart[] = []
  for (const renk of RENKLER) for (let d = 1; d <= 13; d++) deste.push({ renk, deger: d as Deger })
  return deste
}

export const sonraki = (d: Durum, i: number) => (i + 1) % d.oyuncular.length
const ust = (yigin: Kart[]) => yigin[yigin.length - 1] as Kart | undefined
const eslesir = (yigin: Kart[], k: Kart) => ust(yigin)?.deger === k.deger

// Yığının üstündeki aynı sayılı kartları çıkarıp döndürür.
function ustGrubuAl(yigin: Kart[]): Kart[] {
  const deger = ust(yigin)?.deger
  let i = yigin.length
  while (i > 0 && yigin[i - 1].deger === deger) i--
  return yigin.splice(i)
}

export function yeniOyun(secenek: { isimler: string[]; toplamEl: number; tohum?: number }): Durum {
  const n = secenek.isimler.length
  if (n !== 3 && n !== 4) throw new Error(`Mut 3 ya da 4 kişiyle oynanır (${n} verildi)`)
  const d: Durum = {
    oyuncular: secenek.isimler.map((ad) => ({ ad, avuc: [], ceza: [] })),
    mut: [],
    orta: [],
    deste: [],
    el: 1,
    toplamEl: secenek.toplamEl,
    tur: 1,
    toplamTur: 48 / (4 * n),
    elBaslatani: 0,
    sira: 0,
    carpan: 1,
    asama: 'oyun',
    puanKagidi: [],
    dagitim: [],
    tohum: secenek.tohum ?? Math.floor(Math.random() * 2 ** 31),
  }
  d.elBaslatani = Math.floor(rastgele(d) * d.oyuncular.length)
  elKur(d)
  return d
}

function elKur(d: Durum) {
  d.deste = karistir(yeniDeste(), d)
  d.mut = []
  d.orta = []
  for (const o of d.oyuncular) {
    o.avuc = []
    o.ceza = []
  }
  d.tur = 1
  d.carpan = 1
  d.asama = 'oyun'
  d.sonHamle = undefined
  avuclariDagit(d, true)
  d.sira = d.elBaslatani
}

// Teker teker: başlatandan itibaren herkese birer, ilk turda sonra Mut kartlarına bir; 4 kez.
function avuclariDagit(d: Durum, mutDahil: boolean) {
  const n = d.oyuncular.length
  d.dagitim = []
  const ver = (yigin: Kart[]) => {
    const k = d.deste.pop()!
    yigin.push(k)
    d.dagitim.push(k)
  }
  for (let tekrar = 0; tekrar < 4; tekrar++) {
    for (let j = 0; j < n; j++) ver(d.oyuncular[(d.elBaslatani + j) % n].avuc)
    if (mutDahil) ver(d.mut)
  }
}

export function gecerliHamleler(d: Durum): Hamle[] {
  if (d.asama !== 'oyun') return []
  const ben = d.oyuncular[d.sira]
  const siradaki = d.oyuncular[sonraki(d, d.sira)]
  const hamleler: Hamle[] = []
  ben.avuc.forEach((k, kart) => {
    const mutVar = d.mut.some((m) => m.deger === k.deger)
    // Mut kartlarıyla eşleşen kart orta yığına boşa atılamaz; orta da eşleşiyorsa oyuncu seçer (5.2).
    if (!mutVar || eslesir(d.orta, k)) hamleler.push({ tip: 'ortayaAt', kart })
    if (mutVar) hamleler.push({ tip: 'mutEslestir', kart })
    if (eslesir(ben.ceza, k)) hamleler.push({ tip: 'cezaBosalt', kart })
    if (eslesir(siradaki.ceza, k)) {
      hamleler.push({ tip: 'ustuneYig', kart })
      hamleler.push({ tip: 'alIlerlet', kart })
    }
  })
  return hamleler
}

export const hamleGecerliMi = (d: Durum, h: Hamle) =>
  gecerliHamleler(d).some((g) => g.tip === h.tip && g.kart === h.kart)

// Hamleyi uygular, yeni durumu döndürür (eski durum değişmez).
export function hamleYap(eski: Durum, h: Hamle): Durum {
  if (!hamleGecerliMi(eski, h)) throw new Error(`Geçersiz hamle: ${JSON.stringify(h)}`)
  const d = structuredClone(eski)
  const oyuncu = d.sira
  const ben = d.oyuncular[oyuncu]
  const s1 = sonraki(d, oyuncu)
  const [k] = ben.avuc.splice(h.kart, 1)
  let eslesen: Kart[] = []
  let nereden: string | null = null
  let nereye = `ceza:${s1}`

  switch (h.tip) {
    case 'ortayaAt':
      if (eslesir(d.orta, k)) {
        eslesen = ustGrubuAl(d.orta)
        nereden = 'orta'
      } else nereye = 'orta'
      break
    case 'mutEslestir':
      eslesen = d.mut.filter((m) => m.deger === k.deger)
      d.mut = d.mut.filter((m) => m.deger !== k.deger)
      nereden = 'mut'
      break
    case 'cezaBosalt':
      eslesen = ustGrubuAl(ben.ceza)
      nereden = `ceza:${oyuncu}`
      break
    case 'ustuneYig':
      break
    case 'alIlerlet':
      eslesen = ustGrubuAl(d.oyuncular[s1].ceza)
      nereden = `ceza:${s1}`
      nereye = `ceza:${sonraki(d, s1)}`
      break
  }
  if (nereye === 'orta') d.orta.push(k)
  else d.oyuncular[Number(nereye.split(':')[1])].ceza.push(...eslesen, k)
  d.sonHamle = { oyuncu, kart: k, eslesen, nereden, nereye }

  ilerle(d)
  return d
}

// 6.6: avucunda en çok kart olan oynar; eşitlikte elin başlatanından sağa doğru ilk olan.
export function siradakiOyuncu(d: Durum): number {
  const n = d.oyuncular.length
  let secilen = d.elBaslatani
  for (let j = 1; j < n; j++) {
    const i = (d.elBaslatani + j) % n
    if (d.oyuncular[i].avuc.length > d.oyuncular[secilen].avuc.length) secilen = i
  }
  return secilen
}

function ilerle(d: Durum) {
  if (d.oyuncular.every((o) => o.avuc.length === 0)) {
    if (d.deste.length === 0) return elBitir(d)
    d.tur++
    avuclariDagit(d, false)
  }
  d.sira = siradakiOyuncu(d)
}

// Bölüm 8. Orta yığında kalanlar kimsenin puanına sayılmaz (Açık soru 3, geçici karar).
export function elPuanlari(d: Durum): number[] {
  return d.oyuncular.map((o) => (o.ceza.length === 0 ? -100 : yiginPuani(o.ceza)) * d.carpan)
}

function elBitir(d: Durum) {
  d.puanKagidi.push(elPuanlari(d))
  d.asama = d.el >= d.toplamEl ? 'oyunSonu' : 'elSonu'
}

export function sonrakiEl(eski: Durum): Durum {
  if (eski.asama !== 'elSonu') throw new Error('El bitmeden yeni el başlatılamaz')
  const d = structuredClone(eski)
  d.el++
  d.elBaslatani = sonraki(d, d.elBaslatani)
  elKur(d)
  return d
}

export const toplamPuanlar = (d: Durum) =>
  d.oyuncular.map((_, i) => d.puanKagidi.reduce((t, satir) => t + satir[i], 0))
