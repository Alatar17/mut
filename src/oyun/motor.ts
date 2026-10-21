// Kural motoru (ekransız). Kurallar: PROJE.md Bölüm 5–8.
// Kapsam: seri, 2 (blok), 8 (takas), Kız (çekme), Vale (çarpan), As (eksi el) ve 3 (serbest el) var; diğer özel kartların etkisi yok (sadece puanlı kart).
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
  // Eksi el (Mut kartlarında As): yakalanan kartlar yakalayanın kendi ceza yığınına, puan eksi yazılır.
  eksi: boolean
  // Serbest el (Mut kartlarında 3): yakalanan kartlar istenen rakibe gider (hamledeki gonder).
  serbest: boolean
  asama: Asama
  // Her satır bir el; sütunlar oyuncular sırasıyla.
  puanKagidi: number[][]
  tohum: number
  // Son yapılan hamlenin sonucu (ekran animasyonu bundan okur); el başında yok.
  sonHamle?: HamleSonucu
  // Son dağıtımda kartların dağıtılma sırası (ekran dağıtım animasyonu bundan okur).
  dagitim: Kart[]
  // Blok penceresi (6.5.1): bir ceza yığınına kart gönderildi, hedef 2 ile blok yapabilir ya da kabul eder.
  // Açıkken sıra hedeftedir; kapanınca normal sıra (6.6) devam eder. adet = gönderilen, yığının üstündeki kart sayısı.
  // Eksi elde ters: gonderen hedefin yığınından kart almıştır, kartlar gonderenin yığınının üstündedir.
  blok?: { hedef: number; gonderen: number; adet: number }
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
  // 8 ile takas: avucu değiştirilen oyuncu (8 ortaya gider, iki avuç yer değiştirir).
  takas?: number
  // Kız ile çekme: kartı alınan oyuncu ve çekilen kart (çekenin avucunun sonuna eklenir).
  cekme?: { hedef: number; kart: Kart }
}

export type HamleTipi =
  | 'ortayaAt' // orta yığına at (üstteki eşleşirse yakalanır)
  | 'mutEslestir' // Mut kartlarıyla eşleştir (aynı sayılı Mut kartlarının hepsi)
  | 'cezaBosalt' // kendi ceza yığınının üstünü eşleştirip gönder
  | 'ekle' // bir rakibin ceza yığınının üstüne ekle (normal elde de herkese); eksi elde sadece kendi yığınına
  | 'alIlerlet' // sıradakinin ceza yığınının üstünü alıp onun sıradakine gönder; eksi elde herkesten (hedef) alıp kendine
  | 'blok' // blok penceresinde: 2 ile gelen kartları gönderene geri yolla (2 altlarına girer)
  | 'kabul' // blok penceresinde: kartları kabul et (kart oynanmaz, kart = -1)
  | 'takas' // 8 ortaya düşer (eşleşme/seri yok), avucunu hedefle değiştirirsin (7)
  | 'cek' // Kız ortaya düşer (eşleşme/seri yok), hedefin avucundan rastgele bir kart çekersin (7)

