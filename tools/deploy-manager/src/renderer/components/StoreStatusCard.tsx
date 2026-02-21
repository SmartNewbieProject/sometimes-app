import { Card, Typography, Tag, Space } from 'antd'

const { Text } = Typography

interface Props {
  platform: 'ios' | 'android'
  icon: React.ReactNode
  version: string
  state: string
}

const stateColors: Record<string, string> = {
  READY_FOR_SALE: 'green',
  WAITING_FOR_REVIEW: 'orange',
  IN_REVIEW: 'blue',
  PREPARE_FOR_SUBMISSION: 'default',
  REJECTED: 'red',
  completed: 'green',
  inProgress: 'blue',
  Unknown: 'default'
}

const stateLabels: Record<string, string> = {
  READY_FOR_SALE: '출시됨',
  WAITING_FOR_REVIEW: '심사 대기',
  IN_REVIEW: '심사 중',
  PREPARE_FOR_SUBMISSION: '제출 준비',
  REJECTED: '거부됨',
  completed: '출시됨',
  inProgress: '롤아웃 중',
  Unknown: '-'
}

export function StoreStatusCard({ platform, icon, version, state }: Props): JSX.Element {
  return (
    <Card size="small" className="status-card">
      <Space direction="vertical" size={4}>
        <Space>
          {icon}
          <Text strong>{platform === 'ios' ? 'iOS' : 'Android'}</Text>
        </Space>
        <Text style={{ fontSize: 20, fontWeight: 600 }}>v{version}</Text>
        <Tag color={stateColors[state] || 'default'}>
          {stateLabels[state] || state}
        </Tag>
      </Space>
    </Card>
  )
}
