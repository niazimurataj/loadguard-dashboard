import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

// 1) Create a DynamoDB client once (re-used across calls)
const client = new DynamoDBClient({
  region: process.env.AWS_REGION,          // e.g. "us-east-1"
});
const ddb = DynamoDBDocumentClient.from(client);

// 2) Handle POST /api
export async function POST(request) {
  // read JSON from the request body
  const body = await request.json();       // e.g. { id: "123", value: "foo" }

  const { id, value } = body;              // adjust these to your real fields

  if (!id || !value) {
    return new Response(
      JSON.stringify({ error: "id and value are required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    await ddb.send(
      new PutCommand({
        TableName: process.env.DDB_TABLE_NAME || "MonarchData",
        Item: {
          id,                               // partition key
          value,
          createdAt: new Date().toISOString(),
        },
      })
    );

    return new Response(
      JSON.stringify({ ok: true }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: "DynamoDB write failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