// kart = avuçtaki sırası; hedef = kartın eklendiği oyuncu (ekle), avucu alınan oyuncu (takas, cek) ya da eksi/serbest elde yığını alınan oyuncu (alIlerlet)
export interface Hamle {
  tip: HamleTipi
  kart: number
  hedef?: number
  // Sadece cek: hedefin avucundan çekilecek kartın sırası. Yoksa rastgele (ters dönmüş karılmış karttan seçmek gibi).
  // Testler ve botun hesabı için; geçerlilik kontrolünde bakılmaz.
  cekilen?: number
  // Serbest elde yakalanan kartların gideceği oyuncu (ortayaAt yakalaması, mutEslestir, cezaBosalt, alIlerlet).
  gonder?: number
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

// Seri (6.3): yığının üstündeki kartlar k'ya doğru birer artarak geliyorsa (4-5 üstüne 6) o kartların sayısı.
// Kimin attığı önemli değil, sadece yığına bakılır. k ile birlikte en az 3 kart olmalı; değilse 0.
function seriUzunlugu(yigin: Kart[], k: Kart): number {
  let n = 0
  while (n < yigin.length && yigin[yigin.length - 1 - n].deger === k.deger - 1 - n) n++
  return n >= 2 ? n : 0
}

// Yığının üstündeki aynı sayılı kartları çıkarıp döndürür.
function ustGrubuAl(yigin: Kart[]): Kart[] {
  const deger = ust(yigin)?.deger
  let i = yigin.length
  while (i > 0 && yigin[i - 1].deger === deger) i--
  return yigin.splice(i)
}

// k bu yığının üstüyle eşleşiyor ya da seriyi tamamlıyor/uzatıyor mu?
const yakalar = (yigin: Kart[], k: Kart) => eslesir(yigin, k) || seriUzunlugu(yigin, k) > 0

// k ile yakalanan kartları (aynı sayılar ya da seri) yığından çıkarıp döndürür.
function yakala(yigin: Kart[], k: Kart): Kart[] {
  return eslesir(yigin, k) ? ustGrubuAl(yigin) : yigin.splice(yigin.length - seriUzunlugu(yigin, k))
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
    eksi: false,
    serbest: false,
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
  d.asama = 'oyun'
  d.sonHamle = undefined
  d.blok = undefined
  avuclariDagit(d, true)
  d.carpan = valeCarpani(d.mut)
  Object.assign(d, acilisKurallari(d.mut))
  d.sira = d.elBaslatani
}

// Mut kartlarında Vale: puanlar ×2, her ek Vale +2 (×4, ×6, ×8). Mut Vale'si eşleştirilse de el boyunca sürer (5.1, 8).
export function valeCarpani(mut: Kart[]): number {
  const n = mut.filter((k) => k.deger === 11).length
  return n > 0 ? 2 * n : 1
}

// Mut kartlarında As: eksi el, 3: serbest el; birden fazlası ek etki yapmaz (7). İkisi birlikteyse önce açılan
// geçerli (5.1); Mut kartları açılma sırasıyla dizili.
export function acilisKurallari(mut: Kart[]) {
  const ilk = mut.find((k) => k.deger === 1 || k.deger === 3)
  return { eksi: ilk?.deger === 1, serbest: ilk?.deger === 3 }
}

// Teker teker: başlatandan itibaren herkese birer, ilk turda sonra Mut kartlarına bir; 4 kez.
function avuclariDagit(d: Durum, mutDahil: boolean) {
  const n = d.oyuncular.length
  d.dagitim = []
  const ver = (yigin: Kart[]) => {
    // Normal oyunda deste hep yeter; Test menüsü denemelerinde eksik kalabilir, o zaman avuçlar eksik dağıtılır.
    if (d.deste.length === 0) return
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
  if (d.blok) {
    // Blok penceresinde sadece hedef karar verir: avucundaki bir 2 ile blok ya da kabul.
    const hamleler: Hamle[] = [{ tip: 'kabul', kart: -1 }]
    d.oyuncular[d.blok.hedef].avuc.forEach((k, kart) => k.deger === 2 && hamleler.push({ tip: 'blok', kart }))
    return hamleler
  }
  const ben = d.oyuncular[d.sira]
  const siradaki = d.oyuncular[sonraki(d, d.sira)]
  const hamleler: Hamle[] = []
  const rakipler = d.oyuncular.map((_, i) => i).filter((i) => i !== d.sira)
  // Serbest elde yakalanan kartlar istenen rakibe gider (6.2): her hedef ayrı hamle. haric: kartların alındığı rakip.
  const yakalama = (h: Hamle, haric?: number) =>
    d.serbest ? rakipler.filter((g) => g !== haric).forEach((gonder) => hamleler.push({ ...h, gonder })) : hamleler.push(h)
  ben.avuc.forEach((k, kart) => {
    const mutVar = d.mut.some((m) => m.deger === k.deger)
    // Mut kartlarıyla eşleşen kart orta yığına boşa atılamaz; ortada eşleşme ya da seri varsa oyuncu seçer (5.2).
    if (yakalar(d.orta, k)) yakalama({ tip: 'ortayaAt', kart })
    else if (!mutVar) hamleler.push({ tip: 'ortayaAt', kart })
    if (mutVar) yakalama({ tip: 'mutEslestir', kart })
    if (d.eksi) {
      // Eksi elde kart hep kendine: kendi yığınına ekle (zorunlu değil), herkesin yığınından al. Seri uzatma da öyle.
      if (yakalar(ben.ceza, k)) hamleler.push({ tip: 'ekle', kart, hedef: d.sira })
      for (const i of rakipler) if (yakalar(d.oyuncular[i].ceza, k)) hamleler.push({ tip: 'alIlerlet', kart, hedef: i })
    } else {
      if (yakalar(ben.ceza, k)) yakalama({ tip: 'cezaBosalt', kart })
      // Ekle herkese; al ve ilerlet normal elde sadece sıradakinden, serbest elde herkesten (hedef) alınıp
      // başka bir rakibe gider (6.3). Seri uzatma da aynı kuralla.
      for (const i of rakipler) if (yakalar(d.oyuncular[i].ceza, k)) hamleler.push({ tip: 'ekle', kart, hedef: i })
      if (d.serbest) {
        for (const i of rakipler) if (yakalar(d.oyuncular[i].ceza, k)) yakalama({ tip: 'alIlerlet', kart, hedef: i }, i)
      } else if (yakalar(siradaki.ceza, k)) hamleler.push({ tip: 'alIlerlet', kart })
    }
    // 8 ile herkesle takas, avucu boş olanla da; Mut kartlarında 8 olsa da serbest (5.2 istisnası).
    if (k.deger === 8) for (const i of rakipler) hamleler.push({ tip: 'takas', kart, hedef: i })
    // Kız ile herkesten çekme, ama avucu boş olandan olmaz (çekilecek kart yok); Mut'ta Kız olsa da serbest.
    if (k.deger === 12)
      for (const i of rakipler) if (d.oyuncular[i].avuc.length > 0) hamleler.push({ tip: 'cek', kart, hedef: i })
  })
  return hamleler
}

export const hamleGecerliMi = (d: Durum, h: Hamle) =>
  gecerliHamleler(d).some((g) => g.tip === h.tip && g.kart === h.kart && g.hedef === h.hedef && g.gonder === h.gonder)

// Hamleyi uygular, yeni durumu döndürür (eski durum değişmez).
export function hamleYap(eski: Durum, h: Hamle): Durum {
  if (!hamleGecerliMi(eski, h)) throw new Error(`Geçersiz hamle: ${JSON.stringify(h)}`)
  const d = structuredClone(eski)
  if (h.tip === 'kabul') {
    d.blok = undefined
    d.sonHamle = undefined
    ilerle(d)
    return d
  }
  const oyuncu = d.sira
  const ben = d.oyuncular[oyuncu]
  const s1 = sonraki(d, oyuncu)
  const [k] = ben.avuc.splice(h.kart, 1)
  let eslesen: Kart[] = []
  let nereden: string | null = null
  // Eksi elde yakalanan kartlar yakalayanın kendi yığınına, serbest elde istenen rakibe gider.
  let nereye = `ceza:${d.eksi ? oyuncu : h.gonder ?? s1}`
  let cekilen: Kart | undefined

  switch (h.tip) {
    case 'ortayaAt':
      if (yakalar(d.orta, k)) {
        eslesen = yakala(d.orta, k)
        nereden = 'orta'
      } else nereye = 'orta'
      break
    case 'mutEslestir':
      eslesen = d.mut.filter((m) => m.deger === k.deger)
      d.mut = d.mut.filter((m) => m.deger !== k.deger)
      nereden = 'mut'
      break
    case 'cezaBosalt':
      eslesen = yakala(ben.ceza, k)
      nereden = `ceza:${oyuncu}`
      break
    case 'ekle':
      nereye = `ceza:${h.hedef}`
      break
    case 'alIlerlet': {
      const kimden = d.eksi || d.serbest ? h.hedef! : s1
      eslesen = yakala(d.oyuncular[kimden].ceza, k)
      nereden = `ceza:${kimden}`
      if (!d.eksi) nereye = `ceza:${h.gonder ?? sonraki(d, s1)}`
      break
    }
    case 'takas':
      nereye = 'orta'
      ;[ben.avuc, d.oyuncular[h.hedef!].avuc] = [d.oyuncular[h.hedef!].avuc, ben.avuc]
      break
    case 'cek': {
      nereye = 'orta'
      const onun = d.oyuncular[h.hedef!].avuc
      const j = h.cekilen ?? Math.floor(rastgele(d) * onun.length)
      if (!(j >= 0 && j < onun.length)) throw new Error(`Geçersiz çekilen kart: ${j}`)
      cekilen = onun.splice(j, 1)[0]
      ben.avuc.push(cekilen)
      break
    }
    case 'blok': {
      // Kartlar asıl sahibine değil, hamleyi yapana döner (6.5). Eksi elde alınan kartlar bloklayanın yığınına geri gelir.
      const kaynak = d.eksi ? d.blok!.gonderen : oyuncu
      const yigin = d.oyuncular[kaynak].ceza
      eslesen = yigin.splice(yigin.length - d.blok!.adet)
      nereden = `ceza:${kaynak}`
      nereye = `ceza:${d.eksi ? oyuncu : d.blok!.gonderen}`
      break
    }
  }
  const hedef = nereye === 'orta' ? null : Number(nereye.split(':')[1])
  if (hedef === null) d.orta.push(k)
  // Blokta 2 gönderilen kartların altına girer, en üstte asıl kartlar kalır.
  else if (h.tip === 'blok') d.oyuncular[hedef].ceza.push(k, ...eslesen)
  else d.oyuncular[hedef].ceza.push(...eslesen, k)
  d.sonHamle = { oyuncu, kart: k, eslesen, nereden, nereye }
  if (h.tip === 'takas') d.sonHamle.takas = h.hedef
  if (cekilen) d.sonHamle.cekme = { hedef: h.hedef!, kart: cekilen }

  // Ceza yığınına kart gelen oyuncunun 2'si varsa blok penceresi açılır (zincir blok da böyle).
  // Not: PROJE.md'ye göre pencere 2 olmasa da açılır (kimde 2 olduğu belli olmasın); bu, herkesin kendi
  // telefonundan oynadığı aşamada ekran tarafında yapılacak. Şimdilik sadece 2'si olana açılır.
  // Zarar gören: normal elde kartların gittiği yığının sahibi, eksi elde yığınından kart alınan (kendine almak zarar değil).
  const kaynakOyuncu = nereden?.startsWith('ceza:') ? Number(nereden.split(':')[1]) : null
  const magdur = d.eksi ? (kaynakOyuncu !== oyuncu ? kaynakOyuncu : null) : hedef
  d.blok = undefined
  if (magdur !== null && d.oyuncular[magdur].avuc.some((x) => x.deger === 2)) {
    d.blok = { hedef: magdur, gonderen: oyuncu, adet: eslesen.length + 1 }
    d.sira = magdur
  } else ilerle(d)
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

// Bölüm 8. Eksi elde puan eksi, boş yığın +100. Orta yığında ve Mut kartlarında kalanlar kimsenin puanına sayılmaz (kesin karar, Bölüm 11).
export function elPuanlari(d: Durum): number[] {
  const isaret = d.eksi ? -1 : 1
  return d.oyuncular.map((o) => (o.ceza.length === 0 ? -100 : yiginPuani(o.ceza)) * isaret * d.carpan)
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
