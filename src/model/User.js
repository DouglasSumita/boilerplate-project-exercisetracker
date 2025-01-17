const { Schema, model } = require('mongoose');
const userSchema = new Schema({
  username: {
    type: String,
    required: true
  }
},
{
  toJSON: { virtuals: true }, // So `res.json()` and other `JSON.stringify()` functions include virtuals
  toObject: { virtuals: true } // So `console.log()` and other functions that use `toObject()` include virtuals
});

userSchema.virtual('log', {
  ref: 'Exercise',
  localField: '_id',
  foreignField: 'user_id'
});

module.exports = model('User', userSchema, 'User');