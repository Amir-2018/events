const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const clientSchema = new mongoose.Schema({
  nom: { 
    type: String, 
    required: [true, 'Nom is required']
  },
  prenom: { 
    type: String, 
    required: [true, 'Prénom is required']
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true
  },
  tel: { 
    type: String, 
    required: [true, 'Téléphone is required']
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'],
    minlength: 6
  }
}, { 
  timestamps: true 
});

clientSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

clientSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Client', clientSchema);
