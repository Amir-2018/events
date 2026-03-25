const mongoose = require('mongoose');

const authTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  token: {
    type: String,
    required: true
  },
  expires: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AuthToken', authTokenSchema);
