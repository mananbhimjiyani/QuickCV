output "api_gateway_url" {
  value = aws_api_gateway_rest_api.backend_api_dev.invoke_url
}