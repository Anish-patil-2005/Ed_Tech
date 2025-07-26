import { Router } from "express";
import { loginUser, myProfile, register, verifyUser } from "../controllers/user.controllers.js";
import { isAuth } from "../middleware/isAuth.js";
const router  = Router ();

router.post('/user/register',register)
export default router;

router.post('/user/verify', verifyUser)
router.post('/user/login', loginUser)
router.get('/user/myProfile', isAuth,myProfile)