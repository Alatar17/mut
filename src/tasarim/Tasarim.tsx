import { useState, type CSSProperties } from 'react'
import { kart, kartBoyu, type Deger, type Kart as KartTipi, type Renk } from '../oyun/kart'
import { Kart as SimdikiKart } from '../ekran/Kart'
import { Ikon, Isaret, type IkonAdi } from './sekiller'

// Kart tasarımı deneme sayfası (oyunun dışında): tarzlar yan yana, gerçek boyda ve oyundaki gibi üst üste.

type Tarz = 'Şimdiki' | 'Sade' | 'Klasik' | 'Dar'
const TARZLAR: Tarz[] = ['Şimdiki', 'Sade', 'Klasik', 'Dar']
const BOYUTLAR = { '%110': 1.1, '%115': 1.15 }
type Boyut = keyof typeof BOYUTLAR

const YAZI: Partial<Record<Deger, string>> = { 1: 'A', 11: 'J', 12: 'Q', 13: 'K' }
const yazi = (d: Deger) => YAZI[d] ?? String(d)

// Elde çalışan güçler (deneme: hepsi birden açılıp kapanır).
interface El { bomba: boolean; kral: boolean; serbest: boolean; eksi: boolean; carpan: number }

// Kartın üstünde görünecek güç ikonu. mut: kart Mut kartlarında. acilisAvucta: avuçtaki 3 / Vale / As de ikon gösterir.
function gucIkonu(k: KartTipi, el: El, mut: boolean, acilisAvucta: boolean): IkonAdi | null {
  switch (k.deger) {
    case 2: return 'kalkan'
    case 8: return 'takas'
    case 12: return 'miknatis'
    case 10: return el.bomba ? 'bomba' : null
    case 13: return el.kral ? 'tac' : null
    case 3: return el.serbest && (mut || acilisAvucta) ? 'hedef' : null
    case 11: return el.carpan > 1 && (mut || acilisAvucta) ? 'carpan' : null
    case 1: return el.eksi && (mut || acilisAvucta) ? 'eksi' : null
    default: return null
  }
}

// Klasik tarzda ortadaki işaretlerin yeri (0–1, sütun / satır).
const PIPLER: Record<number, [number, number][]> = {
  2: [[0.5, 0], [0.5, 1]],
  3: [[0.5, 0], [0.5, 0.5], [0.5, 1]],
  4: [[0, 0], [1, 0], [0, 1], [1, 1]],
  5: [[0, 0], [1, 0], [0.5, 0.5], [0, 1], [1, 1]],
  6: [[0, 0], [1, 0], [0, 0.5], [1, 0.5], [0, 1], [1, 1]],
  7: [[0, 0], [1, 0], [0.5, 0.25], [0, 0.5], [1, 0.5], [0, 1], [1, 1]],
  8: [[0, 0], [1, 0], [0.5, 0.25], [0, 0.5], [1, 0.5], [0.5, 0.75], [0, 1], [1, 1]],
  9: [[0, 0], [1, 0], [0, 0.33], [1, 0.33], [0.5, 0.5], [0, 0.67], [1, 0.67], [0, 1], [1, 1]],
  10: [[0, 0], [1, 0], [0.5, 0.17], [0, 0.33], [1, 0.33], [0, 0.67], [1, 0.67], [0.5, 0.83], [0, 1], [1, 1]],
}

function TasarimKart({ k, en, tarz, ikon, carpan, kapali }: { k: KartTipi; en: number; tarz: Tarz; ikon: IkonAdi | null; carpan: number; kapali?: boolean }) {
  if (tarz === 'Şimdiki') return <SimdikiKart kart={k} genislik={en} kapali={kapali} ucan />
  const stil: CSSProperties = { width: en, height: kartBoyu(en), fontSize: en / 10 }
  const sinif = `tk t-${tarz.toLowerCase()} r-${k.renk}`
  if (kapali) return <div className={sinif + ' arka'} style={stil}>{tarz === 'Sade' && <span className="arka-harf">M</span>}</div>
  const resimli = k.deger >= 11
  // Köşede işaretin yerine güç ikonu (Mut'ta işaret kuralı etkilemiyor).
  const kose = ikon ? <span className="kose-ikon guc"><Ikon ad={ikon} carpan={carpan} /></span> : <span className="kose-isaret"><Isaret renk={k.renk} /></span>
  const sayi = <span className={'kose-sayi' + (k.deger === 10 ? ' iki' : '')}>{yazi(k.deger)}</span>
  return (
    <div className={sinif} style={stil}>
      <span className="kose">{sayi}{kose}</span>
      {tarz === 'Klasik' && <span className="kose alt">{sayi}{kose}</span>}
      {tarz === 'Sade' && (
        resimli ? (
          <span className="plaka"><span className="plaka-harf">{yazi(k.deger)}</span><Isaret renk={k.renk} boy="2.2em" /></span>
        ) : (
          <span className={'orta' + (ikon ? ' guc' : '')}>{ikon ? <Ikon ad={ikon} carpan={carpan} /> : <Isaret renk={k.renk} />}</span>
        )
      )}
      {tarz === 'Klasik' && (
        resimli ? (
          <span className="cerceve"><span className="cerceve-harf">{yazi(k.deger)}</span><Isaret renk={k.renk} boy="2em" /></span>
        ) : k.deger === 1 ? (
          <span className="as-isaret"><Isaret renk={k.renk} /></span>
        ) : (
          <span className="pipler">
            {PIPLER[k.deger].map(([x, y], i) => (
              <span key={i} className="pip" style={{ left: `${x * 100}%`, top: `${y * 100}%`, transform: `translate(-50%, -50%)${y > 0.5 ? ' rotate(180deg)' : ''}` }}>
                <Isaret renk={k.renk} />
              </span>
            ))}
          </span>
        )
      )}
      {tarz === 'Dar' && <span className={'buyuk' + (ikon ? ' guc' : '')}>{ikon ? <Ikon ad={ikon} carpan={carpan} /> : <Isaret renk={k.renk} />}</span>}
    </div>
  )
}

