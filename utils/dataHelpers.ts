// Read Data from Excel and return as JSON
import * as XLSX from 'xlsx';

export function readExcelData(filePath: string, sheetName: string): any[] {
    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(worksheet);
}

// npm : Node Package Manager, used to manage dependencies and run scripts
// xlsx : A library to read/write Excel files in JavaScript/TypeScript