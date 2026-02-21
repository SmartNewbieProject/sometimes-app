import { useEffect, useState } from 'react'
import {
  Card,
  Space,
  Typography,
  Button,
  Row,
  Col,
  Tag,
  Table,
  Spin,
  message
} from 'antd'
import {
  ReloadOutlined,
  AppleOutlined,
  AndroidOutlined,
  ClockCircleOutlined,
  ImportOutlined,
  RocketOutlined,
  ExportOutlined
} from '@ant-design/icons'
import { useMonitorStore } from '../stores/monitor-store'

const { Title, Text } = Typography

const stateColors: Record<string, string> = {
  // iOS states
  READY_FOR_SALE: 'green',
  WAITING_FOR_REVIEW: 'orange',
  IN_REVIEW: 'blue',
  PREPARE_FOR_SUBMISSION: 'default',
  REJECTED: 'red',
  DEVELOPER_REJECTED: 'volcano',
  PENDING_DEVELOPER_RELEASE: 'cyan',
  // Android states
  completed: 'green',
  inProgress: 'blue',
  draft: 'default',
  halted: 'red'
}

const stateLabels: Record<string, string> = {
  READY_FOR_SALE: '출시됨',
  WAITING_FOR_REVIEW: '심사 대기',
  IN_REVIEW: '심사 중',
  PREPARE_FOR_SUBMISSION: '제출 준비',
  REJECTED: '거부됨',
  DEVELOPER_REJECTED: '개발자 거부',
  PENDING_DEVELOPER_RELEASE: '출시 대기',
  completed: '출시됨',
  inProgress: '롤아웃 중',
  draft: '초안',
  halted: '중단됨'
}

