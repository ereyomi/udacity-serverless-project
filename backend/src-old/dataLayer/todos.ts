import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/todos/TodoItem'

// import { UpdateTodoRequest } from '../models/requests/UpdateTodoRequest'

import { TodoUpdate } from '../models/todos/TodoUpdate'

export class TodosAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly indextodos = process.env.TODOS_CREATED_AT_INDEX,
    private readonly Tabletodos = process.env.TODOS_TABLE
  ) {}

  //// TODO: Implement the dataLayer logic

  //create todo
  async createTodoItem(todo: TodoItem): Promise<void> {
    await this.docClient
      .put({
        TableName: this.Tabletodos,
        Item: todo
      })
      .promise()
  }

  //get all todos by userId
  async getTodosByUserId(userId: string): Promise<TodoItem[]> {
    const result = await this.docClient
      .query({
        TableName: this.Tabletodos,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      })
      .promise()

    return result.Items as TodoItem[]
  }
  async getTodoItem(todoId: string): Promise<TodoItem> {
    const result = await this.docClient
      .get({
        TableName: this.Tabletodos,
        Key: {
          todoId
        }
      })
      .promise()

    const item = result.Item

    return item as TodoItem
  }

  //update todos
  async updateTodoItem(todoId: string, todoUpdate: TodoUpdate): Promise<void> {
    await this.docClient
      .update({
        TableName: this.Tabletodos,
        Key: {
          todoId
        },
        UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
        ExpressionAttributeNames: {
          '#name': 'name'
        },
        ExpressionAttributeValues: {
          ':name': todoUpdate.name,
          ':dueDate': todoUpdate.dueDate,
          ':done': todoUpdate.done
        }
      })
      .promise()
  }
  async deleteTodoItem(todoId: string): Promise<void> {
    await this.docClient
      .delete({
        TableName: this.Tabletodos,
        Key: {
          todoId
        }
      })
      .promise()
  }

  //add
  async addAttachment(todo: TodoItem): Promise<TodoItem> {
    const result = await this.docClient
      .update({
        TableName: this.Tabletodos,
        Key: {
          userId: todo.userId,
          todoId: todo.todoId
        },
        UpdateExpression: 'set attachmentUrl = :attachmentUrl',
        ExpressionAttributeValues: {
          ':attachmentUrl': todo.attachmentUrl
        }
      })
      .promise()
    return result.Attributes as TodoItem
  }

  //get all todos by todoID
  async getAllTodoById(todoId: string): Promise<TodoItem> {
    const output = await this.docClient
      .query({
        TableName: this.Tabletodos,
        IndexName: this.indextodos,
        KeyConditionExpression: 'todoId = :todoId',
        ExpressionAttributeValues: {
          ':todoId': todoId
        }
      })
      .promise()
    const item = output.Items
    const result = item.length !== 0 ? (item[0] as TodoItem) : null
    return result
  }
  async updateAttachmentUrl(
    todoId: string,
    attachmentUrl: string
  ): Promise<void> {
    await this.docClient
      .update({
        TableName: this.Tabletodos,
        Key: {
          todoId
        },
        UpdateExpression: 'set attachmentUrl = :attachmentUrl',
        ExpressionAttributeValues: {
          ':attachmentUrl': attachmentUrl
        }
      })
      .promise()
  }
}

//connect to DynamoDBClient
function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}
