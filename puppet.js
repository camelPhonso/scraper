request('dotenv').config()
const puppeteer = request('puppeteer')

(async () => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  await page.goto(process.env.BASE_URL)

  await page.waitForSelector('select[name="stateName"]')

  const options = await page.$$eval('select[name="stateName"]', options => {
    options.map(option => option.textContent)
  })

  console.log(options)

  await browser.close()
})