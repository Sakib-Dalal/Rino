import boto3
import json
from boto3.dynamodb.conditions import Key
from botocore.exceptions import ClientError

def lambda_handler(event, context):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('RIHNO_Devices')
    
    # Identify the route from API Gateway (e.g., "GET /devices")
    route_key = event.get('routeKey', '')
    query_params = event.get('queryStringParameters', {})

    try:
        # --- 1. LIST ALL DEVICES (GET) ---
        if 'GET' in route_key:
            email = query_params.get('email')
            if not email:
                return {'statusCode': 400, 'body': json.dumps('Email required')}
            
            response = table.query(KeyConditionExpression=Key('UserEmail').eq(email))
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(response.get('Items', []))
            }

        # --- 2. ADD NEW DEVICE (POST) ---
        elif 'POST' in route_key:
            body = json.loads(event.get('body', '{}'))
            if 'UserEmail' not in body or 'DeviceName' not in body:
                return {'statusCode': 400, 'body': json.dumps('UserEmail and DeviceName required')}
            
            # Condition prevents overwriting if device name is already taken
            table.put_item(
                Item=body,
                ConditionExpression='attribute_not_exists(UserEmail) AND attribute_not_exists(DeviceName)'
            )
            return {'statusCode': 201, 'body': json.dumps('Device added successfully!')}

        # --- 3. EDIT DEVICE (PATCH) ---
        elif 'PATCH' in route_key:
            body = json.loads(event.get('body', '{}'))
            email, device = body.get('UserEmail'), body.get('DeviceName')
            
            # Filter out keys so we only update data fields
            update_data = {k: v for k, v in body.items() if k not in ['UserEmail', 'DeviceName']}
            
            update_expr = "SET " + ", ".join([f"#{k} = :{k}" for k in update_data.keys()])
            attr_names = {f"#{k}": k for k in update_data.keys()}
            attr_values = {f":{k}": v for k, v in update_data.items()}

            table.update_item(
                Key={'UserEmail': email, 'DeviceName': device},
                UpdateExpression=update_expr,
                ExpressionAttributeNames=attr_names,
                ExpressionAttributeValues=attr_values
            )
            return {'statusCode': 200, 'body': json.dumps('Device updated successfully!')}

        # --- 4. DELETE DEVICE (DELETE) ---
        elif 'DELETE' in route_key:
            email, device = query_params.get('email'), query_params.get('device')
            table.delete_item(Key={'UserEmail': email, 'DeviceName': device})
            return {'statusCode': 200, 'body': json.dumps(f'Device {device} deleted.')}

    except ClientError as e:
        if e.response['Error']['Code'] == 'ConditionalCheckFailedException':
            return {'statusCode': 409, 'body': json.dumps('Error: This device name is already taken.')}
        return {'statusCode': 500, 'body': json.dumps(e.response['Error']['Message'])}
    except Exception as e:
        return {'statusCode': 500, 'body': json.dumps(str(e))}