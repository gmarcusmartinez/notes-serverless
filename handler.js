"use strict"
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb")
const {
  DynamoDBDocumentClient,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand,
} = require("@aws-sdk/lib-dynamodb")

const NOTES_TABLE_NAME = process.env.NOTES_TABLE_NAME
const client = new DynamoDBClient({ region: "us-east-1" })
const docClient = DynamoDBDocumentClient.from(client)

const send = (statusCode, data) => {
  return {
    statusCode,
    body: JSON.stringify(data),
  }
}

module.exports.createNote = async (event, ctx, cb) => {
  context.callbackWaitsForEmptyEventLoop = false

  let data = JSON.parse(event.body)

  try {
    const params = {
      TableName: NOTES_TABLE_NAME,
      Item: {
        notesId: data.id,
        title: data.title,
        body: data.body,
      },
      ConditionExpression: "attribute_not_exists(notesId)",
    }

    await docClient.send(new PutCommand(params))
    return send(201, data)
  } catch (error) {
    return send(500, data)
  }
}

module.exports.updateNote = async (event, context, cb) => {
  context.callbackWaitsForEmptyEventLoop = false

  let notesId = event.pathParameters.id
  let data = JSON.parse(event.body)
  try {
    const params = {
      TableName: NOTES_TABLE_NAME,
      Key: { notesId },
      UpdateExpression: "set #title = :title, #body = :body",
      ExpressionAttributeNames: {
        "#title": "title",
        "#body": "body",
      },
      ExpressionAttributeValues: {
        ":title": data.title,
        ":body": data.body,
      },
      ConditionExpression: "attribute_exists(notesId)",
    }
    await docClient.send(new UpdateCommand(params))
    return send(200, data)
  } catch (err) {
    return send(500, err.message)
  }
}

module.exports.deleteNote = async (event, context, cb) => {
  context.callbackWaitsForEmptyEventLoop = false

  let notesId = event.pathParameters.id
  try {
    const params = {
      TableName: NOTES_TABLE_NAME,
      Key: { notesId },
      ConditionExpression: "attribute_exists(notesId)",
    }
    await docClient.send(new DeleteCommand(params))
    return send(200, notesId)
  } catch (err) {
    return send(500, err.message)
  }
}

module.exports.getAllNotes = async (event, context, cb) => {
  context.callbackWaitsForEmptyEventLoop = false
  try {
    const params = {
      TableName: NOTES_TABLE_NAME,
    }
    const notes = await docClient.send(new ScanCommand(params))
    return send(200, notes)
  } catch (err) {
    return send(500, err.message)
  }
}
