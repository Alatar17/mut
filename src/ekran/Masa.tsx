import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from 'react'
import { kartBoyu, type Kart as KartTipi } from '../oyun/kart'
import { hamleGecerliMi, hamleYap, sonrakiEl, toplamPuanlar, yeniOyun, type Durum, type Hamle, type Oyuncu } from '../oyun/motor'
import { botHamlesi } from '../oyun/bot'
import { Kart } from './Kart'
import { bekle, dagitimOncesi, dagitimSirasi, GizliKartlar, kartKimligi, kartYerleri, konumOlc, UcanKart, type Konum, type Ucus } from './animasyon'
import { SAHNE_BOY, SAHNE_EN } from './Sahne'
import { CezaYigini, Deste, OrtaYigin } from './Yiginlar'

const AVUC_KART_EN = 60
const TOPLAM_EL = 10

// Botun her hamleden önce beklediği süre (ms). Kullanıcı Test menüsünde deneyip seçecek.
const BOT_HIZLARI = { Hızlı: 400, Orta: 1000, Yavaş: 2000 }
type BotHizi = keyof typeof BOT_HIZLARI

// Animasyon süreleri bu çarpanla uzar/kısalır. Kullanıcı Test menüsünde seçecek.
const ANIMASYON_HIZLARI = { Hızlı: 0.6, Orta: 1, Yavaş: 1.6 }
type AnimasyonHizi = keyof typeof ANIMASYON_HIZLARI
// Yakalamada kart eşleştiği yere indikten sonra, kartlar birlikte uçmadan önceki duraklama (ms).
const DURAKLAMALAR = { Kısa: 250, Uzun: 600 }
type Duraklama = keyof typeof DURAKLAMALAR
const SURE = { kalkma: 250, ucus: 380, dagitimAraligi: 70 }

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

// Bot oynayacağı kartı önce masaya doğru biraz kaldırır.
function rakipKartDuzeni(sira: number, adet: number, taraf: 'sol' | 'sag', duz: boolean, kalkik: boolean) {
  const kalkma = kalkik ? `translateX(${taraf === 'sol' ? 16 : -16}px) ` : ''
  return kalkma + (duz ? '' : yanYelpaze(sira, adet, taraf)) || undefined
}

