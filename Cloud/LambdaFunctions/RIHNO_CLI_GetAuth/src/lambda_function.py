import json
import boto3
from boto3.dynamodb.conditions import Key
from botocore.exceptions import ClientError

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('RIHNO_Devices')

def lambda_handler(event, context):
    # 1. Extract parameters from Query String
    params = event.get('queryStringParameters') or {}
    email = params.get('email')
    device_name = params.get('device_name')
    device_type = params.get('device_type')
    provided_api = params.get('api_key')

    # Validation: Ensure all parameters are present
    if not all([email, device_name, device_type, provided_api]):
        return create_response(400, "Missing parameters. Required: email, device_name, device_type, api_key")

    try:
        # 2. Query DynamoDB for the User (Partition Key)
        response = table.query(
            KeyConditionExpression=Key('UserEmail').eq(email)
        )
        items = response.get('Items', [])

        if not items:
            return create_response(404, f"User {email} not found")

        # 3. Find specific device matching BOTH Name and Type
        # Updated logic to include device_type validation
        device_item = next(
            (item for item in items if 
             item.get('DeviceName') == device_name and 
             item.get('DeviceType') == device_type), 
            None
        )

        if not device_item:
            return create_response(404, f"Device '{device_name}' of type '{device_type}' not found for this user")

        # 4. Verify API key
        stored_api = device_item.get('DeviceAPI')
        
        if stored_api == provided_api:
            return create_response(200, "OK CLI authenticated")
        else:
            return create_response(401, "Authentication failed: Invalid API Key")

    except ClientError as e:
        return create_response(500, f"Database Error: {e.response['Error']['Message']}")

def create_response(status_code, message):
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*' 
        },
        'body': json.dumps({"result": message})
    }