// Kart işaretleri ve güç ikonları, 100×100 alanda çizilmiş SVG (sistem yazı tipine bağlı değil, her telefonda aynı).

export { Isaret } from '../ekran/Isaret'

export type IkonAdi = 'kalkan' | 'takas' | 'miknatis' | 'bomba' | 'tac' | 'hedef' | 'eksi' | 'carpan'

export function Ikon({ ad, carpan = 2, boy }: { ad: IkonAdi; carpan?: number; boy?: string }) {
  return (
    <svg viewBox="0 0 100 100" style={{ width: boy, height: boy, display: 'block' }} fill="currentColor">
      {ad === 'kalkan' && <path d="M50 4 L90 17 V46 C90 71 72 88 50 97 C28 88 10 71 10 46 V17Z M50 18 L24 27 V46 C24 63 35 75 50 82Z" fillRule="evenodd" />}
      {ad === 'takas' && (
        <>
          <path d="M8 26 H64 V8 L94 36 L64 64 V46 H8Z" />
          <path d="M92 74 H36 V92 L6 64 L36 36 V54 H92Z" opacity="0.6" />
        </>
      )}
      {ad === 'miknatis' && (
        <path d="M14 8 H40 V54 A10 10 0 0 0 60 54 V8 H86 V54 A36 36 0 0 1 14 54Z M14 22 H40 V30 H14Z M60 22 H86 V30 H60Z" fillRule="evenodd" />
      )}
      {ad === 'bomba' && (
        <>
          <circle cx="44" cy="62" r="33" />
          <path d="M44 25 L62 31 L56 47 L38 41Z" />
          <path d="M60 30 Q70 12 84 14" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
          <path d="M86 2 L89 10 L98 11 L91 16 L93 25 L86 20 L78 24 L81 16 L74 10 L83 10Z" />
        </>
      )}
      {ad === 'tac' && <path d="M8 34 L30 54 L50 14 L70 54 L92 34 L84 80 H16Z M16 86 H84 V96 H16Z" />}
      {ad === 'hedef' && (
        <>
          <circle cx="50" cy="50" r="32" fill="none" stroke="currentColor" strokeWidth="10" />
          <circle cx="50" cy="50" r="10" />
          <path d="M45 0 H55 V22 H45Z M45 78 H55 V100 H45Z M0 45 H22 V55 H0Z M78 45 H100 V55 H78Z" />
        </>
      )}
      {ad === 'eksi' && <path d="M50 4 A46 46 0 1 1 49.9 4Z M20 42 V58 H80 V42Z" fillRule="evenodd" />}
      {ad === 'carpan' && (
        <text x="50" y="74" fontSize="68" fontWeight="800" textAnchor="middle" fontFamily="Nunito, sans-serif">
          ×{carpan}
        </text>
      )}
    </svg>
  )
}
