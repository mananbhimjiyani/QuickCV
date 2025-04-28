from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
import boto3
import os
from utils.uploadR2 import upload_to_s3
from utils.processCV import parsingCV
from utils.compare_cv_jd import process_cv_jd

AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME")
dynamodb = boto3.resource("dynamodb", region_name=AWS_REGION)
cv_table = dynamodb.Table("cv_tracking")
jd_table = dynamodb.Table("jd_tracking")

router = APIRouter(
    prefix='/api',
    tags=['initial']
)

@router.post('/upload_cv')
async def upload_cv(file: UploadFile = File(...)):
    try:
        local_file_path = f"./{file.filename}"
        with open(local_file_path, "wb") as f:
            f.write(await file.read())

        # Upload PDF to S3
        email = file.filename.split('.')[0]
        s3_key = f"cv/{email}.pdf"
        uploaded_url = upload_to_s3(local_file_path, s3_key)

        # Process CV with Gemini
        if uploaded_url:
            cv_summary = parsingCV(uploaded_url)
            # Store metadata in DynamoDB
            cv_table.put_item(
                Item={
                    "email": cv_summary["Email"],
                    "firstName": cv_summary["FirstName"],
                    "lastName": cv_summary["LastName"],
                    "education": cv_summary["Education"],
                    "skills": cv_summary["Skills"],
                    "links": cv_summary["Links"],
                    "cvLink": uploaded_url
                }
            )
            return JSONResponse(content={"message": "CV uploaded and processed successfully", "cv_summary": cv_summary})
        else:
            raise Exception("S3 upload failed")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@router.get('/get_details')
async def get_details():
    try:
        # Get all data from DynamoDB
        response = cv_table.scan()
        data = response.get("Items", [])
        return JSONResponse(content={"data": data})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching data: {str(e)}")

@router.post("/upload_jd")
async def upload_jd(file: UploadFile = File(...)):
    try:
        local_path = f"./{file.filename}"
        with open(local_path, "wb") as f:
            f.write(await file.read())

        # Upload JD PDF to S3
        s3_key = f"jd/{file.filename}"
        jd_url = upload_to_s3(local_path, s3_key)

        if jd_url:
            jd_name = file.filename
            # Store JD metadata in DynamoDB
            jd_table.put_item(
                Item={
                    "jd_name": jd_name,
                    "jd_url": jd_url
                }
            )
            return JSONResponse(content={"message": "JD uploaded and tracked successfully", "jd_url": jd_url})
        else:
            raise Exception("Upload failed")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading JD: {str(e)}")

@router.post("/compare_cv_jd")
async def compare_cv_jd_route(
    cv_file: UploadFile = File(..., description="CV PDF file"),
    jd_file: UploadFile = File(..., description="Job Description PDF file")
):
    try:
        # Save uploaded files temporarily
        cv_path = f"./temp_cv_{cv_file.filename}"
        jd_path = f"./temp_jd_{jd_file.filename}"
        with open(cv_path, "wb") as f:
            f.write(await cv_file.read())
        with open(jd_path, "wb") as f:
            f.write(await jd_file.read())

        # Upload to S3
        cv_s3_key = f"cv/{cv_file.filename}"
        jd_s3_key = f"jd/{jd_file.filename}"
        cv_url = upload_to_s3(cv_path, cv_s3_key)
        jd_url = upload_to_s3(jd_path, jd_s3_key)

        # Process comparison
        result = await process_cv_jd(cv_url=cv_url, jd_url=jd_url)

        # Clean up temp files
        os.remove(cv_path)
        os.remove(jd_path)

        return JSONResponse(content=result)
    except Exception as e:
        if 'cv_path' in locals() and os.path.exists(cv_path):
            os.remove(cv_path)
        if 'jd_path' in locals() and os.path.exists(jd_path):
            os.remove(jd_path)
        raise HTTPException(status_code=500, detail=f"Error processing comparison: {str(e)}")