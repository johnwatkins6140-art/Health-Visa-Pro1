import { Router, type IRouter } from "express";
import healthRouter from "./health";
import visaApplicationsRouter from "./visaApplications";
import paystackRouter from "./paystack";
import paypalRouter from "./paypal";

const router: IRouter = Router();

router.use(healthRouter);
router.use(visaApplicationsRouter);
router.use(paystackRouter);
router.use(paypalRouter);

export default router;
