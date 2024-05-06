import { v4 as uuidv4 } from 'uuid';
import { TodoAccess } from '../dataLayer/todosAccess.mjs';
import { getUploadUrl } from '../fileStorage/attachmentUtils.mjs';

const todoAccess = new TodoAccess();

export async function createTodo(createTodoRequest, userId) {
  const todoId = uuidv4();
  const newTodoItem = {
    todoId: todoId,
    userId: userId,
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate,
    attachmentUrl: null,    
    createdAt: new Date().toISOString(),    
    done: false,
  };

  return await todoAccess.createTodo(newTodoItem);
}

export async function deleteTodo(todoId, userId) {
  await todoAccess.deleteTodo(todoId, userId);
}
  

export async function generateUploadUrl(todoId, userId) {
  const signedS3Url = await getUploadUrl(todoId);
  await todoAccess.saveUploadUrl(todoId, userId, signedS3Url);

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

  return await todoAccess.updateTodo(todoId, userId, updatedFields);
}



