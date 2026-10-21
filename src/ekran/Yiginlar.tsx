import { useEffect, useRef, useState } from 'react'
import { kartBoyu, yiginPuani, type Kart as KartTipi } from '../oyun/kart'
import { BOMBA_KART_EN, kartKimligi, useGizliKartlar } from './animasyon'
import { Kart } from './Kart'

const KART_EN = 56

// Altta kalan kartların kalınlığı: her 3 kart için 1 piksellik kenar, en fazla 8.
const kalinlik = (adet: number) => Math.min(8, Math.ceil(adet / 3))

function Kalinlik({ adet, genislik }: { adet: number; genislik: number }) {
  return (
    <>
      {Array.from({ length: kalinlik(adet) }, (_, i) => (
        <div key={i} className="kalinlik" style={{ width: genislik, height: kartBoyu(genislik), left: i + 1, top: i + 1 }} />
      ))}
    </>
  )
}

// Bomba yığını (6.8): sahibinin ceza yığınının yanında yanıp söner; tek kart görünür (tahta dar), rozette çıkan 10 sayısı.
// Uçuş sırasında üstteki kart gizlenince alttaki görünsün diye en üstteki iki kart çizilir.
export function BombaYigini({ kartlar, sahip, cikan }: { kartlar: KartTipi[]; sahip: number; cikan: number }) {
  return (
    <div className={`bomba bomba-${sahip}`} data-hedef={`bomba:${sahip}`} data-yer={`bomba:${sahip}`}>
      <div className="yigin-govde" style={{ width: BOMBA_KART_EN, height: kartBoyu(BOMBA_KART_EN) }}>
        {kartlar.slice(-2).map(k => (
          <div key={kartKimligi(k)} className="yigin-kart">
            <Kart kart={k} genislik={BOMBA_KART_EN} />
          </div>
        ))}
      </div>
      <span className="rozet">{cikan}</span>
    </div>
  )
}

// carpan: bomba elinde orta yığının puanı da görünür (6.8); yerine varmış kartlardan hesaplanır, değişince yanıp söner.
export function OrtaYigin({ kartlar, carpan }: { kartlar: KartTipi[]; carpan?: number }) {
  const gizliler = useGizliKartlar()
  const varanlar = kartlar.filter(k => !gizliler.has(kartKimligi(k)))
  const ust = kartlar.slice(-3)
  const alttaKalan = kartlar.length - ust.length
  return (
    <div className="orta-yigin" data-hedef="orta" data-yer="orta">
      <div className="yigin-govde" style={{ width: KART_EN + 28, height: kartBoyu(KART_EN) }}>
        {alttaKalan > 0 && <Kalinlik adet={alttaKalan} genislik={KART_EN} />}
        {ust.map((k, i) => (
          <div key={i} className="yigin-kart" style={{ left: i * 14 }}>
            <Kart kart={k} genislik={KART_EN} />
          </div>
        ))}
      </div>
      <span className="rozet">{kartlar.length}</span>
      {carpan !== undefined && (
        <span className="orta-puan">
          <Puan deger={yiginPuani(varanlar) * carpan} bos={varanlar.length === 0} />
        </span>
      )}
    </div>
  )
}

interface CezaProps {
  kartlar: KartTipi[]
  carpan: number
  puanTarafi: 'sag' | 'sol'
  // Yan oturan oyuncunun yığını ona dönük, yan durur.
  donuk?: 'sol' | 'sag'
  // Kart bırakılabilen yer işareti (bkz. Masa).
  hedef?: string
  // Üstteki kartlar arası kaydırma (piksel); Test menüsünden seçiliyor.
  aralik: number
}

// Puan değişince kısa bir an büyüyüp parlar; kimin puan yediği fark edilsin.
function Puan({ deger, bos }: { deger: number; bos: boolean }) {
  const onceki = useRef(deger)
  const [vurgu, setVurgu] = useState(0)
  useEffect(() => {
    if (onceki.current !== deger && !bos) setVurgu(v => v + 1)
    onceki.current = deger
  }, [deger, bos])
  return <span key={vurgu} className={'puan' + (vurgu ? ' vurgu' : '')}>{deger}</span>
}

// Uçuş sırasında üstteki kartlar gizlenince alttakiler görünsün diye en üstteki birkaç kart çizilir.
const CIZILEN_UST_KART = 5

// Orta yığın gibi son 3 kart kaydırılmış görünür (daha dar); alttakilerin köşe sayısı görünsün diye sola kayar (stil.css).
export function CezaYigini({ kartlar, carpan, puanTarafi, donuk, hedef, aralik }: CezaProps) {
  const gizliler = useGizliKartlar()
  // Puan, yerine varmış kartlardan hesaplanır (uçan kart inince artar).
  const varanlar = kartlar.filter(k => !gizliler.has(kartKimligi(k)))
  const boy = kartBoyu(KART_EN)
  const en = KART_EN + 2 * aralik
  const gorunen = Math.min(3, kartlar.length)
  // Kilitli dörtlü (6.9.1): aynı sayıdan dört kart art arda gelince en üstteki ters çizilir.
  const kilitli = (i: number) => i >= 3 && kartlar.slice(i - 3, i).every(k => k.deger === kartlar[i].deger)
  const govde = (
    <div className="yigin-govde" style={{ width: en, height: boy }} data-yer={hedef}>
      {kartlar.length > 0 ? (
        <>
          <Kalinlik adet={kartlar.length - gorunen} genislik={KART_EN} />
          {kartlar.slice(-CIZILEN_UST_KART).map((k, i, ust) => {
            const yukaridan = ust.length - 1 - i
            return (
              <div key={kartKimligi(k)} className={'yigin-kart' + (yukaridan > 0 ? ' alt' : '')} style={{ left: Math.max(0, gorunen - 1 - yukaridan) * aralik }}>
                <Kart kart={k} genislik={KART_EN} kapali={kilitli(kartlar.length - 1 - yukaridan)} />
              </div>
            )
          })}
        </>
      ) : (
        <div className="bos-yer" style={{ width: KART_EN, height: boy }} />
      )}
    </div>
  )
  return (
    <div className={'ceza-yigini puan-' + puanTarafi} data-hedef={hedef}>
      {donuk ? <div className={'yan-yigin ' + donuk} style={{ width: boy, height: en }}>{govde}</div> : govde}
      <Puan deger={yiginPuani(varanlar) * carpan} bos={varanlar.length === 0} />
    </div>
  )
}

export function Deste({ kalan }: { kalan: number }) {
  return (
    <div className="deste" data-yer="deste">
      <div className="yigin-govde" style={{ width: 42, height: kartBoyu(42) }}>
        <Kalinlik adet={kalan} genislik={42} />
        <div className="yigin-kart"><Kart kapali genislik={42} /></div>
      </div>
      <span className="rozet">{kalan}</span>
    </div>
  )
}
