// Kahve sürümü: telefonlar arası masa (PeerJS). Kurucu masayı açar (4 harfli kod), diğerleri kodla katılır.
// Kurucunun telefonu merkezdir: herkes ona bağlanır, oyuncu listesini o dağıtır. Koltuk 0 = kurucu.
// Oyunda kurucu hakemdir: kural motoru onda çalışır, misafir hamlesini ona yollar, o da sonucu herkese yayar.
// Oyunun bütün durumu herkese gider (başkalarının kartlarını ekran gizler). Her telefon masayı kendi gözünden
// görür (kendisi 0. oyuncu); çevirmeyi kurucu yapar (giden ve gelen), ekran hep kendi gözünden konuşur.
import Peer, { type DataConnection } from 'peerjs'
import { durumCevir, hamleCevir } from './oyun/cevir'
import type { Durum, Hamle } from './oyun/motor'

const ONEK = 'mut-masa-'
// Karışmasın diye O/0, I/1 gibi harfler yok (bağlantı denemesiyle aynı).
const HARFLER = 'ABCDEFGHJKLMNPRSTUVYZ'
const BAGLANMA_SURESI = 15000
// Nabız: herkes birkaç saniyede bir "buradayım" der. Bu kadar süre ses gelmeyen kopmuş sayılır
// (bağlantının kapandığı haberi internetten geç geliyor).
const NABIZ = 2000
const SESSIZLIK = 8000
export const KOLTUK = 3

export interface MasaDurumu {
  asama: 'baglaniyor' | 'bekleme' | 'basladi' | 'hata'
  kod: string
  isimler: string[] // koltuk sırasıyla oturanlar (boş koltuk yok, sona eklenir)
  ben: number
  kurucu: boolean
  hata?: string
  // Misafir: kurucunun gönderdiği ilk dağıtım (oyun bununla açılır).
  ilkDurum?: Durum
  // Misafir oyun sürerken yeniden katıldı: ilkDurum elin ortası, dağıtım yapılmaz.
  devam?: boolean
}

// Oyun mesajları. Kurucu → misafir: hamle (yapılan hamle ve sonrası), dagit (yeni el / yeni oyun), durum (el sayısı,
// oyunu bitirme, uyuşmazlıkta düzeltme). Misafir → kurucu: oyna (benim hamlem).
export type OyunMesaji =
  | { tip: 'hamle'; hamle: Hamle; durum: Durum }
  | { tip: 'dagit'; durum: Durum }
  | { tip: 'durum'; durum: Durum }
  | { tip: 'oyna'; hamle: Hamle }

type Mesaj =
  | { tip: 'merhaba'; isim: string; kimlik: string }
  | { tip: 'nabiz' }
  | { tip: 'masa'; isimler: string[]; ben: number }
  | { tip: 'dolu' }
  | { tip: 'oyun'; m: OyunMesaji }

const HATA_ADI: Record<string, string> = {
  network: 'Sunucuya ulaşılamadı. İnternet açık mı?',
  'server-error': 'Sunucu hata verdi, biraz sonra yeniden dene.',
  'socket-error': 'Sunucuyla bağlantı koptu.',
  'peer-unavailable': 'Bu kodla masa yok. Kodu kontrol et.',
  'browser-incompatible': 'Bu tarayıcı desteklemiyor.',
  webrtc: 'Telefonlar birbirine bağlanamadı.',
}

let peer: Peer | null = null
// conn null: oyun sürerken kopmuş (koltuğu duruyor, yerine bot oynar).
let misafirler: { conn: DataConnection | null; isim: string; koltuk: number; kimlik: string; ses: number }[] = []
let kurucuyla: DataConnection | null = null
let nabiz = 0
let durum: MasaDurumu
let dinleyici: (d: MasaDurumu) => void = () => {}
// Oyun mesajları masa ekranına gider; ekran henüz açılmadıysa biriktirilir. kimden: gönderenin koltuğu (kurucuda).
let oyunDinleyici: ((m: OyunMesaji, kimden: number) => void) | null = null
let birikmis: [OyunMesaji, number][] = []
// Kurucu: oyun sürerken bir misafir koptu / geri döndü (masa ekranına).
let koltukDinleyici: ((koltuk: number, bagli: boolean) => void) | null = null

// Sekmeye özel kimlik: aynı sekmeden yeniden katılan kendi koltuğunu bulur (iki sekmeyle denerken karışmasın).
function kimligim() {
  try {
    let k = sessionStorage.getItem('mutKimlik')
    if (!k) sessionStorage.setItem('mutKimlik', (k = Math.random().toString(36).slice(2)))
    return k
  } catch {
    return Math.random().toString(36).slice(2)
  }
}

