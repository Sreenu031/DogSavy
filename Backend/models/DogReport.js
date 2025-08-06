const mongoose = require('mongoose');

const DogReportSchema = new mongoose.Schema({
  imageUrl: String,
  description: String,
  location: {
    latitude: Number,
    longitude: Number
  },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['Pending', 'Accepted', 'Rescued'], default: 'Pending' },
  assignedNgo: { type: mongoose.Schema.Types.ObjectId, ref: 'Ngo', default: null }
}, { timestamps: true });

module.exports = mongoose.model('DogReport', DogReportSchema);
