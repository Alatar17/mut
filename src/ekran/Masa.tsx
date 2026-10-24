import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from 'react'
import { kartBoyu, type Kart as KartTipi } from '../oyun/kart'
import { cikanOnlar, elPuanlari, kralGruplari, elSayisiAyarla, gecerliHamleler, hamleGecerliMi, hamleYap, oyunuBitir, sonraki, sonrakiEl, toplamPuanlar, yeniOyun, type Durum, type Hamle, type HamleSonucu, type Oyuncu } from '../oyun/motor'
import { akilliBotHamlesi } from '../oyun/bot'
import { karistir } from '../oyun/rastgele'
import { asBotDenemesi, asDenemesi, bakisDenemesi, blokDenemesi, bombaBosaltmaDenemesi, yapisikDenemesi, kralDenemesi, kralBotDenemesi, bombaBotDenemesi, bombaDenemesi, patlamaDenemesi, cezaSerisiDenemesi, kizBotDenemesi, kizDenemesi, seriDenemesi, takasBotDenemesi, takasDenemesi, ucBotDenemesi, ucDenemesi, valeDenemesi } from '../oyun/deneme'
import { Kart } from './Kart'
import { kartEni, kartOlcegi } from './boyut'
import { bekle, dagitimOncesi, GizliKartlar, kartKimligi, kartYerleri, konumOlc, patlamaOncesi, patlamaOrtada, UcanKart, type Konum, type Ucus } from './animasyon'
import { SAHNE_BOY, SAHNE_EN } from './Sahne'
import { BombaYigini, CezaYigini, Deste, OrtaYigin } from './Yiginlar'
import { useYiginBakisi, YiginYelpazesi, type BakisGorunusu } from './YiginBakisi'
import { DestePenceresi, type KartlarimGorunusu } from './DestePenceresi'
import { puanKagidiniKaydet } from './puanResmi'

const AVUC_KART_EN = 60
// "Kaç el?" penceresindeki hazır seçenekler; başka sayı da yazılabilir.
const EL_SECENEKLERI = [1, 3, 5, 10]
const EN_COK_EL = 99

// Hamle süresi: süre bitince oyuncunun yerine bot oynar. Son UYARI_SURESI'nde süre görünür. Kullanıcı Test menüsünde seçecek.
const HAMLE_SURELERI = { Kapalı: 0, '20 sn': 20000, '30 sn': 30000, '45 sn': 45000 }
type HamleSuresi = keyof typeof HAMLE_SURELERI
const UYARI_SURESI = 10000
// Kız ile çekmede kart seçme süresi; bitince rastgele kart çekilir (hamle süresi kapalıysa süre yok).
const KIZ_SURESI = 10000
// Üst üste bu kadar süre biterse oyuncu "uzakta" sayılır, ekrana dokunana kadar yerine bot oynar.
const UZAKTA_SAYISI = 2

// Botun her hamleden önce beklediği süre (ms). Kullanıcı Test menüsünde deneyip seçecek.
const BOT_HIZLARI = { 'Çok hızlı': 100, Hızlı: 400, Orta: 1000, Yavaş: 2000 }
type BotHizi = keyof typeof BOT_HIZLARI

// Ceza yığınında üstteki kartlar arası kaydırma (orta yığında 14). Kullanıcı Test menüsünde seçecek.
const CEZA_ARALIKLARI = { '8 px': 8, '10 px': 10, '12 px': 12 }
type CezaAraligi = keyof typeof CEZA_ARALIKLARI
// Yığına bakış (basılı tutunca): ortada büyük şerit ya da yığının yerinde. Oyuncunun ayarı (☰ menüsü).
// Ceza ve orta yığının altındaki zemin (masa sınıfı, stil.css). Kullanıcı Görünüş menüsünde seçecek.
const YIGIN_ZEMINLERI = { Kesikli: 'zemin-kesikli', Çerçeve: 'zemin-cerceve', Yok: 'zemin-yok' }
type YiginZemini = keyof typeof YIGIN_ZEMINLERI
// Mut kutusunun zemini; ilk seçenek yuva (kullanıcı kararı, şimdilik). Kullanıcı Görünüş menüsünde seçecek.
const MUT_ZEMINLERI = { Yuva: 'mut-yuva', 'Koyu kutu': 'mut-kutu', Kesikli: 'mut-kesikli', Çerçeve: 'mut-cerceve', Yok: 'mut-yok' }
type MutZemini = keyof typeof MUT_ZEMINLERI
// Vale / Kız / Papaz'ın ortası (kullanıcı 2026-10-24: Harf kalktı, Sade varsayılan, ikisi şimdilik kalsın).
const JQK_GORUNUSLERI = { Sade: 'jqk-sade', Çerçeve: 'jqk-cerceve' }
type JqkGorunusu = keyof typeof JQK_GORUNUSLERI
// Gruba yapışık 2 / Papaz'ın görünüşü (masa sınıfı, stil.css). Varsayılan = eskisi gibi ayrı görünüş yok (kullanıcı 2026-10-24).
const YAPISIK_GORUNUSLERI = { Varsayılan: '', 'Taşan köşe': 'yapisik-kose', Çapraz: 'yapisik-capraz', İşaret: 'yapisik-isaret' }
type YapisikGorunusu = keyof typeof YAPISIK_GORUNUSLERI
// Ceza yığınının puanı: yanında / zeminin üst kenarında / köşede rozet (masa sınıfı). Kullanıcı Görünüş menüsünde seçecek.
const PUAN_YERLERI = { Yanında: 'puan-yaninda', Kenarda: 'puan-kenarda', Rozet: 'puan-rozette' }
type PuanYeri = keyof typeof PUAN_YERLERI
// Deste penceresinde kendi avucumdaki kartlar.
const KARTLARIM: Record<KartlarimGorunusu, true> = { Soluk: true, Çerçeveli: true }
const BAKIS_GORUNUSLERI: Record<BakisGorunusu, true> = { Yerinde: true, Ortada: true }
// Avucun yukarı kayması (masa değişkeni --el-kayma, stil.css). Varsayılan +10 px (kullanıcı kararı, 2026-10-22).
const EL_YUKSEKLIKLERI = { Eski: '0px', '+10 px': '10px', '+20 px': '20px' }
type ElYuksekligi = keyof typeof EL_YUKSEKLIKLERI
// Masadaki bütün kartlar bu oranda büyür (boyut.ts). Varsayılan %110 (kullanıcı kararı, 2026-10-23, telefonda denendi).
const KART_BOYUTLARI = { '%110': 1.1, '%115': 1.15 }
type KartBoyutu = keyof typeof KART_BOYUTLARI

// Animasyon süreleri bu çarpanla uzar/kısalır. Kullanıcı Test menüsünde seçecek.
const ANIMASYON_HIZLARI = { Hızlı: 0.6, Orta: 1, Yavaş: 1.6 }
type AnimasyonHizi = keyof typeof ANIMASYON_HIZLARI
// Yakalamada kart eşleştiği yere indikten sonra, kartlar birlikte uçmadan önceki duraklama (ms).
const DURAKLAMALAR = { Kısa: 250, Uzun: 600 }
type Duraklama = keyof typeof DURAKLAMALAR
// Serbest elde yakalanan kartların hedefi nasıl seçilir: rakibe dokunarak ya da inen kartı ona sürükleyerek.
// Kullanıcı Test menüsünde deneyip seçecek.
// donus: dağıtımda benim kartlarımın inince dönerek açılma süresi.
const SURE = { kalkma: 250, ucus: 380, dagitimAraligi: 70, donus: 380 }
// Blok penceresi süresi (6.5.1); kahve testinde ayarlanacak.
const BLOK_SURESI = 3000
// Kurulu kalkan bloklamadan önce parladığı görülsün diye kısa bekleme (ms).
const KALKAN_GECIKMESI = 300
// Kız ile çekmede hedef avucun karılma süresi ve botun ters kartlardan seçmeden önce düşünme süresi (ms).
const KARMA_SURESI = 700
const BOT_SECIM_SURESI = 500
// Patlama: son kart indikten sonra bekleme, sonra kartlar ortaya toplanır; orta puanı yanıp söndükten sonra
// hepsi ceza yığınına gider (ms).
const PATLAMA_BEKLEMESI = 500
const ORTADA_BEKLEME = 900

// Blok penceresi açıkken normal bir hamle (kart atmak) kabul sayılır: önce kabul uygulanır, hamle ondan sonraki
// durumda yapılır. Kabulden sonra sıra o oyuncuda değilse hamle geçersiz olur (6.6 bozulmasın).
const KABUL: Hamle = { tip: 'kabul', kart: -1 }
const kabulSonrasi = (d: Durum, h: Hamle) => (d.blok && h.tip !== 'blok' && h.tip !== 'kabul' ? hamleYap(d, KABUL) : d)

// Hedefi (gonder) dışında h ile aynı geçerli hamleler: serbest elde her rakip için bir tane, normalde en fazla bir.
const ayniHamleler = (d: Durum, h: Hamle) => gecerliHamleler(d).filter(g => g.tip === h.tip && g.kart === h.kart && g.hedef === h.hedef)

// Ekranda bir noktanın altındaki oyuncu: ceza yığını, avucu ya da isim etiketi (data-hedef "ceza:<i>" / "avuc:<i>").
function oyuncuAltinda(x: number, y: number): number | null {
  const hedef = document.elementsFromPoint(x, y).map(el => el.closest<HTMLElement>('[data-hedef]')).find(el => el)?.dataset.hedef
  const [yer, i] = hedef?.split(':') ?? []
  return yer === 'ceza' || yer === 'avuc' ? Number(i) : null
}

// 0 = sen (alt), 1 = sağdaki (sıradaki), 2 = soldaki
const yeniOyunKur = (toplamEl: number) => yeniOyun({ isimler: ['Sen', 'Bot B', 'Bot C'], toplamEl })
const RAKIP_KART_EN = 56

// Hazır sözler (kaba ilk sürüm; asıl hali 2. aşamada herkes kendi telefonundan). Kahvenin kendi lafları, aynen.
const HAZIR_SOZLER = ['Çok saçma kendime sokamıyom!', 'Tost oldu.', 'Beton döktü.', 'Şimdi ben kızı aldım … soktum.', 'Üstüne kapatma göt!']
const KIZ_SOZU = HAZIR_SOZLER[3]
const KIZ_ISIMLERI = ["Tahir'e", "Uğur'a", "Mert'e"]
const kizSozu = (isim: string) => `Şimdi ben kızı aldım ${isim} soktum.`
// Botlar ve bota düşen oyuncu konuşmaz (kullanıcı kararı 2026-10-24); söz sadece elle seçilir.
const BALON_SURESI = 3000

// Elde tutulan kartlar gibi hafif yelpaze: kenardaki kartlar biraz döner ve alçalır.
function yelpaze(sira: number, adet: number) {
  const fark = sira - (adet - 1) / 2
  return `translateY(${Math.round(fark * fark * 2)}px) rotate(${fark * 4}deg)`
}

// Aynı yelpaze, yan oturan oyuncu için: kenardaki kartlar oyuncuya doğru çekilir.
function yanYelpaze(sira: number, adet: number, taraf: 'sol' | 'sag') {
  const fark = sira - (adet - 1) / 2
  const kayma = Math.round(fark * fark * 2)
  return taraf === 'sol'
    ? `translateX(${-kayma}px) rotate(${fark * 4}deg)`
    : `translateX(${kayma}px) rotate(${-fark * 4}deg)`
}

