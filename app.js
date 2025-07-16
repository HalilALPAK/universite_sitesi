// Excel dosyalarını 'excels' klasörüne koymalısınız. Eğer yoksa, proje kök dizininde 'excels' klasörü oluşturun.
const express = require('express');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const cors = require('cors');

const app = express();
const excelFolder = path.join(__dirname, 'excels'); // Excel dosyalarının olduğu klasör
const yerlerFolder = path.join(__dirname, 'yerler'); // Yurt ve konum excelleri

app.use(cors());

// Üniversite adı, şehir ve türü ayıran fonksiyon
function parseUniversityInfo(str) {
  // Örnek: "ACIBADEM MEHMET ALİ AYDINLAR ÜNİVERSİTESİ  (İSTANBUL) (VAKIF)"
  const match = str.match(/^(.*?)\s*\((.*?)\)\s*\((.*?)\)$/);
  if (match) {
    return {
      universite_adi: match[1].trim(),
      sehir: match[2].trim(),
      tur: match[3].trim(),
    };
  }
  return { universite_adi: str, sehir: '-', tur: '-' };
}

// Bölüm satırını ayrıştıran fonksiyon
function parseBolumRow(row) {
  // Üniversite adı, şehir ve türü ilk sütundan ayır
  const { universite_adi, sehir, tur } = parseUniversityInfo(row[0] || '');

  // Çoklu satırları diziye çevir
  function splitCell(cell) {
    if (!cell) return [];
    return String(cell).split(/\r?\n/).map(s => s.trim());
  }

  // Her yıl için ilgili değeri al
  const kontenjanlar = splitCell(row[3]);
  const taban_puanlar = splitCell(row[4]);
  const basari_sirasi = splitCell(row[5]);

  return {
    universite_adi,
    sehir,
    tur,
    bolum_adi: row[1] || '',
    puan_turu: row[2] || '',
    kontenjanlar: {
      '2023': kontenjanlar[0] || '',
      '2022': kontenjanlar[1] || '',
      '2021': kontenjanlar[2] || '',
      '2020': kontenjanlar[3] || '',
    },
    taban_puan: {
      '2023': taban_puanlar[0] || '',
      '2022': taban_puanlar[1] || '',
      '2021': taban_puanlar[2] || '',
      '2020': taban_puanlar[3] || '',
    },
    basari_sirasi: {
      '2023': basari_sirasi[0] || '',
      '2022': basari_sirasi[1] || '',
      '2021': basari_sirasi[2] || '',
      '2020': basari_sirasi[3] || '',
    }
  };
}

// Yurt ve konum verisini oku
function getYerlerForUniversity(universite_adi) {
  // Dosya adını normalize et (küçük harf, tire, vs.)
  const fileName = fs.readdirSync(yerlerFolder).find(f =>
    f.toLowerCase().includes(
      universite_adi
        .toLowerCase()
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/ğ/g, 'g')
        .replace(/ /g, '-')
    )
  );
  if (!fileName) return null;
  const filePath = path.join(yerlerFolder, fileName);
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
  if (rows.length < 2) return null;

  // Başlık satırlarını bul
  const headers = rows[0];
  const uniEnIdx = headers.findIndex(h => h.toLowerCase().includes('üniversite en'));
  const uniBoyIdx = headers.findIndex(h => h.toLowerCase().includes('üniversite boy'));
  const yurtAdIdx = headers.findIndex(h => h.toLowerCase().includes('yurdu adı'));
  const yurtEnIdx = headers.findIndex(h => h.toLowerCase().includes('yurdu en'));
  const yurtBoyIdx = headers.findIndex(h => h.toLowerCase().includes('yurdu boy'));

  // Üniversite konumu
  const uniRow = rows[1];
  const konum = (uniEnIdx > -1 && uniBoyIdx > -1)
    ? {
        lat: parseFloat(uniRow[uniEnIdx]),
        lng: parseFloat(uniRow[uniBoyIdx])
      }
    : null;

  // Yurtlar
  const yurtlar = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (
      yurtAdIdx > -1 && yurtEnIdx > -1 && yurtBoyIdx > -1 &&
      row[yurtAdIdx] && row[yurtEnIdx] && row[yurtBoyIdx]
    ) {
      yurtlar.push({
        ad: row[yurtAdIdx],
        lat: parseFloat(row[yurtEnIdx]),
        lng: parseFloat(row[yurtBoyIdx])
      });
    }
  }
  return { konum, yurtlar };
}

// Üniversiteleri ve bölümleri gruplu dönen endpoint
app.get('/universiteler', (req, res) => {
  try {
    const { sehir } = req.query;
    const files = fs.readdirSync(excelFolder);
    const excelFiles = files.filter(file => file.endsWith('.xlsx') || file.endsWith('.xls'));
    let universityMap = {};

    for (const file of excelFiles) {
      const filePath = path.join(excelFolder, file);
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
      if (rows.length < 2) continue;

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length < 2) continue;
        if (typeof row[0] === 'string' && row[0].includes('Tabloda puanı ve sıralaması olmayıp çizgiyle (—) ifade edilen bölümler')) {
          break;
        }
        const bolum = parseBolumRow(row);
        // Şehir filtresi uygula
        if (sehir && bolum.sehir.toLowerCase() !== sehir.toLowerCase()) continue;
        const key = bolum.universite_adi + '|' + bolum.sehir + '|' + bolum.tur;
        if (!universityMap[key]) {
          universityMap[key] = {
            universite_adi: bolum.universite_adi,
            sehir: bolum.sehir,
            tur: bolum.tur,
            bolumler: [],
          };
        }
        universityMap[key].bolumler.push({
          bolum_adi: bolum.bolum_adi,
          puan_turu: bolum.puan_turu,
          kontenjanlar: bolum.kontenjanlar,
          taban_puan: bolum.taban_puan,
          basari_sirasi: bolum.basari_sirasi,
        });
      }
    }
    // Sonuçları diziye çevir ve bölüm sayısı ekle
    const universities = Object.values(universityMap).map(u => {
      // Yurt ve konum verisi ekle
      const yerler = getYerlerForUniversity(u.universite_adi);
      return {
        universite_adi: u.universite_adi,
        sehir: u.sehir,
        tur: u.tur,
        bolum_sayisi: u.bolumler.length,
        bolumler: u.bolumler,
        konum: yerler ? yerler.konum : null,
        yurtlar: yerler ? yerler.yurtlar : [],
        year: '-',
        studentCount: null,
        facultyCount: null,
        description: '',
        image: '',
        rating: 0,
        reviewCount: 0,
        address: '',
        phone: '',
        website: ''
      };
    });
    res.json(universities);
  } catch (err) {
    res.status(500).send('Bir hata oluştu: ' + err.message);
  }
});

app.get('/read-excels', (req, res) => {
  try {
    const files = fs.readdirSync(excelFolder);
    const excelFiles = files.filter(file => file.endsWith('.xlsx') || file.endsWith('.xls'));
    let allData = [];

    for (const file of excelFiles) {
      const filePath = path.join(excelFolder, file);
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      allData = allData.concat(data);
    }

    res.json(allData);
  } catch (err) {
    res.status(500).send('Bir hata oluştu: ' + err.message);
  }
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
}); 