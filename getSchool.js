require("dotenv").config()

const requestCookie = process.env.COOKIE
const baseURL = process.env.BASE_URL
const {getStates, updateStates} = require('../scraper/model/states.js')

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
      `Fetched ${jsonResponse.length} schools from ${updatedBlock.eduBlockName}`
    )
    console.dir(updatedBlock)
    return updatedBlock
  } catch (error) {
    console.error(
      `Error fetching schools from ${givenBlock.eduBlockName}: ${error}`
    )
  }
}

const testState = states.filter(state => state.stateId === 135)
const testBlock = testState[0].districts[0]?.blocks[0]

staggeredSchoolFetch(testState.stateId, testBlock)