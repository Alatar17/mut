import { useRef, useState, type PointerEvent, type MouseEvent, type RefObject } from 'react'
import { kartBoyu, type Kart as KartTipi } from '../oyun/kart'
import { Kart } from './Kart'
import { kartEni } from './boyut'
import { SAHNE_BOY, SAHNE_EN } from './Sahne'

// Yığınlara bakmak (9.2): yığını basılı tutunca (bilgisayarda fare üstünde bekleyince) bütün kartları açılır,
// bırakınca kapanır. Yığınlar data-bak ile işaretli (orta, ceza:<i>, bomba). Sadece bakanın ekranında.
const BASILI_SURE = 350
const FARE_SURE = 450

export interface Bakis { yer: string; x: number; y: number }

export function useYiginBakisi(masaRef: RefObject<HTMLDivElement | null>) {
  const [bakis, setBakis] = useState<Bakis | null>(null)
  const acik = useRef<string | null>(null)
  const bekleyen = useRef<string | null>(null)
  const zaman = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  // Basılı tutma: başladığı yer; açtıysa ardından gelen tıklama yutulur (serbest elde hedef seçmesin).
  const basili = useRef<{ x: number; y: number } | null>(null)
  const yut = useRef(false)

  const altindaki = (x: number, y: number) =>
    document.elementsFromPoint(x, y).map(el => el.closest<HTMLElement>('[data-bak]')).find(el => el) ?? undefined
  const ac = (el: HTMLElement) => {
    const masa = masaRef.current!.getBoundingClientRect()
    const olcek = masa.width / SAHNE_EN || 1
    const kutu = el.getBoundingClientRect()
    acik.current = el.dataset.bak!
    setBakis({ yer: el.dataset.bak!, x: (kutu.left + kutu.width / 2 - masa.left) / olcek, y: (kutu.top + kutu.height / 2 - masa.top) / olcek })
  }
  const bekle = (el: HTMLElement, ms: number, sonra?: () => void) => {
    bekleyen.current = el.dataset.bak!
    zaman.current = setTimeout(() => {
      bekleyen.current = null
      ac(el)
      sonra?.()
    }, ms)
  }
  const kapat = () => {
    clearTimeout(zaman.current)
    bekleyen.current = null
    acik.current = null
    setBakis(null)
  }

  const olaylar = {
    onPointerDownCapture: (e: PointerEvent<HTMLDivElement>) => {
      yut.current = false
      kapat()
      if (e.button !== 0) return
      // Kart ya da düğmeye basmak bakış değil (kart sürüklenecek).
      if ((e.target as HTMLElement).closest('.avuc-kart, .yan-kart, .secim-karti, button')) return
      const el = altindaki(e.clientX, e.clientY)
      if (!el) return
      basili.current = { x: e.clientX, y: e.clientY }
      bekle(el, BASILI_SURE, () => (yut.current = true))
    },
    onPointerMove: (e: PointerEvent<HTMLDivElement>) => {
      const b = basili.current
      if (b) {
        if (bekleyen.current && Math.hypot(e.clientX - b.x, e.clientY - b.y) > 8) kapat()
        return
      }
      if (e.pointerType !== 'mouse' || e.buttons) return
      const yer = altindaki(e.clientX, e.clientY)
      if ((yer?.dataset.bak ?? null) === (acik.current ?? bekleyen.current)) return
      kapat()
      if (yer) bekle(yer, FARE_SURE)
    },
    onPointerUpCapture: () => {
      if (!basili.current) return
      basili.current = null
      kapat()
      // Bırakmanın tıklaması hemen ardından gelir; gelmezse sonraki tıklama yutulmasın.
      setTimeout(() => (yut.current = false))
    },
    onPointerCancelCapture: () => {
      basili.current = null
      kapat()
    },
    onPointerLeave: kapat,
    onClickCapture: (e: MouseEvent<HTMLDivElement>) => {
      if (!yut.current) return
      yut.current = false
      e.stopPropagation()
    },
  }
  return { bakis, olaylar }
}

// Açılan yığın, yığının üstünde tek sıra: en alttaki kart solda, en üstteki sağda; sağ altta kart sayısı.
export function YiginYelpazesi({ bakis, kartlar }: { bakis: Bakis; kartlar: KartTipi[] }) {
  if (kartlar.length === 0) return null
  const n = kartlar.length
  const en = kartEni(56)
  const boy = kartBoyu(en)
  const adim = n > 1 ? Math.min(22, (SAHNE_EN - 24 - en) / (n - 1)) : 0
  const gen = en + adim * (n - 1)
  const sol = Math.min(Math.max(bakis.x - gen / 2, 12), SAHNE_EN - 12 - gen)
  const ust = Math.min(Math.max(bakis.y - boy / 2, 8), SAHNE_BOY - 8 - boy)
  return (
    <div className="yigin-bakisi yerinde" style={{ left: sol, top: ust, width: gen, height: boy }}>
      {kartlar.map((k, i) => (
        <div key={i} className="bakis-kart" style={{ left: i * adim }}>
          <Kart kart={k} genislik={en} ucan />
        </div>
      ))}
      <span className="rozet bakis-rozet">{n}</span>
    </div>
  )
}
