// Kart animasyonları: her geçişte kartların eski ve yeni yeri ölçülür, yer değiştirenler
// masanın üstünde "uçan kart" olarak eski yerinden yenisine kayar. Uçuş bitene kadar
// kartın asıl yeri görünmez tutulur (yerini korur, böylece hedef konumu ölçülebilir).
import { createContext, useContext, useLayoutEffect, useRef, useState } from 'react'
import { kartBoyu, type Kart as KartTipi } from '../oyun/kart'
import type { Durum } from '../oyun/motor'
import { Kart } from './Kart'
import { kartEni } from './boyut'
import { SAHNE_EN } from './Sahne'

export const kartKimligi = (k: KartTipi) => `${k.renk}-${k.deger}`

export const GizliKartlar = createContext<ReadonlySet<string>>(new Set())
export const useGizliKartlar = () => useContext(GizliKartlar)

// Her kartın yeri: "avuc:<oyuncu>", "ceza:<oyuncu>", "orta", "mut", "deste".
// Sıra, yığınlarda alttan üste doğrudur (uçan kartlar da bu sırayla üst üste biner).
export function kartYerleri(d: Durum): Map<string, string> {
  const yerler = new Map<string, string>()
  const ekle = (kartlar: KartTipi[], yer: string) => kartlar.forEach(k => yerler.set(kartKimligi(k), yer))
  ekle(d.deste, 'deste')
  ekle(d.mut, 'mut')
  ekle(d.orta, 'orta')
  d.oyuncular.forEach((o, i) => {
    ekle(o.ceza, `ceza:${i}`)
    ekle(o.avuc, `avuc:${i}`)
  })
  if (d.bomba) ekle(d.bomba.kartlar, `bomba:${d.bomba.sahip}`)
  return yerler
}

// Bomba patlamadan hemen önceki görüntü: patlayan kartlar ceza yığınından çıkıp orta, Mut ve bomba yerlerine döner.
export function patlamaOncesi(d: Durum): Durum {
  const p = d.patlama!
  const o = structuredClone(d)
  const ceza = o.oyuncular[p.sahip].ceza
  ceza.splice(ceza.length - p.orta.length - p.mut.length - p.bomba.length)
  o.orta = [...p.orta]
  o.mut = [...p.mut]
  o.bomba = { sahip: p.sahip, kartlar: [...p.bomba] }
  return o
}

// Patlamanın ilk adımı: Mut'ta kalanlar ve bomba orta yığına toplanmış (sonra hepsi birlikte ceza yığınına gider).
export function patlamaOrtada(d: Durum): Durum {
  const o = patlamaOncesi(d)
  o.orta.push(...o.mut.splice(0), ...o.bomba!.kartlar)
  o.bomba = undefined
  return o
}

// Kartın ekrandaki yeri, masa koordinatlarında: merkez, dönüş açısı ve kart eni.
export interface Konum { x: number; y: number; aci: number; en: number }

// 0 = ben (alt), 1 = sağdaki, 2 = soldaki. Yan oturanların kartları ve yığınları (bomba dahil) yan döner.
const yerinAcisi = (yer: string) => (yer.endsWith(':1') ? -90 : yer.endsWith(':2') ? 90 : 0)
const yerinKartEni = (yer: string) => kartEni(yer === 'avuc:0' ? 60 : yer === 'deste' ? 42 : yer.startsWith('bomba') ? BOMBA_KART_EN : 56)
export const BOMBA_KART_EN = 44

export function konumOlc(masa: HTMLElement, id: string, yer: string): Konum {
  const el = masa.querySelector(`[data-kart="${id}"]`) ?? masa.querySelector(`[data-yer="${yer}"]`)
  const masaKutusu = masa.getBoundingClientRect()
  // Sayfa görünmezken masa 0 ölçülür; 0'a bölünüp NaN çıkmasın.
  const olcek = masaKutusu.width / SAHNE_EN || 1
  const kutu = el?.getBoundingClientRect() ?? masaKutusu
  return {
    x: (kutu.left + kutu.width / 2 - masaKutusu.left) / olcek,
    y: (kutu.top + kutu.height / 2 - masaKutusu.top) / olcek,
    aci: yerinAcisi(yer),
    en: yerinKartEni(yer),
  }
}

export interface Ucus {
  kart: KartTipi
  kaynak: Konum
  hedef: Konum
  sure: number
  gecikme: number
  kapali: boolean
  // Kapalı uçan kart inince bu sürede dönerek açılır (dağıtımda benim kartlarım).
  donus?: number
}

export function UcanKart({ ucus }: { ucus: Ucus }) {
  const ref = useRef<HTMLDivElement>(null)
  const { kaynak, hedef, donus } = ucus
  const [acildi, setAcildi] = useState(false)
  useLayoutEffect(() => {
    const el = ref.current!
    const animasyon = el.animate(
      [
        { transform: `translate(${kaynak.x - hedef.x}px, ${kaynak.y - hedef.y}px) rotate(${kaynak.aci}deg) scale(${kaynak.en / hedef.en})` },
        { transform: `rotate(${hedef.aci}deg)` },
      ],
      { duration: ucus.sure, delay: ucus.gecikme, easing: 'cubic-bezier(0.3, 0.7, 0.4, 1)', fill: 'both' },
    )
    // Dönerek açılma: kart yarıya kadar daralır, yüzü çevrilir, geri genişler.
    let donme: Animation | undefined
    const zamanlayici = donus
      ? setTimeout(() => {
          const yari = (x: number) => ({ transform: `rotate(${hedef.aci}deg) scaleX(${x})` })
          donme = el.animate([yari(1), yari(0)], { duration: donus / 2, easing: 'ease-in', fill: 'forwards' })
          donme.finished.then(() => {
            setAcildi(true)
            donme = el.animate([yari(0), yari(1)], { duration: donus / 2, easing: 'ease-out', fill: 'forwards' })
          }, () => {})
        }, ucus.gecikme + ucus.sure)
      : undefined
    return () => {
      clearTimeout(zamanlayici)
      animasyon.cancel()
      donme?.cancel()
    }
  }, [ucus])
  return (
    <div
      ref={ref}
      className="ucan-kart"
      style={{ left: hedef.x - hedef.en / 2, top: hedef.y - kartBoyu(hedef.en) / 2 }}
    >
      <Kart kart={ucus.kart} genislik={hedef.en} kapali={ucus.kapali && !acildi} ucan />
    </div>
  )
}

export const bekle = (ms: number) => new Promise(r => setTimeout(r, ms))

// Dağıtımdan hemen önceki görüntü: avuçtaki (ve istenirse Mut) kartlar destede.
export function dagitimOncesi(d: Durum, mutDahil: boolean): Durum {
  const o = structuredClone(d)
  const toplanan = o.oyuncular.flatMap(x => x.avuc)
  if (mutDahil) toplanan.push(...o.mut)
  o.deste.push(...toplanan.reverse())
  o.oyuncular.forEach(x => (x.avuc = []))
  if (mutDahil) o.mut = []
  return o
}
