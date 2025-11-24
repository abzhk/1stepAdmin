import  mongoose from 'mongoose';

const statsSchema = new mongoose.Schema({
  totalUsers: { type: Number, default: 0 },
  totalProviders: { type: Number, default: 0 },
  totalParents: { type: Number, default: 0 },
  totalBookings: { type: Number, default: 0 },
  lessonsCount: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Stats', statsSchema);
