# Üniversiteler ve Yerler Web Kazıma ve Arayüz Projesi

Bu proje, çeşitli üniversiteler ve yerler hakkında verileri web kazıma (scraping) yöntemiyle toplayan bir backend ile, bu verileri kullanıcıya sunan bir React tabanlı frontend arayüzünden oluşmaktadır.

## Proje Yapısı

- **Backend:** Web kazıma işlemleri ve API servisleri

  - `app-universiteler.js`: Üniversitelerle ilgili verileri web sitelerinden kazıyarak toplar ve sunar.
  - `app-yerler.js`: Yerlerle ilgili verileri web sitelerinden kazıyarak toplar ve sunar.
  - `app.js`: Backend sunucusunun ana dosyasıdır, API uç noktalarını yönetir.

- **Frontend:** React ile geliştirilmiş kullanıcı arayüzü
  - `frontend/` klasörü altında yer alır.
  - Kullanıcılar üniversite ve yerler hakkında detaylı bilgiye ulaşabilir.

## Backend (Web Kazıma)

Backend kısmında, belirli web sitelerinden üniversiteler ve yerler hakkında veri çekmek için web kazıma teknikleri kullanılmıştır. Kazınan veriler, bir API aracılığıyla frontend'e sunulmaktadır. Backend Node.js ile yazılmıştır ve ilgili dosyalar proje kök dizinindedir.

## Frontend (React Arayüz)

Frontend, React ile geliştirilmiştir ve `frontend/` klasöründe yer almaktadır. Kullanıcılar, kazınan verileri modern ve kullanıcı dostu bir arayüzde görüntüleyebilir. Arayüzde üniversiteler listelenir, detaylar modal pencerede gösterilir.

## Kurulum ve Çalıştırma

### Backend

1. Gerekli bağımlılıkları yükleyin:
   ```bash
   npm install
   ```
2. Backend sunucusunu başlatın:
   ```bash
   node app.js
   ```

### Frontend

1. `frontend/` dizinine gidin:
   ```bash
   cd frontend
   ```
2. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```
3. Geliştirme sunucusunu başlatın:
   ```bash
   npm start
   ```
4. Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açarak uygulamayı görüntüleyebilirsiniz.

## Kullanılabilir Komutlar (Frontend)

- `npm start`: Uygulamayı geliştirme modunda başlatır.
- `npm test`: Testleri çalıştırır.
- `npm run build`: Üretim için derleme yapar.
- `npm run eject`: Yapılandırmayı dışa aktırır (geri alınamaz).

## Ek Bilgiler

- Web kazıma işlemleriyle ilgili detaylar ve kullanılan siteler, ilgili backend dosyalarında açıklanmıştır.
- Frontend React ile oluşturulmuş olup, bileşenler ve stiller `src/` klasöründe yer almaktadır.

Daha fazla bilgi için ilgili dosyaları inceleyebilir veya [React dokümantasyonuna](https://reactjs.org/) göz atabilirsiniz.
