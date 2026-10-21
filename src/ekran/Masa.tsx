import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from 'react'
import { kartBoyu, type Kart as KartTipi } from '../oyun/kart'
import { hamleGecerliMi, hamleYap, sonraki, sonrakiEl, toplamPuanlar, yeniOyun, type Durum, type Hamle, type HamleSonucu, type Oyuncu } from '../oyun/motor'
import { akilliBotHamlesi } from '../oyun/bot'
import { karistir } from '../oyun/rastgele'
import { blokDenemesi, cezaSerisiDenemesi, kizBotDenemesi, kizDenemesi, seriDenemesi, takasDenemesi } from '../oyun/deneme'
import { Kart } from './Kart'
import { bekle, dagitimOncesi, GizliKartlar, kartKimligi, kartYerleri, konumOlc, UcanKart, type Konum, type Ucus } from './animasyon'
import { SAHNE_BOY, SAHNE_EN } from './Sahne'
import { CezaYigini, Deste, OrtaYigin } from './Yiginlar'

const AVUC_KART_EN = 60
const TOPLAM_EL = 10

// Botun her hamleden önce beklediği süre (ms). Kullanıcı Test menüsünde deneyip seçecek.
const BOT_HIZLARI = { 'Çok hızlı': 100, Hızlı: 400, Orta: 1000, Yavaş: 2000 }
type BotHizi = keyof typeof BOT_HIZLARI

// Animasyon süreleri bu çarpanla uzar/kısalır. Kullanıcı Test menüsünde seçecek.
const ANIMASYON_HIZLARI = { Hızlı: 0.6, Orta: 1, Yavaş: 1.6 }
type AnimasyonHizi = keyof typeof ANIMASYON_HIZLARI
// Yakalamada kart eşleştiği yere indikten sonra, kartlar birlikte uçmadan önceki duraklama (ms).
const DURAKLAMALAR = { Kısa: 250, Uzun: 600 }
type Duraklama = keyof typeof DURAKLAMALAR
const SURE = { kalkma: 250, ucus: 380, dagitimAraligi: 70 }
// Blok penceresi süresi (6.5.1); kahve testinde ayarlanacak.
const BLOK_SURESI = 3000
// Kurulu kalkan bloklamadan önce parladığı görülsün diye kısa bekleme (ms).
const KALKAN_GECIKMESI = 300
// Kız ile çekmede hedef avucun karılma süresi ve botun ters kartlardan seçmeden önce düşünme süresi (ms).
const KARMA_SURESI = 700
const BOT_SECIM_SURESI = 500

// Blok penceresi açıkken normal bir hamle (kart atmak) kabul sayılır: önce kabul uygulanır, hamle ondan sonraki
// durumda yapılır. Kabulden sonra sıra o oyuncuda değilse hamle geçersiz olur (6.6 bozulmasın).
const KABUL: Hamle = { tip: 'kabul', kart: -1 }
const kabulSonrasi = (d: Durum, h: Hamle) => (d.blok && h.tip !== 'blok' && h.tip !== 'kabul' ? hamleYap(d, KABUL) : d)

// 0 = sen (alt), 1 = sağdaki (sıradaki), 2 = soldaki
const yeniOyunKur = () => yeniOyun({ isimler: ['Sen', 'Bot B', 'Bot C'], toplamEl: TOPLAM_EL })
const RAKIP_KART_EN = 56

// Elde tutulan kartlar gibi hafif yelpaze: kenardaki kartlar biraz döner ve alçalır.
function yelpaze(sira: number, adet: number) {
  const fark = sira - (adet - 1) / 2
  return `translateY(${Math.round(fark * fark * 2)}px) rotate(${fark * 4}deg)`
}

// Aynı yelpaze, yan oturan oyuncu için: kenardaki kartlar oyuncuya doğru çekilir.
function yanYelpaze(sira: number, adet: number, taraf: 'sol' | 'sag') {
  const fark = sira - (adet - 1) / 2
  const kayma = Math.round(fark * fark * 2)
  return taraf === 'sol'
    ? `translateX(${-kayma}px) rotate(${fark * 4}deg)`
    : `translateX(${kayma}px) rotate(${-fark * 4}deg)`
}

const RAKIP_KART_BINME = 20

// Bırakılan yer ekranda data-hedef ile işaretli: "orta", "mut:<sayı>", "ceza:<oyuncu>", "avuc:<oyuncu>" (8 ile takas, Kız ile çekme).
// red: kart sessizce avuca döner (Mut kuralına takıldıysa eşleşen Mut kartı sallanır).
type Birakma = 'kabul' | 'red' | 'bekle'

// Mut kuralına takılan hamlede eşleşen Mut kartı "olmaz" der gibi hafif sallanır. Sadece kartı bırakanın ekranında.
function salla(el: Element) {
  const x = [0, -6, 6, -4, 3, 0].map(p => ({ transform: `translateX(${p}px)` }))
  el.animate(x, { duration: 400 })
}

// Kız ile çekmede hedefin avucu karılır (9.2): kartlar iki kez ortada toplanıp yeniden açılır.
function avucuKar(masa: HTMLElement, koltuk: number, sure: number) {
  const avuc = masa.querySelector<HTMLElement>(`[data-yer="avuc:${koltuk}"]`)
  if (!avuc) return Promise.resolve()
  const kartlar = [...avuc.querySelectorAll<HTMLElement>(':scope > .avuc-kart, :scope > .yan-kart')]
  return Promise.all(
    kartlar.map((el, i) => {
      const dx = avuc.offsetWidth / 2 - (el.offsetLeft + el.offsetWidth / 2)
      const dy = avuc.offsetHeight / 2 - (el.offsetTop + el.offsetHeight / 2)
      const acik = el.style.transform || 'translate(0px, 0px)'
      const toplu = `translate(${dx}px, ${dy}px) rotate(${(i % 2 ? 1 : -1) * (4 + i * 2)}deg) ${acik}`
      const x = [acik, toplu, acik, toplu, acik].map(transform => ({ transform }))
      return el.animate(x, { duration: sure, easing: 'ease-in-out' }).finished.catch(() => {})
    }),
  )
}

