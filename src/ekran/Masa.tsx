import { useEffect, useState } from 'react'
import { kartBoyu } from '../oyun/kart'
import { hamleYap, sonrakiEl, toplamPuanlar, yeniOyun, type Durum, type Oyuncu } from '../oyun/motor'
import { botHamlesi } from '../oyun/bot'
import { Kart } from './Kart'
import { SAHNE_BOY } from './Sahne'
import { CezaYigini, Deste, OrtaYigin } from './Yiginlar'

const AVUC_KART_EN = 60
const TOPLAM_EL = 10

// Botun her hamleden önce beklediği süre (ms). Kullanıcı Test menüsünde deneyip seçecek.
const BOT_HIZLARI = { Hızlı: 400, Orta: 1000, Yavaş: 2000 }
type BotHizi = keyof typeof BOT_HIZLARI

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

// Masanın sol/sağ kenarına oturmuş oyuncu: kartlar ona dönük, dikey dizili, masanın ortası hizasında.
function Rakip({ oyuncu, sirada, taraf, carpan, kapali, duz, kirpik }: { oyuncu: Oyuncu; sirada: boolean; taraf: 'sol' | 'sag'; carpan: number; kapali: boolean; duz: boolean; kirpik: boolean }) {
  const avucBoyu = RAKIP_KART_EN + (oyuncu.avuc.length - 1) * (RAKIP_KART_EN - RAKIP_KART_BINME)
  return (
    <>
      <div className={`rakip-ad ${taraf}` + (sirada ? ' sirada' : '')} style={{ top: SAHNE_BOY / 2 - avucBoyu / 2 - 30 }}>{oyuncu.ad}</div>
      <div className={`rakip-avuc ${taraf}` + (kirpik ? ' kirpik' : '')}>
        {oyuncu.avuc.map((k, i) => (
          <div key={i} className="yan-kart" style={{ width: kartBoyu(RAKIP_KART_EN), height: RAKIP_KART_EN, transform: duz ? undefined : yanYelpaze(i, oyuncu.avuc.length, taraf) }}>
            <Kart kart={k} genislik={RAKIP_KART_EN} kapali={kapali} />
          </div>
        ))}
      </div>
      <div className={`rakip-ceza ${taraf}`}>
        <CezaYigini kartlar={oyuncu.ceza} carpan={carpan} puanTarafi={taraf === 'sol' ? 'sag' : 'sol'} donuk={taraf} />
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
  const [d, setD] = useState(yeniOyunKur)
  const [ben, sagdaki, soldaki] = d.oyuncular
  const elimdeIkiVar = ben.avuc.some(k => k.deger === 2)
  const [puanlarAcik, setPuanlarAcik] = useState(false)
  const [testAcik, setTestAcik] = useState(false)
  const [botlarOtomatik, setBotlarOtomatik] = useState(true)
  const [botKartlariKapali, setBotKartlariKapali] = useState(false)
  const [botKartlariDuz, setBotKartlariDuz] = useState(true)
  const [botKartlariKirpik, setBotKartlariKirpik] = useState(false)
  const [botHizi, setBotHizi] = useState<BotHizi>('Orta')

  // Botlar sırası gelince biraz bekleyip rastgele geçerli bir hamle yapar.
  // Geçici (3a): sürükle-bırak gelene kadar senin koltuğunu da bot oynuyor.
  useEffect(() => {
    if (d.asama !== 'oyun' || !botlarOtomatik) return
    const zamanlayici = setTimeout(() => setD(eski => hamleYap(eski, botHamlesi(eski))), BOT_HIZLARI[botHizi])
    return () => clearTimeout(zamanlayici)
  }, [d, botlarOtomatik, botHizi])

  // El bitince puan kağıdı kendiliğinden açılır.
  useEffect(() => {
    if (d.asama !== 'oyun') setPuanlarAcik(true)
  }, [d.asama])

  const aktifKurallar = d.carpan > 1 ? [`×${d.carpan}`] : []
  const hizlar = Object.keys(BOT_HIZLARI) as BotHizi[]
  const sonrakiHiz = () => setBotHizi(hizlar[(hizlar.indexOf(botHizi) + 1) % hizlar.length])
  const yeniOyunBaslat = () => {
    setD(yeniOyunKur())
    setPuanlarAcik(false)
  }

  return (
    <div className="masa">
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

      <div className="mut-alani">
        {d.mut.map((k, i) => <Kart key={i} kart={k} genislik={56} />)}
      </div>

      <OrtaYigin kartlar={d.orta} />

      <Rakip oyuncu={soldaki} taraf="sol" sirada={d.asama === 'oyun' && d.sira === 2} carpan={d.carpan} kapali={botKartlariKapali} duz={botKartlariDuz} kirpik={botKartlariKirpik} />
      <Rakip oyuncu={sagdaki} taraf="sag" sirada={d.asama === 'oyun' && d.sira === 1} carpan={d.carpan} kapali={botKartlariKapali} duz={botKartlariDuz} kirpik={botKartlariKirpik} />

      <div className="benim-ceza">
        <CezaYigini kartlar={ben.ceza} carpan={d.carpan} puanTarafi="sol" />
      </div>

      <div className="benim-avuc">
        {ben.avuc.map((k, i) => (
          <div key={i} className="avuc-kart" style={{ transform: yelpaze(i, ben.avuc.length) }}>
            <Kart kart={k} genislik={AVUC_KART_EN} />
          </div>
        ))}
        {elimdeIkiVar && <Kalkan />}
      </div>
      {d.asama === 'oyun' && d.sira === 0 && <div className="benim-sira" />}

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
          <button className="test-satir" onClick={sonrakiHiz}>
            Bot hızı <span className="test-deger">{botHizi}</span>
          </button>
          <button className="test-satir" onClick={yeniOyunBaslat}>Yeni oyun</button>
          <TestSecenegi ad="Bot kartlarını kapat" acik={botKartlariKapali} degistir={setBotKartlariKapali} />
          <TestSecenegi ad="Bot kartları yelpaze" acik={!botKartlariDuz} degistir={v => setBotKartlariDuz(!v)} />
          <TestSecenegi ad="Bot kartları kenardan taşsın" acik={botKartlariKirpik} degistir={setBotKartlariKirpik} />
        </div>
      )}
      <Deste kalan={d.deste.length} />

      {puanlarAcik && (
        <PuanPenceresi
          d={d}
          kapat={() => setPuanlarAcik(false)}
          sonrakiEl={() => {
            setD(sonrakiEl(d))
            setPuanlarAcik(false)
          }}
          yeniOyun={yeniOyunBaslat}
        />
      )}
    </div>
  )
}
