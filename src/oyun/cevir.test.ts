// Döndürülmüş masada oynanan hamle, gerçek masada oynanan hamlenin döndürülmüşüyle aynı sonucu vermeli.
import { expect, it } from 'vitest'
import { akilliBotHamlesi } from './bot'
import { durumCevir, hamleCevir } from './cevir'
import { hamleYap, sonrakiEl, yeniOyun } from './motor'

it('çevirip geri çevirmek aynı durumu verir', () => {
  const d = yeniOyun({ isimler: ['A', 'B', 'C'], toplamEl: 1, tohum: 7 })
  for (const k of [0, 1, 2]) expect(durumCevir(durumCevir(d, k), 3 - k)).toEqual(d)
})

it('döndürülmüş masada hamleler aynı sonucu verir', () => {
  for (const tohum of [1, 2, 3, 4, 5, 6]) {
    let d = yeniOyun({ isimler: ['A', 'B', 'C'], toplamEl: 3, tohum })
    let adim = 0
    while (d.asama !== 'oyunSonu' && adim++ < 2000) {
      if (d.asama === 'elSonu') {
        d = sonrakiEl(d)
        continue
      }
      const h = akilliBotHamlesi(d)
      const yeni = hamleYap(d, h)
      for (const k of [1, 2]) {
        // Tur değişince dağıtım yapılır; dağıtım ağda hep kurucudan gelir, karşılaştırılmaz.
        if (yeni.tur !== d.tur || yeni.asama !== 'oyun') continue
        expect(hamleYap(durumCevir(d, k), hamleCevir(h, k, 3))).toEqual(durumCevir(yeni, k))
      }
      d = yeni
    }
    expect(d.asama).toBe('oyunSonu')
  }
})
