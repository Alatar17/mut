import { useEffect, useState, type ReactNode } from 'react'

// Masa sabit bir boyutta tasarlanır, ekrana sığacak şekilde büyütülür/küçültülür.
export const SAHNE_EN = 844
export const SAHNE_BOY = 390

function olcekHesapla() {
  return {
    olcek: Math.min(window.innerWidth / SAHNE_EN, window.innerHeight / SAHNE_BOY),
    dikey: window.innerHeight > window.innerWidth,
  }
}

export function Sahne({ children }: { children: ReactNode }) {
  const [{ olcek, dikey }, ayarla] = useState(olcekHesapla)

  useEffect(() => {
    const yenile = () => ayarla(olcekHesapla())
    window.addEventListener('resize', yenile)
    return () => window.removeEventListener('resize', yenile)
  }, [])

  return (
    <div className="sahne-dis">
      <div className="sahne" style={{ width: SAHNE_EN, height: SAHNE_BOY, transform: `translate(-50%, -50%) scale(${olcek})` }}>
        {children}
      </div>
      {dikey && <div className="cevir-uyari">Telefonu yan çevir</div>}
    </div>
  )
}