const RAKIP_KART_BINME = 20

// Bırakılan yer ekranda data-hedef ile işaretli: "orta", "mut:<sayı>", "ceza:<oyuncu>", "avuc:<oyuncu>" (8 ile takas, Kız ile çekme),
// "bomba:<oyuncu>" (bomba elinde 10).
// red: kart sessizce avuca döner (Mut kuralına takıldıysa eşleşen Mut kartı sallanır).
type Birakma = 'kabul' | 'red' | 'bekle'

// Mut kuralına takılan hamlede eşleşen Mut kartı "olmaz" der gibi hafif sallanır. Sadece kartı bırakanın ekranında.
function salla(el: Element) {
  const x = [0, -6, 6, -4, 3, 0].map(p => ({ transform: `translateX(${p}px)` }))
  el.animate(x, { duration: 400 })
}

// Kız ile çekmede hedefin avucu karılır (9.2): kartlar iki kez ortada toplanıp yeniden açılır.
function avucuKar(masa: HTMLElement, koltuk: number, sure: number) {
  const avuc = masa.querySelector<HTMLElement>(`[data-yer="avuc:${koltuk}"]`)
  if (!avuc) return Promise.resolve()
  const kartlar = [...avuc.querySelectorAll<HTMLElement>(':scope > .avuc-kart, :scope > .yan-kart')]
  return Promise.all(
    kartlar.map((el, i) => {
      const dx = avuc.offsetWidth / 2 - (el.offsetLeft + el.offsetWidth / 2)
      const dy = avuc.offsetHeight / 2 - (el.offsetTop + el.offsetHeight / 2)
      const acik = el.style.transform || 'translate(0px, 0px)'
      const toplu = `translate(${dx}px, ${dy}px) rotate(${(i % 2 ? 1 : -1) * (4 + i * 2)}deg) ${acik}`
      const x = [acik, toplu, acik, toplu, acik].map(transform => ({ transform }))
      return el.animate(x, { duration: sure, easing: 'ease-in-out' }).finished.catch(() => {})
    }),
  )
}

// Bot oynayacağı kartı önce masaya doğru biraz kaldırır.
function rakipKartDuzeni(sira: number, adet: number, taraf: 'sol' | 'sag', duz: boolean, kalkik: boolean) {
  const kalkma = kalkik ? `translateX(${taraf === 'sol' ? 16 : -16}px) ` : ''
  return kalkma + (duz ? '' : yanYelpaze(sira, adet, taraf)) || undefined
}

// Masanın sol/sağ kenarına oturmuş oyuncu: kartlar ona dönük, dikey dizili, masanın ortası hizasında.
// sec: Kız ile çekmede ters kartlardan birine dokunmak.
// secilebilir: serbest elde yakalanan kartların gönderilebileceği oyuncu (isim etiketi hafifçe parlar).
// sureUyari: hamle süresinin son saniyeleri, isim etiketinin çevresinde azalan halka.
function Rakip({ oyuncu, koltuk, kalkik, birak, sec, sirada, secilebilir, sureUyari, taraf, carpan, kapali, duz, kirpik, cezaAralik, yapisik }: { oyuncu: Oyuncu; koltuk: number; kalkik: string | null; birak: (kart: number, hedef: string) => Birakma; sec: (kart: number) => void; sirada: boolean; secilebilir: boolean; sureUyari: boolean; taraf: 'sol' | 'sag'; carpan: number; kapali: boolean; duz: boolean; kirpik: boolean; cezaAralik: number; yapisik: string[] }) {
  const avucBoyu = kartEni(RAKIP_KART_EN) + (oyuncu.avuc.length - 1) * kartEni(RAKIP_KART_EN - RAKIP_KART_BINME)
  return (
    <>
      {/* İsim etiketi de takas hedefi: avucu boşken bırakılacak yer kalmasın. */}
      <div className={`rakip-ad ${taraf}` + (sirada ? ' sirada' : '') + (secilebilir ? ' secilebilir' : '') + (sureUyari ? ' sure-uyari' : '')} style={{ top: SAHNE_BOY / 2 - avucBoyu / 2 - 30 }} data-hedef={`avuc:${koltuk}`}>{oyuncu.ad}</div>
      <div className={`rakip-avuc ${taraf}` + (kirpik ? ' kirpik' : '')} data-yer={`avuc:${koltuk}`} data-hedef={`avuc:${koltuk}`}>
        {oyuncu.avuc.map((k, i) => (
          <RakipKart
            key={kartKimligi(k)}
            kart={k}
            kapali={kapali}
            transform={rakipKartDuzeni(i, oyuncu.avuc.length, taraf, duz, kalkik === kartKimligi(k))}
            birak={hedef => birak(i, hedef)}
            dokun={() => sec(i)}
          />
        ))}
      </div>
      <div className={`rakip-ceza ${taraf}`}>
        <CezaYigini kartlar={oyuncu.ceza} carpan={carpan} puanTarafi={taraf === 'sol' ? 'sag' : 'sol'} donuk={taraf} hedef={`ceza:${koltuk}`} aralik={cezaAralik} yapisik={yapisik} />
      </div>
    </>
  )
}

// Toplamı en az olan kazanır; eşitlikte berabere (Bölüm 8). Hiç el bitmeden bitirilen oyunun kazananı yok.
function kazananYazisi(d: Durum) {
  if (d.puanKagidi.length === 0) return 'Hiç el bitmedi'
  const toplam = toplamPuanlar(d)
  const enAz = Math.min(...toplam)
  const kazananlar = d.oyuncular.filter((_, i) => toplam[i] === enAz)
  return kazananlar.length > 1 ? 'Berabere' : `Kazanan: ${kazananlar[0].ad}`
}

