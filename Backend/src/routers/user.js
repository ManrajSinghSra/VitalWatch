import express from "express";
import * as userC from "../controllers/user.js";
import { body } from "express-validator";
export const userRouter = express.Router();
import { Auth } from "../middleware/Auth.js";

// Register Route
userRouter.post(
  "/register",
  [
    body("name")
      .isLength({ min: 3 })
      .withMessage("Name must be at least 3 characters long"),
    body("emailId")
      .isEmail()
      .withMessage("Email must be a valid email"),
    body("phone")
      .isLength({ min: 10, max: 10 })
      .withMessage("Phone number must be 10 digits")
      .isNumeric()
      .withMessage("Phone number must contain only numbers"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    body("role")
      .isIn(["user", "gymOwner"])
      .withMessage("Role must be either 'user' or 'gymOwner'"),
  ],
  userC.register
);

// Login Route
userRouter.post(
  "/login",
  [body("emailId").isEmail().withMessage("Email must be a valid email")],
  userC.login
);

// Profile Route
userRouter.get("/profile", Auth, userC.profile);


// Logout Route
userRouter.get("/logout", userC.logout);

// upcoming session
userRouter.post("/upcomingSession",Auth,userC.addUpcomingSession);


