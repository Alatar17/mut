import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  server: { port: 5173, strictPort: true },
  // tasarim.html: kart tasarımı deneme sayfası (telefonda da bakılabilsin diye yayına giriyor).
  build: { rollupOptions: { input: { index: 'index.html', tasarim: 'tasarim.html' } } },
})
