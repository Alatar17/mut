// Kahve sürümü: telefonlar arası masa (PeerJS). Kurucu masayı açar (4 harfli kod), diğerleri kodla katılır.
// Kurucunun telefonu merkezdir: herkes ona bağlanır, oyuncu listesini o dağıtır. Koltuk 0 = kurucu.
import Peer, { type DataConnection } from 'peerjs'

const ONEK = 'mut-masa-'
// Karışmasın diye O/0, I/1 gibi harfler yok (bağlantı denemesiyle aynı).
const HARFLER = 'ABCDEFGHJKLMNPRSTUVYZ'
const BAGLANMA_SURESI = 15000
export const KOLTUK = 3

export interface MasaDurumu {
  asama: 'baglaniyor' | 'bekleme' | 'basladi' | 'hata'
  kod: string
  isimler: string[] // koltuk sırasıyla oturanlar (boş koltuk yok, sona eklenir)
  ben: number
  kurucu: boolean
  hata?: string
}

type Mesaj =
  | { tip: 'merhaba'; isim: string }
  | { tip: 'masa'; isimler: string[]; ben: number }
  | { tip: 'basla' }
  | { tip: 'dolu' }

const HATA_ADI: Record<string, string> = {
  network: 'Sunucuya ulaşılamadı. İnternet açık mı?',
  'server-error': 'Sunucu hata verdi, biraz sonra yeniden dene.',
  'socket-error': 'Sunucuyla bağlantı koptu.',
  'peer-unavailable': 'Bu kodla masa yok. Kodu kontrol et.',
  'browser-incompatible': 'Bu tarayıcı desteklemiyor.',
  webrtc: 'Telefonlar birbirine bağlanamadı.',
}

let peer: Peer | null = null
let misafirler: { conn: DataConnection; isim: string }[] = []
let durum: MasaDurumu
let dinleyici: (d: MasaDurumu) => void = () => {}

const guncelle = (yeni: Partial<MasaDurumu>) => {
  durum = { ...durum, ...yeni }
  dinleyici(durum)
}
const hata = (yazi: string) => guncelle({ asama: 'hata', hata: yazi })

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
  const isimler = [durum.isimler[0], ...misafirler.map(m => m.isim)]
  guncelle({ isimler })
  misafirler.forEach((m, i) => m.conn.send({ tip: 'masa', isimler, ben: i + 1 } satisfies Mesaj))
}

export function masaKur(isim: string, dinle: (d: MasaDurumu) => void) {
  birak()
  dinleyici = dinle
  const kod = Array.from({ length: 4 }, () => HARFLER[Math.floor(Math.random() * HARFLER.length)]).join('')
  guncelle({ asama: 'baglaniyor', kod, isimler: [isim], ben: 0, kurucu: true, hata: undefined })
  peer = peerKur(ONEK + kod)
  peer.on('open', () => guncelle({ asama: 'bekleme' }))
  peer.on('connection', conn => {
    conn.on('data', veri => {
      const m = veri as Mesaj
      if (m.tip !== 'merhaba') return
      if (durum.asama !== 'bekleme' || misafirler.length >= KOLTUK - 1) {
        conn.send({ tip: 'dolu' } satisfies Mesaj)
        return void setTimeout(() => conn.close(), 500)
      }
      misafirler.push({ conn, isim: m.isim })
      yayinla()
    })
    conn.on('close', () => {
      const once = misafirler.length
      misafirler = misafirler.filter(m => m.conn !== conn)
      if (misafirler.length !== once && durum.asama === 'bekleme') yayinla()
    })
  })
}

export function katil(kod: string, isim: string, dinle: (d: MasaDurumu) => void) {
  birak()
  dinleyici = dinle
  guncelle({ asama: 'baglaniyor', kod, isimler: [], ben: 0, kurucu: false, hata: undefined })
  peer = peerKur()
  peer.on('open', () => {
    const conn = peer!.connect(ONEK + kod, { reliable: true })
    const zamanAsimi = setTimeout(() => {
      if (durum.asama === 'baglaniyor') hata('Masaya bağlanılamadı. Yeniden dene.')
    }, BAGLANMA_SURESI)
    conn.on('open', () => conn.send({ tip: 'merhaba', isim } satisfies Mesaj))
    conn.on('data', veri => {
      const m = veri as Mesaj
      clearTimeout(zamanAsimi)
      if (m.tip === 'masa') guncelle({ asama: 'bekleme', isimler: m.isimler, ben: m.ben })
      else if (m.tip === 'basla') guncelle({ asama: 'basladi' })
      else if (m.tip === 'dolu') hata('Masa dolu ya da oyun başlamış.')
    })
    conn.on('close', () => {
      if (durum.asama === 'bekleme' || durum.asama === 'baglaniyor') hata('Masa kapandı.')
    })
  })
}

export function basla() {
  misafirler.forEach(m => m.conn.send({ tip: 'basla' } satisfies Mesaj))
  guncelle({ asama: 'basladi' })
}

export function birak() {
  peer?.destroy()
  peer = null
  misafirler = []
}
