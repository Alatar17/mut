import { kartKimligi, useGizliKartlar } from './animasyon'
import { degerYazisi, kartBoyu, kirmiziMi, renkSembolu, resimliMi, type Kart as KartTipi } from '../oyun/kart'

interface Props {
  kart?: KartTipi
  genislik: number
  kapali?: boolean
  // Masanın üstünde uçan kopya: ölçülmez, gizlenmez.
  ucan?: boolean
}

// Kodla çizilen klasik iskambil kartı. Tema resimleri gelince burası resim gösterecek.
export function Kart({ kart, genislik, kapali, ucan }: Props) {
  const gizliler = useGizliKartlar()
  const kimlik = kart && !ucan ? kartKimligi(kart) : undefined
  const stil = {
    width: genislik,
    height: kartBoyu(genislik),
    fontSize: genislik * 0.27,
    visibility: kimlik && gizliler.has(kimlik) ? ('hidden' as const) : undefined,
  }
  if (kapali || !kart) return <div className="kart kart-arka" style={stil} data-kart={kimlik} />

  const sembol = renkSembolu(kart.renk)
  const yazi = degerYazisi(kart.deger)
  const sinif = 'kart ' + (kirmiziMi(kart.renk) ? 'kirmizi' : 'siyah')

  if (genislik < 40) {
    return (
      <div className={sinif + ' kucuk'} style={stil} data-kart={kimlik}>
        <span>{yazi}</span>
        <span>{sembol}</span>
      </div>
    )
  }

  return (
    <div className={sinif} style={stil} data-kart={kimlik}>
      <span className="kose">{yazi}<br />{sembol}</span>
      <span className={resimliMi(kart.deger) ? 'orta-sembol resimli' : 'orta-sembol'}>
        {resimliMi(kart.deger) ? yazi : sembol}
      </span>
      <span className="kose ters">{yazi}<br />{sembol}</span>
    </div>
  )
}
