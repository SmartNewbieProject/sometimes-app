resource "aws_lambda_function" "review_collector" {
  function_name = "sometimes-review-collector"
  role          = aws_iam_role.lambda.arn
  handler       = "index.handler"
  runtime       = "nodejs20.x"
  timeout       = 300
  memory_size   = 256

  filename         = "${path.module}/../lambda.zip"
  source_code_hash = filebase64sha256("${path.module}/../lambda.zip")

  environment {
    variables = {
      TABLE_NAME              = aws_dynamodb_table.reviews.name
      SLACK_CHANNEL           = var.slack_channel
      APP_STORE_APP_ID        = var.app_store_app_id
      PLAY_STORE_PACKAGE_NAME = var.play_store_package_name
      SSM_PREFIX              = "/sometimes/review-collector"
      MIGRATION_MODE          = "false"
    }
  }
}

resource "aws_cloudwatch_log_group" "lambda" {
  name              = "/aws/lambda/${aws_lambda_function.review_collector.function_name}"
  retention_in_days = 30
}
