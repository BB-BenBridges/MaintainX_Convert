# MaintainX Convert

Small Next.js tool that converts an uploaded Excel/CSV file into a pre-formatted **Job Journal** workbook. Conversion runs entirely in the browser (ExcelJS + FileSaver), so your data never leaves your machine.

## Features
- Upload `.xlsx`, `.xls`, or `.csv` files and parse them client-side.
- Generates a new workbook with a single `Job Journal` sheet and standardized headers.
- Maps key fields from the first worksheet: Posting Date (column 14), Resource/Item number (column 4), Quantity (column 10); sets `Type` to `Item` and `Bin Code` to `NEW`.
- Skips the first row of the source data (treated as the header) and processes the rest.
- Built with Next.js 16, Mantine UI, and TypeScript.

## Requirements
- Node.js 18+ (matches Next.js 16 support matrix)
- Yarn, npm, pnpm, or bun for package management

## Getting Started
Install dependencies:
```bash
yarn install
# or npm install / pnpm install / bun install
```

Run the dev server:
```bash
yarn dev
```
Then open `http://localhost:3000`.

Other scripts:
- `yarn build` – production build
- `yarn start` – start the production server
- `yarn lint` – run ESLint

## Usage
1. Open the app and choose a spreadsheet (`.xlsx`, `.xls`, or `.csv`).
2. Click **Process file**. The app reads the first worksheet (or builds one from the CSV), ignores the header row, and writes rows into a new `Job Journal` sheet.
3. A file named `job-journal.xlsx` downloads automatically.

## Conversion details
- Headers written to the output sheet (in order): `Line Type`, `Posting Date`, `Document No.`, `Job No.`, `Job Task No.`, `Type No.`, `Resourcetype`, `Description`, `Location Code`, `Bin Code`, `Work Type Code`, `EV Piece Work Code`, `Unit of Measure Code`, `Quantity`, `Unit Cost`, `Unit Cost (LCY)`, `Total Cost`, `Total Cost (LCY)`, `Unit Price`, `Line Amount`, `Line Discount Amount`, `Line Discount %`, `Applies-to Entry`.
- For each data row (after the header):
  - `Posting Date` is taken from source column 14.
  - `Type` is set to `Item`.
  - `Resourcetype` is taken from source column 4.
  - `Bin Code` is set to `NEW`.
  - `Quantity` is taken from source column 10.
  - All other columns are left blank; extend `parseWorkbook` in `pages/index.tsx` to map more fields as needed.

## Tech stack
- Next.js 16 (Pages Router)
- Mantine Core 8
- ExcelJS for workbook parsing/writing
- FileSaver for client downloads
- TypeScript & ESLint

## Notes
- No backend: files are parsed in-memory in the browser.
- If you add new fields or change column mappings, update the `parseWorkbook` function in `pages/index.tsx` so the output aligns with your ERP import format.
