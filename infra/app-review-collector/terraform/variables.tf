variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-northeast-2"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "app_store_app_id" {
  description = "iOS App Store app ID"
  type        = string
}

variable "play_store_package_name" {
  description = "Android Play Store package name"
  type        = string
}

variable "slack_channel" {
  description = "Slack channel for review notifications"
  type        = string
  default     = "#app-reviews"
}

variable "schedule_expression" {
  description = "EventBridge schedule expression"
  type        = string
  default     = "rate(1 hour)"
}
