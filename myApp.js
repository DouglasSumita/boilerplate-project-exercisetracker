const express = require('express');
const app = express();
const UserModel = require('./src/model/User');
const ExerciseModel = require('./src/model/Exercise');
const { StatusCodes } = require('http-status-codes');

const UserExerciseLogsDTO = require('./src/DTO/UserExerciseLogsDTO');
const UserDTO = require('./src/DTO/UserDTO');
const UserExerciseDTO = require('./src/DTO/UserExerciseDTO');

const checkUserName = (req, res, next) => {
  const { username } = req.body;
  if (!username) {
    res.status(StatusCodes.BAD_REQUEST).send({
       error: 'Invalid username' 
    });
    return
  }
  next();
}

const convertDateStringFormatToDate = (str) => {
  const regex = /(^\d{4}-\d{2}-\d{2})$/g;
  
  if (!str) {
    return null;
  }
  
  const match = str.match(regex);
  if (!match) return null;

  return new Date(match[0]);
}

app.get('/api/users', (req, res) => {
  UserModel.find()
    .then((data) => {
      res.status(StatusCodes.OK)
        .send(data.map((user) => new UserDTO(user)));
    })
    .catch((err) => {
      console.log(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send(err);
    })
})

app.post('/api/users', checkUserName, (req, res) => {
  const userModel = new UserModel({
    username: req.body.username
  })
  
  userModel.save()
    .then((data) => {
      res.status(StatusCodes.CREATED).send(new UserDTO(data));
    })
    .catch((err) => {
      console.log(err);
    })
})

const checkExerciseValues = (req, res, next) => {
  const { _id } = req.params;
  const { description, date } = req.body;
  const duration = parseInt(req.body.duration);
  const error = { msg: []};

  if (!_id) error.msg.push('_id is required!');
  if (!description) error.msg.push('description is required!');
  if (!duration) error.msg.push('duration is required or greather than 0');

  if (date) {
    const parsedDate = convertDateStringFormatToDate(date);
    if (!parsedDate || parsedDate && parsedDate.toString() === 'Invalid Date') {
      error.msg.push('Invalid date');
    }
  }

  if (error.msg.length > 0) {
    res.status(StatusCodes.BAD_REQUEST).send(error);
    return;
  }
  
  next();

}

app.post('/api/users/:_id/exercises', checkExerciseValues, async (req, res) => {

  const { _id } = req.params;
  const { description, date } = req.body;
  const duration = parseInt(req.body.duration); 
  
  const convertedDate = convertDateStringFormatToDate(date)

  const exerciseObj = {
    user_id: _id,
    description: description,
    duration: duration
  }

  if (convertedDate) {
    exerciseObj.date = convertedDate;
  } 

  const exercise = ExerciseModel(exerciseObj);
  
  const doc = await exercise.save();
  const data = await ExerciseModel.findById(doc._id)
    .populate({
      path: 'user',
      select: 'username'
    })
    .exec();

  res.status(StatusCodes.CREATED).send(new UserExerciseDTO(data));
})

const checkIfTheUserExists = async (req, res, next) => {
  const userId = req.params._id;
  let user;
  try {
    user = await UserModel
    .findById(userId);
  } catch(err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      error: err
    });
    return
  }
  
  if (!user) {
    res.status(StatusCodes.BAD_REQUEST).send({
      error: 'Invalid or not found user'
    });
    return;
  }

  next();
}

const getMatchDateObject = (initialDate, finalDate) => {
  
  const match = { 
    date: {}
  };

  if (initialDate) match.date['$gte'] = initialDate;
  if (finalDate) match.date['$lte'] = finalDate;

  return (initialDate || finalDate) ? match : {};
}

app.get('/api/users/:_id/logs', checkIfTheUserExists, async (req, res) => {
  const userId = req.params._id;
  const { from, to } = req.query;
  const limit = Number(req.query.limit);
  
  const match = getMatchDateObject(convertDateStringFormatToDate(from), convertDateStringFormatToDate(to));

  const data = await UserModel
    .findById(userId)
    .populate({ 
      path: 'log', 
      select: 'description duration date -_id -user_id', 
      options: { limit: limit },
      match: match
    })
    .select({ username: true })
    .exec();
 
  res.send(new UserExerciseLogsDTO(data));
});

module.exports = app;