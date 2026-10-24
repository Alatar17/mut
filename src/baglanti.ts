// Bağlantı denemesi sayfası (baglanti.html): iki telefon PeerJS ile birbirine bağlanabiliyor mu?
// Kahve sürümünden önce Wi-Fi ve mobil veride denemek için; oyuna dokunmaz.
import Peer, { type DataConnection } from 'peerjs'

const ONEK = 'mut-deneme-'
// Karışmasın diye O/0, I/1 gibi harfler yok.
const HARFLER = 'ABCDEFGHJKLMNPRSTUVYZ'
const BAGLANMA_SURESI = 15000

const $ = (id: string) => document.getElementById(id)!
const durum = (yazi: string, tur: '' | 'iyi' | 'kotu' = '') => {
  $('durum').textContent = yazi
  $('durum').className = 'durum ' + tur
}
const kaydet = (yazi: string) => {
  const saat = new Date().toLocaleTimeString('tr-TR')
  $('kayit').insertAdjacentHTML('afterbegin', `<div>${saat} · ${yazi}</div>`)
}
const goster = (id: string, acik: boolean) => $(id).classList.toggle('gizli', !acik)

const HATA_ADI: Record<string, string> = {
  network: 'PeerJS sunucusuna ulaşılamadı (internet yok ya da sunucu engelli olabilir)',
  'server-error': 'PeerJS sunucusu hata verdi (engelli olabilir)',
  'socket-error': 'PeerJS sunucusuyla bağlantı koptu',
  'peer-unavailable': 'Bu kodla masa yok (kod yanlış ya da masa kapandı)',
  'unavailable-id': 'Kod dolu, yeniden dene',
  'browser-incompatible': 'Bu tarayıcı desteklemiyor',
  webrtc: 'Telefonlar arası bağlantı hatası',
}

let peer: Peer | null = null

function yeniPeer(id?: string) {
  durum('Sunucuya bağlanılıyor…')
  const p = id ? new Peer(id) : new Peer()
  p.on('error', e => {
    const ad = HATA_ADI[e.type] ?? e.type
    durum('Hata: ' + ad, 'kotu')
    kaydet('Hata: ' + ad)
  })
  p.on('disconnected', () => kaydet('Sunucu bağlantısı koptu (telefonlar arası bağlantı sürebilir)'))
  return p
}

// Bağlantının yolu: aynı ağ (host), internet üzerinden doğrudan (srflx/prflx) ya da aktarıcı (relay).
async function yolBul(conn: DataConnection) {
  const istat = await conn.peerConnection.getStats()
  let yerelId = ''
  istat.forEach(r => {
    if (r.type === 'candidate-pair' && r.state === 'succeeded' && (r.nominated || !yerelId)) yerelId = r.localCandidateId
  })
  const tur = istat.get(yerelId)?.candidateType as string | undefined
  if (tur === 'host') return 'aynı ağ üzerinden, doğrudan'
  if (tur === 'srflx' || tur === 'prflx') return 'internet üzerinden, doğrudan'
  if (tur === 'relay') return 'aktarıcı üzerinden'
  return 'bilinmiyor'
}

function baglantiKur(conn: DataConnection) {
  const zamanAsimi = setTimeout(() => {
    durum('Bağlanamadı: telefonlar birbirine ulaşamadı (aktarıcı gerekebilir)', 'kotu')
    kaydet('15 sn içinde bağlantı kurulamadı')
  }, BAGLANMA_SURESI)
  conn.on('open', async () => {
    clearTimeout(zamanAsimi)
    durum('Bağlandı ✓', 'iyi')
    goster('merhaba', true)
    kaydet('Bağlandı')
    setTimeout(async () => kaydet('Bağlantı yolu: ' + (await yolBul(conn))), 1000)
  })
  conn.on('data', veri => {
    const v = veri as { tip: string; t: number }
    if (v.tip === 'merhaba') {
      kaydet('👋 Merhaba geldi')
      conn.send({ tip: 'cevap', t: v.t })
    } else if (v.tip === 'cevap') {
      kaydet(`Cevap geldi: gidiş-dönüş ${Math.round(performance.now() - v.t)} ms`)
    }
  })
  conn.on('close', () => {
    durum('Bağlantı kapandı', 'kotu')
    goster('merhaba', false)
    kaydet('Bağlantı kapandı')
  })
  $('merhaba').onclick = () => {
    conn.send({ tip: 'merhaba', t: performance.now() })
    kaydet('Merhaba gönderildi')
  }
}

$('kur').onclick = () => {
  goster('secim', false)
  const kod = Array.from({ length: 4 }, () => HARFLER[Math.floor(Math.random() * HARFLER.length)]).join('')
  peer = yeniPeer(ONEK + kod)
  peer.on('open', () => {
    $('kod').textContent = kod
    goster('kod', true)
    durum('Masa kuruldu. Öbür telefonda Katıl\'a basıp bu kodu yaz.')
    kaydet('Sunucuya bağlandı, kod: ' + kod)
  })
  peer.on('connection', conn => {
    kaydet('Biri katılıyor…')
    baglantiKur(conn)
  })
}

$('katilAc').onclick = () => {
  goster('secim', false)
  goster('katilKutusu', true)
  $('kodGir').focus()
}

$('katil').onclick = () => {
  const kod = ($('kodGir') as HTMLInputElement).value.trim().toUpperCase()
  if (kod.length !== 4) return durum('Kod 4 harf olmalı', 'kotu')
  goster('katilKutusu', false)
  peer = yeniPeer()
  peer.on('open', () => {
    durum('Masaya bağlanılıyor…')
    kaydet('Sunucuya bağlandı, ' + kod + ' masasına bağlanılıyor')
    baglantiKur(peer!.connect(ONEK + kod, { reliable: true }))
  })
}
