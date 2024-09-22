import express from 'express';

import imageRoute from './routes/imageRoute';

import {MessageResponse} from '../types/MessageTypes';

const router = express.Router();

router.get<{}, MessageResponse>('/', (_req, res) => {
  res.json({
    message: 'routes: comments',
  });
});

router.use('/images', imageRoute);


export default router;
