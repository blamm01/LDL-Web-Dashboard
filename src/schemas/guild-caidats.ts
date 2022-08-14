import mongoose from 'mongoose';

export default mongoose.model(
  'guild-caidats',
  new mongoose.Schema({
    _id: {
      type: String,
      required: true,
    },
    badword: {
      type: Boolean,
      default: false,
    },
    disinvitelink: {
      type: Boolean,
      default: false,
    },
    capsword: {
      type: Boolean,
      default: false,
    },
    bwword: {
      type: Array,
      default: [],
    },
    logchannelid: {
      type: String,
      default: null,
    },
  }),
);
