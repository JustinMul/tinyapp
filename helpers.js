
const getUserByEmail = function(email,database) {
  
  for (const key in database) {
    if (email ===  database[key]['email']) {
      return key;
    }
  }
};

module.exports = {getUserByEmail};

