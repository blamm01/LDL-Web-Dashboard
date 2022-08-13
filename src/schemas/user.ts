import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  userId: String,
  accessToken: String,
  refreshToken: String,
  expires_in: Number,
  secretAccessKey: String,
  lastUpdated: {
    type: Number,
    required: true,
    default: Date.now(),
  },
  user: {
    id: String,
    tag: String,
    username: String,
    discriminator: String,
    avatar: String,
  },
  guilds: Array,
});

export default mongoose.model('discord_users', schema);
