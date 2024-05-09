import * as uuid from 'uuid'
import { TodoAccess } from '../dataLayer/todosAccess.mjs';
import { getUploadUrl } from '../fileStorage/attachmentUtils.mjs';

const todoAccess = new TodoAccess();



export async function createTodo(createTodoRequest, userId) {
  const itemId = uuid.v4()
  const currentDatetime = new Date().toISOString()


  return await todoAccess.createTodo({
      todoId: itemId,
      userId: userId,
      name: createTodoRequest.name,
      dueDate: createTodoRequest.dueDate,
      attachmentUrl: null,
      createdAt: currentDatetime,
      done: false
  })
}

export async function deleteTodo(todoId, userId) {
  await todoAccess.deleteTodo(todoId, userId);
}
  

export async function generateUploadUrl(todoId, userId) {
  const signedS3Url = await getUploadUrl(todoId);
  await todoAccess.saveUploadUrl(todoId, userId);

  return signedS3Url;
}


export async function getTodos(userId) {
  return todoAccess.getTodos(userId);
}


export async function updateTodo(todoId, userId, updateTodoRequest) {
  const updatedFields = {
    name: updateTodoRequest.name,
    dueDate: updateTodoRequest.dueDate,
    done: updateTodoRequest.done,
  };

  await todoAccess.updateTodo(todoId, userId, updatedFields);
}




