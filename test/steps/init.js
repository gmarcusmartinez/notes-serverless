/* Initialize tests with env variables */
"use strict"

const init = async () => {
  require("dotenv").config({ path: ".env.test" })
}

module.exports = init
