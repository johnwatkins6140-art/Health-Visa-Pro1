import { Router, type IRouter } from "express";
import healthRouter from "./health";
import visaApplicationsRouter from "./visaApplications";
import paystackRouter from "./paystack";

const router: IRouter = Router();

router.use(healthRouter);
router.use(visaApplicationsRouter);
router.use(paystackRouter);

export default router;
