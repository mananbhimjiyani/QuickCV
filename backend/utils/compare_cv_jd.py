import os
import base64
import httpx
import google.generativeai as genai
from fastapi import UploadFile
from dotenv import load_dotenv
from .uploadR2 import upload_to_r2
from .upload_jd_tor2 import upload_jd_to_r2
from .updateExcel import update_excel
from .updateJdExcel import update_jd_excel
import logging
import json
from typing import Dict, Any, Optional, Tuple
from datetime import datetime

load_dotenv()
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


def encode_pdf_from_url(url: str) -> Optional[str]:
    """Encode PDF from URL to base64 with improved error handling"""
    try:
        with httpx.Client() as client:
            response = client.get(url, timeout=30.0)
            response.raise_for_status()
            return base64.b64encode(response.content).decode("utf-8")
    except httpx.HTTPError as e:
        logger.error(f"HTTP error fetching PDF from {url}: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error encoding PDF: {str(e)}")
    return None


async def handle_cv_upload(file: UploadFile) -> Tuple[Optional[str], Optional[str]]:
    """Handle CV file upload with better resource management"""
    try:
        email = file.filename.split('.')[0]
        temp_path = f"./temp_cv_{email}.pdf"

        try:
            # Write file contents
            with open(temp_path, "wb") as f:
                f.write(await file.read())

            # Upload to R2
            r2_url = upload_to_r2(temp_path, f"{email}.pdf")
            return email, r2_url
        finally:
            # Clean up temp file
            if os.path.exists(temp_path):
                os.remove(temp_path)

    except Exception as e:
        logger.error(f"CV upload failed: {str(e)}", exc_info=True)
        return None, None


async def handle_jd_upload(file: UploadFile) -> Optional[str]:
    """Handle JD file upload with better resource management"""
    try:
        temp_path = f"./temp_jd_{file.filename}"

        try:
            # Write file contents
            with open(temp_path, "wb") as f:
                f.write(await file.read())

            # Upload to R2
            return upload_jd_to_r2(temp_path)
        finally:
            # Clean up temp file
            if os.path.exists(temp_path):
                os.remove(temp_path)

    except Exception as e:
        logger.error(f"JD upload failed: {str(e)}", exc_info=True)
        return None


