import mongoose from 'mongoose';
import config from '../../config';

export default () => {
  mongoose
    .connect(config.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'));
};
