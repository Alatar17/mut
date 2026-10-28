# Mut — Proje Dokümanı

> Kart oyunu Mut'un kuralları ve telefon sürümünün planı.
> İşaretler: ❓ = henüz netleşmedi, 🔔 = sonra hatırlatılacak. Hepsi Bölüm 11'de toplu.

## 0. Proje Durumu
- **Aşama:** 4. adım (özel kartlar) bitti, **Papaz (Kral) da eklendi** (2026-10-24; 7 ilk sürümde yok); oyun akışı, yığına bakış, deste penceresi, görünüş seçenekleri yapıldı; 5. adım (telefon) 1. aşama sürüyor. Biten: altyapı (4a), seri, 2 / blok (+ yapışma), 8, Kız, Vale, As, 3, 10 / bomba (+ ceza yığınıyla gitme), Papaz / Kral.
- **Bağlantı denemesi SONUCU (2026-10-25):** kardeşin telefonuyla üç durumda da **bağlandı** (a ikisi Wi-Fi, b biri mobil veri, c ikisi mobil veri). PeerJS Türkiye'de açılıyor, aktarıcı (TURN) şimdilik gerekmiyor. Kahvede risk: kafe Wi-Fi'ı telefonlar arası bağlantıyı engelleyebilir (o zaman mobil veriye geç) ve farklı operatörler denenmedi; bağlanamazsa kayıttaki hataya bakıp ücretsiz aktarıcı eklenir. Kahve sürümü 1. parça bitti (aşağıda). **Sıradaki iş (devir 2026-10-28, yeni sohbet Opus):** **2c** (aşağıda 2a maddesindeki liste: kaldırılan kart rakipte, canlı Kız seçimi + bot Kız herkeste aynı anda, serbest elde inen kart herkeste görünsün ve hedef seçilirken herkes beklesin, hazır sözler herkese, blok penceresi her gönderimde / gecikmeye göre). Önce kullanıcıya planı anlat, onay al. Sonra kahve testi (cuma, 3 kişi, ~1 saat). Ayrıca bekleyen: **Bomba'da hatalar** (kullanıcı anlatacak, sor). 2b bitti, telefonda geçti (2026-10-28). Yayın: her kod parçasından sonra commit + push, GitHub Pages ~1-2 dk; yayındaki sürüm saatini kullanıcıya söyle (telefon açılışta kendiliğinden yeniler).
- **Sürüm yazısı (2026-10-28):** derlenme zamanı (Türkiye saati, `vite.config.ts` `__SURUM__`) giriş ekranının sağ altında ve ☰ menüsünün en altında. Her yayından sonra kullanıcıya yayındaki saati söyle. Not: sadece not dosyası gönderilse de site yeniden derlenir, saat değişir. **Yeni sürüm kontrolü (`main.tsx` `surumKontrol`):** GitHub Pages sayfayı 10 dk önbellekte tutuyordu (telefon yeni sürümü geç alıyordu); açılışta ve giriş ekranındayken öne gelince yayındaki `index-*.js` adına bakılır, farklıysa `?v=...` adresiyle yenilenir. Masadayken bakılmaz (kullanıcı onayı: sadece açılışta).
- **2b-2 yapıldı (2026-10-28, telefonda test edildi ✅: misafir ve kurucu arkaya atıp 15 sn sonra dönünce oyun devam etti).** Misafir kurucuyu kaybedince (kapanma ya da 8 sn ses yok) "Kurucu bekleniyor…", kart oynayamaz, süresi işlemez; 4 sn'de bir kendiliğinden yeniden katılır (aynı koltuk, şimdiki hal gelir). Kurucu, sunucuyla bağlantısı koptuysa masa kodunu kendiliğinden yeniden alır (`peer.reconnect` ya da aynı kodla yeni Peer; PC'de denenemedi, telefonda). Arka plandan dönen kurucu misafirlerin sessizliğini kendi uykusuna saymaz. Kopuk koltuklar kurucudan herkese gider (`kopuklar` mesajı), kopuk ismi soluk (`.rakip-ad.kopuk`). Bilinen eksik: kurucu ses veremezken yeniden katılan misafire giden "şimdiki hal" kaybolursa misafir bir sonraki hamleye kadar eski hali görür (gerçekte kurucu arka plandayken donuk olduğu için beklenmiyor). Not: Vite bazen hızlı art arda yazılan dosyayı eski haliyle sunuyor (dosyaya dokunmak düzeltir).
- **2b-1 yapıldı (2026-10-28, telefonda test edildi ✅).** **Bomba'da hatalar var (kullanıcı 2026-10-28, ileride konuşulacak; ayrıntıyı henüz söylemedi, sor).** Nabız (2 sn'de bir; 8 sn ses yoksa kopuk). Misafir oyun sürerken koparsa koltuğu durur, yerine kurucuda bot oynar (kurucuda balon "Koptu · bot oynuyor" / "Döndü"). Geri dönen: aynı sekme (sekmeye özel kimlik) ya da kopuk koltukta aynı isim → kendi koltuğu, eski bağlantı atılır, oyunun şimdiki hali gelir, dağıtım yapılmaz. Bekleme ekranında hayalet koltuk kalmıyor. Katılma uyarısı: kurucuda titreşim + yeni koltuk parlar. **Titreşim yeniden (kullanıcı 2026-10-28):** Hafif ×1 (varsayılan, eski Orta) / Orta ×2 / Güçlü ×3; kayıt adı `titresim2`. **Sırada 2b-2:** kurucu kopunca misafirlerde "Kurucu bekleniyor" + otomatik yeniden bağlanma (misafir arka plandan dönünce de kendiliğinden bağlansın; şimdi elle yeniden katılmalı). Risk: PeerJS aynı kodu bir süre "dolu" sayabilir.
- **Kahve testi hazırlığı (2026-10-27):** Ceza yığını aralığı sadece 10 / 12 px (8 kaldırıldı, varsayılan 10). Rakip kartları hep yelpaze (Görünüş'teki "Bot kartları yelpaze" satırı kaldırıldı). J/Q/K varsayılanı Sade (zaten öyleydi). Ses sonraya. **Titreşim** Görünüş'ten ☰ menüsüne taşındı (herkes kendi ayarlar): Kapalı / Hafif / Orta (varsayılan) / Güçlü; tarayıcı gücü ayarlatmadığı için süre ×0,5 / ×1 / ×2, seçince örnek titreşim; telefonda denenmedi.
- **2a telefonda ilk deneme (2026-10-27): geçti.** Kız'da karşı telefon, çeken kartını alana kadar bir şey görmüyor, sonra karma + hızlı seçim tekrar gibi oynuyor (2a'da beklenen; canlı Kız 2c'de: Kız düşünce karma hemen başlasın, kaldırılan kart canlı görünsün). Dene testi: Bot 8, Bot 3 (serbest hedef), Bot As (eksi el + blok) arkadaş telefonundan geçti; Bot Kız ikisinde görüldü ama sırayla (önce kurucu).
- **Kahve sürümü 2a yapıldı (2026-10-27, PC'de iki sekmeyle denendi):** Ortak oyun. Kurucu hakem: misafir hamlesini kurucuya yollar, kurucu uygular ve sonucu herkese yayar; botlar kurucuda oynar. Kararlar (kullanıcı onayı): **oyunun bütün durumu herkese gider, ekran başkalarının kartlarını kapalı çizer** (sadece kendi kartlarını yollamak sonraya; gerekirse); her telefonda masa **döndürülür** (herkes altta; `src\oyun\cevir.ts` + test, çevirmeyi sadece kurucu yapar). Misafirde: Yeni oyun / Sonraki el / Oyunu bitir / el sayısı / geliştirici seçenekleri yok (puan kağıdında "Kurucu başlatacak"). ☰ menüsünün tepesinde "Masa kodu". Hamle süresi biterse misafirin kendi telefonu bot hamlesi yollar. Kız karma animasyonu sayfa arka plandayken takılmasın diye süre sınırlı. **Kalan (2b):** kopma / yeniden bağlanma (şimdi misafir koparsa oyun onun sırasında durur), katılma uyarısı. **2c (ortak mekanizma: hamle bitmeden ara anları herkese göndermek):** kart kaldırma rakipte, canlı Kız seçimi (bot Kız'ı da: şimdi önce kurucu görüyor, sonra misafir), **serbest elde inen kart herkeste görünsün, hedef seçilirken herkes beklesin** (kullanıcı fikri 2026-10-27, gerilim), hazır sözler herkese, blok penceresi her gönderimde. Kurucu 2a'da Dene menüsüyle misafire özel kart elleri kurabilir.
- **Kahve sürümü planı (2026-10-27, kullanıcı onayı):** 1) Giriş ekranı + masa kurma, 2) oyunun ağ üzerinden oynanması (kurucu hakem, herkes sadece kendi kartını görür; en büyük parça), 3) kopunca bot, blok penceresi gecikmeye göre, ☰ Ayarlar ayrımı. iPhone'a kurulum ve oynama arkadaşta 2026-10-24'te denendi, sorunsuz.
  - **1. parça yapıldı (2026-10-27, PC'de iki sekmeyle denendi, telefonda test bekliyor):** Açılışta giriş ekranı: ad (hatırlanır), **Masa kur** (4 harfli kod, koltuklar, kurucuda Başla), **Katıl** (kod), **Botlarla oyna**. Masa 3 kişilik, boş koltuğa bot oturur. Başla'da herkes masaya geçer, isimler doğru yerde (ben altta, sıradaki sağda); **ama oyun henüz her telefonda ayrı** (2. parçada birleşecek). Oyun menüsünde "Giriş ekranı". Ekran kararmıyor (Wake Lock; telefonda denendi ✅). QR yok (kod 4 harf, gerekirse sonra). Kod: `src\ag.ts` (PeerJS, önek `mut-masa-`), `src\ekran\Giris.tsx`, `main.tsx` (Uygulama + useEkranAcik), `Masa` artık `isimler`/`cikis` alıyor.
- **Arka plan sorusu (2026-10-27, 2./3. parçada çözülecek):** Misafir Mut'u arkaya atarsa bağlantı kopar → yerine bot oynar, dönünce devralır. Kurucu arkaya atarsa (hakem o) oyun herkes için durur → diğerlerinde "kurucu bekleniyor", kurucu dönünce **otomatik** yeniden bağlanıp devam (kod uygulamada saklı, kimse kod yazmaz; kullanıcı: kod unutulabilir, dikkat); uzun sürerse oyun kaybolabilir (kurucu telefonu masada açık dursun).
- **Kod oyun içinde görünsün (2026-10-27, kullanıcı fikri, 2. parça):** ☰ menüsünün en üstünde "Masa kodu: XXXX" (öneri). Gerekçe: uygulaması tamamen kapanan misafir kodla yeniden katılır. Kurucunun uygulaması kapanırsa oyun kaybolur → oyunu telefona kaydetme 3. parçada konuşulacak.
- **İstek (2026-10-27):** Masaya biri katılınca kurucuya uyarı gelsin (şimdi sadece koltukta isim beliriyor, fark edilmiyor). Öneri: kısa ses/titreşim + isim. 2. ya da 3. parçada.
- **İlk telefon denemesi (2026-10-27): 1. parça telefonda geçti** (kullanıcı kurdu, arkadaş katıldı; adı boş bıraktığı için "Oyuncu"; Başla'da masaya geçtiler, isim sağda doğru). Kurucu telefon + PC'den katılma da çalıştı. "Masa yok" hataları eski `baglanti.html` sayfasından (farklı önek); arkadaşlar adres geçmişinden oraya gidiyor → yönlendirme **gerek yok** (kullanıcı yeni adresi attı; bir daha önerme).
- **Yapıldı (2026-10-28, tarayıcıda denendi, telefonda test bekliyor):** 1) **Bomba Ekle / İlerlet'te de gider** (kullanıcı kararı; 6.8 madde 7): bomba sahibi başkasının yığınına eklerse ya da alıp ilerletirse bomba kartlarla gider, blokta geri döner; ortadan / Mut'tan yakalamada sahibinde kalır; başkası sahibin yığınından alırsa bomba kalır. Dene: **"Bomba ekle dene"**. 2) **Başlayan işareti (telefonda geçti):** elin başlayanı (ilk elde rastgele, her elde sağdakine geçer; 6.6 eşitliği de ondan sayılır) rakipte isim etiketinin yanında küçük beyaz **nokta** (kullanıcı seçti; Harf/Deste ve menü satırı kaldırıldı). Başlayan bensem kimsede nokta yok (kullanıcı: rakiplerde yoksa bendedir). Rakipte bomba 8 px aşağı alındı (ceza yığınının çizgisine değiyordu). Görünüş ayarları telefona kayıtlı, misafir değiştiremez (Kart boyutunu ☰'ye taşımak önerildi, karar bekliyor). **Sırada:** hazır sözler herkese (kullanıcının geliştirme fikri var, sor); 2c'nin geri kalanı kahve testinden sonra.
- **Bomba "Al ve ilerlet"te (2026-10-28, not; tekrar görülürse bakılacak):** Kullanıcı B'nin C'nin yığınından alıp kendisine ilerlettiği bir an sordu. Kural: bomba C'de kalır (6.8 madde 7), kod da öyle (`motor.ts` `bombaIle`). Bomba kullanıcıya geçerse hata.
- **Hayalet kart (2026-10-27, not; sık tekrar ederse bakılacak):** Bomba + Kral elinde Bot C ortaya 3♥ attı, ortada aynı 3♥ iki kez çizili kaldı (rozet 1, puan 30) ve üstünde sarı numaralı rozet vardı; sonraki hamlede kopya kayboldu, sarı rozet ("2") kaldı. Kural doğru, sadece görüntü (uçan kart yerine inip silinmemiş olabilir).
- **Eski sıradaki iş (devir 2026-10-24, dördüncü):** Bağlantı denemesi (bitti, yukarıda). Bağlantıdan bağımsız, önerilen küçük iş: **ekran kararmasın** (Wake Lock; kullanıcı henüz "yap" demedi). ☰ Ayarlar ayrımı, rakip görünüşü, giriş ekranı kahve sürümüyle. **Ses:** kullanıcı Unity Asset Store'da "Card Game Sounds" buldu, sonra indirecek (son-durum.md'de adımlar; açık depoya ham ses lisans sorunu).
  - **2026-10-24 dördüncü oturum yapılanlar (hepsi GitHub'da, yayın doğrulandı):** dağıtım yelpaze düzeltmesi telefonda geçti; ceza dizilişi hep Dağınık; masa zemini denemeleri (kullanıcı beğenmedi, Çuha kaldı); yapışık 2/Papaz görünüşü (Varsayılan ilk); el başı duyurusu (ortada); sıra göstergesi (Işık/Kenar/Çizgi/Yok) + titreşim (sıra + blok); bağlantı denemesi sayfası; public/kartlar silindi; mekanik sohbeti kapandı. **Telefonda test bekleyen:** yapışık kart seçenekleri, duyuru, sıra göstergesi, titreşim (kullanıcı titreşimi denedi, "iyi"). Yayın kuralı: her parçadan sonra sormadan gönder, yayın bitene kadar bekle; GitHub Pages telefonda ~10 dk önbellekte tutuyor (uygulamayı kapatıp aç).
  - **2026-10-24 oturumu yapılanlar** (devirde commit + GitHub'a gönderildi; kullanıcı testinden geçti; kural 2026-10-24'ten beri: her kod parçasından sonra sormadan commit + GitHub'a gönder; kahve sürümünde yeniden konuşulacak): bomba ceza yığınıyla gider (6.8 madde 7), botlar söz yollamaz, 2 gruba yapışır (6.5), Yığına bakış varsayılanı Yerinde, **Kral (Papaz) eklendi** (6.9.1). Sıradaki: kart tasarımı (2 ve Papaz yapışmasının görünüşü dahil), sonra kahve sürümü (2. aşama). Claude'un mekanik görüşleri sohbeti hâlâ bekliyor.
  - **Arkadaş denemesinin sonuçları (2026-10-24):** iPhone'da sorunsuz çalıştı (ana ekrana eklendi; dokununca tam ekran olmaması normal, iPhone Safari'de Fullscreen API yok). **Kız'da çekilen kartı üçüncü oyuncu görmez** (kesin). Blokta 2'nin yeri: kullanıcı "karışık, konuşacağız". Bomba ceza yığınıyla gider mi: konuşuluyor (6.8 madde 7). **Yol (kullanıcı):** bu küçük mekanikler bitince oyun **kahve sürümüne** uygun hale getirilecek; **kartlar yeniden tasarlanacak** (kullanıcı kartlarda gerilme/"stretch" görüyor; 2026-10-22'de ölçülmüştü: oran aynı, fark Android'in sistem yazı tipinden; yeni tasarım ikisini birden çözer); **Papaz (Kral) oyuna eklenecek** (sırası konuşulacak).
  - **Bu oturumda yapılanlar (2026-10-23), hepsi tarayıcıda denendi, telefonda test bekliyor** (kullanıcı arkadaşlarına gösterirken görmüş olabilir, sor): aşağıdaki "Telefon notları" maddesi + deste penceresinde soluk kartlar daha soluk (`.deste-kart.soluk` brightness 0.3) + hazır sözlerin kaba sürümü (Bölüm "Hazır sözler"). Kart boyutu kararı verildi: %110 varsayılan, %115 ikinci.
  - Ölçüler (%100, masa pikseli): el 60×84, bot/yığın/Mut 56×78, bomba 44, deste 42 (`src\ekran\boyut.ts` çarpanı, `kartEni(taban)`, CSS'te `--kart-olcek`).
  - **Telefon notları (2026-10-23) — yapıldı, telefonda test bekliyor (commit a523639):** Kart boyutuna %115 eklendi (kullanıcı "%115 olabilir"). Bomba artık yanıp sönmüyor (sabit hafif parıltı; dikkat dağıtıyordu), botlarda kartları gibi yan dönük. Kendi ceza yığınımda zemin çizgisi yoktu (CSS seçicisi `.yigin-sarici` yüzünden tutmuyordu), düzeltildi. Yığına bakış telefonda parmak biraz kayınca kapanıyordu (tarayıcı kaydırma sanıp dokunuşu iptal ediyordu): `[data-bak] { touch-action: none }`. **Sonra (kullanıcı onayı, yapıldı, telefonda test bekliyor):** Kart boyutu sadece **%110 (varsayılan) / %115** (%100 ve %120 kalktı; kullanıcı ikisi arasında kaldı). Dağıtımda benim kartlarım kapalı uçar, inince dönerek açılır (`Ucus.donus`, `SURE.donus` 380 ms; animasyon hızı varsayılanı Orta, kayıt adı `animasyonHizi2` ile telefondaki eski seçim sıfırlandı). Kız'da hedef bensem kartlarım açık kalır, karılır, çekenin kaldırdığı kartı görürüm. 8'de tarayıcıda ölçüldü, varsayılan ayarlarda kartlarım ters uçmuyor (sadece "Bot kartlarını kapat" açıksa bota giden kartlarım kapalı uçar).
  2. **Kartlar (2026-10-24, yapıldı, telefonda kullanıcı testinden geçti):** Gerilme için işaretler SVG (`src\ekran\Isaret.tsx`), yazı oyuna gömülü **Barlow Condensed** (`@fontsource`, OFL). Klasik iskambil kalıyor. J/Q/K: klasik resimler (Fomin CC0) denendi, kullanıcı "çok garip, gerek yok" → kaldırıldı (`public\kartlar` kullanılmıyor, commit'e girmedi). Görünüş → **J/Q/K**: **Sade** (varsayılan, sayılı kart gibi) / Çerçeve (ortada çift çerçeve); Harf denendi, kaldırıldı. **İkonlu tasarım sonraya** (kullanıcı sıkıldı): deneme sayfası `tasarim.html` (yayında da `/mut/tasarim.html`): Şimdiki/Sade/Klasik/Dar, 4 renk (karo mavi, sinek yeşil; kullanıcı "evet"), güç ikonları turuncu, köşede işaretin yerine (Mut'ta işaret kuralı etkilemiyor), ikon sadece güç çalışırken (10 bomba elinde, Papaz Kral elinde; 2/8/Kız hep). Açık soru: avuçtaki 3/Vale/As'ta ikon olsun mu (kullanıcı "evet" dedi, Claude itiraz etti: avuçtaki kartın kendi gücü yok; sayfada iki seçenek var). Ceza yığınında alttaki kartlardan sadece 10 px şerit görünüyor, köşe sayısı oraya göre tasarlanmalı.
  - **Eski not — Kart tasarımı:** Kullanıcı Q/K görünümünü sevmiyor; sayı ve işaretleri sıfırdan tasarlamak istiyor. Sorun: işaretler (♠♥♦♣, `kart.ts` SEMBOL) ve sayılar sistem yazı tipiyle çiziliyor, Android'de PC'den farklı (maça uzun/ince); kart oranı aynı (1,4, gerilme yok, ölçüldü). Önerilen: önce Claude modern-sade deste (SVG işaretler + oyunla gelen tek açık kaynak yazı tipi, büyük köşe sayıları, Vale/Kız/Papaz için geçici sade tasarım), sonra kullanıcı kendi çizimlerini (Inkscape → SVG) verir. Seçenekler Görünüş'te ekranda karşılaştırılacak. İsteğe bağlı: dört renkli deste (karo mavi, sinek yeşil). Kısıt: kartlar küçük, ince figür okunmaz.
  3. Parmakla deneme (4. madde) sürüyor; telefonda karar verilecek küçükler: Test menüsü hızları, ceza aralığı (10 px), sıra çizgisi belli mi.
  4. **2. aşama planı (kullanıcıya anlatıldı):** Masa kur → 4 harfli kod + QR, Katıl, isimler, kurucu Başla; kurucu telefon hakem (kural motoru orada, herkese sadece kendi görmesi gereken gider); her telefonda oyuncu altta; kopunca bot; blok penceresi gecikmeye göre. **Önce küçük bağlantı denemesi önerildi** (iki telefon "merhaba", Wi-Fi + mobil veri): PeerJS aracısı da pages.dev gibi Türkiye'de engelli çıkabilir; mobil veride doğrudan bağlantı kurulamazsa aktarıcı (TURN) gerekir. Kullanıcı henüz "önce hangisi" demedi.
  - **Bu oturumda yapılanlar (2026-10-22/23):** ☰ → Geliştirici seçenekleri (aşağıda, Bölüm 0 "Test ve Dene menüleri" maddesi). Telefonda tam ekran yapıldı ve denendi (dokunmatikte her dokunuşta `requestFullscreen`, `Sahne.tsx`; `.sahne-dis` kamera deliği payı `safe-area-inset`). El 10 px yukarı (Görünüş → El yüksekliği, varsayılan +10 px, diğer seçenekler duruyor). Adres sorunu çözüldü: **Mut'un adresi https://alatar17.github.io/mut/ olarak kalıyor.** Cloudflare (`mut-30f.pages.dev`) Türkiye'de engelli çıktı, kullanılmıyor (Cloudflare projesi hâlâ duruyor, her push'ta yayınlıyor; zararsız, istenirse silinir; `.node-version` ondan). Kullanıcı kendi telefonunda Mut'u **Brave**'den kurdu (Lore Chrome'da aynı adresi tuttuğu için; Xiaomi'de Brave'e "Ana ekran kısayolları" izni gerekti). Kardeşinin telefonunda (Lore yok) Chrome'dan kurulup açıldı → arkadaşlar Chrome'dan sorunsuz kurar. GitHub Pages yayını (`.github\workflows\yayin.yml`) silinmeyecek. Ovia ve yemek tarifi uygulaması için ayrı adres gerekirse önerilen yol: GitHub organizasyonu (ücretsiz, her organizasyon kendi `ad.github.io` adresi). Kullanıcıya hatırlat: telefonda USB hata ayıklamayı kapatabilir. Manifest `standalone` kalıyor; tam ekran oyun içinden yapılıyor (yukarıda).
- **Telefona taşıma 1. aşama (eski plan, 1–3 yapıldı):** 1) GitHub'a yükleme — yapıldı. 2) GitHub Pages — yapıldı, sonra Cloudflare'e taşındı. 3) PWA dosyaları — yapıldı. 4) Kullanıcı kendi telefonunda (Android, Xiaomi) botlarla dener; parmakla basılı tutma / sürükleme / boyut sorunları birlikte düzeltilir (şimdiye kadar sadece fareyle denendi). Bir arkadaşın iPhone'unda kısa deneme. Sonra **2. aşama: herkes kendi telefonundan** (PeerJS önerildi, oda kodu/QR, kurucu telefon hakem, kopunca bot oynar, Test/Dene/Görünüş sadece kurucuda, blok penceresi her gönderimde, ek süre düğmesi). Cilalama ve bekleyen küçük kararlar (Test menüsündeki hızlar, ceza yığını aralığı, sıra sendeyken sarı çizgi) telefonda oynarken. Sonra arkadaşlarla kahve testi. Hatırlatılacaklar listesini bitirdikçe hatırlat.
- **4n Yığına bakış yapıldı — 2026-10-22 (derleme + 92 otomatik test + tarayıcıda denendi; kullanıcı testinden geçti):** Orta yığını, herkesin ceza yığınını ya da bombayı **basılı tutunca** (0,35 sn; bilgisayarda fare üstünde 0,45 sn bekleyince) bütün kartlar açılır, bırakınca kapanır. En alttaki kart solda, en üstteki sağda; başlık yok (kullanıcı: gereksiz), sağ altta kart sayısı rozeti (sarı, belirgin olsun diye). **Dene düğmeleri ve Yeni oyun** animasyon sürerken (bot hamlesi, dağıtım) artık yok sayılmıyor: istek hatırlanır, hamle bitince kurulur (`bekleyenOyun`). Uzun basıştan sonraki tıklama yutulur (serbest elde hedef seçmesin); kart sürüklerken açılmaz. **Oyuncu ayarı** (kullanıcı: ikisi de kalsın, isteyen seçsin), ☰ menüsünde **"Yığına bakış"**: varsayılan **Yerinde** (kullanıcı 2026-10-24; kayıt adı `bakisGorunusu2`, eski seçim sıfırlandı; Kral seçimi ise her zaman ortadaki pencerede olacak). **Ortada** (eskiden ilk; ekran ortasında koyu panel, avuç boyu kartlar, 18'den çoksa iki sıra) / **Yerinde** (yığının üstünde tek sıra, küçük kart). Dene: **"Yığına bakış dene"** (B'de 20, C'de 6, bende 4, ortada 6 kart). Kod: `src\ekran\YiginBakisi.tsx`, yığınlarda `data-bak`. 
- **Duraklat + Görünüş menüsü — 2026-10-22 (kullanıcı testinden geçti):** Dene'nin solunda ⏸ düğmesi: botlar oynamaz, hamle süresi işlemez, kendi kartlarım oynanır; ▶ devam (`duraklatildi`). Sol altta konuşma düğmesinin sağında **"Görünüş"** menüsü (kullanıcı fikri: test boyunca çok görünüş deneyecek; yeni görsel seçenekler buraya): Yığın zemini, Mut zemini, Ceza dizilişi, Puan yeri, Destede kartlarım, Bot kartlarını kapat, Bot kartları yelpaze, Bot kartları kenardan taşsın, Ceza yığını aralığı. Test'te: Botlar kendi oynasın, Bot hızı, Animasyon hızı, Yakalamada duraklama, Hamle süresi (kullanıcı: hızların görünüşle alakası yok).
- **Yığın görünüşleri (kullanıcı 2026-10-22: şimdiki hal varsayılan, seçenekler Görünüş menüsünde, teker teker):** Konuşulan 4 eksen: 1) **Yığın zemini — yapıldı:** **Kesikli** (varsayılan; boş orta yığındaki kesikli çizgi, kullanıcı fikri) / Çerçeve / Yok. Koyu kutu ve Yuva denendi, kullanıcı kaldırttı (2026-10-22). **Mut zemini** ayrı satır: **Yuva** (varsayılan, kullanıcı 2026-10-22 "şimdilik") / Koyu kutu (eskisi) / Kesikli / Çerçeve / Yok (`mut-*` sınıfları). ceza + orta yığın, yan oyuncularda döner, boşken de görünür; zemin görünen kartları + alttaki kalınlığı her yandan eşit 6 px payla sarar (kartlar çoğalınca büyür; kullanıcı: önce bir yeri büyük bir yeri küçüktü) (masa sınıfı `zemin-*`, renkler temada). 2) **Ceza dizilişi — yapıldı (kullanıcı testinden geçti):** **Varsayılan** (ilk, son 3 kart kaydırılmış) / **Dağınık** (ikinci seçenek; her kart kimliğinden sabit ±3,6° açı ve ±2 px kayma). "Üst grup" (grup ne kadar uzunsa o kadar kart kaydırılmış) denendi, kullanıcı beğenmedi, kaldırıldı. 3) **Puan yeri — yapıldı (kullanıcı testinden geçti):** Yanında (ilk) / Kenarda (zeminin üst çizgisinde küçük etiket) / Rozet (yığının sağ üst köşesi; alt köşede benim yığınımda ekran dışına taşıyordu). Akıştaki puan görünmez ama yer tutar, yerleşim kaymaz. 4) Orta yığına ayrı zemin: gerekirse (hatırlatılacaklarda).
- **Bağlantı denemesi sayfası (2026-10-24, hazır):** https://alatar17.github.io/mut/baglanti.html — Masa kur (4 harfli kod) / Katıl (kodu yaz) → "Bağlandı ✓", "Merhaba gönder" (gidiş-dönüş ms), kayıtta **bağlantı yolu** (aynı ağ / internet üzerinden doğrudan / aktarıcı) ve hata adları (PeerJS sunucusu engelli mi, 15 sn'de bağlanamadı = aktarıcı gerekebilir). PeerJS (`peerjs` paketi, MIT) ücretsiz sunucusu 0.peerjs.com, aktarıcı (TURN) yok. Kod: `baglanti.html`, `srcaglanti.ts`. PC'de iki sekmeyle denendi, çalışıyor. **Akşam kardeşin telefonuyla denenecek:** 1) ikisi aynı Wi-Fi, 2) biri mobil veri, 3) ikisi mobil veri.
- **UI 1. parça (2026-10-24, tarayıcıda denendi, telefonda seçim bekliyor):** Görünüş menüsünde iki yeni satır (sıra göstergesi, titreşim). **El başı duyurusu:** dağıtımdan sonra elin kuralları ortada büyük yazı ("KRAL ELİ", "BOMBA ELİ", "×2"…), 1,7 sn; bu sırada kimse oynamaz. Kullanıcı **Ortada**'yı seçti (belirip söner); Uçarak ve Kapalı kaldırıldı, menü satırı yok. Normal elde duyuru yok. **Sıra göstergesi:** **Işık** (varsayılan; avucun arkasında sarı ışık) / Kenar (masanın alt kenarı) / Çizgi (eski). **Titreşim** (açık; sadece Android): sıra bana geçince tek kısa; blok penceresi bana açılınca sert üç kez (kalkan kuruluysa tek, "bloklandı"); zincir blokta her pencerede. Sıra göstergesine **Yok** eklendi (kullanıcı: dört seçenek de kalsın; Claude'un önerdiği "avuç kalkar" / "süre çubuğu hep görünür" istenmedi). Kod: `Masa.tsx` `EL_DUYURULARI`, `SIRA_GOSTERGELERI`, `topluDagit`; renk `--sira-isik`. UI sırası (kullanıcı onayı): 1) duyuru + sıra (bu), 2) ☰ Ayarlar ayrımı, rakip görünüşü, giriş ekranı → bağlantı denemesinden sonra, kahve sürümüyle. **Bağlantı denemesi: 2026-10-24 akşamı kardeşin telefonuyla** (iki telefon "merhaba", Wi-Fi + mobil veri).
- **Masa zemini ve ceza dizilişi (2026-10-24):** Ceza dizilişi artık hep **Dağınık** (kullanıcı kararı; Varsayılan seçeneği ve menü satırı kaldırıldı). Masa zemini denendi (Dokulu çuha / Ahşap / Koyu keçe, kodla gürültü dokusu): kullanıcı hiç beğenmedi, **düz Çuha kalıyor**, denemeler ve menü satırı kaldırıldı. İleride istenirse kullanıcı Blender'da gerçek dokuyla (Poly Haven / ambientCG, CC0) masayı yukarıdan renderlar, 1688×780 tek resim arka plana takılır; acelesi yok. UI konuşması (sıra göstergesi, köşe düğmeleri, kural yazıları, rakip görünüşü, giriş ekranı, birikmiş seçenekleri kapatma) zemin bitince.
- **7 ilk sürümde YOK (kullanıcı kararı 2026-10-22).** Papaz gibi sonraya. Claude'un sevmediği/eklemek istediği mekanikler sohbeti de sonraya (kullanıcı 2026-10-22).
- **Deste penceresi yapıldı — 2026-10-22 (kullanıcı testinden geçti):** Desteye dokununca ortada koyu (saydam olmayan) pencere: 13 sütun A–K, her sütunda 4 kart üst üste (26 px kaydırılmış). Bilinmeyenler (destede / rakip avucunda) üstte parlak; benim avucumdakiler Görünüş → "Destede kartlarım": **Soluk** (varsayılan, kullanıcı) / Çerçeveli (sarı çerçeve); açıkken masa **kararmaz** (kullanıcı kararı; karartmalı hali denendi, kaldırıldı); masada görülenler (orta, ceza yığınları, Mut, bomba) en altta karartılmış (saydamlık arkadaki kartı gösteriyordu). Sütun altında **bilinmeyen** sayısı (Claude kararı; benim kartlarım sayılmaz). Takasta verdiğim kartları pencere hatırlamaz (Claude kararı: hafıza oyuncunun işi). "Kaç el?" penceresinde **"Deste penceresi"** anahtarı (varsayılan açık; kapalıyken desteye dokunmak bir şey yapmaz). Dokununca kapanır. Kod: `src\ekran\DestePenceresi.tsx`. Yığına bakış paneli de artık saydam değil (`--bakis-arka`).
- **Menüler sığsın (2026-10-22):** Görünüş iki sütun, Dene üç sütun (Dene tepeye 3 px kalmıştı). Yeni satır eklerken menünün üstten kırpılmadığı kontrol edilmeli.
- **Papaz eklendi (2026-10-24, 6.9.1).** 7 ilk sürümde yok (2026-10-22).
- **4m Oyun akışı yapıldı — 2026-10-22 (derleme + 92 otomatik test + tarayıcıda denendi; kullanıcı testinden geçti, commit 635b683):**
  - **El sayısı:** "Yeni oyun" (puan kağıdında ve Dene menüsünde) "Kaç el?" penceresini açar: 1 / 3 / 5 / 10 düğmeleri + "Başka" kutusuna sayı (en çok 99). Son seçilen hatırlanır. Sağ üstteki **"3/10"** sayacına dokununca oyun ortasında da değişir (oynanan elden az olamaz); el arasında son ele inilirse oyun biter, oyun bittikten sonra artırılırsa "Sonraki el" ile devam edilir. Motor: `elSayisiAyarla`.
  - **Oyunu bitir:** Sağ üstte ☰ menü → "Oyunu bitir" → onay ("Yarım kalan el sayılmaz") → oyun sonu, kazanan biten ellere göre; hiç el bitmediyse "Hiç el bitmedi". Motor: `oyunuBitir` (el = biten el sayısı). Animasyon sürerken istenirse hamle bitince uygulanır.
  - **Puan kağıdı resmi** (`src\ekran\puanResmi.ts`): oyun sonunda "Kaydet". Ekrandaki kağıdın aynısı (aynı el yazısı harf), üstte MUT ve tarih, altta kazanan. Telefonda paylaş penceresi (Galeri/WhatsApp), bilgisayarda `mut-puan-YYYY-AA-GG.png` iner. Not: el yazısı harfi telefonda farklı görünebilir (Windows'taki Comic Sans/Segoe Print yok); gerekirse harf dosyası eklenir.
  - **Hamle süresi:** aşağıdaki karar uygulandı. Benim için süre avucun üstünde eriyen çubuk (blok çubuğu gibi; benim isim etiketim yok), elle oynanan botlarda isim etiketinde azalan beyaz halka (sarı halka sarı etikette görünmedi). Test menüsünde "Hamle süresi" (Kapalı/20/30/45 sn, ilk 30). Uzaktayken avucun üstünde "Senin yerine bot oynuyor · dokun". **Son 3 saniyede** çubuk ve halka yarım saniyede kırmızıya döner (kullanıcı fikri; Kız çubuğu da; blok penceresinin 3 sn'lik çubuğu sarı kalır; renk `--sure-bitiyor`).
  - Kullanıcı testinden geçti (kırmızı dönüş hariç: tarayıcıda renkler doğrulandı, kullanıcı görmedi).
  - **Sağ tık hatası düzeltildi:** kartı sürüklerken sağ tıklayınca kart ortada kalıyordu. Oyunda sağ tık menüsü kapalı, sağ tık sürükleme başlatmaz, kesilen sürükleme kartı geri koyar. Kullanıcı testinden geçti.
- **Test ve Dene menüleri sadece kurucuda (kullanıcı fikri 2026-10-22):** Herkes kendi telefonundan oynarken (2. aşama) bu menüleri sadece masayı kuran görecek; ayarlar kahve testinde de denenebilsin. **Yapıldı (2026-10-22):** ☰ menüsünde "Geliştirici seçenekleri" anahtarı (varsayılan kapalı, telefonda kayıtlı); kapalıyken Görünüş, Dene, Test ve duraklat gizli, ayarları çalışmaya devam eder, oyun yeniden başlamaz; kapatınca duraklatma kalkar. 2. aşamada anahtar sadece kurucunun menüsünde olacak.
- **Hamle süresi kararı (kullanıcı onayı 2026-10-22, yapıldı — bkz. 4m):** 30 sn (ilk 20 sn görünmez, son 10 sn isim etiketinde azalan halka); süre bitince oyuncunun yerine akıllı bot oynar; üst üste 2 kez biterse "uzakta" sayılır, bot oynamaya devam eder, ekrana dokununca döner. Kız'da kart seçimi 10 sn, bitince rastgele kart. Serbest elde hedef seçimi hamle süresine dahil. Blok penceresi 3 sn aynen. Test menüsünde 20/30/45 sn ve aç/kapa.
- **Hatırlatılacaklar listesi (kullanıcı 2026-10-21/22: "bunları unutma, bitirdikçe hatırlat"):** 1) Ses efektleri — **sonra** (kullanıcı Unity ve Unreal'ın ücretsiz ses paketlerine bakacak; Claude lisansın oyun motoru dışında kullanıma izin verdiğini kontrol etmeli). 2) Ceza yığını aralığının seçilmesi (Görünüş menüsünde; kullanıcı 10 px'i iyi buluyor, daha test edecek). 3) 2. aşama: telefonlarla birlikte oynama (yayın: şimdilik herkese açık GitHub + GitHub Pages; gizli depo + Cloudflare'e "şimdilik gerek yok"). 4) Mekanik görüşleri: kapandı (2026-10-24; kullanıcının ek görüşü yok, Claude'un büyük itirazı yok; kahve testinden sonra gerçek oyuna göre bakılacak). 6) **Bombayı ceza yığınıyla göndermek** kuralı (6.8 madde 7; kural 2026-10-24'te netleşti, kodlanacak). 5) Orta yığına ayrı zemin — gerekirse (Kesikli beğenildi, büyük ihtimalle gerek yok). Her biri konuşulup bitince buradan silinir. (Yığına bakış ve deste penceresi 2026-10-22'de yapıldı.)
- **Cilalama 1 yapıldı — 2026-10-21 (Claude oynayıp buldu; kullanıcı testinden geçti, commit 8f70df7):** 1) Serbest elde hedef: **dokunmak ve inen kartı sürüklemek birlikte** çalışır; Test menüsündeki "Serbest el hedefi" kalktı. (Kullanıcının gördüğü 8 takılması tekrarlanamadı; muhtemelen Dokun modunda sürüklemeye çalışmaktı.) 2) Orta yığının sayı rozeti yığının sağına alındı, kartı kapatmıyor. 3) Mut kutusu 4 kartlık sabit genişlikte; alınan kartın yeri boş kalır (`MutAlani`), boşken nokta kalmıyor. 4) Boş orta yığında kesikli çerçeve. 5) Sayfa görünmezken ölçüm 0 → NaN koruması (`konumOlc`). Kilitli dörtlü normal oyunda doğru çıktı (dört 8).
- **Ses denemesi — 2026-10-21, kaldırıldı:** Kenney "Casino Audio" (CC0) ile karma + kart koyma sesi denendi; kullanıcı "sesler hiç olmadı, kaldır" dedi. Kod geri alındı, dosyalar Geri Dönüşüm Kutusu'nda. Ses konusu hatırlatılacaklar listesinde duruyor.
- **4l Ceza yığını görünümü yapıldı — 2026-10-21 (kullanıcı gördü, tamam dedi; aralık kararı sonra):**
  - Ceza yığını orta yığın gibi: **son 3 kart kaydırılmış**, orta yığından dar. Aralık Test menüsünde "Ceza yığını aralığı" (8 / 10 / 12 px, ilk 10); kullanıcı seçince seçenek kalkacak. Yan oyuncularda kaydırma kartlarla birlikte döner (oyuncuya göre).
  - **Alttaki** kartların (üstteki değil) köşe sayısı sola kayar (`stil.css` `.yigin-kart.alt .kose`); orta, avuç, Mut aynen.
  - **Kilitli dörtlü görünümü yapıldı (kullanıcı onayı 2026-10-21):** aynı sayıdan 4 kart art arda gelince en üstteki ters çizilir (sadece ekran, motora dokunulmadı: destede her sayıdan 4 kart olduğu için dörtlüyü zaten kimse eşleştiremez). Üstüne kart gelirse ters kalır; dörtlü bozulursa (blok) kendiliğinden düzelir. Papaz ve 7 kalacak (kullanıcı), ama önce cilalama + arkadaşlarla deneme oyunu. Test: "Bot As dene" → B'nin yığınında dört 9, üstteki ters.
  - **Yığının tamamını açmak** (basılı tutunca yelpaze) **sonraya** kaldı (kullanıcı 2026-10-21).
