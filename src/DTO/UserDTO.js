class UserDTO {
  _id;
  username;

  constructor(data) {
    this._id = data._id;
    this.username = data.username
  }
}

module.exports = UserDTO;