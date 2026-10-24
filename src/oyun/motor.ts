// Kural motoru (ekransız). Kurallar: PROJE.md Bölüm 5–8.
// Kapsam: seri, 2 (blok), 8 (takas), Kız (çekme), Vale (çarpan), As (eksi el), 3 (serbest el) ve 10 (bomba) var; diğer özel kartların etkisi yok (sadece puanlı kart).
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
  // Bomba eli (Mut kartlarında 10, 6.8): Mut 10'u ile kurulan bomba sahibinin yanında ayrı durur (kartlar: 10'lar,
  // blokta 2'ler altta). El sonunda sahibinde patlar; patlayan kartlar ekran animasyonu için patlama'da.
  bombaEli: boolean
  bomba?: { sahip: number; kartlar: Kart[] }
  patlama?: { sahip: number; orta: Kart[]; mut: Kart[]; bomba: Kart[] }
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
  // bomba: gönderilen bombadır (blokta bomba geri gider). bombaIle: bomba sahibi yığınını boşaltırken bomba
  // kartlarla birlikte gitti (6.8 madde 7); blokta kartlarla birlikte geri döner.
  blok?: { hedef: number; gonderen: number; adet: number; bomba?: true; bombaIle?: true }
  // Blokta atılan 2'ler ve Kral'da grubun altına giren Papaz'lar (kartAdi): grubun en alttaki kartına yapışık sayılır,
  // grup yakalanınca onunla gider (6.5, 6.9.1).
  yapisik: string[]
  // Kral eli (Mut kartlarında Papaz, 6.9): avuçtaki Papaz yığınların içinden kart alır.
  kralEli: boolean
  // Kullanılmakta olan Kral gücü: oynanan Papaz ve Mut'tan alınan Papaz'lar, her biri bir güç. Bitene kadar sıra oyuncuda.
  kral?: { oyuncu: number; papazlar: Kart[] }
}

// Yer: "orta", "mut", "ceza:<oyuncu>", "bomba:<oyuncu>".
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
  // Kral hamlesi (kral, kralAl, kralBitir): ekran yakalama inişi yapmaz, kartlar doğrudan uçar.
  kral?: true
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
  | 'bomba' // bomba elinde 10: bomba sendeyse 10'unu ekleyip sıradakine gönderirsin, değilse 10 sahibindeki bombaya eklenir
  | 'kral' // Kral elinde Papaz: Mut'taki Papaz'ları da alır, her Papaz bir güç (6.9); yigin verilirse ilk güç hemen kullanılır
  | 'kralAl' // Kral gücü: bir yığının içinden grup (bas, adet) alınır, Papaz altına girer, gonder'e gider (kart = -1)
  | 'kralBitir' // kalan güçler kullanılmaz: kalan Papaz'lar gonder'in yığınına (kart = -1)

