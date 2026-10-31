import { createRoot } from 'react-dom/client'
import { useCallback, useEffect, useState } from 'react'
import '@fontsource/barlow-condensed/latin-700.css'
import '@fontsource/barlow-condensed/latin-ext-700.css'
import '@fontsource/patrick-hand/latin-400.css'
import '@fontsource/patrick-hand/latin-ext-400.css'
import './tema/varsayilan.css'
import './stil.css'
import { Sahne } from './ekran/Sahne'
import { Masa, type AgOyunu } from './ekran/Masa'
import { Giris } from './ekran/Giris'
import { birak } from './ag'

// Oyun sürerken ekran kararmasın. Uygulama arka plana gidince tarayıcı kilidi bırakır, dönünce yeniden istenir.
function useEkranAcik() {
  useEffect(() => {
    const iste = () => {
      if (document.visibilityState === 'visible') navigator.wakeLock?.request('screen').catch(() => {})
    }
    iste()
    document.addEventListener('visibilitychange', iste)
    return () => document.removeEventListener('visibilitychange', iste)
  }, [])
}

// Yeni sürüm: GitHub Pages sayfayı telefonda 10 dk önbellekte tutuyor. Açılışta (ve giriş ekranındayken uygulama
// öne gelince) önbelleği atlayıp yayındaki sayfaya bakılır; ana dosyanın adı farklıysa yeni adresle yenilenir
// (aynı adres yine önbellekten gelirdi). Masadayken bakılmaz, oyun bölünmez.
async function surumKontrol() {
  if (import.meta.env.DEV) return
  try {
    const yayin = await (await fetch('./?yeni=' + Date.now(), { cache: 'no-store' })).text()
    const ana = (html: string) => html.match(/assets\/index-[\w-]+\.js/)?.[0]
    const benim = ana(document.querySelector<HTMLScriptElement>('script[src*="assets/index-"]')?.src ?? '')
    if (ana(yayin) && benim && ana(yayin) !== benim) location.replace(location.pathname + '?v=' + Date.now())
  } catch { /* internet yok: eldekiyle devam */ }
}

function Uygulama() {
  const [oyun, setOyun] = useState<{ isimler: string[]; ag?: AgOyunu; no: number } | null>(null)
  useEkranAcik()
  useEffect(() => {
    if (oyun) return
    surumKontrol()
    const one = () => document.visibilityState === 'visible' && surumKontrol()
    document.addEventListener('visibilitychange', one)
    return () => document.removeEventListener('visibilitychange', one)
  }, [oyun])
  const oyna = useCallback((isimler: string[], ag?: AgOyunu) => setOyun({ isimler, ag, no: Date.now() }), [])
  if (!oyun) return <Giris oyna={oyna} />
  return <Masa key={oyun.no} isimler={oyun.isimler} ag={oyun.ag} cikis={() => { birak(); setOyun(null) }} />
}

createRoot(document.getElementById('kok')!).render(
  <Sahne>
    <Uygulama />
  </Sahne>,
)
