const db = require("../database/db.js")

const insert_states = db.prepare(/*sql*/ `
  INSERT INTO states (states_file)
  VALUES (?)
`)

const updateStates = object => {
  return insert_states.run(object)
}

const select_states = db.prepare(/*sql*/ `
  SELECT * FROM states WHERE id = 1
`)

const getStates = () => {
  return select_states.all()
}

module.exports = { updateStates, getStates }
