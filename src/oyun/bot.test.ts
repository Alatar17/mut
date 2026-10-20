// Akıllı bot rastgele botlara karşı açık ara önde olmalı (şans eşitse 3 kişide ~%33 kazanılır; şu an %60).
import { expect, it } from 'vitest'
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
