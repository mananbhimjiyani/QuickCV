import os
import pandas as pd
import boto3
from io import BytesIO
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

def get_excel_data():
    try:
        file_obj = s3_client.get_object(Bucket=S3_BUCKET_NAME, Key="cv_tracking.xlsx")
        file_content = file_obj["Body"].read()
        df = pd.read_excel(BytesIO(file_content))
        data = df.to_dict(orient="records")
        return data
    except s3_client.exceptions.NoSuchKey:
        raise Exception("Excel file not found in S3 bucket")
    except Exception as e:
        raise Exception(f"Error fetching data: {str(e)}")
