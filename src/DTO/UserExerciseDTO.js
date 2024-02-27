class UserExerciseDTO {
  _id;
  username;
  date;
  duration;
  description;

  constructor(data) {
    this._id = data.user_id;
    this.username = data.user[0].username;
    this.date = data.date.toDateString();
    this.duration = data.duration;
    this.description = data.description;
  }
}

module.exports = UserExerciseDTO;