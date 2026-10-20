// Botlar birbirine karşı çok sayıda oyun oynar; her hamleden sonra kural bozulmuş mu bakılır (PROJE.md 9.1).
import { expect, it } from 'vitest'
import { yiginPuani, type Kart } from './kart'
import { botHamlesi } from './bot'
import { elPuanlari, gecerliHamleler, hamleYap, sonrakiEl, yeniOyun, type Durum, type Hamle } from './motor'
import { rastgele } from './rastgele'

const OYUN_SAYISI = 100
const EL_SAYISI = 10
const DESTE_PUANI = 544

const tumKartlar = (d: Durum): Kart[] => [
  ...d.deste,
  ...d.mut,
  ...d.orta,
  ...d.oyuncular.flatMap((o) => [...o.avuc, ...o.ceza]),
]

function denetle(d: Durum, onceki: Durum, h: Hamle) {
  const kartlar = tumKartlar(d)
  expect(kartlar.length).toBe(52)
  expect(new Set(kartlar.map((k) => `${k.renk}${k.deger}`)).size).toBe(52)

  // Orta yığına boşa atılan kart Mut kartlarında olmamalı.
  if (h.tip === 'ortayaAt' && d.orta.length > onceki.orta.length) {
    const atilan = d.orta[d.orta.length - 1]
    expect(onceki.mut.some((m) => m.deger === atilan.deger)).toBe(false)
  }
  // Mut kartları sadece Mut eşleştirmesiyle azalır.
  if (h.tip !== 'mutEslestir') expect(d.mut.length).toBe(onceki.mut.length)

  if (d.asama === 'oyun') {
    // 6.6: en çok kartı olanlardan, elin başlatanından sağa doğru ilk olan.
    const n = d.oyuncular.length
    const enCok = Math.max(...d.oyuncular.map((o) => o.avuc.length))
    const beklenen = Array.from({ length: n }, (_, j) => (d.elBaslatani + j) % n).find(
      (i) => d.oyuncular[i].avuc.length === enCok,
    )
    expect(d.sira).toBe(beklenen)
    expect(enCok).toBeGreaterThan(0)
    expect(gecerliHamleler(d).length).toBeGreaterThan(0)
  }
}

function oyunOyna(oyuncuSayisi: number, tohum: number, istatistik: Record<string, number>) {
  const zar = { tohum: tohum * 7919 }
  let d = yeniOyun({ isimler: ['A', 'B', 'C', 'D'].slice(0, oyuncuSayisi), toplamEl: EL_SAYISI, tohum })
  for (;;) {
    const baslatan = d.elBaslatani
    let hamleSayisi = 0
    while (d.asama === 'oyun') {
      const h = botHamlesi(d, () => rastgele(zar))
      const yeni = hamleYap(d, h)
      denetle(yeni, d, h)
      istatistik[h.tip] = (istatistik[h.tip] ?? 0) + 1
      d = yeni
      if (++hamleSayisi > 48) throw new Error('El 48 hamlede bitmedi')
    }
    expect(hamleSayisi).toBe(48)
    expect(d.tur).toBe(d.toplamTur)
    expect(d.puanKagidi.length).toBe(d.el)
    expect(d.puanKagidi[d.el - 1]).toEqual(elPuanlari(d))
    const kalanPuan = yiginPuani([...d.orta, ...d.mut, ...d.oyuncular.flatMap((o) => o.ceza)])
    expect(kalanPuan).toBe(DESTE_PUANI)
    istatistik.temizOn = (istatistik.temizOn ?? 0) + d.oyuncular.filter((o) => o.ceza.length === 0).length
    istatistik.el = (istatistik.el ?? 0) + 1
    if (d.asama === 'oyunSonu') break
    d = sonrakiEl(d)
    expect(d.elBaslatani).toBe((baslatan + 1) % oyuncuSayisi)
  }
  expect(d.el).toBe(EL_SAYISI)
}

for (const oyuncuSayisi of [3, 4]) {
  it(`${oyuncuSayisi} kişi: ${OYUN_SAYISI} oyun × ${EL_SAYISI} el kural bozulmadan biter`, () => {
    const istatistik: Record<string, number> = {}
    for (let tohum = 1; tohum <= OYUN_SAYISI; tohum++) oyunOyna(oyuncuSayisi, tohum, istatistik)
    console.log(`${oyuncuSayisi} kişi`, istatistik)
  }, 120_000)
}
