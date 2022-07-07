const axios = require("axios")
const config = require("../../config.js")
const fetch = require("node-fetch")
const { authorizeUser } = require("../utils/")
const client = require("../index")

module.exports = {
    name: "/",
    routes: [
        {
            path: "/",
            method: "get",
            callback: async (req, res) => {
                let fetchedResponse;
                let fetchedArgs;
                try {
                    fetchedResponse = await axios.get(`${config.domainLink}/api/auth/user`, {
                        headers: {
                            "authorization": `${req.cookies.token || null}`
                        }
                    })
                    fetchedArgs = fetchedResponse.data.args
                } catch (err) {
                    fetchedArgs = {}
                }
                
                res.render("index", fetchedArgs)
            }
        },
        {
            path: "/pp",
            method: "get",
            callback: async (req, res) => {
                let fetchedResponse;
                let fetchedArgs;
                try {
                    fetchedResponse = await axios.get(`${config.domainLink}/api/auth/user`, {
                        headers: {
                            "authorization": `${req.cookies.token || null}`
                        }
                    })
                    fetchedArgs = fetchedResponse.data.args
                } catch (err) {
                    fetchedArgs = {}
                }
                
                res.render("pp", fetchedArgs)
            }
        },
        {
            path: "/faqs",
            method: "get",
            callback: async (req, res) => {
                let fetchedResponse;
                let fetchedArgs;
                try {
                    fetchedResponse = await axios.get(`${config.domainLink}/api/auth/user`, {
                        headers: {
                            "authorization": `${req.cookies.token || null}`
                        }
                    })
                    fetchedArgs = fetchedResponse.data.args
                } catch (err) {
                    fetchedArgs = {}
                }
                
                res.render("faqs", fetchedArgs)
            }
        },
        {
            path: "/commands",
            method: "get",
            callback: async (req, res) => {
                let fetchedResponse;
                let fetchedArgs;
                try {
                    fetchedResponse = await axios.get(`${config.domainLink}/api/auth/user`, {
                        headers: {
                            "authorization": `${req.cookies.token || null}`
                        }
                    })
                    fetchedArgs = fetchedResponse.data.args
                } catch (err) {
                    fetchedArgs = {}
                }
                
                res.render("commands", fetchedArgs)
            }
        },
        {
            path: "/tos",
            method: "get",
            callback: async (req, res) => {
                let fetchedResponse;
                let fetchedArgs;
                try {
                    fetchedResponse = await axios.get(`${config.domainLink}/api/auth/user`, {
                        headers: {
                            "authorization": `${req.cookies.token || null}`
                        }
                    })
                    fetchedArgs = fetchedResponse.data.args
                } catch (err) {
                    fetchedArgs = {}
                }
                
                res.render("tos", fetchedArgs)
            }
        },
        {
            path: "/dashboard",
            method: "get",
            callback: async (req, res) => {
                // let fetchedResponse;
                // try {
                //     fetchedResponse = await axios.get(`${config.domainLink}/api/auth/user`, {
                //         headers: {
                //             "authorization": `${req.cookies.token || null}`
                //         }
                //     })
                //     fetchedResponse = fetchedResponse
                // } catch (err) {
                //     const fetchedData = err.response.data
                //     if (fetchedData.status == 401 || fetchedData.status == 403) return res.redirect("/api/login")
                //     res.send(`Lỗi khi lấy thông tin người dùng! (Trạng thái: ${fetchedData.status}`)
                //     return;
                // }
                // const fetchedData = fetchedResponse.data
                // if (fetchedData.status == 200) {
                //     res.render("dashboard", fetchedData.args)
                // } else res.redirect("/api/login")
                const data = await authorizeUser(req, res)
                if(!data) return;
                if(!`${data.status}`.startsWith("2")) return;
                res.render("dashboard", data.args)
            }
        },

        // Dashboard
        {
            path: "/servers/:guildId",
            method: "get",
            callback: async (req, res) => {
                const guildId = req.params["guildId"] || req.headers["guildId"]
                if (!guildId || !Number.parseInt(guildId)) return res.redirect('/dashboard')
                const data = await authorizeUser(req, res)
                if (!data || !`${data.status}`.startsWith("2")) return;
                let guild;
                try {
                    guild = await client.guilds.fetch(guildId)
                } catch (e) {
                    res.redirect("/dashboard")
                    return console.log(`[Error] [Web] ${e}`)
                }
                if (!guild) return res.redirect("/dashboard")
                let member;
                try {
                    member = await guild.members.fetch(data?.args.user.id || null)
                } catch (e) {
                    res.redirect("/dashboard")
                    return console.log(`[Error] [Web] ${e}`)
                }
                if (!member) return res.redirect("/dashboard")
                if (!member.permissions.has("ADMINISTRATOR")) return res.redirect("/dashboard")

                res.render("server", {
                    ...data.args,
                    member: member,
                    guild: guild,
                    config: config,
                    req: req,
                    res: res
                })
            }
        }
    ]
}