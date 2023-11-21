require("dotenv").config()

const request = require("request-promise")
const cheerio = require("cheerio")
const puppeteer = require("puppeteer")
const fs = require("fs")
const path = require("path")

const baseURL = process.env.BASE_URL

const userAgent =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36"
// define crawler
request(baseURL)
  .then(html => {
    const $ = cheerio.load(html)

    // find all link elements
    // element("a").each((index, target) => {
    //   try {
    //     const link = element(target).attr("href")
    //     if (link.endsWith("pdf")) {
    //       console.dir(link)
    //       const pdfURL = new URL(link, baseURL).toString()
    //       const pdfFileName = path.basename(pdfURL)
    //       const pdfPath = path.join(__dirname, "downloads", pdfFileName)

    //       request(
    //         {
    //           url: baseURL,
    //           method: "GET",
    //           headers: { "User-Agent": userAgent },
    //         },
    //         { uri: pdfURL, encoding: null }
    //       )
    //         .then(pdfData => {
    //           fs.writeFileSync(pdfPath, pdfData)
    //           console.log(`Downloaded ${pdfFileName}`)
    //         })
    //         .catch(error =>
    //           console.error(`Error downloading ${pdfFileName}: ${error}`)
    //         )
    //     }
    //   } catch (error) {
    //     console.error(`Error processing a link: ${error}`)
    //   }
    // })
  })
  .catch(error => {
    console.error(`Error fetching website: ${error}`)
  })
