import { useState } from 'react'
import { ornekDurum, type OyuncuDurumu } from '../ornekDurum'
import { Kart } from './Kart'
import { CezaYigini, Deste, OrtaYigin } from './Yiginlar'

const AVUC_KART_EN = 60
const RAKIP_KART_EN = 60

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

// Masanın sol/sağ kenarına oturmuş oyuncu: kartlar ona dönük, dikey dizili.
function Rakip({ oyuncu, sirada, taraf, carpan, kapali, duz, kirpik }: { oyuncu: OyuncuDurumu; sirada: boolean; taraf: 'sol' | 'sag'; carpan: number; kapali: boolean; duz: boolean; kirpik: boolean }) {
  return (
    <>
      <div className={`rakip-ad ${taraf}` + (sirada ? ' sirada' : '')}>{oyuncu.ad}</div>
      <div className={`rakip-avuc ${taraf}` + (kirpik ? ' kirpik' : '')}>
        {oyuncu.avuc.map((k, i) => (
          <div key={i} className="yan-kart" style={{ width: Math.round(RAKIP_KART_EN * 1.4), height: RAKIP_KART_EN, transform: duz ? undefined : yanYelpaze(i, oyuncu.avuc.length, taraf) }}>
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

function PuanPenceresi({ kapat }: { kapat: () => void }) {
  const d = ornekDurum
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
              {d.oyuncular.map((_, j) => <td key={j}>{d.puanKagidi.reduce((t, s) => t + s[j], 0)}</td>)}
            </tr>
          </tfoot>
        </table>
      </div>
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
  const d = ornekDurum
  const [ben, sagdaki, soldaki] = d.oyuncular
  const elimdeIkiVar = ben.avuc.some(k => k.deger === 2)
  const [puanlarAcik, setPuanlarAcik] = useState(false)
  const [botlarOtomatik, setBotlarOtomatik] = useState(true)
  const [botKartlariKapali, setBotKartlariKapali] = useState(false)
  // Geçici karşılaştırma: açıkken bot kartları düz, kapalıyken yelpaze.
  const [botKartlariDuz, setBotKartlariDuz] = useState(true)
  // Geçici karşılaştırma: açıkken bot kartları benimki gibi ekran kenarından kırpılır.
  const [botKartlariKirpik, setBotKartlariKirpik] = useState(false)

  return (
    <div className="masa">
      <button className="yuvarlak-dugme puan-dugme" aria-label="Puanlar" onClick={() => setPuanlarAcik(true)}>
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path d="M6 3h12v18H6z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <path d="M9 8h6M9 12h6M9 16h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      <div className="kurallar">
        {d.aktifKurallar.map(k => <span key={k} className="kural">{k}</span>)}
      </div>

      <div className="el-tur">
        <span>{d.el}/{d.toplamEl}</span>
        <span>{d.tur}. tur</span>
      </div>

      <div className="mut-alani">
        {d.mut.map((k, i) => <Kart key={i} kart={k} genislik={56} />)}
      </div>

      <OrtaYigin kartlar={d.orta} />

      <Rakip oyuncu={soldaki} taraf="sol" sirada={d.siradaki === 2} carpan={d.carpan} kapali={botKartlariKapali} duz={botKartlariDuz} kirpik={botKartlariKirpik} />
      <Rakip oyuncu={sagdaki} taraf="sag" sirada={d.siradaki === 1} carpan={d.carpan} kapali={botKartlariKapali} duz={botKartlariDuz} kirpik={botKartlariKirpik} />

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
      {d.siradaki === 0 && <div className="benim-sira" />}

      <button className="yuvarlak-dugme konusma" aria-label="Konuşma">
        <svg viewBox="0 0 24 24" width="22" height="22">
          <path d="M4 4h16v11H8l-4 4V4Z" fill="currentColor" />
        </svg>
      </button>

      <button className={'test-dugme bir-dugme' + (botKartlariDuz ? ' acik' : '')} onClick={() => setBotKartlariDuz(!botKartlariDuz)}>
        1
      </button>
      <button className={'test-dugme iki-dugme' + (botKartlariKirpik ? ' acik' : '')} onClick={() => setBotKartlariKirpik(!botKartlariKirpik)}>
        2
      </button>
      <button className={'test-dugme kapat-dugme' + (botKartlariKapali ? ' acik' : '')} onClick={() => setBotKartlariKapali(!botKartlariKapali)}>
        Kapat
      </button>
      <button className={'test-dugme botlar-dugme' + (botlarOtomatik ? ' acik' : '')} onClick={() => setBotlarOtomatik(!botlarOtomatik)}>
        Botlar
      </button>
      <Deste kalan={d.desteKalan} />

      {puanlarAcik && <PuanPenceresi kapat={() => setPuanlarAcik(false)} />}
    </div>
  )
}
