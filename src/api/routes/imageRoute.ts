import express from 'express';
import {body} from 'express-validator';
import {validate} from '../../middlewares';
import {imagePost, saveImage} from '../controllers/iamgeController';
// import multer, {FileFilterCallback} from 'multer';

// const fileFilter = (
//   request: Request,
//   file: Express.Multer.File,
//   cb: FileFilterCallback
// ) => {
//   if (file.mimetype.includes('image')) {
//     cb(null, true);
//   } else {
//     cb(null, false);
//   }
// };

// const upload = multer({dest: './uploads/', fileFilter});


const router = express.Router();

router.route('/generations').post(body('text').notEmpty().escape(), validate, imagePost, saveImage);
// router.route('/edits')
//   .post(
//     upload.single('file'),
//     // body('prompt').notEmpty().escape(), 
//     // body('image').notEmpty().escape(), 
//     // validate, 
//     saveEditedImage
//   );


export default router;
