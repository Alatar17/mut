import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { kartBoyu, yiginPuani, type Kart as KartTipi } from '../oyun/kart'
import { kartEni } from './boyut'
import { BOMBA_KART_EN, kartKimligi, useGizliKartlar } from './animasyon'
import { Kart } from './Kart'

const kartEn = () => kartEni(56)

// Altta kalan kartların kalınlığı: her 3 kart için 1 piksellik kenar, en fazla 8.
const kalinlik = (adet: number) => Math.min(8, Math.ceil(adet / 3))

// Yığın zemininin (Görünüş menüsü) saracağı alan: görünen kartlar + alttaki kalınlık; stil.css her yandan eşit pay bırakır.
const zeminOlcusu = (en: number, alttaki: number) =>
  ({ '--zemin-en': `${en + kalinlik(alttaki)}px`, '--zemin-boy': `${kartBoyu(kartEn()) + kalinlik(alttaki)}px` }) as CSSProperties

function Kalinlik({ adet, genislik }: { adet: number; genislik: number }) {
  return (
    <>
      {Array.from({ length: kalinlik(adet) }, (_, i) => (
        <div key={i} className="kalinlik" style={{ width: genislik, height: kartBoyu(genislik), left: i + 1, top: i + 1 }} />
      ))}
    </>
  )
}

// Bomba yığını (6.8): sahibinin ceza yığınının yanında, hafif parlak; tek kart görünür (tahta dar), rozette çıkan 10 sayısı.
// Botlarda kartları gibi yan döner. Uçuş sırasında üstteki kart gizlenince alttaki görünsün diye en üstteki iki kart çizilir.
export function BombaYigini({ kartlar, sahip, cikan }: { kartlar: KartTipi[]; sahip: number; cikan: number }) {
  const en = kartEni(BOMBA_KART_EN)
  const govde = (
    <div className="yigin-govde" style={{ width: en, height: kartBoyu(en) }}>
      {kartlar.slice(-2).map(k => (
        <div key={kartKimligi(k)} className="yigin-kart">
          <Kart kart={k} genislik={en} />
        </div>
      ))}
    </div>
  )
  return (
    <div className={`bomba bomba-${sahip}`} data-hedef={`bomba:${sahip}`} data-yer={`bomba:${sahip}`} data-bak="bomba">
      {sahip === 0 ? govde : <div className={'yan-yigin ' + (sahip === 1 ? 'sag' : 'sol')} style={{ width: kartBoyu(en), height: en }}>{govde}</div>}
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
    <div className="orta-yigin" data-hedef="orta" data-yer="orta" data-bak="orta">
      <div className="yigin-govde" style={{ width: kartEn() + 28, height: kartBoyu(kartEn()), ...zeminOlcusu(kartEn() + Math.max(0, ust.length - 1) * 14, alttaKalan) }}>
        {kartlar.length === 0 && <div className="bos-yer" style={{ width: kartEn(), height: kartBoyu(kartEn()) }} />}
        {alttaKalan > 0 && <Kalinlik adet={alttaKalan} genislik={kartEn()} />}
        {ust.map((k, i) => (
          <div key={i} className="yigin-kart" style={{ left: i * 14 }}>
            <Kart kart={k} genislik={kartEn()} />
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
  // Üstteki kartlar arası kaydırma (piksel); Görünüş menüsünden seçiliyor.
  aralik: number
  dizilis: CezaDizilisi
}

// Ceza dizilişi (Görünüş menüsü): Varsayılan = son 3 kart kaydırılmış; Dağınık = kartlar hafif yamuk (kahvedeki gibi).
export type CezaDizilisi = 'Varsayılan' | 'Dağınık'

// Dağınık dizilişte kartın sabit küçük açısı ve kayması (kart kimliğinden; her çizimde aynı).
const RENK_SIRASI = { maca: 0, kupa: 1, karo: 2, sinek: 3 }
function daginik(k: KartTipi) {
  const t = k.deger * 7 + RENK_SIRASI[k.renk] * 13
  return `translate(${(t % 5) - 2}px, ${((t >> 1) % 5) - 2}px) rotate(${((t % 9) - 4) * 0.9}deg)`
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
export function CezaYigini({ kartlar, carpan, puanTarafi, donuk, hedef, aralik, dizilis }: CezaProps) {
  const gizliler = useGizliKartlar()
  // Puan, yerine varmış kartlardan hesaplanır (uçan kart inince artar).
  const varanlar = kartlar.filter(k => !gizliler.has(kartKimligi(k)))
  const boy = kartBoyu(kartEn())
  const en = kartEn() + 2 * aralik
  const gorunen = Math.min(3, kartlar.length)
  // Kilitli dörtlü (6.9.1): aynı sayıdan dört kart art arda gelince en üstteki ters çizilir.
  const kilitli = (i: number) => i >= 3 && kartlar.slice(i - 3, i).every(k => k.deger === kartlar[i].deger)
  const govde = (
    <div className="yigin-govde" style={{ width: en, height: boy, ...zeminOlcusu(kartEn() + Math.max(0, gorunen - 1) * aralik, kartlar.length - gorunen) }} data-yer={hedef}>
      {kartlar.length > 0 ? (
        <>
          <Kalinlik adet={kartlar.length - gorunen} genislik={kartEn()} />
          {kartlar.slice(-CIZILEN_UST_KART).map((k, i, ust) => {
            const yukaridan = ust.length - 1 - i
            return (
              <div key={kartKimligi(k)} className={'yigin-kart' + (yukaridan > 0 ? ' alt' : '')} style={{ left: Math.max(0, gorunen - 1 - yukaridan) * aralik, transform: dizilis === 'Dağınık' ? daginik(k) : undefined }}>
                <Kart kart={k} genislik={kartEn()} kapali={kilitli(kartlar.length - 1 - yukaridan)} />
              </div>
            )
          })}
        </>
      ) : (
        <div className="bos-yer" style={{ width: kartEn(), height: boy }} />
      )}
    </div>
  )
  // Puan yeri (Görünüş menüsü, masa sınıfı puan-*): yanında = akıştaki puan; kenarda / rozet = yığının üstündeki
  // puan gösterilir, akıştaki görünmez ama yer tutar (yerleşim kaymasın).
  const puan = <Puan deger={yiginPuani(varanlar) * carpan} bos={varanlar.length === 0} />
  return (
    <div className={'ceza-yigini puan-' + puanTarafi} data-hedef={hedef} data-bak={hedef}>
      <div className="yigin-sarici">
        {donuk ? <div className={'yan-yigin ' + donuk} style={{ width: boy, height: en }}>{govde}</div> : govde}
        <span className="puan-ustte">{puan}</span>
      </div>
      <span className="puan-akista">{puan}</span>
    </div>
  )
}

// ac: deste penceresini açar (ayar kapalıysa verilmez).
export function Deste({ kalan, ac }: { kalan: number; ac?: () => void }) {
  return (
    <div className={'deste' + (ac ? ' acilir' : '')} data-yer="deste" onClick={ac}>
      <div className="yigin-govde" style={{ width: kartEni(42), height: kartBoyu(kartEni(42)) }}>
        <Kalinlik adet={kalan} genislik={kartEni(42)} />
        <div className="yigin-kart"><Kart kapali genislik={kartEni(42)} /></div>
      </div>
      <span className="rozet">{kalan}</span>
    </div>
  )
}
