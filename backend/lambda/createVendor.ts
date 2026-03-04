import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event: any) => {
  try {
    const body = JSON.parse(event.body);

    const command = new PutCommand({
      TableName: process.env.TABLE_NAME,
      Item: {
        vendorId: Date.now().toString(),
        name: body.name,
        category: body.category,
        contactEmail: body.contactEmail,
      },
    });

    await docClient.send(command);

    return {
      statusCode: 201,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: "Vendor Created" }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ message: "Internal Server Error", error: JSON.stringify(error) }),
    };
  }
};
