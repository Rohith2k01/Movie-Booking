const User = require('../models/user');

module.exports = {
  emailVerified: async (email, verifiedDate) => {
    try {
      console.log(verifiedDate)
      let updateObject = {
        emailVerifiedAt: verifiedDate,
      };

      const updatedEmailAt = await User.findOneAndUpdate(
        { email: email },
        {
          $set: updateObject,
        },
        { returnOriginal: false }
      );

      if (!updatedEmailAt) {
        // If no document was found and updated, return false
        return false;
      }

      return true

    } catch (error) {

      return false
    }
  }, 

  
  phoneVerified: async (phone, verifiedDate,userId) => {
    try {
      console.log(verifiedDate)
      let updateObject = {
        phoneVerifiedAt: verifiedDate,
      };


      const updatedPhoneAt = await User.findOneAndUpdate(
        { _id: userId },
        {
          $set: updateObject,
        },
        { returnOriginal: false }
      );

      if (!updatedPhoneAt) {
        // If no document was found and updated, return false
        return false;
      }

      return true

    } catch (error) {

      return false
    }
  },

};
