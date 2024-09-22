import {Request, Response, NextFunction} from 'express';
import fs from 'fs';
import https from 'https';

import fetchData from '../../lib/fetchData';
import CustomError from '../../classes/CustomError';
import { ImagesResponse } from 'openai/resources';

const imagePost = async (
  req: Request<{}, {}, {text: string}>,
  res: Response<{}, {url: string}>,
  next: NextFunction
) => {
  try {
    // Generate a YouTube thumbnail image using the OpenAI API. The thumbnail should be related to a video about a specific topic. For example, if the video is about space, the thumbnail could include stars, planets, or astronauts and possibly have splash text like "Explore the Universe!" You could also try to generate an image edit or variation of an existing image.
    // Use the text from the request body to generate the response.
    // Instead of using openai library, use fetchData to make a post request to the server.

    const options: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: req.body.text
      })
    };

    const response = await fetchData<ImagesResponse>(
      process.env.OPENAI_API_URL + '/v1/images/generations',
      options
    );

    if (!response.data[0].url) {
      next(new CustomError('image not generated', 500));
      return;
    }
    
    // console.log('imagepost res', response);
    res.locals.url = response.data[0].url;
    next();
    // see https://platform.openai.com/docs/api-reference/chat/create for more information
    // You don't need an API key if you use the URL provided in .env.sample and Metropolia VPN
    // Example: instad of https://api.openai.com/v1/chat/completions use process.env.OPENAI_API_URL + '/v1/chat/completions'

  } catch (error) {
    console.log(error);
    next(new CustomError((error as Error).message, 500));
  };
};


const saveImage = async (
  req: Request<{}, {}, {text: string}>,
  res: Response<{}, {url: string, file: string}>,
  next: NextFunction
) => {
  if (!res.locals.url) {
    next();
    return;
  }
  const urlString = res.locals.url;
  const imageName = urlString.split('/')[6].split('?')[0].split('-')[1];
  const file = fs.createWriteStream('./uploads/' + imageName);
  
  https
    .get(res.locals.url, (response) => {
      response.pipe(file);

      file.on('finish', () => {
        file.close();
        console.log(`Image downloaded from ${res.locals.url}`);
      });
    })
    .on('error', (err) => {
      fs.unlink(imageName, () => {
        console.error(`Error downloading image: ${err.message}`);
      });
    });
  res.locals.file = imageName;
  res.send({
    url: res.locals.url,
    file: file
  });
};

// const saveEditedImage = async (
//   req: Request,
//   res: Response<{}, {url: string, file: string}>,
//   next: NextFunction
// ) => {
//   // The req.file will contain your file data
//   // The req.body will contain your text data
//   try {
//     console.log('file ne', req.file);
//     console.log('body ne', req.body);
//     if (!req.file) {
//       const err = new CustomError('file not valid', 400);
//       next(err);
//       return;
//     }

//     const formData = new FormData();

//     const imagePath = req.file.path;
//     formData.append('prompt', req.body.prompt);
    
//     formData.append('image', fs.createReadStream(imagePath));
//     const options = {
//       method: 'POST',
//       body: formData,
//     };

//     const response = await fetchData(process.env.OPENAI_API_URL + '/v1/images/edits', options);

 
//     console.log('edited image res', response);

//     res.send('test');
//   } catch(error) {
//     console.log(error);
//     next(new CustomError((error as Error).message, 500));
//   }
// };

export {imagePost, saveImage};
