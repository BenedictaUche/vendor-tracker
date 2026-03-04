import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";


const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event: any) => {
    try {
        const body = JSON.parse(event.body);
        const { vendorId } = body;

        if (!vendorId) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "vendorId is required" }),
            };
        }

        const command = new DeleteCommand({
            TableName: process.env.TABLE_NAME,
            Key: {
                vendorId: vendorId,
            },
        });

        await docClient.send(command);

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "DELETE,OPTIONS",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ message: "Vendor deleted successfully" }),
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: "Internal Server Error" }),
        };
    }
};
