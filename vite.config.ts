import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Sürüm: derlendiği an (Türkiye saati; yayın GitHub'da derlenir). Giriş ekranında ve ☰ menüsünde küçük yazı:
// telefon yeni yayını almış mı buradan anlaşılır.
const surum = new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(/[.,\s]+(?=\d{2}:)/, '-').replace('/', '.')

export default defineConfig({
  plugins: [react()],
  define: { __SURUM__: JSON.stringify(surum) },
  base: './',
  server: { port: 5173, strictPort: true },
  // tasarim.html: kart tasarımı deneme sayfası; baglanti.html: iki telefon bağlantı denemesi (telefonda açılsın diye yayına giriyor).
  build: { rollupOptions: { input: { index: 'index.html', tasarim: 'tasarim.html', baglanti: 'baglanti.html' } } },
})
