// Setup .env
import "./util"

import { startServer } from "./server"
import { initDatabase } from "./model"

const run = async (): Promise<void> => {
  await initDatabase()

  startServer()
}

run()
