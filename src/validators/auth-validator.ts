import Joi from "joi";

export const registerSchema = Joi.object({
	firstname: Joi.string().trim().required(),
	lastname: Joi.string().trim().required(),
	address: Joi.string().trim().required(),
	id_passpost: Joi.string().trim().required(),
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

	// emailOrUsername: Joi.alternatives([
	// 	Joi.string().pattern(
	// 		/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{3,15}$/
	// 	),
	// 	Joi.string().pattern(/^[a-zA-Z0-9]{3,15}$/),
	// ])
	// 	.required()
	// 	.strip(),

	// confirmPassword: Joi.string()
	// 	.valid(Joi.ref("password"))
	// 	.trim()
	// 	.required()
	// 	.strip(),
});

export const loginSchema = Joi.object({
	email: Joi.string().trim().required(),
	password: Joi.string().trim().required(),
});
