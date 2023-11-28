require("dotenv").config()
const util = require("util")

const requestVelocity = 2000 // adjust for correct balance !
const baseURL = process.env.BASE_URL
const requestCookie = process.env.COOKIE
let states = JSON.parse(process.env.STATE_LIST)
const { updateStates, getStates } = require("../scraper/model/states.js")

function staggeredFetching(givenState) {
  const givenStateId = givenState.stateId

  const options = {
    method: "POST",
    headers: {
      cookie: requestCookie,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "insomnia/8.4.0",
    },
    body: new URLSearchParams({ stateId: givenStateId }),
  }

  return fetch(`${baseURL}/locateSchool/getDistrict`, options)
    .then(response => response.json())
    .then(response => {
      givenState = {
        ...givenState,
        districts: response,
      }
      console.log(
        `Fetched ${response.length} districts for ${givenState.stateName}`
      )
      return givenState
    })
    .catch(err => console.error(err))
}


const newStates = async () => {
  try {
    const newStates = []

    const processState = async index => {
      if (index >= states.length) {
        const newStatesJSON = JSON.stringify(newStates)
        updateStates(newStatesJSON)
        return
      }
      const state = states[index]

      try {
        const result = await staggeredFetching(state)
        newStates.push(result)

        setTimeout(async () => {
          await processState(index + 1)
        }, requestVelocity)
      } catch (error) {
        console.error(`Error fetching a state: ${error}`)
        throw error
      }
    }

    await processState(0)
  } catch (error) {
    console.error(`Error processing states: ${error}`)
  }
}

newStates()
