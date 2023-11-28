require("dotenv").config()

const { updateStates, getStates } = require("../scraper/model/states.js")

const requestCookie = process.env.COOKIE
const baseURL = process.env.BASE_URL

const statesJSON = getStates()
const states = JSON.parse(statesJSON[0].states_file)

const requestVelocity = 2000

// fetch blocks from a district
const staggeredBlockRequest = async givenDistrict => {
  const givenDistrictId = givenDistrict.districtId

  const options = {
    method: "GET",
    headers: {
      cookie: requestCookie,
      "User-Agent": "insomnia/8.4.0",
    },
  }

  try {
    const response = await fetch(
      `${baseURL}/locateSchool/getBlock?districtId=${givenDistrictId}`,
      options
    )

    const jsonResponse = await response.json()

    const updatedDistrict = {
      ...givenDistrict,
      blocks: jsonResponse,
    }

    console.log(
      "\u001b[32m",
      `Fetched ${jsonResponse.length} blocks from ${updatedDistrict.districtName} district.`
    )

    return updatedDistrict
  } catch (error) {
    console.error(`Error fetching a block: ${error}`)
    throw error
  }
}

// alter all districts inside a state
const processDistricts = async currentState => {
  try {
    const newDistricts = []

    const processDistrict = async index => {
      if (index >= currentState.districts?.length) {
        const updatedState = {
          ...currentState,
          districts: newDistricts,
        }
        // RETURNING CORRECTLY !!!
        return updatedState
      }
      const district = currentState.districts[index]

      try {
        const processedDistrict = await staggeredBlockRequest(district)
        newDistricts.push(processedDistrict)

        const result = await new Promise(resolve => {
          setTimeout(async () => {
            const result = await processDistrict(index + 1)
            resolve(result)
          }, requestVelocity)
        })
        return result
      } catch (error) {
        console.error(`Error processing a District: ${error}`)
        throw error
      }
    }

    return processDistrict(0)
  } catch (error) {
    console.error(`Error processing Districts: ${error}`)
  }
}

// iterate through all states
const newDistricts = async () => {
  try {
    const newStates = []

    const iterateStates = async index => {
      if (index >= states.length) {
        const newStatesJSON = JSON.stringify(newStates)
        updateStates(newStatesJSON)
        console.log("\u001b[37;44m", "New States JSON object saved to DB")
        return
      }
      const state = states[index]

      console.log("\u001b[31m", `Processing ${state.stateName} State`)
      try {
        const processedState = await processDistricts(state)
        // Returning correctly !!!!
        newStates.push(processedState)

        setTimeout(async () => {
          await iterateStates(index + 1)
        }, requestVelocity / 2)
      } catch (error) {
        console.error(`Error iterating through states: ${error}`)
        throw error
      }
    }

    await iterateStates(0)
  } catch (error) {
    console.error(`Error processing States: ${error}`)
  }
}

newDistricts()
