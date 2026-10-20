// Tohumlu rastgele sayı (mulberry32). Aynı tohum → aynı karışım; testlerde hatayı tekrar üretmek için.
export function rastgele(d: { tohum: number }): number {
  let t = (d.tohum = (d.tohum + 0x6d2b79f5) | 0)
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

export function karistir<T>(dizi: T[], d: { tohum: number }): T[] {
  for (let i = dizi.length - 1; i > 0; i--) {
    const j = Math.floor(rastgele(d) * (i + 1))
    ;[dizi[i], dizi[j]] = [dizi[j], dizi[i]]
  }
  return dizi
}
