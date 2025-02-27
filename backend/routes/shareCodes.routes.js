import express from "express";

import {share , fetchcode} from "../controller/shareCodes.controller.js";

    const router=express.Router();

    router.post("/share",share);
    router.get("/code/:room",fetchcode);

export default router;