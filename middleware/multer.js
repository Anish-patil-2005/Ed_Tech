import multer from "multer"
import {v4 as uuid} from "uuid"

const storage = multer.diskStorage({
    destination(req,files,cb){
        cb(null, "uploads")
    },

    filename(req,file,cb){
        const id = uuid()
        const extName = file.originalname.split(".").pop(); // get jpg , .pdf,.png extensionName
        const fileName = `${id}.${extName}` // id.pdf or kindof.
        cb(null, fileName);
    }
});

export const uploadFiles = multer({storage}).single("file");