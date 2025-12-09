import { useState } from "react";
import {
  Alert,
  Button,
  Card,
  Container,
  FileInput,
  Group,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { saveAs } from "file-saver";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseWorkbook = async (selectedFile: File) => {
    setIsParsing(true);
    setError(null);

    try {
      const excelModule = await import("exceljs");
      const ExcelJS = excelModule.default ?? excelModule;
      const inbook = new ExcelJS.Workbook();

      //setup output workbook
      const outbook = new ExcelJS.Workbook();
      const outsheet = outbook.addWorksheet("Job Journal");
      outsheet.addRow([
        "Line Type",
        "Posting Date",
        "Document No.",
        "Job No.",
        "Job Task No.",
        "Type	No.",
        "Resourcetype",
        "Description",
        "Location Code",
        "Bin Code",
        "Work Type Code",
        "EV Piece Work Code",
        "Unit of Measure Code",
        "Quantity",
        "Unit Cost",
        "Unit Cost (LCY)",
        "Total Cost",
        "Total Cost (LCY)",
        "Unit Price",
        "Line Amount",
        "Line Discount Amount",
        "Line Discount %",
        "Applies-to Entry",
      ]);

      const isCsv =
        selectedFile.name?.toLowerCase().endsWith(".csv") ||
        selectedFile.type === "text/csv";

      if (isCsv) {
        const text = await selectedFile.text();
        const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "");
        if (lines.length) {
          const worksheet = inbook.addWorksheet(
            selectedFile.name.replace(/\.[^/.]+$/, "") || "CSV"
          );
          lines.forEach((line) => {
            const cells = line.split(",").map((cell) => cell.trim());
            worksheet.addRow(cells);
          });
        }
      } else {
        const buffer = await selectedFile.arrayBuffer();
        await inbook.xlsx.load(buffer);
      }

      const insheet = inbook.worksheets[0];
      insheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        if (rowNumber === 1) return;
        outsheet.addRow([
          '',
          row.getCell(14).value ?? '',
          '',
          '',
          '',
          "Item",
          row.getCell(4).value ?? '',
          '',
          '',
          'NEW',
          '',
          '',
          '',
          '',
          row.getCell(10).value ?? '',
        ]);
      });
      const buffer = await outbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, "job-journal.xlsx");

    } catch (parseError) {
      console.error(parseError);
      setError(
        "Unable to read the file. Please confirm it is a valid .xlsx, .xls, or .csv file."
      );
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="md">
        <div>
          <Title order={1}>Upload spreadsheet data</Title>
          <Text c="dimmed" size="sm">
            Select an Excel workbook or CSV to preview its sheets using ExcelJS.
            The first row is treated as the header.
          </Text>
        </div>

        <Card withBorder radius="md" shadow="sm" p="lg">
          <Stack gap="sm">
            <FileInput
              label="Spreadsheet file"
              placeholder="Choose a .xlsx, .xls, or .csv file"
              accept=".xlsx,.xls,.csv"
              clearable
              value={file}
              onChange={(selectedFile) => {
                setFile(selectedFile);
                setError(null);
              }}
            />

            <Group justify="space-between" align="center">
              <Text size="sm" c="dimmed">
                Upload a workbook or CSV to start parsing. Data remains in your
                browser.
              </Text>
              <Button
                disabled={!file || isParsing}
                loading={isParsing}
                onClick={() => file && parseWorkbook(file)}
              >
                Process file
              </Button>
            </Group>

            {error && (
              <Alert color="red" title="Could not load file">
                {error}
              </Alert>
            )}
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}
