import { kartBoyu, yiginPuani, type Kart as KartTipi } from '../oyun/kart'
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

export function OrtaYigin({ kartlar }: { kartlar: KartTipi[] }) {
  const ust = kartlar.slice(-3)
  const alttaKalan = kartlar.length - ust.length
  return (
    <div className="orta-yigin">
      <div className="yigin-govde" style={{ width: KART_EN + 28, height: kartBoyu(KART_EN) }}>
        {alttaKalan > 0 && <Kalinlik adet={alttaKalan} genislik={KART_EN} />}
        {ust.map((k, i) => (
          <div key={i} className="yigin-kart" style={{ left: i * 14 }}>
            <Kart kart={k} genislik={KART_EN} />
          </div>
        ))}
      </div>
      <span className="rozet">{kartlar.length}</span>
    </div>
  )
}

interface CezaProps {
  kartlar: KartTipi[]
  carpan: number
  puanTarafi: 'sag' | 'sol'
  // Yan oturan oyuncunun yığını ona dönük, yan durur.
  donuk?: 'sol' | 'sag'
}

export function CezaYigini({ kartlar, carpan, puanTarafi, donuk }: CezaProps) {
  const ust = kartlar[kartlar.length - 1]
  const boy = kartBoyu(KART_EN)
  const govde = (
    <div className="yigin-govde" style={{ width: KART_EN, height: boy }}>
      {ust ? (
        <>
          <Kalinlik adet={kartlar.length - 1} genislik={KART_EN} />
          <div className="yigin-kart"><Kart kart={ust} genislik={KART_EN} /></div>
        </>
      ) : (
        <div className="bos-yer" style={{ width: KART_EN, height: boy }} />
      )}
    </div>
  )
  return (
    <div className={'ceza-yigini puan-' + puanTarafi}>
      {donuk ? <div className={'yan-yigin ' + donuk} style={{ width: boy, height: KART_EN }}>{govde}</div> : govde}
      <span className="puan">{yiginPuani(kartlar) * carpan}</span>
    </div>
  )
}

export function Deste({ kalan }: { kalan: number }) {
  return (
    <div className="deste">
      <div className="yigin-govde" style={{ width: 42, height: kartBoyu(42) }}>
        <Kalinlik adet={kalan} genislik={42} />
        <div className="yigin-kart"><Kart kapali genislik={42} /></div>
      </div>
      <span className="rozet">{kalan}</span>
    </div>
  )
}
