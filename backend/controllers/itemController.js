import { Item } from "../models/itemModel.js";
import { User } from "../models/userModel.js";
import { Household } from "../models/householdModel.js";
import mongoose from "mongoose";
import { getItemStatus } from "../utils/getItemStatus.js";

export const getItems = async (req, res) => {
  try {
    const { status, category } = req.query;
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.householdId) {
      return res
        .status(400)
        .json({ message: "User should belong to a household" });
    }

    const filter = {
      householdId: user.householdId,
    };

    if (status) filter.status = status;
    if (category) filter.category = category;

    const items = await Item.find(filter)
      .populate("addedBy", "name email")
      .sort({ expiryDate: 1 });
    return res.status(200).json({ items });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", err: err.message });
  }
};

export const addItems = async (req, res) => {
  try {
    const { name, category, quantity, expiryDate, status } = req.body;
    const userId = req.userId;
    const user = await User.findById(userId);
    const householdId = user.householdId;
    if (!name || !category || !quantity || !expiryDate || !status) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    if (!householdId) {
      return res.status(400).json({ message: "User not in any household" });
    }
    const item = await Item.create({
      householdId,
      addedBy:userId,
      name,
      category,
      quantity,
      expiryDate,
      status,
    });
    return res.status(201).json({ item });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", err: err.message });
  }
};

export const updateItem = async (req, res) => {
  try {
    const { name, category, quantity, expiryDate } = req.body;
    const { id } = req.params;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid item Id" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.householdId) {
      return res.status(400).json({ message: "User not in any household" });
    }

    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (item.householdId.toString() !== user.householdId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (!item.addedBy || !item.addedBy.equals(userId)) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this item" });
    }

    if (name) item.name = name;
    if (category) item.category = category;
    if (quantity !== undefined) item.quantity = quantity;
    if (expiryDate) {
      item.expiryDate = expiryDate;
      item.status = getItemStatus(expiryDate);
    }

    const updatedItem = await item.save();

    return res.status(200).json({ message: "Item updated", item: updatedItem });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", err: err.message });
  }
};

export const markItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.userId;
    const allowedStatus = ["used", "wasted"];

    if (!allowedStatus.includes(status)) {
      return res
        .status(400)
        .json({ message: "Invalid status. Status must be used or wasted" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid item ID" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.householdId) {
      return res.status(400).json({ message: "User not in any household" });
    }

    const item = await Item.findById(id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (item.householdId.toString() !== user.householdId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (["used", "wasted"].includes(item.status)) {
      return res
        .status(400)
        .json({ message: `Item already marked as ${item.status}` });
    }

    item.status = status;
    const updatedItem = await item.save();
    return res
      .status(200)
      .json({ message: "Status changed", item: updatedItem });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", err: err.message });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }
    const deleteItem = await Item.findByIdAndDelete(id);
    if (!deleteItem) {
      return res.status(404).json({ message: "Item not found" });
    }
    return res.status(200).json({ message: "Item deleted", item: deleteItem });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", err: err.message });
  }
};
