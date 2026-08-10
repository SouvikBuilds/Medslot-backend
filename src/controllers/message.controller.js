import { isValidObjectId } from "mongoose";
import { Message } from "../models/message.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler, ApiResponse, ApiError } from "../utils/index.js";

const sendMessage = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (
    !name ||
    !email ||
    !subject ||
    !message ||
    name.trim() === "" ||
    email.trim() === "" ||
    subject.trim() === "" ||
    message.trim() === ""
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const newMessage = await Message.create({
    user: req.user?._id || null,
    name,
    email,
    subject,
    message,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newMessage, "Message sent Successfully"));
});

const getMyMessages = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.max(parseInt(req.query.limit) || 10, 1);
  const skip = (page - 1) * limit;

  const [messages, totalMessages] = await Promise.all([
    Message.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Message.countDocuments({ user: userId }),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        messages,
        pagination: {
          totalItems: totalMessages,
          totalPages: Math.ceil(totalMessages / limit),
          currentPage: page,
          limit,
          hasNextPage: page < Math.ceil(totalMessages / limit),
          hasPrevPage: page > 1,
        },
      },
      "Messages fetched successfully",
    ),
  );
});

export {
  sendMessage,
  getMyMessages
};
