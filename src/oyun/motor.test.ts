import { describe, expect, it } from 'vitest'
import { kart, type Deger, type Kart } from './kart'
import { acilisKurallari, elSayisiAyarla, kralGruplari, gecerliHamleler, hamleYap, oyunuBitir, siradakiOyuncu, sonrakiEl, valeCarpani, yeniDeste, yeniOyun, type Durum, type Hamle } from './motor'

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
  d.kralEli = false
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

describe('2 gruba yapışır (6.5)', () => {
  // C (2) yığınındaki iki 5'i kendi 5'iyle bana yollar, ben 2 ile bloklarım: üç 5 2 ile C'ye döner.
  const kur = () => {
    const d0 = durum({ avuclar: [[k(2), k(6)], [k(8, 'kupa'), k(9)], [k(5, 'kupa'), k(4)]], cezalar: [[], [], [k(7, 'sinek'), k(5), k(5, 'karo')]], sira: 2 })
    const b = hamleYap(hamleYap(d0, { tip: 'cezaBosalt', kart: 0 }), { tip: 'blok', kart: 0 })
    expect(b.oyuncular[2].ceza).toEqual([k(7, 'sinek'), k(2), k(5), k(5, 'karo'), k(5, 'kupa')])
    return b
  }
  it('grup kendi yığınından boşaltılınca 2 de gider, alttaki kart kalır', () => {
    const d = kur()
    d.oyuncular[2].avuc = [k(5, 'sinek')]
    d.sira = 2
    const s = hamleYap(d, { tip: 'cezaBosalt', kart: 0 })
    expect(s.oyuncular[2].ceza).toEqual([k(7, 'sinek')])
    expect(s.oyuncular[0].ceza).toEqual([k(2), k(5), k(5, 'karo'), k(5, 'kupa'), k(5, 'sinek')])
  })
  it('sadece üstteki kart (beton) alınırsa 2 gruba yapışık kalır', () => {
    const d = kur()
    d.oyuncular[2].ceza.push(k(9, 'kupa'))
    d.oyuncular[2].avuc = [k(9, 'karo')]
    d.sira = 2
    const s = hamleYap(d, { tip: 'cezaBosalt', kart: 0 })
    expect(s.oyuncular[2].ceza).toEqual([k(7, 'sinek'), k(2), k(5), k(5, 'karo'), k(5, 'kupa')])
  })
  it('ortada ve normal yakalanmış 2 yapışmaz', () => {
    const d = durum({ avuclar: [[k(5)], [k(9)], [k(10)]], cezalar: [[k(2), k(5, 'kupa')], [], []] })
    expect(hamleYap(d, { tip: 'cezaBosalt', kart: 0 }).oyuncular[0].ceza).toEqual([k(2)])
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

describe('eksi el (As)', () => {
  const eksi = (p: Parameters<typeof durum>[0]) => {
    const d = durum({ mut: [k(1, 'kupa')], ...p })
    d.eksi = true
    return d
  }
  it('Mut kartlarında As varsa el eksi; yoksa değil', () => {
    expect(acilisKurallari([k(5), k(1)]).eksi).toBe(true)
    expect(acilisKurallari([k(5), k(13)]).eksi).toBe(false)
  })
  it('orta ve Mut yakalaması kendi yığınına gider', () => {
    const d0 = eksi({ avuclar: [[k(9), k(1)], [k(4, 'kupa')], [k(5, 'kupa')]], orta: [k(9, 'kupa')] })
    const d = hamleYap(d0, { tip: 'ortayaAt', kart: 0 })
    expect(d.oyuncular[0].ceza).toEqual([k(9, 'kupa'), k(9)])
    const d2 = hamleYap(eksi({ avuclar: [[k(1)], [k(4, 'kupa')], [k(5, 'kupa')]] }), { tip: 'mutEslestir', kart: 0 })
    expect(d2.oyuncular[0].ceza).toEqual([k(1, 'kupa'), k(1)])
  })
  it('boşalt ve başkasına ekle yok; kendi yığınına ekle, herkesten al var', () => {
    const d = eksi({ avuclar: [[k(5)], [k(4, 'kupa')], [k(6, 'kupa')]], cezalar: [[k(5, 'kupa')], [k(5, 'karo')], [k(5, 'sinek')]] })
    expect(gecerliHamleler(d)).toEqual([
      { tip: 'ortayaAt', kart: 0 },
      { tip: 'ekle', kart: 0, hedef: 0 },
      { tip: 'alIlerlet', kart: 0, hedef: 1 },
      { tip: 'alIlerlet', kart: 0, hedef: 2 },
    ])
    expect(hamleYap(d, { tip: 'ekle', kart: 0, hedef: 0 }).oyuncular[0].ceza).toEqual([k(5, 'kupa'), k(5)])
    const al = hamleYap(d, { tip: 'alIlerlet', kart: 0, hedef: 2 })
    expect(al.oyuncular[0].ceza).toEqual([k(5, 'kupa'), k(5, 'sinek'), k(5)])
    expect(al.oyuncular[2].ceza).toEqual([])
  })
  it('seri: kendi yığınında uzatılır, rakibin yığınındaki seri alınır', () => {
    const seri = [k(4, 'kupa'), k(5, 'kupa'), k(6, 'kupa')]
    const d = eksi({ avuclar: [[k(7)], [k(4)], [k(9)]], cezalar: [[], seri] })
    expect(hamleYap(d, { tip: 'alIlerlet', kart: 0, hedef: 1 }).oyuncular[0].ceza).toEqual([...seri, k(7)])
    const d2 = eksi({ avuclar: [[k(7)], [k(4)], [k(9)]], cezalar: [seri] })
    expect(hamleYap(d2, { tip: 'ekle', kart: 0, hedef: 0 }).oyuncular[0].ceza).toEqual([...seri, k(7)])
  })
  it('blok: yığınından alınan bloklar, kartlar 2 ile geri gelir; zincirde alan geri bloklar', () => {
    const d0 = eksi({ avuclar: [[k(9), k(2)], [k(2, 'kupa'), k(4, 'kupa')], [k(5, 'kupa')]], cezalar: [[], [k(9, 'kupa')]] })
    // Kendine almak (orta/Mut) pencere açmaz; başkasından almak açar.
    const d = hamleYap(d0, { tip: 'alIlerlet', kart: 0, hedef: 1 })
    expect(d.blok).toEqual({ hedef: 1, gonderen: 0, adet: 2 })
    const b = hamleYap(d, { tip: 'blok', kart: 0 })
    expect(b.oyuncular[1].ceza).toEqual([k(2, 'kupa'), k(9, 'kupa'), k(9)])
    expect(b.oyuncular[0].ceza).toEqual([])
    expect(b.blok).toEqual({ hedef: 0, gonderen: 1, adet: 3 })
    const b2 = hamleYap(b, { tip: 'blok', kart: 0 })
    expect(b2.oyuncular[0].ceza).toEqual([k(2), k(2, 'kupa'), k(9, 'kupa'), k(9)])
    expect(b2.oyuncular[1].ceza).toEqual([])
  })
  it('kendine eklemek ya da ortadan almak blok penceresi açmaz', () => {
    const d0 = eksi({ avuclar: [[k(9), k(4)], [k(2, 'kupa'), k(4, 'kupa')], [k(2, 'karo'), k(6)]], orta: [k(9, 'kupa')] })
    expect(hamleYap(d0, { tip: 'ortayaAt', kart: 0 }).blok).toBeUndefined()
  })
  it('puan eksi yazılır, boş yığın +100, Vale ile çarpılır', () => {
    const d = eksi({ avuclar: [[k(9)], [], []], cezalar: [[], [k(5, 'kupa')], [k(11, 'kupa')]], desteBos: true })
    d.carpan = 2
    const son = hamleYap(d, { tip: 'ortayaAt', kart: 0 })
    expect(son.puanKagidi[0]).toEqual([100 * 2, -5 * 2, -25 * 2])
  })
})

describe('serbest el (3)', () => {
  const serbest = (p: Parameters<typeof durum>[0]) => {
    const d = durum({ mut: [k(3, 'kupa')], ...p })
    d.serbest = true
    return d
  }
  it('Mut kartlarında 3 serbest el; As ile önce açılan geçerli', () => {
    expect(acilisKurallari([k(5), k(3)])).toEqual({ eksi: false, serbest: true, bombaEli: false })
    expect(acilisKurallari([k(3), k(5), k(1)])).toEqual({ eksi: false, serbest: true, bombaEli: false })
    expect(acilisKurallari([k(1), k(3)])).toEqual({ eksi: true, serbest: false, bombaEli: false })
    expect(acilisKurallari([k(5), k(13)])).toEqual({ eksi: false, serbest: false, bombaEli: false })
  })
  it('orta, Mut ve kendi yığını yakalaması istenen rakibe gider (kendime değil)', () => {
    const d = serbest({ avuclar: [[k(9), k(3), k(5)], [k(4, 'kupa')], [k(6, 'kupa')]], orta: [k(9, 'kupa')], cezalar: [[k(5, 'kupa')]] })
    const hamleler = gecerliHamleler(d)
    for (const [kart, tip] of (['ortayaAt', 'mutEslestir', 'cezaBosalt'] as const).entries())
      expect(hamleler.filter((h) => h.tip === tip && h.kart === kart).map((h) => h.gonder)).toEqual([1, 2])
    expect(hamleYap(d, { tip: 'ortayaAt', kart: 0, gonder: 2 }).oyuncular[2].ceza).toEqual([k(9, 'kupa'), k(9)])
    expect(hamleYap(d, { tip: 'mutEslestir', kart: 1, gonder: 2 }).oyuncular[2].ceza).toEqual([k(3, 'kupa'), k(3)])
    expect(hamleYap(d, { tip: 'cezaBosalt', kart: 2, gonder: 1 }).oyuncular[1].ceza).toEqual([k(5, 'kupa'), k(5)])
    // Hedef verilmeden yakalama geçersiz; yakalamayan kart ortaya hedefsiz atılır.
    expect(() => hamleYap(d, { tip: 'ortayaAt', kart: 0 })).toThrow()
    expect(gecerliHamleler(serbest({ avuclar: [[k(9)], [k(4)], [k(5)]] }))).toEqual([{ tip: 'ortayaAt', kart: 0 }])
  })
  it('al ve ilerlet herkesten; alınan rakibe geri gitmez (3 kişide tek hedef)', () => {
    const d = serbest({ avuclar: [[k(5)], [k(4)], [k(6)]], cezalar: [[], [k(5, 'kupa')], [k(5, 'karo')]] })
    expect(gecerliHamleler(d).filter((h) => h.tip === 'alIlerlet')).toEqual([
      { tip: 'alIlerlet', kart: 0, hedef: 1, gonder: 2 },
      { tip: 'alIlerlet', kart: 0, hedef: 2, gonder: 1 },
    ])
    const al = hamleYap(d, { tip: 'alIlerlet', kart: 0, hedef: 2, gonder: 1 })
    expect(al.oyuncular[1].ceza).toEqual([k(5, 'kupa'), k(5, 'karo'), k(5)])
    expect(al.oyuncular[2].ceza).toEqual([])
  })
  it('blok penceresi kartların gittiği rakibe açılır, blokta gönderene döner', () => {
    const d0 = serbest({ avuclar: [[k(9), k(4)], [k(4, 'kupa'), k(5)], [k(2, 'kupa'), k(6)]], orta: [k(9, 'kupa')] })
    const d = hamleYap(d0, { tip: 'ortayaAt', kart: 0, gonder: 2 })
    expect(d.blok).toEqual({ hedef: 2, gonderen: 0, adet: 2 })
    const b = hamleYap(d, { tip: 'blok', kart: 0 })
    expect(b.oyuncular[0].ceza).toEqual([k(2, 'kupa'), k(9, 'kupa'), k(9)])
  })
})

describe('bomba eli (10)', () => {
  const bomba = (p: Parameters<typeof durum>[0]) => {
    const d = durum({ mut: [k(10, 'kupa')], ...p })
    d.bombaEli = true
    return d
  }
  it('Mut kartlarında 10 bomba eli; As ile önce açılan geçerli, 3 ile birlikte olur', () => {
    expect(acilisKurallari([k(10), k(1)])).toEqual({ eksi: false, serbest: false, bombaEli: true })
    expect(acilisKurallari([k(1), k(10)])).toEqual({ eksi: true, serbest: false, bombaEli: false })
    expect(acilisKurallari([k(10), k(1), k(3)])).toEqual({ eksi: false, serbest: true, bombaEli: true })
  })
  it('Mut 10 ile kurulur: kartlar sıradakinin yanına (ceza yığınına değil), 2 varsa blok penceresi', () => {
    const d0 = bomba({ avuclar: [[k(10), k(4)], [k(2, 'kupa'), k(5)], [k(6)]] })
    const d = hamleYap(d0, { tip: 'mutEslestir', kart: 0 })
    expect(d.bomba).toEqual({ sahip: 1, kartlar: [k(10, 'kupa'), k(10)] })
    expect(d.oyuncular[1].ceza).toEqual([])
    expect(d.sonHamle?.nereye).toBe('bomba:1')
    expect(d.blok).toEqual({ hedef: 1, gonderen: 0, adet: 2, bomba: true })
    // Blok: bomba gönderene döner, 2 altına girer.
    const b = hamleYap(d, { tip: 'blok', kart: 0 })
    expect(b.bomba).toEqual({ sahip: 0, kartlar: [k(2, 'kupa'), k(10, 'kupa'), k(10)] })
  })
  it('bomba sahibi 10 ile devreder; başkasının 10u sahibindeki bombaya eklenir, blok açılmaz', () => {
    const d = bomba({ mut: [], avuclar: [[k(10, 'karo'), k(4)], [k(10, 'sinek'), k(2)], [k(6)]] })
    d.bomba = { sahip: 0, kartlar: [k(10, 'kupa'), k(10)] }
    // 10 ortaya boşa atılamaz.
    expect(tipler(d, 0)).toEqual(['bomba'])
    const dev = hamleYap(d, { tip: 'bomba', kart: 0 })
    expect(dev.bomba).toEqual({ sahip: 1, kartlar: [k(10, 'kupa'), k(10), k(10, 'karo')] })
    expect(dev.blok?.bomba).toBe(true)
    const ekle = hamleYap({ ...structuredClone(d), sira: 1 }, { tip: 'bomba', kart: 0 })
    expect(ekle.bomba).toEqual({ sahip: 0, kartlar: [k(10, 'kupa'), k(10), k(10, 'sinek')] })
    expect(ekle.blok).toBeUndefined()
  })
  it('10 seriyi tamamlıyorsa oyuncu seçer (seri ya da bomba)', () => {
    const d = bomba({ mut: [], avuclar: [[k(10, 'karo')], [k(4)], [k(6)]], orta: [k(8), k(9)] })
    d.bomba = { sahip: 1, kartlar: [k(10, 'kupa'), k(10)] }
    expect(tipler(d, 0)).toEqual(['bomba', 'ortayaAt'])
    expect(hamleYap(d, { tip: 'ortayaAt', kart: 0 }).oyuncular[1].ceza).toEqual([k(8), k(9), k(10, 'karo')])
  })
  it('serbest elde bomba istenen rakibe gönderilir', () => {
    const d = bomba({ avuclar: [[k(10)], [k(4)], [k(6)]] })
    d.serbest = true
    expect(gecerliHamleler(d).filter((h) => h.tip === 'mutEslestir').map((h) => h.gonder)).toEqual([1, 2])
    expect(hamleYap(d, { tip: 'mutEslestir', kart: 0, gonder: 2 }).bomba?.sahip).toBe(2)
  })
  it('bomba sahibi kendi yığınını boşaltınca bomba kartlarla gider; blokta kartlarla geri döner', () => {
    const d = bomba({ mut: [], avuclar: [[k(5), k(4)], [k(2), k(6)], [k(7)]], cezalar: [[k(9), k(5, 'kupa')], [], []] })
    d.bomba = { sahip: 0, kartlar: [k(10, 'kupa'), k(10)] }
    const b = hamleYap(d, { tip: 'cezaBosalt', kart: 0 })
    expect(b.oyuncular[0].ceza).toEqual([k(9)])
    expect(b.bomba?.sahip).toBe(1)
    expect(b.blok).toEqual({ hedef: 1, gonderen: 0, adet: 2, bombaIle: true })
    const geri = hamleYap(b, { tip: 'blok', kart: 0 })
    expect(geri.bomba?.sahip).toBe(0)
    expect(geri.oyuncular[0].ceza).toEqual([k(9), k(2), k(5, 'kupa'), k(5)])
  })
  it('bomba sahibi başkasına ekler ya da alıp ilerletirse bomba kartlarla gider', () => {
    const d = bomba({ mut: [], avuclar: [[k(5), k(6)], [k(4)], [k(7)]], cezalar: [[], [k(6, 'kupa')], [k(5, 'sinek')]] })
    d.bomba = { sahip: 0, kartlar: [k(10, 'kupa'), k(10)] }
    expect(hamleYap(d, { tip: 'ekle', kart: 0, hedef: 2 }).bomba?.sahip).toBe(2)
    expect(hamleYap(d, { tip: 'ekle', kart: 1, hedef: 1 }).bomba?.sahip).toBe(1)
    // B'nin yığınından 6'yı alıp C'ye ilerletir.
    const i = hamleYap(d, { tip: 'alIlerlet', kart: 1 })
    expect(i.oyuncular[2].ceza).toEqual([k(5, 'sinek'), k(6, 'kupa'), k(6)])
    expect(i.bomba?.sahip).toBe(2)
  })
  it('ortadan yakalama ve başkasının al-ilerlet yapması bombayı taşımaz', () => {
    const d = bomba({ mut: [], avuclar: [[k(5), k(9)], [k(5, 'karo'), k(6)], [k(7)]], cezalar: [[k(5, 'kupa')], [], [k(5, 'sinek')]], orta: [k(9, 'kupa')] })
    d.bomba = { sahip: 0, kartlar: [k(10, 'kupa'), k(10)] }
    expect(hamleYap(d, { tip: 'ortayaAt', kart: 1 }).bomba?.sahip).toBe(0)
    // Soldaki C (2), sıradakinin (benim) yığınımdan alıp B'ye ilerletir; bomba bende kalır.
    const c = bomba({ mut: [], avuclar: [[k(4)], [k(6)], [k(5, 'karo')]], cezalar: [[k(5, 'kupa')], [], []], sira: 2 })
    c.bomba = { sahip: 0, kartlar: [k(10, 'kupa'), k(10)] }
    expect(hamleYap(c, { tip: 'alIlerlet', kart: 0 }).bomba?.sahip).toBe(0)
  })
  it('el sonunda patlar: orta, Mut kalanları ve bomba sahibinin ceza yığınına', () => {
    const d = bomba({ mut: [k(13)], avuclar: [[k(4)], [], []], orta: [k(9)], desteBos: true })
    d.bomba = { sahip: 2, kartlar: [k(10, 'kupa'), k(10)] }
    const son = hamleYap(d, { tip: 'ortayaAt', kart: 0 })
    expect(son.asama).not.toBe('oyun')
    expect(son.bomba).toBeUndefined()
    expect(son.orta).toEqual([])
    expect(son.mut).toEqual([])
    expect(son.oyuncular[2].ceza.slice(-3)).toEqual([k(13), k(10, 'kupa'), k(10)])
    expect(son.patlama?.sahip).toBe(2)
  })
})

describe('Kral (Papaz)', () => {
  const kralli = (p: Parameters<typeof durum>[0]) => {
    const d = durum({ mut: [k(13, 'kupa')], ...p })
    d.kralEli = true
    return d
  }
  it('gruplar: yan yana aynı sayılar (tek kart da), en az 3lük serinin tamamı; yapışık kart grubuyla', () => {
    const d = kralli({ avuclar: [[k(4)], [], []] })
    const yigin = [k(11), k(3), k(3, 'kupa'), k(4), k(5), k(6), k(6, 'kupa'), k(9), k(10)]
    expect(kralGruplari(d, yigin)).toEqual([
      { bas: 0, adet: 1 }, { bas: 1, adet: 2 }, { bas: 3, adet: 1 }, { bas: 4, adet: 1 }, { bas: 5, adet: 2 },
      { bas: 7, adet: 1 }, { bas: 8, adet: 1 }, { bas: 2, adet: 4 },
    ])
    d.yapisik = ['maca-2']
    expect(kralGruplari(d, [k(9), k(2), k(5), k(5, 'kupa')])).toEqual([{ bas: 0, adet: 1 }, { bas: 1, adet: 3 }])
  })
  it('Papaz Mut Papazını alır: iki güç; sıra bende kalır; içten alınan grup Papaz altında istenen rakibe gider', () => {
    const d0 = kralli({ avuclar: [[k(13), k(4)], [k(6)], [k(7)]], cezalar: [[], [k(3), k(3, 'kupa'), k(9)], []] })
    expect(gecerliHamleler(d0).some((h) => h.tip === 'mutEslestir' && h.kart === 0)).toBe(false)
    const d = hamleYap(d0, { tip: 'kral', kart: 0 })
    expect(d.kral?.papazlar).toEqual([k(13), k(13, 'kupa')])
    expect(d.mut).toEqual([])
    expect(d.sira).toBe(0)
    // Normal elde de hedef serbest; kendine yok.
    const al = hamleYap(d, { tip: 'kralAl', kart: -1, yigin: 'ceza:1', bas: 0, adet: 2, gonder: 2 })
    expect(al.oyuncular[1].ceza).toEqual([k(9)])
    expect(al.oyuncular[2].ceza).toEqual([k(13), k(3), k(3, 'kupa')])
    expect(al.blok).toBeUndefined()
    expect(al.sira).toBe(0)
    expect(gecerliHamleler(al).some((h) => h.gonder === 0)).toBe(false)
    // Kalan güç kullanılmaz: Papaz istenen yığına, sıra geçer.
    const son = hamleYap(al, { tip: 'kralBitir', kart: -1, gonder: 1 })
    expect(son.oyuncular[1].ceza).toEqual([k(9), k(13, 'kupa')])
    expect(son.kral).toBeUndefined()
    // Güç bitince sıra 6.6 ile: herkeste 1 kart, başlatan (ben) oynar.
    expect(son.sira).toBe(0)
  })
  it('Papaz gruba yapışır; kartlar alındığı oyuncuya da geri gidebilir (gömülü kartlar üste çıkar)', () => {
    const d = kralli({ mut: [], avuclar: [[k(13)], [k(6)], [k(3, 'karo')]], cezalar: [[], [k(3), k(3, 'kupa'), k(9)], []] })
    const s = hamleYap(d, { tip: 'kral', kart: 0, yigin: 'ceza:1', bas: 0, adet: 2, gonder: 1 })
    expect(s.oyuncular[1].ceza).toEqual([k(9), k(13), k(3), k(3, 'kupa')])
    expect(s.kral).toBeUndefined()
    // Soldaki C 3'üyle yığını boşaltmıyor; ama B'nin yığınından 3'leri alıp ilerletirse Papaz da gider.
    s.sira = 2
    s.oyuncular[1].avuc = []
    const c = hamleYap({ ...s, sira: 0, oyuncular: s.oyuncular.map((o, i) => (i === 0 ? { ...o, avuc: [k(3, 'sinek')] } : o)) }, { tip: 'alIlerlet', kart: 0 })
    expect(c.oyuncular[1].ceza).toEqual([k(9)])
    expect(c.oyuncular[2].ceza).toEqual([k(13), k(3), k(3, 'kupa'), k(3, 'sinek')])
  })
  it('Mut Papazı masadayken Papaz ortaya boşa atılamaz; yokken atılabilir; Kral eli değilse güç yok', () => {
    expect(tipler(kralli({ avuclar: [[k(13)], [k(6)], [k(7)]] }), 0)).toEqual(['kral'])
    expect(tipler(kralli({ mut: [], avuclar: [[k(13)], [k(6)], [k(7)]] }), 0)).toEqual(['kral', 'ortayaAt'])
    expect(tipler(durum({ avuclar: [[k(13)], [k(6)], [k(7)]] }), 0)).toEqual(['ortayaAt'])
  })
  it('eksi elde Kral kendine alır; bomba sahibi kendi yığınından gönderirse bomba da gider', () => {
    const e = kralli({ mut: [], avuclar: [[k(13)], [k(6)], [k(7)]], cezalar: [[k(5)], [k(4)], []] })
    e.eksi = true
    const eh = gecerliHamleler(hamleYap(e, { tip: 'kral', kart: 0 }))
    expect(eh.every((h) => h.gonder === 0 && h.yigin !== 'ceza:0')).toBe(true)
    const b = kralli({ mut: [], avuclar: [[k(13)], [k(6)], [k(7)]], cezalar: [[k(5)], [], []] })
    b.bomba = { sahip: 0, kartlar: [k(10), k(10, 'kupa')] }
    expect(hamleYap(b, { tip: 'kral', kart: 0, yigin: 'ceza:0', bas: 0, adet: 1, gonder: 2 }).bomba?.sahip).toBe(2)
  })
})

describe('el sayısı ve oyunu bitirmek', () => {
  // 3 elli bir oyunun 2. elinin sonu.
  const elSonu = () => {
    const d = yeniOyun({ isimler: ['A', 'B', 'C'], toplamEl: 3, tohum: 1 })
    d.el = 2
    d.puanKagidi = [[10, 20, 30], [5, 5, 5]]
    d.asama = 'elSonu'
    return d
  }
  it('el arasında son ele inilirse oyun biter, artırılırsa geri açılır', () => {
    const bitti = elSayisiAyarla(elSonu(), 2)
    expect(bitti.asama).toBe('oyunSonu')
    const birDaha = elSayisiAyarla(bitti, 4)
    expect(birDaha.asama).toBe('elSonu')
    expect(sonrakiEl(birDaha).el).toBe(3)
  })
  it('oynanan elden aza inilemez', () => {
    expect(elSayisiAyarla(elSonu(), 1).toplamEl).toBe(2)
  })
  it('oyun ortasında bitirince yarım el sayılmaz', () => {
    const d = yeniOyun({ isimler: ['A', 'B', 'C'], toplamEl: 10, tohum: 1 })
    d.el = 3
    d.puanKagidi = [[10, 20, 30], [5, 5, 5]]
    const son = oyunuBitir(d)
    expect(son.asama).toBe('oyunSonu')
    expect(son.el).toBe(2)
    expect(son.toplamEl).toBe(2)
    expect(son.puanKagidi.length).toBe(2)
    // Bir el daha eklenirse 3. el baştan oynanır.
    expect(sonrakiEl(elSayisiAyarla(son, 3)).el).toBe(3)
  })
})
