# Mut — Proje Dokümanı

> Kart oyunu Mut'un kuralları ve telefon sürümünün planı.
> İşaretler: ❓ = henüz netleşmedi, 🔔 = sonra hatırlatılacak. Hepsi Bölüm 11'de toplu.

## 0. Proje Durumu
- **Sıradaki iş (devir 2026-11-07):** 1) ~~Son tur görünüşü~~ **bitti (2026-11-07):** Normal seçildi, Görünüş'ten "Son tur"/"Son tur dene"/"El yüksekliği" satırları kalktı (el kayması sabit +10 px). 2) **Canlı Kral penceresi YAPILDI (2026-11-07, derleme temiz, iki telefonla test bekliyor):** Papaz'la seçen kişinin penceresi (yığın + seçilen grup) herkeste izleme olarak açılır, başlıkta "X Papaz'la seçiyor", hedef gösterilmez, Vazgeç/Gönder/güç arası kapanır. Mesaj `kralGoster` (`ag.ts`), `Masa.tsx` `kralIzle`. Eski öneri: Öneri: diğerlerinde de pencere düğmesiz açılır, hangi yığın, seçilen grup canlı havalanır (sarı çerçeve), başlıkta "X Papaz'la seçiyor", Vazgeç herkeste kapatır; hedef düğmesi canlı gösterilmez. Canlı Kız yapısı (`kizBasla`/`kizKaldir`, `canliKiz` ref, kurucu iletir) örnek alınır. 3) **İki telefonla test bekliyor:** kart kaldırma/sürükleme herkeste, canlı Kız (aynı karma, kalkan ters kart, çekilen yüzünü görür), Kız blöfü parmağı. (Bu oturumun ayrıntısı `GECMIS.md` en altında.) Canlı görme diğer adaylar: 8/Kız sürüklenirken hangi oyuncunun üstünde (sonra, ağ yükü bakılacak); yığına bakma/Mut sallanması/kalkan bilerek gizli.
- **Ses (2026-11-07, test amaçlı):** ElevenLabs sesleri. `src\ses.ts` (Web Audio), işlenmiş dosyalar `public\ses\` (at1-4 = kart atma, kullanılıyor; dagit1-8 = tek kart sesleri, kullanılmıyor), ham indirilenler `ses-kaynak\` (16 dosya: 8 atma/tek kart, 4 flick, 4 "dealer" 3 sn'lik dağıtma). ☰ menüsünde **Ses**, varsayılan **kapalı**. Dağıtma sesi şimdilik kapalı (tek kart sesi atma gibi geldi, 3 sn'lik dağıtmalar kısık ve ~1 sn'lik dağıtıma uzun). Sıradaki: atma seslerini dinleyip beğenilmeyeni çıkar; dağıtma için ~1-1,5 sn tek dosya üretmek; sonra diğer olaylar (blok, bomba, Kral vb.). Lisans: ElevenLabs planına bak (herkese açık yayından önce).
- **iPhone tam ekran:** sadece ana ekrandaki simgeden açınca olur (Safari'de Fullscreen API yok); kodla çözülmez, kullanıcıya anlatıldı.
- **Hatırlatılacaklar ve eski açık notlar:** aşağıdaki iki satır olduğu gibi duruyor; eski oturumların ayrıntısı (yapılanlar, testler, kararların gerekçesi) `GECMIS.md`'de.
- **Sıra göstergesi rakipte (2026-10-31, kullanıcı kararı; telefonda test bekliyor):** Işık ve Kenar seçiliyse sırası gelen rakipte de aynısı çıkar (Işık: kart yelpazesinin arkasında dikey oval; Kenar: ekranın o yanı sararır), isim etiketi de sararmaya devam eder. Çizgi sadece bende, rakipte çizgi yok (kullanıcı Çizgi'yle oynuyor, isim etiketi ona yetiyor). Blok penceresi açıkken rakip ışığı yok (benimki gibi). **Varsayılan Işık** (eskiden Çizgi); kayıt adı değişmedi, arkadaşların telefonunda kahvede elle ☰ → Sıra göstergesi → Işık yapılacak. Rakip ışığının gücü: kullanıcı ☰'daki geçici denemeden **Orta**'yı seçti (saydamlık 0,75, `stil.css` `.rakip-sira`), deneme satırı kaldırıldı.
- **Hatırlatılacaklar listesi (kullanıcı 2026-10-21/22: "bunları unutma, bitirdikçe hatırlat"):** 1) Ses efektleri — **sonra** (kullanıcı Unity ve Unreal'ın ücretsiz ses paketlerine bakacak; Claude lisansın oyun motoru dışında kullanıma izin verdiğini kontrol etmeli). 2) Ceza yığını aralığının seçilmesi (Görünüş menüsünde; kullanıcı 10 px'i iyi buluyor, daha test edecek). 3) 2. aşama: telefonlarla birlikte oynama (yayın: şimdilik herkese açık GitHub + GitHub Pages; gizli depo + Cloudflare'e "şimdilik gerek yok"). 4) Mekanik görüşleri: kapandı (2026-10-24; kullanıcının ek görüşü yok, Claude'un büyük itirazı yok; kahve testinden sonra gerçek oyuna göre bakılacak). 6) **Bombayı ceza yığınıyla göndermek** kuralı (6.8 madde 7; kural 2026-10-24'te netleşti, kodlanacak). 5) Orta yığına ayrı zemin — gerekirse (Kesikli beğenildi, büyük ihtimalle gerek yok). Her biri konuşulup bitince buradan silinir. (Yığına bakış ve deste penceresi 2026-10-22'de yapıldı.)
- Not: tarayıcı panelinde Vite bazen dosya değişikliğini kaçırıyor (sayfa eski hâlle takılır) → değişen dosyaları `touch` edip yenile.
- Görsel kararlar kafaya göre seçilmez: seçenekler Test menüsünde geçişli konur, kullanıcı seçer, sonra kalıcı yapılır. Kullanıcı yokken çalışılırsa varsayılan seçilip devam edilir, kararlar sonradan toplu verilir.
- **Klasör:** `C:\Users\PC\Desktop\Claude\Projeler\MUT`
- **Teknoloji:** PWA; **React + TypeScript + Vite**. GitHub Pages'te yayın, kiralık sunucu yok (bkz. Bölüm 9).
- **Araçlar:** Claude Code. Bu projede Google AI Studio uyumu **aranmıyor** (kullanıcı kararı: AI Studio bu projenin altından kalkamaz).
- **Ekran:** Telefon **yatay** tutulur.
- **Görünüm:** Kodla çizilen klasik iskambil kartları (kahvede bunlarla oynanıyor). Gerçek resimli bir set (Wikimedia, CC0) denendi; "fazla gerçek, sıkıcı" bulunup bırakıldı. Renkler `src\tema\varsayilan.css` içinde; geliştirme seçenekleri sağ alttaki "Test" menüsünde. Bütün görseller tema klasöründe; kullanıcı ileride kendi kart/masa/VFX dosyalarını (Photoshop, Blender) aynı isimlerle koyarak değiştirebilir. Bunun için bir "görsel rehberi" hazırlanacak.
- **Yol haritası:**
  1. Masa taslağı (sadece görsel, oynanmaz)
  2. Kural motoru (ekransız) + botların birbirine karşı otomatik testi
  3. Birleştirme: sürükle-bırak, botlar, "Botlar otomatik" butonu → ilk oynanabilir sürüm
  4. Özel kartlar teker teker: seri → 2 → 8 → Kız → Vale → As → 3 → 10 → Papaz → 7
  5. Tek telefonda sıra ile, yayın, herkes kendi telefonundan, kahve testi
- **Doküman kuralı:** Her kavram için Bölüm 3'teki tek isim kullanılır.

### 0.1 Çalışma bilgileri
- **Çalıştırma:** `npm run dev` → http://localhost:5173 (sunucu onu açan sohbete bağlı; sohbet kapanınca Chrome'da "bağlanmayı reddetti" çıkar, yeni sohbette Claude yeniden başlatır). Claude Code'da tarayıcı paneli için `.claude\launch.json` içinde "mut" adlı ayar var; 5173 başka sohbette açıksa "mut-2" ayarı (5174, doluysa sonraki boş port) kullanılır. Telefon boyutunda bakmak için panel 844 × 390'a ayarlanır.
- **Claude'un tarayıcı panelinde test:** panel 844 × 390'a ayarlandıktan sonra sayfa yenilenmeli; panel gizliyken açılırsa sahne 0 boyutta ölçülür ve sürükle-bırak çalışmaz gibi görünür (oyun hatası değil). 2026-10-21'de `left_click_drag` ile kart sürükleme yine tutmadı (sebebine bakılmadı); bot hamleleri ve ekran durumu sorunsuz denenebiliyor.
- **Kontrol:** `npm run kontrol` (TypeScript hata denetimi). `npm test` kural testleri + bot simülasyonu (Vitest, ~12 sn). `npm run build` yayın dosyalarını `dist\`'e üretir (henüz kullanılmadı).
- **Yayın (2026-10-22, 1. aşama başladı):** PWA dosyaları `public\` içinde (`manifest.webmanifest`: tam ekran, yatay; simge `simge.svg`, PNG'leri Edge ile çizildi: `simge-192/512.png`). Service worker (çevrimdışı) bilerek yok: telefonda sık düzeltme yaparken eski sürüm takılı kalmasın; kahve testinden önce eklenecek. `.github\workflows\yayin.yml`: main'e her yüklemede GitHub derleyip Pages'e yayınlar (Pages ayarında kaynak "GitHub Actions" olmalı). Yayın dosyalarını yerelde denemek: `.claude\launch.json` → "mut-yayin" (4173).
- **Telefon kurulumu dersleri (2026-10-22, kullanıcının Xiaomi'sinde adb + deneme ile kanıtlandı):** 1) **Aynı adreste (`alatar17.github.io`) tek kurulu uygulama:** Lore kuruluyken Mut "zaten yüklü" deyip kurulmuyor, Mut kuruluyken Lore kurulmuyor (Chrome tarafı; Android'de hayalet paket yok, başka adreslerdeki squoosh.app ve mdn.github.io sorunsuz kuruldu). Ovia'nın kurulamaması da bu. Çözüm: Mut'a ayrı adres (Cloudflare Pages ya da GitHub organizasyonu; karar bekliyor). Arkadaşlar sadece Mut kuracağı için onları etkilemez. 2) **Manifestte `display: fullscreen` + `orientation: landscape` varken HyperOS uygulamayı açmıyordu** (logcat: Chrome'un WebappActivity'si `START_ABORTED`); ikisi kaldırılınca (`standalone`, yön serbest) açıldı. Tam ekran gerekirse oyun içinden (ilk dokunuşta Fullscreen API) denenecek, manifeste geri koyma. 3) **`pages.dev` Türkiye'de Chrome'dan açılmıyor (2026-10-22):** mut-30f.pages.dev PC'de açılıyor; telefonda Chrome'da hem mobil veride hem ev Wi-Fi'ında `ERR_CONNECTION_ABORTED` (adres bulunuyor, bağlantı kesiliyor = ağ düzeyinde engel), Opera'da sadece VPN açıkken açılıyor (VPN kapalıyken o da açmıyor, engel kesin). Arkadaşlar da takılır → Cloudflare `pages.dev` kalıcı adres olamaz; Ovia'yı da oraya taşıma. Yeni adres kararı bekliyor. adb kilidi: `~\.claude\settings.json` (adb komutları onay ister, dosya/galeri komutları yasak).
- **Git:** GitHub'da herkese açık depo: https://github.com/Alatar17/mut (2026-10-22). Oyunun adresi: **https://alatar17.github.io/mut/**. `git push` ile yüklenir, giriş bilgisi Windows'ta kayıtlı (Git Credential Manager). Her test edilmiş adımda Türkçe mesajlı commit atılır. Kimlik sadece bu depoda ayarlı.
- **Kod yapısı:**
  - `src\oyun\kart.ts`: kart türleri, puanlar, kart oranı (1.4)
  - `src\oyun\motor.ts`: kural motoru. `yeniOyun`, `gecerliHamleler`, `hamleYap` (yeni durum döndürür, eskisi değişmez), `sonrakiEl`. Yeni durumda `sonHamle` (hamlenin sonucu) ve `dagitim` (son dağıtım sırası) var; ekran animasyonu bunları okur. Yığınlarda dizinin sonu = en üst kart. Hamle tipleri: ortayaAt, mutEslestir, cezaBosalt, ekle, alIlerlet, blok, kabul, takas, cek.
  - `src\oyun\bot.ts`: rastgele bot (`botHamlesi`) ve akıllı bot (`akilliBotHamlesi`); `bot.test.ts` akıllıyı rastgelelere karşı oynatır. `src\oyun\rastgele.ts`: tohumlu rastgele (aynı tohum → aynı oyun, hata tekrar üretilebilir).
  - `src\oyun\deneme.ts`: Dene menüsündeki hazır eller (`denemeKur` ile istenen kartlar avuçlara/ortaya/ceza yığınlarına dizilir).
  - `src\oyun\motor.test.ts` (kural testleri), `src\oyun\simulasyon.test.ts` (botlar birbirine karşı)
  - `src\ekran\`: `Sahne` (844 × 390 sahneyi ekrana sığdırır), `Masa` (yerleşim, puan kağıdı penceresi, Test menüsü), `Kart`, `Yiginlar` (orta yığın, ceza yığını, deste) `Masa` ayrıca oyunun akışını yönetir: `d` gerçek durum, `gorunen` ekranda çizilen (animasyon sürerken geride kalır); `hamleOyna` hamleyi animasyonla gösterir; sürükleme `useSurukle`. `animasyon.tsx`: kart yerleri, uçan kartlar, dağıtım.
  - `src\stil.css`: yerleşim; `src\tema\varsayilan.css`: renkler

### 0.2 Masa düzeni (1. adımda kullanıcıyla birlikte belirlendi)
- **Sahne:** 844 × 390, yatay. Telefon dik tutulursa "Telefonu yan çevir" yazısı çıkar.
- **Ben (alt):** Avuç ortanın biraz sağında, hafif yelpaze, kartlar alttan biraz ekran dışında. Ceza yığınım avucun solunda, puanı yığının solunda. Sıra bendeyse avucun altında sarı ışık çizgisi. Elimde 2 varsa avucun sağında kalkan.
- **Botlar (sol/sağ kenar):** Kartlar oyuncuya dönük, dikey sütun, masanın dikey ortasına hizalı. Ceza yığınları önlerinde, yan dönük. İsim etiketi avucun üstünde; sıra ondaysa sarı parlar.
- **Orta:** Üstte Mut kartları (kutu içinde, yazısız), tam ortada orta yığın (üstteki 3 kart kaydırılmış + kart sayısı rozeti).
- **Köşeler:** Sol üst: puan kağıdı ikonu ve yanında aktif kurallar (Serbest el, ×2). Sağ üst: "2/10  2. tur". Sol alt: konuşma butonu. Sağ alt: deste ve solunda "Test" butonu.
- **Kart boyları (en × boy):** Avucum 60 × 84, botların avucu 56 × 78, orta yığın / ceza yığınları / Mut 56 × 78, deste 42 × 59.
- **J, Q, K:** Ortada küçük, ince bir harf (figür yok).
- **Puan kağıdı penceresi:** Beyaz kağıt, mavi tükenmez havası; şimdilik uydurma rakamlar.
- Kullanıcının bu adımda beğenmediği şeyler: masa ortasında her şeyin alt alta sıkışması, avuç etrafında çerçeve, gerçekçi resimli kartlar, J/Q/K'nin büyük harfi.

## 1. Genel Bakış
- **Oyunun adı:** Mut — kahvede oynayan üç arkadaşın baş harfleri: **M**ert, **U**ğur, **T**ahir.
- **Tür:** Kart oyunu
- **Oyuncu sayısı:** 3–4 kişi (genelde kahvede 3 kişi oynanıyor)
- **Kökeni:** Geleneksel olarak iskambil kağıtlarıyla oynanan bir oyun.
- **Kazanan:** Belirlenen sayıda el (örn. 10 el) sonunda **en az puanı olan** oyuncu.

## 2. Malzemeler
- Standart 52'lik iskambil destesi, **joker yok**.
- Ekranda kart kısaltmaları: **A** = As, **J** = Vale (Jilet), **Q** = Kız, **K** = Papaz (Kral). ("K" Kız ile karışmasın diye.)

## 3. Terimler
| Terim | Anlamı |
|---|---|
| **Avuç** (öneri ❓) | Oyuncunun elindeki 4 kart. |
| **Orta yığın** | Oyuncuların sırayla kart attığı, üst üste biriken ortadaki yığın. |
| **Mut kartları** | Elin başında masanın üst ortasına yan yana açılan 4 kart. **Orta yığından ayrıdır.** O elin kurallarını belirler. (Eski adı: açık kartlar.) |
| **Ceza yığını** | Oyuncunun önünde, ona gönderilen kartların biriktiği yığın ("B'nin ceza yığını"). Puan bunlardan hesaplanır. Kahvede "ön" denir. |
| **Sıradaki oyuncu** | Saat yönünde bir sonraki oyuncu (masada sağındaki). |
| **Tur** | Herkese 4 kart dağıtılıp hepsinin oynanması. Ceza yığınları sonraki tura kalır. |
| **El** | 52 kartın tamamı bitene kadar oynanan turlar (3 kişide 4 tur, 4 kişide 3 tur). **Puanlar el sonunda yazılır.** |
| **Oyun** | Başlangıçta seçilen sayıda el (örn. 3, 10, 20). İstenirse **"Oyunu bitir"** ile erken bitirilebilir. |
| **Puan kağıdı** | Her el sonunda oyuncuların puanlarının yazıldığı tablo (kahvedeki kağıt). Ekranda "Puanlar" butonuyla açılır. |

### Kart türleri (öneri isimler ❓)
| Tür | Anlamı | Kartlar |
|---|---|---|
| **Daimi kart** | Her zaman çalışır; oyuncu avucundan oynayınca etkisi olur. | 2, 7, 8, Kız |
| **Açılış kartı** | Sadece Mut kartları arasında çıkarsa çalışır; o elin kuralını değiştirir. | 3, 10, Vale, Papaz, As |
| **Normal kart** | Özel etkisi yok, sadece puanı var. | 4, 5, 6, 9 |

## 4. Oyunun Amacı
Elin türüne göre amaç tersine döner:

| El türü | Amaç |
|---|---|
| **Artı el** (varsayılan) | Ceza yığınında **az puan** biriktirmek. Kendi ceza yığınına kart atamazsın; yakaladığın kartları başkasının ceza yığınına gönderirsin. |
| **Eksi el** (Mut kartlarında As varsa) | Ceza yığınında **çok puan** toplamak; puan, puan kağıdına **eksi** yazılır. Herkes kartları kendi ceza yığınına çekmeye, başkalarınınkinden almaya çalışır. |

## 5. Hazırlık
1. Deste karıştırılır.
2. Kartlar **teker teker** dağıtılır: A'ya, B'ye, C'ye, sonra **Mut kartlarına** bir kart; bu döngü 4 kez tekrarlanır. Böylece herkesin avucunda 4 kart, masanın üst ortasında **yan yana 4 Mut kartı** olur.
3. Mut kartları **açılma sırasıyla** değerlendirilir ve elin kuralları belirlenir (bkz. 5.1).
4. Elin başlatanı başlar (her elde sağa doğru bir kayar). İlk elin başlatanı **rastgele** seçilir.

### 5.1 Mut kartlarının önceliği (çakışmalar)
Bazı açılış kartları birbiriyle çelişir. Bu durumda **önce açılan kart geçerli olur**, sonra açılan etkisiz kalır.

| Çakışma | Neden | Örnek |
|---|---|---|
| **3 ↔ As** | Serbest elde istediğine atarsın; eksi elde kendine toplarsın — ikisi birlikte anlamsız. | Açılış sırası 3, 5, As → **serbest el**, As etkisiz. Açılış sırası As, 3 → **eksi el**, 3 etkisiz. |
| **10 ↔ As** | Eksi elde kart toplanır, bomba elinde bombadan kaçılır — ikisi birlikte anlamsız. | Önce açılan geçerli. |
| 3 + 10 | Çakışmaz, birlikte olur: bomba istenene gönderilir. | — |
| Vale | Hiçbir kartla çakışmıyor (eksi elde puan −×2). | — |
| Üç 10 Mut'ta | Kalan tek 10'u alan üç Mut 10'unu da alır, bomba dört 10'la kurulur, devredilemez, onda patlar (kullanıcı onayı 2026-10-22). | — |
| Papaz | Hiçbir kartla çakışmıyor (yapıldı 2026-10-24). Eksi elde Kral'ın aldığı kartlar kendine; bomba yığınından alınmaz; Kral'la çekilen 10'lar normal hedefe; avuçtaki Papaz Mut'taki bütün Papaz'ları alır, hepsinin gücü art arda (6.9.1). | — |
| 7 | 7 eklenince konuşulacak. | — |

Çakışma analizi 2026-10-22'de yapıldı; başka çakışma yok. Üçlü açılışlar da "önce açılan geçerli" ile çözülür (örn. 10, As, 3 → As geçersiz, 3 + 10 geçerli).

**Etkinin süresi:** Bir Mut kartının etkisi, o kart eşleştirilip masadan gitse bile **el boyunca sürer**.

**Ekran notu:** Elin aktif kuralları (örn. "Serbest el", "Eksi el", "×2", "Bomba") ekranda sürekli görünür olmalı.

### 5.2 Mut kartlarıyla eşleştirme
- Mut kartları **orta yığından ayrıdır** (masanın üst ortasında yan yana durur).
- Avucundaki kart Mut kartlarından biriyle eşleşiyorsa onları eşleştirip **sıradaki oyuncunun ceza yığınına** gönderebilirsin (serbest elde: istediğine).
  - Örnek: Mut kartlarında Vale var, avucunda Vale var → iki Vale sıradakinin ceza yığınına.
- **Zorunluluk:** Mut kartlarından biriyle eşleşen bir kartı **orta yığına boşa atamazsın**; Mut kartları boşa gitmesin diye eşleştirmek zorundasın. Ama o kartı **bu sıra oynamak zorunda değilsin**; avucunda tutup başka kart oynayabilirsin.
  - **İstisna — 8 ve Kız'ın gücü (karar 2026-10-21):** Mut kartlarında 8 varken avucundaki 8 ile takas yapabilirsin; 8 ortaya düşer, Mut 8 yerinde kalır. Kız'da da aynı. Güç, Mut zorunluluğundan önce gelir.
- **Birden fazla aynı Mut kartı:** Mut kartlarında aynı sayıdan birden çok varsa (örn. üç 5), avucundaki **tek** 5 ile **hepsini** alırsın.
  - **Ekranda:** Kartı Mut 5'lerden herhangi birinin üstüne bırakırsın; bütün Mut 5'ler kartınla birlikte toplanır ve hedefe uçar. Normal elde hedef otomatik (sıradaki), serbest elde hedef oyuncuya bırakarak ya da dokunarak seçilir.
- **Mut kartlarında seri yoktur:** Mut kartları 2-3-4-5-6 olsa bile avucundaki 7 ile bunları alamazsın. Mut kartlarıyla sadece **aynı sayı** eşleşir.
- **Mut mu, orta mı:** Orta yığının üstünde 9, Mut kartlarında da 9 varken 9 atarsan hangisiyle eşleşeceğini **sen seçersin**; ama her iki durumda da eşleşme olur, kartı orta yığına sadece "kapatmak" için atamazsın. (Normalde bu durum oluşmamalı, çünkü Mut 9 varken kimse 9'u orta yığına atamaz; kural güvenlik için duruyor.)
- **Her hamlede tek kart:** Avucunda aynı karttan birden fazla olsa bile tek seferde **bir kart** oynanır. Örnek: Mut kartlarında Vale, avucunda üç Vale → bir Vale ile Mut Vale'sini eşleştirip gönderirsin, sıra geçer.

**Kart hesabı:**
- 3 oyuncu: 4 Mut kartı + 48 kart → tur başı 12 kart → **4 tur**
- 4 oyuncu: 4 Mut kartı + 48 kart → tur başı 16 kart → **3 tur**

## 6. Oyunun Akışı

### 6.1 Sıra ve yön
- Oyun **sağa doğru** döner (yukarıdan bakınca saatin tersi yönü; Okey gibi). **Sıradaki oyuncu** = sağındaki oyuncu.
- Sırası gelen oyuncu **bir hamle yapmak zorundadır**; kendi isteğiyle pas geçemez.

### 6.2 Hedef kuralı (tüm hamleler için)
| El durumu | Eşleşen kartlar kime gider? |
|---|---|
| **Normal** (Mut kartlarında 3 yok) | Kartların alındığı yerin **sıradakine**. (Orta yığından, Mut kartlarından ya da kendi ceza yığınından → senin sıradakine; sıradakinin ceza yığınından → onun sıradakine) |
| **Serbest el** (Mut kartlarında 3 var) | **İstenen herhangi bir oyuncuya** (kendin hariç). |
| **Eksi el** (Mut kartlarında As var) | Her zaman **kendi ceza yığınına** (orta yığından, Mut kartlarından, seriden ya da başkasının ceza yığınından alınan kartlar). |

### 6.3 Hamle seçenekleri (oyuncu birini seçer)
Temel ilke: **Sadece eşleşen kartlar hareket eder** ve hedef her zaman **en üstteki** kart(lar)dır (istisna: Kral eli, bkz. 6.9).

**Seçenek 1 — Orta yığına at**
- Avuçtan bir kart orta yığına atılır. Orta yığındaki kartlar **her zaman üst üste** yığılır.
- Orta yığındaki en üst kartla **eşleşmiyorsa** (örn. 5 üstüne 6): kart orta yığında kalır, sıra geçer.
- **Eşleşiyorsa** (5 üstüne 5): eşleşen **iki kart** (orta yığındaki en üst + atılan) sıradaki oyuncunun ceza yığınına gider (serbest elde: istenen oyuncuya, kendisi hariç). Orta yığının geri kalanı yerinde kalır.

**Seri (sıralı kartlar)**
- Orta yığına art arda atılan kartlar **artan sırada** olursa (örn. A 4, B 5, C 6 attı → 4-5-6), seriyi tamamlayan oyuncu **seriyi alıp** sıradakinin ceza yığınına gönderir (serbest elde: istediğine).
- Sadece **artan** sıra geçerli (6-5-4 seri değildir).
- Sıralama: **As=1**, 2…10, Vale=11, Kız=12, Papaz=13.
- En az seri uzunluğu: **3**.
- Başkasının ceza yığınındaki seri de, devam kartı sende varsa uzatılıp gönderilebilir (saldırı kuralları geçerli).
- Ceza yığınına seri gelen oyuncu iki şey yapabilir:
  - **En üsttekini eşleştir:** Ceza yığınında 4-5-6 var, avucunda 6 → iki 6 gönderilir, 4-5 ceza yığınında kalır.
  - **Seriyi uzat:** Avucunda 7 var → 4-5-6-7 **hep birlikte** gönderilir.
- **Kararlar (2026-10-21):**
  - Seri sadece **yığının üstüne** bakılarak bulunur; kartları kimin attığı, hangi turda ya da hangi hamlede geldiği önemli değil (orta yığında da ceza yığınında da).
  - Önceki turdan orta yığında kalan kartlarla da seri olur.
  - Seri uzatma her ceza yığını hamlesinde geçerli: kendi ceza yığınını boşaltırken (4-5-6'ya 7 ekleyip hepsini gönder), "ekle" (rakibin 4-5-6'sına 7 ekleyip orada bırak), "al ve ilerlet".
  - Mut kartlarında 7 varken orta yığında 4-5-6 varsa avuçtaki 7 ile **oyuncu seçer**: seriyi mi alır, Mut 7'yi mi (iki durumda da yakalama olur).
  - Uygulama iki parça: önce orta yığında seri, sonra ceza yığınında seri.

**Seçenek 2 — Kendi ceza yığınını boşalt** (sadece artı elde mantıklı)
- Ceza yığınındaki **en üstteki** aynı sayılı kart(lar) ile avucundaki kart eşleştirilir.
- Hepsi birlikte sıradakinin ceza yığınına gönderilir (serbest elde: istenen oyuncuya).
- Örnek: Ceza yığınının üstünde 5 var, avucunda 5 var → iki 5 sıradakinin ceza yığınına.

**Seçenek 3 — Rakibin ceza yığınına saldır**
Rakibin ceza yığınındaki en üst kart avuçtaki kartla eşleşiyorsa iki yol var:

| | Ekle | Al ve ilerlet |
|---|---|---|
| **Normal el** | **Herkese** (kendin hariç) | Sadece **sıradakinden** alınır, **onun sıradakine** gider |
| **Serbest el** | Herkese | **Herkesten** alınır, **istediğine** gider (kendin ve alınan hariç; 3 kişide tek hedef) |

(Karar 2026-10-21: kahvede normal elde de herkese "ekle" yapılıyor.) Serbest elde kazanmakta olan (en az puanlı) oyuncu herkesin hedefidir.
- **3a. Ekle** (eski adı: üstüne yığ)**:** Kendi kartını rakibin ceza yığınına eklersin; rakibin puanı artar. Seri uzatma da (4-5-6'ya 7) aynı kurala uyar.
- **3b. Al ve ilerlet:** Rakibin ceza yığınındaki eşleşen kartları + kendi kartını alıp **onun sıradakinin** ceza yığınına gönderirsin (serbest elde: istediğin oyuncuya, kendin hariç).
  - Strateji: Oyunu kazanan (en az puanlı) oyuncuyu hedef almak için kullanılır.

### 6.4 Zorunluluklar ve beton dökmek
**Zorunluluklar:**
- **Zorunlu:** Mut kartlarıyla eşleşen kartı orta yığına atamazsın, eşleştirmelisin. Bu her sayı için geçerli; örn. Mut kartlarında 2 varsa avucundaki 2'yi orta yığına atamazsın.
- **Zorunlu:** Orta yığına attığın kart üstteki kartla eşleşirse ya da seri oluşursa yakalama gerçekleşir; kartlar birinin ceza yığınına gönderilmek zorundadır. Örn. orta yığında 2 varken üstüne 2 atıp "kapatamazsın", eşleşir. (Tek istisna: 8 ile takas ya da Kız ile çekme yaparsan kart ortaya düşer ama eşleşme ve seri olmaz.)
- **Zorunlu değil:** Ceza yığınlarıyla eşleştirme. Örn. birinin ceza yığınının üstünde 2 var, avucunda 2 var → üstüne eklemek zorunda değilsin, 2'yi orta yığına atabilir ya da blok için saklayabilirsin.

**Beton dökmek:** Bir yığındaki değerli kartların üstünü başka kartlarla kapatıp onları alınamaz hale getirmek.
- **Ceza yığınında:** Bir oyuncunun ceza yığınına üç 3 atıldı. Dördüncü 3 gelirse o oyuncu bunları alıp sıradakine gönderebilir; sıradaki oyuncu bunu önlemek için üstünü başka kartla kapatır.
- **Orta yığında:** Orta yığında Vale var ve rakiplerin Vale'si olduğunu düşünüyorsun → üstüne 2 (ya da başka kart) atıp Vale'yi kapatırsın.
- 2, 8 ve Kız'ın gücü isteğe bağlı olduğu için bunlar da beton olarak kullanılabilir.
- **Sınır:** Mut zorunluluğu her karta uygulanır (yukarıya bkz.).
- Betonu kırmanın yolu **Kral**'dır (bkz. 6.9).

### 6.5 Sıra dışı hamle — Blok (2)
**Felsefe:** Saldırıyı geri püskürtür ve **saldıranı** cezalandırır. Blok yapmak isteğe bağlıdır.

- **Ne zaman:** Oyuncuya zarar veren **her türlü** hamleye karşı, sırası olmasa bile:
  - Ceza yığınına kart gönderilmesi (orta yığından eşleştirme, seri, kendi ceza yığınını boşaltma, saldırı, "ekle")
  - Eksi elde, birinin senin ceza yığınından kart almaya kalkması
- **Kime döner:** Kartlar her zaman **hamleyi yapan oyuncuya** döner, kartların asıl sahibine değil.
  - Örnek: A, B'nin ceza yığınındaki kartları alıp C'ye gönderdi. C blok yaptı → kartlar **A'ya** gider (B'ye değil).
- **Eksi elde örnek:** A, senin ceza yığınından üç 5'i alıp kendi 5'iyle birlikte kendi ceza yığınına koydu. Sen 2 ile blok yaparsın → dört 5 **senin ceza yığınına** geri gelir, 2 altlarına girer.
- **Zincir blok:** Geri gelen kartlara karşı tekrar blok yapılabilir. Destede 4 tane 2 olduğu için en fazla 4 blok art arda gelebilir (A→B, B blok, A blok, B blok, A blok…).
- **2'nin yeri:** Blok için atılan 2, gönderilen kartların **altına** konur; kartlar 2'lerle birlikte hareket eder, en üstte asıl kartlar kalır.
  - **2 gruba yapışır (kesin, 2026-10-24; eski "yığının en altına" seçeneği kalktı):** 2, geri dönen grubun en alttaki kartına yapışık sayılır. Grup sonradan yakalanıp gönderilirse (kendi yığınını boşaltma, al ve ilerlet, eksi elde alma) 2 de onunla gider. Grubun üstü kapansa (beton) da yapışık kalır; sadece üstteki kartlar alınırsa 2 yerinde kalır. Zincir blokta 2'lerin hepsi yapışık. Ortada yakalanmış ya da normal gelmiş 2 yapışmaz. **Yapıldı** (motor `Durum.yapisik`, `cezadanYakala`; 3 test; tarayıcıda denendi). Dene: **"2 yapışma dene"** (5'imi kendi yığınıma bırak → B bloklar, üç 5 2 ile döner → öbür 5'imi bırak → dört 5 ve 2 B'ye gider, 7 bende kalır). **Görünüşü yapıldı (2026-10-24, telefonda seçim bekliyor):** yapışık kart (2 ya da Papaz) grubun altında kalsa da yığından taşar; gerçek kart çizilir, grup giderken taştığı yerden uçar. Görünüş → **Yapışık kart**: **Varsayılan** (ilk seçenek, kullanıcı isteği: eskisi gibi ayrı görünüş yok) / **Taşan köşe** (Claude önerisi; yukarı-sola taşar, köşedeki sayı görünür) / Çapraz (yamuk, sol üstten taşar; "yan yatık" tahta dar diye bu şekilde) / İşaret (kart görünmez, yığının sol üstünde zincir rozeti, birden çoksa sayı). Kod: `CezaYigini` (`yapisik` prop), `stil.css` `yapisik-*`. Yığına bakışta ayrı gösterim yok. Kral (Papaz) eklenince dörtlü/yapışma ilişkisi konuşulacak (kullanıcı: Kral kilitli dörtlüyü bozuyor).
- **Bloklanamayanlar:** 8 (takas), Kız (çekme), Papaz (Kral).

#### 6.5.1 Blok penceresi (karar: 2026-10-20)
- **Sorun:** Hedef sıradaki oyuncu değilse (serbest el, "al ve ilerlet"), A kartları C'ye gönderdiğinde sıra B'ye geçer ama C'nin blok hakkı vardır. B hemen oynarsa C'nin fırsatı kaçar.
- **Çözüm:** Ceza yığınına zarar veren her gönderimden sonra kısa bir **blok penceresi** açılır (başlangıç: **3 saniye**, kahve testinde ayarlanacak). Bu sürede sadece hedef oyuncu hareket edebilir; diğerleri "C düşünüyor…" yazısı ve süre çubuğu görür.
- Hedef sıradaki oyuncu olsa bile pencere açılır (her durumda aynı kural).
- Pencere, hedefin 2'si olsun olmasın **her zaman** açılır; böylece kimin elinde 2 olduğu belli olmaz. Hedef "Kabul"e basarsa erken kapanır, süre bitince otomatik kabul. **Hedef pencerede kart atarsa bu kabul sayılır** ve hamlesi hemen yapılır; ama kabulden sonra sıra (6.6) ondaysa — değilse kart avucuna döner (karar 2026-10-21).
- Pencere kapanınca sıra normal akışla devam eder (6.6).
- **Ek süre butonu:** Düşünmek isteyen pencereyi uzatabilir; kullanım sınırı olur (örn. elde 1–2 kez). Elinde 2 olmasa da blöf için basılabilir (şimdilik kabul; daha iyi bir mekanik bulunursa değişir).
- **Kalkan butonu:** Avucunda 2 varsa avucunun sağında bir **kalkan ikonu** durur. Saldırı geldiğinde kalkan **yanıp söner**; tek dokunuşla blok yapılır, 2'yi avucun içinde arayıp sürüklemek gerekmez. Kalkanı sadece sahibi görür; avucunda 2 yoksa kalkan görünmez.
- **Kalkanı kurmak (otomatik blok):** Oyuncu kalkana saldırı gelmeden de basabilir (sırası olmasa da, örn. rakip düşünürken). Kurulu kalkan, bir saldırı geldiğinde 2'yi kendiliğinden oynar. Kullanmak zorunlu değil; kurmayan oyuncu saldırı gelince kalkana basarak elle bloklar.
  - Kurulu kalkan **oyuncunun bir sonraki hamlesine kadar** kurulu kalır; hamleyi yapınca kapanır. 2 kullanılınca da kapanır. **8 ile takas olunca** da kapanır (yeni avuçta 2 varsa tekrar kurulabilir).
  - Bloklanamayan hamlelerde (Kral, Kız, 8) devreye girmez, kurulu kalır. Bomba ve "ekle" bloklanabildiği için devreye girer.
  - Rakipler kalkanın kurulu olduğunu görmez. Otomatik blok hemen (0,3 sn) devreye girer. (Eski karar "rastgele anda" idi; blok zaten 2'yi açığa çıkardığı için gizlemenin değeri yok, oyunu yavaşlatıyordu — 2026-10-21.)
  - Zincir blokta: Rakip otomatik bloğa karşı blok koyarsa yeni bir pencere açılır; oyuncu o sırada kalkanı tekrar kurmuşsa yine otomatik bloklar, kurmamışsa elle karar verir.
  - Puan sınırı gibi ek ayar yok (oyunu karıştırmamak için).
- Kalkanın kurulma hareketi (örn. uzun basma) ekran tasarımında seçilecek. Bu, "yardım yok" kuralının (9.2) tek istisnasıdır: blok süreyle sınırlı bir tepki olduğu için uyarı dikkat ölçmez, sadece bloğun süre yüzünden kaçmasını önler. 2 kartının kendisi parlamaz.

### 6.6 Eşit olmayan avuçlar (otomatik pas)
Blok sıra dışı oynandığı, Kız ve 8 de avuçları değiştirdiği için avuçlar eşitsiz azalabilir. Sistem, kartların **sağa doğru sırayla** azalmasını korur:

- **Kural (kartlardan bağımsız):** Her hamleden sonra sistem avuçlara bakar:
  1. Avucunda **en çok kart** olan oyuncu oynar.
  2. Eşitlikte, **turu başlatan oyuncudan** itibaren sağa doğru **ilk sıradaki** oynar.
  - Hangi kart sebep olursa olsun (blok, Kız, 8, ileride başka kartlar) aynı kural çalışır; özel istisna yok. Arada kalanlar otomatik pas geçmiş olur.
  - Normal akış: 4-4-4 → A; 3-4-4 → B; 3-3-4 → C; 3-3-3 → A…
  - Örnek: A=4, B=4, C=1 (A başlattı). A, B, A, B, A, B oynar → herkes 1; sonra A, B, C.
- **El başlangıcı:** Her yeni elde başlayan oyuncu sağa doğru bir kayar (1. el A, 2. el B, 3. el C…).
- **Tur başlangıcı:** Bir eldeki bütün turlar **elin başlatanından** başlar (3 kişide 4 tur, hepsi aynı kişiden).
- **Zincir örneği:** A başlattı. A Kız atıp B'den çeker (A=4,B=3,C=4) → eşitlikte A oynar; 8 atıp C ile takas (A=4,B=3,C=3) → A oynar; Kız atıp C'den çeker (A=4,C=2) → A oynar; Kız atıp B'den çeker (A=4,B=2,C=2) → A oynar; 8 atıp B ile takas (A=2,B=3,C=2) → B oynar (B=2) → 2-2-2, A'dan devam. Avucu en kalabalık kaldığı sürece güç kartlarıyla art arda oynamak kurala uygundur.
- Örnek (blok): A turu başlattı ve oynadı; sonra C bir bloğu sıra dışı kullandı. Avuçlar: A=3, B=4, C=2.
  - B (4, en çok) oynar → 3-3-2
  - Eşitlik A ve B'de; başlatana en yakın A oynar → 2-3-2
  - B oynar → 2-2-2; sıra A'dan normal devam eder (C bir kez pas geçmiş oldu).
- Örnek (Kız): A turu başlattı, herkeste 4 kart. A, Kız'ı orta yığına atar (A=3) ve B'nin avucundan bir kart çeker → A=4, B=3, C=4.
  - En çok kart 4: A ve C. Eşitlikte turu başlatana en yakın olan A → **A tekrar oynar** → A=3
  - B (3) pas geçer, C (4) oynar → herkes 3, sıra A'dan normal devam eder.
- Herkesin avucu bitince tur biter.

### 6.7 Tur ve el döngüsü (3 oyuncu örneği)
| Tur | Dağıtılan | Toplam kullanılan |
|---|---|---|
| 1 | 4 Mut kartı (üst ortaya) + 3×4 avuç | 16 |
| 2 | 3×4 avuç | 28 |
| 3 | 3×4 avuç | 40 |
| 4 | 3×4 avuç | 52 → **el biter** |

- Mut kartları **sadece ilk turda** açılır; masanın üst ortasında, orta yığından ayrı durur.
- Tur bitince ceza yığınları ve orta yığında kalan kartlar **olduğu gibi kalır**, yeni avuçlar dağıtılır.
- El bitince **puanlar yazılır**, kartlar toplanır ve yeni el baştan başlar.
- **Eksi elde:** Yakalanan bütün kartlar otomatik olarak yakalayanın ceza yığınına gelir; başkalarının ceza yığınından da (**herkesten**, karar 2026-10-21) eşleştirerek çekilebilir. "Kendi ceza yığınını boşalt" ve başkasına "ekle" eksi elde yoktur; yerine **kendi yığınına ekle** vardır (zorunlu değil). Ayrıntı Bölüm 0.

### 6.8 Bomba eli (Mut kartlarında 10 varsa)
1. **Bombanın kurulması:** Mut kartlarındaki 10 ile avucundaki 10 eşleştirilir ve sıradakine (serbest elde: istediğine) gönderilir. (Dört 10 da Mut'ta çıkarsa bomba kurulamaz, el normal oynanır.)
   - **Seri (karar 2026-10-21):** 10 orta yığında bir seriyi tamamlıyorsa oyuncu seçer: seriyi alır ya da 10'u bombaya (kurulumda Mut 10'una) verir. Bomba yığınının üstündeki sayı **o ana kadar çıkan 10'ları** gösterir (seride kullanılanlar dahil).
2. **Bomba yığını:** Bu 10'lar, alıcının ceza yığınına değil, **yanına ayrı** konur. Bomba o oyuncudadır (ekranda yanıp söner).
   - Bomba yığınının üstüne **başka kart atılamaz** (örn. 5 eşleştirmesi yapılamaz).
3. **Bombayı devretmek:** Bombası olan oyuncunun avucuna 10 gelirse, bombayı alıp **kendi 10'unu da ekleyerek** sıradakine (serbest elde: istediğine) gönderir. Bomba büyür: 2 → 3 → 4 on.
   - Destede 4 tane 10 var: 4. 10 da eklendiğinde bomba son sahibinde kalır ve el sonunda onda patlar.
   - Bombayı devreden oyuncu rahatlar; masadaki 10 sayısından bombanın ona dönme ihtimali hesaplanabilir (blok hariç).
   - Mut kartlarındaki 10 ile eşleştirme zorunlu olduğundan bomba her bomba elinde mutlaka kurulur.
   - **Bomba kurulduktan sonra başka oyuncuların 10'u:** Oynanan her 10 **bombaya eklenir** (zorunlu; seri hariç, yukarıya bkz.); bomba sahibinde kalır, sadece büyür, blok penceresi açılmaz. Böylece kaç 10 kaldığı herkes tarafından görülür. Bomba sahibi 10 oynarsa ekleyip devreder.
4. **Blok:** Bomba gönderilen oyuncu 2 ile blok yapabilir; 2'ler bomba kartlarının altına girer, bomba gönderene döner.
5. **Patlama (el sonu):** Bomba kimdeyse, **orta yığındaki tüm kartlar**, **Mut kartlarında kalanlar** (karar 2026-10-21) ve **bomba yığınındaki kartlar** (10'lar ve 2'ler) onun ceza yığınına eklenir.
6. **Ekran:** Bomba elinde **orta yığının puanı** da gösterilir (normalde sadece ceza yığınlarının puanı görünür).
7. **Bombayı kartlarla göndermek (2026-10-31 karar):** Bomba sahibi kendi yığınını boşaltırsa, başkasına eklerse, alıp ilerletirse, **ortadan ya da Mut'tan yakalayıp birine yollarsa** bomba da kartlarla gider; blokta kartlarla geri döner. **Papaz'la:** ilk yollamayla gider, sonraki güçler bombasız. Başkasının yaptığı al-ilerlet bombayı taşımaz. (Eski açık sorular aşağıda, kayıt için.) Bomba sahibi kendi ceza yığınını boşaltırsa (örn. yığında 5, avuçta 5 → sıradakine) bomba da kartlarla birlikte gider. Açık sorular (Claude önerisi parantezde):
   1. Ortadan yakalayıp yollamada ya da başkasına "Ekle"de de gider mi? (Hayır, sadece kendi yığınından kart gidince.)
   2. Başkası bomba sahibinin yığınından "Al ve ilerlet" ile alırsa bomba da gider mi? (Kullanıcı karar verecek; bomba sahibi seçmeden geçmiş olur.)
   3. Blokta bomba da gönderene döner mi? (Evet, şimdiki bomba bloğu gibi.)
   4. Serbest elde bomba kartların gittiği kişiye gider (sorun yok).
   5. Eksi elde başkası bomba sahibinin yığınından kendine alırsa bomba geçer mi? (2. soruyla aynı cevap.)
   **Kararlar (2026-10-24):** Bomba **sadece** sahibi kendi ceza yığınını boşaltınca gider; ortadan yakalayıp yollamada ve başkasına "Ekle"de gitmez. Boşaltınca **her zaman** gider (oyuncu seçmez). **Ek karar (2026-10-28, yapıldı):** sahibi başkasına "Ekle"de ya da "Al ve ilerlet"te de bomba kartlarla gider (ortadan / Mut'tan yakalamada gitmez). Başkası bomba sahibinin yığınından "Al ve ilerlet" ile alırsa **bomba gitmez**, sahibinde kalır (soru 2/5; eksi elde de aynı). Blokta bomba kartlarla birlikte gönderene döner (zincir blokta da kartlarla gider-gelir). Boşaltmada zaten sadece üstteki eşleşen kartlar gider; bomba her boşaltmada gider. **Yapıldı (2026-10-24, motor + 2 test + tarayıcıda denendi; kullanıcı testi bekliyor):** `Durum.blok.bombaIle`; bot kendiliğinden boşaltmayı seviyor (bomba cezası zaten hesabında). Dene: **"Bomba boşaltma dene"** (bomba bende, 5'imi kendi yığınıma bırak → B'ye gider, B 2 ile bloklar, bana döner; bende de 2 var).
   Yapılacaklar (karar gelince): motor, akıllı bot (bombadan kurtulmak için boşaltmayı sevsin), bombanın kartlarla uçması, "Bomba boşaltma dene" eli.

### 6.9 Kral eli (Mut kartlarında Papaz varsa)
- Normalde sadece yığınların **en üstündeki** kartlar hedeflenir. Kral elinde, avucunda Papaz olan oyuncu bir yığının **içinden** kart seçebilir.
- **Hangi yığınlar:** Tüm yığınlar — herkesin ceza yığını ve orta yığın.
- **Ne seçilir:** **Aynı sayılı** kartlar ya da **sıralı** kartlar (seri). Tüm yığını almak yok.
- Seçilen kartlar alınır, **Papaz altlarına** konur (2'deki gibi) ve sıradakine (serbest elde: istediğine) gönderilir.
- **Kral bloklanamaz.**
- **Mut kartlarındaki Papaz:** Avucundaki Papaz ile Mut kartlarındaki Papaz'ı alırsın; böylece **iki Papaz gücün** olur ve ikisini **aynı hamlede, art arda** kullanırsın: önce birinci Papaz ile bir grup kart seçip gönderirsin, hemen ardından ikinci Papaz ile bir grup daha. Sonra sıra geçer.
- Örnek: Ceza yığınının en altında dört 3 (120 puan) var, üstleri kapatılmış (beton, bkz. 6.4). Avucuna Papaz gelince dört 3'ü alttan çekip gönderirsin.
- **Dijital karşılığı:** Yığına dokununca kartlar yelpaze gibi açılır, oyuncu almak istediği kartları seçer.

#### 6.9.1 Kral kararları (konuşma 2026-10-24, sürüyor)
- Mut'ta Papaz yoksa avuçtaki Papaz sadece puanlı kart.
- Papaz'ı bir yığına (orta ya da herhangi bir ceza yığını) bırakınca o yığın **ortadaki pencerede** açılır (Görünüş ayarından bağımsız). Seçmeden kapatırsan Papaz avucuna döner, hamle sayılmaz.
- Seçilen: yan yana duran aynı sayılı kartların **tamamı** (tek kart da olur, örn. ortadaki tek Vale) ya da seri. Dokununca grup havalanır, başka karta dokununca seçim değişir; **"Gönder" düğmesiyle** onay.
- Kilitli dörtlü Kral'la alınabilir; grubun altındaki yapışık 2 de gelir. Papaz aldığı grubun altına girer ve 2 gibi **yapışır**.
- **Hedef serbest (serbest el olsun olmasın):** kartlar istenen oyuncunun ceza yığınına gider, **kendi yığınına olmaz**. Eksi elde kendine (öneri kabul).
- Güç isteğe bağlı; Mut Papaz'ı masadayken avuçtaki Papaz ortaya boşa atılamaz (Mut zorunluluğu).
- Bomba yığınından alınmaz; Kral'la alınan 10'lar normal hedefe; bomba sahibi kendi yığınından Kral'la gönderirse bomba da gider. Art arda ikinci güç zorunlu değil, aynı yığından da seçilebilir. Seçim herkesin ekranında görünür (2. aşama).
- Seri en az 3 kart (şimdiki kuralla aynı). Kartlar alındığı oyuncuya geri gönderilebilir (gömülü kartları üste çıkarmak için). Mut Papaz'ı güç kullanmadan da alınabilir: Papaz'lar normal Mut eşleştirmesi gibi seçilen oyuncuya gider.
- **Birden çok Papaz:** Avuçtan her hamlede **tek kart** (kural aynı). Avuçtaki Papaz Mut'taki **bütün** Papaz'ları alır, hepsinin gücü o hamlede art arda kullanılır (Mut'ta 3 + avuç 1 = 4 güç). Avuçtaki ikinci Papaz sonraki sırada ayrı hamle (sıra 6.6).
- Yapışık 2 tek başına seçilemez; 2'ye dokununca grubun tamamı gelir. Her güçte bir Papaz gönderilen grubun altına girip yapışır.
- Serideki karta dokununca serinin tamamı gelir (tek kartı ayırmanın avantajı yok). Kart hem seride hem aynı sayı grubundaysa ilk dokunuş çok kartlı grup, tekrar dokunuş diğeri. Kullanılmayan güçlerin Papaz'ları seçilen oyuncuya ("Bitir").
- **Yapıldı (2026-10-24; 102 test + 200 rastgele oyun simülasyonu + tarayıcıda denendi; kullanıcı testinden geçti):**
  - Motor: `kralEli`, `Durum.kral = { oyuncu, papazlar }`, hamleler `kral` (yigin verilirse ilk güç aynı hamlede), `kralAl`, `kralBitir`; `kralGruplari`. Güç sürerken sıra oyuncuda; bitince 6.6. Kral elinde Papaz'ın `mutEslestir`'i yok, yerine `kral`.
  - Bot: Kral hamlesinin değerini güçleri en iyi adımlarla bitirerek ölçer; Papaz'ı ancak kartlar kazandırıyorsa gruba harcar, yoksa Bitir. En uzun bot hamlesi ~50 ms.
  - Ekran: Papaz'ı bir yığına bırak → ortada **seçim penceresi** (Papaz kalkık bekler; Vazgeç = hamle yok; ortada "Ortaya at" da var). Gruba dokun → havalanır (sarı çerçeve) → **"→ Bot B" / "→ Bot C"** düğmeleri (eksi elde "Al"). Papaz'ı Mut Papaz'ına bırakmak gücü pencere açmadan başlatır. Kalan güçler Mut kutusunun sağında **Kral alanında** bekler; avucun üstünde "Kral · N güç · bir yığına dokun" + **Bitir**. Sol üstte "Kral" etiketi.
  - Dene: **"Kral dene"** (B'de 9 altında kilitli dört 3, C'de 4-5-6 + 10, ortada Vale) ve **"Bot Kral dene"** (C benim yığınımdaki gömülü dört 3'ü çeker).
  - Kahve testine kalan: hedef düğmeleri yerine isim etiketine dokunmak / sürüklemek (kullanıcı isterse), 2. aşamada herkes seçimi canlı görür.

#### 6.9.1 Kilitli dörtlü
- Bir ceza yığınının üstünde aynı sayıdan **dört kart** birleşirse (örn. dört Vale) artık eşleştirilemez; dörtlü **kilitlenir**. Sadece Kral ile alınabilir.
- **Görünüm:** En üstteki kart ters çevrilir, alttaki kartın köşesi görünür (dörtlünün ne olduğu belli olur). Ek "×4" işareti yok.

### 6.10 Tavşan deliği (7) — taslak ❓
- Daimi savunma kartı; Mut kartlarında açılmasına gerek yok.
- Biri sana kart gönderdiğinde (örn. üç 3), 7 oynayıp bu kartları **saldıranın ceza yığınının yanına**, ayrı bir yığın olarak koyarsın. 7 kartların altına (ya da işaret olarak hafif üstüne) konur. Bu yığına **tavşan deliği** denir.
- Delik açık kaldıkça kartlar orada durur. **Herkes** deliğe kart ekleyebilir: aynı sayı (bir 3 daha) ya da serinin devamı (5…10 serisine Vale, Kız, Papaz).
- **Deliği kapatmak:** **Herkes** (saldıran dahil) bir **7** oynayarak deliği kapatabilir. Kapatan 7 de kartların altına girer; delikteki tüm kartlar **deliği açan oyuncuya** döner ve onun ceza yığınının **en üstüne** eklenir.
- **Kapanmazsa:** El sonunda deliğin yanında durduğu oyuncunun puanına sayılır. Bu yüzden o oyuncu deliği kapatmaya çalışır.
- **Ortak mekanik:** Özel güçle oynanan kart (2, 7, Papaz) her zaman taşıdığı kartların **altına** konur.
- Açık sorular: Bölüm 11'e bkz.

## 7. Kartların Özellikleri ve Puanları

| Kart | Puan | Tür | Ad | Etki |
|---|---|---|---|---|
| **2** | 2 | Daimi | Blok | Ceza yığınına kart gönderilen oyuncu 2 atarak kartları **gönderene geri yollar** (isteğe bağlı). Detay: 6.5 |
| **3** | **30** | Açılış | Serbest el | Mut kartlarındaysa: yakalanan kartlar **istenen oyuncuya** (kendisi hariç) gönderilebilir. |
| **4** | 4 | Normal | — | — |
| **5** | 5 | Normal | — | — |
| **6** | 6 | Normal | — | — |
| **7** | 7 | Daimi | Tavşan deliği | Savunma kartı. Sana gönderilen kartları saldıranın ceza yığınının **yanına** ayrı bir yığın olarak koyarsın. Detay: 6.10 (taslak ❓) |
| **8** | 8 | Daimi | Takas | Her zaman orta yığına atılır. Oyuncu **isterse** kendi avucunu **herhangi bir** oyuncunun avucuyla değiştirir (serbest el gerekmez, kart sayıları farklı olabilir). Avucu boş olanla da takas yapılır; son kartı 8 olan da takas yapabilir. Takasta eşleşme/seri olmaz. Mut'ta 8 olsa da takas serbest. **Bloklanamaz.** Ekranda: 8'i bir avucun üstüne bırakmak takas, ortaya bırakmak normal oyun; takas olursa iki avuç animasyonla yer değiştirir. |
| **9** | 9 | Normal | — | — |
| **10** | 10 | Açılış | Bomba | Mut kartlarındaysa: Mut 10 ile eşleştiren bombayı kurar, bomba alıcının ceza yığınının yanında ayrı durur. Sonraki her 10 bombaya eklenir; sahibi eklerse devreder. El sonunda bomba kimdeyse orta yığın onun ceza yığınına girer. Detay: 6.8 |
| **Vale (Jilet)** | **25** | Açılış | Çarpan | Mut kartlarındaysa: **puanlar ×2** sayılır (her ek Vale +2: ×4, ×6, ×8). |
| **Kız** | 10 | Daimi | Çekme | Her zaman orta yığına atılır. Oyuncu **isterse** herhangi bir oyuncunun **avucundan bakmadan rastgele bir kart** çeker; kart avucuna geçer. **Bloklanamaz.** |
| **Papaz (Kral)** | 10 | Açılış | Kral | Mut kartlarındaysa: avucundaki Papaz ile bir yığının **içinden** (en üstte olmasa da) aynı sayılı ya da sıralı kartları seçip alırsın. Bloklanamaz. Detay: 6.9 |
| **As** | 10 | Açılış | Eksi el | Mut kartlarındaysa: el **eksiye döner**. |

### 7.1 Daimi kartların gücü isteğe bağlıdır
- **2, 8 ve Kız** normal kart gibi de oynanabilir; güçlerini kullanmak zorunlu değildir.
  - 2: blok yapmadan sıranda orta yığına atılabilir.
  - 8 ve Kız: her durumda orta yığına gider; takas/çekme yapıp yapmamak oyuncuya kalmış.
- 8 ve Kız'ın gücü için serbest el gerekmez; hedef herkes olabilir.
- Orta yığının üstünde aynı kart varken (8 üstüne 8, Kız üstüne Kız) ya da kart ortada seri yapacakken oyuncu **birini seçer**: ya eşleştirip/seriyi alıp gönderir, ya da kart orta yığında kalır ve gücünü kullanır. Seçim kartın bırakıldığı yerle yapılır: orta yığın = normal oyun, bir oyuncunun avucu = güç.

## 8. Puanlama
- **El sonunda** ceza yığınlarındaki kartların puanları toplanır ve puan kağıdına yazılır.
- **Artı el:** Puan artı yazılır.
- **Eksi el:** Puan **eksi** yazılır (ceza yığınında 200 puan varsa puan kağıdına −200).
- **Vale Mut kartlarındaysa:** Puanlar ×2. Birden fazla Vale açılırsa çarpanlar **toplanır**: 1 Vale ×2, 2 Vale ×4, 3 Vale ×6, 4 Vale ×8. (Temiz ön ödülü / boş ön cezası da aynı çarpanla.)
- **Temiz ön ödülü (artı el, el sonunda):** Ceza yığınında hiç kart yoksa **−100** (Vale varsa **−200**).
- **Boş ön cezası (eksi el, el sonunda):** Ceza yığınında hiç kart yoksa **+100** (Vale varsa **+200**).
- **Kazanan:** Oyun sonunda (örn. 10 el) **toplam puanı en az** olan. Eşit puanda oyun **berabere** biter.
- **Puan kağıdı:** Kahvedeki kağıt gibi: üstte oyuncu isimleri sütun başlığı, her satır bir el, en altta toplam. Görünümü temaya bağlı (tema değişince kağıt görünümü de değişebilir).
- **Puan kağıdı indirme (hatıra):** Kahvede puan kağıdının fotoğrafı çekilip hatıra olarak saklanıyor. Oyun bitince **herkes** puan kağıdını kendi telefonuna **resim olarak** indirebilir.
  - Öneri: Kağıt görünümlü bir PNG; tarih, oyuncu isimleri, el el puanlar, toplam ve kazanan (berabere ise o) yazılı. Telefonda "paylaş" ile doğrudan WhatsApp vb.'ye de gönderilebilir.

## 9. Dijital Versiyon (Telefon)
**Hedef:** Sunucu kiralamadan, basit şekilde telefonda oynanabilmesi.

**Teknoloji:** PWA — telefon tarayıcısında açılan, ana ekrana uygulama gibi eklenebilen web uygulaması. Oyun motoru gerekmez (HTML/CSS/JS); ileride gerekirse Phaser/PixiJS eklenebilir.

**Yayınlama:** GitHub Pages (ücretsiz, HTTPS).

**Aşamalar:**
- **Aşama 0 — Botlu test sürümü:** Tek ekranda, botlarla. Detay: 9.1.
- **Aşama 1 — Tek telefon (sıra ile):** Herkes aynı telefondan oynar; sıra değişirken "Telefonu X'e ver" ekranı çıkar, avuçlar gizlenir.
- **Aşama 2 — Herkes kendi telefonundan:** Bir telefon oyunu kurar, kod/QR gösterir; diğerleri bağlanır. Telefonlar birbirine doğrudan bağlanır (WebRTC) — kiralık sunucu yok.
  - Not: Telefonların ilk bağlantıda birbirini bulması için küçük bir aracı gerekir. Ücretsiz hazır bir servis (örn. PeerJS) ya da QR ile eşleştirme kullanılabilir. Seçim kod aşamasında yapılacak ❓.

**Test planı:** İlk gerçek test kahvede arkadaşlarla, **herkes kendi telefonundan** oynayarak yapılacak; geri bildirimler buradan toplanacak. Bu yüzden Aşama 2 (herkes kendi telefonu) test için öncelikli.

**Gelecek planı — özel tasarım:** Kurallar görselden ayrı tutulacak; kart görünümü ve masa/board değiştirilebilir bir "tema" olacak.

**Görsel efektler (VFX):** Blender'da hazırlanan efektler oyuna eklenebilir — animasyon PNG dizisi / sprite sheet ya da şeffaf video olarak dışa aktarılır, oyunda ilgili anda (blok, bomba, seri vb.) oynatılır. 3D model gerekirse glTF formatında eklenebilir.

### 9.1 Test modu ve botlar (karar: 2026-10-20)
- Geliştirme sırasında oyun tek ekranda oynanır: kullanıcı bir oyuncudur, diğer koltuklarda **bot** (bilgisayar oyuncusu) oturur.
- **Herkesin avucu açık görünür** (test için).
- **"Test" menüsü (sağ alt, deste yanında; oyun bitince kalkacak):** Anahtarlı seçenekler: "Botlar kendi oynasın", "Bot kartlarını kapat" (ters çevirir), "Bot kartları yelpaze", "Bot kartları kenardan taşsın". Son ikisi görünüm karşılaştırması için; kullanıcı karar verince kalıcı yapılıp kaldırılacak. Şimdilik sadece görünüm değiştiriyorlar, oyun yok.
- **"Botlar kendi oynasın" anahtarı:**
  - **Açık:** Botlar kendi hamlelerini kendileri yapar.
  - **Kapalı:** Botların hamlelerini de kullanıcı yapar; sırası gelen avuç kullanıcı tarafından oynanır. Sıra dışı kararlar (blok vb.) da kullanıcıya bırakılır.
- **Bot zekâsı:** İlk sürümde basit — kurallara uygun hamlelerden birini rastgele seçer. Sonra akıllandırılabilir (en az puanlıyı hedef alma, 2 ile blok yapma vb.).
- **Otomatik test:** Botlar ekransız olarak birbirine karşı çok sayıda el oynatılır; kart kaybolması, yanlış puan, takılan sıra gibi kural hataları böyle yakalanır.

### 9.2 Ekran ve kontrol
**Ekran ihtiyaçları:**
- Elin aktif kuralları (Serbest el, Eksi el, ×2, Bomba) sürekli görünür.
- Her ceza yığınının **anlık puanı** görünür; ×2 gibi kurallar gösterilen puana **otomatik yansır** (Vale açıkken 4-5-6 → 30 görünür).
- Oyun başında **el sayısı** seçilir; oyun sırasında **"Oyunu bitir"** seçeneği.

**Yığınlara bakmak:** Herkes orta yığının ve tüm ceza yığınlarının içine bakabilir. Yığına dokununca kartlar yelpaze gibi açılır. Yelpaze **sadece bakan kişinin ekranında** açılır; diğer oyuncular bunu görmez (dikkat dağıtmasın).
- Orta yığında her zaman en üstteki 3 kart kaydırılmış görünür (seri takibi için), altında kalınlık ve kart sayısı rozeti.

**Deste penceresi (sağ alt):** Kalan deste sağ altta durur. Dokununca 52 kartın hepsi bir tabloda görünür: masada açıkta olan (oynanmış) kartlar soluk, henüz görülmeyenler (destede ya da başkalarının avucunda) parlak. Böylece hangi kartların hâlâ oyunda olduğu takip edilir. Oyun başında açılıp kapatılabilen bir ayardır; **varsayılan: açık**.

**Yardım yok, geri alma yok:** Oyun eşleşebilecek yerleri parlatmaz; dikkat oyuncunun işidir. (Tek istisna: blok penceresindeki kalkan uyarısı, bkz. 6.5.1.) Bırakılan kart geri alınamaz (örn. ceza yığınlarında kullanabileceğin 5'i yanlışlıkla orta yığına atarsan o hamle geçerlidir).

**Geçersiz hamle (karar 2026-10-21):** Kurala aykırı bırakılan kart sessizce avucuna döner, **yazı yok**.
- Tek uyarı: Mut kartlarıyla eşleşen kart ortaya bırakılırsa **eşleşen Mut kartı** hafifçe sallanır (yaklaşık 0,4 sn, "hayır" der gibi).
- Kartın kendisinin sallanması denendi, kullanıcı gereksiz buldu, kaldırıldı.
- Sallanma sadece kartı bırakanın ekranında olur; herkes kendi telefonundan oynarken diğerlerine gitmez (eldeki kart hakkında bilgi vermesin).

**Kart kaldırma (rakipler görür):** Oyuncu avucundaki bir karta dokununca kart hafif yukarı kalkar. Diğer oyuncular da o oyuncunun avucunda **aynı sıradaki kartın arkasının** kalktığını görür (Hearthstone'daki gibi); kartın yüzü görünmez.
- Amaç: masadaki gibi canlılık; kimin ne düşündüğü hissedilir, blöf yapılabilir (kartı kaldırıp vazgeçmek).
- Rakipler kalkan kartın avuçtaki **sırasını** görür (soldan kaçıncı).
- Kalkan butonu sadece sahibinin ekranında görünür; basınca 2 doğrudan oynanır, rakipler sadece blok olduğunu görür.

**Kız'da kart seçimi:** Kız bir oyuncunun üstüne bırakılınca o oyuncunun kalkmış kartı iner ve avucu herkesin gözü önünde **karılır** (kısa animasyon). Sonra Kız'ı oynayan, karılmış ve arkası dönük kartlardan birine dokunarak seçer. Böylece kart kaldırma ipucu işe yaramaz, masadaki "çekme" hissi kalır. Çekmeden sonra kartı çekilen oyuncunun avucu kendi ekranında **eski sırasına döner** (oyuncunun kendi düzeni bozulmaz).
- 8'de seçim yok (tüm avuç değişir), karma gerekmez; iki avuç yer değiştirme animasyonu yeterli.

**Kart oynama hareketi (öneri):** Kart sürüklenip bırakılır. Orta yığına bırakılırsa normal oynanır. 8 bir oyuncunun avucunun üstüne bırakılırsa onunla takas yapılır, Kız bırakılırsa ondan kart çekilir; kart yine otomatik olarak orta yığına gider. Aynı mantık saldırılar için de kullanılabilir (kartı rakibin ceza yığınına bırakmak).

### 9.3 Sosyal özellikler (kahve havası)
- **Konuşma butonu:** Dokununca küçük bir panel açılır: serbest yazı yazılabilir ya da hazır sözlerden biri tek dokunuşla gönderilir. Mesaj, gönderenin yanında balon olarak kısa süre görünür; herkes görür.
  - Mesajlar oyunun kendi telefonlar arası bağlantısından gider; ek sunucu gerekmez.
- **Hazır sözler:** Kahvede sürekli söylenen laflar butonlarla gönderilebilir (yazı ve/veya ses kaydı). Örn. "Beton dök!", "Kapat kapat!". Sol alttaki konuşma düğmesinde, 2. aşamada (tek telefonda botlara karşı okuyan yok).
  - **Kullanıcının listesi (2026-10-23, kahvenin kendi lafları, aynen kalsın):** "Çok saçma kendime sokamıyom!", "Tost oldu.", "Beton döktü.", "Şimdi ben kızı aldım {isim} soktum." (isim seçilir: Tahir'e / Uğur'a / Mert'e; basınca masadaki oyunculardan biri seçilir, ek doğru çekilir), "Üstüne kapatma göt!". Liste büyüyecek. **Kaba ilk sürüm yapıldı (2026-10-23, arkadaşlara göstermek için):** sol alttaki konuşma düğmesi söz panelini açar, Kız sözünde isim seçilir; söz 3 sn balon olarak görünür (ben: ceza yığınımın üstü, botlar: isim etiketinin yanı). **Botlar ve bota düşen oyuncu konuşmaz** (kullanıcı 2026-10-24; eskiden botlar arada kendiliğinden söz yolluyordu, kaldırıldı) (`Masa.tsx` HAZIR_SOZLER). Yazı kutusu ve herkese gitmesi yapıldı (2026-10-28); ses sonraya.
- **Hediyeler:** Okey'deki gibi küçük animasyonlu ikonlar, bir oyuncudan diğerine süzülerek gider: **çay**, **kazan** (kazan muhabbeti), vb.
- Basit tutulacak; oyunu yavaşlatmamalı.

## 10. Kural Özeti (hızlı bakış)
- **Mut kartlarında As** → eksi el (puan eksi yazılır)
- **Mut kartlarında 3** → serbest el
- **Mut kartlarında 10** → bomba
- **Mut kartlarında Vale** → puanlar ×2 (her ek Vale +2)
- **Mut kartlarında Papaz** → Kral: yığının içinden kart seçme
- **2** → blok (isteğe bağlı, sıra dışı da oynanır)
- **7** → tavşan deliği (savunma, taslak)
- **8** → isteğe bağlı avuç takası (bloklanamaz)
- **Kız** → isteğe bağlı, rakibin avucundan rastgele kart çekme (bloklanamaz)
- **Artı elde boş ceza yığını** → −100 (Vale varsa −200)
- **Eksi elde boş ceza yığını** → +100 (Vale varsa +200)

## 11. Açık Sorular ve Kararlar

### Açık sorular
5. **Mut kartı çakışmaları:** 3↔As ve 10↔As dışındaki çakışmalar konuşulacak (5.1).
6. **Tavşan deliği (6.10):** Kapatma ve ekleme sıra dışı da yapılabilir mi? Deliğe gönderim 2 ile bloklanabilir mi?
7. **Blok penceresi (6.5.1):** Pencere süresi (başlangıç 3 sn) ve ek süre butonunun sınırı kahve testinde ayarlanacak.
9. **İsimler:** "Avuç", "Daimi kart", "Açılış kartı" uygun mu?
10. **Hazır sözler listesi** (9.3).
11. **Aşama 2 bağlantı yöntemi:** PeerJS gibi ücretsiz servis mi, QR ile eşleştirme mi (Bölüm 9)?

### Verilen kararlar (özet)
- Puanlar el sonunda yazılır.
- Temiz ön ödülü / boş ön cezası belirlendi (Bölüm 8).
- Seri: en az 3, sadece artan; rakibin ceza yığınındaki seri de uzatılabilir.
- Açık kartların adı → **Mut kartları**. Köşede, orta yığından ayrı durur; eşleştirilerek alınır.
- Eksi elde blok, blok zinciri ve 2'nin puanı belirlendi (6.5).
- Bomba devri, bombanın her bomba elinde kurulması, patlamanın el sonunda olması (6.8).
- Kral: hangi yığınlar, ne seçilir; iki Papaz aynı hamlede art arda (6.9).
- 8 / Kız orta yığındaki aynı kartla: ya eşleştir ya güç kullan.
- **El sonunda masada kalanlar (kesin, 2026-10-21; kahvede de böyle):** Orta yığında ve Mut kartlarında kalan kartlar kimsenin puanına yazılmaz, atılır. Bomba elinde ise hepsi bombacının ceza yığınına gider (6.8). 8 ve Kız Mut zorunluluğunu aşabildiği için Mut'ta kart kalması daha sık olur; bu sorun değil.
- 8 takası (2026-10-21): avuca bırakınca takas, boş avuçla da serbest, Mut 8 takası engellemez (Kız'da da aynı). Ayrıntı Bölüm 0 "Sıradaki iş".
- Pas kuralı: en çok kartı olan oynar (6.6).
- Blok penceresi her gönderimde açılır; kalkan uyarısı "yardım yok" kuralının tek istisnası (6.5.1) — 2026-10-20.
- Geliştirme botlu, herkesin avucu açık, "Botlar otomatik" butonlu yapılacak (9.1) — 2026-10-20.


## Son durum panosundan taşınanlar (2026-11-04)
Pano yeni düzene geçti (sadece yarım işler); bu satırlar olduğu gibi buraya taşındı.
- 2026-10-24 · **Mut / ses**: Kullanıcı Unity Asset Store'da **Card Game Sounds** (Epic Sounds and FX, 204 MB) buldu; sonra: Unity (D:Unity2.3.19f1) → Package Manager → My Assets → Download (Import değil) → Claude `%APPDATA%UnityAsset Store-5.x` içinden .unitypackage açar, lisans notuna bakar, yayına gitmeyen dinleme sayfası yapar. Dikkat: açık GitHub deposuna ham ses koymak lisansa aykırı olabilir.
- 2026-10-24 · **Mut**: İkonlu kart tasarımı sonraya (kullanıcı: "ileride yaparız"; deneme sayfası `tasarim.html` duruyor: Sade/Klasik/Dar, 4 renk, güç ikonları; açık soru: avuçtaki 3/Vale/As'ta ikon olsun mu, Claude "sadece Mut'ta" önerdi).
- 2026-10-22 · **Mut**: Hatırlatılacaklar (bitirdikçe hatırlat): ses (Card Game Sounds, aşağıda), 10 px kararı, 2. aşama (herkes kendi telefonundan). Not: PROJE.md Bölüm 0 "Hatırlatılacaklar listesi".
