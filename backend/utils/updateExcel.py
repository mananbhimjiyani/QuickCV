import boto3
import pandas as pd
from io import BytesIO
from dotenv import load_dotenv
import os

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

def update_excel(email, first_name, last_name, education, skills, links, cv_link):
    try:
        file_obj = s3_client.get_object(Bucket=S3_BUCKET_NAME, Key="cv_tracking.xlsx")
        file_content = file_obj["Body"].read()
        df = pd.read_excel(BytesIO(file_content))
    except s3_client.exceptions.NoSuchKey:
        df = pd.DataFrame(columns=["email", "firstName", "lastName", "education", "skills", "links", "cvLink"])

    new_data = pd.DataFrame({
        "email": [email],
        "firstName": [first_name],
        "lastName": [last_name],
        "education": ["; ".join(education)],
        "skills": ["; ".join(skills)],
        "links": ["; ".join(links)],
        "cvLink": [cv_link],
    })
    df = pd.concat([df, new_data], ignore_index=True)
    output = BytesIO()
    with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
        df.to_excel(writer, index=False, sheet_name="CVs")
    output.seek(0)

    s3_client.put_object(
        Bucket=S3_BUCKET_NAME,
        Key="cv_tracking.xlsx",
        Body=output.getvalue(),
        ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )

    return {"message": "Excel file updated successfully!"}