const guncelle = (yeni: Partial<MasaDurumu>) => {
  durum = { ...durum, ...yeni }
  dinleyici(durum)
}
const hata = (yazi: string) => guncelle({ asama: 'hata', hata: yazi })
const oyunaIlet = (m: OyunMesaji, kimden: number) => (oyunDinleyici ? oyunDinleyici(m, kimden) : birikmis.push([m, kimden]))

// k koltuğundakinin gözüne çevirir.
function mesajCevir(m: OyunMesaji, k: number): OyunMesaji {
  if (k % KOLTUK === 0) return m
  switch (m.tip) {
    case 'hamle': return { ...m, hamle: hamleCevir(m.hamle, k, KOLTUK), durum: durumCevir(m.durum, k) }
    case 'oyna': return { ...m, hamle: hamleCevir(m.hamle, k, KOLTUK) }
    default: return { ...m, durum: durumCevir(m.durum, k) }
  }
}

function peerKur(id?: string) {
  const p = id ? new Peer(id) : new Peer()
  p.on('error', e => {
    // Kod başkasında: kurucu yeni kodla yeniden dener.
    if (e.type === 'unavailable-id' && durum.kurucu) return void masaKur(durum.isimler[0], dinleyici)
    hata(HATA_ADI[e.type] ?? 'Bağlantı hatası: ' + e.type)
  })
  return p
}

// Kurucu: her misafire koltuğunu da bildirerek oyuncu listesini gönderir.
function yayinla() {
  misafirler.forEach((m, i) => (m.koltuk = i + 1))
  const isimler = [durum.isimler[0], ...misafirler.map(m => m.isim)]
  guncelle({ isimler })
  misafirler.forEach(m => m.conn?.send({ tip: 'masa', isimler, ben: m.koltuk } satisfies Mesaj))
}

// Kurucu: misafirin bağlantısı koptu. Beklerken koltuk boşalır; oyun sürerken koltuğu durur, yerine bot oynar.
function kopar(conn: DataConnection) {
  const x = misafirler.find(m => m.conn === conn)
  if (!x) return
  conn.close()
  if (durum.asama === 'basladi') {
    x.conn = null
    koltukDinleyici?.(x.koltuk, false)
  } else {
    misafirler = misafirler.filter(m => m !== x)
    yayinla()
  }
}

// Kurucu: merhaba diyen eski bir oyuncu mu? Aynı sekme (kimlik) ya da oyun sürerken kopmuş koltukta aynı isim.
function eskiKoltuk(isim: string, kimlik: string) {
  return misafirler.find(x => x.kimlik === kimlik) ?? (durum.asama === 'basladi' ? misafirler.find(x => !x.conn && x.isim === isim) : undefined)
}

export function masaKur(isim: string, dinle: (d: MasaDurumu) => void) {
  birak()
  dinleyici = dinle
  const kod = Array.from({ length: 4 }, () => HARFLER[Math.floor(Math.random() * HARFLER.length)]).join('')
  guncelle({ asama: 'baglaniyor', kod, isimler: [isim], ben: 0, kurucu: true, hata: undefined, ilkDurum: undefined, devam: undefined })
  peer = peerKur(ONEK + kod)
  peer.on('open', () => guncelle({ asama: 'bekleme' }))
  nabiz = window.setInterval(() => {
    misafirler.forEach(x => {
      if (!x.conn) return
      if (Date.now() - x.ses > SESSIZLIK) kopar(x.conn)
      else x.conn.send({ tip: 'nabiz' } satisfies Mesaj)
    })
  }, NABIZ)
  peer.on('connection', conn => {
    conn.on('data', veri => {
      const m = veri as Mesaj
      const ses = misafirler.find(x => x.conn === conn)
      if (ses) ses.ses = Date.now()
      if (m.tip === 'oyun') {
        const misafir = misafirler.find(x => x.conn === conn)
        if (misafir && durum.asama === 'basladi') oyunaIlet(mesajCevir(m.m, KOLTUK - misafir.koltuk), misafir.koltuk)
        return
      }
      if (m.tip !== 'merhaba') return
      // Geri dönen kendi koltuğuna oturur; eski bağlantısı (hâlâ açık görünüyorsa) atılır.
      const eski = eskiKoltuk(m.isim, m.kimlik)
      if (eski) {
        const eskiConn = eski.conn
        Object.assign(eski, { conn, kimlik: m.kimlik, ses: Date.now() })
        eskiConn?.close()
        if (durum.asama !== 'basladi') return yayinla()
        conn.send({ tip: 'masa', isimler: durum.isimler, ben: eski.koltuk } satisfies Mesaj)
        // Masa ekranı ona oyunun şimdiki halini yollar.
        return koltukDinleyici?.(eski.koltuk, true)
      }
      if (durum.asama !== 'bekleme' || misafirler.length >= KOLTUK - 1) {
        conn.send({ tip: 'dolu' } satisfies Mesaj)
        return void setTimeout(() => conn.close(), 500)
      }
      misafirler.push({ conn, isim: m.isim, koltuk: 0, kimlik: m.kimlik, ses: Date.now() })
      yayinla()
    })
    conn.on('close', () => kopar(conn))
  })
}

