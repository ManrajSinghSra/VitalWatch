import { Router } from "express";
import * as projectC from "../controllers/project.js"
import { Auth } from "../middleware/Auth.js";
import { body } from "express-validator";
export const projectRouter=Router();


projectRouter.post("/create",[body("name").isString().withMessage("Name Cannot be Empty")],Auth,projectC.create);
projectRouter.get("/all",Auth,projectC.allProjects)

projectRouter.put("/add",Auth,projectC.addUser)