export function MonitorPage(): JSX.Element {
  const {
    iosStatus,
    androidStatus,
    history,
    isLoading,
    lastRefresh,
    setIOSStatus,
    setAndroidStatus,
    setHistory,
    setLoading,
    setLastRefresh,
    handleStateChange
  } = useMonitorStore()

  const refresh = async () => {
    setLoading(true)
    try {
      const [ios, android, hist] = await Promise.allSettled([
        window.api.monitor.iosStatus(),
        window.api.monitor.androidStatus(),
        window.api.monitor.history()
      ])

      if (ios.status === 'fulfilled') setIOSStatus(ios.value)
      if (android.status === 'fulfilled') setAndroidStatus(android.value)
      if (hist.status === 'fulfilled') setHistory(hist.value)
      setLastRefresh()
    } catch {
      // ignore
    }
    setLoading(false)
  }

  const [importing, setImporting] = useState(false)
  const [releasing, setReleasing] = useState<'ios' | 'android' | null>(null)
  const [resubmitting, setResubmitting] = useState(false)

  const handleRelease = async (platform: 'ios' | 'android') => {
    setReleasing(platform)
    try {
      const result = platform === 'ios'
        ? await window.api.deploy.releaseIos()
        : await window.api.deploy.releaseAndroid()
      if (result.success) {
        message.success(`${platform === 'ios' ? 'iOS' : 'Android'} 출시가 완료되었습니다!`)
        await refresh()
      } else {
        message.error(result.error)
      }
    } catch {
      message.error(`${platform === 'ios' ? 'iOS' : 'Android'} 출시 실패`)
    }
    setReleasing(null)
  }

  const handleResubmit = async () => {
    setResubmitting(true)
    try {
      const result = await window.api.deploy.resubmitIos()
      if (result.success) {
        message.success('심사 재제출이 완료되었습니다!')
        await refresh()
      } else {
        message.error(result.error)
      }
    } catch {
      message.error('심사 재제출 실패')
    }
    setResubmitting(false)
  }

  const handleOpenResolutionCenter = async () => {
    const url = await window.api.deploy.resolutionCenterUrl()
    window.api.system.openExternal(url)
  }

  const handleImportGit = async () => {
    setImporting(true)
    try {
      const result = await window.api.monitor.importGitHistory()
      message.success(`${result.imported}건의 Git 이력을 가져왔습니다.`)
      await refresh()
    } catch {
      message.error('Git 이력 가져오기 실패')
    }
    setImporting(false)
  }

  useEffect(() => {
    // Initial load
    refresh()

    // Listen for push events from MonitorService (Main process)
    const unsubscribe = window.api.monitor.onStateChanged((data) => {
      handleStateChange(data as Parameters<typeof handleStateChange>[0])
      // Also refresh history since MonitorService may have updated it
      window.api.monitor.history().then((hist) => {
        useMonitorStore.getState().setHistory(hist)
      })
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const historyColumns = [
    { title: 'Version', dataIndex: 'version', key: 'version' },
    { title: 'Build', dataIndex: 'buildNumber', key: 'buildNumber' },
    { title: 'Date', dataIndex: 'date', key: 'date', render: (d: string) => new Date(d).toLocaleDateString() },
    {
      title: 'iOS',
      dataIndex: 'iosStatus',
      key: 'iosStatus',
      render: (s: string) => (
        <Tag color={stateColors[s] || 'default'}>{stateLabels[s] || s}</Tag>
      )
    },
    {
      title: 'Android',
      dataIndex: 'androidStatus',
      key: 'androidStatus',
      render: (s: string) => (
        <Tag color={stateColors[s] || 'default'}>{stateLabels[s] || s}</Tag>
      )
    }
  ]

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Row justify="space-between" align="middle">
        <Col>
          <Title level={4} style={{ margin: 0, color: 'rgba(255,255,255,0.95)' }}>Monitor</Title>
        </Col>
        <Col>
          <Space>
            {lastRefresh && (
              <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
                <ClockCircleOutlined /> Last: {lastRefresh}
              </Text>
            )}
            <Button
              icon={<ReloadOutlined />}
              onClick={refresh}
              loading={isLoading}
              size="small"
            >
              Refresh
            </Button>
          </Space>
        </Col>
      </Row>

      <Spin spinning={isLoading}>
        <Row gutter={16}>
          {/* iOS Status */}
          <Col span={12}>
            <Card
              size="small"
              title={
                <Space>
                  <AppleOutlined />
                  <span>iOS App Store</span>
                </Space>
              }
            >
              {iosStatus ? (
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Space>
                    <Text strong>{iosStatus.versionString}</Text>
                    <Tag color={stateColors[iosStatus.appStoreState] || 'default'}>
                      {stateLabels[iosStatus.appStoreState] || iosStatus.appStoreState}
                    </Tag>
                  </Space>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Created: {new Date(iosStatus.createdDate).toLocaleString()}
                  </Text>
                  {iosStatus.appStoreState === 'PENDING_DEVELOPER_RELEASE' && (
                    <Button
                      type="primary"
                      icon={<RocketOutlined />}
                      loading={releasing === 'ios'}
                      onClick={() => handleRelease('ios')}
                      block
                    >
                      App Store 출시
                    </Button>
                  )}
                  {iosStatus.appStoreState === 'REJECTED' && (
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Button
                        icon={<ExportOutlined />}
                        onClick={handleOpenResolutionCenter}
                        block
                      >
                        거부 사유 확인 (Resolution Center)
                      </Button>
                      <Button
                        type="primary"
                        danger
                        icon={<RocketOutlined />}
                        loading={resubmitting}
                        onClick={handleResubmit}
                        block
                      >
                        심사 재제출
                      </Button>
                    </Space>
                  )}
                </Space>
              ) : (
                <Text type="secondary">No data available. Check settings.</Text>
              )}
            </Card>
          </Col>

          {/* Android Status */}
          <Col span={12}>
            <Card
              size="small"
              title={
                <Space>
                  <AndroidOutlined />
                  <span>Google Play</span>
                </Space>
              }
            >
              {androidStatus?.releases?.length ? (
                () => {
                  // draft/inProgress 릴리즈를 우선 표시 (게시 대기 상태를 놓치지 않도록)
                  const priorityOrder = ['draft', 'inProgress', 'halted', 'completed']
                  const sorted = [...androidStatus.releases].sort(
                    (a, b) => priorityOrder.indexOf(a.status) - priorityOrder.indexOf(b.status)
                  )
                  const release = sorted[0]
                  return (
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Space>
                        <Text strong>{release.name}</Text>
                        <Tag color={stateColors[release.status] || 'default'}>
                          {stateLabels[release.status] || release.status}
                        </Tag>
                      </Space>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Track: {androidStatus.track}
                        {release.userFraction != null &&
                          ` | Rollout: ${(release.userFraction * 100).toFixed(0)}%`}
                      </Text>
                      {release.status === 'draft' && (
                        <Button
                          type="primary"
                          icon={<RocketOutlined />}
                          loading={releasing === 'android'}
                          onClick={() => handleRelease('android')}
                          block
                        >
                          Google Play 출시
                        </Button>
                      )}
                    </Space>
                  )
                }
              )() : (
                <Text type="secondary">No data available. Check settings.</Text>
              )}
            </Card>
          </Col>
        </Row>
      </Spin>

      {/* Deploy History */}
      <Card
        size="small"
        title="Deploy History"
        extra={
          <Button
            icon={<ImportOutlined />}
            size="small"
            onClick={handleImportGit}
            loading={importing}
          >
            Import Git History
          </Button>
        }
      >
        <Table
          dataSource={history}
          columns={historyColumns}
          rowKey="id"
          size="small"
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: 'No deploy history yet.' }}
        />
      </Card>
    </Space>
  )
}
