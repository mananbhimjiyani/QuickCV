output "s3_bucket_name" {
  value = aws_s3_bucket.app_bucket.bucket
}

output "cloudfront_domain_name" {
  value = aws_cloudfront_distribution.frontend_distribution.domain_name
}