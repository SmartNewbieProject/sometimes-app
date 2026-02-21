import { useEffect, useState } from 'react'
import { Card, Row, Col, Typography, Space, Button, Timeline, Tag, Spin } from 'antd'
import {
  AppleOutlined,
  AndroidOutlined,
  BuildOutlined,
  RocketOutlined,
  ReloadOutlined
} from '@ant-design/icons'
import { VersionBadge } from '../components/VersionBadge'
import { StoreStatusCard } from '../components/StoreStatusCard'

const { Title, Text } = Typography

interface VersionInfo {
  version: string
  buildNumber: string
}

interface StatusInfo {
  ios: { state: string; version: string } | null
  android: { state: string; version: string } | null
}

interface DashboardProps {
  onNavigate: (page: string) => void
}

export function DashboardPage({ onNavigate }: DashboardProps): JSX.Element {
  const [version, setVersion] = useState<VersionInfo | null>(null)
  const [status, setStatus] = useState<StatusInfo>({ ios: null, android: null })
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    setLoading(true)
    try {
      const [ver, ios, android] = await Promise.allSettled([
        window.api.version.read(),
        window.api.monitor.iosStatus(),
        window.api.monitor.androidStatus()
      ])

      if (ver.status === 'fulfilled') setVersion(ver.value)
      setStatus({
        ios: ios.status === 'fulfilled' && ios.value
          ? { state: ios.value.appStoreState, version: ios.value.versionString }
          : null,
        android: android.status === 'fulfilled' && android.value?.releases?.[0]
          ? { state: android.value.releases[0].status, version: android.value.releases[0].name }
          : null
      })
    } catch {
      // ignore
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Header */}
      <Row justify="space-between" align="middle">
        <Col>
          <Space>
            <Title level={4} style={{ margin: 0, color: 'rgba(255,255,255,0.95)' }}>Dashboard</Title>
            {version && <VersionBadge version={version.version} build={version.buildNumber} />}
          </Space>
        </Col>
        <Col>
          <Button icon={<ReloadOutlined />} onClick={loadData} loading={loading} size="small">
            Refresh
          </Button>
        </Col>
      </Row>

      {/* Status Cards */}
      <Spin spinning={loading}>
        <Row gutter={16}>
          <Col span={12}>
            <StoreStatusCard
              platform="ios"
              icon={<AppleOutlined />}
              version={status.ios?.version ?? version?.version ?? '-'}
              state={status.ios?.state ?? 'Unknown'}
            />
          </Col>
          <Col span={12}>
            <StoreStatusCard
              platform="android"
              icon={<AndroidOutlined />}
              version={status.android?.version ?? version?.version ?? '-'}
              state={status.android?.state ?? 'Unknown'}
            />
          </Col>
        </Row>
      </Spin>

      {/* Quick Actions */}
      <Card size="small" title="Quick Actions">
        <Space>
          <Button type="primary" icon={<BuildOutlined />} size="large" onClick={() => onNavigate('build')}>
            Build
          </Button>
          <Button icon={<RocketOutlined />} size="large" onClick={() => onNavigate('deploy')}>
            Deploy
          </Button>
        </Space>
      </Card>

      {/* Recent Activity - placeholder */}
      <Card size="small" title="Recent Activity">
        <Timeline
          items={[
            { children: 'App started', color: 'blue' },
            { children: 'Ready for deployment', color: 'green' }
          ]}
        />
      </Card>
    </Space>
  )
}
