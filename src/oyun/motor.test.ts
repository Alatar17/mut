import { describe, expect, it } from 'vitest'
import { kart, type Deger, type Kart } from './kart'
import { gecerliHamleler, hamleYap, siradakiOyuncu, yeniDeste, yeniOyun, type Durum, type Hamle } from './motor'

// Kartı kısaca yazmak için: k(5) = 5 maça. Renk sadece kartları ayırt etmek için.
const k = (deger: number, renk: Kart['renk'] = 'maca') => kart(deger as Deger, renk)

const ad = (k: Kart) => `${k.renk}${k.deger}`

// Elle kurulmuş bir an. Kullanılmayan kartlar destede durur (toplam hep 52);
// desteBos ise orta yığının altına konur ki son hamleyle el bitsin.
function durum(p: {
  avuclar: Kart[][]
  cezalar?: Kart[][]
  mut?: Kart[]
  orta?: Kart[]
  sira?: number
  elBaslatani?: number
  desteBos?: boolean
}): Durum {
  const d = yeniOyun({ isimler: p.avuclar.map((_, i) => 'ABCD'[i]), toplamEl: 1, tohum: 1 })
  d.oyuncular.forEach((o, i) => {
    o.avuc = p.avuclar[i]
    o.ceza = p.cezalar?.[i] ?? []
  })
  d.mut = p.mut ?? []
  d.orta = p.orta ?? []
  d.elBaslatani = p.elBaslatani ?? 0
  d.sira = p.sira ?? 0
  const kullanilan = [...p.avuclar.flat(), ...(p.cezalar?.flat() ?? []), ...d.mut, ...d.orta]
  expect(new Set(kullanilan.map(ad)).size).toBe(kullanilan.length)
  const kalan = yeniDeste().filter((k) => !kullanilan.some((u) => ad(u) === ad(k)))
  if (p.desteBos) {
    d.deste = []
    d.orta = [...kalan, ...d.orta]
  } else d.deste = kalan
  return d
}

const tipler = (d: Durum, kartSirasi: number) =>
  gecerliHamleler(d).filter((h) => h.kart === kartSirasi).map((h) => h.tip).sort()

describe('dağıtım', () => {
  it('3 kişi: herkese 4, Mut 4, destede 36, 4 tur', () => {
    const d = yeniOyun({ isimler: ['A', 'B', 'C'], toplamEl: 10, tohum: 7 })
    expect(d.oyuncular.map((o) => o.avuc.length)).toEqual([4, 4, 4])
    expect(d.mut.length).toBe(4)
    expect(d.deste.length).toBe(36)
    expect(d.toplamTur).toBe(4)
    expect(d.sira).toBe(d.elBaslatani)
  })
  it('4 kişi: destede 32, 3 tur', () => {
    const d = yeniOyun({ isimler: ['A', 'B', 'C', 'D'], toplamEl: 10, tohum: 7 })
    expect(d.deste.length).toBe(32)
    expect(d.toplamTur).toBe(3)
  })
})

describe('orta yığın', () => {
  it('eşleşmezse kart ortada kalır, sıra geçer', () => {
    const d = hamleYap(durum({ avuclar: [[k(6)], [k(7)], [k(8)]], orta: [k(5)] }), { tip: 'ortayaAt', kart: 0 })
    expect(d.orta).toEqual([k(5), k(6)])
    expect(d.sira).toBe(1)
  })
  it('eşleşirse iki kart sıradakinin ceza yığınına', () => {
    const d = hamleYap(durum({ avuclar: [[k(5, 'kupa')], [k(7)], [k(8)]], orta: [k(9), k(5)] }), { tip: 'ortayaAt', kart: 0 })
    expect(d.orta).toEqual([k(9)])
    expect(d.oyuncular[1].ceza).toEqual([k(5), k(5, 'kupa')])
  })
})

describe('Mut kartları', () => {
  it('Mut ile eşleşen kart orta yığına atılamaz', () => {
    const d = durum({ avuclar: [[k(9)], [k(7)], [k(8)]], mut: [k(9, 'kupa')], orta: [k(4)] })
    expect(tipler(d, 0)).toEqual(['mutEslestir'])
  })
  it('aynı sayılı Mut kartlarının hepsi tek kartla alınır', () => {
    const d = hamleYap(
      durum({ avuclar: [[k(5)], [k(7)], [k(8)]], mut: [k(5, 'kupa'), k(2), k(5, 'karo'), k(5, 'sinek')] }),
      { tip: 'mutEslestir', kart: 0 },
    )
    expect(d.mut).toEqual([k(2)])
    expect(d.oyuncular[1].ceza).toEqual([k(5, 'kupa'), k(5, 'karo'), k(5, 'sinek'), k(5)])
  })
  it('hem Mut hem orta eşleşiyorsa oyuncu seçer', () => {
    const d = durum({ avuclar: [[k(9)], [k(7)], [k(8)]], mut: [k(9, 'kupa')], orta: [k(9, 'karo')] })
    expect(tipler(d, 0)).toEqual(['mutEslestir', 'ortayaAt'])
  })
})

