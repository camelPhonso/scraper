require("dotenv").config()
const request = require("request-promise")
const cheerio = require("cheerio")
const fs = require("fs")
const path = require("path")

const baseURL = process.env.BASE_URL

const userAgent =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36"

// define crawler
request(baseURL)
  .then(html => {
    const element = cheerio.load(html)

    // find all link elements
    element("a").each((index, target) => {
      const link = element(target).attr("href")
      if (link.endsWith("/locateschool/schoolsearch")) {
        const searchURL = new URL(link, baseURL).toString()
        try {
          request({
            url: searchURL,
            method: "GET",
            headers: {
              "User-Agent": userAgent,
            },
          })
          console.log(searchURL)
        } catch (error) {
          console.error(`Could not navigate to search page!!: ${error}`)
        }
      }
      try {
        const link = element(target).attr("href")
        if (link.endsWith("pdf")) {
          const pdfURL = new URL(link, baseURL).toString()
          const pdfFileName = path.basename(pdfURL)
          const pdfPath = path.join(__dirname, "downloads", pdfFileName)

          request(
            {
              url: baseURL,
              method: "GET",
              headers: { "User-Agent": userAgent },
            },
            { uri: pdfURL, encoding: null }
          )
            .then(pdfData => {
              fs.writeFileSync(pdfPath, pdfData)
              console.log(`Downloaded ${pdfFileName}`)
            })
            .catch(error =>
              console.error(`Error downloading ${pdfFileName}: ${error}`)
            )
        }
      } catch (error) {
        console.error(`Error processing a link: ${error}`)
      }
    })
  })
  .catch(error => {
    console.error(`Error fetching website: ${error}`)
  })
