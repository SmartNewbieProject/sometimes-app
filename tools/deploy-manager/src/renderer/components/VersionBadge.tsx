import { Tag, Space } from 'antd'

interface Props {
  version: string
  build?: string
}

export function VersionBadge({ version, build }: Props): JSX.Element {
  return (
    <Space size={4}>
      <Tag color="purple">v{version}</Tag>
      {build && <Tag>#{build}</Tag>}
    </Space>
  )
}
