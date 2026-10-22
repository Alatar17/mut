// Kart boyutu çarpanı (Görünüş → Kart boyutu). Masa her çizimin başında günceller; masadaki kart enleri
// kartEni ile buradan okunur (taban = %100'deki en).
export const kartOlcegi = { carpan: 1 }
export const kartEni = (taban: number) => Math.round(taban * kartOlcegi.carpan)
