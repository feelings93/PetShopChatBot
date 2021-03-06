import express from "express";
import homepageController from "../controllers/homepageController";

let router = express.Router();

let initWebRoutes = (app)=> {
    router.get("/", homepageController.getHomePage);
    router.get("/webhook", homepageController.getWebhook);
    router.post("/webhook", homepageController.postWebhook);
    router.post("/set-up-profile", homepageController.handleSetupProfile);
    router.get("/set-up-profile", homepageController.getSetupProfilePage);

    router.get("/info-order", homepageController.getInfoOrderPage);
    router.post("/set-info-order", homepageController.setInfoOrder);
    router.get("/reserve", homepageController.getReservePage);
    router.post("/reserve", homepageController.setReserve);
    router.post("/find-info-order", homepageController.findInfoOrder);

    return app.use("/", router);
};

module.exports = initWebRoutes;