// Masanın sol/sağ kenarına oturmuş oyuncu: kartlar ona dönük, dikey dizili, masanın ortası hizasında.
function Rakip({ oyuncu, koltuk, kalkik, sirada, taraf, carpan, kapali, duz, kirpik }: { oyuncu: Oyuncu; koltuk: number; kalkik: string | null; sirada: boolean; taraf: 'sol' | 'sag'; carpan: number; kapali: boolean; duz: boolean; kirpik: boolean }) {
  const avucBoyu = RAKIP_KART_EN + (oyuncu.avuc.length - 1) * (RAKIP_KART_EN - RAKIP_KART_BINME)
  return (
    <>
      <div className={`rakip-ad ${taraf}` + (sirada ? ' sirada' : '')} style={{ top: SAHNE_BOY / 2 - avucBoyu / 2 - 30 }}>{oyuncu.ad}</div>
      <div className={`rakip-avuc ${taraf}` + (kirpik ? ' kirpik' : '')} data-yer={`avuc:${koltuk}`}>
        {oyuncu.avuc.map((k, i) => (
          <div key={kartKimligi(k)} className="yan-kart" style={{ width: kartBoyu(RAKIP_KART_EN), height: RAKIP_KART_EN, transform: rakipKartDuzeni(i, oyuncu.avuc.length, taraf, duz, kalkik === kartKimligi(k)) }}>
            <Kart kart={k} genislik={RAKIP_KART_EN} kapali={kapali} />
          </div>
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

// Geliştirme sırasında kullanılan ayarlar; oyun bitince Test menüsü kalkacak.
function TestSecenegi({ ad, acik, degistir }: { ad: string; acik: boolean; degistir: (v: boolean) => void }) {
  return (
    <button className="test-satir" onClick={() => degistir(!acik)}>
      {ad} <span className={'anahtar' + (acik ? ' acik' : '')} />
    </button>
  )
}

// Bırakılan yer ekranda data-hedef ile işaretli: "orta", "mut:<sayı>", "ceza:<oyuncu>".
type Birakma = 'kabul' | 'red' | 'bekle'

// Avucumdaki kart: dokununca kalkar, sürüklenip bir yere bırakılır. Geçersizse yerine döner.
function AvucKart({ kart, sira, adet, kalkik, dokun, birak }: { kart: KartTipi; sira: number; adet: number; kalkik: boolean; dokun: () => void; birak: (hedef: string) => Birakma }) {
  const [kayma, setKayma] = useState<{ x: number; y: number } | null>(null)
  const baslangic = useRef<{ x: number; y: number; olcek: number; surukleniyor: boolean } | null>(null)

  const bas = (e: PointerEvent<HTMLDivElement>) => {
    const sahne = e.currentTarget.closest('.sahne')!
    e.currentTarget.setPointerCapture(e.pointerId)
    baslangic.current = { x: e.clientX, y: e.clientY, olcek: sahne.getBoundingClientRect().width / SAHNE_EN, surukleniyor: false }
  }
  const surukle = (e: PointerEvent<HTMLDivElement>) => {
    const b = baslangic.current
    if (!b) return
    const dx = e.clientX - b.x
    const dy = e.clientY - b.y
    if (!b.surukleniyor && Math.hypot(dx, dy) < 6) return
    b.surukleniyor = true
    setKayma({ x: dx / b.olcek, y: dy / b.olcek })
  }
  const birakildi = (e: PointerEvent<HTMLDivElement>) => {
    const b = baslangic.current
    baslangic.current = null
    if (!b) return
    if (!b.surukleniyor) return dokun()
    const hedef = document
      .elementsFromPoint(e.clientX, e.clientY)
      .map(el => el.closest<HTMLElement>('[data-hedef]'))
      .find(el => el)?.dataset.hedef
    if (hedef && birak(hedef) === 'kabul') return
    setKayma(null)
  }

  const transform = kayma
    ? `translate(${kayma.x}px, ${kayma.y}px)`
    : yelpaze(sira, adet) + (kalkik ? ' translateY(-14px)' : '')
  return (
    <div
      className={'avuc-kart' + (kayma ? ' surukleniyor' : '')}
      style={{ transform }}
      onPointerDown={bas}
      onPointerMove={surukle}
      onPointerUp={birakildi}
      onPointerCancel={() => { baslangic.current = null; setKayma(null) }}
    >
      <Kart kart={kart} genislik={AVUC_KART_EN} />
    </div>
  )
}

function Kalkan() {
  return (
    <button className="kalkan" aria-label="Kalkan">
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
  const [testAcik, setTestAcik] = useState(false)
  const [botlarOtomatik, setBotlarOtomatik] = useState(true)
  const [botKartlariKapali, setBotKartlariKapali] = useState(false)
  const [botKartlariDuz, setBotKartlariDuz] = useState(true)
  const [botKartlariKirpik, setBotKartlariKirpik] = useState(false)
  const [botHizi, setBotHizi] = useState<BotHizi>('Orta')
  const [animasyonHizi, setAnimasyonHizi] = useState<AnimasyonHizi>('Orta')
  const [duraklama, setDuraklama] = useState<Duraklama>('Kısa')
  const [kalkikKart, setKalkikKart] = useState<number | null>(null)
  // Rakibin ceza yığınına bırakılan kart: "Üstüne yığ" mı "İlerlet" mi seçilecek.
  const [cezaSecimi, setCezaSecimi] = useState<number | null>(null)

  // ---- Animasyon ----
  const masaRef = useRef<HTMLDivElement>(null)
  const gorunenRef = useRef(gorunen)
  const [gizli, setGizli] = useState<ReadonlySet<string>>(new Set())
  const [ucuslar, setUcuslar] = useState<Ucus[]>([])
  const [botKalkik, setBotKalkik] = useState<string | null>(null)
  // Animasyon sürerken yeni hamle yapılmaz.
  const [mesgul, setMesgul] = useState(true)
  const mesgulRef = useRef(true)
  const bekleyenGecis = useRef<null | { tasinan: [string, string][]; kaynak: Map<string, Konum>; gecikme: Map<string, number>; bitti: () => void }>(null)
  const carpan = ANIMASYON_HIZLARI[animasyonHizi]
  const ucusSuresi = SURE.ucus * carpan

  // Ekranı yeni duruma geçirir; yeri değişen kartlar eski yerinden yenisine uçar.
  // kaynak: bazı kartların başlangıç yeri elle verilir. sira: kartlar bu sırayla arka arkaya kalkar (dağıtım).
  const gec = (yeni: Durum, ayar: { kaynak?: Map<string, Konum>; sira?: string[] } = {}) => {
    const onceki = kartYerleri(gorunenRef.current)
    const tasinan = [...kartYerleri(yeni)].filter(([id, yer]) => onceki.get(id) !== yer)
    const kaynak = new Map(tasinan.map(([id]) => [id, ayar.kaynak?.get(id) ?? konumOlc(masaRef.current!, id, onceki.get(id) ?? 'deste')]))
    const gecikme = new Map((ayar.sira ?? []).map((id, i) => [id, i * SURE.dagitimAraligi * carpan]))
    gorunenRef.current = yeni
    setGorunen(yeni)
    if (tasinan.length === 0) return Promise.resolve()
    return new Promise<void>(bitti => {
      bekleyenGecis.current = { tasinan, kaynak, gecikme, bitti }
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
    setUcuslar(yeniUcuslar)
    const toplam = Math.max(...yeniUcuslar.map(u => u.gecikme)) + ucusSuresi
    setTimeout(() => {
      setGizli(new Set())
      setUcuslar([])
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
  const inisYeri = (eski: Durum, h: Hamle): Konum | null => {
    const n = eski.oyuncular.length
    const oynayan = eski.oyuncular[eski.sira]
    const k = oynayan.avuc[h.kart]
    const sonraki = (eski.sira + 1) % n
    const ustKart = (yigin: KartTipi[]) => yigin[yigin.length - 1] as KartTipi | undefined
    let eslesen: { kart: KartTipi | undefined; yer: string } | undefined
    if (h.tip === 'ortayaAt' && ustKart(eski.orta)?.deger === k.deger) eslesen = { kart: ustKart(eski.orta), yer: 'orta' }
    if (h.tip === 'mutEslestir') eslesen = { kart: eski.mut.find(m => m.deger === k.deger), yer: 'mut' }
    if (h.tip === 'cezaBosalt') eslesen = { kart: ustKart(oynayan.ceza), yer: `ceza:${eski.sira}` }
    if (h.tip === 'alIlerlet') eslesen = { kart: ustKart(eski.oyuncular[sonraki].ceza), yer: `ceza:${sonraki}` }
    if (!eslesen?.kart) return null
    const konum = konumOlc(masaRef.current!, kartKimligi(eslesen.kart), eslesen.yer)
    return { ...konum, x: konum.x + 8, y: konum.y + 6 }
  }

  const hamleOyna = async (h: Hamle) => {
    if (mesgulRef.current) return
    basla()
    const eski = d
    const yeni = hamleYap(eski, h)
    const k = eski.oyuncular[eski.sira].avuc[h.kart]
    const id = kartKimligi(k)
    if (eski.sira !== 0) {
      setBotKalkik(id)
      await bekle(SURE.kalkma * carpan)
    }
    // Tur bitip yeni kartlar dağıtıldıysa önce hamle, sonra dağıtım gösterilir.
    const dagitildi = yeni.asama === 'oyun' && yeni.tur !== eski.tur
    const hamleSonrasi = dagitildi ? dagitimOncesi(yeni, false) : yeni
    const inis = inisYeri(eski, h)
    if (inis) {
      // Yakalama: kart önce eşleştiği yere iner, kısa duraklar, sonra eşleşenlerle birlikte uçar.
      const kaynak = konumOlc(masaRef.current!, id, `avuc:${eski.sira}`)
      const ara = structuredClone(eski)
      ara.oyuncular[eski.sira].avuc.splice(h.kart, 1)
      gorunenRef.current = ara
      setGorunen(ara)
      setUcuslar([{ kart: k, kaynak, hedef: inis, sure: ucusSuresi, gecikme: 0, kapali: false }])
      await bekle(ucusSuresi + DURAKLAMALAR[duraklama])
      await gec(hamleSonrasi, { kaynak: new Map([[id, inis]]) })
    } else {
      await gec(hamleSonrasi)
    }
    setBotKalkik(null)
    if (dagitildi) await gec(yeni, { sira: dagitimSirasi(yeni, false) })
    bitir(yeni)
  }

  // Yeni el / yeni oyun: kartlar desteye toplanır, sonra dağıtılır.
  const topluDagit = async (yeni: Durum) => {
    basla()
    await gec(dagitimOncesi(yeni, true))
    await gec(yeni, { sira: dagitimSirasi(yeni, true) })
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
    const zamanlayici = setTimeout(() => hamleOyna(botHamlesi(d)), BOT_HIZLARI[botHizi])
    return () => clearTimeout(zamanlayici)
  }, [d, mesgul, botlarOtomatik, botHizi])

  // El bitince puan kağıdı kendiliğinden açılır.
  useEffect(() => {
    if (d.asama !== 'oyun') setPuanlarAcik(true)
  }, [d.asama])

  const oyna = (tip: Hamle['tip'], kart: number) => {
    hamleOyna({ tip, kart })
    setKalkikKart(null)
    setCezaSecimi(null)
  }

  // Bırakılan yere göre hamle; kurala aykırıysa kart sessizce avuca döner (9.2).
  const kartBirak = (kart: number, hedef: string): Birakma => {
    if (mesgul || d.asama !== 'oyun' || d.sira !== 0) return 'red'
    const [yer, deger] = hedef.split(':')
    const dene = (tip: Hamle['tip']): Birakma => {
      if (!hamleGecerliMi(d, { tip, kart })) return 'red'
      oyna(tip, kart)
      return 'kabul'
    }
    if (yer === 'orta') return dene('ortayaAt')
    if (yer === 'mut') return Number(deger) === ben.avuc[kart].deger ? dene('mutEslestir') : 'red'
    if (yer === 'ceza' && deger === '0') return dene('cezaBosalt')
    if (yer === 'ceza' && deger === '1' && hamleGecerliMi(d, { tip: 'ustuneYig', kart })) {
      setCezaSecimi(kart)
      setKalkikKart(kart)
      return 'bekle'
    }
    return 'red'
  }

  const aktifKurallar = d.carpan > 1 ? [`×${d.carpan}`] : []
  // Test menüsünde bir seçeneğe her basışta sıradaki değere geçer.
  const sonrakiSecenek = <T extends string>(secenekler: Record<T, unknown>, simdiki: T, ayarla: (v: T) => void) => {
    const adlar = Object.keys(secenekler) as T[]
    ayarla(adlar[(adlar.indexOf(simdiki) + 1) % adlar.length])
  }
  const yeniOyunBaslat = () => {
    if (mesgulRef.current) return
    setPuanlarAcik(false)
    topluDagit(yeniOyunKur())
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

      <Rakip oyuncu={soldaki} koltuk={2} kalkik={botKalkik} taraf="sol" sirada={d.asama === 'oyun' && d.sira === 2} carpan={d.carpan} kapali={botKartlariKapali} duz={botKartlariDuz} kirpik={botKartlariKirpik} />
      <Rakip oyuncu={sagdaki} koltuk={1} kalkik={botKalkik} taraf="sag" sirada={d.asama === 'oyun' && d.sira === 1} carpan={d.carpan} kapali={botKartlariKapali} duz={botKartlariDuz} kirpik={botKartlariKirpik} />

      <div className="benim-ceza">
        <CezaYigini kartlar={ben.ceza} carpan={d.carpan} puanTarafi="sol" hedef="ceza:0" />
      </div>

      <div className="benim-avuc" data-yer="avuc:0">
        {ben.avuc.map((k, i) => (
          <AvucKart
            key={`${k.renk}-${k.deger}`}
            kart={k}
            sira={i}
            adet={ben.avuc.length}
            kalkik={kalkikKart === i}
            dokun={() => setKalkikKart(kalkikKart === i ? null : i)}
            birak={hedef => kartBirak(i, hedef)}
          />
        ))}
        {elimdeIkiVar && <Kalkan />}
      </div>
      {d.asama === 'oyun' && d.sira === 0 && <div className="benim-sira" />}

      {cezaSecimi !== null && (
        <>
          <div className="secim-arka" onClick={() => { setCezaSecimi(null); setKalkikKart(null) }} />
          <div className="ceza-secimi">
            <button onClick={() => oyna('ustuneYig', cezaSecimi)}>Üstüne yığ</button>
            <button onClick={() => oyna('alIlerlet', cezaSecimi)}>İlerlet</button>
          </div>
        </>
      )}

      <button className="yuvarlak-dugme konusma" aria-label="Konuşma">
        <svg viewBox="0 0 24 24" width="22" height="22">
          <path d="M4 4h16v11H8l-4 4V4Z" fill="currentColor" />
        </svg>
      </button>

      <button className={'test-dugme' + (testAcik ? ' acik' : '')} onClick={() => setTestAcik(!testAcik)}>
        Test
      </button>
      {testAcik && (
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
          <button className="test-satir" onClick={yeniOyunBaslat}>Yeni oyun</button>
          <TestSecenegi ad="Bot kartlarını kapat" acik={botKartlariKapali} degistir={setBotKartlariKapali} />
          <TestSecenegi ad="Bot kartları yelpaze" acik={!botKartlariDuz} degistir={v => setBotKartlariDuz(!v)} />
          <TestSecenegi ad="Bot kartları kenardan taşsın" acik={botKartlariKirpik} degistir={setBotKartlariKirpik} />
        </div>
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
          yeniOyun={yeniOyunBaslat}
        />
      )}

      {ucuslar.map(u => <UcanKart key={kartKimligi(u.kart)} ucus={u} />)}
    </div>
    </GizliKartlar.Provider>
  )
}
