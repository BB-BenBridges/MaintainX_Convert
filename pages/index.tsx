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
import { Row } from "exceljs";

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
        "Posting Date",
        "Job No.",
        "Job Task No.",
        "Type",
        "No.",
        "Resourcetype",
        "Description",
        "Location Code",
        "Work Type Code",
        "Unit of Measure Code",
        "Quantity",
        "Unit Cost",
        "Total Cost",
        "Line Amount",
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
      const jobNoCache = new Map<string, string>();
      const rows: Row[] = [];
      insheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        if (rowNumber === 1) return;
        rows.push(row);
      });

      for (const row of rows) {
        outsheet.addRow([
          new Date(row.getCell(14).value as string).toLocaleDateString(),
          await getJobNo(row, jobNoCache),
          "",
          "Item",
          (row?.getCell(4)?.value as string ?? "").split(" - ")[0],
          "",
          "",
          "NEW",
          "",
          "PCS ",
          (row.getCell(10).value ?? "") as number * -1,
        ]);
      }
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

async function getJobNo(row: Row, cache: Map<string, string>) {
  const rawId = row.getCell(17).value;
  const id = rawId === null || rawId === undefined ? "" : String(rawId).trim();
  if (id) {
    const cached = cache.get(id);
    if (cached !== undefined) {
      return cached;
    }
    const workOrder = await fetch("/api/getWorkOrder?id=" + id).then((res) =>
      res.json()
    );

    if (workOrder.asset) {
      const jobNo = workOrder.asset.name.split(" - ")[0];
      cache.set(id, jobNo);
      return jobNo;
    } else if (workOrder.location && workOrder.location.name.includes(" - ")) {
      const jobNo = workOrder.location.name.split(" - ")[0];
      cache.set(id, jobNo);
      return jobNo;
    }
    const jobNo = "";
    cache.set(id, jobNo);
    return jobNo;
  }
  return "";
}
