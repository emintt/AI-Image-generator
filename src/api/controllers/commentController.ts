import {Request, Response, NextFunction} from 'express';
import fetchData from '../../lib/fetchData';
import CustomError from '../../classes/CustomError';
import { ChatCompletion } from 'openai/resources';

const commentPost = async (
  req: Request<{}, {}, {text: string}>,
  res: Response<{response: string}>,
  next: NextFunction
) => {
  try {
    // Generate a sarcastic, hostile AI response to a Youtube comment, imitating an 18th-century English aristocrat, and return it as a JSON response.
    // Use the text from the request body to generate the response.
    const aiRequest = {
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an empathetic, funny and cheerful person, who responds to Youtube comments with warm-hearted replies."
        },
        {
          role: "user",
          content: req.body.text
        }
      ]
    };

    // Instead of using openai library, use fetchData to make a post request to the server.
    const options: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(aiRequest)
    };

    const response = await fetchData<ChatCompletion>(
      process.env.OPENAI_API_URL + '/v1/chat/completions',
      options
    );

    if (!response.choices[0].message.content) {
      next(new CustomError('data not found', 500));
      return;
    }
    
    res.json({response: response.choices[0].message.content});

    // see https://platform.openai.com/docs/api-reference/chat/create for more information
    // You don't need an API key if you use the URL provided in .env.sample and Metropolia VPN
    // Example: instad of https://api.openai.com/v1/chat/completions use process.env.OPENAI_API_URL + '/v1/chat/completions'

  } catch (error) {
    console.log(error);
    next(new CustomError((error as Error).message, 500));
  };
};

export {commentPost};
