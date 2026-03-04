import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event: any) => {
    try {
        const body = JSON.parse(event.body);
        const { vendorId, name, category, contactEmail } = body;
        if (!vendorId) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "vendorId is required" }),
            };
        }
        const command = new UpdateCommand({
            TableName: process.env.TABLE_NAME,
            Key: {
                vendorId: vendorId,
            },
            UpdateExpression: "set #n = :n, category = :c, contactEmail = :e",
            ExpressionAttributeNames: {
                "#n": "name",
            },
            ExpressionAttributeValues: {
                ":n": name,
                ":c": category,
                ":e": contactEmail,
            },
        });
        await docClient.send(command);
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Vendor updated successfully" }),
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "PUT,OPTIONS",
                "Content-Type": "application/json",
             },
            body: JSON.stringify({ error: "Internal Server Error" }),
        };
    }
}
