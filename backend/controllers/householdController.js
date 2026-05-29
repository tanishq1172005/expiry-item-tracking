import { generateInviteCode } from "../utils/generateInviteCode.js";
import { User } from "../models/userModel.js";
import { Household } from "../models/householdModel.js";
import mongoose from "mongoose";

export const addHousehold = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.userId;

    if (!name) {
      return res.status(400).json({ message: "Household name is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.householdId) {
      return res
        .status(400)
        .json({ message: "User already belongs to a household" });
    }

    const nameExists = await Household.findOne({ name });
    if (nameExists) {
      return res
        .status(400)
        .json({ message: "This name already exists choose a different one" });
    }

    let inviteCode = generateInviteCode();
    while (await Household.findOne({ inviteCode })) {
      inviteCode = generateInviteCode();
    }

    const household = await Household.create({
      name,
      members: [userId],
      inviteCode,
    });

    user.householdId = household._id;
    await user.save();

    return res
      .status(201)
      .json({ message: "New household created", household });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", err: err.message });
  }
};

export const joinHousehold = async (req, res) => {
  try {
    const { inviteCode } = req.body;
    const userId = req.userId;

    if (!inviteCode) {
      return res.status(400).json({ message: "No invite code" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.householdId) {
      return res
        .status(400)
        .json({ message: "User already belongs to a household" });
    }

    const household = await Household.findOne({
      inviteCode: inviteCode.toUpperCase(),
    });
    if (!household) {
      return res.status(400).json({ message: "Invalid invite code" });
    }

    if (!household.members.some((member) => member.equals(userId))) {
      household.members.push(userId);
      await household.save();
    }

    user.householdId = household._id;
    await user.save();

    return res.status(200).json({ message: "Added to household", household });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", err: err.message });
  }
};

export const getMembers = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ messsage: "Invalid id" });
    }
    const members = [] 
    const household = await Household.findById(id);
    if (!household) {
      return res.status(404).json({ message: "Household not found" });
    }
    for (let i=0;i<household.members.length;i++){
      members.push(await User.findById(household.members[i]))
    }
    return res.status(200).json({ members: members });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", err: err.message });
  }
};

export const myHousehold = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    const householdId = user.householdId;
    if (!householdId) {
      return res.status(400).json({ message: "User is not in any household" });
    }
    const household = await Household.findById(householdId);
    if (!household) {
      return res.status(400).json({ message: "Household has been deleted" });
    }
    return res
      .status(200)
      .json({ message: `The user belongs to ${household.name}` });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", err: err.message });
  }
};
