/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as activityLogs from "../activityLogs.js";
import type * as appointments from "../appointments.js";
import type * as auditLogs from "../auditLogs.js";
import type * as auth from "../auth.js";
import type * as backfillPlates from "../backfillPlates.js";
import type * as crons from "../crons.js";
import type * as customers from "../customers.js";
import type * as deliveries from "../deliveries.js";
import type * as http from "../http.js";
import type * as invoices from "../invoices.js";
import type * as jobs from "../jobs.js";
import type * as labourTypes from "../labourTypes.js";
import type * as leads from "../leads.js";
import type * as lib_audit from "../lib/audit.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_invoiceHelpers from "../lib/invoiceHelpers.js";
import type * as lib_rateLimit from "../lib/rateLimit.js";
import type * as lib_session from "../lib/session.js";
import type * as lib_totp from "../lib/totp.js";
import type * as migrations from "../migrations.js";
import type * as parts from "../parts.js";
import type * as payments from "../payments.js";
import type * as rateLimit from "../rateLimit.js";
import type * as salesOrders from "../salesOrders.js";
import type * as seed from "../seed.js";
import type * as seedAdvanced from "../seedAdvanced.js";
import type * as settings from "../settings.js";
import type * as twoFactor from "../twoFactor.js";
import type * as users from "../users.js";
import type * as vehicleBrands from "../vehicleBrands.js";
import type * as vehicles from "../vehicles.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  activityLogs: typeof activityLogs;
  appointments: typeof appointments;
  auditLogs: typeof auditLogs;
  auth: typeof auth;
  backfillPlates: typeof backfillPlates;
  crons: typeof crons;
  customers: typeof customers;
  deliveries: typeof deliveries;
  http: typeof http;
  invoices: typeof invoices;
  jobs: typeof jobs;
  labourTypes: typeof labourTypes;
  leads: typeof leads;
  "lib/audit": typeof lib_audit;
  "lib/auth": typeof lib_auth;
  "lib/invoiceHelpers": typeof lib_invoiceHelpers;
  "lib/rateLimit": typeof lib_rateLimit;
  "lib/session": typeof lib_session;
  "lib/totp": typeof lib_totp;
  migrations: typeof migrations;
  parts: typeof parts;
  payments: typeof payments;
  rateLimit: typeof rateLimit;
  salesOrders: typeof salesOrders;
  seed: typeof seed;
  seedAdvanced: typeof seedAdvanced;
  settings: typeof settings;
  twoFactor: typeof twoFactor;
  users: typeof users;
  vehicleBrands: typeof vehicleBrands;
  vehicles: typeof vehicles;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
