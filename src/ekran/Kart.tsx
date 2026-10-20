import { degerYazisi, kartBoyu, kirmiziMi, renkSembolu, resimliMi, type Kart as KartTipi } from '../oyun/kart'

// Tema klasöründeki kart resimleri, "kupa-13.svg" gibi adlarla. Resmi olmayan kart kodla çizilir.
const resimler = import.meta.glob('../tema/varsayilan/kartlar/*.svg', { eager: true, query: '?url', import: 'default' }) as Record<string, string>
const resimAdresi = (k: KartTipi) => resimler[`../tema/varsayilan/kartlar/${k.renk}-${k.deger}.svg`]

interface Props {
  kart?: KartTipi
  genislik: number
  kapali?: boolean
}

export function Kart({ kart, genislik, kapali }: Props) {
  const stil = { width: genislik, height: kartBoyu(genislik), fontSize: genislik * 0.27 }
  if (kapali || !kart) return <div className="kart kart-arka" style={stil} />

  const resim = resimAdresi(kart)
  if (resim) {
    return (
      <div className="kart kart-resimli" style={stil}>
        <img src={resim} alt="" draggable={false} />
      </div>
    )
  }

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
