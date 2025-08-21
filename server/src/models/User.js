import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		email: { type: String, required: true, unique: true, index: true },
		password_hash: { type: String, required: true },
		role: { type: String, enum: ['admin', 'agent', 'user'], default: 'user', index: true }
	},
	{ timestamps: { createdAt: true, updatedAt: false } }
);

export const User = mongoose.model('User', userSchema);