- **4k 10 (bomba) yapıldı — 2026-10-21 (otomatik testler + tarayıcıda bakıldı; kullanıcı testinden geçti, cilalama yapıldı):**
  - **Kurallar (kullanıcı onayı, 6.8'e işlendi):** Serbest elde bomba istenene gönderilir. **10 seriyi tamamlıyorsa oyuncu seçer** (seri ya da bomba); seri boşa gitmez. Bomba kurulduktan sonra 10 ortaya boşa atılamaz, bombaya gider. Başkasının 10'u sahibindeki bombaya eklenince **blok penceresi açılmaz** (sadece bomba gönderilince açılır). Dört 10'un hepsi Mut'ta çıkarsa bomba yok, el normal. Bomba yığınının rozetinde **o ana kadar çıkan 10 sayısı** yazar (seride kullanılanlar dahil; kaç 10 kaldığı buradan anlaşılır). As ile önce açılan geçerli; 3 ile birlikte olur.
  - **Motor:** `d.bombaEli` (`acilisKurallari`), `d.bomba = { sahip, kartlar }`, yeni hamle `bomba`; Mut 10'unu eşleştirmek bombayı kurar (`nereye = bomba:<i>`). Blokta `d.blok.bomba`; 2 bomba kartlarının altına girer. El sonunda `elBitir` patlatır (orta + Mut kalanları + bomba sahibin ceza yığınına), `d.patlama` ekran animasyonu için. `cikanOnlar(d)` rozet sayısı.
  - **Bot:** bomba sahibine bomba + orta + Mut puanı şimdiden ceza sayılır → 10 gelince devreder, bombayı 2 ile bloklar, sahip değilse ortaya puanlı kart atmayı sever.
  - **Ekran:** Sol üstte "Bomba"; orta yığının solunda orta puanı (değişince yanıp söner). Bomba **tek kart** görünür (kullanıcı: "tahta dar", yelpaze yok), rozetinde çıkan 10 sayısı; kırmızımsı yanıp söner. Yeri: ben → **kalkanın sağında** (sabit yer; kullanıcı onayladı 2026-10-21; önce ceza yığınının sağındaydı ve avucun arkasında kalıyordu, sonra üstü denendi); rakipler → ceza yığınlarının altında. 10'u Mut 10'una (kurulum), bombaya ya da ortaya bırakmak (seri yoksa) bomba hamlesi. Bloğu kalkan ya da 2'yi kendi yığınına/bombaya bırakmak yapar.
  - **Patlama animasyonu (kullanıcı kararı 2026-10-21, gerçek oyunda da):** son hamleden yarım saniye sonra Mut'ta kalanlar ve bomba **önce orta yığına** toplanır, orta puanı bir kez yanıp söner; ~1 sn sonra orta yığının tamamı bomba sahibinin ceza yığınına gider, puanlar birleşir.
  - **Dene:** "Bomba dene" (10'umu Mut 10'una bırak → B → C → bana gelir, 2 ile blokla), "Bot bomba dene" (C bombayı bana kurar; blokla ya da kabul edip 10'umla devret), "Patlama dene" (son hamleler; 4'ümü ortaya at → el biter, bomba C'de patlar).
  - Not: Tarayıcı panelinde sürükleme (`left_click_drag`) bu kez çalıştı. Sayfa açılışında konsolda bir "NaN left" uyarısı var (bombadan önce de var; büyük ihtimalle ölçüm 0 iken; bakılmadı).
- **Sonra yapılacak — ceza yığını görünümü (karar 2026-10-21, kullanıcı "şimdi değil" dedi):** Sorun: ceza yığınında sadece en üst kart görünüyor (Bot As dene'de dört 9'un üçü görünmüyor). Karar: **her zaman** alınabilecek üst grup (aynı sayılar ya da seri) orta yığındaki gibi kaydırılmış görünür; **basılı tutunca** (bilgisayarda fareyle üstüne gelince) yığının tamamı yelpaze gibi açılır. Kahvede de kartlar düzgün dizilmez, alttakiler ucundan görünür, istenirse elle bakılır; yani tamamını açmak kahveye uygun. **Ek karar (2026-10-21):** Ceza yığınında yer dar, kartlar orta yığındakinden **daha dar** kaydırılacak; alttaki kartın sayısı (örn. "10"un sıfırı) görünsün diye **sadece ceza yığınındaki kartlarda köşedeki sayı biraz sola kaydırılacak** (orta, avuç, Mut aynen). Kullanıcı: 10 cilalaması bitince bakılacak.
- **4j 3 (serbest el) yapıldı — 2026-10-21 (otomatik testler + tarayıcıda bakıldı; kullanıcı testinden geçti):**
  - **Kurallar (kullanıcı onayı):** Mut'ta 3 varsa yakalanan kartlar (orta eşleşme/seri, Mut, kendi yığınını boşaltma) istenen rakibe gider, kendine değil. Al ve ilerlet herkesten; kartlar alınan rakibe geri gidemez → 3 kişide tek hedef, seçim sorulmaz. Ekle değişmez (zaten herkese). İki 3 ek etki yapmaz. 3 ile As: önce açılan geçerli. Hedef seçilmeden vazgeçilmez (geri alma yok). Blok aynı (kartlar gönderene döner).
  - **Motor:** `d.serbest`, `acilisKurallari(mut)` (`eksiEl` yerine; ilk açılan As/3 kazanır). Hamlede `gonder` = kartların gideceği oyuncu; serbest elde her rakip ayrı hamle. Serbest al ve ilerlet: `hedef` = alınan, `gonder` = giden.
  - **Bot:** Rakiplere giden puan eşitse kazanmakta olana (oyun toplamı + bu elin puanı en az) gönderir.
  - **Ekran:** Sol üstte "Serbest el". Kart eşleştiği yere iner, bekler; gönderilebilecek oyuncuların isim etiketi hafifçe parlar. **Dokun (varsayılan, A):** rakibin ceza yığınına, avucuna ya da isim etiketine dokun. **Sürükle (C):** inen kartı oyuncuya sürükle. Test menüsünde "Serbest el hedefi" ile geçilir. Kullanıcı kararı (2026-10-21): ikisi de bir süre kalsın; şimdilik iş görüyor, **cilalama sonra** yapılacak (şimdi gerek yok). Serbest elde "Ekle / İlerlet" düğmeleri her rakibin yığınında çıkar.
  - **"3 dene":** Mut'ta 3 ve 7; avucumda 9 (ortadaki 9), 7 (Mut 7), 5 (kendi yığınımdaki 5), 6 (B'nin yığınındaki 6 → İlerlet, kartlar kendiliğinden C'ye). **"Bot 3 dene":** B ortadaki 9'u yakalar, sıradaki C yerine bana (yığınım boş = kazanan) gönderir.
- **4i As (eksi el) yapıldı — 2026-10-21 (otomatik testler + tarayıcıda bakıldı; kullanıcı testinden geçti):**
  - **Motor:** `d.eksi` (`eksiEl(mut)`); eksi elde `ekle` sadece kendine (hedef = kendin), `alIlerlet` herkesten (`hedef` = yığını alınan), `cezaBosalt` yok. Blok penceresi yığınından alınana açılır; blokta kartlar alanın yığınından bloklayanınkine döner (zincir de çalışır). Puan × −1. Bot puan hesabını ters çevirir.
  - **Ekran:** kartı kendi yığınına bırakmak = ekle, rakibin yığınına bırakmak = al. "Eksi el" etiketi, puanlar eksi.
  - **"As dene":** avucumda 5-9-7-2; ortada 9, benim yığınımda 5, B'de 4-5-6, C'de 10 üstünde 5. **"Bot As dene":** B benim üç 9'umu alır, ben 2 ile bloklarım.
- **As kuralları (konuşuldu 2026-10-21):**
  - **Hamleler (eksi elde):** Yakalanan her kart yakalayanın **kendi** ceza yığınına gider (orta eşleşmesi, Mut, orta seri). **Başkasının ceza yığınından al:** **herkesten**; üstteki eşleşen kartlar (ya da uzatılan seri) + kendi kartın kendi yığınına. **Kendi yığınına ekle (yeni hamle):** yığınının üstünde 5, avucunda 5 → üstüne eklersin; 4-5-6'ya 7 ekleyip seriyi uzatmak da olur. **Boşalt ve ekle (başkasına) yasak** — kartlar hep kendine geldiği için zaten mümkün değil. 8 ve Kız değişmez.
  - **Zorunluluk:** Kendi yığınına eklemek zorunlu değil; 5'i ortaya da atabilirsin (ceza yığınıyla eşleştirme hiçbir zaman zorunlu değil). Orta ve Mut zorunlulukları aynen.
  - **Blok:** Pencere sadece biri başkasının yığınından aldığında, o kişi için açılır; kurulu kalkan kendiliğinden bloklar. Kartlar 2 ile sahibinin yığınına döner. Kendine (orta/Mut) almada pencere yok.
  - **Puan:** El sonunda eksi yazılır; boş yığın +100 (×çarpan). İki As ek etki yok. 3/10 ile çakışma o kartlar gelince.
  - **Ekran:** Sol üstte "Eksi el" yazısı (Vale'nin ×2'si gibi); ceza yığını puanları eksi görünür (−118).
  - **Bot:** Eksi elde puan hesabını tersine çevirir (Claude ayarlar).
  - **Dene:** "As dene" (Mut'ta As, ortada eşleşecek kart, B'nin yığınında alınacak kartlar) ve "Bot As dene" (bot benden alır, ben 2 ile bloklarım).
  - Sonra 3 → 10 → Papaz → 7. Çalışma biçimi: işi sadece arada kullanıcının elle deneyeceği bir şey varsa parçalara böl (ekransız ara adımı ayrı onaya sunma); her özel kart için Dene menüsüne "… dene" eli; akıllı bot hamleleri deneyerek seçtiği için yeni kartları çoğunlukla kendiliğinden kullanır.
- **Sonra konuşulacak — süre (kullanıcı, 2026-10-21):** Biri oynamazsa oyun kilitleniyor; genel hamle süresi ve Kız seçimine süre gerekip gerekmediği "en son" konuşulacak.
- **4h Vale (çarpan) yapıldı — 2026-10-21 (otomatik testler + tarayıcıda bakıldı; kullanıcı testinden geçti, "Bot 8 dene" dahil):**
  - **Kurallar (kullanıcı onayı, kahvede ek kural yok):** Mut kartlarında Vale varsa elin bütün puanları ×2 (el sonunda önünde 214 varsa 428 yazılır); her ek Vale +2 (×4, ×6, ×8); el boyunca sürer; temiz ön / boş ön de çarpılır (−200). Avuçtaki Vale'nin gücü yok (25 puanlı kart).
  - **Motor:** `valeCarpani(mut)`; el kurulurken `d.carpan` buna göre ayarlanır (puan gösterimi ve el sonu zaten çarpanı kullanıyordu). Bot değişmedi.
  - **Ekran:** Kullanıcı A'yı seçti: sadece sol üstte "×2" yazısı, puanlar çarpılmış görünür (parlama yok).
  - **"Vale dene":** Mut'ta Vale, avucumda Vale; sağdaki B'nin yığınında 9 (18 görünür). Vale'yi Mut Vale'ye bırakınca B 118 olmalı.
  - **"Bot 8 dene":** sıra sağdaki B'de, bende 2 + üç 9 ve kalkan kurulu başlar; B benimle takas yapar (2 bana geçer, kalkan görünür ama kurulu değil), sonra 9'u Mut 9'la yakalar. Claude tarayıcıda denedi, çalışıyor.
- **4g Kız (çekme) yapıldı — 2026-10-21 (otomatik testler + tarayıcıda deneme geçti; kullanıcı denedi, geri bildirimle düzeltildi):**
  - Son düzeltme (kullanıcı testinden geçti): sürüklemeye başlanan ters kart seçilmiş sayılır, önceki kalkık kart iner; geri dönen kart kalkık oturur (kullanıcı tamamen inmesini isterse değişir).
  - `/code-review` yapıldı (2026-10-21): motorda geçersiz `cekilen` sırasına hata + test; hata kurtarmada Kız seçim durumu temizleniyor. Bırakılanlar: bot çekmeden/takastan sonra hemen tekrar oynayacakmış gibi hesaplıyor (6.6 sırayı başkasına verebilir; bilerek sade); Kız'ın ortaya düşme ara durumu `kartsiz()` ile benzer kodu tekrarlıyor.
  - **Kurallar (kullanıcı onayı):** 8 ile aynı oynanış; avucu boş olandan ve kendinden çekme yok; Mut'ta Kız varken çekme serbest; bloklanamaz; sıra 6.6. Kurulu kalkanımdaki 2 çekilirse: avucumda başka 2 kalmadıysa kalkan sökülür (mevcut kural), kaldıysa kalkan kurulu kalır. 2 çekersem kalkan belirir ama kurulu olmaz.
  - **Motor:** `cek` hamlesi (`hedef`; isteğe bağlı `cekilen` = hedefin avucundaki sıra, yoksa tohumlu rastgele). Çekilen kart çekenin avucunun sonuna eklenir. `sonHamle.cekme = { hedef, kart }`.
  - **Akıllı bot:** her rakipte gelebilecek her kartla en iyi sonraki hamleyi dener, ortalamaya bakar; şimdikinden 10 puan iyiyse çeker (`GUC_ESIGI`, takasla ortak).
  - **Karar (2026-10-24, arkadaş denemesinden sonra):** Çekilen kartı sadece çeken ve kartı kaybeden görür, **üçüncü oyuncu görmez** (Aşama 2'de uygulanacak).
  - **Ekran (kullanıcının fikri: kahvedeki "hangisini çekecek" gerilimi):** Kız'ı bir avucun ya da isim etiketinin üstüne bırakınca çekme. Kız ortaya düşer, hedefin avucu ters döner ve sırası **gerçekten** karılır (ekranda `avucuKar`: kartlar iki kez ortada toplanıp açılır). Çeken ters kartlara **dokunup kaldırır**, başka karta dokununca o kalkar (kararsız kalabilir). Kartı **kendi avucuna (ya da isim etiketine) sürükleyince alır**; başka yere bırakırsa kart geri döner. Alınan kart gerçekten o yerdeki karttır (`cekilecekKart` sırayı motora `cekilen` olarak verir). Kart bırakıldığı yerden çekene uçar, hedefin avucu eski sırasıyla açılır. Bot çekerken bir kartı kaldırır, yarı ihtimalle başkasına geçer, sonra alır. Botlar kapalıyken botun yerine kullanıcı seçer. Süre yok (süre konusu en son konuşulacak). Hedef bensem kaldırılmış kartım iner.
  - **Aşama 2 için:** Kartı çekilen oyuncu, çekenin hangi kartını kaldırdığını kendi ekranında canlı görür (göz göze gelmenin yerine); isterse tepki/hazır söz. "Kartı öne itme" (yem) fikri kahve testinden sonra düşünülecek.
  - **"Kız dene":** avucumda Kız-4-5-6, Mut kartlarında 9, sağdaki B'de sadece iki 9 (`denemeKur`'a `mut` ve `eksik` seçenekleri eklendi), soldaki C dolu. Kız ortaya düşünce üstünü kapattığı için 9 ortada değil Mut'ta.
  - **"Bot Kız dene":** sırası soldaki C'de, C'nin elinde Kız; avucumda üç 9, Mut kartlarında 9 → C benden çeker (tarayıcıda denendi, çalışıyor).
  - Kart arkasında soluk "MUT" yazısı denendi, kullanıcı beğenmedi, kaldırıldı (2026-10-21).
- **4f 8 / takas yapıldı — 2026-10-21 (kullanıcı testinden geçti):**
  - **Kurallar:** 8'i **orta yığına** bırakmak = normal oyun (eşleşme/seri olursa yakalama). 8'i bir oyuncunun **avucunun ya da isim etiketinin** üstüne bırakmak = takas; 8 ortaya düşer, eşleşme ve seri olmaz (pencere yok, oyuncu bırakacağı yerle seçer). Herkesle takas yapılır, **avucu boş olanla da**; son kartı 8 olan da takas yapabilir (kahvede oluyor). **Mut'ta 8 varken** ortaya atmak yasak ama takas serbest; Mut 8 yerinde kalır. Bloklanamaz. Sıra 6.6 ile. Avucum takasla değişince kurulu kalkan sökülür.
  - **Motor:** `takas` hamlesi (`hedef` = avucu alınan oyuncu; `sonHamle.takas` ekrana bildirir). **Akıllı bot:** takastan sonraki en iyi hamlesi şimdikinden 10 puan iyiyse takas yapar (`TAKAS_ESIGI`, bot rakip avuçlarını görüyor).
  - **Ekran:** önce 8 ortaya düşer, sonra iki avuç yer değiştirir. Sürüklemede sürüklenen kartın kendi avucu hedef sayılmaz. Dene menüsünde **"8 dene"**: avucumda 8-4-5-6, sağdaki B'de 8 ve 2, ortada 9 (takastan sonra B'den gelen 8, ortaya düşen 8'i yakalar; 2 sana geçer, kalkan belirir).
  - Bot seninle kendiliğinden takas yaptığında kalkan sökme ekranda kurulup denenmedi (kod ve otomatik testler var); normal oyunda denk gelirse bakılır.
- **`/code-review` yapıldı (2026-10-21, 8 bitince):** hata çıkmadı; dört temizlik yapıldı (botta gereksiz kopya ve çift hesap, ekranda tekrarlanan ara durum kodu `kartsiz()`, blok penceresinde takas olmadığını sınayan test).
- **4b seri (orta yığın) yapıldı — 2026-10-21:** Orta yığının üstündeki sıralı kartlar + atılan kart (en az 3) sıradakinin ceza yığınına gider; yakalama gibi zorunlu. Mut kartıyla eşleşen kart, ortada seri oluşturuyorsa ortaya da atılabilir (oyuncu seçer). Papaz'dan As'a dönmez. Akıllı bot hamleleri deneyerek seçtiği için seriyi kendiliğinden kullanır. Kullanıcı testinden geçti.
- **4c seri (ceza yığınları) yapıldı — 2026-10-21:** Kendi yığınını boşaltma, üstüne yığ (herkese) ve al-ilerlet (sıradakinden) eşleşmenin yanında seriyle de yapılır; sadece üstteki sıralı kartlar gider (4-4-5 üstüne 6 → üstteki 4-5-6). Test menüsünde **"Ceza serisi dene"**: herkesin yığınında 4-5-6, avucumda üç 7. Botlar seriyi kendiliğinden kullanıp zincirliyor. Kullanıcı testinden geçti.
- **"Üstüne yığ"ın adı "Ekle" oldu (kullanıcı kararı, 2026-10-21).** Ekranda "Ekle / İlerlet"; kodda hamle tipi `ekle`.
- **4d blok (2a) yapıldı — 2026-10-21:** Ceza yığınına kart gelen oyuncunun avucunda 2 varsa **blok penceresi** açılır (`Durum.blok`; sıra pencere boyunca hedefte). Hedef 2 ile bloklar (kartlar hamleyi yapana döner, 2 altlarına girer) ya da kabul eder; zincir blok çalışıyor. Pencere kapanınca sıra 6.6 ile. Ekran: hedef bensem kalkan yanıp söner (dokununca blok), avucun üstünde 3 sn'lik süre çubuğu + "Kabul"; süre bitince kendiliğinden kabul. 2'yi kendi ceza yığınına sürüklemek de blok yapar. Bot hedefse ve botlar kendi oynuyorsa bot hemen karar verir (akıllı bot neredeyse her zaman bloklar); botlar kapalıyken botun yerine kullanıcı karar verir ("Kabul (Bot B)"). Test menüsünde **"Blok dene"**: C ortadaki 9'u yakalayıp bana yollar, bende iki 2, C'de bir 2 (zincir). Otomatik testlerden ve tarayıcıda zincir/süre denemesinden geçti.
  - Şimdilik pencere sadece hedefin 2'si varsa açılıyor. PROJE.md 6.5.1'e göre her gönderimde açılmalı (kimde 2 olduğu belli olmasın); bu, herkesin kendi telefonundan oynadığı aşamada yapılacak.
  - Kullanıcı testinden geçti.
- **4e kalkanı kurmak (2b) yapıldı — 2026-10-21:** Saldırı yokken kalkana dokununca kurulur (dolu mavi + halka), tekrar dokununca sökülür. Kurulu kalkan pencere açılınca 0,3 sn parlayıp 2'yi kendiliğinden oynar (önce rastgele anda oynuyordu; kullanıcı "beklemeye gerek yok" dedi, 2026-10-21). Benim bir sonraki hamlemde, 2 kullanılınca ya da avucumda 2 kalmayınca sökülür (8 takası gelince de sökülecek). Kurma hareketi: tek dokunuş (uzun basma gerekmedi). Durum sadece ekranda (`kalkanKurulu`), motorda değil. Blok penceresinde hedef kart atarsa kabul sayılır (bkz. 6.5.1). Kullanıcı testinden geçti.
  - Ek süre düğmesi herkes kendi telefonundan oynarken (Aşama 2) yapılacak.
- **Test ve Dene menüleri (2026-10-21):** Sağ altta iki düğme: **Test** (ayarlar, iki sütun) ve solunda **Dene** (iki sütun, 2026-10-21'den beri; tek sütunda masadan taşıyordu. Yeni oyun, Seri dene, Ceza serisi dene, Blok dene; seçince menü kapanır). Dışarı basınca kapanırlar. Ayarlar tarayıcıda saklanır (F5'te kaybolmaz). **"Seri dene"** düğmesi: ortada 4-5, avucumda 6 ve 3 hazır yeni el (`src\oyun\deneme.ts`; masaya konan kartlar desteden eksilir, son tur eksik dağıtılır — motor kısa desteyi kaldırır). Her yeni özel kart için aynı yöntemle "… dene" düğmesi eklenecek.
- **4a (altyapı) yapıldı — 2026-10-21:** Motor her hamlenin sonucunu `Durum.sonHamle` içine yazar (oyuncu, oynanan kart, eşleşen kartlar, nereden, nereye); dağıtılan kartların sırası `Durum.dagitim`. Ekran (`Masa.tsx`) eşleşmeyi ve dağıtım sırasını artık kendisi hesaplamıyor, bunları okuyor; sıradaki için motorun `sonraki()`'si; yakalamada kartın inişi `gec()`in `ekUcus` seçeneğiyle. Testler + tarayıcıda otomatik bir el oynatıldı, hata yok; sonraki testlerde oyun sorunsuz oynandı.
- **3. adımda yapılanlar (2026-10-20):**
  - **3a** Ekran motora bağlandı (`ornekDurum.ts` silindi). El sonu puan kağıdı kendiliğinden açılır + "Sonraki el"; oyun sonu kazanan/berabere + "Yeni oyun".
  - **3b** Sürükle-bırak: orta yığın, Mut kartı (aynı sayıysa), kendi ceza yığını, sıradakinin ceza yığını. Geçersizse kart sessizce döner; dokununca kart kalkar. Rakip ceza yığınına bırakınca yanında **"Üstüne yığ" / "İlerlet"** düğmeleri. Kullanıcı testinden geçti.
  - **3c** "Botlar kendi oynasın" kapalıyken sırası gelen botun kartları elle oynanır (kurallar o botun gözünden). "Sen" koltuğunu her zaman kullanıcı oynar. Kendi testlerimden geçti; kullanıcı testinden geçti (2026-10-22).
  - **3e** Animasyonlar (`src\ekran\animasyon.tsx`): her geçişte kartların eski/yeni yeri ölçülür, yer değiştirenler uçar. Bot önce kartını kaldırır; yakalamada kart eşleştiği yere iner, duraklar, eşleşenlerle birlikte uçar; tur başında dağıtım, el sonunda kartlar desteye toplanır. Ceza puanı değişince parlar (kullanıcı: aç/kapa olmasın, gerekirse kaldırılır). Kullanıcı testinden geçti.
  - **Akıllı bot** (`src\oyun\bot.ts`, `akilliBotHamlesi`): her hamleyi dener, rakiplere giden puan − kendi ceza artışı en yüksek olanı seçer; yakalama yoksa en az puanlı kartı ortaya atar. Bilerek sade (kullanıcı: "kodlara boğma, testlerde iş görsün, hamle kaçırmasın"). Rastgele botlara karşı 100 oyunda %60 kazanıyor (şans %33). Ekrandaki botlar bunu kullanır; ekransız simülasyon rastgele botla.
  - **3d ertelendi:** 4 kişilik masa ekranı yapılmıyor; oyun %95 3 kişi oynanacak. Motor 4 kişiyi destekliyor. Konuşulan düzenler: A) Mut kartları orta yığının yanına iner, üst oyuncu üst kenara oturur (öneri); B) Mut üstte kalır, üst oyuncu üstünde ince şerit; C) Mut kartları köşeye küçülür. Gerekirse Test menüsünde denenip seçilecek. El sayısı 10; asıl başlangıç ekranı 5. adımda.
  - `/code-review` yapıldı: kilitlenme, eski ceza seçimi, sürüklenen bot kartının altta kalması düzeltildi; kalanlar "Sıradaki iş"te. Önemsiz bırakılanlar: akıllı bot her aday için tüm durumu kopyalıyor; uçuş zamanlayıcısı ekran kapanınca temizlenmiyor.
