import { describe, expect, it } from 'vitest'
import { kart, type Deger, type Kart } from './kart'
import { gecerliHamleler, hamleYap, siradakiOyuncu, valeCarpani, yeniDeste, yeniOyun, type Durum, type Hamle } from './motor'

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
  it('seçenekler: orta, kendi cezasını boşalt, ekle, al ve ilerlet', () => {
    expect(tipler(kur(), 0)).toEqual(['alIlerlet', 'cezaBosalt', 'ekle', 'ortayaAt'])
  })
  it('kendi ceza yığınını boşaltınca üstteki aynı kartlar sıradakine gider', () => {
    const d = hamleYap(kur(), { tip: 'cezaBosalt', kart: 0 })
    expect(d.oyuncular[0].ceza).toEqual([k(4)])
    expect(d.oyuncular[1].ceza).toEqual([k(6), k(5, 'sinek'), k(5, 'kupa'), k(5, 'karo'), k(5)])
  })
  it('ekle', () => {
    const d = hamleYap(kur(), { tip: 'ekle', kart: 0, hedef: 1 })
    expect(d.oyuncular[1].ceza).toEqual([k(6), k(5, 'sinek'), k(5)])
  })
  it('al ve ilerlet: sıradakinin sıradakine gider', () => {
    const d = hamleYap(kur(), { tip: 'alIlerlet', kart: 0 })
    expect(d.oyuncular[1].ceza).toEqual([k(6)])
    expect(d.oyuncular[2].ceza).toEqual([k(5, 'sinek'), k(5)])
  })
  it('normal elde başkasının (sıradaki olmayan) ceza yığınına sadece eklenir, alınmaz', () => {
    const d = durum({ avuclar: [[k(5)], [k(7)], [k(8)]], cezalar: [[], [], [k(5, 'kupa')]] })
    expect(tipler(d, 0)).toEqual(['ekle', 'ortayaAt'])
    const sonra = hamleYap(d, { tip: 'ekle', kart: 0, hedef: 2 })
    expect(sonra.oyuncular[2].ceza).toEqual([k(5, 'kupa'), k(5)])
    expect(sonra.sonHamle).toMatchObject({ eslesen: [], nereye: 'ceza:2' })
  })
  it('kendi ceza yığınına eklenmez', () => {
    const d = durum({ avuclar: [[k(5)], [k(7)], [k(8)]], cezalar: [[k(5, 'kupa')], [], []] })
    expect(tipler(d, 0)).toEqual(['cezaBosalt', 'ortayaAt'])
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
  it('Vale çarpanı: Mut kartlarındaki her Vale +2, boş ceza yığını da çarpılır', () => {
    expect([0, 1, 2, 3, 4].map((n) => valeCarpani([...Array(n)].map(() => k(11)).concat(k(5))))).toEqual([1, 2, 4, 6, 8])
    const d0 = durum({ avuclar: [[k(6)], [], []], cezalar: [[], [k(3), k(11)], [k(5)]], desteBos: true })
    d0.carpan = 2
    expect(hamleYap(d0, { tip: 'ortayaAt', kart: 0 }).puanKagidi).toEqual([[-200, 110, 10]])
  })
  it('yeni elde çarpan Mut kartlarından hesaplanır', () => {
    for (let tohum = 1; tohum <= 40; tohum++) {
      const d = yeniOyun({ isimler: ['A', 'B', 'C'], toplamEl: 1, tohum })
      expect(d.carpan).toBe(valeCarpani(d.mut))
    }
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

describe('hamle sonucu (sonHamle) ve dağıtım sırası', () => {
  it('orta yığında eşleşme: eşleşen kartlar ve yerler bildirilir', () => {
    const d = durum({ avuclar: [[k(5)], [k(9)], [k(10)]], orta: [k(4), k(5, 'kupa')] })
    const s = hamleYap(d, { tip: 'ortayaAt', kart: 0 }).sonHamle!
    expect(s).toEqual({ oyuncu: 0, kart: k(5), eslesen: [k(5, 'kupa')], nereden: 'orta', nereye: 'ceza:1' })
  })
  it('eşleşmeyen kart: eşleşen yok, kart ortaya gider', () => {
    const d = durum({ avuclar: [[k(6)], [k(9)], [k(10)]], orta: [k(5)] })
    const s = hamleYap(d, { tip: 'ortayaAt', kart: 0 }).sonHamle!
    expect(s).toMatchObject({ eslesen: [], nereden: null, nereye: 'orta' })
  })
  it('al ve ilerlet: sıradakinin sıradakine gider', () => {
    const d = durum({ avuclar: [[k(7)], [k(9)], [k(10)]], cezalar: [[], [k(7, 'kupa'), k(7, 'karo')], []] })
    const s = hamleYap(d, { tip: 'alIlerlet', kart: 0 }).sonHamle!
    expect(s).toMatchObject({ eslesen: [k(7, 'kupa'), k(7, 'karo')], nereden: 'ceza:1', nereye: 'ceza:2' })
  })
  it('ekle: eşleşen yok, kart sıradakinin ceza yığınına', () => {
    const d = durum({ avuclar: [[k(7)], [k(9)], [k(10)]], cezalar: [[], [k(7, 'kupa')], []] })
    const s = hamleYap(d, { tip: 'ekle', kart: 0, hedef: 1 }).sonHamle!
    expect(s).toMatchObject({ eslesen: [], nereden: null, nereye: 'ceza:1' })
  })
  it('dağıtım sırası: başlatandan herkese birer, sonra Mut; 4 kez', () => {
    const d = yeniOyun({ isimler: ['A', 'B', 'C'], toplamEl: 1, tohum: 3 })
    const n = 3
    const beklenen: Kart[] = []
    for (let t = 0; t < 4; t++) {
      for (let j = 0; j < n; j++) beklenen.push(d.oyuncular[(d.elBaslatani + j) % n].avuc[t])
      beklenen.push(d.mut[t])
    }
    expect(d.dagitim).toEqual(beklenen)
  })
})

describe('blok (2)', () => {
  // C (2) ortadaki 9'u yakalar, kartlar sıradakine, yani bana (0) gelir. Bende iki 2 var.
  const kur = (cAvucu: Kart[] = [k(9, 'kupa'), k(5, 'kupa')]) =>
    durum({ avuclar: [[k(2), k(2, 'sinek'), k(7)], [k(8, 'kupa'), k(6)], cAvucu], orta: [k(9)], sira: 2 })
  const yakala = (d: Durum) => hamleYap(d, { tip: 'ortayaAt', kart: 0 })

  it('ceza yığınına kart gelen oyuncunun 2si varsa pencere açılır, sıra ondadır', () => {
    const d = yakala(kur())
    expect(d.blok).toEqual({ hedef: 0, gonderen: 2, adet: 2 })
    expect(d.sira).toBe(0)
    expect(gecerliHamleler(d)).toEqual([{ tip: 'kabul', kart: -1 }, { tip: 'blok', kart: 0 }, { tip: 'blok', kart: 1 }])
  })
  it('2si olmayana pencere açılmaz', () => {
    const d = hamleYap(durum({ avuclar: [[k(7)], [k(8, 'kupa')], [k(9, 'kupa')]], orta: [k(9)], sira: 2 }), { tip: 'ortayaAt', kart: 0 })
    expect(d.blok).toBeUndefined()
  })
  it('kabul: kartlar kalır, normal sıra devam eder', () => {
    const d = hamleYap(yakala(kur()), { tip: 'kabul', kart: -1 })
    expect(d.blok).toBeUndefined()
    expect(d.oyuncular[0].ceza).toEqual([k(9), k(9, 'kupa')])
    expect(d.sonHamle).toBeUndefined()
  })
  it('blok: kartlar gönderene döner, 2 altlarına girer', () => {
    const d = hamleYap(yakala(kur()), { tip: 'blok', kart: 0 })
    expect(d.oyuncular[0].ceza).toEqual([])
    expect(d.oyuncular[2].ceza).toEqual([k(2), k(9), k(9, 'kupa')])
    expect(d.oyuncular[0].avuc).toEqual([k(2, 'sinek'), k(7)])
    expect(d.sonHamle).toMatchObject({ oyuncu: 0, kart: k(2), nereden: 'ceza:0', nereye: 'ceza:2' })
  })
  it('zincir: gönderenin 2si varsa o da geri bloklar; kartlar 2lerle birlikte gider', () => {
    let d = hamleYap(yakala(kur([k(9, 'kupa'), k(2, 'kupa')])), { tip: 'blok', kart: 0 })
    expect(d.blok).toEqual({ hedef: 2, gonderen: 0, adet: 3 })
    d = hamleYap(d, { tip: 'blok', kart: 0 })
    expect(d.oyuncular[0].ceza).toEqual([k(2, 'kupa'), k(2), k(9), k(9, 'kupa')])
    expect(d.blok).toEqual({ hedef: 0, gonderen: 2, adet: 4 })
    d = hamleYap(d, { tip: 'blok', kart: 0 })
    expect(d.oyuncular[2].ceza.length).toBe(5)
    expect(d.blok).toBeUndefined()
  })
  it('pencere kapanınca sıra 6.6 ile: blok yapanın avucu azaldığı için sıra atlar', () => {
    // Avuçlar 3-2-1 (C oynadıktan sonra); ben blok yapınca 2-2-1 → elin başlatanı (0) oynar.
    const d = hamleYap(yakala(kur()), { tip: 'blok', kart: 0 })
    expect(d.sira).toBe(0)
  })
  it('ekle de bloklanabilir: tek kart + 2 geri döner', () => {
    const d0 = durum({ avuclar: [[k(2), k(7)], [k(8, 'kupa')], [k(5, 'kupa')]], cezalar: [[k(5)], [], []], sira: 2 })
    let d = hamleYap(d0, { tip: 'ekle', kart: 0, hedef: 0 })
    expect(d.blok).toEqual({ hedef: 0, gonderen: 2, adet: 1 })
    d = hamleYap(d, { tip: 'blok', kart: 0 })
    expect(d.oyuncular[0].ceza).toEqual([k(5)])
    expect(d.oyuncular[2].ceza).toEqual([k(2), k(5, 'kupa')])
  })
})

describe('seri (ceza yığınları)', () => {
  const kur = () =>
    durum({
      avuclar: [[k(7)], [k(9, 'kupa')], [k(9, 'karo')]],
      cezalar: [
        [k(2), k(4), k(5), k(6)],
        [k(3, 'kupa'), k(4, 'kupa'), k(5, 'kupa'), k(6, 'kupa')],
        [k(4, 'karo'), k(5, 'karo'), k(6, 'karo')],
      ],
    })
  it('seçenekler: kendi yığınını boşalt, sağdakine ekle / ilerlet, soldakine ekle', () => {
    expect(gecerliHamleler(kur())).toEqual([
      { tip: 'ortayaAt', kart: 0 },
      { tip: 'cezaBosalt', kart: 0 },
      { tip: 'ekle', kart: 0, hedef: 1 },
      { tip: 'ekle', kart: 0, hedef: 2 },
      { tip: 'alIlerlet', kart: 0 },
    ])
  })
  it('kendi yığınındaki seriyi uzatıp gönderir: 2 kalır', () => {
    const d = hamleYap(kur(), { tip: 'cezaBosalt', kart: 0 })
    expect(d.oyuncular[0].ceza).toEqual([k(2)])
    expect(d.oyuncular[1].ceza.slice(-4)).toEqual([k(4), k(5), k(6), k(7)])
  })
  it('sağdakinin serisini (3-4-5-6) alıp onun sıradakine ilerletir', () => {
    const d = hamleYap(kur(), { tip: 'alIlerlet', kart: 0 })
    expect(d.oyuncular[1].ceza).toEqual([])
    expect(d.oyuncular[2].ceza.slice(-5).map((x) => x.deger)).toEqual([3, 4, 5, 6, 7])
    expect(d.sonHamle).toMatchObject({ nereden: 'ceza:1', nereye: 'ceza:2' })
  })
  it('soldakinin serisine ekle: 7 orada kalır', () => {
    const d = hamleYap(kur(), { tip: 'ekle', kart: 0, hedef: 2 })
    expect(d.oyuncular[2].ceza.map((x) => x.deger)).toEqual([4, 5, 6, 7])
  })
  it('sadece üstteki sıralı kartlar: 4-4-5 üstüne 6 → üstteki 4-5 ile seri, alttaki 4 kalır', () => {
    const d = durum({ avuclar: [[k(6)], [k(9, 'kupa')], [k(9, 'karo')]], cezalar: [[k(4), k(4, 'kupa'), k(5)], [], []] })
    expect(hamleYap(d, { tip: 'cezaBosalt', kart: 0 }).oyuncular[0].ceza).toEqual([k(4)])
  })
  it('seri değilse (4-6 üstüne 7 atlamalı, 5-5 üstüne 6 tek) ceza yığınına hamle yok', () => {
    const d = durum({ avuclar: [[k(7)], [k(9, 'kupa')], [k(9, 'karo')]], cezalar: [[k(4), k(6)], [k(5, 'kupa'), k(5, 'karo')], []] })
    expect(tipler(d, 0)).toEqual(['ortayaAt'])
  })
})

describe('seri (orta yığın)', () => {
  const ortayaAt = (orta: Kart[], kartim: Kart, mut: Kart[] = []) =>
    hamleYap(durum({ avuclar: [[kartim], [k(9, 'kupa')], [k(9, 'karo')]], orta, mut }), { tip: 'ortayaAt', kart: 0 })
  it('4-5 üstüne 6: üçü sıradakinin ceza yığınına gider', () => {
    const d = ortayaAt([k(4), k(5)], k(6))
    expect(d.orta).toEqual([])
    expect(d.oyuncular[1].ceza).toEqual([k(4), k(5), k(6)])
  })
  it('sadece üstteki sıralı kartlar alınır: 2-4-5 üstüne 6 → 2 kalır', () => {
    const d = ortayaAt([k(2), k(4), k(5)], k(6))
    expect(d.orta).toEqual([k(2)])
    expect(d.oyuncular[1].ceza).toEqual([k(4), k(5), k(6)])
  })
  it('uzun seri: 3-4-5-6 üstüne 7 → beşi birden', () => {
    expect(ortayaAt([k(3), k(4), k(5), k(6)], k(7)).oyuncular[1].ceza.length).toBe(5)
  })
  it('Vale-Kız üstüne Papaz seri; Papaz üstüne As seri değil (başa dönmez)', () => {
    expect(ortayaAt([k(11), k(12)], k(13)).oyuncular[1].ceza.length).toBe(3)
    expect(ortayaAt([k(12), k(13)], k(1)).orta.length).toBe(3)
  })
  it('seri olmayanlar: azalan, atlamalı, iki kart', () => {
    expect(ortayaAt([k(6), k(5)], k(4)).orta.length).toBe(3)
    expect(ortayaAt([k(4), k(5)], k(7)).orta.length).toBe(3)
    expect(ortayaAt([k(5)], k(6)).orta.length).toBe(2)
  })
  it('Mut kartlarında 6 varken ortada 4-5: oyuncu seriyi de Mut 6yı da seçebilir', () => {
    const d = durum({ avuclar: [[k(6)], [k(9, 'kupa')], [k(9, 'karo')]], orta: [k(4), k(5)], mut: [k(6, 'kupa')] })
    expect(tipler(d, 0)).toEqual(['mutEslestir', 'ortayaAt'])
  })
  it('Mut kartlarında 6 varken seri yoksa 6 ortaya atılamaz', () => {
    const d = durum({ avuclar: [[k(6)], [k(9, 'kupa')], [k(9, 'karo')]], orta: [k(4)], mut: [k(6, 'kupa')] })
    expect(tipler(d, 0)).toEqual(['mutEslestir'])
  })
  it('hamle sonucu seriyi bildirir', () => {
    expect(ortayaAt([k(4), k(5)], k(6)).sonHamle).toMatchObject({ eslesen: [k(4), k(5)], nereden: 'orta', nereye: 'ceza:1' })
  })
})

describe('takas (8)', () => {
  // Bende 8 ve 4; B'de üç kart, C'de iki kart. Ortada 6-7 (8 ortaya bırakılırsa seri olur).
  const kur = (p: { mut?: Kart[]; cAvucu?: Kart[] } = {}) =>
    durum({
      avuclar: [[k(8), k(4)], [k(9, 'kupa'), k(10, 'kupa'), k(11, 'kupa')], p.cAvucu ?? [k(5, 'kupa'), k(5, 'karo')]],
      orta: [k(6), k(7)],
      mut: p.mut,
    })

  it('8 ile herkesle takas seçeneği var, diğer kartlarla yok', () => {
    const d = kur()
    expect(gecerliHamleler(d).filter((h) => h.tip === 'takas')).toEqual([
      { tip: 'takas', kart: 0, hedef: 1 },
      { tip: 'takas', kart: 0, hedef: 2 },
    ])
  })
  it('takas: avuçlar yer değiştirir, 8 ortaya düşer, seri olmaz', () => {
    const d = hamleYap(kur(), { tip: 'takas', kart: 0, hedef: 1 })
    expect(d.oyuncular[0].avuc).toEqual([k(9, 'kupa'), k(10, 'kupa'), k(11, 'kupa')])
    expect(d.oyuncular[1].avuc).toEqual([k(4)])
    expect(d.orta).toEqual([k(6), k(7), k(8)])
    expect(d.oyuncular.every((o) => o.ceza.length === 0)).toBe(true)
    expect(d.sonHamle).toEqual({ oyuncu: 0, kart: k(8), eslesen: [], nereden: null, nereye: 'orta', takas: 1 })
  })
  it('aynı 8 ortaya bırakılırsa seri yakalanır (seçim oyuncunun)', () => {
    const d = hamleYap(kur(), { tip: 'ortayaAt', kart: 0 })
    expect(d.oyuncular[1].ceza).toEqual([k(6), k(7), k(8)])
  })
  it('bloklanamaz: hedefte 2 olsa da pencere açılmaz; sıra 6.6 ile', () => {
    // Takastan sonra avuçlar: ben 2 (C'nin), B 3, C 1 → en çok kart B'de.
    const d = hamleYap(kur({ cAvucu: [k(2, 'kupa'), k(5, 'kupa')] }), { tip: 'takas', kart: 0, hedef: 2 })
    expect(d.blok).toBeUndefined()
    expect(d.sira).toBe(1)
  })
  it('Mut kartlarında 8 varken: ortaya atılamaz ama takas serbest, Mut 8 yerinde kalır', () => {
    const d0 = kur({ mut: [k(8, 'kupa')] })
    d0.orta = [k(3)]
    expect(tipler(d0, 0)).toEqual(['mutEslestir', 'takas', 'takas'])
    const d = hamleYap(d0, { tip: 'takas', kart: 0, hedef: 2 })
    expect(d.mut).toEqual([k(8, 'kupa')])
    expect(d.orta).toEqual([k(3), k(8)])
  })
  it('avucu boş olanla takas: kartlarım ona gider, ben boş kalırım', () => {
    const d = hamleYap(kur({ cAvucu: [] }), { tip: 'takas', kart: 0, hedef: 2 })
    expect(d.oyuncular[0].avuc).toEqual([])
    expect(d.oyuncular[2].avuc).toEqual([k(4)])
  })
  it('blok penceresinde takas yok: hedef sadece blok ya da kabul yapar', () => {
    // C ortadaki 9'u yakalayıp bana yollar; bende 2 ve 8 var.
    const d0 = durum({ avuclar: [[k(2), k(8)], [k(4, 'kupa')], [k(9, 'kupa'), k(5, 'kupa')]], orta: [k(9)], sira: 2 })
    const d = hamleYap(d0, { tip: 'ortayaAt', kart: 0 })
    expect(d.blok?.hedef).toBe(0)
    expect(gecerliHamleler(d).map((h) => h.tip).sort()).toEqual(['blok', 'kabul'])
  })
  it('son kartı 8 olan takas yapar: karşısındaki boş kalır', () => {
    const d0 = kur()
    d0.oyuncular[0].avuc = [k(8)]
    d0.deste.push(k(4))
    const d = hamleYap(d0, { tip: 'takas', kart: 0, hedef: 2 })
    expect(d.oyuncular[0].avuc).toEqual([k(5, 'kupa'), k(5, 'karo')])
    expect(d.oyuncular[2].avuc).toEqual([])
  })
})

describe('çekme (Kız)', () => {
  // Bende Kız ve 4; B'de üç kart, C'de iki kart. Ortada 10-J (Kız ortaya bırakılırsa seri olur).
  const kur = (p: { mut?: Kart[]; cAvucu?: Kart[] } = {}) =>
    durum({
      avuclar: [[k(12), k(4)], [k(9, 'kupa'), k(2, 'kupa'), k(5, 'kupa')], p.cAvucu ?? [k(5, 'karo'), k(6, 'karo')]],
      orta: [k(10), k(11)],
      mut: p.mut,
    })

  it('Kız ile herkesten çekme seçeneği var, diğer kartlarla yok', () => {
    expect(gecerliHamleler(kur()).filter((h) => h.tip === 'cek')).toEqual([
      { tip: 'cek', kart: 0, hedef: 1 },
      { tip: 'cek', kart: 0, hedef: 2 },
    ])
  })
  it('avucu boş olandan çekme yok', () => {
    expect(gecerliHamleler(kur({ cAvucu: [] })).filter((h) => h.tip === 'cek')).toEqual([{ tip: 'cek', kart: 0, hedef: 1 }])
  })
  it('çekme: seçilen kart avucumun sonuna gelir, Kız ortaya düşer, seri olmaz', () => {
    const d = hamleYap(kur(), { tip: 'cek', kart: 0, hedef: 1, cekilen: 1 })
    expect(d.oyuncular[0].avuc).toEqual([k(4), k(2, 'kupa')])
    expect(d.oyuncular[1].avuc).toEqual([k(9, 'kupa'), k(5, 'kupa')])
    expect(d.orta).toEqual([k(10), k(11), k(12)])
    expect(d.oyuncular.every((o) => o.ceza.length === 0)).toBe(true)
    expect(d.sonHamle).toEqual({
      oyuncu: 0, kart: k(12), eslesen: [], nereden: null, nereye: 'orta', cekme: { hedef: 1, kart: k(2, 'kupa') },
    })
  })
  it('seçim verilmezse rastgele bir kart çekilir; aynı tohumla hep aynı kart', () => {
    const a = hamleYap(kur(), { tip: 'cek', kart: 0, hedef: 1 })
    const b = hamleYap(kur(), { tip: 'cek', kart: 0, hedef: 1 })
    expect(a.oyuncular[0].avuc.length).toBe(2)
    expect(a.oyuncular[1].avuc.length).toBe(2)
    expect(a.sonHamle?.cekme).toEqual(b.sonHamle?.cekme)
  })
  it('aynı Kız ortaya bırakılırsa seri yakalanır (seçim oyuncunun)', () => {
    expect(hamleYap(kur(), { tip: 'ortayaAt', kart: 0 }).oyuncular[1].ceza).toEqual([k(10), k(11), k(12)])
  })
  it('bloklanamaz; sıra 6.6 ile: çeken yine en kalabalık olunca tekrar oynar', () => {
    // Çekmeden sonra: ben 2, B 2, C 2 → eşitlikte başlatan (ben).
    const d = hamleYap(kur(), { tip: 'cek', kart: 0, hedef: 1, cekilen: 1 })
    expect(d.blok).toBeUndefined()
    expect(d.sira).toBe(0)
  })
  it('Mut kartlarında Kız varken: ortaya atılamaz ama çekme serbest, Mut Kız yerinde kalır', () => {
    const d0 = kur({ mut: [k(12, 'kupa')] })
    d0.orta = [k(3)]
    expect(tipler(d0, 0)).toEqual(['cek', 'cek', 'mutEslestir'])
    const d = hamleYap(d0, { tip: 'cek', kart: 0, hedef: 2, cekilen: 0 })
    expect(d.mut).toEqual([k(12, 'kupa')])
    expect(d.orta).toEqual([k(3), k(12)])
  })
  it('son kartı Kız olan çeker: çektiği kartla avucunda bir kart kalır', () => {
    const d0 = kur()
    d0.oyuncular[0].avuc = [k(12)]
    d0.deste.push(k(4))
    const d = hamleYap(d0, { tip: 'cek', kart: 0, hedef: 2, cekilen: 1 })
    expect(d.oyuncular[0].avuc).toEqual([k(6, 'karo')])
    expect(d.oyuncular[2].avuc).toEqual([k(5, 'karo')])
  })
})

it('çekme: avuçta olmayan sıra verilirse hata (yanlış kart çekilmez)', () => {
  const d = durum({ avuclar: [[k(12)], [k(9, 'kupa')], [k(5, 'karo')]] })
  expect(() => hamleYap(d, { tip: 'cek', kart: 0, hedef: 1, cekilen: -1 })).toThrow()
  expect(() => hamleYap(d, { tip: 'cek', kart: 0, hedef: 1, cekilen: 1 })).toThrow()
})
