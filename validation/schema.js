const Joi = require('joi')

const schema = {
    tenantsignup: Joi.object({
        firstName: Joi.string().label("first name"),
        lastName: Joi.string().required().label("last name"),
        businessName: Joi.string().required().label("business name"),
        phone: Joi.string().required().label("phone"),
        email: Joi.string()
            .email()
            .required()
            .label("email"),
        username: Joi.string().required().label("username"),
        password: Joi.string()
            .min(8)
            .required()
            .label("password"),
    }),
    login: Joi.object({
        username: Joi.string().required().label("Username"),
        password: Joi.string()
            .required()
            .label("Password"),
    }),
    Categoryschema: Joi.object({
        category_name: Joi.string().required().label("name"),
    }),
    Supplierschema: Joi.object({
        supplier_name: Joi.string().required().label("name"),
        supplier_address: Joi.string().required().label("address"),
        supplier_contact: Joi.string().required().label("contact"),
    }),
    ProductOptionschema: Joi.object({
        option_name: Joi.string().required().label("option name"),
        option_type: Joi.string().required().label("option type"),
        option_order: Joi.number().required().label("option order"),
        product_id: Joi.string().guid().required().label("product id"),
    }),
    ProductOptionValueschema: Joi.object({
        option_value_name: Joi.string().required().label("option name"),
        option_value_qty: Joi.string().required().label("option type"),
        option_value_price: Joi.number().required().label("option order"),
        option_value_sort: Joi.number().required().label("option order"),
        product_option_id: Joi.string().guid().required().label("product id"),
    }),

};
module.exports = schema;
