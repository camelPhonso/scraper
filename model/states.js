const db = require("../database/db.js")

const insert_states = db.prepare(/*sql*/ `
  INSERT INTO states (states_file)
  VALUES (?)
`)

const updateStates = object => {
  return insert_states.run(object)
}

const select_states = db.prepare(/*sql*/ `
  SELECT * FROM states WHERE id = ?
`)

const getStates = number => {
  return select_states.get(number)
}

module.exports = { updateStates, getStates }
