const fs = require("fs")
const pdf = require("pdf-parse")
const excel = require("exceljs")
// const pdfJS = require("pdfjs-dist/es5/build/pdf")

const downloadedFiles = ["downloads/DS1_notes.pdf", "downloads/DS1.pdf"]

const workbook = new excel.Workbook()

const pdfPromises = downloadedFiles.map(filePath => {
  const worksheet = workbook.addWorksheet(
    `test_${filePath.slice(10).replace(".pdf", "_worksheet")}`
  )

  worksheet.columns = [
    {
      header: `first_column_${filePath
        .slice(10)
        .replace(".pdf", "_worksheet")}`,
      key: "one",
      width: 30,
    },
    // { header: "second column", key: "two", width: 15 },
  ]

  const dataBuffer = fs.readFileSync(filePath)

  return pdf(dataBuffer).then(data => {
    const text = data.text.split("\n")
    const headerRegex = /Who should complete form DS1/

    text.forEach(line => {
      if (headerRegex.test(line)) {
        worksheet.addRow({ one: line })
        console.log(line)
      }
    })
  })
})

Promise.all(pdfPromises).then(() => {
  workbook.xlsx
    .writeFile("output/testWorkbook.xlsx")
    .then(() => {
      console.log("Workbook saved!")
    })
    .catch(error => {
      console.error(`Error processing PDFs: ${error}`)
    })
})
