provider "aws" {
  region = "us-east-1"
}

# S3 Bucket
resource "aws_s3_bucket" "frontend_bucket_dev" {
  bucket = "quickcv-frontend-dev"
  acl    = "private"

  website {
    index_document = "index.html"
    error_document = "index.html"
  }
}

# CloudFront Distribution
resource "aws_cloudfront_distribution" "frontend_distribution_dev" {
  origin {
    domain_name = aws_s3_bucket.frontend_bucket_dev.bucket_regional_domain_name
    origin_id   = "S3-${aws_s3_bucket.frontend_bucket_dev.id}"
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.frontend_bucket_dev.id}"

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