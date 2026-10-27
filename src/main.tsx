import { createRoot } from 'react-dom/client'
import { useCallback, useEffect, useState } from 'react'
import '@fontsource/barlow-condensed/latin-700.css'
import './tema/varsayilan.css'
import './stil.css'
import { Sahne } from './ekran/Sahne'
import { Masa } from './ekran/Masa'
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

function Uygulama() {
  const [oyun, setOyun] = useState<{ isimler: string[]; no: number } | null>(null)
  useEkranAcik()
  const oyna = useCallback((isimler: string[]) => setOyun({ isimler, no: Date.now() }), [])
  if (!oyun) return <Giris oyna={oyna} />
  return <Masa key={oyun.no} isimler={oyun.isimler} cikis={() => { birak(); setOyun(null) }} />
}

createRoot(document.getElementById('kok')!).render(
  <Sahne>
    <Uygulama />
  </Sahne>,
)
