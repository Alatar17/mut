import { toplamPuanlar, type Durum } from '../oyun/motor'

// Puan kağıdını resim olarak kaydetmek (Bölüm 8, hatıra): ekrandaki kağıdın aynısı, üstte tarih.
// Telefonda paylaş penceresi açılır (Galeri, WhatsApp…), bilgisayarda PNG iner.
export async function puanKagidiniKaydet(d: Durum, kazanan: string) {
  const renk = (ad: string, yedek: string) => getComputedStyle(document.documentElement).getPropertyValue(ad).trim() || yedek
  const kagit = renk('--kagit', '#f4ecd8')
  const yazi = renk('--kagit-yazi', '#2b2b2b')
  const soluk = renk('--kagit-soluk', '#777')
  const cizgi = renk('--kagit-cizgi', '#c9bfa8')
  const harf = '"Comic Sans MS", "Segoe Print", cursive'
  await document.fonts?.ready

  const kenar = 30
  const ilkSutun = 110
  const sutun = 130
  const satir = 34
  const satirlar = d.puanKagidi.length + 2 // başlık + eller + toplam
  const en = kenar * 2 + ilkSutun + sutun * d.oyuncular.length
  const tabloUst = kenar + 50
  const tabloAlt = tabloUst + satir * satirlar
  const boy = tabloAlt + 60 + kenar
  const olcek = 2
  const tuval = document.createElement('canvas')
  tuval.width = en * olcek
  tuval.height = boy * olcek
  const c = tuval.getContext('2d')!
  c.scale(olcek, olcek)
  c.fillStyle = kagit
  c.fillRect(0, 0, en, boy)
  c.textBaseline = 'middle'

  const yaz = (metin: string, x: number, y: number, boyut: number, hiza: CanvasTextAlign, kalin = false, r = yazi) => {
    c.font = `${kalin ? 'bold ' : ''}${boyut}px ${harf}`
    c.fillStyle = r
    c.textAlign = hiza
    c.fillText(metin, x, y)
  }
  const cizgiCek = (x1: number, y1: number, x2: number, y2: number, kalinlik: number, r: string) => {
    c.strokeStyle = r
    c.lineWidth = kalinlik
    c.beginPath()
    c.moveTo(x1, y1)
    c.lineTo(x2, y2)
    c.stroke()
  }

  yaz('MUT', kenar, kenar + 14, 26, 'left', true)
  yaz(new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }), en - kenar, kenar + 14, 16, 'right', false, soluk)

  const sutunOrtasi = (j: number) => kenar + ilkSutun + sutun * j + sutun / 2
  const satirOrtasi = (r: number) => tabloUst + satir * r + satir / 2
  d.oyuncular.forEach((o, j) => yaz(o.ad, sutunOrtasi(j), satirOrtasi(0), 17, 'center', true))
  d.puanKagidi.forEach((puanlar, i) => {
    yaz(`${i + 1}. el`, kenar + 8, satirOrtasi(i + 1), 16, 'left', false, soluk)
    puanlar.forEach((p, j) => yaz(String(p), sutunOrtasi(j), satirOrtasi(i + 1), 16, 'center'))
  })
  const toplamSatiri = satirlar - 1
  yaz('Toplam', kenar + 8, satirOrtasi(toplamSatiri), 16, 'left', true)
  toplamPuanlar(d).forEach((p, j) => yaz(String(p), sutunOrtasi(j), satirOrtasi(toplamSatiri), 16, 'center', true))

  for (let r = 1; r < toplamSatiri; r++) cizgiCek(kenar, tabloUst + satir * r, en - kenar, tabloUst + satir * r, 1, cizgi)
  cizgiCek(kenar, tabloUst + satir * toplamSatiri, en - kenar, tabloUst + satir * toplamSatiri, 2, yazi)
  d.oyuncular.forEach((_, j) => cizgiCek(kenar + ilkSutun + sutun * j, tabloUst, kenar + ilkSutun + sutun * j, tabloAlt, 1, cizgi))
  yaz(kazanan, en / 2, tabloAlt + 34, 20, 'center', true)

  const blob = await new Promise<Blob | null>(bitti => tuval.toBlob(bitti, 'image/png'))
  if (!blob) return
  const dosya = new File([blob], `mut-puan-${new Date().toISOString().slice(0, 10)}.png`, { type: 'image/png' })
  if (matchMedia('(pointer: coarse)').matches && navigator.canShare?.({ files: [dosya] })) {
    try {
      await navigator.share({ files: [dosya] })
      return
    } catch (hata) {
      // Paylaşmaktan vazgeçtiyse bir şey yapma; paylaşma çalışmadıysa dosya olarak indir.
      if ((hata as Error).name === 'AbortError') return
    }
  }
  const a = document.createElement('a')
  a.href = URL.createObjectURL(dosya)
  a.download = dosya.name
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}
