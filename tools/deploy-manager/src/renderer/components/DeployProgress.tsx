import { Card, Steps } from 'antd'
import type { DeployStep } from '../stores/deploy-store'

interface Props {
  title: string
  steps: DeployStep[]
}

export function DeployProgress({ title, steps }: Props): JSX.Element {
  const current = steps.findIndex((s) => s.status === 'process')
  const hasError = steps.some((s) => s.status === 'error')

  return (
    <Card size="small" title={title} className="deploy-steps">
      <Steps
        direction="vertical"
        size="small"
        current={current >= 0 ? current : hasError ? steps.length : steps.length}
        status={hasError ? 'error' : undefined}
        items={steps.map((s) => ({
          title: s.title,
          description: s.message,
          status: s.status
        }))}
      />
    </Card>
  )
}
