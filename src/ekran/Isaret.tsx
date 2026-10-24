import type { Renk } from '../oyun/kart'

// Kart işaretleri, 100×100 alanda çizilmiş SVG. Yazı tipiyle çizilen ♠♥♦♣ telefonda farklı (uzun/ince) görünüyordu;
// çizim her cihazda aynı. Boyut CSS'ten (ya da boy ile) gelir.
export function Isaret({ renk, boy }: { renk: Renk; boy?: string }) {
  return (
    <svg className="isaret" viewBox="0 0 100 100" style={boy ? { width: boy, height: boy } : undefined} fill="currentColor">
      {renk === 'kupa' && <path d="M50 92 C22 68 4 52 4 31 C4 15 16 5 29 5 C39 5 46 11 50 20 C54 11 61 5 71 5 C84 5 96 15 96 31 C96 52 78 68 50 92Z" />}
      {renk === 'karo' && <path d="M50 3 L88 50 L50 97 L12 50Z" />}
      {renk === 'maca' && (
        <path d="M50 3 C40 22 6 38 6 62 C6 76 16 84 28 84 C37 84 44 80 47 73 C46 83 42 90 34 96 L66 96 C58 90 54 83 53 73 C56 80 63 84 72 84 C84 84 94 76 94 62 C94 38 60 22 50 3Z" />
      )}
      {renk === 'sinek' && (
        <>
          <circle cx="50" cy="28" r="21" />
          <circle cx="27" cy="60" r="21" />
          <circle cx="73" cy="60" r="21" />
          <path d="M40 40 H60 V62 H40Z" />
          <path d="M47 58 C47 78 43 88 34 96 L66 96 C57 88 53 78 53 58Z" />
        </>
      )}
    </svg>
  )
}
