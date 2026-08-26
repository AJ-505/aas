import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily("rateLimit cleanup", { hourUTC: 3, minuteUTC: 0 }, internal.rateLimit.cleanup, {});

export default crons;
