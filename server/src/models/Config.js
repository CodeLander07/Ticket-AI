import mongoose from 'mongoose';

const configSchema = new mongoose.Schema(
	{
		autoCloseEnabled: { type: Boolean, default: true },
		confidenceThreshold: { type: Number, default: 0.75, min: 0, max: 1 },
		slaHours: { type: Number, default: 24, min: 1, max: 168 }
	},
	{ versionKey: false }
);

export const Config = mongoose.model('Config', configSchema);