export function katil(kod: string, isim: string, dinle: (d: MasaDurumu) => void) {
  birak()
  dinleyici = dinle
  guncelle({ asama: 'baglaniyor', kod, isimler: [], ben: 0, kurucu: false, hata: undefined, ilkDurum: undefined, devam: undefined })
  peer = peerKur()
  peer.on('open', () => {
    // json: undefined alanlar yolda null'a dönmesin (motor undefined bekliyor).
    const conn = peer!.connect(ONEK + kod, { reliable: true, serialization: 'json' })
    kurucuyla = conn
    const zamanAsimi = setTimeout(() => {
      if (durum.asama === 'baglaniyor') hata('Masaya bağlanılamadı. Yeniden dene.')
    }, BAGLANMA_SURESI)
    let ses = Date.now()
    conn.on('open', () => {
      conn.send({ tip: 'merhaba', isim, kimlik: kimligim() } satisfies Mesaj)
      ses = Date.now()
      // Kurucu oyun sürerken koparsa ne olacağı sonraki parçada (şimdilik sadece beklerken).
      nabiz = window.setInterval(() => {
        if (Date.now() - ses > SESSIZLIK && durum.asama === 'bekleme') hata('Masa kapandı.')
        else conn.send({ tip: 'nabiz' } satisfies Mesaj)
      }, NABIZ)
    })
    conn.on('data', veri => {
      const m = veri as Mesaj
      ses = Date.now()
      clearTimeout(zamanAsimi)
      if (m.tip === 'masa') guncelle({ asama: 'bekleme', isimler: m.isimler, ben: m.ben })
      else if (m.tip === 'dolu') hata('Masa dolu ya da oyun başlamış.')
      else if (m.tip === 'oyun') {
        const o = m.m
        // İlk dağıtım oyunu başlatır (masa ekranı bu durumla açılır); oyun sürerken yeniden katılınca şimdiki hal gelir.
        if (durum.asama === 'bekleme' && (o.tip === 'dagit' || o.tip === 'durum')) guncelle({ asama: 'basladi', ilkDurum: o.durum, devam: o.tip === 'durum' })
        else if (durum.asama === 'basladi') oyunaIlet(o, 0)
      }
    })
    conn.on('close', () => {
      if (durum.asama === 'bekleme' || durum.asama === 'baglaniyor') hata('Masa kapandı.')
    })
  })
}

export function basla() {
  misafirler.forEach((m, i) => (m.koltuk = i + 1))
  guncelle({ asama: 'basladi' })
}

// Kurucu: herkese (her misafire kendi gözünden; kime verilirse sadece o koltuğa). Misafir: kurucuya (çevirmeyi kurucu yapar).
export function oyunGonder(m: OyunMesaji, kime?: number) {
  if (durum?.kurucu) {
    misafirler.forEach(x => (kime === undefined || x.koltuk === kime) && x.conn?.send({ tip: 'oyun', m: mesajCevir(m, x.koltuk) } satisfies Mesaj))
  } else kurucuyla?.send({ tip: 'oyun', m } satisfies Mesaj)
}

// Kurucu: oyun sürerken kopan / geri dönen misafir. Dinlemeye başlarken o an kopuk koltuklar da bildirilir.
export function koltuklariDinle(dinle: (koltuk: number, bagli: boolean) => void) {
  koltukDinleyici = dinle
  misafirler.forEach(x => !x.conn && dinle(x.koltuk, false))
  return () => {
    if (koltukDinleyici === dinle) koltukDinleyici = null
  }
}

export function oyunuDinle(dinle: (m: OyunMesaji, kimden: number) => void) {
  oyunDinleyici = dinle
  birikmis.splice(0).forEach(([m, k]) => dinle(m, k))
  return () => {
    if (oyunDinleyici === dinle) oyunDinleyici = null
  }
}

export function birak() {
  clearInterval(nabiz)
  peer?.destroy()
  peer = null
  misafirler = []
  kurucuyla = null
  birikmis = []
  oyunDinleyici = null
  koltukDinleyici = null
}