- **Test menüsünde kararı bekleyenler:** "Animasyon hızı" (Hızlı/Orta/Yavaş), "Yakalamada duraklama" (Kısa 0,25 / Uzun 0,6 sn), "Bot hızı" (Çok hızlı 0,1 / Hızlı 0,4 / Orta 1 / Yavaş 2 sn), bot kartlarının görünüm anahtarları. Kullanıcı şimdilik hepsini tutmak istedi.
- **Sonra bakılacak (kullanıcı istekleri):**
  - (Yapıldı 2026-10-21, bkz. 4l) Ceza yığınlarında sadece üst kart görünüyor; üstte aynı sayıdan kaç kart olduğu (örn. sağda kaç 10, bende kaç 8) ve alttaki kart hemen anlaşılmıyor. Bu oyunda kritik (eşleştirme, beton, kilitli dörtlü). Seçenekler Test menüsünde denenecek (örn. üstteki aynı kartları kaydırarak göstermek, sayı rozeti).
  - Sıra bendeyken avucun altındaki sarı ışık çizgisini kullanıcı beğenmedi; yeni görünüm seçenekleri denenecek.
  - Animasyon cilası: avuçtan kart gidince boşluğun yumuşak kapanması, orta yığın ve Mut kartlarının birden kayması.
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
7. ❓ **Bombayı ceza yığınıyla göndermek (kullanıcı hatırladı 2026-10-23; arkadaşlarla konuşulacak, ilk sürümde YOK, şimdiki hali kalıyor):** Bomba sahibi kendi ceza yığınını boşaltırsa (örn. yığında 5, avuçta 5 → sıradakine) bomba da kartlarla birlikte gider. Açık sorular (Claude önerisi parantezde):
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
  - **Kullanıcının listesi (2026-10-23, kahvenin kendi lafları, aynen kalsın):** "Çok saçma kendime sokamıyom!", "Tost oldu.", "Beton döktü.", "Şimdi ben kızı aldım {isim} soktum." (isim seçilir: Tahir'e / Uğur'a / Mert'e; basınca masadaki oyunculardan biri seçilir, ek doğru çekilir), "Üstüne kapatma göt!". Liste büyüyecek. **Kaba ilk sürüm yapıldı (2026-10-23, arkadaşlara göstermek için):** sol alttaki konuşma düğmesi söz panelini açar, Kız sözünde isim seçilir; söz 3 sn balon olarak görünür (ben: ceza yığınımın üstü, botlar: isim etiketinin yanı). **Botlar ve bota düşen oyuncu konuşmaz** (kullanıcı 2026-10-24; eskiden botlar arada kendiliğinden söz yolluyordu, kaldırıldı) (`Masa.tsx` HAZIR_SOZLER). Yazı kutusu, ses ve herkese gitmesi 2. aşamada.
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
