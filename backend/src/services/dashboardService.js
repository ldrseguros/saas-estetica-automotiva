import { PrismaClient } from "@prisma/client";
import {
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  subMonths,
  format,
} from "date-fns";

const prisma = new PrismaClient();

export const fetchDashboardStatistics = async () => {
  try {
    // 1. Bookings for today
    const today = new Date();
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);

    const bookingsToday = await prisma.booking.count({
      where: {
        date: {
          gte: startOfToday,
          lte: endOfToday,
        },
        // status: { not: 'cancelled' } // Optional: Filter out cancelled bookings
      },
    });

    // 2. Total bookings
    const totalBookings = await prisma.booking.count({
      // where: { status: { not: 'cancelled' } } // Optional: Filter out cancelled bookings
    });

    // 3. New clients per month (e.g., last 6 months)
    const monthsToQuery = 6;
    const clientCountsByMonth = [];
    for (let i = 0; i < monthsToQuery; i++) {
      const dateCursor = subMonths(today, i);
      const firstDayOfMonth = startOfMonth(dateCursor);
      const lastDayOfMonth = endOfMonth(dateCursor);

      const newClientsThisMonth = await prisma.clientProfile.count({
        where: {
          createdAt: {
            gte: firstDayOfMonth,
            lte: lastDayOfMonth,
          },
        },
      });
      clientCountsByMonth.push({
        month: format(firstDayOfMonth, "yyyy-MM"), // e.g., "2023-12"
        count: newClientsThisMonth,
      });
    }
    clientCountsByMonth.reverse(); // Oldest month first

    return {
      bookingsToday,
      totalBookings,
      newClientsPerMonth: clientCountsByMonth,
    };
  } catch (error) {
    console.error("Error in fetchDashboardStatistics service:", error);
    // Re-throw the error to be caught by the controller or a global error handler
    // Optionally, you can wrap it in a custom error object with a status code
    const serviceError = new Error(
      "Failed to fetch dashboard statistics from service."
    );
    // serviceError.statusCode = 500; // Or determine based on Prisma error codes
    // serviceError.originalError = error;
    throw serviceError; // Or simply: throw error;
  }
};
