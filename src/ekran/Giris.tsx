import { useEffect, useRef, useState } from 'react'
import { basla, birak, katil, KOLTUK, masaKur, type MasaDurumu } from '../ag'
import { ElSayisiPenceresi, kayitYaz, TITRESIMLER, useOyunAyari, type AgOyunu } from './Masa'

const BOT_ADLARI = ['Bot B', 'Bot C']

// Masaya biri katılınca kurucunun telefonu titrer (☰ menüsündeki seviyeyle).
function titret(ms: number) {
  let c = 1
  try { c = TITRESIMLER[JSON.parse(localStorage.getItem('mut.test.titresim2') ?? '"Hafif"') as keyof typeof TITRESIMLER] ?? 1 } catch { /* varsayılan */ }
  if (c) navigator.vibrate?.(ms * c)
}

function kayitliIsim() {
  try { return localStorage.getItem('oyuncuAdi') ?? '' } catch { return '' }
}

// Masa ekranı benden başlar: [ben, sağdaki (sıradaki), soldaki]. Boş koltuklara bot oturur.
function siraliIsimler(m: MasaDurumu) {
  const tam = [...m.isimler, ...BOT_ADLARI].slice(0, KOLTUK)
  return tam.map((_, i) => tam[(m.ben + i) % KOLTUK])
}

export function Giris({ oyna }: { oyna: (isimler: string[], ag?: AgOyunu) => void }) {
  const [isim, setIsim] = useState(kayitliIsim)
  const [ekran, setEkran] = useState<'ana' | 'katil' | 'masa'>('ana')
  const [kod, setKod] = useState('')
  const [masa, setMasa] = useState<MasaDurumu | null>(null)
  const ad = isim.trim() || 'Oyuncu'
  // Masa kurmak / katılmak için ad zorunlu (botlarla oynarken değil): boşsa kutu kızarır ve seçilir.
  const [adEksik, setAdEksik] = useState(false)
  const adKutusu = useRef<HTMLInputElement>(null)
  const adVarsa = (devam: () => void) => {
    if (isim.trim()) return devam()
    setAdEksik(true)
    adKutusu.current?.focus()
  }
  // Oyun başlamadan "Kaç el?" ve masa ayarları penceresi (Botlarla oyna / kurucunun Başla'sı).
  const [pencere, setPencere] = useState<'bot' | 'masa' | null>(null)
  const [oyunAyari, setOyunAyari] = useOyunAyari()
  const pencereSec = (n: number) => {
    kayitYaz('elSayisi', n)
    kayitYaz('oyunAyari', oyunAyari)
    setPencere(null)
    if (pencere === 'bot') oyna([isim.trim() || 'Sen', ...BOT_ADLARI])
    else basla()
  }
  // Kurucu: yeni katılanın koltuğu birkaç kez parlar.
  const [yeni, setYeni] = useState<number | null>(null)
  const oturan = useRef(1)

  useEffect(() => {
    try { localStorage.setItem('oyuncuAdi', isim) } catch { /* gizli sekme */ }
  }, [isim])
  useEffect(() => {
    if (!masa?.kurucu || masa.asama !== 'bekleme') return
    const n = masa.isimler.length
    if (n > oturan.current) {
      titret(150)
      setYeni(n - 1)
      const t = setTimeout(() => setYeni(null), 2000)
      oturan.current = n
      return () => clearTimeout(t)
    }
    oturan.current = n
  }, [masa])
  useEffect(() => {
    if (masa?.asama !== 'basladi') return
    // Uzaktan oynanan koltuklar (masada benim gözümden): kurucuda misafirler, misafirde herkes.
    const uzak = masa.kurucu ? masa.isimler.map((_, i) => i).slice(1) : [1, 2]
    oyna(siraliIsimler(masa), { kurucu: masa.kurucu, kod: masa.kod, uzak, ilkDurum: masa.ilkDurum, devam: masa.devam })
  }, [masa, oyna])

  const geri = () => {
    birak()
    setMasa(null)
    setEkran('ana')
  }
  const kodlaKatil = () => {
    if (kod.length !== 4) return
    setEkran('masa')
    katil(kod, ad, setMasa)
  }

  return (
    <div className="masa giris">
      <div className="giris-baslik">MUT</div>
      <div className="giris-surum">{__SURUM__}</div>
      {ekran === 'ana' && (
        <div className="giris-kutu">
          <input ref={adKutusu} className={'giris-yazi' + (adEksik && !isim.trim() ? ' eksik' : '')} placeholder={adEksik ? 'Önce adını yaz' : 'Adın'} maxLength={12} value={isim} onChange={e => setIsim(e.target.value)} />
          <button className="giris-dugme ana" onClick={() => adVarsa(() => { setEkran('masa'); masaKur(ad, setMasa) })}>Masa kur</button>
          <button className="giris-dugme ana" onClick={() => adVarsa(() => setEkran('katil'))}>Katıl</button>
          <button className="giris-dugme" onClick={() => setPencere('bot')}>Botlarla oyna</button>
        </div>
      )}
      {ekran === 'katil' && (
        <div className="giris-kutu">
          <input
            className="giris-yazi kod" placeholder="Kod" maxLength={4} autoFocus value={kod}
            onChange={e => setKod(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
            onKeyDown={e => e.key === 'Enter' && kodlaKatil()}
          />
          <button className="giris-dugme ana" disabled={kod.length !== 4} onClick={kodlaKatil}>Katıl</button>
          <button className="giris-dugme" onClick={geri}>Geri</button>
        </div>
      )}
      {ekran === 'masa' && masa && (
        <div className="giris-kutu">
          {masa.asama === 'hata' ? (
            <div className="giris-hata">{masa.hata}</div>
          ) : masa.asama === 'baglaniyor' ? (
            <div className="giris-bilgi">Bağlanılıyor…</div>
          ) : (
            <>
              <div className="giris-kod">{masa.kod}</div>
              <div className="giris-koltuklar">
                {Array.from({ length: KOLTUK }, (_, i) => (
                  <div key={i} className={'giris-koltuk' + (masa.isimler[i] ? '' : ' bos') + (i === masa.ben ? ' ben' : '') + (i === yeni ? ' yeni' : '')}>
                    {masa.isimler[i] ?? 'Boş · bot oturur'}
                  </div>
                ))}
              </div>
              {masa.kurucu
                ? <button className="giris-dugme ana" onClick={() => setPencere('masa')}>Başla</button>
                : <div className="giris-bilgi">Kurucu başlatacak…</div>}
            </>
          )}
          <button className="giris-dugme" onClick={geri}>{masa.kurucu && masa.asama !== 'hata' ? 'Masayı kapat' : 'Geri'}</button>
        </div>
      )}
      {pencere && <ElSayisiPenceresi enAz={1} sec={pencereSec} kapat={() => setPencere(null)} ayar={oyunAyari} degistir={setOyunAyari} />}
    </div>
  )
}
