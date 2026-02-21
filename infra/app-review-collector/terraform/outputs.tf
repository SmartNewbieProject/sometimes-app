output "lambda_function_name" {
  description = "Lambda function name"
  value       = aws_lambda_function.review_collector.function_name
}

output "lambda_function_arn" {
  description = "Lambda function ARN"
  value       = aws_lambda_function.review_collector.arn
}

output "dynamodb_table_name" {
  description = "DynamoDB table name"
  value       = aws_dynamodb_table.reviews.name
}

output "dynamodb_table_arn" {
  description = "DynamoDB table ARN"
  value       = aws_dynamodb_table.reviews.arn
}

output "eventbridge_rule_arn" {
  description = "EventBridge schedule rule ARN"
  value       = aws_cloudwatch_event_rule.schedule.arn
}
