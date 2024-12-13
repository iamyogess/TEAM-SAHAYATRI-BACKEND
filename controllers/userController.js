import { UserModel } from "./../models/UserMode.js";
import { uploadPicture } from "./../middlewares/uploadPictures.js";
import { fileRemover } from "../utils/fileRemover.js";
import bcrypt from "bcrypt";
import JWT from "jsonwebtoken";

// @des user login
// @access all
// @route api/users/register
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !password || !email) {
      return res.status(400).json({
        message: "All fields are required!",
      });
    }

    let user = await UserModel.findOne({ email });
    // if (email) {
    //   user = await UserModel.findOne({ email });
    // } else if (phoneNo) {
    //   user = await UserModel.findOne({ phoneNo });
    // }

    if (user) {
      return res.status(400).json({
        message: "User already exists with the provided email!",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      parseInt(process.env.SALT_ROUNDS || 10)
    );

    const newUser = new UserModel({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    const token = JWT.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return res.status(201).json({
      message: "User registered successfully!",
      token,
    });
  } catch (error) {
    next(error);
  }
};

// @desc login registered user
// @access all
// @router api/users/login
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required to login.",
      });
    }

    if (!password) {
      return res.status(400).json({
        message: "Password is required to login.",
      });
    }

    let user = await UserModel.findOne({ email });

    // if (email) {
    //   user = await UserModel.findOne({ email });
    // } else if (phoneNo) {
    //   user = await UserModel.findOne({ phoneNo });
    // }

    if (!user) {
      return res.status(404).json({
        message: "Invalid credentials. Please try again.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid credentials. Please try again.",
      });
    }

    const token = JWT.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({
      message: "User logged in successfully!",
      success: true,
      user: {
        name: user.name,
        email: user.email,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc user profile
// @access loggedUser,
// @route api/users/profile
export const getUserProfile = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(400).json({ message: "User not authenticated" });
    }

    const user = await UserModel.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      phoneNo: user.phoneNo,
      profile: user.profile,
      verified: user.verified,
      role: user.role,
      success: true,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// @desc upload profile picture
// @access loggedUser
// @route api/users/upload-profile
export const uploadProfilePicture = async (req, res, next) => {
  try {
    const upload = uploadPicture.single("profilePicture");
    upload(req, res, async function (err) {
      if (err) {
        throw new Error(
          "An unknown error occurred when uploading " + err.message
        );
      } else {
        if (req.file) {
          let filename;
          let updatedUser = await UserModel.findById(req.user._id);
          filename = updatedUser.profilePicture;
          if (filename) {
            fileRemover(filename);
          }
          updatedUser.profilePicture = req.file.filename;
          await updatedUser.save();
          return res
            .status(200)
            .json({ message: "Profile picture updated successfully!" });
        } else {
          let filename;
          let updatedUser = await User.findById(req.user._id);
          filename = updatedUser.profilePicture;
          updatedUser.profilePicture = "";
          await updatedUser.save();
          fileRemover(filename);
          res.json({
            _id: updatedUser._id,
            avatar: updatedUser.profilePicture,
            name: updatedUser.name,
            email: updatedUser.email,
            verified: updatedUser.verified,
            admin: updatedUser.admin,
            token: await updatedUser.generateJWT(),
          });
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc become a guide request
// @access normal user
// @route api/users/guide-request
export const becomeAGuideRequest = async (req, res, next) => {
  try {
    // check if user exist or not
    const user = await UserModel.findById(req.user._id);
    if (!user) {
      return res
        .status(400)
        .json({ message: "User not found!", success: false });
    }

    // check if user is verified or not
    if (!user.verified) {
      return res.status(400).json({
        message:
          "You are not verified, please upload your documents to be verified!",
      });
    }

    //check if user is already a guide?
    if (user.role === "guide") {
      return res
        .status(400)
        .json({ message: "You make this request. You are already a guide!" });
    }

    //check if user has already request to become guide
    if (user.becomeAGuide) {
      return res
        .status(400)
        .json({ message: "You have already requested to become a guide!" });
    }

    user.becomeAGuide = true;
    await user.save();

    return res.status(200).json({
      message: "Guide request submitted successfully!",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

// @desc approve guide request
// @access admins only
// @route api/users/approve-guide-request/:id
export const approveGuideRequest = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) {
      return res
        .status(400)
        .json({ message: "User not found!", success: false });
    }

    if (!user.verified) {
      return res.status(400).json({
        message: "User is not verified! User must be verified!",
        success: false,
      });
    }

    //check if user has uploaded any documents
    if (!user.documents) {
      return res.status(400).json({
        message: "Requested user has not uploaded any documents!",
        success: false,
      });
    }

    //check if user has requested to become a guide or not
    if (!user.becomeAGuide) {
      return res.status(400).json({
        message: "User has not requested to become a guide!",
        success: false,
      });
    }

    // alter roles
    user.role = "guide";
    user.becomeAGuide = false;
    await user.save();

    return res
      .status(200)
      .json({ message: "Guide approved successfully!", success: true });
  } catch (error) {
    next(error);
  }
};

// @desc revoke guide permission
// @access admins only
// @route api/users/revoke-guide-permission
export const revokeGuidePermission = async (req, res, next) => {
  const user = await UserModel.findById(req.params.id);
  if (!user) {
    return res.status(400).json({ message: "User not found!" });
  }
  user.becomeAGuide = false;
  user.verified = false;
  user.role = "normal";

  await user.save();

  return res
    .status(200)
    .json({ message: "Guide permission revoked successfully!" });
};

//@desc get guide verification request
// @access admins only
// @route api/users/get-guide-verification

export const getGuideVerificationRequest = async (req, res, next) => {
  const user = await UserModel.find({ becomeAGuide: true }).select("-password");
  if (!user) {
    return res.status(400).json({ message: "No user found!", success: false });
  }
  return res
    .status(200)
    .json({ user, message: "Guide requests!", success: true });
};

// @desc getVerifiedGuides
// @access all
// @route api/users/get-verified-guides
export const verifiedGuide = async (req, res, next) => {
  try {
    const verifiedGuides = await UserModel.find({
      verified: true,
      role: "guide",
    });
    return res.status(200).json({ message: "Verified guides", verifiedGuides });
  } catch (error) {
    next(error);
  }
};

// @desc upload user documents
// @access logged users
// @ api/users/upload-user-documents

export const uploadUserDocuments = async (req, res, next) => {
  try {
    const upload = uploadPicture.array("userDocuments", 3);

    upload(req, res, async function (err) {
      if (err) {
        throw new Error("An unknown error occurred when uploading" + err);
      } else {
        if (req.files && req.files.length > 0) {
          let updatedUser = await UserModel.findById(req.user._id);

          //delete old documents
          if (updatedUser.documents && updatedUser.documents.length > 0) {
            updatedUser.documents.forEach((filename) => {
              fileRemover(filename);
            });
          }

          //upload new documents
          updatedUser.documents = req.files.map((file) => file.filename);
          updatedUser.verified = true;
          await updatedUser.save();

          // json web token
          const token = JWT.sign(
            {
              id: updatedUser._id,
              name: updatedUser.name,
              email: updatedUser.email,
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
          );

          res.status(200).json({
            user: updatedUser._id,
            email: updatedUser.email,
            phoneNo: updatedUser.phoneNo,
            verified: updatedUser.verified,
            role: updatedUser.role,
            token,
          });
        } else {
          return res.status(400).json({ message: "No files were uploaded!" });
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc book guide
// @access verified users
// @route api/users/book-guide

// export const bookGuide = async (req, res, next) => {
//   try {
//     const { guideId, location, timePeriod, people } = req.body;

//     if (!guideId || !location || !timePeriod || !people) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     const [startDate, endDate] = timePeriod
//       .split(" to ")
//       .map((date) => new Date(date));
//     if (isNaN(startDate) || isNaN(endDate)) {
//       return res.status(400).json({ message: "Invalid time period format" });
//     }

//     const user = await UserModel.findById(req.user._id);
//     if (!user) {
//       return res.status(400).json({ message: "User does not exist" });
//     }

//     if (user.role !== "normal") {
//       return res
//         .status(400)
//         .json({ message: "Only normal users can book a guide!" });
//     }

//     // Fetch the guide to be booked
//     const guide = await UserModel.findById(guideId);
//     if (!guide) {
//       return res.status(404).json({ message: "Guide does not exist" });
//     }

//     if (guide.role !== "guide" || !guide.verified) {
//       return res
//         .status(400)
//         .json({ message: "You can only book verified guides!" });
//     }

//     // Check for overlapping reservations
//     const overlappingReservation = guide.reservations.some((reservation) => {
//       const resStart = new Date(reservation.timePeriod.split(" to ")[0]);
//       const resEnd = new Date(reservation.timePeriod.split(" to ")[1]);
//       return (
//         (startDate >= resStart && startDate <= resEnd) || // New reservation starts during an existing reservation
//         (endDate >= resStart && endDate <= resEnd) || // New reservation ends during an existing reservation
//         (startDate <= resStart && endDate >= resEnd) // New reservation fully overlaps an existing reservation
//       );
//     });

//     if (overlappingReservation) {
//       return res.status(400).json({
//         message: "The guide is already reserved for the requested time period",
//       });
//     }

//     // Create a new reservation
//     const reservation = {
//       location,
//       timePeriod,
//       people,
//       reservedBy: user._id,
//       guide: guideId,
//     };

//     // Add the reservation to the guide's reservations
//     guide.reservationStatus = true;
//     guide.reservations.push(reservation);
//     user.reservation.push(reservation);
//     await guide.save();

//     return res.status(201).json({
//       message: "Guide booked successfully",
//       reservation,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// @desc release guide
// @access users who booked guide
// @route api/users/release-guide
export const releaseGuide = async (req, res, next) => {
  try {
    const { guideId } = req.body;

    const guide = await UserModel.findById(guideId);
    const user = await UserModel.findById(req.user._id);
    if (!guide) {
      return res.status(404).json({ message: "Guide does not exist" });
    }
    // const reservation = {
    //   location: "",
    //   timePeriod: "",
    //   people: "",
    //   reservedBy: "",
    //   guide: "",
    // };

    // guide.reservations.push(reservation);
    guide.reservationStatus = false;
    guide.reservations = [];
    user.reservations = [];
    await guide.save();

    return res
      .status(200)
      .json({ message: "Guide reservation status updated to available" });
  } catch (error) {
    next(error);
  }
};

// @desc shows users who booked guide
// @access admin
// @route api/users/booked-users
export const bookedUsers = async (req, res, next) => {
  //users who booked the guide
  try {
    const user = await UserModel.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }
    const customers = user.reservations;
    console.log(customers);
    return res.status(200).json({ message: "Your customers!", customers });
  } catch (error) {
    next(error);
  }
};

// @desc book guide, it calculates cost for the trip, profit for the company, tds reduction,
// @access verified users
// @route api/users/book-guide

export const bookGuide = async (req, res, next) => {
  try {
    const { guideId, location, timePeriod, people } = req.body;

    if (!guideId || !location || !timePeriod || !people) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const [startDate, endDate] = timePeriod
      .split(" to ")
      .map((date) => new Date(date));
    if (isNaN(startDate) || isNaN(endDate)) {
      return res.status(400).json({ message: "Invalid time period format" });
    }

    const user = await UserModel.findById(req.user._id);
    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }

    if (user.role !== "normal") {
      return res
        .status(400)
        .json({ message: "Only normal users can book a guide!" });
    }

    const guide = await UserModel.findById(guideId);
    if (!guide) {
      return res.status(404).json({ message: "Guide does not exist" });
    }

    if (guide.role !== "guide" || !guide.verified) {
      return res
        .status(400)
        .json({ message: "You can only book verified guides!" });
    }

    const overlappingReservation = guide.reservations.some((reservation) => {
      const resStart = new Date(reservation.timePeriod.split(" to ")[0]);
      const resEnd = new Date(reservation.timePeriod.split(" to ")[1]);
      return (
        (startDate >= resStart && startDate <= resEnd) ||
        (endDate >= resStart && endDate <= resEnd) ||
        (startDate <= resStart && endDate >= resEnd)
      );
    });

    if (overlappingReservation) {
      return res.status(400).json({
        message: "The guide is already reserved for the requested time period",
      });
    }

    // Calculate cost
    const durationInMilliseconds = endDate - startDate;
    const durationInHours = durationInMilliseconds / (1000 * 60 * 60);

    if (durationInHours <= 0) {
      return res.status(400).json({ message: "Invalid time period" });
    }

    const oneHourCost = 400;
    const totalCost = oneHourCost * durationInHours;
    const tds = totalCost * 0.05; // 5% TDS
    const profitMargin = totalCost * 0.15; // 15% profit margin
    const finalCost = totalCost + tds + profitMargin;
    const afterTdsAndProfile = totalCost - tds - profitMargin;

    // Create a new reservation
    const reservation = {
      location,
      timePeriod,
      people,
      reservedBy: user._id,
      guide: guideId,
      cost: {
        totalCost,
        tds,
        profitMargin,
        finalCost,
      },
    };

    // Add the reservation to the guide's reservations
    guide.reservationStatus = true;
    guide.reservations.push(reservation);
    user.reservation.push(reservation);
    await guide.save();

    return res.status(201).json({
      message: "Guide booked successfully",
      reservation,
    });
  } catch (error) {
    next(error);
  }
};



// not required 
export const costCalculation = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    if (!user.reservationStatus) {
      return res
        .status(400)
        .json({ message: "User has not reserved a guide!", success: false });
    }

    const reservation = user.reservations.find(
      (reservation) => reservation.reservedBy.toString() === user._id.toString()
    );

    if (!reservation) {
      return res
        .status(404)
        .json({ message: "Reservation not found for this user!" });
    }

    const [startDate, endDate] = reservation.timePeriod
      .split(" to ")
      .map((date) => new Date(date));

    // Calculate the difference between the start and end dates in hours
    const durationInMilliseconds = endDate - startDate;
    const durationInHours = durationInMilliseconds / (1000 * 60 * 60); //ms

    if (durationInHours <= 0) {
      return res.status(400).json({ message: "Invalid time period" });
    }

    const oneHourCost = 400;
    const totalCost = oneHourCost * durationInHours;

    const tds = totalCost * 0.05;
    const finalCost = totalCost + tds;

    return res.status(200).json({
      message: "Cost calculated successfully",
      totalCost,
      tds,
      finalCost,
    });
  } catch (error) {
    next(error);
  }
};
