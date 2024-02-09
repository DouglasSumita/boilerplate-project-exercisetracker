const express = require('express');
const app = express();
const UserModel = require('./src/model/User');
const ExerciseModel = require('./src/model/Exercise');
const { StatusCodes } = require('http-status-codes');

const checkUserName = (req, res, next) => {
  const { username } = req.body;
  if (!username) {
    res.status(StatusCodes.BAD_REQUEST).send({ error: 'Invalid username' });
    return
  }
  next();
}

app.post('/api/users', checkUserName, (req, res) => {
  const userModel = new UserModel({
    username: req.body.username
  })
  
  userModel.save()
    .then((user) => {
      res.send({
        username: user.username,
        _id: user._id
      });
    })
    .catch((err) => {
      console.log(err);
    })
})

const checkExerciseValues = (req, res, next) => {
  const { _id } = req.params;
  const { description } = req.body;
  const duration = parseInt(req.body.duration);
  const error = { error: ''};

  if (!_id || !description || !duration) {
    if (!_id) {
      error.error = '_id is required!'
    } else if (!description) {
      error.error = 'description is required!';
    } else if (!duration) {
      error.error = 'duration is required or greather than 0';
    }
    res.status(StatusCodes.BAD_REQUEST).send(error);
    return;
  }

  next();
}

app.post('/api/users/:_id/exercises', checkExerciseValues, async (req, res) => {

  const { _id } = req.params;
  const { description } = req.body;
  const duration = parseInt(req.body.duration); 
  
  const exercise = ExerciseModel({
    description: description,
    duration: duration,
    user: _id,
  })

  const doc = await exercise.save()

  res.status(StatusCodes.CREATED).send(doc);
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

app.get('/api/users/:_id/logs', checkIfTheUserExists, async (req, res) => {
  const userId = req.params._id;

  const logs = await UserModel
  .findById(userId)
  .populate('count')
  .populate({ path: 'log', select: 'description duration date -_id -user' })
  .select({ username: true })
  .exec();

  const response = logs.toObject();
  delete response.id;
  
  res.send(response);
});

module.exports = app;