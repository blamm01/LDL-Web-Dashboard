require('dotenv').config()

const express = require("express");
const app = express();
const config = require("../config.js")
const path = require('path')
const fs = require("fs")
const DiscordOAuth2 = require("discord-oauth2")
const cookieParser = require("cookie-parser")
const Discord = require("discord.js")

const client = new Discord.Client({
    intents: [
        "GUILDS",
        "GUILD_MESSAGES",
        "GUILD_BANS"
    ]
})

app.set("view engine", "ejs")

app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))
app.set("views", path.join(__dirname + "/views"))

process.oauth = new DiscordOAuth2({
    clientId: process.env.clientId,
    clientSecret: process.env.clientSecret,
    redirectUri: config.callback
})

app.use(express.static(path.join(__dirname + "/static")))
app.use(cookieParser())

app.use((req, res, next) => {
    console.log(`[Info] [Web] ${req.method} ${req.path} (by: ${req.ip})`) 
    next();
})

module.exports = client;

// Setting up...
console.log("[Info] [Console] Connecting to services...")
client.login(process.env.clientToken).then(() => {
  console.log("[Info] [Bot] Logged in to Discord")
app.listen(config.port, () => console.log(`[Info] [Web] Listening to port ${config.port}`))
require("./database/index")
requestHandler()
  app.use((req, res) => {
        res.status(404).render("404")
    })
  })

function requestHandler() {
    const files = fs.readdirSync(path.join(__dirname + "/routes/")).filter(f => f.endsWith(".js"))
    files.map((f) => {
        const file = require(`./routes/${f}`)
        if(!file || !file.name || file.routes.length == 0) return;
        file.routes.map((route) => {
            if(!route.method || !route.callback || !route.path) return;
            const path = file.name == "/" ? `${route.path}` : `/${file.name}${route.path}`
            useMethods(path, route.callback, route.method)
            console.log(`[Dashboard] - Loaded | ${route.method.toUpperCase()} ${path}`)
        })
    })

    function useMethods(path, callback, method) {
        if(!method || typeof method !== "string") return;
        if(!path || typeof path !== "string") return;
        if(!callback || typeof callback !== "function") return;
        switch(method.toLowerCase()) {
            case "get":
                app.get(path, callback);
                break;
            case "post":
                app.post(path, callback);
                break;
            case "patch":
                app.patch(path, callback);
                break;
            case "put":
                app.put(path, callback);
                break;
            default:
                console.log("[Error] [Function] Passed method for Request Handler is not valid!")
        }
    }
}