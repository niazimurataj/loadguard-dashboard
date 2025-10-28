// TODO: configure an endpoint to fetch data from Post_Processed table in DynamoDB
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
export { docClient };

export default docClient;