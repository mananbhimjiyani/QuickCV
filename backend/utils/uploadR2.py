import boto3
import os
from dotenv import load_dotenv

load_dotenv()

AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION")
S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME")

s3_client = boto3.client(
    "s3",
    region_name=AWS_REGION,
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
)

def upload_to_s3(local_file_path, s3_key):
    try:
        s3_client.upload_file(local_file_path, S3_BUCKET_NAME, s3_key)
        # Return a pre-signed URL for private access
        uploaded_url = generate_presigned_url(S3_BUCKET_NAME, s3_key)
        return uploaded_url
    except Exception as e:
        print(f"Error uploading to S3: {e}")
        return None

def generate_presigned_url(bucket, key, expires=3600):
    s3 = boto3.client("s3", region_name=os.getenv("AWS_REGION", "us-east-1"))
    return s3.generate_presigned_url(
        "get_object",
        Params={"Bucket": bucket, "Key": key},
        ExpiresIn=expires
    )

# if __name__ == "__main__":
#     local_file = "test.pdf"  # Local file name
#     bucket_name = "resume"  # Your R2 bucket name
#     email = "john.doe@example.com"  # Candidate's email
#     uploaded_file_url = upload_to_r2(local_file, email)
#     if uploaded_file_url:
#         print(f"Uploaded file URL: {uploaded_file_url}")
