const dotenv = require("dotenv");
const { logger } = require("../logs/winston");
dotenv.config({ path: "./config/config.env" });
const { DetectDevice, DetectIp,MainEnc } = require("./devicefuncs")
const systemDate = new Date().toISOString().slice(0, 19).replace("T", " ");
// const { ApiCall } = require("./autoCalls");

module.exports = {
    sendResponse: (res, status, code, message, data) => {
        status == 0 ? logger.error(message) : logger.info(message)
        res.status(code).json({
            status: status,
            message: message,
            data: data ? data : [],
        })
    },

    CatchHistory: async (data, req) => {
        data.service_name = process.env.ServiceName,
        // data.service_info,
        // data.location_info,
        // data.extra_data,
        data.date_ended = systemDate
        data.created_at = systemDate
        data.device = await DetectDevice(req.headers['user-agent'], req)
        data.ip = DetectIp(req)
        data.url = req.path

        console.log(data);
    //    ApiCall(`${process.env.AuditUrl}api/v1/savelogs`, 'POST', ``, data)

    },

};