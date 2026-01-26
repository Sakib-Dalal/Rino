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
    device = params.get('device')
    provided_api = params.get('api_key') # The key sent by the CLI/Device

    # Validation: Ensure all three are present
    if not all([email, device, provided_api]):
        return create_response(400, "Missing parameters. Required: email, device, api_key")

    try:
        # 2. Query DynamoDB for the User
        response = table.query(
            KeyConditionExpression=Key('UserEmail').eq(email)
        )
        items = response.get('Items', [])

        if not items:
            return create_response(404, f"User {email} not found")

        # 3. Find the specific device and verify the API key
        # We look for the item where DeviceName matches AND DeviceAPI matches
        device_item = next((item for item in items if item.get('DeviceName') == device), None)

        if not device_item:
            return create_response(404, f"Device {device} not found for this user")

        # Check if the stored API key matches the provided one
        stored_api = device_item.get('DeviceAPI')
        
        if stored_api == provided_api:
            # Matches! Return the requested CLI authenticated message
            return create_response(200, "OK CLI authenticated")
        else:
            return create_response(401, "Authentication failed: Invalid API Key")

    except ClientError as e:
        return create_response(500, f"Database Error: {e.response['Error']['Message']}")

def create_response(status_code, message):
    """Helper to format the response for API Gateway Proxy Integration"""
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*' 
        },
        'body': json.dumps({"result": message})
    }