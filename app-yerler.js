const express = require('express');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const cors = require('cors');

const app = express();
const yerlerFolder = path.join(__dirname, 'yerler');

app.use(cors());

function normalizeName(name) {
  return name
    .toLowerCase()
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

app.get('/yerler', (req, res) => {
  try {
    const files = fs.readdirSync(yerlerFolder);
    const excelFiles = files.filter(file => file.endsWith('.xlsx') || file.endsWith('.xls'));
    let yerlerList = [];

    for (const file of excelFiles) {
      const filePath = path.join(yerlerFolder, file);
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
      if (rows.length < 2) continue;

      const headers = rows[0];
      const uniAdIdx = headers.findIndex(h => h.toLowerCase().includes('üniversite'));
      const uniEnIdx = headers.findIndex(h => h.toLowerCase().includes('üniversite en'));
      const uniBoyIdx = headers.findIndex(h => h.toLowerCase().includes('üniversite boy'));
      const yurtAdIdx = headers.findIndex(h => h.toLowerCase().includes('yurdu adı'));
      const yurtEnIdx = headers.findIndex(h => h.toLowerCase().includes('yurdu en'));
      const yurtBoyIdx = headers.findIndex(h => h.toLowerCase().includes('yurdu boy'));

      const uniRow = rows[1];
      const universite_adi = uniAdIdx > -1 ? uniRow[uniAdIdx] : file.replace(/_KYK_Yurtlari.*$/, '').replace(/-/g, ' ');
      const konum = (uniEnIdx > -1 && uniBoyIdx > -1)
        ? {
            lat: parseFloat(uniRow[uniEnIdx]),
            lng: parseFloat(uniRow[uniBoyIdx])
          }
        : null;

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
      yerlerList.push({
        universite_adi,
        normalized: normalizeName(universite_adi),
        konum,
        yurtlar
      });
    }
    res.json(yerlerList);
  } catch (err) {
    res.status(500).send('Bir hata oluştu: ' + err.message);
  }
});

app.listen(3001, () => {
  console.log('Yerler backend started on port 3001');
}); 