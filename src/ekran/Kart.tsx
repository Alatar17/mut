import { degerYazisi, kirmiziMi, renkSembolu, resimliMi, type Kart as KartTipi } from '../oyun/kart'

interface Props {
  kart?: KartTipi
  genislik: number
  kapali?: boolean
}

// Kodla çizilen klasik iskambil kartı. Tema resimleri gelince burası resim gösterecek.
export function Kart({ kart, genislik, kapali }: Props) {
  const stil = { width: genislik, height: Math.round(genislik * 1.4), fontSize: genislik * 0.27 }
  if (kapali || !kart) return <div className="kart kart-arka" style={stil} />

  const sembol = renkSembolu(kart.renk)
  const yazi = degerYazisi(kart.deger)
  const sinif = 'kart ' + (kirmiziMi(kart.renk) ? 'kirmizi' : 'siyah')

  if (genislik < 40) {
    return (
      <div className={sinif + ' kucuk'} style={stil}>
        <span>{yazi}</span>
        <span>{sembol}</span>
      </div>
    )
  }

  return (
    <div className={sinif} style={stil}>
      <span className="kose">{yazi}<br />{sembol}</span>
      <span className={resimliMi(kart.deger) ? 'orta-sembol resimli' : 'orta-sembol'}>
        {resimliMi(kart.deger) ? yazi : sembol}
      </span>
      <span className="kose ters">{yazi}<br />{sembol}</span>
    </div>
  )
}
