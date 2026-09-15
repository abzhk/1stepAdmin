import User from "../model/user.model.js";
import Parent from "../model/parent.model.js";
import Provider from "../model/provider.model.js";

/**
 * Returns the correct full name for a user based on their role, skipping the User collection's username.
 * For Parent: fetches Parent collection's parentDetails.fullName.
 * For Provider/Centre: fetches Provider collection's fullName.
 */
export const getUserFullName = async (userId) => {
  try {
    const user = await User.findById(userId).populate("role").lean();
    if (!user) return "User";

    const roleName = user.role?.role || user.role?.name || user.role?.roleName || "";
    
    if (roleName.toLowerCase() === "parent") {
      const parent = await Parent.findOne({ userRef: userId }).lean();
      return parent?.parentDetails?.fullName || "Parent";
    }
    
    if (roleName.toLowerCase() === "provider" || roleName.toLowerCase() === "centre") {
      const provider = await Provider.findOne({ userRef: userId }).lean();
      return provider?.fullName || (roleName.toLowerCase() === "centre" ? "Centre" : "Provider");
    }

    return "User"; // Fallback for admin or other roles, ignoring username
  } catch (error) {
    console.error("Error fetching user full name:", error);
    return "User";
  }
};
