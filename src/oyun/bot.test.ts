// Akıllı bot rastgele botlara karşı açık ara önde olmalı (şans eşitse 3 kişide ~%33 kazanılır; şu an %60).
import { expect, it } from 'vitest'
import { kart, type Deger, type Kart } from './kart'
import { akilliBotHamlesi, botHamlesi } from './bot'
import { hamleYap, sonrakiEl, toplamPuanlar, yeniOyun } from './motor'
import { rastgele } from './rastgele'

it('akıllı bot rastgele botları çoğunlukla yener', () => {
  const OYUN = 100
  let kazandi = 0
  for (let tohum = 1; tohum <= OYUN; tohum++) {
    // Sabit tohum: test her çalışmada aynı oyunları oynar.
    const zar = { tohum: tohum * 7919 }
    const sayi = () => rastgele(zar)
    let d = yeniOyun({ isimler: ['Akıllı', 'B', 'C'], toplamEl: 3, tohum })
    while (d.asama !== 'oyunSonu') {
      if (d.asama === 'elSonu') d = sonrakiEl(d)
      else d = hamleYap(d, d.sira === 0 ? akilliBotHamlesi(d, sayi) : botHamlesi(d, sayi))
    }
    const [akilli, ...digerleri] = toplamPuanlar(d)
    if (digerleri.every(p => akilli < p)) kazandi++
  }
  expect(kazandi).toBeGreaterThan(OYUN * 0.5)
})

it('akıllı bot: rakipte çok daha iyi avuç varsa 8 ile takas yapar, yoksa yapmaz', () => {
  const d = yeniOyun({ isimler: ['A', 'B', 'C'], toplamEl: 1, tohum: 1 })
  const k = (deger: number, renk: Kart['renk']) => kart(deger as Deger, renk)
  d.sira = 0
  d.mut = []
  d.orta = [k(9, 'maca')]
  d.oyuncular[0].avuc = [k(8, 'maca'), k(4, 'maca')]
  d.oyuncular[1].avuc = [k(5, 'kupa')]
  // C'nin avucundaki 4 hiçbir şey yakalamaz: takas yok.
  d.oyuncular[2].avuc = [k(4, 'kupa')]
  expect(akilliBotHamlesi(d).tip).not.toBe('takas')
  // B'nin ceza yığınında üç 3 (90 puan), C'nin avucunda 3: C'nin avucu çok değerli → takas C ile.
  d.oyuncular[1].ceza = [k(3, 'kupa'), k(3, 'karo'), k(3, 'sinek')]
  d.oyuncular[2].avuc = [k(3, 'maca')]
  expect(akilliBotHamlesi(d)).toEqual({ tip: 'takas', kart: 0, hedef: 2 })
})
