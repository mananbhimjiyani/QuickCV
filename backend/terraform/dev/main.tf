provider "aws" {
  region = "us-east-1"
}

# ECR Repository
resource "aws_ecr_repository" "backend_repo_dev" {
  name = "quickcv-backend-repo-dev"
}

# ECS Cluster
resource "aws_ecs_cluster" "backend_cluster_dev" {
  name = "quickcv-backend-cluster-dev"
}

# ECS Task Definition
resource "aws_ecs_task_definition" "backend_task_dev" {
  family                   = "quickcv-backend-task-dev"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"

  container_definitions = jsonencode([
    {
      name      = "quickcv-backend"
      image     = "${aws_ecr_repository.backend_repo_dev.repository_url}:latest"
      essential = true
      portMappings = [
        {
          containerPort = 8000
          hostPort      = 8000
        }
      ]
    }
  ])
}

# ECS Service
resource "aws_ecs_service" "backend_service_dev" {
  name            = "quickcv-backend-service-dev"
  cluster         = aws_ecs_cluster.backend_cluster_dev.id
  task_definition = aws_ecs_task_definition.backend_task_dev.arn
  desired_count   = 1

  load_balancer {
    target_group_arn = aws_lb_target_group.backend_target_group_dev.arn
    container_name   = "quickcv-backend"
    container_port   = 8000
  }

  network_configuration {
    subnets         = [aws_subnet.private.id]
    security_groups = [aws_security_group.backend_sg.id]
  }
}

# API Gateway
resource "aws_api_gateway_rest_api" "backend_api_dev" {
  name        = "quickcv-backend-api-dev"
  description = "API Gateway for QuickCV Backend (Dev)"
}

resource "aws_api_gateway_resource" "backend_resource_dev" {
  rest_api_id = aws_api_gateway_rest_api.backend_api_dev.id
  parent_id   = aws_api_gateway_rest_api.backend_api_dev.root_resource_id
  path_part   = "v1"
}

resource "aws_api_gateway_method" "backend_method_dev" {
  rest_api_id   = aws_api_gateway_rest_api.backend_api_dev.id
  resource_id   = aws_api_gateway_resource.backend_resource_dev.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "backend_integration_dev" {
  rest_api_id             = aws_api_gateway_rest_api.backend_api_dev.id
  resource_id             = aws_api_gateway_resource.backend_resource_dev.id
  http_method             = aws_api_gateway_method.backend_method_dev.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.backend_lambda.invoke_arn
}