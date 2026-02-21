terraform {
  required_version = ">= 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket = "sometimes-terraform-state"
    key    = "app-review-collector/terraform.tfstate"
    region = "ap-northeast-2"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "sometimes"
      Service     = "app-review-collector"
      ManagedBy   = "terraform"
      Environment = var.environment
    }
  }
}
