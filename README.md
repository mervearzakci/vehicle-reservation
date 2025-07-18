# Araç Rezervasyon Sistemi

Bu proje, şirketler için araç ve şoför rezervasyonlarını yönetebileceğiniz modern, tam özellikli bir web uygulamasıdır.

## Özellikler
- Kullanıcı, şirket ve admin yönetimi
- Araç ve şoför ekleme
- Rezervasyon oluşturma ve geçmişi görüntüleme
- Bildirim sistemi (panel ve e-posta)
- Yetkilendirme ve rol tabanlı erişim (Admin, Şirket, Sürücü)
- Modern ve mobil uyumlu arayüz

## Teknolojiler
- **Frontend:** React, Material UI
- **Backend:** ASP.NET Core 9, Entity Framework Core, Identity
- **Veritabanı:** SQLite
- **E-posta:** MailKit

## Kurulum
1. **Projeyi klonlayın:**
   ```sh
   git clone https://github.com/mervearzakci/vehicle-reservation.git
   cd vehicle-reservation
   ```
2. **Backend'i başlatın:**
   ```sh
   cd backend
   dotnet restore
   dotnet run
   ```
3. **Frontend'i başlatın:**
   ```sh
   cd ../frontend
   npm install
   npm start
   ```
4. **Uygulamayı açın:**
   - [http://localhost:3000](http://localhost:3000)

## Katkı Sağlama
Katkıda bulunmak isterseniz lütfen bir fork oluşturun, değişikliklerinizi bir branch'te yapın ve pull request gönderin.
