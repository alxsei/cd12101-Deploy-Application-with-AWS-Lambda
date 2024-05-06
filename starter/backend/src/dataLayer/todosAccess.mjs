import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import AWSXRay from 'aws-xray-sdk-core'
import { createLogger } from '../utils/logger.mjs'

const logger = createLogger('todosAccess')

export class TodoAccess {
  constructor(
    dynamoDbClient = DynamoDBDocument.from(AWSXRay.captureAWSv3Client(new DynamoDB())),
  ) {
    this.dynamoDbClient = dynamoDbClient
    this.todosTable = process.env.TODOS_TABLE
  }


  async createTodo(todoItem) {
    logger.info(`Creating new todo`)

    await this.dynamoDbClient.put({
      TableName: this.todosTable,
      Item: todoItem
    })

    return todoItem
  }


  async deleteTodo(todoId, userId) {
    logger.info(`Deleting todo ${todoId}`)

    await this.dynamoDbClient.delete({
      TableName: this.todosTable,
      Key: { userId, todoId }
    })
  }


  async saveUploadUrl(todoId, userId, uploadUrl) {
    logger.info(`Saving upload URL to ${todoId}`)

    await this.dynamoDbClient.update({
      TableName: this.todosTable,
      Key: { userId, todoId },
      UpdateExpression: 'set uploadUrl = :uploadUrl',
      ExpressionAttributeValues: {
        ':uploadUrl': uploadUrl
      }
    })
  }


  async getTodos(userId) {
    logger.info('Getting all todos')

    const result = await this.dynamoDbClient.query({
      TableName: this.todosTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    })
    return result.Items
  }


  async updateTodo(todoId, userId, todoUpdateFields) {
    logger.info(`Update todo ${todoId}`)

    await this.dynamoDbClient.update({
      TableName: this.todosTable,
      Key: { todoId, userId },
      UpdateExpression: 'set name = :name, dueDate = :dueDate, done = :done',
      ExpressionAttributeValues: {
        ':name': todoUpdateFields.name,
        ':dueDate': todoUpdateFields.dueDate,
        ':done': todoUpdateFields.done
      }
    })
  }

}