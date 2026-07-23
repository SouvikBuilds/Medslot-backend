import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { asyncHandler, ApiError, ApiResponse } from "../utils/index.js";
import config from "../config/envConfig.js";
import { sendMail } from "../service/mail.service.js";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
};

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save({
      validateBeforeSave: false,
    });

    return {
      accessToken,
      refreshToken,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh token",
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name?.trim() || !email?.trim() || !password?.trim()) {
    throw new ApiError(400, "All fields are required and they can't be empty");
  }

  const userExistence = await User.findOne({
    email: email.trim(),
  });

  if (userExistence) {
    throw new ApiError(409, "User with this email already exists");
  }

  const newUser = await User.create({
    name: name.trim(),
    email: email.trim(),
    password,
  });

  const createdUser = await User.findById(newUser._id).select(
    "-password -refreshToken -magicToken",
  );

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User created successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email?.trim() || !password?.trim()) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({
    email: email.trim(),
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Password is incorrect");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id,
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
          },
        },
        "User logged in successfully",
      ),
    );
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token is required");
  }

  let decodedToken;

  try {
    decodedToken = jwt.verify(incomingRefreshToken, config.refreshToken);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await User.findById(decodedToken?._id);

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  if (incomingRefreshToken !== user.refreshToken) {
    throw new ApiError(401, "Refresh token is expired or used");
  }

  const { accessToken, refreshToken: newRefreshToken } =
    await generateAccessAndRefreshToken(user._id);

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", newRefreshToken, cookieOptions)
    .json(new ApiResponse(200, {}, "Access token refreshed successfully"));
});

const logOutUser = asyncHandler(async (req, res) => {
  console.log("Logout calling");
  if (!req.user?._id) {
    console.log("User not authenticated");
    throw new ApiError(403, "User is not authenticated");
  }

  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    },
  );

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const getUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully"));
});

const requestMagicLink = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email?.trim()) {
    throw new ApiError(400, "Email is required");
  }

  const user = await User.findOne({
    email: email.trim(),
  });

  if (!user) {
    throw new ApiError(404, "User with this email does not exist");
  }

  const magicToken = user.generateMagictoken();

  user.magicToken = magicToken;

  await user.save({
    validateBeforeSave: false,
  });

  const magicLink = `http://localhost:5173/magic-login?token=${magicToken}`;

  const mailOptions = {
    from: `"Medslot Auth" <csouvik2006@gmail.com>`,
    to: user.email,
    subject: "Your Medslot Magic Login Link",
    html: `
      <h2>Hello ${user.name},</h2>
      <p>Click the button below to login to your Medslot account.</p>
      <a
        href="${magicLink}"
        style="
          display: inline-block;
          padding: 10px 20px;
          background: #5F6FFF;
          color: white;
          text-decoration: none;
          border-radius: 5px;
        "
      >
        Login to Medslot
      </a>
      <p>This link will expire soon and can only be used once.</p>
      <p>If you did not request this, you can safely ignore this email.</p>
    `,
  };

  await sendMail(mailOptions);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Magic link sent successfully"));
});

const verifyMagicLink = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    throw new ApiError(400, "Magic token is required");
  }

  let decodedToken;

  try {
    decodedToken = jwt.verify(token, config.magicToken);
  } catch (error) {
    throw new ApiError(401, "Magic link is invalid or expired");
  }

  const user = await User.findById(decodedToken?._id);

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  if (!user.magicToken || token !== user.magicToken) {
    throw new ApiError(401, "Magic link is invalid or already used");
  }

  user.magicToken = undefined;

  await user.save({
    validateBeforeSave: false,
  });

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id,
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
          },
        },
        "User logged in successfully using magic link",
      ),
    );
});

export {
  registerUser,
  loginUser,
  refreshAccessToken,
  logOutUser,
  getUser,
  requestMagicLink,
  verifyMagicLink,
};
