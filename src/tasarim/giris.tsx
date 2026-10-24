import { createRoot } from 'react-dom/client'
import '@fontsource/nunito/latin-800.css'
import '@fontsource/playfair-display/latin-700.css'
import '@fontsource/barlow-condensed/latin-700.css'
import '../tema/varsayilan.css'
import './tasarim.css'
import { Tasarim } from './Tasarim'

createRoot(document.getElementById('kok')!).render(<Tasarim />)
