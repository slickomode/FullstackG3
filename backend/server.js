// Importerar dotenv för att gömma känsliga nycklar
import * as dotenv from 'dotenv'
//implementerar dotenv
dotenv.config()
// Express
import express from 'express'
// Hämtar CORS
import cors from 'cors'
//Hämtar postgress sql
import pg from 'pg'
//Hämtar client paket så att kommunikationen mellan server och databas fungerar
import pkg from 'pg'
const { Client } = pkg

//Hämtar body-parser (ett middlewear som kan hantera olika request metoder)

import bodyParser from 'body-parser'

//Importerar åath spom gör att vi kan använda statiska filier på valfri plats i vårt projekt

import path from 'path'

//Implemenetrar Express tillsammans med app

const app = express()

//lägger till middlewear

//Bodyparser

app.use(bodyParser.json())

app.use(
    bodyParser.urlencoded({
        extended: true
    })
)

//Cors

app.use(cors())

//express

app.use(express.json())

// Förbättrar cors kommunikation

app.use((request, response, next) => {
    response.header('Access-Control-Allow-Origin', '*')

    response.header('Access-Control-Allow-Headers', 'Content-Type')

    next()
})

// Använder path för att komma åt våra statiska filer, i detta fallet i vår public mapp i vår front-end

app.use(express.static(path.join(path.resolve(), 'public')))

//Importerar min databas

const db = new Client({
    host: process.env.DB_HOST,

    user: process.env.DB_USERNAME,

    password: process.env.DB_PASSWORD,

    databas: process.env.DB_NAME,

    port: process.env.DB_PORT
})

//Errorfunktion

db.connect(function (err) {
    if (err) throw err

    console.log('Connected to database')
})

// Routes

app.get('/', (req, res) => {
    res.json('Root')
})

//Alla användare
app.get('/users', async (req, res) => {
    try {
        const allUsers = await db.query('SELECT * FROM users')

        res.json(allUsers.rows)
    } catch (err) {
        console.log(err.message)
    }
})

// Skapa användare POST
app.post('/users', async (req, res) => {
    const { user_firstname, user_lastname, title, password, image } = req.body

    const values = [user_firstname, user_lastname, title, password, image]

    await db.query(
        'INSERT INTO users(user_firstname, user_lastname, title, password, image) VALUES ($1, $2, $3, $4, $5)',

        values
    )

    res.send('User added')
})

// Ta bort användare
app.delete('/users/:id', async (req, res) => {
    try {
        const { id } = req.params

        const deleteUser = await db.query(
            'DELETE FROM users WHERE user_id = $1',
            [id]
        )

        res.json({ message: 'User deleted' })
    } catch (err) {
        console.log(err.message)
    }
})

// Meddelanden
app.get('/messages', async (req, res) => {
    try {
        const allMessages = await db.query('SELECT * FROM messages')

        res.json(allMessages.rows)
    } catch (err) {
        console.log(err.message)
    }
})

// Skicka nytt meddelande
app.post('/messages', async (req, res) => {
    const { sender_id, recipient_id, message } = req.body

    const values = [sender_id, recipient_id, message]

    await db.query(
        'INSERT INTO messages(sender_id, recipient_id, message) VALUES ($1, $2, $3)',

        values
    )

    res.send('Message send')
})

// Ändra meddelande
app.put('/messages/:id', async (req, res) => {
    const id = req.params.id

    const { sender_id, recipient_id, message } = req.body

    const values = [sender_id, recipient_id, message, id]

    await db.query(
        'UPDATE messages SET sender_id = $1, recipient_id = $2, message = $3 WHERE message_id = $4',

        values
    )

    res.send('Message is changed')
})

// Ta bort meddelande
app.delete('/messages/:id', async (req, res) => {
    try {
        const { id } = req.params.id

        const deleteMessages = await db.query(
            'DELETE FROM messages WHERE message_id = $1',
            [id]
        )

        res.json({ message: 'Message deleted' })
    } catch (err) {
        console.log(err.message)
    }
})

app.listen(8900, () => {
    console.log('Server connected')
})