// kart = avuçtaki sırası; hedef = kartın eklendiği oyuncu (ekle), avucu alınan oyuncu (takas, cek) ya da eksi/serbest elde yığını alınan oyuncu (alIlerlet)
export interface Hamle {
  tip: HamleTipi
  kart: number
  hedef?: number
  // Kral: kartların alındığı yığın ("orta" ya da "ceza:<i>") ve yığındaki yeri (alttan sıra, kart sayısı).
  yigin?: string
  bas?: number
  adet?: number
  // Sadece cek: hedefin avucundan çekilecek kartın sırası. Yoksa rastgele (ters dönmüş karılmış karttan seçmek gibi).
  // Testler ve botun hesabı için; geçerlilik kontrolünde bakılmaz.
  cekilen?: number
  // Serbest elde yakalanan kartların gideceği oyuncu (ortayaAt yakalaması, mutEslestir, cezaBosalt, alIlerlet, bomba).
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

const kartAdi = (k: Kart) => `${k.renk}-${k.deger}`

// Ceza yığınından yakalama: yakalanan grubun altında yapışık 2 kaldıysa (blok, 6.5) o da grupla birlikte gider.
function cezadanYakala(d: Durum, yigin: Kart[], k: Kart): Kart[] {
  const alinan = yakala(yigin, k)
  while (yigin.length > 0 && d.yapisik.includes(kartAdi(ust(yigin)!))) alinan.unshift(yigin.pop()!)
  return alinan
}

// Kral'ın bir yığından alabileceği gruplar (6.9.1): yan yana duran aynı sayılı kartların tamamı (tek kart da olur) ya da
// en az 3 kartlık serinin tamamı. Yapışık kartlar (2, Papaz) üstlerindeki karta bağlıdır, tek başına alınmaz.
export function kralGruplari(d: Durum, yigin: Kart[]): { bas: number; adet: number }[] {
  const birimler: { bas: number; son: number; deger: number }[] = []
  let bas = 0
  yigin.forEach((k, i) => {
    if (d.yapisik.includes(kartAdi(k)) && i < yigin.length - 1) return
    birimler.push({ bas, son: i, deger: k.deger })
    bas = i + 1
  })
  const gruplar: { bas: number; adet: number }[] = []
  const ekle = (i: number, j: number) => {
    const g = { bas: birimler[i].bas, adet: birimler[j].son - birimler[i].bas + 1 }
    if (!gruplar.some((x) => x.bas === g.bas && x.adet === g.adet)) gruplar.push(g)
  }
  for (let i = 0; i < birimler.length; ) {
    let j = i
    while (j + 1 < birimler.length && birimler[j + 1].deger === birimler[i].deger) j++
    ekle(i, j)
    i = j + 1
  }
  for (let i = 0; i < birimler.length; ) {
    let j = i
    while (j + 1 < birimler.length && birimler[j + 1].deger === birimler[j].deger + 1) j++
    if (j - i >= 2) ekle(i, j)
    i = j + 1
  }
  return gruplar
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
    bombaEli: false,
    kralEli: false,
    asama: 'oyun',
    puanKagidi: [],
    dagitim: [],
    yapisik: [],
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
  d.bomba = undefined
  d.patlama = undefined
  d.yapisik = []
  d.kral = undefined
  avuclariDagit(d, true)
  d.carpan = valeCarpani(d.mut)
  Object.assign(d, acilisKurallari(d.mut))
  d.kralEli = d.mut.some((k) => k.deger === 13)
  d.sira = d.elBaslatani
}

// Mut kartlarında Vale: puanlar ×2, her ek Vale +2 (×4, ×6, ×8). Mut Vale'si eşleştirilse de el boyunca sürer (5.1, 8).
export function valeCarpani(mut: Kart[]): number {
  const n = mut.filter((k) => k.deger === 11).length
  return n > 0 ? 2 * n : 1
}

// Mut kartlarında As: eksi el, 3: serbest el, 10: bomba eli; birden fazlası ek etki yapmaz (7). As, 3 ve 10 ile
// çakışır: önce açılan geçerli (5.1); 3 ile 10 birlikte olur. Mut kartları açılma sırasıyla dizili.
export function acilisKurallari(mut: Kart[]) {
  let eksi = false
  let serbest = false
  let bombaEli = false
  for (const k of mut) {
    if (k.deger === 1 && !serbest && !bombaEli) eksi = true
    if (k.deger === 3 && !eksi) serbest = true
    if (k.deger === 10 && !eksi) bombaEli = true
  }
  return { eksi, serbest, bombaEli }
}

// Bomba elinde oynanmış (avuçlarda, destede ve Mut'ta olmayan) 10'lar; bomba yığınının üstünde yazar.
export const cikanOnlar = (d: Durum) =>
  4 - [...d.oyuncular.flatMap((o) => o.avuc), ...d.deste, ...d.mut].filter((k) => k.deger === 10).length

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
  if (d.kral) {
    // Kral gücü: orta ya da herhangi bir ceza yığınından grup alınır, istenen oyuncuya gider (serbest el olsun olmasın),
    // kendine olmaz; eksi elde hep kendine (kendi yığınından almak anlamsız). Ya da kalan güçler bırakılır.
    const hedefler = d.eksi ? [d.sira] : rakipler
    const yiginlar = ['orta', ...d.oyuncular.map((_, i) => `ceza:${i}`).filter((y) => !(d.eksi && y === `ceza:${d.sira}`))]
    for (const yigin of yiginlar)
      for (const g of kralGruplari(d, yiginKartlari(d, yigin)))
        for (const gonder of hedefler) hamleler.push({ tip: 'kralAl', kart: -1, yigin, bas: g.bas, adet: g.adet, gonder })
    for (const gonder of hedefler) hamleler.push({ tip: 'kralBitir', kart: -1, gonder })
    return hamleler
  }
  // Serbest elde yakalanan kartlar istenen rakibe gider (6.2): her hedef ayrı hamle. haric: kartların alındığı rakip.
  const yakalama = (h: Hamle, haric?: number) =>
    d.serbest ? rakipler.filter((g) => g !== haric).forEach((gonder) => hamleler.push({ ...h, gonder })) : hamleler.push(h)
  ben.avuc.forEach((k, kart) => {
    const mutVar = d.mut.some((m) => m.deger === k.deger)
    // Bomba kurulduysa 10 ortaya boşa atılamaz, bombaya gider (6.8); seri tamamlıyorsa oyuncu seçer (kullanıcı kararı).
    const bombaVar = !!d.bomba && k.deger === 10
    // Mut kartlarıyla eşleşen kart orta yığına boşa atılamaz; ortada eşleşme ya da seri varsa oyuncu seçer (5.2).
    if (yakalar(d.orta, k)) yakalama({ tip: 'ortayaAt', kart })
    else if (!mutVar && !bombaVar) hamleler.push({ tip: 'ortayaAt', kart })
    // Kral elinde Papaz Mut Papaz'larıyla normal eşleşmez, Kral hamlesi olur (güç kullanılmasa da, 6.9.1).
    const papaz = d.kralEli && k.deger === 13
    if (papaz) hamleler.push({ tip: 'kral', kart })
    if (mutVar && !papaz) yakalama({ tip: 'mutEslestir', kart })
    if (bombaVar) {
      if (d.bomba!.sahip === d.sira) yakalama({ tip: 'bomba', kart })
      else hamleler.push({ tip: 'bomba', kart })
    }
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

const yiginKartlari = (d: Durum, yigin: string) => (yigin === 'orta' ? d.orta : d.oyuncular[Number(yigin.split(':')[1])].ceza)

// Kral hamlesinde ilk güç hemen kullanılabilir (yigin verilirse): kral + kralAl, geçerliliğine ayrı ayrı bakılır.
export const hamleGecerliMi = (d: Durum, h: Hamle): boolean =>
  h.tip === 'kral' && h.yigin !== undefined
    ? hamleGecerliMi(d, { tip: 'kral', kart: h.kart }) && hamleGecerliMi(hamleYap(d, { tip: 'kral', kart: h.kart }), { ...h, tip: 'kralAl', kart: -1 })
    : gecerliHamleler(d).some(
        (g) => g.tip === h.tip && g.kart === h.kart && g.hedef === h.hedef && g.gonder === h.gonder && g.yigin === h.yigin && g.bas === h.bas && g.adet === h.adet,
      )

// Hamleyi uygular, yeni durumu döndürür (eski durum değişmez). dogrula: false sadece gecerliHamleler'den gelen hamle
// için (bot her adayı denerken geçerlilik listesini her seferinde yeniden kurmasın).
export function hamleYap(eski: Durum, h: Hamle, dogrula = true): Durum {
  if (dogrula && !hamleGecerliMi(eski, h)) throw new Error(`Geçersiz hamle: ${JSON.stringify(h)}`)
  if (h.tip === 'kral' && h.yigin !== undefined)
    return hamleYap(hamleYap(eski, { tip: 'kral', kart: h.kart }, false), { ...h, tip: 'kralAl', kart: -1 }, false)
  const d = structuredClone(eski)
  if (h.tip === 'kral' || h.tip === 'kralAl' || h.tip === 'kralBitir') {
    kralHamlesi(d, h)
    return d
  }
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
  const eskiSahip = d.bomba?.sahip
  // Bomba sahibi kendi yığınından kart gönderirse bomba da kartlarla gider; blokta kartlarla geri döner (6.8 madde 7).
  const bombaIle = (h.tip === 'cezaBosalt' && eskiSahip === oyuncu) || (h.tip === 'blok' && !!d.blok!.bombaIle)

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
      // Bomba elinde Mut 10'u bombayı kurar: kartlar ceza yığınına değil, alanın yanına (6.8).
      if (d.bombaEli && k.deger === 10) nereye = nereye.replace('ceza', 'bomba')
      break
    case 'bomba':
      // Bomba sendeyse 10'unla birlikte gönderirsin; değilse 10 sahibindeki bombaya eklenir, bomba yerinde kalır.
      if (d.bomba!.sahip === oyuncu) {
        eslesen = d.bomba!.kartlar.splice(0)
        nereden = `bomba:${oyuncu}`
        nereye = nereye.replace('ceza', 'bomba')
      } else nereye = `bomba:${d.bomba!.sahip}`
      break
    case 'cezaBosalt':
      eslesen = cezadanYakala(d, ben.ceza, k)
      nereden = `ceza:${oyuncu}`
      break
    case 'ekle':
      nereye = `ceza:${h.hedef}`
      break
    case 'alIlerlet': {
      const kimden = d.eksi || d.serbest ? h.hedef! : s1
      eslesen = cezadanYakala(d, d.oyuncular[kimden].ceza, k)
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
      if (d.blok!.bomba) {
        // Bomba gönderene döner, 2 bomba kartlarının altına girer (6.8).
        eslesen = d.bomba!.kartlar.splice(0)
        nereden = `bomba:${oyuncu}`
        nereye = `bomba:${d.blok!.gonderen}`
        break
      }
      // Kartlar asıl sahibine değil, hamleyi yapana döner (6.5). Eksi elde alınan kartlar bloklayanın yığınına geri gelir.
      const kaynak = d.eksi ? d.blok!.gonderen : oyuncu
      const yigin = d.oyuncular[kaynak].ceza
      eslesen = yigin.splice(yigin.length - d.blok!.adet)
      nereden = `ceza:${kaynak}`
      nereye = `ceza:${d.eksi ? oyuncu : d.blok!.gonderen}`
      break
    }
  }
  const [yer, no] = nereye.split(':')
  const hedef = yer === 'orta' ? null : Number(no)
  let yigin = d.orta
  if (yer === 'bomba') {
    d.bomba ??= { sahip: hedef!, kartlar: [] }
    d.bomba.sahip = hedef!
    yigin = d.bomba.kartlar
  } else if (hedef !== null) yigin = d.oyuncular[hedef].ceza
  if (bombaIle) d.bomba!.sahip = hedef!
  // Blokta 2 gönderilen kartların altına girer, en üstte asıl kartlar kalır; ceza yığınında gruba yapışır.
  if (h.tip === 'blok') {
    yigin.push(k, ...eslesen)
    if (yer === 'ceza') d.yapisik.push(kartAdi(k))
  } else yigin.push(...eslesen, k)
  d.sonHamle = { oyuncu, kart: k, eslesen, nereden, nereye }
  if (h.tip === 'takas') d.sonHamle.takas = h.hedef
  if (cekilen) d.sonHamle.cekme = { hedef: h.hedef!, kart: cekilen }

  // Ceza yığınına kart gelen oyuncunun 2'si varsa blok penceresi açılır (zincir blok da böyle).
  // Not: PROJE.md'ye göre pencere 2 olmasa da açılır (kimde 2 olduğu belli olmasın); bu, herkesin kendi
  // telefonundan oynadığı aşamada ekran tarafında yapılacak. Şimdilik sadece 2'si olana açılır.
  // Zarar gören: normal elde kartların gittiği yığının sahibi, eksi elde yığınından kart alınan (kendine almak zarar değil).
  // Bomba elinde bomba yeni sahibine gönderildiyse o; sahibindeki bombaya 10 eklemek blok açmaz (kullanıcı kararı).
  const kaynakOyuncu = nereden?.startsWith('ceza:') ? Number(nereden.split(':')[1]) : null
  const magdur =
    yer === 'bomba' ? (hedef !== eskiSahip ? hedef : null) : d.eksi ? (kaynakOyuncu !== oyuncu ? kaynakOyuncu : null) : hedef
  d.blok = undefined
  if (magdur !== null && d.oyuncular[magdur].avuc.some((x) => x.deger === 2)) {
    d.blok = { hedef: magdur, gonderen: oyuncu, adet: eslesen.length + 1 }
    if (yer === 'bomba') d.blok.bomba = true
    if (bombaIle) d.blok.bombaIle = true
    d.sira = magdur
  } else ilerle(d)
  return d
}

// Kral (6.9, 6.9.1). kral: Papaz avuçtan, Mut'taki Papaz'lar da güce katılır; sıra oyuncuda kalır.
// kralAl: gruptan önce bir Papaz altına girip gruba yapışır, hepsi gonder'in yığınına; bloklanamaz. Bomba sahibi kendi
// yığınından gönderirse bomba da gider (6.8 madde 7). kralBitir: kalan Papaz'lar gonder'e. Güç bitince sıra 6.6 ile.
function kralHamlesi(d: Durum, h: Hamle) {
  const oyuncu = d.sira
  d.blok = undefined
  if (h.tip === 'kral') {
    const [k] = d.oyuncular[oyuncu].avuc.splice(h.kart, 1)
    const mutPapaz = d.mut.filter((m) => m.deger === 13)
    d.mut = d.mut.filter((m) => m.deger !== 13)
    d.kral = { oyuncu, papazlar: [k, ...mutPapaz] }
    d.sonHamle = { oyuncu, kart: k, eslesen: mutPapaz, nereden: mutPapaz.length ? 'mut' : null, nereye: 'kral', kral: true }
    return
  }
  const papazlar = d.kral!.papazlar
  const hedef = d.oyuncular[h.gonder!].ceza
  if (h.tip === 'kralAl') {
    const papaz = papazlar.shift()!
    const alinan = yiginKartlari(d, h.yigin!).splice(h.bas!, h.adet!)
    hedef.push(papaz, ...alinan)
    d.yapisik.push(kartAdi(papaz))
    if (h.yigin === `ceza:${oyuncu}` && d.bomba?.sahip === oyuncu) d.bomba.sahip = h.gonder!
    d.sonHamle = { oyuncu, kart: papaz, eslesen: alinan, nereden: h.yigin!, nereye: `ceza:${h.gonder}`, kral: true }
  } else {
    const [papaz, ...kalan] = papazlar.splice(0)
    hedef.push(...kalan, papaz)
    d.sonHamle = { oyuncu, kart: papaz, eslesen: kalan, nereden: 'kral', nereye: `ceza:${h.gonder}`, kral: true }
  }
  if (papazlar.length === 0) {
    d.kral = undefined
    ilerle(d)
  }
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

// Bölüm 8. Eksi elde puan eksi, boş yığın +100. Orta yığında ve Mut kartlarında kalanlar kimsenin puanına sayılmaz (kesin karar, Bölüm 11);
// bomba elinde bunlar patlamayla bomba sahibine gider (elBitir).
export function elPuanlari(d: Durum): number[] {
  const isaret = d.eksi ? -1 : 1
  return d.oyuncular.map((o) => (o.ceza.length === 0 ? -100 : yiginPuani(o.ceza)) * isaret * d.carpan)
}

function elBitir(d: Durum) {
  // Patlama (6.8): orta yığın, Mut'ta kalanlar ve bomba, bomba kimdeyse onun ceza yığınına.
  if (d.bomba) {
    const p = { sahip: d.bomba.sahip, orta: d.orta.splice(0), mut: d.mut.splice(0), bomba: d.bomba.kartlar }
    d.oyuncular[p.sahip].ceza.push(...p.orta, ...p.mut, ...p.bomba)
    d.patlama = p
    d.bomba = undefined
  }
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

// El sayısı oyun içinde değişebilir ("bir el daha", "bu son el"); oynanan elden az olamaz.
// El arasında son ele inilirse oyun biter; oyun bittikten sonra artırılırsa sonraki el oynanabilir.
export function elSayisiAyarla(eski: Durum, toplamEl: number): Durum {
  const d = structuredClone(eski)
  d.toplamEl = Math.max(toplamEl, d.el)
  if (d.asama === 'elSonu' && d.el >= d.toplamEl) d.asama = 'oyunSonu'
  else if (d.asama === 'oyunSonu' && d.el < d.toplamEl) d.asama = 'elSonu'
  return d
}

// Oyunu bitir: yarım kalan el sayılmaz, oyun biten ellerle kapanır (masadaki kartlar puana yazılmaz).
export function oyunuBitir(eski: Durum): Durum {
  const d = structuredClone(eski)
  d.el = d.puanKagidi.length
  d.toplamEl = d.el
  d.asama = 'oyunSonu'
  d.blok = undefined
  d.kral = undefined
  return d
}

export const toplamPuanlar = (d: Durum) =>
  d.oyuncular.map((_, i) => d.puanKagidi.reduce((t, satir) => t + satir[i], 0))
