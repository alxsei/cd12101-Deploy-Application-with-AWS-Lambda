import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import AWSXRay from 'aws-xray-sdk-core';

import { createLogger } from '../utils/logger.mjs';

const logger = createLogger('todosAccess');

const dynamoDB = new DynamoDB({logger: undefined});
const xrayWrappedDynamoDBClient = AWSXRay.captureAWSv3Client(dynamoDB);
const documentClient = DynamoDBDocument.from(xrayWrappedDynamoDBClient);
const todosTable = process.env.TODOS_TABLE;
const todosIndex = process.env.INDEX_NAME;

export class TodoAccess {


  async createTodo(todoItem) {
    logger.info('Creating new todo');

    const result = await documentClient.put({
      TableName: todosTable,
      Item: todoItem
    });

    logger.info('Created todo item', result);

    return todoItem;
  }


  async deleteTodo(todoId, userId) {
    logger.info('Deleting todo', todoId);

    const result = await documentClient.delete({
      TableName: todosTable,
      Key: { todoId, userId }
    });

    logger.info('Deleted todo item', result);

    return result;
  }


  async saveUploadUrl(todoId, userId, uploadUrl) {
    logger.info('Saving upload URL to', todoId);

    const result = await documentClient.update({
      TableName: todosTable,
      Key: { todoId, userId },
      UpdateExpression: 'set attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: {
        ':attachmentUrl': uploadUrl
      }
    });

    logger.info('Saved upload url', result);
  }


  async getTodos(userId) {
    logger.info('Getting all todos');

    const result = await documentClient.query({
      TableName: todosTable,
      IndexName: todosIndex,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    });

    logger.info('Got all todo items', result);

    return result.Items;
  }


  async updateTodo(todoId, userId, todoUpdateFields) {
    logger.info('Update todo', todoId)

    const result = await documentClient.update({
      TableName: todosTable,
      Key: { todoId, userId },
      UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
      ExpressionAttributeValues: {
        ':name': todoUpdateFields.name,
        ':dueDate': todoUpdateFields.dueDate,
        ':done': todoUpdateFields.done
      },
      ExpressionAttributeNames: {
        '#name': 'name'
      },
      ReturnValues: 'UPDATED_NEW'
    });

    logger.info('Updated todo item', result);

    return todoUpdateFields;
  }

}