// Bot oynayacağı kartı önce masaya doğru biraz kaldırır.
function rakipKartDuzeni(sira: number, adet: number, taraf: 'sol' | 'sag', duz: boolean, kalkik: boolean) {
  const kalkma = kalkik ? `translateX(${taraf === 'sol' ? 16 : -16}px) ` : ''
  return kalkma + (duz ? '' : yanYelpaze(sira, adet, taraf)) || undefined
}

// Masanın sol/sağ kenarına oturmuş oyuncu: kartlar ona dönük, dikey dizili, masanın ortası hizasında.
// sec: Kız ile çekmede ters kartlardan birine dokunmak.
function Rakip({ oyuncu, koltuk, kalkik, birak, sec, sirada, taraf, carpan, kapali, duz, kirpik }: { oyuncu: Oyuncu; koltuk: number; kalkik: string | null; birak: (kart: number, hedef: string) => Birakma; sec: (kart: number) => void; sirada: boolean; taraf: 'sol' | 'sag'; carpan: number; kapali: boolean; duz: boolean; kirpik: boolean }) {
  const avucBoyu = RAKIP_KART_EN + (oyuncu.avuc.length - 1) * (RAKIP_KART_EN - RAKIP_KART_BINME)
  return (
    <>
      {/* İsim etiketi de takas hedefi: avucu boşken bırakılacak yer kalmasın. */}
      <div className={`rakip-ad ${taraf}` + (sirada ? ' sirada' : '')} style={{ top: SAHNE_BOY / 2 - avucBoyu / 2 - 30 }} data-hedef={`avuc:${koltuk}`}>{oyuncu.ad}</div>
      <div className={`rakip-avuc ${taraf}` + (kirpik ? ' kirpik' : '')} data-yer={`avuc:${koltuk}`} data-hedef={`avuc:${koltuk}`}>
        {oyuncu.avuc.map((k, i) => (
          <RakipKart
            key={kartKimligi(k)}
            kart={k}
            kapali={kapali}
            transform={rakipKartDuzeni(i, oyuncu.avuc.length, taraf, duz, kalkik === kartKimligi(k))}
            birak={hedef => birak(i, hedef)}
            dokun={() => sec(i)}
          />
        ))}
      </div>
      <div className={`rakip-ceza ${taraf}`}>
        <CezaYigini kartlar={oyuncu.ceza} carpan={carpan} puanTarafi={taraf === 'sol' ? 'sag' : 'sol'} donuk={taraf} hedef={`ceza:${koltuk}`} />
      </div>
    </>
  )
}

// Toplamı en az olan kazanır; eşitlikte berabere (Bölüm 8).
function kazananYazisi(d: Durum) {
  const toplam = toplamPuanlar(d)
  const enAz = Math.min(...toplam)
  const kazananlar = d.oyuncular.filter((_, i) => toplam[i] === enAz)
  return kazananlar.length > 1 ? 'Berabere' : `Kazanan: ${kazananlar[0].ad}`
}

