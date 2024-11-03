import server, { Request, Response } from 'express-tools'
import path from 'path'

const app = server()

app.use('*', (req: Request, res: Response) => {
  res.sendFile(path.resolve(__dirname + '../../example/index.html'))
})
