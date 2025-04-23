import boto3
import pandas as pd
from io import BytesIO
from dotenv import load_dotenv
import os

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

def update_excel(email, first_name, last_name, education, skills, links, cv_link):
    try:
        file_obj = r2_client.get_object(Bucket=R2_BUCKET_NAME, Key="cv_tracking.xlsx")
        file_content = file_obj["Body"].read()

        df = pd.read_excel(BytesIO(file_content))

    except r2_client.exceptions.NoSuchKey:
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

    r2_client.put_object(
        Bucket=R2_BUCKET_NAME,
        Key="cv_tracking.xlsx",
        Body=output,
        ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        
    )

    return {"message": "Excel file updated successfully!"}
