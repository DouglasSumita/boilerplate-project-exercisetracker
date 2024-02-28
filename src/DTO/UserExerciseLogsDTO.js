class UserExerciseLogsDTO {
  constructor(data) {
    this._id = data._id;
    this.username = data.username;
    this.count = data.log.length
    this.log = data.log.map((exercise) => { 
      return {
        description: exercise.description,
        duration: exercise.duration,
        date: exercise.date.toDateString()
      } 
    })
  }
}

module.exports = UserExerciseLogsDTO;