import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { updateTodo } from '../../businessLogic/todos.mjs'
import { getUserId } from '../utils.mjs'
import { createLogger } from '../../utils/logger.mjs'

const logger = createLogger('updateTodo')

export const handler = middy()
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
  .handler(async (event) => {
    logger.info('Processing event: ', event)

    const updatedTodo = JSON.parse(event.body)
    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)
    
    const updatedItem = await updateTodo(todoId, userId, updatedTodo )

    return {
      statusCode: 200
    }
  })
