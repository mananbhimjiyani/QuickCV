provider "aws" {
  region = var.aws_region
}

# S3 bucket for frontend static files and backend storage (shared)
resource "aws_s3_bucket" "app_bucket" {
  bucket = var.s3_bucket_name
}

resource "aws_s3_bucket_server_side_encryption_configuration" "app_bucket_sse" {
  bucket = aws_s3_bucket.app_bucket.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_versioning" "app_bucket_versioning" {
  bucket = aws_s3_bucket.app_bucket.id
  versioning_configuration {
    status = "Suspended" # or "Enabled" if you want versioning
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "app_bucket_lifecycle" {
  bucket = aws_s3_bucket.app_bucket.id

  rule {
    id     = "log"
    status = "Enabled"

    filter {
      prefix = "" # Applies to all objects in the bucket
    }

    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }

    expiration {
      days = 365
    }
  }
}

# (Optional) CloudFront for frontend
resource "aws_cloudfront_distribution" "frontend_distribution" {
  origin {
    domain_name = aws_s3_bucket.app_bucket.bucket_regional_domain_name
    origin_id   = "S3-${aws_s3_bucket.app_bucket.id}"
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.app_bucket.id}"

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}

# (Optional) IAM user for programmatic access (backend, CI/CD, etc.)
resource "aws_iam_user" "app_user" {
  name = "quickcv-app-user"
}

resource "aws_iam_user_policy_attachment" "app_user_s3" {
  user       = aws_iam_user.app_user.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonS3FullAccess"
}

resource "aws_dynamodb_table" "cv_tracking" {
  name           = "cv_tracking"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "email"

  attribute {
    name = "email"
    type = "S"
  }
}

resource "aws_dynamodb_table" "jd_tracking" {
  name           = "jd_tracking"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "jd_name"

  attribute {
    name = "jd_name"
    type = "S"
  }
}