const { sendResponse } = require("../helper/utilfunc");
const { logger } = require("../logs/winston");
const {
  tenantsignup,
  login,
  Categoryschema,
  Supplierschema,
  ProductOptionschema
} = require("../validation/schema");
module.exports = {
    tenantSetup: async (req, res, next) => {
    const options = {
      errors: {
        wrap: {
          label: "",
        },
      },
    };
    const value = await tenantsignup.validate(req.body, options);
    if (value.error) {
        sendResponse(res, 0, 200, value.error.details[0].message)
      logger.error(value.error.details[0].message);
    } else {
      next();
    }
  },
  userLogin: async (req, res, next) => {
    const options = {
      errors: {
        wrap: {
          label: "",
        },
      },
    };
    const value = await login.validate(req.body, options);
    if (value.error) {
      sendResponse(res, 0, 200, value.error.details[0].message)
      logger.error(value.error.details[0].message);
    } else {
      next();
    }
  },
  addcatValidator: async (req, res, next) => {
    const options = {
      errors: {
        wrap: {
          label: "",
        },
      },
    };
    const value = await Categoryschema.validate(req.body, options);
    if (value.error) {
      sendResponse(res, 0, 200, value.error.details[0].message)
      logger.error(value.error.details[0].message);
    } else {
      next();
    }
  },
  addSupplierValidator: async (req, res, next) => {
    const options = {
      errors: {
        wrap: {
          label: "",
        },
      },
    };
    const value = await Supplierschema.validate(req.body, options);
    if (value.error) {
      sendResponse(res, 0, 200, value.error.details[0].message)
      logger.error(value.error.details[0].message);
    } else {
      next();
    }
  },
  addOptionValidator: async (req, res, next) => {
    const options = {
      errors: {
        wrap: {
          label: "",
        },
      },
    };
    const value = await ProductOptionschema.validate(req.body, options);
    if (value.error) {
      sendResponse(res, 0, 200, value.error.details[0].message)
      logger.error(value.error.details[0].message);
    } else {
      next();
    }
  },
  
};
