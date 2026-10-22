import { useEffect, useRef, useState, type ReactNode } from 'react'

// Masa sabit bir boyutta tasarlanır, ekrana sığacak şekilde büyütülür/küçültülür.
export const SAHNE_EN = 844
export const SAHNE_BOY = 390

// Dokunmatik ekranda her dokunuşta tam ekrana geçilir (saat/pil şeridi gizlenir, masa büyür). Manifestteki
// "fullscreen" HyperOS'ta uygulamayı açmıyordu, bu yüzden oyunun içinden. Tarayıcı izin vermezse sessizce geçer.
function tamEkranaGec() {
  if (document.fullscreenElement || !document.fullscreenEnabled || !matchMedia('(pointer: coarse)').matches) return
  document.documentElement.requestFullscreen({ navigationUI: 'hide' }).catch(() => {})
}

export function Sahne({ children }: { children: ReactNode }) {
  // Ölçü .sahne-dis'ten alınır: kamera deliği gibi güvenli olmayan kenarlar (stil.css) dışarıda kalır.
  const disRef = useRef<HTMLDivElement>(null)
  const [{ olcek, dikey }, ayarla] = useState({ olcek: 1, dikey: false })

  useEffect(() => {
    const dis = disRef.current!
    const yenile = () => {
      const { width, height } = dis.getBoundingClientRect()
      ayarla({ olcek: Math.min(width / SAHNE_EN, height / SAHNE_BOY), dikey: window.innerHeight > window.innerWidth })
    }
    yenile()
    const gozlemci = new ResizeObserver(yenile)
    gozlemci.observe(dis)
    // Tam ekran isteği sadece dokunuşun bitişinde (pointerup) kabul edilir.
    document.addEventListener('pointerup', tamEkranaGec)
    return () => {
      gozlemci.disconnect()
      document.removeEventListener('pointerup', tamEkranaGec)
    }
  }, [])

  return (
    <div className="sahne-dis" ref={disRef}>
      <div className="sahne" style={{ width: SAHNE_EN, height: SAHNE_BOY, transform: `translate(-50%, -50%) scale(${olcek})` }}>
        {children}
      </div>
      {dikey && <div className="cevir-uyari">Telefonu yan çevir</div>}
    </div>
  )
}
