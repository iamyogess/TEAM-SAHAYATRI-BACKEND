import { UserModel } from "./../models/UserMode.js";

// @des user login
// @access all
// @route api/users/register
export const registerUser = async (req, res, next) => {
  const { name, email, password, phoneNo } = req.body;
  try {
    //check inputs
    if (!name || !password || (!email && !phoneNo)) {
      return res
        .status(400)
        .json({ message: "All fields are required!", success: false });
    }
    //check if user exists
    let user;
    if (email) {
      user = await UserModel.find({ email });
    } else if (phoneNo) {
      await UserModel.find({ phoneNo });
    }
    if (user) {
      return res.status(400).json({
        message: "User already exist with provided username or phone number!",
        success: false,
      });
    }

    const newUser = new UserModel({
      name,
      email,
      phoneNo,
      password,
    });
    //save user
    await newUser.save();

    return res.status(200).json({ message: "User registered!", success: true });
  } catch (error) {
    next(error);
  }
};

// @desc login registered user
// @access all
// @router api/users/login
export const loginUser = async (req, res, next) => {
  const { email, phoneNo, password } = req.body;
  try {
    if (!password || (!phoneNo && !email)) {
      return res
        .status(400)
        .json({ message: "All fields are required!", success: true });
    }

    // check if user exists or not
    let existingUser;
    if (email) {
      existingUser = await UserModel.find({ email });
    } else if (phoneNo) {
      existingUser = await UserModel.find({ phoneNo });
    }

    if (!existingUser) {
      return res
        .status(400)
        .json({ message: "User not found!", success: false });
    }
  } catch (error) {
    next(error);
  }
};
