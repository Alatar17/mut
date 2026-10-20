import { createRoot } from 'react-dom/client'
import './tema/varsayilan.css'
import './stil.css'
import { Sahne } from './ekran/Sahne'
import { Masa } from './ekran/Masa'

createRoot(document.getElementById('kok')!).render(
  <Sahne>
    <Masa />
  </Sahne>,
)
