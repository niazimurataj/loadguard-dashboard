import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
// previously, define env vars for AWS 
// make sure you run `npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb`

// Create DynamoDB client (reused across requests)
const client = new DynamoDBClient({
  region: process.env.AWS_REGION,              // e.g. "us-east-1"
});
const ddb = DynamoDBDocumentClient.from(client);

export async function POST(request) {
  const body = await request.json();           // expect JSON body

  const { device_id, value } = body;          // adjust 'value' to whatever payload you want

  // Both keys are required: device_id (string), timestamp (number)
  if (!device_id || value === undefined) {
    return new Response(
      JSON.stringify({ error: "device_id and value are required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const timestamp = Date.now();               // Number, matches sort key type

  try {
    await ddb.send(
      new PutCommand({
        TableName: process.env.DDB_TABLE_NAME || "MonarchData",
        Item: {
          device_id,                           // partition key
          timestamp,                           // sort key
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
