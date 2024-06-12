import Joi from "joi";

// firstname, lastname, address, id_passpost, mail, password
export const userSchema = Joi.object({
	firstname: Joi.string().trim().required(),
	lastname: Joi.string().trim().required(),
	address: Joi.string().trim().required(),
	id_passpost: Joi.string().trim().required(),
	mail: Joi.string()
		.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{3,15}$/)
		.required(),
	password: Joi.string()
		.pattern(/^[a-zA-Z0-9]{6,30}$/)
		.required(),
});
