import boto3
import pandas as pd
from io import BytesIO
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

def update_jd_excel(jd_name: str, jd_url: str):
    try:
        file_obj = s3_client.get_object(Bucket=S3_BUCKET_NAME, Key="jd_tracking.xlsx")
        file_content = file_obj["Body"].read()
        df = pd.read_excel(BytesIO(file_content))
        print("update ExcelJD try block")
        print(df)
    except s3_client.exceptions.NoSuchKey:
        df = pd.DataFrame(columns=["JD Name", "R2 URL"])

    new_entry = pd.DataFrame({
        "JD Name": [jd_name],
        "R2 URL": [jd_url]
    })

    df = pd.concat([df, new_entry], ignore_index=True)

    output = BytesIO()
    with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
        df.to_excel(writer, index=False, sheet_name="JDs")
    output.seek(0)

    s3_client.put_object(
        Bucket=S3_BUCKET_NAME,
        Key="jd_tracking.xlsx",
        Body=output.getvalue(),
        ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )

    return {"message": "JD Excel updated successfully"}
