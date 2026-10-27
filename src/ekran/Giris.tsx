import { useEffect, useState } from 'react'
import { basla, birak, katil, KOLTUK, masaKur, type MasaDurumu } from '../ag'
import type { AgOyunu } from './Masa'

const BOT_ADLARI = ['Bot B', 'Bot C']

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

  useEffect(() => {
    try { localStorage.setItem('oyuncuAdi', isim) } catch { /* gizli sekme */ }
  }, [isim])
  useEffect(() => {
    if (masa?.asama !== 'basladi') return
    // Uzaktan oynanan koltuklar (masada benim gözümden): kurucuda misafirler, misafirde herkes.
    const uzak = masa.kurucu ? masa.isimler.map((_, i) => i).slice(1) : [1, 2]
    oyna(siraliIsimler(masa), { kurucu: masa.kurucu, kod: masa.kod, uzak, ilkDurum: masa.ilkDurum })
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
      {ekran === 'ana' && (
        <div className="giris-kutu">
          <input className="giris-yazi" placeholder="Adın" maxLength={12} value={isim} onChange={e => setIsim(e.target.value)} />
          <button className="giris-dugme ana" onClick={() => { setEkran('masa'); masaKur(ad, setMasa) }}>Masa kur</button>
          <button className="giris-dugme ana" onClick={() => setEkran('katil')}>Katıl</button>
          <button className="giris-dugme" onClick={() => oyna([isim.trim() || 'Sen', ...BOT_ADLARI])}>Botlarla oyna</button>
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
                  <div key={i} className={'giris-koltuk' + (masa.isimler[i] ? '' : ' bos') + (i === masa.ben ? ' ben' : '')}>
                    {masa.isimler[i] ?? 'Boş · bot oturur'}
                  </div>
                ))}
              </div>
              {masa.kurucu
                ? <button className="giris-dugme ana" onClick={basla}>Başla</button>
                : <div className="giris-bilgi">Kurucu başlatacak…</div>}
            </>
          )}
          <button className="giris-dugme" onClick={geri}>{masa.kurucu && masa.asama !== 'hata' ? 'Masayı kapat' : 'Geri'}</button>
        </div>
      )}
    </div>
  )
}
