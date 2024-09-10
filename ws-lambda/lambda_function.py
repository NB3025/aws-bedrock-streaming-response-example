import json
import boto3

bedrock_runtime = boto3.client(
    'bedrock-runtime', 
    region_name="us-east-1" 
    )

def generate_chunk(stream) -> bytes:
    if stream:
        for event in stream:
            chunk = event.get("chunk")
            if chunk:
                chunk_bytes = chunk.get("bytes")
                yield chunk_bytes

def lambda_handler(event, context):
    print(f'{event=}')
    
    try:
        apigw_management = boto3.client('apigatewaymanagementapi', endpoint_url='https://' + event['requestContext']['domainName'] + '/' + event['requestContext']['stage'])
        event_type = event["requestContext"]["eventType"]

        if event_type == "MESSAGE":
            message = json.loads(event["body"])

            if "client" not in message:
                return {
                    "statusCode": 400,
                    "body": "Invalid message format."
                }
            
            connection_id = event["requestContext"]["connectionId"]
            
            body = json.dumps({
                    "max_tokens": 256,
                    "messages": [{"role": "user", "content": message["client"]}],
                    "anthropic_version": "bedrock-2023-05-31"
                    })
        
            print (f'{body=}')

            try:
                response = bedrock_runtime.invoke_model_with_response_stream(
                        body=body,
                        modelId="anthropic.claude-3-sonnet-20240229-v1:0",
                        accept = "application/json",
                        contentType = "application/json"
                    )
                
            except Exception as e:
                print(f"Failed to invoke bedrock: {e}")
                return {"statusCode": 500, "body": "Failed to invoke bedrock."}

            

            print (f'{response=}')
            stream = response.get("body")
            print (f'{stream=}')
            for chunk in generate_chunk(stream):
                try:
                    # Send completion
                    apigw_management.post_to_connection(ConnectionId=connection_id, Data=chunk)
                    # chunk_data = json.loads(chunk.decode("utf-8"))
                    # completions.append(chunk_data["completion"])
                except Exception as e:
                    print(f"Failed to post message: {str(e)}")
                    return {"statusCode": 500, "body": "Failed to send message to connection."}
            
            return {
                "statusCode": 200,
                "body": "Message sent."
            }
        
        else:
            return {
                "statusCode": 500,
                "body": "Unexpected event type."
            }
    except Exception as e:
        print ('exception', e)