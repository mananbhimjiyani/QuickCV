from fastapi import APIRouter, File, UploadFile, HTTPException,Form
from fastapi.responses import JSONResponse
from utils.uploadR2 import upload_to_r2
from utils.updateExcel import update_excel
from utils.processCV import parsingCV
from utils.getExcelData import get_excel_data
from utils.updateJdExcel import update_jd_excel
from utils.upload_jd_tor2 import upload_jd_to_r2
from utils.compare_cv_jd import process_cv_jd
import os
router = APIRouter(
    prefix='/api',
    tags=['initial']
)


@router.post('/upload_cv')
async def upload_cv(file: UploadFile = File(...)):
    try:
    #temp file 
        local_file_path = f"./{file.filename}"
        with open(local_file_path, "wb") as f:
            f.write(await file.read())

        #R2 upload
        email = file.filename.split('.')[0]
        uploaded_url = upload_to_r2(local_file_path, f"{email}.pdf")

        # gemini processing the uploaded cv
        if uploaded_url:
            cv_summary = parsingCV(uploaded_url)
            update_excel(
                email=cv_summary["Email"],
                first_name=cv_summary["FirstName"],
                last_name=cv_summary["LastName"],
                education=cv_summary["Education"],
                skills=cv_summary["Skills"],
                links=cv_summary["Links"],
                cv_link=uploaded_url
            )
            return JSONResponse(content={"message": "CV uploaded and processed successfully", "cv_summary": cv_summary})

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error processing file: {str(e)}")


@router.get('/get_details')
async def get_details():
    try:
        # Get all data from Excel using the utility function
        data = get_excel_data()

        return JSONResponse(content={"data": data})

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching data: {str(e)}")
    
@router.post("/upload_jd")
async def upload_jd(file: UploadFile = File(...)):
    try:
        local_path = f"./{file.filename}"
        with open(local_path, "wb") as f:
            f.write(await file.read())

        jd_url = upload_jd_to_r2(local_path)

        if jd_url:
            jd_name = jd_url.split("/")[-1]
            update_jd_excel(jd_name=jd_name, jd_url=jd_url)
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
        print("Endpoint hit - files received")  # Debug print

        # Save uploaded files temporarily
        cv_path = f"./temp_cv_{cv_file.filename}"
        jd_path = f"./temp_jd_{jd_file.filename}"
        
        with open(cv_path, "wb") as f:
            f.write(await cv_file.read())

        with open(jd_path, "wb") as f:
            f.write(await jd_file.read())

        print("Files saved locally")  # Debug print

        # Upload to R2
        from utils.uploadR2 import upload_to_r2
        cv_url = upload_to_r2(cv_path, f"cv_{cv_file.filename}")
        jd_url = upload_to_r2(jd_path, f"jd_{jd_file.filename}")

        print(f"Files uploaded to R2: {cv_url}, {jd_url}")  # Debug print

        # Process comparison
        from utils.compare_cv_jd import process_cv_jd
        result = await process_cv_jd(cv_url=cv_url, jd_url=jd_url)

        print("Comparison completed")  # Debug print

        # Clean up temp files
        import os
        os.remove(cv_path)
        os.remove(jd_path)

        return JSONResponse(content=result)

    except Exception as e:
        # Clean up temp files if they exist
        if 'cv_path' in locals() and os.path.exists(cv_path):
            os.remove(cv_path)
        if 'jd_path' in locals() and os.path.exists(jd_path):
            os.remove(jd_path)
            
        raise HTTPException(status_code=500, detail=f"Error processing comparison: {str(e)}")