import Joi from "joi";

export const registerSchema = Joi.object({
	firstname: Joi.string().trim(),
	lastname: Joi.string().trim(),
	address: Joi.string().trim(),
	id_passpost: Joi.string()
		.trim()
		.pattern(/^[0-9]{13}/),
	email: Joi.string().email().required(),
	password: Joi.string()
		.pattern(/^[a-zA-Z0-9.-@]{6,30}$/)
		.trim()
		.required(),
	confirm_password: Joi.any()
		.valid(Joi.ref("password"))
		.required()
		.messages({
			"any.only": "Confirm password must match password",
		})
		.strip(),
	role: Joi.string().optional(),
	status: Joi.string().optional(),
});

export const loginSchema = Joi.object({
	email: Joi.string().trim().required(),
	password: Joi.string().trim().required(),
});
