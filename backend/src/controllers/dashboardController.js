import { fetchDashboardStatistics } from "../services/dashboardService.js";

// @desc    Get dashboard statistics for Admin
// @route   GET /api/admin/dashboard/stats
// @access  Admin
export const getDashboardStats = async (req, res) => {
  try {
    const stats = await fetchDashboardStatistics();
    res.status(200).json(stats);
  } catch (error) {
    console.error("Error in getDashboardStats controller:", error);
    res
      .status(error.statusCode || 500) // Use statusCode from service error if available
      .json({
        message: error.message || "Error fetching dashboard statistics",
        // Optionally, you might not want to expose originalError in production
        // error: error.originalError ? error.originalError.message : error.message
      });
  }
};