describe('ceza yığınları', () => {
  const kur = () =>
    durum({
      avuclar: [[k(5)], [k(7)], [k(8)]],
      cezalar: [[k(4), k(5, 'kupa'), k(5, 'karo')], [k(6), k(5, 'sinek')], []],
    })
  it('seçenekler: orta, kendi cezasını boşalt, üstüne yığ, al ve ilerlet', () => {
    expect(tipler(kur(), 0)).toEqual(['alIlerlet', 'cezaBosalt', 'ortayaAt', 'ustuneYig'])
  })
  it('kendi ceza yığınını boşaltınca üstteki aynı kartlar sıradakine gider', () => {
    const d = hamleYap(kur(), { tip: 'cezaBosalt', kart: 0 })
    expect(d.oyuncular[0].ceza).toEqual([k(4)])
    expect(d.oyuncular[1].ceza).toEqual([k(6), k(5, 'sinek'), k(5, 'kupa'), k(5, 'karo'), k(5)])
  })
  it('üstüne yığ', () => {
    const d = hamleYap(kur(), { tip: 'ustuneYig', kart: 0 })
    expect(d.oyuncular[1].ceza).toEqual([k(6), k(5, 'sinek'), k(5)])
  })
  it('al ve ilerlet: sıradakinin sıradakine gider', () => {
    const d = hamleYap(kur(), { tip: 'alIlerlet', kart: 0 })
    expect(d.oyuncular[1].ceza).toEqual([k(6)])
    expect(d.oyuncular[2].ceza).toEqual([k(5, 'sinek'), k(5)])
  })
  it('normal elde sadece sıradakinin ceza yığınına saldırılır', () => {
    const d = durum({ avuclar: [[k(5)], [k(7)], [k(8)]], cezalar: [[], [], [k(5, 'kupa')]] })
    expect(tipler(d, 0)).toEqual(['ortayaAt'])
  })
})

describe('sıra (6.6)', () => {
  const sira = (sayilar: number[], baslatan = 0) => {
    const havuz = yeniDeste()
    return siradakiOyuncu(durum({ avuclar: sayilar.map((n) => havuz.splice(0, n)), elBaslatani: baslatan }))
  }
  it('normal akış', () => {
    expect(sira([4, 4, 4])).toBe(0)
    expect(sira([3, 4, 4])).toBe(1)
    expect(sira([3, 3, 4])).toBe(2)
    expect(sira([3, 3, 3])).toBe(0)
  })
  it('en çok kartı olan oynar, eşitlikte başlatana yakın olan', () => {
    expect(sira([3, 4, 2])).toBe(1)
    expect(sira([3, 3, 2])).toBe(0)
    expect(sira([4, 3, 4])).toBe(0)
    expect(sira([2, 3, 3], 2)).toBe(2)
    expect(sira([3, 3, 2], 2)).toBe(0)
  })
})

describe('el sonu ve puan', () => {
  it('son kart oynanınca puanlar yazılır, boş ceza yığını −100', () => {
    const d0 = durum({
      avuclar: [[k(6)], [], []],
      cezalar: [[], [k(3), k(11)], [k(5)]],
      orta: [k(13, 'kupa')],
      desteBos: true,
    })
    const d = hamleYap(d0, { tip: 'ortayaAt', kart: 0 })
    expect(d.puanKagidi).toEqual([[-100, 55, 5]])
    expect(d.asama).toBe('oyunSonu')
    expect(gecerliHamleler(d)).toEqual([])
  })
  it('avuçlar bitince deste varsa yeni tur dağıtılır', () => {
    const d0 = durum({ avuclar: [[k(6)], [], []] })
    const d = hamleYap(d0, { tip: 'ortayaAt', kart: 0 })
    expect(d.tur).toBe(2)
    expect(d.oyuncular.map((o) => o.avuc.length)).toEqual([4, 4, 4])
    expect(d.mut).toEqual(d0.mut)
  })
})

it('3 ya da 4 kişi dışında oyun kurulmaz', () => {
  expect(() => yeniOyun({ isimler: ['A', 'B'], toplamEl: 1 })).toThrow()
  expect(() => yeniOyun({ isimler: ['A', 'B', 'C', 'D', 'E'], toplamEl: 1 })).toThrow()
})

it('geçersiz hamle reddedilir, eski durum değişmez', () => {
  const d = durum({ avuclar: [[k(9)], [k(7)], [k(8)]], mut: [k(9, 'kupa')] })
  const h: Hamle = { tip: 'ortayaAt', kart: 0 }
  expect(() => hamleYap(d, h)).toThrow()
  hamleYap(d, { tip: 'mutEslestir', kart: 0 })
  expect(d.mut.length).toBe(1)
})