async def compare_cv_and_jd(cv_url: str, jd_url: str) -> Dict[str, Any]:
    """
    Compare CV and JD using Gemini API with improved implementation
    Returns structured analysis in the specified format
    """
    try:
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY environment variable not set")

        genai.configure(api_key=api_key)

        # Encode PDFs with timeout
        cv_encoded = encode_pdf_from_url(cv_url)
        jd_encoded = encode_pdf_from_url(jd_url)

        if not cv_encoded or not jd_encoded:
            raise ValueError("Failed to encode one or both PDFs")

        # Define the prompt with clear instructions
        prompt = """
        Analyze and compare the provided CV and Job Description. Provide a detailed evaluation including:
        - Compatibility score (0-100)
        - Skill matches and gaps (technical and soft skills)
        - Education comparison (degrees, certifications)
        - Experience level assessment (years, domain relevance)
        - Keyword analysis (ATS optimization)
        - Improvement suggestions for better alignment
        
        Structure your response in JSON format with these sections:
        - ats_score (overall score)
        - summary (compatibility metrics)
        - compatibility_score
        - skills_analysis (matched, missing, bonus skills)
        - education_analysis
        - experience_analysis
        - keyword_analysis
        - additional_analysis (certifications, cultural fit)
        - improvement_suggestions (actionable recommendations)
        Give Input in this exact format only
        {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "ats_score": {
      "type": "number",
      "description": "Overall compatibility score (0-100)"
    },
    "skills_analysis": {
      "type": "object",
      "properties": {
        "matched": {
          "type": "array",
          "items": { "type": "string" }
        },
        "missing": {
          "type": "array",
          "items": { "type": "string" }
        },
        "bonus": {
          "type": "array",
          "items": { "type": "string" }
        }
      },
      "required": ["matched", "missing", "bonus"]
    },
    "education_analysis": {
      "type": "object",
      "properties": {
        "degree": { "type": "string" },
        "relevance": { "type": "string" }
      },
      "required": ["degree", "relevance"]
    },
    "experience_analysis": {
      "type": "object",
      "properties": {
        "years": { "type": "string" },
        "level": { "type": "string" },
        "details": {
          "type": "array",
          "items": { "type": "string" }
        },
        "domain_relevance": { "type": "string" },
        "role_alignment": { "type": "string" }
      },
      "required": ["years", "level"]
    },
    "keyword_analysis": {
      "type": "object",
      "properties": {
        "present": {
          "type": "array",
          "items": { "type": "string" }
        },
        "missing": {
          "type": "array",
          "items": { "type": "string" }
        }
      },
      "required": ["present", "missing"]
    },
    "improvement_suggestions": {
      "type": "array",
      "items": { "type": "string" }
    },
    "summary": { "type": "string" }
  },
  "required": [
    "ats_score",
    "skills_analysis",
    "education_analysis",
    "experience_analysis"
  ]
}
        """

        # Use the latest model with better JSON handling
        model = genai.GenerativeModel('gemini-2.0-flash')

        # Generate content with appropriate configuration
        response = model.generate_content(
            [
                {'mime_type': 'application/pdf', 'data': jd_encoded},
                {'mime_type': 'application/pdf', 'data': cv_encoded},
                prompt
            ],
            generation_config={
                "temperature": 0.3,  # More deterministic output
                "max_output_tokens": 4000,
                "response_mime_type": "application/json"
            }
        )

        # Parse and validate the response
        result = json.loads(response.text)

        # Basic validation of response structure
        if not isinstance(result, dict) or "ats_score" not in result:
            raise ValueError("Unexpected response format from Gemini API")

        logger.info("Successfully compared CV and JD")
        return result

    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse Gemini response: {str(e)}")
        return {"error": "Failed to parse analysis results"}
    except Exception as e:
        logger.error(f"Error during comparison: {str(e)}", exc_info=True)
        return {"error": str(e)}


async def process_cv_jd(
    cv_file: Optional[UploadFile] = None,
    jd_file: Optional[UploadFile] = None,
    cv_url: Optional[str] = None,
    jd_url: Optional[str] = None
) -> Dict[str, Any]:
    """
    Main processing function that handles both file uploads and direct URL comparisons
    with improved error handling and resource management
    """
    try:
        email = None

        # Process CV input
        if cv_file and not cv_url:
            email, cv_url = await handle_cv_upload(cv_file)
            if not cv_url:
                raise ValueError("Failed to process CV file")

        # Process JD input
        if jd_file and not jd_url:
            jd_url = await handle_jd_upload(jd_file)
            if not jd_url:
                raise ValueError("Failed to process JD file")

        # Validate we have both documents
        if not cv_url or not jd_url:
            raise ValueError("Both CV and JD inputs are required")

        # Update tracking systems if files were uploaded
        if cv_file and email and cv_url:
            update_excel(email=email, cv_link=cv_url)
        if jd_file and jd_url:
            jd_name = os.path.basename(jd_url)
            update_jd_excel(jd_name=jd_name, jd_url=jd_url)

        # Perform the comparison
        result = await compare_cv_and_jd(cv_url, jd_url)

        # Add metadata to the result
        if isinstance(result, dict):
            result["metadata"] = {
                "cv_source": "upload" if cv_file else "url",
                "jd_source": "upload" if jd_file else "url",
            }

        return result

    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        return {"error": str(e)}
    except Exception as e:
        logger.error(f"Processing failed: {str(e)}", exc_info=True)
        return {"error": f"Internal processing error: {str(e)}"}
