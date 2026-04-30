const XLSX = require('xlsx');
const workbook = XLSX.readFile('imgs/Smartphone Buyback Prices.xlsx');
const sheetName = 'Apple iPhones'; // User specified sheet name
const sheet = workbook.Sheets[sheetName] || workbook.Sheets[workbook.SheetNames[0]]; // Fallback to first sheet
console.log("Sheet Name:", sheetName);
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
if (data.length > 0) {
    console.log("Headers:", data[0]);
    console.log("First 3 rows:", data.slice(1, 4));
} else {
    console.log("Sheet is empty");
}
