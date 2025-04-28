variable "aws_region" {
  description = "AWS region to deploy resources"
  default     = "us-east-1"
}

variable "s3_bucket_name" {
  description = "Name of the S3 bucket for app storage"
  default     = "quickcv-frontend-dev"
}