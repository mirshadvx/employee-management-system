import cloudinary
import cloudinary.uploader
import os
from dotenv import load_dotenv
load_dotenv()

def upload_to_cloudinary(image_file):
    cloudinary.config(
        cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
        api_key=os.getenv('CLOUDINARY_API_KEY'),
        api_secret=os.getenv('CLOUDINARY_API_SECRET')
    )
    
    response = cloudinary.uploader.upload(image_file)
    return response['secure_url']