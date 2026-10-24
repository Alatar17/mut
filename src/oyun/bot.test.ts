// Akıllı bot rastgele botlara karşı açık ara önde olmalı (şans eşitse 3 kişide ~%33 kazanılır; şu an %60).
import { expect, it } from 'vitest'
import { kart, type Deger, type Kart } from './kart'
import { akilliBotHamlesi, botHamlesi } from './bot'
import { hamleYap, sonrakiEl, toplamPuanlar, yeniOyun } from './motor'
import { rastgele } from './rastgele'
import { asBotDenemesi, bombaBotDenemesi, bombaDenemesi, ucBotDenemesi } from './deneme'

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
}, 30_000)

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

it('akıllı bot: rakipten çekilecek kart büyük ihtimalle işe yarıyorsa Kız ile çeker, yoksa çekmez', () => {
  const d = yeniOyun({ isimler: ['A', 'B', 'C'], toplamEl: 1, tohum: 1 })
  const k = (deger: number, renk: Kart['renk']) => kart(deger as Deger, renk)
  d.sira = 0
  // 9 Mut kartlarında: Kız ortaya düşünce üstünü kapatmasın.
  d.mut = [k(9, 'maca')]
  d.orta = []
  d.oyuncular[0].avuc = [k(12, 'maca'), k(4, 'maca')]
  d.oyuncular[1].avuc = [k(5, 'kupa'), k(6, 'kupa')]
  d.oyuncular[2].avuc = [k(4, 'kupa'), k(7, 'kupa')]
  // Kimden ne gelse Mut 9'u yakalayamaz: çekme yok.
  expect(akilliBotHamlesi(d).tip).not.toBe('cek')
  // C'nin avucunda iki 9: hangisi gelse Mut 9 yakalanır → C'den çeker.
  d.oyuncular[2].avuc = [k(9, 'kupa'), k(9, 'karo')]
  expect(akilliBotHamlesi(d)).toEqual({ tip: 'cek', kart: 0, hedef: 2 })
})

it('akıllı bot eksi elde benim yığınımdaki 9\'ları kendine alır', () => {
  const d = asBotDenemesi(yeniOyun({ isimler: ['A', 'B', 'C'], toplamEl: 1, tohum: 3 }))
  expect(akilliBotHamlesi(d, () => 0)).toEqual({ tip: 'alIlerlet', kart: 0, hedef: 0 })
})

it('akıllı bot serbest elde yakaladığını kazanmakta olana gönderir', () => {
  const d = ucBotDenemesi(yeniOyun({ isimler: ['A', 'B', 'C'], toplamEl: 1, tohum: 3 }))
  expect(akilliBotHamlesi(d, () => 0)).toEqual({ tip: 'ortayaAt', kart: 0, gonder: 0 })
  // C'nin yığını boş, benimki dolu olunca C'ye.
  d.oyuncular[0].ceza = d.oyuncular[2].ceza
  d.oyuncular[2].ceza = []
  expect(akilliBotHamlesi(d, () => 0)).toEqual({ tip: 'ortayaAt', kart: 0, gonder: 2 })
})

it('akıllı bot bombayı kurar, gelen bombayı 2 ile bloklar, 10 gelince devreder', () => {
  const yeni = () => yeniOyun({ isimler: ['A', 'B', 'C'], toplamEl: 1, tohum: 1 })
  const d = bombaBotDenemesi(yeni())
  expect(akilliBotHamlesi(d, () => 0)).toEqual({ tip: 'mutEslestir', kart: 0 })
  const geldi = hamleYap(d, { tip: 'mutEslestir', kart: 0 })
  expect(geldi.blok?.hedef).toBe(0)
  expect(akilliBotHamlesi(geldi, () => 0).tip).toBe('blok')
  const b = hamleYap(bombaDenemesi(yeni()), { tip: 'mutEslestir', kart: 0 })
  expect(b.sira).toBe(1)
  expect(akilliBotHamlesi(b, () => 0)).toEqual({ tip: 'bomba', kart: 0 })
})

it('akıllı bot: eksi elde Kral gücüyle küçük bir grubu da kendine alır (gücü boşa bırakmaz)', () => {
  const d = yeniOyun({ isimler: ['A', 'B', 'C'], toplamEl: 1, tohum: 1 })
  d.sira = 0
  d.eksi = true
  d.serbest = false
  d.blok = undefined
  d.bomba = undefined
  d.orta = []
  d.oyuncular.forEach((o, i) => (o.ceza = i === 1 ? [kart(5, 'karo')] : []))
  d.kral = { oyuncu: 0, papazlar: [kart(13, 'maca'), kart(13, 'kupa')] }
  expect(akilliBotHamlesi(d, () => 0).tip).toBe('kralAl')
})