const r: Renk[] = ['maca', 'kupa', 'karo', 'sinek']
const TUM: KartTipi[] = ([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] as Deger[]).map((d, i) => kart(d, r[i % 4]))
const AVUC: KartTipi[] = [kart(2, 'kupa'), kart(5, 'sinek'), kart(10, 'karo'), kart(13, 'maca'), kart(3, 'sinek'), kart(12, 'kupa')]
const CEZA: KartTipi[] = [kart(4, 'maca'), kart(4, 'karo'), kart(10, 'sinek'), kart(2, 'kupa'), kart(13, 'karo'), kart(11, 'maca'), kart(9, 'kupa')]
const MUT: KartTipi[] = [kart(3, 'kupa'), kart(10, 'maca'), kart(11, 'karo'), kart(1, 'sinek')]
const BUYUK: KartTipi[] = [kart(5, 'kupa'), kart(2, 'maca'), kart(10, 'karo'), kart(13, 'sinek'), kart(12, 'kupa'), kart(3, 'karo')]

function Secici<T extends string>({ ad, secenekler, deger, sec }: { ad: string; secenekler: readonly T[]; deger: T; sec: (t: T) => void }) {
  return (
    <div className="secici">
      <span>{ad}</span>
      {secenekler.map(s => <button key={s} className={s === deger ? 'secili' : ''} onClick={() => sec(s)}>{s}</button>)}
    </div>
  )
}

export function Tasarim() {
  const [tarz, setTarz] = useState<Tarz>('Sade')
  const [boyut, setBoyut] = useState<Boyut>('%110')
  const [guc, setGuc] = useState<'Açık' | 'Kapalı'>('Açık')
  const [acilis, setAcilis] = useState<'Sadece Mut' | 'Avuçta da'>('Sadece Mut')
  const o = BOYUTLAR[boyut]
  const el: El = guc === 'Açık' ? { bomba: true, kral: true, serbest: true, eksi: true, carpan: 2 } : { bomba: false, kral: false, serbest: false, eksi: false, carpan: 1 }
  const ciz = (k: KartTipi, en: number, mut = false) => (
    <TasarimKart k={k} en={Math.round(en * o)} tarz={tarz} ikon={gucIkonu(k, el, mut, acilis === 'Avuçta da')} carpan={el.carpan} />
  )
  const elEn = 60
  const yiginEn = 56
  return (
    <div className="sayfa">
      <div className="ust">
        <Secici ad="Tarz" secenekler={TARZLAR} deger={tarz} sec={setTarz} />
        <Secici ad="Güçler" secenekler={['Açık', 'Kapalı'] as const} deger={guc} sec={setGuc} />
        <Secici ad="3 / Vale / As ikonu" secenekler={['Sadece Mut', 'Avuçta da'] as const} deger={acilis} sec={setAcilis} />
        <Secici ad="Kart boyutu" secenekler={Object.keys(BOYUTLAR) as Boyut[]} deger={boyut} sec={setBoyut} />
      </div>

      <h2>Avuç (oyundaki gibi üst üste)</h2>
      <div className="avuc">{AVUC.map((k, i) => <div key={i} className="avuc-yer">{ciz(k, elEn)}</div>)}</div>

      <h2>Ceza yığını (10 px aralık: alttaki kartlardan sadece sol şerit görünür)</h2>
      <div className="ceza" style={{ width: Math.round(yiginEn * o) + (CEZA.length - 1) * 10, height: kartBoyu(Math.round(yiginEn * o)) }}>
        {CEZA.map((k, i) => <div key={i} className="ceza-yer" style={{ left: i * 10 }}>{ciz(k, yiginEn)}</div>)}
      </div>

      <h2>Mut kartları</h2>
      <div className="sira">{MUT.map((k, i) => <div key={i}>{ciz(k, yiginEn, true)}</div>)}</div>

      <h2>Bütün değerler</h2>
      <div className="sira">{TUM.map((k, i) => <div key={i}>{ciz(k, elEn)}</div>)}</div>

      <h2>Büyük (ayrıntı için)</h2>
      <div className="sira">
        {BUYUK.map((k, i) => <div key={i}>{ciz(k, 130)}</div>)}
        <TasarimKart k={BUYUK[0]} en={Math.round(130 * o)} tarz={tarz} ikon={null} carpan={1} kapali />
      </div>
    </div>
  )
}
