import { createRoot } from 'react-dom/client'
import '@fontsource/barlow-condensed/latin-700.css'
import './tema/varsayilan.css'
import './stil.css'
import { Sahne } from './ekran/Sahne'
import { Masa } from './ekran/Masa'

createRoot(document.getElementById('kok')!).render(
  <Sahne>
    <Masa />
  </Sahne>,
)
