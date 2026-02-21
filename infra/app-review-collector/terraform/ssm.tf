resource "aws_ssm_parameter" "app_store_key_id" {
  name  = "/sometimes/review-collector/app-store/key-id"
  type  = "SecureString"
  value = "PLACEHOLDER"

  lifecycle {
    ignore_changes = [value]
  }
}

resource "aws_ssm_parameter" "app_store_issuer_id" {
  name  = "/sometimes/review-collector/app-store/issuer-id"
  type  = "SecureString"
  value = "PLACEHOLDER"

  lifecycle {
    ignore_changes = [value]
  }
}

resource "aws_ssm_parameter" "app_store_private_key" {
  name  = "/sometimes/review-collector/app-store/private-key"
  type  = "SecureString"
  value = "PLACEHOLDER"

  lifecycle {
    ignore_changes = [value]
  }
}

resource "aws_ssm_parameter" "play_store_service_account_json" {
  name  = "/sometimes/review-collector/play-store/service-account-json"
  type  = "SecureString"
  value = "PLACEHOLDER"

  lifecycle {
    ignore_changes = [value]
  }
}

resource "aws_ssm_parameter" "slack_bot_token" {
  name  = "/sometimes/review-collector/slack/bot-token"
  type  = "SecureString"
  value = "PLACEHOLDER"

  lifecycle {
    ignore_changes = [value]
  }
}
