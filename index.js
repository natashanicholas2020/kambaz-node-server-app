import express from "express";
import Lab5 from "./Lab5/index.js";
import cors from "cors";
import UserRoutes from "./Kambaz/Users/routes.js";

const app = express();
app.use(cors());       
app.use(express.json());   
Lab5(app);
UserRoutes(app);                     
app.listen(4000);