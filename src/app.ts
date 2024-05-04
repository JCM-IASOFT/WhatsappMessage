import "dotenv/config"
import express from "express"
import cors from "cors"
import { whatsappRoute } from "./router/whatsapp.router"
const port = process.env.PORT || 3001
const app = express()
app.use(cors())
app.use(express.json())
app.use(express.static('tmp'))
app.use(`/whatsApp`, whatsappRoute)

app.listen(port, () => console.log(`🚀 Iniciando el servidor de whatsapp 🛠️ ::: ${port}`))
