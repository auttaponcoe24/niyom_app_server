import Joi from "joi";

export const registerSchema = Joi.object({
	firstname: Joi.string().trim().required(),
	lastname: Joi.string().trim().required(),
	address: Joi.string().trim().required(),
	id_passpost: Joi.string().trim().required(),
	mail: Joi.string().email().required(),
	password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")).required(),
	confirm_password: Joi.any().valid(Joi.ref("password")).required().messages({
		"any.only": "Confirm password must match password",
	}),
	role: Joi.string().optional(),
	status: Joi.string().optional(),
});

// const validateUser = (user: any) => userSchema.validate(user);
// export { validateUser };
