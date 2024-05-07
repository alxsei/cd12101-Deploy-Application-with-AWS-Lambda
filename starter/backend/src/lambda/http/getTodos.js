import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { getTodos } from '../../businessLogic/todos.mjs'
import { getUserId } from '../utils.mjs'
import { createLogger } from '../../utils/logger.mjs'

const logger = createLogger('getTodos')

export const handler = middy()
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
  .handler(async (event) => {
    logger.info('Processing event: ', event)

    const userId = getUserId(event)
    logger.info('UserId: ', userId)
    const allTodoItems = await getTodos(userId)

    return {
      statusCode: 200,
      body: JSON.stringify({
        items: allTodoItems
      })
    }
  })