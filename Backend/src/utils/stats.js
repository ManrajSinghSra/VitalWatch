import { SuperAdmin } from "../models/SuperAdmin.js";

export const incrementTotalUsers = async () => {
  await SuperAdmin.findOneAndUpdate( { role: "superadmin"},{ $inc: { "platformStats.totalUsers": 1 } } );
};

export const incrementTotalAdmins=async () => {
  await SuperAdmin.findOneAndUpdate( { role: "superadmin"},{ $inc: { "platformStats.totalAdmins": 1 } } )
}

export const decrementTotalAdmins=async () => {
  await SuperAdmin.findOneAndUpdate( { role: "superadmin"},{ $inc: { "platformStats.totalAdmins": -1 } } )
}