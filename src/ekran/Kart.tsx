import { kartKimligi, useGizliKartlar } from './animasyon'
import { Isaret } from './Isaret'
import { degerYazisi, kartBoyu, kirmiziMi, resimliMi, type Kart as KartTipi } from '../oyun/kart'

interface Props {
  kart?: KartTipi
  genislik: number
  kapali?: boolean
  // Masanın üstünde uçan kopya: ölçülmez, gizlenmez.
  ucan?: boolean
}

// Kodla çizilen klasik iskambil kartı; işaretler SVG, yazı oyunla gelen yazı tipi (her cihazda aynı görünür).
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

  const yazi = degerYazisi(kart.deger)
  const sinif = 'kart ' + (kirmiziMi(kart.renk) ? 'kirmizi' : 'siyah')

  if (genislik < 40) {
    return (
      <div className={sinif + ' kucuk'} style={stil} data-kart={kimlik}>
        <span>{yazi}</span>
        <Isaret renk={kart.renk} />
      </div>
    )
  }

  // Vale / Kız / Papaz: ortası Görünüş → "J/Q/K" ayarına göre (masa sınıfı jqk-*): sayılı kart gibi ya da çerçeveli.
  const resimli = resimliMi(kart.deger)
  return (
    <div className={sinif + (resimli ? ' resimli' : '')} style={stil} data-kart={kimlik}>
      <span className="kose">{yazi}<Isaret renk={kart.renk} /></span>
      {resimli && <span className="yuz-cerceve" />}
      <span className="orta-sembol"><Isaret renk={kart.renk} /></span>
      <span className="kose ters">{yazi}<Isaret renk={kart.renk} /></span>
    </div>
  )
}
