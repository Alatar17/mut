// Ses efektleri (Web Audio: telefonda düşük gecikme, sesler üst üste binebilir). Dosyalar public/ses/ içinde.
// Her tür için birkaç ses vardır; her seferinde rastgele biri çalar (arka arkaya aynısı gelmez), hız hafif oynar.
const TURLER = {
  // Kart atma / yığına inme: ElevenLabs'te üretilen 4 ses (baştaki sessizlik kırpıldı, seviyeleri eşitlendi).
  at: { dosyalar: ['at1', 'at2', 'at3', 'at4'], ses: 1 },
  // Kart dağıtma: şimdilik yer tutucu (kısık atma sesi); gerçek dağıtma sesleri gelince dosya adları burada değişir.
  dagit: { dosyalar: ['at1'], ses: 0.45 },
}
export type SesTuru = keyof typeof TURLER

let ctx: AudioContext | null = null
let acik = true
const tamponlar = new Map<string, AudioBuffer>()
const sonCalan = new Map<SesTuru, string>()

export const sesAcKapa = (a: boolean) => (acik = a)

function baglam() {
  if (ctx) return ctx
  try {
    ctx = new AudioContext()
  } catch {
    return null
  }
  // Dosyalar bir kez yüklenip çözülür.
  const yol = import.meta.env.BASE_URL + 'ses/'
  for (const ad of new Set(Object.values(TURLER).flatMap(t => t.dosyalar))) {
    fetch(yol + ad + '.mp3')
      .then(r => r.arrayBuffer())
      .then(b => ctx!.decodeAudioData(b))
      .then(t => tamponlar.set(ad, t))
      .catch(() => {})
  }
  return ctx
}

// Tarayıcılar sesi ilk dokunuştan sonra açar: ilk dokunuşta bağlam kurulur.
if (typeof document !== 'undefined') {
  const uyandir = () => void baglam()?.resume()
  document.addEventListener('pointerdown', uyandir, { capture: true })
  document.addEventListener('keydown', uyandir, { capture: true })
}

// gecikmeMs sonra tür için rastgele bir ses çalar.
export function sesCal(tur: SesTuru, gecikmeMs = 0) {
  if (!acik) return
  const c = baglam()
  if (!c || c.state !== 'running') return
  const t = TURLER[tur]
  const secenek = t.dosyalar.filter(a => a !== sonCalan.get(tur) && tamponlar.has(a))
  const ad = secenek[Math.floor(Math.random() * secenek.length)] ?? (tamponlar.has(t.dosyalar[0]) ? t.dosyalar[0] : undefined)
  if (!ad) return
  sonCalan.set(tur, ad)
  const kaynak = c.createBufferSource()
  kaynak.buffer = tamponlar.get(ad)!
  kaynak.playbackRate.value = 0.94 + Math.random() * 0.12
  const kazanc = c.createGain()
  kazanc.gain.value = t.ses
  kaynak.connect(kazanc).connect(c.destination)
  kaynak.start(c.currentTime + Math.max(0, gecikmeMs) / 1000)
}
