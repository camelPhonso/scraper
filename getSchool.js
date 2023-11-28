require("dotenv").config()

const requestCookie = process.env.COOKIE
const baseURL = process.env.BASE_URL
const { getStates, updateStates } = require("../scraper/model/states.js")

const statesJSON = getStates(2)
const states = JSON.parse(statesJSON.states_file)

const requestVelocity = 1000

// fetch array of schools for each block
const staggeredSchoolFetch = async (stateId, givenBlock) => {
  const givenDistrictName = givenBlock.districtId
  const givenBlockName = givenBlock.eduBlockId

  const options = {
    method: "POST",
    headers: {
      cookie: requestCookie,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "insomnia/8.3.0",
    },
    body: new URLSearchParams({
      stateName: stateId, // needs to be drilled
      districtName: givenDistrictName,
      blockName: givenBlockName,
      villageId: "",
      clusterId: "",
      categoryName: "0",
      managementName: "0",
      Search: "search",
    }),
  }

  try {
    const response = await fetch(
      `${baseURL}/locateSchool/searchSchool`,
      options
    )
    const jsonResponse = await response.json()
    const schoolList = jsonResponse.list

    const updatedBlock = {
      ...givenBlock,
      schoolList,
    }

    console.log(
      "\u001b[32m",
      `Fetched ${schoolList.length} schools from ${updatedBlock.eduBlockName}`
    )

    return updatedBlock
  } catch (error) {
    console.error(
      `Error fetching schools from ${givenBlock.eduBlockName}: ${error}`
    )
  }
}

// drill the stateId from a district to it's blocks and call staggeredSchoolFetch
const processBlocks = async currentDistrict => {
  try {
    const newBlocks = []
    const stateId = currentDistrict.stateId

    const processSingleBlock = async index => {
      if (index >= currentDistrict.blocks?.length) {
        const updatedDistrict = {
          ...currentDistrict,
          blocks: newBlocks,
        }
        return updatedDistrict
      }
      const block = currentDistrict.blocks[index]

      try {
        const processedBlock = await staggeredSchoolFetch(stateId, block)
        newBlocks.push(processedBlock)

        const result = await new Promise(resolve => {
          setTimeout(async () => {
            const result = await processSingleBlock(index + 1)
            resolve(result)
          }, requestVelocity)
        })
        return result
      } catch (error) {
        console.error(`Error processing a block: ${error}`)
        throw error
      }
    }
    return processSingleBlock(0)
  } catch (error) {
    console.error(`Error processing a district: ${error}`)
    throw error
  }
}

const testState = states.filter(state => state.stateId === 135)
const testDistrict = testState[0].districts[0]
const testBlock = testState[0].districts[0]?.blocks[0]

// staggeredSchoolFetch(testState.stateId, testBlock)
// processBlocks(testDistrict)
