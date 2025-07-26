import {Router} from "express"
import { addLecture, createCourse, deleteCourse, deleteLecture, getAllStats, getAllUsers, updateRole } from "../controllers/admin.controllers.js";
import {isAdmin, isAuth} from "../middleware/isAuth.js"
import {uploadFiles} from "../middleware/multer.js"
const router = Router();

router.post('/course/new',isAuth,isAdmin,uploadFiles, createCourse)
router.post('/course/:id',isAuth,isAdmin,uploadFiles,addLecture)
router.delete('/course/:id',isAuth,isAdmin,deleteCourse)
router.delete('/lecture/:id',isAuth,isAdmin,deleteLecture)
router.get('/stats',isAuth,isAdmin,getAllStats)
router.put('/user/:id',isAuth,isAdmin, updateRole);
router.get('/users',isAuth,isAdmin,getAllUsers);

export default router;