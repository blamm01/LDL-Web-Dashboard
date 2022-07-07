const jwt = require("jsonwebtoken")
const { oauth } = require("process")
const config = require("../../config.js")
const { schema } = require("../database/schemas/user")
const caidatSchema = require("../database/schemas/guild-caidats")
const user = require("../database/schemas/user")
const userSchema = require('../database/schemas/user')
const Discord = require("discord.js")
const client = require("../index")
const axios = require("axios")
const { authorizeUser } = require("../utils")

module.exports = {
    name: "api",
    routes: [
        // Authorize
        {
            path: "/auth/user",
            method: "get",
            callback: async (req, res) => {
                const cookieToken = req.cookies.token || req.headers["authorization"]
                if (!cookieToken) return res.status(401).send({
                    status: 401,
                    message: "Unauthorized: Token not found!",
                    redirect: "/api/login"
                })
                let decoded;
                try {
                    decoded = jwt.verify(cookieToken, process.env.jwt_secret);
                } catch (err) { }

                if (decoded) {
                    let data = await userSchema.findOne({ _id: decoded.uuid })
                    if (!data) return res.status(401).send({
                        status: 401,
                        message: "Unauthorized: Data not found!",
                        redirect: "/api/login"
                    })
                    let args = {
                        user: {
                            avatar: data.user.avatar,
                            id: data.userId,
                            username: data.user.username,
                            discriminator: data.user.discriminator
                        },
                        data: data
                    }

                    return res.status(200).send({
                        status: 200,
                        args: args
                    })
                } else {
                    return res.status(401).send({
                        status: 401,
                        message: "Unauthorized: Unable to verify!",
                        redirect: "/api/login"
                    })
                }
            }
        },
        {
            path: "/auth/callback",
            method: "get",
            callback: async (req, res) => {
                if (!req.query.code) return res.status(401).redirect("/api/login")
                let oauthData;
                try {
                    oauthData = await oauth.tokenRequest({
                        code: req.query.code,
                        scope: config.scope,
                        grantType: "authorization_code"
                    })
                } catch (err) { }
                if (!oauthData) return res.status(401).redirect("/api/login")
                const user = await oauth.getUser(oauthData.access_token)
                if (!user) return res.status(401).redirect("/api/login")
                let user_guilds = await oauth.getUserGuilds(oauthData.access_token)
                // Check accessible guilds
                user_guilds = user_guilds.filter((g) => {
                    const permissions = new Discord.Permissions(g.permissions)
                    if (!permissions.has("ADMINISTRATOR")) return false;
                    return true
                })
                let guilds = []
                const mapGuildsPromise = () => {
                  return new Promise((resolve, reject) => {
                   user_guilds.map(async(g) => {
                    let guild;  
                    try {
                      guild = await client.guilds.fetch(g.id)
                    } catch(err) { 
                      resolve(null); return
                    }
                    if(!guild) {
                      resolve(null);
                      return;
                    }
                    guilds.push({
                        ...g,
                        avatar: (await guild.iconURL()) || "https://cdn.discordapp.com/attachments/940260588330811404/991693637454934056/no_avatar.png"
                    })
                     resolve({
                       ...g,
                        avatar: (await guild.iconURL()) || "https://cdn.discordapp.com/attachments/940260588330811404/991693637454934056/no_avatar.png"
                     })
                    })
                  })
                }
                await mapGuildsPromise()
                guilds = guilds.filter(g => g)
                let userData = await userSchema.findOne({ userId: user.id })
                if (!userData) userData = new userSchema({
                    userId: user.id,
                    accessToken: oauthData.access_token,
                    refreshToken: oauthData.refresh_token,
                    expires_in: oauthData.expires_in,
                    user: {
                        id: user.id,
                        username: user.username,
                        discriminator: user.discriminator,
                        avatar: user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}` : "https://media.discordapp.net/attachments/940260588330811404/991693637454934056/no_avatar.png?width=180&height=180",
                    },
                    accessible_guilds: guilds
                })
                const id = userData._id.toString()
                userData.secretAccessKey = jwt.sign({
                    userId: user.id,
                    uuid: id
                }, process.env.jwt_secret)
                userData.accessible_guilds = guilds
                await userData.save();
                res.cookie("token", userData.secretAccessKey, { maxAge: config.maxAge })
                res.status(200).redirect("/dashboard")
            }
        },

        // Information
        {
            method: "get",
            path: "/info/guild/:guildId/channels",
            callback: async (req, res) => {
                const data = await authorizeUser(req, res)
                const guildId = req.params.guildId;
                if (!data || !`${data.status}`.startsWith("2")) return;
                if (!guildId || isNaN(guildId)) return res.status(400).send({
                    status: 400,
                    message: 'Invalid form params: "guildId"'
                })
                let guild;
                try {
                    guild = await client.guilds.fetch(guildId)
                } catch (e) {
                    return res.status(403).send({
                        status: 403,
                        message: "Forbidden: The requested guild is not accessible."
                    })
                }
                if (!guild) return res.status(403).send({
                    status: 403,
                    message: "Forbidden: The requested guild is not accessible."
                })
                let member;
                try {
                    member = await guild.members.fetch(data?.args.user.id || null)
                } catch (e) {
                    return res.status(403).send({
                        status: 403,
                        message: "Forbidden: The logged in member is not found in the guild."
                    })
                }
                if (!member) return res.status(403).send({
                    status: 403,
                    message: "Forbidden: The logged in member is not found in the guild."
                })
                if (!member.permissions.has("ADMINISTRATOR")) return res.status(403).send({
                    status: 403,
                    message: "Forbidden: The logged in member doesn't have enough permissions."
                })
                const channels = client.guilds.cache.get(guildId).channels.cache.map((c) => {
                    return {
                        name: c.name,
                        id: c.id,
                    }
                });
                return res.status(200).send({
                    status: 200,
                    data: channels
                })
            }
        },

        // Features
        {
            method: "post",
            path: "/features/settings/:guildId/prefix",
            callback: async (req, res) => {
                const data = await authorizeUser(req, res)
                const guildId = req.params.guildId;
                if (!data || !`${data.status}`.startsWith("2")) return;
                if (!guildId || isNaN(guildId)) return res.status(400).send({
                    status: 400,
                    message: 'Invalid form params: guildId, not found or guild id is not a number'
                })
                let guild;
                try {
                    guild = await client.guilds.fetch(guildId)
                } catch (e) {
                    return res.status(403).send({
                        status: 403,
                        message: "Forbidden: The requested guild is not accessible."
                    })
                }
                if (!guild) return res.status(403).send({
                    status: 403,
                    message: "Forbidden: The requested guild is not accessible."
                })
                let member;
                try {
                    member = await guild.members.fetch(data?.args.user.id || null)
                } catch (e) {
                    return res.status(403).send({
                        status: 403,
                        message: "Forbidden: The logged in member is not found in the guild."
                    })
                }
                if (!member) return res.status(403).send({
                    status: 403,
                    message: "Forbidden: The logged in member is not found in the guild."
                })
                if (!member.permissions.has("ADMINISTRATOR")) return res.status(403).send({
                    status: 403,
                    message: "Forbidden: The logged in member doesn't have enough permissions."
                })
                let prefix = `${req.body?.prefix}`
                if(!prefix || prefix == "") prefix = `${config.prefix}`
                if(prefix.length > 3) return res.status(400).send({
                    status: 400,
                    message: "Invalid form body: prefix, max prefix length is 3 characters."
                })
                let caidatData = await caidatSchema.findOne({ _id: guildId })
                if (!caidatData) {
                    caidatData = await caidatSchema.create({
                      _id: guildId,
                        prefix: prefix
                    })
                    console.log(caidatData)
                    return res.status(201).send({
                        status: 201,
                        data: caidatData
                    })
                }
                caidatData.prefix = prefix
                try {
                    await caidatData.save()
                } catch(err) {
                    console.log(err)
                }
                res.status(201).send({
                    status:201,
                    data: caidatData
                })
            }
        },
        {
            method: "get",
            path: "/features/settings/:guildId/prefix",
            callback: async (req, res) => {
                const data = await authorizeUser(req, res)
                const guildId = req.params.guildId;
                if (!data || !`${data.status}`.startsWith("2")) return;
                if (!guildId || isNaN(guildId)) return res.status(400).send({
                    status: 400,
                    message: 'Invalid form params: "guildId"'
                })
                let guild;
                try {
                    guild = await client.guilds.fetch(guildId)
                } catch (e) {
                    return res.status(403).send({
                        status: 403,
                        message: "Forbidden: The requested guild is not accessible."
                    })
                }
                if (!guild) return res.status(403).send({
                    status: 403,
                    message: "Forbidden: The requested guild is not accessible."
                })
                let member;
                try {
                    member = await guild.members.fetch(data?.args.user.id || null)
                } catch (e) {
                    return res.status(403).send({
                        status: 403,
                        message: "Forbidden: The logged in member is not found in the guild."
                    })
                }
                if (!member) return res.status(403).send({
                    status: 403,
                    message: "Forbidden: The logged in member is not found in the guild."
                })
                if (!member.permissions.has("ADMINISTRATOR")) return res.status(403).send({
                    status: 403,
                    message: "Forbidden: The logged in member doesn't have enough permissions."
                })
                let caidatData = await caidatSchema.findOne({ _id: guildId })
                if (!caidatData) {
                    return res.status(200).send({
                        status: 200,
                        prefix: null
                    })
                }
                return res.status(200).send({
                    status: 200,
                    prefix: caidatData.prefix
                })
            }
        },
        {
            method: "post",
            path: "/features/settings/:guildId/logchannel",
            callback: async (req, res) => {
                const data = await authorizeUser(req, res)
                const guildId = req.params.guildId;
                if (!data || !`${data.status}`.startsWith("2")) return;
                if (!guildId || isNaN(guildId)) return res.status(400).send({
                    status: 400,
                    message: 'Invalid form params: guildId, not found or guild id is not a number'
                })
                let guild;
                try {
                    guild = await client.guilds.fetch(guildId)
                } catch (e) {
                    return res.status(403).send({
                        status: 403,
                        message: "Forbidden: The requested guild is not accessible."
                    })
                }
                if (!guild) return res.status(403).send({
                    status: 403,
                    message: "Forbidden: The requested guild is not accessible."
                })
                let member;
                try {
                    member = await guild.members.fetch(data?.args.user.id || null)
                } catch (e) {
                    return res.status(403).send({
                        status: 403,
                        message: "Forbidden: The logged in member is not found in the guild."
                    })
                }
                if (!member) return res.status(403).send({
                    status: 403,
                    message: "Forbidden: The logged in member is not found in the guild."
                })
                if (!member.permissions.has("ADMINISTRATOR")) return res.status(403).send({
                    status: 403,
                    message: "Forbidden: The logged in member doesn't have enough permissions."
                })
                let log = `${req.body?.log}`
                if(!log) log == "0";
                let caidatData = await caidatSchema.findOne({ _id: guildId })
                if (!caidatData) {
                    caidatData = await caidatSchema.create({
                        _id: guildId,
                        prefix: prefix,
                        logchannelid: log
                    })
                    return res.status(201).send({
                        status: 201,
                        data: caidatData
                    })
                }
                caidatData.logchannelid = log
                try {
                    await caidatData.save()
                } catch(err) {
                    console.log(err)
                }
                res.status(201).send({
                    status:201,
                    data: caidatData
                })
            }
        },
        {
            method: "get",
            path: "/features/settings/:guildId/logchannel",
            callback: async (req, res) => {
                const data = await authorizeUser(req, res)
                const guildId = req.params.guildId;
                if (!data || !`${data.status}`.startsWith("2")) return;
                if (!guildId || isNaN(guildId)) return res.status(400).send({
                    status: 400,
                    message: 'Invalid form params: "guildId"'
                })
                let guild;
                try {
                    guild = await client.guilds.fetch(guildId)
                } catch (e) {
                    return res.status(403).send({
                        status: 403,
                        message: "Forbidden: The requested guild is not accessible."
                    })
                }
                if (!guild) return res.status(403).send({
                    status: 403,
                    message: "Forbidden: The requested guild is not accessible."
                })
                let member;
                try {
                    member = await guild.members.fetch(data?.args.user.id || null)
                } catch (e) {
                    return res.status(403).send({
                        status: 403,
                        message: "Forbidden: The logged in member is not found in the guild."
                    })
                }
                if (!member) return res.status(403).send({
                    status: 403,
                    message: "Forbidden: The logged in member is not found in the guild."
                })
                if (!member.permissions.has("ADMINISTRATOR")) return res.status(403).send({
                    status: 403,
                    message: "Forbidden: The logged in member doesn't have enough permissions."
                })
                let caidatData = await caidatSchema.findOne({ _id: guildId })
                if (!caidatData) {
                    console.log('hmm')
                    return res.status(200).send({
                        status: 200,
                        log: "0"
                    })
                }
                console.log(caidatData);
                return res.status(200).send({
                    status: 200,
                    log: caidatData.logchannelid || "0"
                })
            }
        },


        // Redirects
        {
            path: "/logout",
            method: "get",
            callback: async (req, res) => {
                res.clearCookie("token")
                res.status(200).redirect("/")
            }
        },
        {
            path: "/login",
            method: "get",
            callback: async (req, res) => {
                const url = oauth.generateAuthUrl({
                    scope: config.scope,
                    state: require("crypto").randomBytes(16).toString("hex")
                })
                console.log(url)
                if (req.cookies.token && req.cookies.token.length > 0) {
                    let decoded;
                    try {
                        decoded = jwt.verify(req.cookies.token, jwt_secret);
                    } catch (err) { }
                    if (!decoded) return res.redirect(url);
                    let data = await userSchema.findOne({
                        _id: decoded.uuid
                    });
                    if (!data) {
                        res.redirect(url)
                    } else {
                        if ((Date.now() - data.lastUpdated) > data.expires_in * 1000) {
                            const oauthData = await oauth.tokenRequest({
                                refreshToken: data.refreshToken,
                                grantType: "refresh_token",
                                scope: config.scope
                            })
                            console.log(oauthData)
                            data.accessToken = oauthData.access_token;
                            data.refreshToken = oauthData.refresh_token;
                            data.expires_in = oauthData.expires_in;
                        }
                        await data.save();
                        res.redirect("/dashboard");
                    }
                } else res.redirect(url)
            }
        },
        {
            path: "/invite",
            method: "get",
            callback: async (req, res) => {
                res.redirect(config.inviteLink)
            }
        },
    ]
}
