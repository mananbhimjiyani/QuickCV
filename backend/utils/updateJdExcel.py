import boto3
import pandas as pd
from io import BytesIO
import os
from dotenv import load_dotenv

load_dotenv()

R2_ACCESS_KEY_ID = os.getenv("R2_ACCESS_KEY_ID")
R2_SECRET_ACCESS_KEY = os.getenv("R2_SECRET_ACCESS_KEY")
R2_ENDPOINT_URL = os.getenv("R2_ENDPOINT_URL")
R2_BUCKET_NAME = "data"

r2_client = boto3.client(
    "s3",
    endpoint_url=R2_ENDPOINT_URL,
    aws_access_key_id=R2_ACCESS_KEY_ID,
    aws_secret_access_key=R2_SECRET_ACCESS_KEY,
)

def update_jd_excel(jd_name: str, jd_url: str):
    try:
        file_obj = r2_client.get_object(Bucket=R2_BUCKET_NAME, Key="jd_tracking.xlsx")
        file_content = file_obj["Body"].read()
        df = pd.read_excel(BytesIO(file_content))
        print("update ExcelJD try block")
        print(df)
    except r2_client.exceptions.NoSuchKey:
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

    r2_client.put_object(
        Bucket=R2_BUCKET_NAME,
        Key="jd_tracking.xlsx",
        Body=output,
        ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )

    return {"message": "JD Excel updated successfully"}
