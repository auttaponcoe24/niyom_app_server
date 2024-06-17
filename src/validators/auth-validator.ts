import Joi from "joi";

export const registerSchema = Joi.object({
	firstname: Joi.string().trim().required(),
	lastname: Joi.string().trim().required(),
	address: Joi.string().trim().required(),
	id_passpost: Joi.string().trim().required(),
	email: Joi.string().email().required(),
	password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")).required(),
	confirm_password: Joi.any().valid(Joi.ref("password")).required().messages({
		"any.only": "Confirm password must match password",
	}),
	role: Joi.string().optional(),
	status: Joi.string().optional(),
});

export const loginSchema = Joi.object({
	email: Joi.string()
		.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{3,15}$/)
		.required(),
	password: Joi.string()
		.pattern(/^[a-zA-Z0-9]{6,30}$/)
		.required(),
});
