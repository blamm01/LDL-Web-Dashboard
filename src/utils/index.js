const axios = require("axios")
const config = require("../../config.js")

async function authorizeUser(req, res) {
    let fetchedResponse;
    try {
        fetchedResponse = await axios.get(`${config.domainLink}/api/auth/user`, {
            headers: {
                "authorization": `${req.cookies.token || req.headers["authorization"] || null}`
            }
        })
    } catch (err) {
        const fetchedData = err?.response.data
        if (fetchedData.redirect) {
            console.log("redirect2")
            return res.redirect(fetchedData.redirect)
        } else {
            res.send(`Lỗi khi lấy thông tin người dùng! ${fetchedData}`)
        }
        return fetchedData;
    }
    const fetchedData = fetchedResponse.data
    if (`${fetchedData.status}`.startsWith("2")) {
        return fetchedData
    } else {
        if (fetchedData.redirect) {
            res.redirect(fetchedData.redirect)
            console.log("redirect1")
        } else {
            res.send(`Lỗi khi lấy thông tin người dùng! (Trạng thái: ${fetchedData.status}`)
        }
        return fetchedData
    }
}

module.exports = { authorizeUser }