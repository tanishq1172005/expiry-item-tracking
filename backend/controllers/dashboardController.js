import { Household } from "../models/householdModel.js";
import { User } from "../models/userModel.js";
import { Item } from "../models/itemModel.js";
import { getItemStatus } from "../utils/getItemStatus.js";

export const getStats = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const householdId = user.householdId;
    if (!householdId) {
      return res
        .status(400)
        .json({ message: "User does not belong to any household" });
    }

    const household = await Household.findById(householdId);
    if (!household) {
      return res.status(404).json({ message: "Household not found" });
    }

    const statusCounts = await Item.aggregate([
      { $match: { householdId: household._id } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const countsByStatus = {
      fresh: 0,
      "expiring-soon": 0,
      expired: 0,
      used: 0,
      wasted: 0,
    };

    for (const status of statusCounts) {
      countsByStatus[status._id] = status.count;
    }

    const totalItems = Object.values(countsByStatus).reduce(
      (total, count) => total + count,
      0
    );
    const wasteScore =
      totalItems === 0 ? 0 : Math.round((countsByStatus.used / totalItems) * 100);

    if (household.wasteScore !== wasteScore) {
      household.wasteScore = wasteScore;
      await household.save();
    }

    return res.status(200).json({
      message: "Dashboard stats",
      wasteScore,
      countsByStatus,
      totalItems,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", err: err.message });
  }
};

export const getExpiring = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const householdId = user.householdId;
    if (!householdId) {
      return res
        .status(400)
        .json({ message: "User does not belong to any household" });
    }

    const now = new Date();
    const next24hr = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const items = await Item.find({
      householdId,
      expiryDate: {
        $gte: now,
        $lte: next24hr,
      },
      status: {
        $nin: ["used", "wasted"],
      },
    })
      .sort({ expiryDate: 1 })
      .populate("addedBy", "name email");

    const updatedItems = await Promise.all(
      items.map(async (item) => {
        const status = getItemStatus(item.expiryDate);
        if (item.status !== status) {
          item.status = status;
          await item.save();
        }
        return item;
      })
    );

    return res.status(200).json({
      count: updatedItems.length,
      items: updatedItems,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", err: err.message });
  }
};