function PuanPenceresi({ d, kapat, sonrakiEl, yeniOyun }: { d: Durum; kapat: () => void; sonrakiEl: () => void; yeniOyun: () => void }) {
  return (
    <div className="pencere-arka" onClick={kapat}>
      <div className="puan-kagidi" onClick={e => e.stopPropagation()}>
        <table>
          <thead>
            <tr><th />{d.oyuncular.map(o => <th key={o.ad}>{o.ad}</th>)}</tr>
          </thead>
          <tbody>
            {d.puanKagidi.map((satir, i) => (
              <tr key={i}><td>{i + 1}. el</td>{satir.map((p, j) => <td key={j}>{p}</td>)}</tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td>Toplam</td>
              {toplamPuanlar(d).map((p, j) => <td key={j}>{p}</td>)}
            </tr>
          </tfoot>
        </table>
        {d.asama === 'elSonu' && <button className="kagit-dugme" onClick={sonrakiEl}>Sonraki el</button>}
        {d.asama === 'oyunSonu' && (
          <>
            <div className="kazanan">{kazananYazisi(d)}</div>
            <div className="kagit-dugmeler">
              {d.puanKagidi.length > 0 && <button className="kagit-dugme" onClick={() => puanKagidiniKaydet(d, kazananYazisi(d))}>Kaydet</button>}
              <button className="kagit-dugme" onClick={yeniOyun}>Yeni oyun</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// "Kaç el?": hazır sayılardan biri ya da yazılan sayı. Oyun ortasında oynanan elden azı seçilemez (enAz).
// destePenceresi: oyun başında açılıp kapatılan ayar (9.2); degistir verilmezse satır görünmez.
function ElSayisiPenceresi({ enAz, sec, kapat, destePenceresi, degistir }: { enAz: number; sec: (n: number) => void; kapat: () => void; destePenceresi: boolean; degistir: (v: boolean) => void }) {
  const [yazi, setYazi] = useState('')
  const n = Number(yazi)
  const gecerli = yazi !== '' && Number.isInteger(n) && n >= enAz && n <= EN_COK_EL
  return (
    <div className="pencere-arka" onClick={kapat}>
      <div className="puan-kagidi el-penceresi" onClick={e => e.stopPropagation()}>
        <div className="el-baslik">Kaç el?</div>
        <div className="kagit-dugmeler">
          {EL_SECENEKLERI.map(x => (
            <button key={x} className="kagit-dugme" disabled={x < enAz} onClick={() => sec(x)}>{x}</button>
          ))}
        </div>
        <div className="kagit-dugmeler">
          <input
            className="el-yazi"
            type="number"
            inputMode="numeric"
            min={enAz}
            max={EN_COK_EL}
            placeholder="Başka"
            value={yazi}
            onChange={e => setYazi(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && gecerli && sec(n)}
          />
          <button className="kagit-dugme" disabled={!gecerli} onClick={() => sec(n)}>Tamam</button>
        </div>
        <button className="kagit-ayar" onClick={() => degistir(!destePenceresi)}>
          Deste penceresi <span className={'anahtar' + (destePenceresi ? ' acik' : '')} />
        </button>
      </div>
    </div>
  )
}

// Test menüsü ayarları tarayıcıda saklanır, sayfa yenilenince (F5) aynen gelir.
function useKayitli<T>(ad: string, ilk: T) {
  const [deger, setDeger] = useState<T>(() => {
    try {
      const kayit = localStorage.getItem('mut.test.' + ad)
      return kayit === null ? ilk : JSON.parse(kayit)
    } catch {
      return ilk
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem('mut.test.' + ad, JSON.stringify(deger))
    } catch {}
  }, [deger])
  return [deger, setDeger] as const
}

// Geliştirme sırasında kullanılan ayarlar; oyun bitince Test menüsü kalkacak.
function TestSecenegi({ ad, acik, degistir }: { ad: string; acik: boolean; degistir: (v: boolean) => void }) {
  return (
    <button className="test-satir" onClick={() => degistir(!acik)}>
      {ad} <span className={'anahtar' + (acik ? ' acik' : '')} />
    </button>
  )
}


// Kart sürükleme: basılı tutup kaydırınca kart parmağı izler, bırakınca altındaki yer (data-hedef) bulunur.
// Kabul edilmezse kart yerine döner. Kaydırmadan bırakmak dokunmadır. tut: sürükleme başlayınca (Kız seçiminde
// tutulan kart seçilmiş olur).
type Birak = (hedef: string) => Birakma
function useSurukle(dokun: () => void, birak: Birak, tut?: () => void) {
  const [kayma, setKayma] = useState<{ x: number; y: number } | null>(null)
  const baslangic = useRef<{ x: number; y: number; olcek: number; surukleniyor: boolean } | null>(null)
  // Sürükleme yarıda kesilirse (sağ tık menüsü vb.) kart yerine döner.
  const vazgec = () => {
    baslangic.current = null
    setKayma(null)
  }
  const olaylar = {
    onPointerDown: (e: PointerEvent<HTMLDivElement>) => {
      // Sadece sol tık / parmak; sağ tık sürüklemeyi başlatmaz.
      if (e.button !== 0) return
      const sahne = e.currentTarget.closest('.sahne')!
      e.currentTarget.setPointerCapture(e.pointerId)
      baslangic.current = { x: e.clientX, y: e.clientY, olcek: sahne.getBoundingClientRect().width / SAHNE_EN, surukleniyor: false }
    },
    onPointerMove: (e: PointerEvent<HTMLDivElement>) => {
      const b = baslangic.current
      if (!b) return
      const dx = e.clientX - b.x
      const dy = e.clientY - b.y
      if (!b.surukleniyor && Math.hypot(dx, dy) < 6) return
      if (!b.surukleniyor) tut?.()
      b.surukleniyor = true
      setKayma({ x: dx / b.olcek, y: dy / b.olcek })
    },
    onPointerUp: (e: PointerEvent<HTMLDivElement>) => {
      const b = baslangic.current
      baslangic.current = null
      if (!b) return
      if (!b.surukleniyor) return dokun()
      // Sürüklenen kartın kendisi (ve içinde durduğu avuç) hedef sayılmaz.
      const kart = e.currentTarget
      const hedef = document
        .elementsFromPoint(e.clientX, e.clientY)
        .filter(el => !kart.contains(el))
        .map(el => el.closest<HTMLElement>('[data-hedef]'))
        .find(el => el)?.dataset.hedef
      if (hedef && birak(hedef) === 'kabul') return
      setKayma(null)
    },
    onPointerCancel: vazgec,
    // Parmak/fare kaçırıldıysa (bırakmadan önce) sürükleme biter. Normal bırakmada baslangic zaten boştur.
    onLostPointerCapture: () => {
      if (baslangic.current) vazgec()
    },
  }
  return { kayma, olaylar }
}

// Avucumdaki kart: dokununca kalkar, sürüklenip bir yere bırakılır.
function AvucKart({ kart, sira, adet, kalkik, kapali, dokun, birak, tut }: { kart: KartTipi; sira: number; adet: number; kalkik: boolean; kapali: boolean; dokun: () => void; birak: Birak; tut?: () => void }) {
  const { kayma, olaylar } = useSurukle(dokun, birak, tut)
  const transform = kayma
    ? `translate(${kayma.x}px, ${kayma.y}px)`
    : yelpaze(sira, adet) + (kalkik ? ' translateY(-14px)' : '')
  return (
    <div className={'avuc-kart' + (kayma ? ' surukleniyor' : '')} style={{ transform }} {...olaylar}>
      <Kart kart={kart} genislik={kartEni(AVUC_KART_EN)} kapali={kapali} />
    </div>
  )
}

// Botun avucundaki kart. "Botlar kendi oynasın" kapalıyken sürüklenip oynanabilir.
// dokun: Kız seçiminde kartı kaldırır (seçim yokken bir şey yapmaz); sürüklemeye başlamak da kaldırır.
function RakipKart({ kart, transform, kapali, birak, dokun }: { kart: KartTipi; transform?: string; kapali: boolean; birak: Birak; dokun: () => void }) {
  const { kayma, olaylar } = useSurukle(dokun, birak, dokun)
  return (
    <div
      className={'yan-kart' + (kayma ? ' surukleniyor' : '')}
      style={{ width: kartBoyu(kartEni(RAKIP_KART_EN)), height: kartEni(RAKIP_KART_EN), transform: kayma ? `translate(${kayma.x}px, ${kayma.y}px)` : transform }}
      {...olaylar}
    >
      <Kart kart={kart} genislik={kartEni(RAKIP_KART_EN)} kapali={kapali} />
    </div>
  )
}

// Serbest elde "Sürükle" seçimi: yakalamada eşleştiği yere inen kart bir oyuncuya sürüklenir.
// birak: bırakılan yer ve kartın bırakıldığı konum (kartlar oradan uçar).
function SecimKarti({ kart, konum, birak }: { kart: KartTipi; konum: Konum; birak: (hedef: string, yer: Konum) => Birakma }) {
  const { kayma, olaylar } = useSurukle(() => {}, hedef => birak(hedef, { ...konum, x: konum.x + (kayma?.x ?? 0), y: konum.y + (kayma?.y ?? 0) }))
  return (
    <div
      className={'secim-karti' + (kayma ? ' surukleniyor' : '')}
      style={{ left: konum.x - konum.en / 2, top: konum.y - kartBoyu(konum.en) / 2, transform: (kayma ? `translate(${kayma.x}px, ${kayma.y}px) ` : '') + `rotate(${konum.aci}deg)` }}
      {...olaylar}
    >
      <Kart kart={kart} genislik={konum.en} />
    </div>
  )
}

// Mut kartları elin başındaki yerlerinde durur: alınan kartın yeri boş kalır, kutu daralmaz.
function MutAlani({ kartlar }: { kartlar: KartTipi[] }) {
  const yerler = useRef<KartTipi[]>([])
  // Yeni kart geldiyse (dağıtım, yeni el) yerler baştan alınır.
  if (kartlar.some(k => !yerler.current.some(y => kartKimligi(y) === kartKimligi(k)))) yerler.current = kartlar
  return (
    <div className="mut-alani" data-yer="mut">
      {yerler.current.map(k =>
        kartlar.some(m => kartKimligi(m) === kartKimligi(k))
          ? <div key={kartKimligi(k)} data-hedef={`mut:${k.deger}`}><Kart kart={k} genislik={kartEni(56)} /></div>
          : <div key={kartKimligi(k)} style={{ width: kartEni(56) }} />,
      )}
    </div>
  )
}

// Avucumda 2 varsa durur. Bana saldırı gelince (blok penceresi) yanıp söner, dokununca blok yapılır.
// Saldırı yokken dokununca kurulur / sökülür (6.5.1): kurulu kalkan saldırı gelince 2'yi kendiliğinden oynar.
function Kalkan({ aktif, kurulu, bas }: { aktif: boolean; kurulu: boolean; bas: () => void }) {
  return (
    <button className={'kalkan' + (aktif ? ' aktif' : '') + (kurulu ? ' kurulu' : '')} aria-label="Kalkan" onClick={bas}>
      <svg viewBox="0 0 24 24" width="26" height="26">
        <path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Z" fill="currentColor" />
      </svg>
    </button>
  )
}

// Kral seçim penceresi: yığının bütün kartları ortada (en alttaki solda); dokunulan grup havalanır.
function KralPenceresi({ kartlar, secili, dokun, children }: { kartlar: KartTipi[]; secili?: { bas: number; adet: number }; dokun: (i: number) => void; children: ReactNode }) {
  const en = kartEni(60)
  const boy = kartBoyu(en)
  const n = Math.max(kartlar.length, 1)
  const siraBasi = n <= 18 ? n : Math.ceil(n / 2)
  const adim = siraBasi > 1 ? Math.min(40, (760 - en) / (siraBasi - 1)) : 0
  const siralar = Math.ceil(n / siraBasi)
  return (
    <div className="kral-penceresi">
      {kartlar.length === 0 && <div className="kral-ipucu">Yığın boş</div>}
      {kartlar.length > 0 && (
        <div style={{ position: 'relative', width: en + adim * (siraBasi - 1), height: siralar * boy + (siralar - 1) * 14 + 12 }}>
          {kartlar.map((k, i) => (
            <div
              key={i}
              className={'kral-secim-kart' + (secili && i >= secili.bas && i < secili.bas + secili.adet ? ' secili' : '')}
              style={{ left: (i % siraBasi) * adim, top: 12 + Math.floor(i / siraBasi) * (boy + 14) }}
              onClick={() => dokun(i)}
            >
              <Kart kart={k} genislik={en} ucan />
            </div>
          ))}
        </div>
      )}
      <div className="kral-dugmeler">{children}</div>
    </div>
  )
}

export function Masa() {
  // d: oyunun gerçek durumu. gorunen: ekranda çizilen durum (animasyon sürerken d'nin gerisinde kalır).
  // Yeni oyunda kaç el oynanacağı ("Kaç el?" penceresinde son seçilen).
  const [elSayisi, setElSayisi] = useKayitli('elSayisi', 10)
  const [d, setD] = useState(() => yeniOyunKur(elSayisi))
  const [gorunen, setGorunen] = useState(() => dagitimOncesi(d, true))
  const [ben, sagdaki, soldaki] = gorunen.oyuncular
  const elimdeIkiVar = ben.avuc.some(k => k.deger === 2)
  const [puanlarAcik, setPuanlarAcik] = useState(false)
  // Menüler: geliştirme menüleri Test (ayarlar), Dene (hazır kurulmuş eller) ve sol alttaki Görünüş (görsel seçenekler); sağ üstte oyun menüsü
  // (☰) ve onun "Oyunu bitir" onayı. Aynı anda biri açık.
  const [menu, setMenu] = useState<'test' | 'dene' | 'gorunus' | 'oyun' | 'bitir' | 'soz' | 'sozIsim' | null>(null)
  // Konuşma balonları (oyuncu → söz); her söz BALON_SURESI kadar görünür.
  const [balonlar, setBalonlar] = useState<Record<number, { yazi: string; no: number }>>({})
  const balonNo = useRef(0)
  const soyle = (oyuncu: number, yazi: string) => {
    const no = ++balonNo.current
    setBalonlar(b => ({ ...b, [oyuncu]: { yazi, no } }))
    setTimeout(() => setBalonlar(b => (b[oyuncu]?.no === no ? (({ [oyuncu]: _, ...kalan }) => kalan)(b) : b)), BALON_SURESI)
  }
  const sozSec = (yazi: string) => {
    if (yazi === KIZ_SOZU) return setMenu('sozIsim')
    setMenu(null)
    soyle(0, yazi)
  }
  // "Kaç el?" penceresi: yeni oyun için ya da oyun ortasında el sayısını değiştirmek için.
  const [elPenceresi, setElPenceresi] = useState<'yeni' | 'degistir' | null>(null)
  // Animasyon sürerken istenen el sayısı / oyunu bitirme: hamle bitince uygulanır (bitir).
  const istenenEl = useRef<number | null>(null)
  // Animasyon sürerken istenen yeni oyun / Dene eli: hamle bitince kurulur.
  const bekleyenOyun = useRef<{ deneme?: (d: Durum) => Durum; toplamEl: number } | null>(null)
  const bitirIstendi = useRef(false)
  const [botlarOtomatik, setBotlarOtomatik] = useKayitli('botlarOtomatik', true)
  const [botKartlariKapali, setBotKartlariKapali] = useKayitli('botKartlariKapali', false)
  const [botKartlariDuz, setBotKartlariDuz] = useKayitli('botKartlariDuz', true)
  const [botKartlariKirpik, setBotKartlariKirpik] = useKayitli('botKartlariKirpik', false)
  const [cezaAraligi, setCezaAraligi] = useKayitli<CezaAraligi>('cezaAraligi', '10 px')
  const [botHizi, setBotHizi] = useKayitli<BotHizi>('botHizi', 'Orta')
  // Kayıt adı değişti (2026-10-23): telefondaki eski seçim silinsin, herkes varsayılan Orta'dan başlasın.
  const [animasyonHizi, setAnimasyonHizi] = useKayitli<AnimasyonHizi>('animasyonHizi2', 'Orta')
  const [duraklama, setDuraklama] = useKayitli<Duraklama>('duraklama', 'Kısa')
  const [hamleSuresi, setHamleSuresi] = useKayitli<HamleSuresi>('hamleSuresi', '30 sn')
  const [yiginZeminiKayit, setYiginZemini] = useKayitli<YiginZemini>('yiginZemini', 'Kesikli')
  // Kaldırılan seçenekler kayıtlıysa varsayılana döner.
  const yiginZemini: YiginZemini = yiginZeminiKayit in YIGIN_ZEMINLERI ? yiginZeminiKayit : 'Kesikli'
  const [yapisikGorunusu, setYapisikGorunusu] = useKayitli<YapisikGorunusu>('yapisikGorunusu2', 'Varsayılan')
  // Varsayılanda yapışık kartlar sıradan kart gibi çizilir.
  const yapisikCiz = yapisikGorunusu === 'Varsayılan' ? [] : gorunen.yapisik
  const [puanYeri, setPuanYeri] = useKayitli<PuanYeri>('puanYeri', 'Yanında')
  const [kartlarim, setKartlarim] = useKayitli<KartlarimGorunusu>('kartlarim', 'Soluk')
  const [elYuksekligiKayit, setElYuksekligi] = useKayitli<ElYuksekligi>('elYuksekligi', '+10 px')
  const elYuksekligi: ElYuksekligi = elYuksekligiKayit in EL_YUKSEKLIKLERI ? elYuksekligiKayit : '+10 px'
  const [kartBoyutuKayit, setKartBoyutu] = useKayitli<KartBoyutu>('kartBoyutu', '%110')
  const kartBoyutu: KartBoyutu = kartBoyutuKayit in KART_BOYUTLARI ? kartBoyutuKayit : '%110'
  // Alt bileşenler bu çizimde yeni çarpanı okusun diye çizimin başında.
  kartOlcegi.carpan = KART_BOYUTLARI[kartBoyutu]
  // Deste penceresi ayarı ("Kaç el?" penceresinde) ve açık olup olmadığı.
  const [destePenceresi, setDestePenceresi] = useKayitli('destePenceresi', true)
  // Geliştirici seçenekleri (☰ menüsü): kapalıyken Görünüş, Dene, Test ve duraklat gizlenir; ayarları çalışmaya devam eder.
  const [gelistirici, setGelistirici] = useKayitli('gelistirici', false)
  const [desteAcik, setDesteAcik] = useState(false)
  const [mutZemini, setMutZemini] = useKayitli<MutZemini>('mutZemini', 'Yuva')
  const [jqkGorunusu, setJqkGorunusu] = useKayitli<JqkGorunusu>('jqkGorunusu2', 'Sade')
  const [bakisGorunusu, setBakisGorunusu] = useKayitli<BakisGorunusu>('bakisGorunusu2', 'Yerinde')
  const sure = HAMLE_SURELERI[hamleSuresi] ?? 0
  const [kalkikKart, setKalkikKart] = useState<number | null>(null)
  // Önceden kurulmuş kalkan (otomatik blok). Sadece benim ekranımda görünür.
  const [kalkanKurulu, setKalkanKurulu] = useState(false)
  // Kral seçim penceresi (6.9.1): açılan yığın; kart = henüz oynanmamış Papaz (avuçtaki sırası; pencere kapanırsa hamle
  // olmaz), yoksa süren Kral gücü. dokunulan/sira: dokunulan kart ve onu içeren gruplardan seçilen (aynı karta
  // tekrar dokununca sıradaki grup). bitir: kalan güçleri bırakırken hedef seçiliyor.
  const [kralPencere, setKralPencere] = useState<{ yigin: string; kart?: number; dokunulan?: number; sira: number } | null>(null)
  const [kralBitirSecimi, setKralBitirSecimi] = useState(false)
  useEffect(() => {
    setKralPencere(null)
    setKralBitirSecimi(false)
  }, [d])
  // Rakibin ceza yığınına bırakılan kart: "Ekle" mi "İlerlet" mi seçilecek.
  const [cezaSecimi, setCezaSecimi] = useState<{ kart: number; yigin: number } | null>(null)
  // Kız ile çekme: avucu ters dönmüş (karılmış) oyuncu ve kullanıcının seçimini bekleyen çekme
  // (ceken: kartı alacak oyuncu; kaldir: dokunulan ters kartı kaldırır; al: avuca sürüklenen kartla seçimi bitirir).
  const [ters, setTers] = useState<number | null>(null)
  const secimRef = useRef<{ ceken: number; kaldir: (kart: number) => void; al: (kart: number) => void } | null>(null)
  // Çekilen kartın uçuşa başlayacağı yer (bırakıldığı ya da bottaysa kalktığı yer).
  const cekmeKaynak = useRef<Konum | undefined>(undefined)
  // Serbest elde hedef seçimi: bekleyen yakalamanın seçilebilir oyuncuları ve inen kart; sec seçimi bitirir.
  const [hedefSecimi, setHedefSecimi] = useState<{ secenekler: number[]; kart: KartTipi; konum: Konum } | null>(null)
  const hedefRef = useRef<((gonder: number) => void) | null>(null)
  // Hedef seçilmeden hamle süresi biterse kartlar buraya gider (kazanmakta olan, botun seçtiği gibi).
  const hedefOnerisi = useRef(0)
  // Kız ile çekmede kart seçme süresi işliyor (avucun üstünde süre çubuğu).
  const [kizSuresi, setKizSuresi] = useState(false)
  // Seçim sırasında kart eşleştiği yere inmiş (ya da sürüklenip bırakılmış) olur; kartlar oradan uçar.
  const inenRef = useRef<Konum | undefined>(undefined)
  const sec = (koltuk: number, kart: number) => {
    if (ters === koltuk) secimRef.current?.kaldir(kart)
  }

  // ---- Animasyon ----
  const masaRef = useRef<HTMLDivElement>(null)
  const { bakis, olaylar: bakisOlaylari } = useYiginBakisi(masaRef)
  const gorunenRef = useRef(gorunen)
  const [gizli, setGizli] = useState<ReadonlySet<string>>(new Set())
  const [ucuslar, setUcuslar] = useState<Ucus[]>([])
  const [botKalkik, setBotKalkik] = useState<string | null>(null)
  // Animasyon sürerken yeni hamle yapılmaz.
  const [mesgul, setMesgul] = useState(true)
  const mesgulRef = useRef(true)
  const bekleyenGecis = useRef<null | { tasinan: [string, string][]; kaynak: Map<string, Konum>; gecikme: Map<string, number>; ekUcus?: Ucus; bitti: () => void }>(null)
  const carpan = ANIMASYON_HIZLARI[animasyonHizi]
  const ucusSuresi = SURE.ucus * carpan

  // Ekranı yeni duruma geçirir; yeri değişen kartlar eski yerinden yenisine uçar.
  // kaynak: bazı kartların başlangıç yeri elle verilir. sira: kartlar bu sırayla arka arkaya kalkar (dağıtım).
  // ekUcus: ölçülmeden verilen ek uçuş (yakalamada kartın eşleştiği yere inişi); bitince ekranda kalır.
  const gec = (yeni: Durum, ayar: { kaynak?: Map<string, Konum>; sira?: string[]; ekUcus?: Ucus } = {}) => {
    const onceki = kartYerleri(gorunenRef.current)
    const tasinan = [...kartYerleri(yeni)].filter(([id, yer]) => onceki.get(id) !== yer)
    const kaynak = new Map(tasinan.map(([id]) => [id, ayar.kaynak?.get(id) ?? konumOlc(masaRef.current!, id, onceki.get(id) ?? 'deste')]))
    const gecikme = new Map((ayar.sira ?? []).map((id, i) => [id, i * SURE.dagitimAraligi * carpan]))
    gorunenRef.current = yeni
    setGorunen(yeni)
    if (tasinan.length === 0 && !ayar.ekUcus) return Promise.resolve()
    return new Promise<void>(bitti => {
      bekleyenGecis.current = { tasinan, kaynak, gecikme, ekUcus: ayar.ekUcus, bitti }
      setGizli(new Set(tasinan.map(([id]) => id)))
    })
  }

  // Yeni durum çizildikten sonra (ekrana basılmadan önce) kartların hedef yerleri ölçülür, uçuş başlar.
  useLayoutEffect(() => {
    const b = bekleyenGecis.current
    if (!b) return
    bekleyenGecis.current = null
    const kartlar = new Map([...gorunen.oyuncular.flatMap(o => [...o.avuc, ...o.ceza]), ...gorunen.orta, ...gorunen.mut, ...gorunen.deste, ...(gorunen.bomba?.kartlar ?? []), ...(gorunen.kral?.papazlar ?? [])].map(k => [kartKimligi(k), k]))
    const yeniUcuslar: Ucus[] = b.tasinan.map(([id, yer]) => ({
      kart: kartlar.get(id)!,
      kaynak: b.kaynak.get(id)!,
      hedef: konumOlc(masaRef.current!, id, yer),
      sure: ucusSuresi,
      gecikme: b.gecikme.get(id) ?? 0,
      // Desteye giden ve desteden dağıtılan kartlar kapalı uçar; Mut kartları açık iner, benim kartlarım inince dönerek açılır.
      kapali: yer === 'deste' || (b.gecikme.has(id) && yer !== 'mut') || (botKartlariKapali && yer.startsWith('avuc:') && yer !== 'avuc:0'),
      donus: b.gecikme.has(id) && yer === 'avuc:0' ? SURE.donus * carpan : undefined,
    }))
    if (b.ekUcus) yeniUcuslar.unshift(b.ekUcus)
    setUcuslar(yeniUcuslar)
    const toplam = Math.max(...yeniUcuslar.map(u => u.gecikme + u.sure + (u.donus ?? 0)))
    setTimeout(() => {
      setGizli(new Set())
      if (!b.ekUcus) setUcuslar([])
      b.bitti()
    }, toplam)
  }, [gorunen])

  const basla = () => {
    mesgulRef.current = true
    setMesgul(true)
  }
  const bitir = (yeni: Durum) => {
    if (istenenEl.current !== null) yeni = elSayisiAyarla(yeni, istenenEl.current)
    if (bitirIstendi.current) yeni = oyunuBitir(yeni)
    istenenEl.current = null
    bitirIstendi.current = false
    setD(yeni)
    mesgulRef.current = false
    setMesgul(false)
  }

  // Yakalamada oynanan kartın önce indiği yer: eşleştiği kartın biraz kaydırılmış üstü.
  // Eşleşmeyi motor bildirir (sonHamle); ekran sadece yerini ölçer.
  const inisYeri = (s: HamleSonucu): Konum | null => {
    const eslesen = s.eslesen[s.eslesen.length - 1]
    if (!eslesen || !s.nereden) return null
    const konum = konumOlc(masaRef.current!, kartKimligi(eslesen), s.nereden)
    return { ...konum, x: konum.x + 8, y: konum.y + 6 }
  }

  // elle: kartı kullanıcı sürükledi (botun kart kaldırma adımı atlanır).
  const hamleOyna = async (h: Hamle, elle: boolean) => {
    if (mesgulRef.current) return
    const taban = kabulSonrasi(d, h)
    // Serbest elde yakalamanın hedefi verilmediyse ekranda seçilir; tek seçenek varsa kendiliğinden o.
    let secenekler: number[] = []
    if (h.gonder === undefined) {
      const ayni = ayniHamleler(taban, h)
      if (ayni.length === 0) return
      if (ayni.length > 1) secenekler = ayni.map(g => g.gonder!)
      h = { ...h, gonder: ayni[0].gonder }
    }
    if (!hamleGecerliMi(taban, h)) return
    // Kurulu kalkan benim bir sonraki hamleme kadar kalır (blok da hamle sayılır, 2 gider).
    if (taban.sira === 0 && h.tip !== 'kabul') setKalkanKurulu(false)
    const eski = d
    basla()
    let yeni: Durum | undefined
    try {
      if (secenekler.length > 1) h = { ...h, gonder: await hedefSec(taban, h, secenekler) }
      // Çekmede hangi kartın alınacağı ekranda seçilir; hamle ondan sonra yapılır.
      yeni = hamleYap(taban, h.tip === 'cek' ? { ...h, cekilen: await cekilecekKart(taban, h, elle) } : h)
      await hamleyiGoster(eski, yeni, elle)
      bitir(yeni)
    } catch (hata) {
      // Animasyonda beklenmedik bir hata oyunu kilitlemesin: ekran gerçek duruma döner, oyun sürer.
      console.error(hata)
      yeni ??= hamleYap(taban, h)
      gorunenRef.current = yeni
      setGorunen(yeni)
      setUcuslar([])
      setGizli(new Set())
      setBotKalkik(null)
      setTers(null)
      setKizSuresi(false)
      secimRef.current = null
      cekmeKaynak.current = undefined
      hedefRef.current = null
      inenRef.current = undefined
      setHedefSecimi(null)
      setKalkikKart(null)
      bitir(yeni)
    }
  }

  // Kız ile çekme (9.2): Kız ortaya düşer, hedefin avucu ters döner ve gerçekten karılır. Çeken ters kartlara
  // dokunup kaldırır (fikrini değiştirebilir), birini kendi avucuna sürükleyince alır; başka yere bırakırsa kart
  // geri döner. Bot da önce bir kartı kaldırıp düşünür, bazen başkasına geçer. Süre yok.
  // Dönen: çekilen kartın hedefin karılmamış avucundaki sırası (motora verilir).
  const cekilecekKart = async (taban: Durum, h: Hamle, elle: boolean) => {
    const ceken = taban.sira
    const hedef = h.hedef!
    const kiz = taban.oyuncular[ceken].avuc[h.kart]
    if (!elle) {
      setBotKalkik(kartKimligi(kiz))
      await bekle(SURE.kalkma * carpan)
    }
    const ara = structuredClone(taban)
    ara.oyuncular[ceken].avuc.splice(h.kart, 1)
    ara.orta.push(kiz)
    await gec(ara)
    setBotKalkik(null)
    if (hedef === 0) setKalkikKart(null)
    // Kartlar ters dönmüşken sıraları gerçekten karılır: dokunulan yerdeki kart gerçekten o kart olur.
    const karisik = structuredClone(ara)
    const avuc = karistir(karisik.oyuncular[hedef].avuc, { tohum: Math.floor(Math.random() * 2 ** 31) })
    setTers(hedef)
    await gec(karisik)
    await avucuKar(masaRef.current!, hedef, KARMA_SURESI * carpan)
    const kaldir = (i: number) => (hedef === 0 ? setKalkikKart(i) : setBotKalkik(kartKimligi(avuc[i])))
    let sira: number
    // Kartı elle oynayan seçer (bot hamlesi değilse); süre biterse rastgele kart çekilir.
    if (elle) {
      let zamanlayici: ReturnType<typeof setTimeout> | undefined
      sira = await new Promise<number>(al => {
        secimRef.current = { ceken, kaldir, al }
        if (!sure) return
        setKizSuresi(true)
        zamanlayici = setTimeout(() => {
          if (secimRef.current?.al !== al) return
          const i = Math.floor(Math.random() * avuc.length)
          cekmeKaynak.current = konumOlc(masaRef.current!, kartKimligi(avuc[i]), `avuc:${hedef}`)
          secimRef.current = null
          al(i)
        }, KIZ_SURESI)
      })
      clearTimeout(zamanlayici)
      setKizSuresi(false)
    } else {
      sira = Math.floor(Math.random() * avuc.length)
      kaldir(sira)
      await bekle(BOT_SECIM_SURESI * carpan)
      if (avuc.length > 1 && Math.random() < 0.5) {
        sira = (sira + 1 + Math.floor(Math.random() * (avuc.length - 1))) % avuc.length
        kaldir(sira)
        await bekle(BOT_SECIM_SURESI * carpan)
      }
      cekmeKaynak.current = konumOlc(masaRef.current!, kartKimligi(avuc[sira]), `avuc:${hedef}`)
    }
    if (hedef === 0) setKalkikKart(null)
    else setBotKalkik(null)
    const secilen = kartKimligi(avuc[sira])
    return taban.oyuncular[hedef].avuc.findIndex(k => kartKimligi(k) === secilen)
  }

  // Serbest elde hedef seçimi (6.2): kart eşleştiği yere iner, kartlar orada bekler; oyuncu bir rakibin ceza yığınına
  // ya da isim etiketine dokunur ya da inen kartı ona sürükler. Vazgeçmek yok (geri alma yok).
  const hedefSec = async (taban: Durum, h: Hamle, secenekler: number[]) => {
    const sonuc = hamleYap(taban, h).sonHamle!
    const inis = inisYeri(sonuc)!
    const ara = structuredClone(taban)
    ara.oyuncular[taban.sira].avuc.splice(h.kart, 1)
    const kaynak = konumOlc(masaRef.current!, kartKimligi(sonuc.kart), `avuc:${taban.sira}`)
    await gec(ara, { ekUcus: { kart: sonuc.kart, kaynak, hedef: inis, sure: ucusSuresi, gecikme: 0, kapali: false } })
    // İnen kartın yerini sürüklenebilen kopyası alır (dokunmak da olur).
    setUcuslar([])
    const toplam = toplamPuanlar(taban)
    const buEl = elPuanlari(taban)
    const puan = (i: number) => toplam[i] + buEl[i]
    hedefOnerisi.current = secenekler.reduce((a, b) => (puan(b) < puan(a) ? b : a))
    const gonder = await new Promise<number>(sec => {
      hedefRef.current = sec
      setHedefSecimi({ secenekler, kart: sonuc.kart, konum: inis })
    })
    hedefRef.current = null
    setHedefSecimi(null)
    inenRef.current ??= inis
    return gonder
  }
  const hedefSecildi = (i: number | null) => {
    if (i === null || !hedefSecimi?.secenekler.includes(i)) return false
    hedefRef.current?.(i)
    return true
  }

  // Çekmede ters kart bırakıldı: çekenin avucuna (ya da isim etiketine) bırakıldıysa alınır, değilse geri döner.
  const cekmeBirak = (koltuk: number, kart: number, hedef: string): Birakma => {
    const s = secimRef.current
    if (!s || hedef !== `avuc:${s.ceken}`) return 'red'
    cekmeKaynak.current = konumOlc(masaRef.current!, kartKimligi(gorunenRef.current.oyuncular[koltuk].avuc[kart]), `avuc:${koltuk}`)
    secimRef.current = null
    s.al(kart)
    return 'kabul'
  }

  const hamleyiGoster = async (eski: Durum, yeni: Durum, elle: boolean) => {
    // Tur bitip yeni kartlar dağıtıldıysa önce hamle, sonra dağıtım gösterilir.
    const dagitildi = yeni.asama === 'oyun' && yeni.tur !== eski.tur
    // El bomba patlamasıyla bittiyse önce son hamle, sonra patlama gösterilir.
    const hamleSonrasi = dagitildi ? dagitimOncesi(yeni, false) : yeni.patlama ? patlamaOncesi(yeni) : yeni
    // Blokta kabul: kart oynanmaz (sonHamle yok).
    if (yeni.sonHamle) await kartiGoster(eski, yeni.sonHamle, hamleSonrasi, elle)
    else await gec(hamleSonrasi)
    if (dagitildi) await gec(yeni, { sira: yeni.dagitim.map(kartKimligi) })
    if (yeni.patlama) {
      await bekle(PATLAMA_BEKLEMESI * carpan)
      await gec(patlamaOrtada(yeni))
      await bekle(ORTADA_BEKLEME * carpan)
      await gec(yeni)
    }
  }

  const kartiGoster = async (eski: Durum, sonuc: HamleSonucu, hamleSonrasi: Durum, elle: boolean) => {
    const k = sonuc.kart
    const id = kartKimligi(k)
    // Oynanan kart avuçtan çıkmış, başka hiçbir şey değişmemiş ara durum.
    const kartsiz = () => {
      const ara = structuredClone(eski)
      const avuc = ara.oyuncular[sonuc.oyuncu].avuc
      avuc.splice(avuc.findIndex(x => kartKimligi(x) === id), 1)
      return ara
    }
    if (sonuc.cekme) {
      // Çekme: Kız ortada, kart seçildi (cekilecekKart). Çekilen kart bırakıldığı yerden çekene uçar;
      // hedefin avucu eski sırasına döner (ters dururken), sonra açılır.
      const kaynak = cekmeKaynak.current
      cekmeKaynak.current = undefined
      await gec(hamleSonrasi, kaynak ? { kaynak: new Map([[kartKimligi(sonuc.cekme.kart), kaynak]]) } : {})
      setTers(null)
      return
    }
    if (!elle) {
      setBotKalkik(id)
      await bekle(SURE.kalkma * carpan)
    }
    const inis = sonuc.kral ? null : inisYeri(sonuc)
    if (sonuc.takas !== undefined) {
      // Takas: önce 8 ortaya düşer, sonra iki avuç yer değiştirir.
      const ara = kartsiz()
      ara.orta.push(k)
      await gec(ara)
      await gec(hamleSonrasi)
    } else if (inis) {
      // Yakalama: kart önce eşleştiği yere iner, kısa duraklar, sonra eşleşenlerle birlikte uçar.
      // Serbest elde hedef seçilirken kart zaten inmiştir (hedefSec).
      const indi = inenRef.current
      inenRef.current = undefined
      if (!indi) {
        const kaynak = konumOlc(masaRef.current!, id, `avuc:${sonuc.oyuncu}`)
        await gec(kartsiz(), { ekUcus: { kart: k, kaynak, hedef: inis, sure: ucusSuresi, gecikme: 0, kapali: false } })
        await bekle(DURAKLAMALAR[duraklama])
      }
      await gec(hamleSonrasi, { kaynak: new Map([[id, indi ?? inis]]) })
    } else {
      await gec(hamleSonrasi)
    }
    setBotKalkik(null)
  }

  // Yeni el / yeni oyun: kartlar desteye toplanır, sonra dağıtılır.
  const topluDagit = async (yeni: Durum) => {
    basla()
    await gec(dagitimOncesi(yeni, true))
    await gec(yeni, { sira: yeni.dagitim.map(kartKimligi) })
    bitir(yeni)
  }

  useEffect(() => {
    const b = bekleyenOyun.current
    if (mesgul || !b) return
    bekleyenOyun.current = null
    yeniOyunBaslat(b.deneme, b.toplamEl)
  }, [mesgul])

  // Oyun açılınca ilk dağıtım.
  const ilkDagitim = useRef(false)
  useEffect(() => {
    if (ilkDagitim.current) return
    ilkDagitim.current = true
    topluDagit(d)
  }, [])

  // ---- Hamle süresi ----
  // Elle oynanan koltukta (ben; botlar kapalıyken herkes) süre işler. Son saniyelerde süre görünür; bitince yerine
  // bot oynar. Serbest elde hedef seçilirken biterse kartlar önerilen oyuncuya gider. Üst üste UZAKTA_SAYISI kez
  // biterse "uzakta" sayılırım: ekrana dokunana kadar benim yerime bot oynar.
  const [sureUyari, setSureUyari] = useState(false)
  // Duraklat (geliştirme düğmesi, Dene'nin solunda): botlar oynamaz, hamle süresi işlemez; kendi kartlarımı oynayabilirim.
  const [duraklatildi, setDuraklatildi] = useState(false)
  const [uzakta, setUzakta] = useState(false)
  const zamanAsimi = useRef(0)
  const elleSirada = d.asama === 'oyun' && !d.blok && (d.sira === 0 || !botlarOtomatik)
  useEffect(() => {
    setSureUyari(false)
    if (!elleSirada || !sure || duraklatildi || (d.sira === 0 && uzakta)) return
    const uyari = setTimeout(() => setSureUyari(true), sure - UYARI_SURESI)
    const bitis = setTimeout(() => {
      setSureUyari(false)
      if (d.sira === 0 && ++zamanAsimi.current >= UZAKTA_SAYISI) setUzakta(true)
      if (hedefRef.current) hedefRef.current(hedefOnerisi.current)
      else if (!mesgulRef.current) hamleOyna(akilliBotHamlesi(d), false)
    }, sure)
    return () => {
      clearTimeout(uyari)
      clearTimeout(bitis)
    }
  }, [d, elleSirada, sure, uzakta, duraklatildi])

  // Botlar sırası gelince biraz bekleyip hamle yapar. Benim kartlarımı ben oynarım, uzaktaysam bot.
  useEffect(() => {
    if (mesgul || duraklatildi || d.asama !== 'oyun' || !(d.sira === 0 ? uzakta : botlarOtomatik)) return
    const zamanlayici = setTimeout(() => hamleOyna(akilliBotHamlesi(d), false), BOT_HIZLARI[botHizi])
    return () => clearTimeout(zamanlayici)
  }, [d, mesgul, botlarOtomatik, botHizi, uzakta, duraklatildi])

  // Blok penceresi: hedef ben isem (ya da botları ben oynuyorsam) süre bitince kendiliğinden kabul edilir.
  // Bot hedefse ve botlar kendi oynuyorsa bot hemen karar verir (yukarıdaki bot hamlesi).
  // Kalkanım kuruluysa kısa bir an parlayıp kendiliğinden bloklar.
  const blokBende = !!d.blok && !mesgul && (d.blok.hedef === 0 || !botlarOtomatik)
  useEffect(() => {
    if (!blokBende) return
    const otomatik = d.blok!.hedef === 0 && kalkanKurulu
    const zamanlayici = otomatik
      ? setTimeout(() => hamleOyna({ tip: 'blok', kart: d.oyuncular[0].avuc.findIndex(k => k.deger === 2) }, true), KALKAN_GECIKMESI)
      : setTimeout(() => hamleOyna({ tip: 'kabul', kart: -1 }, true), BLOK_SURESI)
    return () => clearTimeout(zamanlayici)
  }, [d, blokBende, kalkanKurulu])
  // Avucumda 2 kalmayınca kalkan da kalkar. Avucum takasla değişince de (6.5.1); kaldırılmış kart da iner.
  useEffect(() => {
    if (!d.oyuncular[0].avuc.some(k => k.deger === 2)) setKalkanKurulu(false)
    if (d.sonHamle?.takas === 0) {
      setKalkanKurulu(false)
      setKalkikKart(null)
    }
  }, [d])

  // Durum değişince (biri oynadı, botlar açıldı) açık kalan "Ekle / İlerlet" seçimi geçersizdir.
  useEffect(() => {
    setCezaSecimi(null)
  }, [d, botlarOtomatik])
  // Yeni tur/el dağıtılınca kaldırılmış kart, avuçtaki yeni karta geçmesin.
  useEffect(() => {
    setKalkikKart(null)
  }, [d.tur, d.el])

  // El bitince puan kağıdı kendiliğinden açılır.
  useEffect(() => {
    if (d.asama !== 'oyun') setPuanlarAcik(true)
  }, [d.asama])

  const oyna = (h: Hamle) => {
    zamanAsimi.current = 0
    hamleOyna(h, true)
    setKalkikKart(null)
    setCezaSecimi(null)
  }

  // Bırakılan yere göre hamle; kurala aykırıysa kart sessizce avuca döner (9.2).
  // Sırası gelen oyuncunun kartı oynanır; botlar kendi oynuyorsa sadece benim kartlarım.
  const kartBirak = (oyuncu: number, kart: number, hedef: string): Birakma => {
    if (ters === oyuncu) return cekmeBirak(oyuncu, kart, hedef)
    if (mesgul || d.asama !== 'oyun' || (oyuncu !== 0 && botlarOtomatik)) return 'red'
    const [yer, deger] = hedef.split(':')
    const dene = (tip: Hamle['tip'], hedef?: number): Birakma => {
      const h = { tip, kart, hedef }
      if (ayniHamleler(kabulSonrasi(d, h), h).length === 0) return 'red'
      oyna(h)
      return 'kabul'
    }
    // Blok penceresinde 2 kendi ceza (ya da bomba) yığınına bırakılınca blok yapılır (kalkana basmakla aynı).
    if (d.blok?.hedef === oyuncu && (yer === 'ceza' || yer === 'bomba') && Number(deger) === oyuncu && d.oyuncular[oyuncu].avuc[kart].deger === 2)
      return dene('blok')
    // Pencerede başka kart atmak kabul sayılır; kurallara kabulden sonraki durumdan bakılır.
    const t = kabulSonrasi(d, { tip: 'ortayaAt', kart })
    if (t.sira !== oyuncu || d.blok && d.blok.hedef !== oyuncu) return 'red'
    const siradaki = sonraki(t, oyuncu)
    // Kral elinde Papaz: Mut Papaz'ına bırakmak gücü başlatır; bir yığına bırakmak o yığının seçim penceresini açar.
    if (ayniHamleler(t, { tip: 'kral', kart }).length > 0) {
      if (yer === 'mut') return Number(deger) === 13 ? dene('kral') : 'red'
      if (yer === 'orta' || yer === 'ceza') {
        setKralPencere({ yigin: hedef, kart, sira: 0 })
        if (oyuncu === 0) setKalkikKart(kart)
        return 'bekle'
      }
    }
    if (yer === 'orta') {
      // Mut kartlarıyla eşleşen kart ortaya atılamaz: neden olmadığını eşleşen Mut kartı sallanarak gösterir.
      const deger = t.oyuncular[oyuncu].avuc[kart].deger
      // Bomba kurulduysa ortaya bırakılan 10 (seri yoksa) bombaya gider.
      if (ayniHamleler(t, { tip: 'ortayaAt', kart }).length === 0 && t.bomba && deger === 10) return dene('bomba')
      if (ayniHamleler(t, { tip: 'ortayaAt', kart }).length === 0 && t.mut.some(m => m.deger === deger)) {
        masaRef.current!.querySelectorAll(`[data-hedef="mut:${deger}"]`).forEach(salla)
        return 'red'
      }
      return dene('ortayaAt')
    }
    // 8'i bir avucun üstüne bırakmak takas, Kız'ı bırakmak çekme (ortaya bırakmak normal oyun).
    if (yer === 'avuc') return dene(t.oyuncular[oyuncu].avuc[kart].deger === 12 ? 'cek' : 'takas', Number(deger))
    if (yer === 'bomba') return dene('bomba')
    if (yer === 'mut') return Number(deger) === t.oyuncular[oyuncu].avuc[kart].deger ? dene('mutEslestir') : 'red'
    // Eksi elde kendi yığınına bırakmak eklemek, rakibin yığınına bırakmak oradan almak (kartlar hep kendine).
    if (t.eksi && yer === 'ceza') return Number(deger) === oyuncu ? dene('ekle', oyuncu) : dene('alIlerlet', Number(deger))
    if (yer === 'ceza' && Number(deger) === oyuncu) return dene('cezaBosalt')
    // Sıradakine iki seçenek var (ekle / ilerlet); diğer rakiplere sadece eklenir. Serbest elde herkese iki seçenek.
    const alinan = t.serbest ? Number(deger) : undefined
    if (yer === 'ceza' && (t.serbest || Number(deger) === siradaki) && ayniHamleler(t, { tip: 'alIlerlet', kart, hedef: alinan }).length > 0) {
      setCezaSecimi({ kart, yigin: Number(deger) })
      if (oyuncu === 0) setKalkikKart(kart)
      return 'bekle'
    }
    if (yer === 'ceza') return dene('ekle', Number(deger))
    return 'red'
  }

  const aktifKurallar = [...(d.kralEli ? ['Kral'] : []), ...(d.serbest ? ['Serbest el'] : []), ...(d.eksi ? ['Eksi el'] : []), ...(d.bombaEli ? ['Bomba'] : []), ...(d.carpan > 1 ? [`×${d.carpan}`] : [])]
  // Ceza yığınlarında görünen puan çarpanı: eksi elde puanlar eksi görünür.
  const puanCarpani = d.eksi ? -d.carpan : d.carpan
  // Test menüsünde bir seçeneğe her basışta sıradaki değere geçer.
  const sonrakiSecenek = <T extends string>(secenekler: Record<T, unknown>, simdiki: T, ayarla: (v: T) => void) => {
    const adlar = Object.keys(secenekler) as T[]
    ayarla(adlar[(adlar.indexOf(simdiki) + 1) % adlar.length])
  }
  // deneme: Test menüsündeki "… dene" düğmeleri için kartları hazır dizer.
  const yeniOyunBaslat = (deneme?: (d: Durum) => Durum, toplamEl = elSayisi) => {
    // Animasyon sürüyorsa (bot hamlesi vb.) istek hatırlanır, hamle bitince kurulur.
    if (mesgulRef.current) return void (bekleyenOyun.current = { deneme, toplamEl })
    setPuanlarAcik(false)
    istenenEl.current = null
    bitirIstendi.current = false
    const yeni = yeniOyunKur(toplamEl)
    topluDagit(deneme ? deneme(yeni) : yeni)
  }
  // Oyun ortasında el sayısı ya da oyunu bitirmek: animasyon sürüyorsa hamle bitince uygulanır.
  const elSayisiDegistir = (n: number) => {
    if (mesgulRef.current) istenenEl.current = n
    else setD(elSayisiAyarla(d, n))
  }
  const oyunuBitirIste = () => {
    if (mesgulRef.current) bitirIstendi.current = true
    else setD(oyunuBitir(d))
  }
  // Basılı tutulan yığının kartları (YiginBakisi).
  const bakilanKartlar = (yer: string): KartTipi[] =>
    yer === 'orta' ? gorunen.orta : yer === 'bomba' ? gorunen.bomba?.kartlar ?? [] : gorunen.oyuncular[Number(yer.split(':')[1])].ceza
  const gosterilenToplamEl = bitirIstendi.current ? d.puanKagidi.length : istenenEl.current ?? d.toplamEl

  // ---- Kral (6.9.1) ----
  // Gücü elle kullanan: ben ya da botlar kapalıyken sırası gelen bot.
  const kralBende = !!d.kral && d.asama === 'oyun' && !mesgul && (d.kral.oyuncu === 0 || !botlarOtomatik)
  // Pencere Papaz oynanmadan açıldıysa kartlara Papaz oynanmış gibi bakılır (Mut Papaz'ları da güçte).
  // (Hamle yapılınca pencere kapanır; o arada çizilirse eski Papaz sırası geçersiz kalabilir, o zaman d.)
  const papazHamlesi: Hamle | null = kralPencere?.kart !== undefined ? { tip: 'kral', kart: kralPencere.kart } : null
  const papazTabani = papazHamlesi && kabulSonrasi(d, papazHamlesi)
  const kralTaban = papazHamlesi && papazTabani && hamleGecerliMi(papazTabani, papazHamlesi) ? hamleYap(papazTabani, papazHamlesi) : d
  const kralKartlari = !kralPencere ? [] : kralPencere.yigin === 'orta' ? kralTaban.orta : kralTaban.oyuncular[Number(kralPencere.yigin.split(':')[1])].ceza
  const dokunulan = kralPencere?.dokunulan
  const kralAdaylari = dokunulan === undefined ? [] : kralGruplari(kralTaban, kralKartlari).filter(g => g.bas <= dokunulan && dokunulan < g.bas + g.adet).sort((a, b) => b.adet - a.adet)
  const kralSecili = kralAdaylari.length > 0 ? kralAdaylari[kralPencere!.sira % kralAdaylari.length] : undefined
  const kralAl = (gonder: number): Hamle => ({ tip: 'kralAl', kart: -1, yigin: kralPencere!.yigin, bas: kralSecili!.bas, adet: kralSecili!.adet, gonder })
  // Seçilen grubun gidebileceği oyuncular (eksi elde sadece kendisi; kendi yığınından almak yok).
  const kralHedefleri = !kralSecili || !kralTaban.kral ? [] : kralTaban.oyuncular.map((_, i) => i).filter(i => hamleGecerliMi(kralTaban, kralAl(i)))
  const kralGonder = (gonder: number) => {
    const p = kralPencere!
    setKralPencere(null)
    oyna(p.kart !== undefined ? { ...kralAl(gonder), tip: 'kral', kart: p.kart } : kralAl(gonder))
  }
  const kralKapat = () => {
    setKralPencere(null)
    setKalkikKart(null)
  }
  const kralDokun = (i: number) => setKralPencere(p => p && { ...p, dokunulan: i, sira: p.dokunulan === i ? p.sira + 1 : 0 })
  const papazOrtayaAt = kralPencere?.kart !== undefined && kralPencere.yigin === 'orta' && ayniHamleler(kabulSonrasi(d, { tip: 'ortayaAt', kart: kralPencere.kart }), { tip: 'ortayaAt', kart: kralPencere.kart }).length > 0
  const kralBitirHedefleri = d.kral ? gecerliHamleler(d).filter(h => h.tip === 'kralBitir').map(h => h.gonder!) : []
  const hedefAdi = (i: number) => (i === (kralTaban.kral?.oyuncu ?? d.sira) ? 'Al' : `→ ${d.oyuncular[i].ad}`)

  return (
    <GizliKartlar.Provider value={gizli}>
    <div
      className={'masa ' + YIGIN_ZEMINLERI[yiginZemini] + ' ' + (YAPISIK_GORUNUSLERI[yapisikGorunusu] ?? '') + ' ' + (MUT_ZEMINLERI[mutZemini] ?? '') + ' ' + (JQK_GORUNUSLERI[jqkGorunusu] ?? '') + ' ' + (PUAN_YERLERI[puanYeri] ?? '')}
      ref={masaRef}
      style={{ '--el-kayma': EL_YUKSEKLIKLERI[elYuksekligi], '--kart-olcek': KART_BOYUTLARI[kartBoyutu] } as CSSProperties}
      // Oyunda sağ tık menüsü yok (sürüklemeyi bölüyordu).
      onContextMenu={e => e.preventDefault()}
      onPointerDown={() => {
        zamanAsimi.current = 0
        setUzakta(false)
      }}
      {...bakisOlaylari}
    >
      <button className="yuvarlak-dugme puan-dugme" aria-label="Puanlar" onClick={() => setPuanlarAcik(true)}>
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path d="M6 3h12v18H6z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <path d="M9 8h6M9 12h6M9 16h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      <div className="kurallar">
        {aktifKurallar.map(k => <span key={k} className="kural">{k}</span>)}
      </div>

      <div className="el-tur">
        <button className="el-sayaci" onClick={() => setElPenceresi('degistir')}>{d.el}/{gosterilenToplamEl}</button>
        <span>{d.tur}. tur</span>
      </div>
      <button className={'yuvarlak-dugme menu-dugme' + (menu === 'oyun' || menu === 'bitir' ? ' acik' : '')} aria-label="Menü" onClick={() => setMenu(menu === 'oyun' || menu === 'bitir' ? null : 'oyun')}>
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path d="M5 7h14M5 12h14M5 17h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
      {menu === 'oyun' && (
        <div className="oyun-menu">
          <button className="test-satir" disabled={d.asama === 'oyunSonu'} onClick={() => setMenu('bitir')}>Oyunu bitir</button>
          <button className="test-satir" onClick={() => sonrakiSecenek(BAKIS_GORUNUSLERI, bakisGorunusu, setBakisGorunusu)}>
            Yığına bakış <span className="test-deger">{bakisGorunusu}</span>
          </button>
          {/* Kapatınca duraklatma da kalkar: gizli düğmeyle oyun duraklı kalmasın. */}
          <TestSecenegi ad="Geliştirici seçenekleri" acik={gelistirici} degistir={v => { setGelistirici(v); if (!v) setDuraklatildi(false) }} />
        </div>
      )}
      {menu === 'bitir' && (
        <div className="oyun-menu">
          <div className="menu-soru">Oyun bitsin mi? Yarım kalan el sayılmaz.</div>
          <div className="menu-secenekler">
            <button className="test-satir" onClick={() => setMenu(null)}>Vazgeç</button>
            <button className="test-satir menu-onay" onClick={() => { setMenu(null); oyunuBitirIste() }}>Bitir</button>
          </div>
        </div>
      )}

      <MutAlani kartlar={gorunen.mut} />

      <OrtaYigin kartlar={gorunen.orta} carpan={d.bombaEli ? puanCarpani : undefined} />
      {gorunen.bomba && <BombaYigini kartlar={gorunen.bomba.kartlar} sahip={gorunen.bomba.sahip} cikan={cikanOnlar(gorunen)} />}
      {gorunen.kral && (
        <div className="kral-alani" data-yer="kral" style={{ width: kartEni(56) + 14 * (gorunen.kral.papazlar.length - 1), height: kartBoyu(kartEni(56)) }}>
          {gorunen.kral.papazlar.map((k, i) => (
            <div key={kartKimligi(k)} className="yigin-kart" style={{ left: i * 14 }}>
              <Kart kart={k} genislik={kartEni(56)} />
            </div>
          ))}
        </div>
      )}

      <Rakip oyuncu={soldaki} koltuk={2} kalkik={botKalkik} birak={(kart, hedef) => kartBirak(2, kart, hedef)} sec={kart => sec(2, kart)} taraf="sol" sirada={d.asama === 'oyun' && d.sira === 2} secilebilir={!!hedefSecimi?.secenekler.includes(2)} sureUyari={sureUyari && d.sira === 2} carpan={puanCarpani} kapali={botKartlariKapali || ters === 2} duz={botKartlariDuz} kirpik={botKartlariKirpik} cezaAralik={CEZA_ARALIKLARI[cezaAraligi]} yapisik={yapisikCiz} />
      <Rakip oyuncu={sagdaki} koltuk={1} kalkik={botKalkik} birak={(kart, hedef) => kartBirak(1, kart, hedef)} sec={kart => sec(1, kart)} taraf="sag" sirada={d.asama === 'oyun' && d.sira === 1} secilebilir={!!hedefSecimi?.secenekler.includes(1)} sureUyari={sureUyari && d.sira === 1} carpan={puanCarpani} kapali={botKartlariKapali || ters === 1} duz={botKartlariDuz} kirpik={botKartlariKirpik} cezaAralik={CEZA_ARALIKLARI[cezaAraligi]} yapisik={yapisikCiz} />

      <div className="benim-ceza">
        <CezaYigini kartlar={ben.ceza} carpan={puanCarpani} puanTarafi="sol" hedef="ceza:0" aralik={CEZA_ARALIKLARI[cezaAraligi]} yapisik={yapisikCiz} />
      </div>

      <div className="benim-avuc" data-yer="avuc:0" data-hedef="avuc:0">
        {ben.avuc.map((k, i) => (
          <AvucKart
            key={`${k.renk}-${k.deger}`}
            kart={k}
            sira={i}
            adet={ben.avuc.length}
            kalkik={kalkikKart === i}
            kapali={false}
            dokun={() => (ters === 0 ? sec(0, i) : setKalkikKart(kalkikKart === i ? null : i))}
            tut={() => sec(0, i)}
            birak={hedef => kartBirak(0, i, hedef)}
          />
        ))}
        {elimdeIkiVar && (
          <Kalkan
            aktif={blokBende && d.blok!.hedef === 0}
            kurulu={kalkanKurulu}
            bas={() =>
              blokBende && d.blok!.hedef === 0
                ? oyna({ tip: 'blok', kart: d.oyuncular[0].avuc.findIndex(k => k.deger === 2) })
                : setKalkanKurulu(!kalkanKurulu)
            }
          />
        )}
      </div>
      {d.asama === 'oyun' && d.sira === 0 && !d.blok && <div className="benim-sira" />}
      {blokBende && (
        <div className="blok-penceresi" key={d.oyuncular[d.blok!.hedef].ceza.length + '-' + d.blok!.gonderen}>
          <div className="blok-sure" style={{ animationDuration: `${BLOK_SURESI}ms` }} />
          <button onClick={() => oyna({ tip: 'kabul', kart: -1 })}>
            Kabul{d.blok!.hedef !== 0 && ` (${d.oyuncular[d.blok!.hedef].ad})`}
          </button>
        </div>
      )}

      {/* Hamle süresinin son saniyeleri ve Kız'da kart seçme süresi: avucun üstünde eriyen çubuk. */}
      {(kizSuresi || (sureUyari && d.sira === 0)) && (
        <div className="blok-penceresi" key={kizSuresi ? 'kiz' : 'hamle'}>
          <div className="blok-sure bitiyor" style={{ animationDuration: `${kizSuresi ? KIZ_SURESI : UYARI_SURESI}ms` }} />
        </div>
      )}
      {uzakta && <div className="uzakta">Senin yerine bot oynuyor · dokun</div>}

      {hedefSecimi && <div className="secim-arka" onClick={e => hedefSecildi(oyuncuAltinda(e.clientX, e.clientY))} />}
      {hedefSecimi && (
        <SecimKarti
          kart={hedefSecimi.kart}
          konum={hedefSecimi.konum}
          birak={(hedef, yer) => {
            const [tur, i] = hedef.split(':')
            if (tur !== 'ceza' && tur !== 'avuc') return 'red'
            inenRef.current = yer
            if (hedefSecildi(Number(i))) return 'kabul'
            inenRef.current = undefined
            return 'red'
          }}
        />
      )}

      {/* Kral gücü sürerken: bir yığına dokununca penceresi açılır; Bitir kalan Papaz'ları bırakır. */}
      {kralBende && !kralPencere && (
        <>
          <div
            className="secim-arka"
            onClick={e => {
              const yer = document.elementsFromPoint(e.clientX, e.clientY).map(el => el.closest<HTMLElement>('[data-hedef]')).find(el => el)?.dataset.hedef
              if (yer === 'orta' || yer?.startsWith('ceza:')) setKralPencere({ yigin: yer, sira: 0 })
            }}
          />
          <div className="blok-penceresi kral-cubugu">
            <span className="kral-yazi">Kral · {d.kral!.papazlar.length} güç · bir yığına dokun</span>
            <div className="kral-dugmeler">
              {kralBitirSecimi || kralBitirHedefleri.length === 1
                ? kralBitirHedefleri.map(i => (
                    <button key={i} onClick={() => oyna({ tip: 'kralBitir', kart: -1, gonder: i })}>
                      {kralBitirHedefleri.length === 1 ? 'Bitir' : `Bitir ${hedefAdi(i)}`}
                    </button>
                  ))
                : <button onClick={() => setKralBitirSecimi(true)}>Bitir</button>}
            </div>
          </div>
        </>
      )}
      {kralPencere && (
        <>
          <div className="secim-arka" onClick={kralKapat} />
          <KralPenceresi kartlar={kralKartlari} secili={kralSecili} dokun={kralDokun}>
            {kralSecili
              ? kralHedefleri.map(i => <button key={i} className="vurgulu" onClick={() => kralGonder(i)}>{hedefAdi(i)}</button>)
              : <span className="kral-ipucu">Almak istediğin kartlara dokun</span>}
            {papazOrtayaAt && <button onClick={() => oyna({ tip: 'ortayaAt', kart: kralPencere.kart! })}>Ortaya at</button>}
            <button onClick={kralKapat}>Vazgeç</button>
          </KralPenceresi>
        </>
      )}

      {cezaSecimi !== null && (
        <>
          <div className="secim-arka" onClick={() => { setCezaSecimi(null); setKalkikKart(null) }} />
          <div className={`ceza-secimi yigin-${cezaSecimi.yigin}`}>
            <button onClick={() => oyna({ tip: 'ekle', kart: cezaSecimi.kart, hedef: cezaSecimi.yigin })}>Ekle</button>
            <button onClick={() => oyna({ tip: 'alIlerlet', kart: cezaSecimi.kart, hedef: d.serbest ? cezaSecimi.yigin : undefined })}>İlerlet</button>
          </div>
        </>
      )}

      <button className={'yuvarlak-dugme konusma' + (menu === 'soz' || menu === 'sozIsim' ? ' acik' : '')} aria-label="Konuşma" onClick={() => setMenu(menu === 'soz' || menu === 'sozIsim' ? null : 'soz')}>
        <svg viewBox="0 0 24 24" width="22" height="22">
          <path d="M4 4h16v11H8l-4 4V4Z" fill="currentColor" />
        </svg>
      </button>

      {gelistirici && (
        <>
          <button className={'test-dugme gorunus-dugme' + (menu === 'gorunus' ? ' acik' : '')} onClick={() => setMenu(menu === 'gorunus' ? null : 'gorunus')}>
            Görünüş
          </button>
          <button className={'test-dugme duraklat-dugme' + (duraklatildi ? ' acik' : '')} aria-label={duraklatildi ? 'Devam' : 'Duraklat'} onClick={() => setDuraklatildi(!duraklatildi)}>
            <svg viewBox="0 0 24 24" width="14" height="14">
              <path d={duraklatildi ? 'M7 4l13 8-13 8z' : 'M6 4h4v16H6zM14 4h4v16h-4z'} fill="currentColor" />
            </svg>
          </button>
          <button className={'test-dugme dene-dugme' + (menu === 'dene' ? ' acik' : '')} onClick={() => setMenu(menu === 'dene' ? null : 'dene')}>
            Dene
          </button>
          <button className={'test-dugme' + (menu === 'test' ? ' acik' : '')} onClick={() => setMenu(menu === 'test' ? null : 'test')}>
            Test
          </button>
        </>
      )}
      {menu && <div className="test-arka" onClick={() => setMenu(null)} />}
      {menu === 'dene' && (
        <div className="test-panel dene-panel">
          {([['Yeni oyun', undefined], ['Seri dene', seriDenemesi], ['Ceza serisi dene', cezaSerisiDenemesi], ['Blok dene', blokDenemesi], ['8 dene', takasDenemesi], ['Bot 8 dene', takasBotDenemesi], ['Kız dene', kizDenemesi], ['Bot Kız dene', kizBotDenemesi], ['Vale dene', valeDenemesi], ['As dene', asDenemesi], ['Bot As dene', asBotDenemesi], ['3 dene', ucDenemesi], ['Bot 3 dene', ucBotDenemesi], ['Bomba dene', bombaDenemesi], ['Bot bomba dene', bombaBotDenemesi], ['Patlama dene', patlamaDenemesi], ['Bomba boşaltma dene', bombaBosaltmaDenemesi], ['2 yapışma dene', yapisikDenemesi], ['Kral dene', kralDenemesi], ['Bot Kral dene', kralBotDenemesi], ['Yığına bakış dene', bakisDenemesi]] as const).map(([ad, deneme]) => (
            // "Bot 8 dene" kalkan kurulu başlar: takas gelince sökülmesi görülsün.
            <button key={ad} className="test-satir" onClick={() => { setMenu(null); if (!deneme) return setElPenceresi('yeni'); yeniOyunBaslat(deneme); setKalkanKurulu(ad === 'Bot 8 dene') }}>{ad}</button>
          ))}
        </div>
      )}
      {(menu === 'soz' || menu === 'sozIsim') && (
        <div className="oyun-menu soz-menu">
          {menu === 'soz'
            ? HAZIR_SOZLER.map(s => <button key={s} className="test-satir" onClick={() => sozSec(s)}>{s}</button>)
            : KIZ_ISIMLERI.map(i => <button key={i} className="test-satir" onClick={() => { setMenu(null); soyle(0, kizSozu(i)) }}>{kizSozu(i)}</button>)}
        </div>
      )}
      {Object.entries(balonlar).map(([oyuncu, b]) => (
        <div key={b.no} className={`balon balon-${oyuncu}`}>{b.yazi}</div>
      ))}

      {menu === 'gorunus' && (
        <div className="test-panel gorunus-panel">
          <button className="test-satir" onClick={() => sonrakiSecenek(EL_YUKSEKLIKLERI, elYuksekligi, setElYuksekligi)}>
            El yüksekliği <span className="test-deger">{elYuksekligi}</span>
          </button>
          <button className="test-satir" onClick={() => sonrakiSecenek(KART_BOYUTLARI, kartBoyutu, setKartBoyutu)}>
            Kart boyutu <span className="test-deger">{kartBoyutu}</span>
          </button>
          <button className="test-satir" onClick={() => sonrakiSecenek(YIGIN_ZEMINLERI, yiginZemini, setYiginZemini)}>
            Yığın zemini <span className="test-deger">{yiginZemini}</span>
          </button>
          <button className="test-satir" onClick={() => sonrakiSecenek(MUT_ZEMINLERI, mutZemini, setMutZemini)}>
            Mut zemini <span className="test-deger">{mutZemini}</span>
          </button>
          <button className="test-satir" onClick={() => sonrakiSecenek(JQK_GORUNUSLERI, jqkGorunusu, setJqkGorunusu)}>
            J/Q/K <span className="test-deger">{jqkGorunusu}</span>
          </button>
          <button className="test-satir" onClick={() => sonrakiSecenek(YAPISIK_GORUNUSLERI, yapisikGorunusu, setYapisikGorunusu)}>
            Yapışık kart <span className="test-deger">{yapisikGorunusu}</span>
          </button>
          <button className="test-satir" onClick={() => sonrakiSecenek(PUAN_YERLERI, puanYeri, setPuanYeri)}>
            Puan yeri <span className="test-deger">{puanYeri}</span>
          </button>
          <button className="test-satir" onClick={() => sonrakiSecenek(KARTLARIM, kartlarim, setKartlarim)}>
            Destede kartlarım <span className="test-deger">{kartlarim}</span>
          </button>
          <TestSecenegi ad="Bot kartlarını kapat" acik={botKartlariKapali} degistir={setBotKartlariKapali} />
          <TestSecenegi ad="Bot kartları yelpaze" acik={!botKartlariDuz} degistir={v => setBotKartlariDuz(!v)} />
          <TestSecenegi ad="Bot kartları kenardan taşsın" acik={botKartlariKirpik} degistir={setBotKartlariKirpik} />
          <button className="test-satir" onClick={() => sonrakiSecenek(CEZA_ARALIKLARI, cezaAraligi, setCezaAraligi)}>
            Ceza yığını aralığı <span className="test-deger">{cezaAraligi}</span>
          </button>
        </div>
      )}
      {menu === 'test' && (
        <div className="test-panel">
          <TestSecenegi ad="Botlar kendi oynasın" acik={botlarOtomatik} degistir={setBotlarOtomatik} />
          <button className="test-satir" onClick={() => sonrakiSecenek(BOT_HIZLARI, botHizi, setBotHizi)}>
            Bot hızı <span className="test-deger">{botHizi}</span>
          </button>
          <button className="test-satir" onClick={() => sonrakiSecenek(ANIMASYON_HIZLARI, animasyonHizi, setAnimasyonHizi)}>
            Animasyon hızı <span className="test-deger">{animasyonHizi}</span>
          </button>
          <button className="test-satir" onClick={() => sonrakiSecenek(DURAKLAMALAR, duraklama, setDuraklama)}>
            Yakalamada duraklama <span className="test-deger">{duraklama}</span>
          </button>
          <button className="test-satir" onClick={() => sonrakiSecenek(HAMLE_SURELERI, hamleSuresi, setHamleSuresi)}>
            Hamle süresi <span className="test-deger">{hamleSuresi}</span>
          </button>
        </div>
      )}
      <Deste kalan={gorunen.deste.length} ac={destePenceresi ? () => setDesteAcik(true) : undefined} />
      {desteAcik && destePenceresi && <DestePenceresi d={gorunen} kartlarim={kartlarim} kapat={() => setDesteAcik(false)} />}

      {puanlarAcik && (
        <PuanPenceresi
          d={d}
          kapat={() => setPuanlarAcik(false)}
          sonrakiEl={() => {
            if (mesgulRef.current) return
            setPuanlarAcik(false)
            topluDagit(sonrakiEl(d))
          }}
          yeniOyun={() => {
            setPuanlarAcik(false)
            setElPenceresi('yeni')
          }}
        />
      )}

      {elPenceresi && (
        <ElSayisiPenceresi
          enAz={elPenceresi === 'yeni' ? 1 : Math.max(d.el, 1)}
          kapat={() => setElPenceresi(null)}
          destePenceresi={destePenceresi}
          degistir={setDestePenceresi}
          sec={n => {
            setElPenceresi(null)
            if (elPenceresi === 'degistir') return elSayisiDegistir(n)
            setElSayisi(n)
            yeniOyunBaslat(undefined, n)
          }}
        />
      )}

      {ucuslar.map(u => <UcanKart key={kartKimligi(u.kart)} ucus={u} />)}
      {bakis && <YiginYelpazesi bakis={bakis} gorunus={bakisGorunusu} kartlar={bakilanKartlar(bakis.yer)} />}
    </div>
    </GizliKartlar.Provider>
  )
}
