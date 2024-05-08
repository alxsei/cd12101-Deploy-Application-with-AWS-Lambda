import middy from '@middy/core';
import cors from '@middy/http-cors';
import httpErrorHandler from '@middy/http-error-handler';
import createError from 'http-errors';
import { getTodos } from '../../businessLogic/todos.mjs';
import { getUserId } from '../utils.mjs';
import { createLogger } from '../../utils/logger.mjs';

const logger = createLogger('getTodos');

const baseHandler = async (event) => {
  try {
    const userId = getUserId(event);
    const todos = await getTodos(userId);
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ items: todos })
    };
  } catch (error) {
    logger.error('Failed to get todos:', error);
    throw createError(500, 'Internal Server Error', {
      expose: true,
      details: error.message
    });
  }
};

export const handler = middy(baseHandler)
  .use(cors({ credentials: true }))
  .use(httpErrorHandler()); 
