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
    const newStatePromises = states
      .filter(state => state.stateId === 135 || state.stateId === 128) // only for testing
      .map(async state => {
        try {
          return await staggeredFetching(state)
        } catch (error) {
          console.error(`Error fetching a State : ${error}`)
          throw error
        }
      })
    const newStates = await Promise.all(newStatePromises)
    const newStatesJSON = JSON.stringify(newStates)
    updateStates(newStatesJSON)
  } catch (error) {
    console.error(`Error processing states: ${error}`)
  }
}

newStates()
