import { Amplify } from 'aws-amplify';

// This configures the Amplify library with your AWS Cognito details.
Amplify.configure({
  Auth: {
    // REQUIRED - The AWS Region where you created your User Pool
    region: 'us-east-1', // e.g., 'us-west-2'

    // REQUIRED - Your User Pool ID
    userPoolId: 'YOUR_USER_POOL_ID', // e.g., 'us-east-1_xxxxxxxxx'

    // REQUIRED - Your User Pool App Client ID
    userPoolWebClientId: 'YOUR_USER_POOL_APP_CLIENT_ID', // e.g., 'xxxxxxxxxxxxxxxxxxxxxx'
  },
  // You can add other AWS services' configurations here in the future
});
