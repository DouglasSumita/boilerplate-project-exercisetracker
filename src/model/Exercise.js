const { Schema, model } = require('mongoose');
const exerciseSchema = new Schema({
  description: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: new Date()
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
},
{
  toJSON: { virtuals: true }, // So `res.json()` and other `JSON.stringify()` functions include virtuals
  toObject: { virtuals: true } // So `console.log()` and other functions that use `toObject()` include virtuals
})

exerciseSchema.virtual('user', {
  ref: 'User',
  localField: 'user_id',
  foreignField: '_id'
});

module.exports = model('Exercise', exerciseSchema, 'Exercise');