function PuanPenceresi({ d, kapat, sonrakiEl, yeniOyun }: { d: Durum; kapat: () => void; sonrakiEl: () => void; yeniOyun: () => void }) {
  return (
    <div className="pencere-arka" onClick={kapat}>
      <div className="puan-kagidi" onClick={e => e.stopPropagation()}>
        <table>
          <thead>
            <tr><th />{d.oyuncular.map(o => <th key={o.ad}>{o.ad}</th>)}</tr>
          </thead>
          <tbody>
            {d.puanKagidi.map((satir, i) => (
              <tr key={i}><td>{i + 1}. el</td>{satir.map((p, j) => <td key={j}>{p}</td>)}</tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td>Toplam</td>
              {toplamPuanlar(d).map((p, j) => <td key={j}>{p}</td>)}
            </tr>
          </tfoot>
        </table>
        {d.asama === 'elSonu' && <button className="kagit-dugme" onClick={sonrakiEl}>Sonraki el</button>}
        {d.asama === 'oyunSonu' && (
          <>
            <div className="kazanan">{kazananYazisi(d)}</div>
            <button className="kagit-dugme" onClick={yeniOyun}>Yeni oyun</button>
          </>
        )}
      </div>
    </div>
  )
}

// Test menüsü ayarları tarayıcıda saklanır, sayfa yenilenince (F5) aynen gelir.
function useKayitli<T>(ad: string, ilk: T) {
  const [deger, setDeger] = useState<T>(() => {
    try {
      const kayit = localStorage.getItem('mut.test.' + ad)
      return kayit === null ? ilk : JSON.parse(kayit)
    } catch {
      return ilk
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem('mut.test.' + ad, JSON.stringify(deger))
    } catch {}
  }, [deger])
  return [deger, setDeger] as const
}

// Geliştirme sırasında kullanılan ayarlar; oyun bitince Test menüsü kalkacak.
function TestSecenegi({ ad, acik, degistir }: { ad: string; acik: boolean; degistir: (v: boolean) => void }) {
  return (
    <button className="test-satir" onClick={() => degistir(!acik)}>
      {ad} <span className={'anahtar' + (acik ? ' acik' : '')} />
    </button>
  )
}


// Kart sürükleme: basılı tutup kaydırınca kart parmağı izler, bırakınca altındaki yer (data-hedef) bulunur.
// Kabul edilmezse kart yerine döner. Kaydırmadan bırakmak dokunmadır. tut: sürükleme başlayınca (Kız seçiminde
// tutulan kart seçilmiş olur).
type Birak = (hedef: string) => Birakma
function useSurukle(dokun: () => void, birak: Birak, tut?: () => void) {
  const [kayma, setKayma] = useState<{ x: number; y: number } | null>(null)
  const baslangic = useRef<{ x: number; y: number; olcek: number; surukleniyor: boolean } | null>(null)
  const olaylar = {
    onPointerDown: (e: PointerEvent<HTMLDivElement>) => {
      const sahne = e.currentTarget.closest('.sahne')!
      e.currentTarget.setPointerCapture(e.pointerId)
      baslangic.current = { x: e.clientX, y: e.clientY, olcek: sahne.getBoundingClientRect().width / SAHNE_EN, surukleniyor: false }
    },
    onPointerMove: (e: PointerEvent<HTMLDivElement>) => {
      const b = baslangic.current
      if (!b) return
      const dx = e.clientX - b.x
      const dy = e.clientY - b.y
      if (!b.surukleniyor && Math.hypot(dx, dy) < 6) return
      if (!b.surukleniyor) tut?.()
      b.surukleniyor = true
      setKayma({ x: dx / b.olcek, y: dy / b.olcek })
    },
    onPointerUp: (e: PointerEvent<HTMLDivElement>) => {
      const b = baslangic.current
      baslangic.current = null
      if (!b) return
      if (!b.surukleniyor) return dokun()
      // Sürüklenen kartın kendisi (ve içinde durduğu avuç) hedef sayılmaz.
      const kart = e.currentTarget
      const hedef = document
        .elementsFromPoint(e.clientX, e.clientY)
        .filter(el => !kart.contains(el))
        .map(el => el.closest<HTMLElement>('[data-hedef]'))
        .find(el => el)?.dataset.hedef
      if (hedef && birak(hedef) === 'kabul') return
      setKayma(null)
    },
    onPointerCancel: () => {
      baslangic.current = null
      setKayma(null)
    },
  }
  return { kayma, olaylar }
}

// Avucumdaki kart: dokununca kalkar, sürüklenip bir yere bırakılır.
function AvucKart({ kart, sira, adet, kalkik, kapali, dokun, birak, tut }: { kart: KartTipi; sira: number; adet: number; kalkik: boolean; kapali: boolean; dokun: () => void; birak: Birak; tut?: () => void }) {
  const { kayma, olaylar } = useSurukle(dokun, birak, tut)
  const transform = kayma
    ? `translate(${kayma.x}px, ${kayma.y}px)`
    : yelpaze(sira, adet) + (kalkik ? ' translateY(-14px)' : '')
  return (
    <div className={'avuc-kart' + (kayma ? ' surukleniyor' : '')} style={{ transform }} {...olaylar}>
      <Kart kart={kart} genislik={AVUC_KART_EN} kapali={kapali} />
    </div>
  )
}

// Botun avucundaki kart. "Botlar kendi oynasın" kapalıyken sürüklenip oynanabilir.
// dokun: Kız seçiminde kartı kaldırır (seçim yokken bir şey yapmaz); sürüklemeye başlamak da kaldırır.
function RakipKart({ kart, transform, kapali, birak, dokun }: { kart: KartTipi; transform?: string; kapali: boolean; birak: Birak; dokun: () => void }) {
  const { kayma, olaylar } = useSurukle(dokun, birak, dokun)
  return (
    <div
      className={'yan-kart' + (kayma ? ' surukleniyor' : '')}
      style={{ width: kartBoyu(RAKIP_KART_EN), height: RAKIP_KART_EN, transform: kayma ? `translate(${kayma.x}px, ${kayma.y}px)` : transform }}
      {...olaylar}
    >
      <Kart kart={kart} genislik={RAKIP_KART_EN} kapali={kapali} />
    </div>
  )
}

// Avucumda 2 varsa durur. Bana saldırı gelince (blok penceresi) yanıp söner, dokununca blok yapılır.
// Saldırı yokken dokununca kurulur / sökülür (6.5.1): kurulu kalkan saldırı gelince 2'yi kendiliğinden oynar.
function Kalkan({ aktif, kurulu, bas }: { aktif: boolean; kurulu: boolean; bas: () => void }) {
  return (
    <button className={'kalkan' + (aktif ? ' aktif' : '') + (kurulu ? ' kurulu' : '')} aria-label="Kalkan" onClick={bas}>
      <svg viewBox="0 0 24 24" width="26" height="26">
        <path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Z" fill="currentColor" />
      </svg>
    </button>
  )
}

export function Masa() {
  // d: oyunun gerçek durumu. gorunen: ekranda çizilen durum (animasyon sürerken d'nin gerisinde kalır).
  const [d, setD] = useState(yeniOyunKur)
  const [gorunen, setGorunen] = useState(() => dagitimOncesi(d, true))
  const [ben, sagdaki, soldaki] = gorunen.oyuncular
  const elimdeIkiVar = ben.avuc.some(k => k.deger === 2)
  const [puanlarAcik, setPuanlarAcik] = useState(false)
  // Sağ alttaki geliştirme menüleri: Test (ayarlar) ve Dene (hazır kurulmuş eller); aynı anda biri açık.
  const [menu, setMenu] = useState<'test' | 'dene' | null>(null)
  const [botlarOtomatik, setBotlarOtomatik] = useKayitli('botlarOtomatik', true)
  const [botKartlariKapali, setBotKartlariKapali] = useKayitli('botKartlariKapali', false)
  const [botKartlariDuz, setBotKartlariDuz] = useKayitli('botKartlariDuz', true)
  const [botKartlariKirpik, setBotKartlariKirpik] = useKayitli('botKartlariKirpik', false)
  const [botHizi, setBotHizi] = useKayitli<BotHizi>('botHizi', 'Orta')
  const [animasyonHizi, setAnimasyonHizi] = useKayitli<AnimasyonHizi>('animasyonHizi', 'Orta')
  const [duraklama, setDuraklama] = useKayitli<Duraklama>('duraklama', 'Kısa')
  const [kalkikKart, setKalkikKart] = useState<number | null>(null)
  // Önceden kurulmuş kalkan (otomatik blok). Sadece benim ekranımda görünür.
  const [kalkanKurulu, setKalkanKurulu] = useState(false)
  // Rakibin ceza yığınına bırakılan kart: "Ekle" mi "İlerlet" mi seçilecek.
  const [cezaSecimi, setCezaSecimi] = useState<{ kart: number; yigin: number } | null>(null)
  // Kız ile çekme: avucu ters dönmüş (karılmış) oyuncu ve kullanıcının seçimini bekleyen çekme
  // (ceken: kartı alacak oyuncu; kaldir: dokunulan ters kartı kaldırır; al: avuca sürüklenen kartla seçimi bitirir).
  const [ters, setTers] = useState<number | null>(null)
  const secimRef = useRef<{ ceken: number; kaldir: (kart: number) => void; al: (kart: number) => void } | null>(null)
  // Çekilen kartın uçuşa başlayacağı yer (bırakıldığı ya da bottaysa kalktığı yer).
  const cekmeKaynak = useRef<Konum | undefined>(undefined)
  const sec = (koltuk: number, kart: number) => {
    if (ters === koltuk) secimRef.current?.kaldir(kart)
  }

  // ---- Animasyon ----
  const masaRef = useRef<HTMLDivElement>(null)
  const gorunenRef = useRef(gorunen)
  const [gizli, setGizli] = useState<ReadonlySet<string>>(new Set())
  const [ucuslar, setUcuslar] = useState<Ucus[]>([])
  const [botKalkik, setBotKalkik] = useState<string | null>(null)
  // Animasyon sürerken yeni hamle yapılmaz.
  const [mesgul, setMesgul] = useState(true)
  const mesgulRef = useRef(true)
  const bekleyenGecis = useRef<null | { tasinan: [string, string][]; kaynak: Map<string, Konum>; gecikme: Map<string, number>; ekUcus?: Ucus; bitti: () => void }>(null)
  const carpan = ANIMASYON_HIZLARI[animasyonHizi]
  const ucusSuresi = SURE.ucus * carpan

  // Ekranı yeni duruma geçirir; yeri değişen kartlar eski yerinden yenisine uçar.
  // kaynak: bazı kartların başlangıç yeri elle verilir. sira: kartlar bu sırayla arka arkaya kalkar (dağıtım).
  // ekUcus: ölçülmeden verilen ek uçuş (yakalamada kartın eşleştiği yere inişi); bitince ekranda kalır.
  const gec = (yeni: Durum, ayar: { kaynak?: Map<string, Konum>; sira?: string[]; ekUcus?: Ucus } = {}) => {
    const onceki = kartYerleri(gorunenRef.current)
    const tasinan = [...kartYerleri(yeni)].filter(([id, yer]) => onceki.get(id) !== yer)
    const kaynak = new Map(tasinan.map(([id]) => [id, ayar.kaynak?.get(id) ?? konumOlc(masaRef.current!, id, onceki.get(id) ?? 'deste')]))
    const gecikme = new Map((ayar.sira ?? []).map((id, i) => [id, i * SURE.dagitimAraligi * carpan]))
    gorunenRef.current = yeni
    setGorunen(yeni)
    if (tasinan.length === 0 && !ayar.ekUcus) return Promise.resolve()
    return new Promise<void>(bitti => {
      bekleyenGecis.current = { tasinan, kaynak, gecikme, ekUcus: ayar.ekUcus, bitti }
      setGizli(new Set(tasinan.map(([id]) => id)))
    })
  }

  // Yeni durum çizildikten sonra (ekrana basılmadan önce) kartların hedef yerleri ölçülür, uçuş başlar.
  useLayoutEffect(() => {
    const b = bekleyenGecis.current
    if (!b) return
    bekleyenGecis.current = null
    const kartlar = new Map([...gorunen.oyuncular.flatMap(o => [...o.avuc, ...o.ceza]), ...gorunen.orta, ...gorunen.mut, ...gorunen.deste].map(k => [kartKimligi(k), k]))
    const yeniUcuslar = b.tasinan.map(([id, yer]) => ({
      kart: kartlar.get(id)!,
      kaynak: b.kaynak.get(id)!,
      hedef: konumOlc(masaRef.current!, id, yer),
      sure: ucusSuresi,
      gecikme: b.gecikme.get(id) ?? 0,
      // Desteye giden ve desteden dağıtılan kartlar kapalı uçar; Mut kartları açık iner.
      kapali: yer === 'deste' || (b.gecikme.has(id) && yer !== 'mut') || (botKartlariKapali && yer.startsWith('avuc:') && yer !== 'avuc:0'),
    }))
    if (b.ekUcus) yeniUcuslar.unshift(b.ekUcus)
    setUcuslar(yeniUcuslar)
    const toplam = Math.max(...yeniUcuslar.map(u => u.gecikme + u.sure))
    setTimeout(() => {
      setGizli(new Set())
      if (!b.ekUcus) setUcuslar([])
      b.bitti()
    }, toplam)
  }, [gorunen])

  const basla = () => {
    mesgulRef.current = true
    setMesgul(true)
  }
  const bitir = (yeni: Durum) => {
    setD(yeni)
    mesgulRef.current = false
    setMesgul(false)
  }

  // Yakalamada oynanan kartın önce indiği yer: eşleştiği kartın biraz kaydırılmış üstü.
  // Eşleşmeyi motor bildirir (sonHamle); ekran sadece yerini ölçer.
  const inisYeri = (s: HamleSonucu): Konum | null => {
    const eslesen = s.eslesen[s.eslesen.length - 1]
    if (!eslesen || !s.nereden) return null
    const konum = konumOlc(masaRef.current!, kartKimligi(eslesen), s.nereden)
    return { ...konum, x: konum.x + 8, y: konum.y + 6 }
  }

  // elle: kartı kullanıcı sürükledi (botun kart kaldırma adımı atlanır).
  const hamleOyna = async (h: Hamle, elle: boolean) => {
    if (mesgulRef.current) return
    const taban = kabulSonrasi(d, h)
    if (!hamleGecerliMi(taban, h)) return
    // Kurulu kalkan benim bir sonraki hamleme kadar kalır (blok da hamle sayılır, 2 gider).
    if (taban.sira === 0 && h.tip !== 'kabul') setKalkanKurulu(false)
    const eski = d
    basla()
    let yeni: Durum | undefined
    try {
      // Çekmede hangi kartın alınacağı ekranda seçilir; hamle ondan sonra yapılır.
      yeni = hamleYap(taban, h.tip === 'cek' ? { ...h, cekilen: await cekilecekKart(taban, h, elle) } : h)
      await hamleyiGoster(eski, yeni, elle)
      bitir(yeni)
    } catch (hata) {
      // Animasyonda beklenmedik bir hata oyunu kilitlemesin: ekran gerçek duruma döner, oyun sürer.
      console.error(hata)
      yeni ??= hamleYap(taban, h)
      gorunenRef.current = yeni
      setGorunen(yeni)
      setUcuslar([])
      setGizli(new Set())
      setBotKalkik(null)
      setTers(null)
      secimRef.current = null
      bitir(yeni)
    }
  }

  // Kız ile çekme (9.2): Kız ortaya düşer, hedefin avucu ters döner ve gerçekten karılır. Çeken ters kartlara
  // dokunup kaldırır (fikrini değiştirebilir), birini kendi avucuna sürükleyince alır; başka yere bırakırsa kart
  // geri döner. Bot da önce bir kartı kaldırıp düşünür, bazen başkasına geçer. Süre yok.
  // Dönen: çekilen kartın hedefin karılmamış avucundaki sırası (motora verilir).
  const cekilecekKart = async (taban: Durum, h: Hamle, elle: boolean) => {
    const ceken = taban.sira
    const hedef = h.hedef!
    const kiz = taban.oyuncular[ceken].avuc[h.kart]
    if (!elle) {
      setBotKalkik(kartKimligi(kiz))
      await bekle(SURE.kalkma * carpan)
    }
    const ara = structuredClone(taban)
    ara.oyuncular[ceken].avuc.splice(h.kart, 1)
    ara.orta.push(kiz)
    await gec(ara)
    setBotKalkik(null)
    if (hedef === 0) setKalkikKart(null)
    // Kartlar ters dönmüşken sıraları gerçekten karılır: dokunulan yerdeki kart gerçekten o kart olur.
    const karisik = structuredClone(ara)
    const avuc = karistir(karisik.oyuncular[hedef].avuc, { tohum: Math.floor(Math.random() * 2 ** 31) })
    setTers(hedef)
    await gec(karisik)
    await avucuKar(masaRef.current!, hedef, KARMA_SURESI * carpan)
    const kaldir = (i: number) => (hedef === 0 ? setKalkikKart(i) : setBotKalkik(kartKimligi(avuc[i])))
    let sira: number
    if (ceken === 0 || !botlarOtomatik) {
      sira = await new Promise<number>(al => (secimRef.current = { ceken, kaldir, al }))
    } else {
      sira = Math.floor(Math.random() * avuc.length)
      kaldir(sira)
      await bekle(BOT_SECIM_SURESI * carpan)
      if (avuc.length > 1 && Math.random() < 0.5) {
        sira = (sira + 1 + Math.floor(Math.random() * (avuc.length - 1))) % avuc.length
        kaldir(sira)
        await bekle(BOT_SECIM_SURESI * carpan)
      }
      cekmeKaynak.current = konumOlc(masaRef.current!, kartKimligi(avuc[sira]), `avuc:${hedef}`)
    }
    if (hedef === 0) setKalkikKart(null)
    else setBotKalkik(null)
    const secilen = kartKimligi(avuc[sira])
    return taban.oyuncular[hedef].avuc.findIndex(k => kartKimligi(k) === secilen)
  }

  // Çekmede ters kart bırakıldı: çekenin avucuna (ya da isim etiketine) bırakıldıysa alınır, değilse geri döner.
  const cekmeBirak = (koltuk: number, kart: number, hedef: string): Birakma => {
    const s = secimRef.current
    if (!s || hedef !== `avuc:${s.ceken}`) return 'red'
    cekmeKaynak.current = konumOlc(masaRef.current!, kartKimligi(gorunenRef.current.oyuncular[koltuk].avuc[kart]), `avuc:${koltuk}`)
    secimRef.current = null
    s.al(kart)
    return 'kabul'
  }

  const hamleyiGoster = async (eski: Durum, yeni: Durum, elle: boolean) => {
    // Tur bitip yeni kartlar dağıtıldıysa önce hamle, sonra dağıtım gösterilir.
    const dagitildi = yeni.asama === 'oyun' && yeni.tur !== eski.tur
    const hamleSonrasi = dagitildi ? dagitimOncesi(yeni, false) : yeni
    // Blokta kabul: kart oynanmaz (sonHamle yok).
    if (yeni.sonHamle) await kartiGoster(eski, yeni.sonHamle, hamleSonrasi, elle)
    else await gec(hamleSonrasi)
    if (dagitildi) await gec(yeni, { sira: yeni.dagitim.map(kartKimligi) })
  }

  const kartiGoster = async (eski: Durum, sonuc: HamleSonucu, hamleSonrasi: Durum, elle: boolean) => {
    const k = sonuc.kart
    const id = kartKimligi(k)
    // Oynanan kart avuçtan çıkmış, başka hiçbir şey değişmemiş ara durum.
    const kartsiz = () => {
      const ara = structuredClone(eski)
      const avuc = ara.oyuncular[sonuc.oyuncu].avuc
      avuc.splice(avuc.findIndex(x => kartKimligi(x) === id), 1)
      return ara
    }
    if (sonuc.cekme) {
      // Çekme: Kız ortada, kart seçildi (cekilecekKart). Çekilen kart bırakıldığı yerden çekene uçar;
      // hedefin avucu eski sırasına döner (ters dururken), sonra açılır.
      const kaynak = cekmeKaynak.current
      cekmeKaynak.current = undefined
      await gec(hamleSonrasi, kaynak ? { kaynak: new Map([[kartKimligi(sonuc.cekme.kart), kaynak]]) } : {})
      setTers(null)
      return
    }
    if (!elle) {
      setBotKalkik(id)
      await bekle(SURE.kalkma * carpan)
    }
    const inis = inisYeri(sonuc)
    if (sonuc.takas !== undefined) {
      // Takas: önce 8 ortaya düşer, sonra iki avuç yer değiştirir.
      const ara = kartsiz()
      ara.orta.push(k)
      await gec(ara)
      await gec(hamleSonrasi)
    } else if (inis) {
      // Yakalama: kart önce eşleştiği yere iner, kısa duraklar, sonra eşleşenlerle birlikte uçar.
      const kaynak = konumOlc(masaRef.current!, id, `avuc:${sonuc.oyuncu}`)
      await gec(kartsiz(), { ekUcus: { kart: k, kaynak, hedef: inis, sure: ucusSuresi, gecikme: 0, kapali: false } })
      await bekle(DURAKLAMALAR[duraklama])
      await gec(hamleSonrasi, { kaynak: new Map([[id, inis]]) })
    } else {
      await gec(hamleSonrasi)
    }
    setBotKalkik(null)
  }

  // Yeni el / yeni oyun: kartlar desteye toplanır, sonra dağıtılır.
  const topluDagit = async (yeni: Durum) => {
    basla()
    await gec(dagitimOncesi(yeni, true))
    await gec(yeni, { sira: yeni.dagitim.map(kartKimligi) })
    bitir(yeni)
  }

  // Oyun açılınca ilk dağıtım.
  const ilkDagitim = useRef(false)
  useEffect(() => {
    if (ilkDagitim.current) return
    ilkDagitim.current = true
    topluDagit(d)
  }, [])

  // Botlar sırası gelince biraz bekleyip rastgele geçerli bir hamle yapar. Benim kartlarımı hep ben oynarım.
  useEffect(() => {
    if (mesgul || d.asama !== 'oyun' || d.sira === 0 || !botlarOtomatik) return
    const zamanlayici = setTimeout(() => hamleOyna(akilliBotHamlesi(d), false), BOT_HIZLARI[botHizi])
    return () => clearTimeout(zamanlayici)
  }, [d, mesgul, botlarOtomatik, botHizi])

  // Blok penceresi: hedef ben isem (ya da botları ben oynuyorsam) süre bitince kendiliğinden kabul edilir.
  // Bot hedefse ve botlar kendi oynuyorsa bot hemen karar verir (yukarıdaki bot hamlesi).
  // Kalkanım kuruluysa kısa bir an parlayıp kendiliğinden bloklar.
  const blokBende = !!d.blok && !mesgul && (d.blok.hedef === 0 || !botlarOtomatik)
  useEffect(() => {
    if (!blokBende) return
    const otomatik = d.blok!.hedef === 0 && kalkanKurulu
    const zamanlayici = otomatik
      ? setTimeout(() => hamleOyna({ tip: 'blok', kart: d.oyuncular[0].avuc.findIndex(k => k.deger === 2) }, true), KALKAN_GECIKMESI)
      : setTimeout(() => hamleOyna({ tip: 'kabul', kart: -1 }, true), BLOK_SURESI)
    return () => clearTimeout(zamanlayici)
  }, [d, blokBende, kalkanKurulu])
  // Avucumda 2 kalmayınca kalkan da kalkar. Avucum takasla değişince de (6.5.1); kaldırılmış kart da iner.
  useEffect(() => {
    if (!d.oyuncular[0].avuc.some(k => k.deger === 2)) setKalkanKurulu(false)
    if (d.sonHamle?.takas === 0) {
      setKalkanKurulu(false)
      setKalkikKart(null)
    }
  }, [d])

  // Durum değişince (biri oynadı, botlar açıldı) açık kalan "Ekle / İlerlet" seçimi geçersizdir.
  useEffect(() => {
    setCezaSecimi(null)
  }, [d, botlarOtomatik])
  // Yeni tur/el dağıtılınca kaldırılmış kart, avuçtaki yeni karta geçmesin.
  useEffect(() => {
    setKalkikKart(null)
  }, [d.tur, d.el])

  // El bitince puan kağıdı kendiliğinden açılır.
  useEffect(() => {
    if (d.asama !== 'oyun') setPuanlarAcik(true)
  }, [d.asama])

  const oyna = (h: Hamle) => {
    hamleOyna(h, true)
    setKalkikKart(null)
    setCezaSecimi(null)
  }

  // Bırakılan yere göre hamle; kurala aykırıysa kart sessizce avuca döner (9.2).
  // Sırası gelen oyuncunun kartı oynanır; botlar kendi oynuyorsa sadece benim kartlarım.
  const kartBirak = (oyuncu: number, kart: number, hedef: string): Birakma => {
    if (ters === oyuncu) return cekmeBirak(oyuncu, kart, hedef)
    if (mesgul || d.asama !== 'oyun' || (oyuncu !== 0 && botlarOtomatik)) return 'red'
    const [yer, deger] = hedef.split(':')
    const dene = (tip: Hamle['tip'], hedef?: number): Birakma => {
      const h = { tip, kart, hedef }
      if (!hamleGecerliMi(kabulSonrasi(d, h), h)) return 'red'
      oyna(h)
      return 'kabul'
    }
    // Blok penceresinde 2 kendi ceza yığınına bırakılınca blok yapılır (kalkana basmakla aynı).
    if (d.blok?.hedef === oyuncu && yer === 'ceza' && Number(deger) === oyuncu && d.oyuncular[oyuncu].avuc[kart].deger === 2)
      return dene('blok')
    // Pencerede başka kart atmak kabul sayılır; kurallara kabulden sonraki durumdan bakılır.
    const t = kabulSonrasi(d, { tip: 'ortayaAt', kart })
    if (t.sira !== oyuncu || d.blok && d.blok.hedef !== oyuncu) return 'red'
    const siradaki = sonraki(t, oyuncu)
    if (yer === 'orta') {
      // Mut kartlarıyla eşleşen kart ortaya atılamaz: neden olmadığını eşleşen Mut kartı sallanarak gösterir.
      const deger = t.oyuncular[oyuncu].avuc[kart].deger
      if (!hamleGecerliMi(t, { tip: 'ortayaAt', kart }) && t.mut.some(m => m.deger === deger)) {
        masaRef.current!.querySelectorAll(`[data-hedef="mut:${deger}"]`).forEach(salla)
        return 'red'
      }
      return dene('ortayaAt')
    }
    // 8'i bir avucun üstüne bırakmak takas, Kız'ı bırakmak çekme (ortaya bırakmak normal oyun).
    if (yer === 'avuc') return dene(t.oyuncular[oyuncu].avuc[kart].deger === 12 ? 'cek' : 'takas', Number(deger))
    if (yer === 'mut') return Number(deger) === t.oyuncular[oyuncu].avuc[kart].deger ? dene('mutEslestir') : 'red'
    if (yer === 'ceza' && Number(deger) === oyuncu) return dene('cezaBosalt')
    // Sıradakine iki seçenek var (ekle / ilerlet); diğer rakiplere sadece eklenir.
    if (yer === 'ceza' && Number(deger) === siradaki && hamleGecerliMi(t, { tip: 'alIlerlet', kart })) {
      setCezaSecimi({ kart, yigin: siradaki })
      if (oyuncu === 0) setKalkikKart(kart)
      return 'bekle'
    }
    if (yer === 'ceza') return dene('ekle', Number(deger))
    return 'red'
  }

  const aktifKurallar = d.carpan > 1 ? [`×${d.carpan}`] : []
  // Test menüsünde bir seçeneğe her basışta sıradaki değere geçer.
  const sonrakiSecenek = <T extends string>(secenekler: Record<T, unknown>, simdiki: T, ayarla: (v: T) => void) => {
    const adlar = Object.keys(secenekler) as T[]
    ayarla(adlar[(adlar.indexOf(simdiki) + 1) % adlar.length])
  }
  // deneme: Test menüsündeki "… dene" düğmeleri için kartları hazır dizer.
  const yeniOyunBaslat = (deneme?: (d: Durum) => Durum) => {
    if (mesgulRef.current) return
    setPuanlarAcik(false)
    const yeni = yeniOyunKur()
    topluDagit(deneme ? deneme(yeni) : yeni)
  }

  return (
    <GizliKartlar.Provider value={gizli}>
    <div className="masa" ref={masaRef}>
      <button className="yuvarlak-dugme puan-dugme" aria-label="Puanlar" onClick={() => setPuanlarAcik(true)}>
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path d="M6 3h12v18H6z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <path d="M9 8h6M9 12h6M9 16h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      <div className="kurallar">
        {aktifKurallar.map(k => <span key={k} className="kural">{k}</span>)}
      </div>

      <div className="el-tur">
        <span>{d.el}/{d.toplamEl}</span>
        <span>{d.tur}. tur</span>
      </div>

      <div className="mut-alani" data-yer="mut">
        {gorunen.mut.map(k => <div key={kartKimligi(k)} data-hedef={`mut:${k.deger}`}><Kart kart={k} genislik={56} /></div>)}
      </div>

      <OrtaYigin kartlar={gorunen.orta} />

      <Rakip oyuncu={soldaki} koltuk={2} kalkik={botKalkik} birak={(kart, hedef) => kartBirak(2, kart, hedef)} sec={kart => sec(2, kart)} taraf="sol" sirada={d.asama === 'oyun' && d.sira === 2} carpan={d.carpan} kapali={botKartlariKapali || ters === 2} duz={botKartlariDuz} kirpik={botKartlariKirpik} />
      <Rakip oyuncu={sagdaki} koltuk={1} kalkik={botKalkik} birak={(kart, hedef) => kartBirak(1, kart, hedef)} sec={kart => sec(1, kart)} taraf="sag" sirada={d.asama === 'oyun' && d.sira === 1} carpan={d.carpan} kapali={botKartlariKapali || ters === 1} duz={botKartlariDuz} kirpik={botKartlariKirpik} />

      <div className="benim-ceza">
        <CezaYigini kartlar={ben.ceza} carpan={d.carpan} puanTarafi="sol" hedef="ceza:0" />
      </div>

      <div className="benim-avuc" data-yer="avuc:0" data-hedef="avuc:0">
        {ben.avuc.map((k, i) => (
          <AvucKart
            key={`${k.renk}-${k.deger}`}
            kart={k}
            sira={i}
            adet={ben.avuc.length}
            kalkik={kalkikKart === i}
            kapali={ters === 0}
            dokun={() => (ters === 0 ? sec(0, i) : setKalkikKart(kalkikKart === i ? null : i))}
            tut={() => sec(0, i)}
            birak={hedef => kartBirak(0, i, hedef)}
          />
        ))}
        {elimdeIkiVar && (
          <Kalkan
            aktif={blokBende && d.blok!.hedef === 0}
            kurulu={kalkanKurulu}
            bas={() =>
              blokBende && d.blok!.hedef === 0
                ? oyna({ tip: 'blok', kart: d.oyuncular[0].avuc.findIndex(k => k.deger === 2) })
                : setKalkanKurulu(!kalkanKurulu)
            }
          />
        )}
      </div>
      {d.asama === 'oyun' && d.sira === 0 && !d.blok && <div className="benim-sira" />}
      {blokBende && (
        <div className="blok-penceresi" key={d.oyuncular[d.blok!.hedef].ceza.length + '-' + d.blok!.gonderen}>
          <div className="blok-sure" style={{ animationDuration: `${BLOK_SURESI}ms` }} />
          <button onClick={() => oyna({ tip: 'kabul', kart: -1 })}>
            Kabul{d.blok!.hedef !== 0 && ` (${d.oyuncular[d.blok!.hedef].ad})`}
          </button>
        </div>
      )}

      {cezaSecimi !== null && (
        <>
          <div className="secim-arka" onClick={() => { setCezaSecimi(null); setKalkikKart(null) }} />
          <div className={`ceza-secimi yigin-${cezaSecimi.yigin}`}>
            <button onClick={() => oyna({ tip: 'ekle', kart: cezaSecimi.kart, hedef: cezaSecimi.yigin })}>Ekle</button>
            <button onClick={() => oyna({ tip: 'alIlerlet', kart: cezaSecimi.kart })}>İlerlet</button>
          </div>
        </>
      )}

      <button className="yuvarlak-dugme konusma" aria-label="Konuşma">
        <svg viewBox="0 0 24 24" width="22" height="22">
          <path d="M4 4h16v11H8l-4 4V4Z" fill="currentColor" />
        </svg>
      </button>

      <button className={'test-dugme dene-dugme' + (menu === 'dene' ? ' acik' : '')} onClick={() => setMenu(menu === 'dene' ? null : 'dene')}>
        Dene
      </button>
      <button className={'test-dugme' + (menu === 'test' ? ' acik' : '')} onClick={() => setMenu(menu === 'test' ? null : 'test')}>
        Test
      </button>
      {menu && <div className="test-arka" onClick={() => setMenu(null)} />}
      {menu === 'dene' && (
        <div className="test-panel dene-panel">
          {([['Yeni oyun', undefined], ['Seri dene', seriDenemesi], ['Ceza serisi dene', cezaSerisiDenemesi], ['Blok dene', blokDenemesi], ['8 dene', takasDenemesi], ['Kız dene', kizDenemesi], ['Bot Kız dene', kizBotDenemesi]] as const).map(([ad, deneme]) => (
            <button key={ad} className="test-satir" onClick={() => { setMenu(null); yeniOyunBaslat(deneme) }}>{ad}</button>
          ))}
        </div>
      )}
      {menu === 'test' && (
        <div className="test-panel">
          <TestSecenegi ad="Botlar kendi oynasın" acik={botlarOtomatik} degistir={setBotlarOtomatik} />
          <button className="test-satir" onClick={() => sonrakiSecenek(BOT_HIZLARI, botHizi, setBotHizi)}>
            Bot hızı <span className="test-deger">{botHizi}</span>
          </button>
          <button className="test-satir" onClick={() => sonrakiSecenek(ANIMASYON_HIZLARI, animasyonHizi, setAnimasyonHizi)}>
            Animasyon hızı <span className="test-deger">{animasyonHizi}</span>
          </button>
          <button className="test-satir" onClick={() => sonrakiSecenek(DURAKLAMALAR, duraklama, setDuraklama)}>
            Yakalamada duraklama <span className="test-deger">{duraklama}</span>
          </button>
          <TestSecenegi ad="Bot kartlarını kapat" acik={botKartlariKapali} degistir={setBotKartlariKapali} />
          <TestSecenegi ad="Bot kartları yelpaze" acik={!botKartlariDuz} degistir={v => setBotKartlariDuz(!v)} />
          <TestSecenegi ad="Bot kartları kenardan taşsın" acik={botKartlariKirpik} degistir={setBotKartlariKirpik} />        </div>
      )}
      <Deste kalan={gorunen.deste.length} />

      {puanlarAcik && (
        <PuanPenceresi
          d={d}
          kapat={() => setPuanlarAcik(false)}
          sonrakiEl={() => {
            if (mesgulRef.current) return
            setPuanlarAcik(false)
            topluDagit(sonrakiEl(d))
          }}
          yeniOyun={() => yeniOyunBaslat()}
        />
      )}

      {ucuslar.map(u => <UcanKart key={kartKimligi(u.kart)} ucus={u} />)}
    </div>
    </GizliKartlar.Provider>
  )
}
