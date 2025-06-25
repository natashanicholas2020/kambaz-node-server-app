import UserModel from "./model.js";
import { v4 as uuidv4 } from "uuid";

export const createUser = async (user) => {
  const newUser = new UserModel({ ...user, _id: uuidv4() });
  return await newUser.save();
};

export const findAllUsers = () => UserModel.find();

export const findUserById = (userId) => UserModel.findById(userId);

export const findUserByUsername = (username) => UserModel.findOne({ username });

export const findUserByCredentials = (username, password) =>
  UserModel.findOne({ username, password });

export const updateUser = (userId, user) =>
  UserModel.updateOne({ _id: userId }, { $set: user });

  export const deleteUser = (userId) => UserModel.deleteOne({ _id: userId });

export const findUsersByPartialName = (partialName) => {
  const regex = new RegExp(partialName, "i");
  return UserModel.find({
    $or: [{ firstName: { $regex: regex } }, { lastName: { $regex: regex } }],
  });
};

