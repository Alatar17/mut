import { kart, type Deger, type Kart as KartTipi, type Renk } from '../oyun/kart'
import type { Durum } from '../oyun/motor'
import { kartKimligi } from './animasyon'
import { Kart } from './Kart'

// Deste penceresi (9.2): desteye dokununca 52 kart, 13 sütun (A–K). Masada açıkta görülmüş kartlar (orta, ceza
// yığınları, Mut, bomba) soluk; benim avucumdakiler çerçeveli ya da soluk (Görünüş menüsü); kalanlar (destede ya da
// rakiplerin avucunda) parlak ve sütunun üstünde. Sütunun altında kaç bilinmeyen kaldığı yazar.
// Bilerek sade: takasta verdiğim kartları pencere hatırlamaz (bilinmeyen sayılır), hafıza oyuncunun işi.
export type KartlarimGorunusu = 'Soluk' | 'Çerçeveli'

const RENKLER: Renk[] = ['maca', 'kupa', 'karo', 'sinek']
const EN = 44
const ADIM = 26

// Masa kararmaz (kullanıcı kararı; karartmalı hali denendi).
export function DestePenceresi({ d, kartlarim, kapat }: { d: Durum; kartlarim: KartlarimGorunusu; kapat: () => void }) {
  const gorulen = new Set([...d.orta, ...d.mut, ...(d.bomba?.kartlar ?? []), ...d.oyuncular.flatMap(o => o.ceza)].map(kartKimligi))
  const bende = new Set(d.oyuncular[0].avuc.map(kartKimligi))
  // Sütundaki sıra: bilinmeyenler üstte, sonra benimkiler, en altta görülenler.
  const sira = (k: KartTipi) => (gorulen.has(kartKimligi(k)) ? 2 : bende.has(kartKimligi(k)) ? 1 : 0)
  return (
    <div className="pencere-arka karartmasiz" onClick={kapat}>
      <div className="deste-penceresi" onClick={kapat}>
        {Array.from({ length: 13 }, (_, i) => {
          const kartlar = RENKLER.map(r => kart((i + 1) as Deger, r)).sort((a, b) => sira(a) - sira(b))
          const kalan = kartlar.filter(k => sira(k) === 0).length
          return (
            <div key={i} className="deste-sutun">
              <div className="deste-kartlar" style={{ height: 3 * ADIM + Math.round(EN * 1.4) }}>
                {kartlar.map((k, j) => (
                  <div
                    key={kartKimligi(k)}
                    className={'deste-kart' + (sira(k) === 2 || (sira(k) === 1 && kartlarim === 'Soluk') ? ' soluk' : sira(k) === 1 ? ' bende' : '')}
                    style={{ top: j * ADIM }}
                  >
                    <Kart kart={k} genislik={EN} ucan />
                  </div>
                ))}
              </div>
              <span className={'deste-kalan' + (kalan === 0 ? ' bitti' : '')}>{kalan}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
