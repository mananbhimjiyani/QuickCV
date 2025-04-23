import boto3
import os
from botocore.exceptions import NoCredentialsError
from dotenv import load_dotenv

load_dotenv()

def upload_jd_to_r2(file_path):
    """
    Uploads a Job Description PDF to Cloudflare R2 and names it as jd(n).pdf.

    :param file_path: Path to the JD PDF to be uploaded.
    :return: URL of the uploaded JD or None if upload failed.
    """
    access_key_id = os.getenv("R2_ACCESS_KEY_ID")
    secret_access_key = os.getenv("R2_SECRET_ACCESS_KEY")
    endpoint_url = os.getenv("R2_ENDPOINT_URL")
    bucket_name = os.getenv("R2_BUCKET_NAME")
    public_base_url = "https://pub-bd4a6e96fbe74d0d85b3ad6a30670258.r2.dev"

    print("📦 ENV loaded")
    print("Access Key:", "✅" if access_key_id else "❌ MISSING")
    print("Secret Key:", "✅" if secret_access_key else "❌ MISSING")
    print("Endpoint:", endpoint_url)
    print("Bucket:", bucket_name)

    if not os.path.exists(file_path):
        print("❌ File does not exist:", file_path)
        return None

    s3_client = boto3.client(
        's3',
        endpoint_url=endpoint_url,
        aws_access_key_id=access_key_id,
        aws_secret_access_key=secret_access_key
    )

    try:
        print("📁 Listing existing objects to find next jd(n)...")
        existing_objects = s3_client.list_objects_v2(Bucket=bucket_name)
        jd_count = 0
        if 'Contents' in existing_objects:
            jd_count = sum(1 for obj in existing_objects['Contents'] if obj['Key'].startswith('jd('))
        jd_file_name = f"jd({jd_count + 1}).pdf"
        print(f"📝 New JD name: {jd_file_name}")

        print("⬆️ Uploading to R2...")
        s3_client.upload_file(file_path, bucket_name, jd_file_name)

        public_url = f"{public_base_url}/{jd_file_name}"
        print("✅ Upload successful:", public_url)

        return public_url

    except FileNotFoundError:
        print("❌ The file was not found.")
    except NoCredentialsError:
        print("❌ Credentials not available.")
    except Exception as e:
        print(f"❌ An unexpected error occurred: {e}")

    return None