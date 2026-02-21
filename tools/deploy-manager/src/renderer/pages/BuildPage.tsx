import { useEffect, useState } from 'react'
import {
  Card,
  Space,
  Typography,
  Button,
  Radio,
  Row,
  Col,
  Progress,
  Divider,
  message,
  Popconfirm,
  Tag,
  Checkbox
} from 'antd'
import {
  PlayCircleOutlined,
  ArrowUpOutlined,
  AppleOutlined,
  AndroidOutlined,
  StopOutlined,
  ReloadOutlined,
  RocketOutlined,
  DeleteOutlined
} from '@ant-design/icons'
import { useBuildStore } from '../stores/build-store'
import { BuildLogViewer } from '../components/BuildLogViewer'
import { VersionBadge } from '../components/VersionBadge'

const { Title, Text } = Typography

interface VersionInfo {
  version: string
  buildNumber: string
  ios: { buildNumber: string }
  android: { versionCode: number }
}

interface BuildArtifact {
  platform: 'ios' | 'android'
  path: string
  filename: string
  size: number
  date: string
  version: string
  buildNumber: string
}

interface BuildPageProps {
  onNavigate: (page: string) => void
}

function formatFileSize(bytes: number): string {
  if (bytes >= 1_000_000_000) return `${(bytes / 1_000_000_000).toFixed(1)} GB`
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(0)} MB`
  if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(0)} KB`
  return `${bytes} B`
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

export function BuildPage({ onNavigate }: BuildPageProps): JSX.Element {
  const [version, setVersion] = useState<VersionInfo | null>(null)
  const [platform, setPlatform] = useState<'both' | 'ios' | 'android'>('both')
  const [profile, setProfile] = useState<'production' | 'preview'>('production')
  const [artifacts, setArtifacts] = useState<BuildArtifact[]>([])

  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set())
  const [batchDeleting, setBatchDeleting] = useState(false)

  const { isBuilding, setBuilding, addLog, clearLogs, setProgress, progress, status } = useBuildStore()

  const totalSize = artifacts.reduce((sum, a) => sum + a.size, 0)

  const toggleSelect = (path: string) => {
    setSelectedPaths((prev) => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedPaths.size === artifacts.length) {
      setSelectedPaths(new Set())
    } else {
      setSelectedPaths(new Set(artifacts.map((a) => a.path)))
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedPaths.size === 0) return
    setBatchDeleting(true)
    try {
      const results = await window.api.build.deleteArtifacts([...selectedPaths])
      const succeeded = results.filter((r: { success: boolean }) => r.success).length
      const failed = results.length - succeeded
      if (failed === 0) {
        message.success(`${succeeded}개 아티팩트 삭제 완료`)
      } else {
        message.warning(`${succeeded}개 삭제, ${failed}개 실패`)
      }
      setSelectedPaths(new Set())
      loadArtifacts()
    } catch {
      message.error('삭제 실패')
    } finally {
      setBatchDeleting(false)
    }
  }

  const loadVersion = async () => {
    try {
      const v = await window.api.version.read()
      setVersion(v)
    } catch {
      // ignore
    }
  }

  const loadArtifacts = async () => {
    try {
      const list = await window.api.build.artifacts()
      setArtifacts(list)
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    loadVersion()
    loadArtifacts()

    const unsubLog = window.api.build.onLog((data) => addLog(data))
    const unsubProgress = window.api.build.onProgress((data: any) => {
      setProgress(data.platform, data.percent, data.status)
    })
    const unsubDone = window.api.build.onDone(() => {
      setBuilding(false)
      message.success('Build completed!')
      loadArtifacts()
    })
    const unsubError = window.api.build.onError((err) => {
      setBuilding(false)
      message.error(`Build failed: ${err}`)
    })

    return () => {
      unsubLog()
      unsubProgress()
      unsubDone()
      unsubError()
    }
  }, [])

  const handleBuild = async () => {
    clearLogs()
    setBuilding(true)
    try {
      await window.api.build.start({ platform, profile })
    } catch (err) {
      setBuilding(false)
      message.error('Failed to start build')
    }
  }

  const handleStop = async () => {
    try {
      await window.api.build.stop()
      setBuilding(false)
      message.info('Build cancelled')
    } catch {
      message.error('Failed to cancel build')
    }
  }

  const handleIncrement = async (type: 'patch' | 'minor' | 'major') => {
    try {
      const v = await window.api.version.increment(type)
      setVersion(v)
      message.success(`Version bumped to ${v.version}`)
    } catch {
      message.error('Failed to increment version')
    }
  }

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0, color: 'rgba(255,255,255,0.95)' }}>Build</Title>

      {/* Current Version */}
      <Card size="small">
        <Row align="middle" justify="space-between">
          <Col>
            <Space>
              <Text strong>Current Version:</Text>
              {version && (
                <VersionBadge version={version.version} build={version.buildNumber} />
              )}
            </Space>
          </Col>
          <Col>
            <Space size="small">
              <Popconfirm title="Bump patch version?" onConfirm={() => handleIncrement('patch')}>
                <Button size="small" icon={<ArrowUpOutlined />}>Patch</Button>
              </Popconfirm>
              <Popconfirm title="Bump minor version?" onConfirm={() => handleIncrement('minor')}>
                <Button size="small" icon={<ArrowUpOutlined />}>Minor</Button>
              </Popconfirm>
              <Popconfirm title="Bump major version?" onConfirm={() => handleIncrement('major')}>
                <Button size="small" icon={<ArrowUpOutlined />}>Major</Button>
              </Popconfirm>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Build Options */}
      <Card size="small">
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>Platform</Text>
            <Radio.Group value={platform} onChange={(e) => setPlatform(e.target.value)}>
              <Radio.Button value="both">
                <AppleOutlined /> + <AndroidOutlined /> Both
              </Radio.Button>
              <Radio.Button value="ios">
                <AppleOutlined /> iOS
              </Radio.Button>
              <Radio.Button value="android">
                <AndroidOutlined /> Android
              </Radio.Button>
            </Radio.Group>
          </div>

          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>Profile</Text>
            <Radio.Group value={profile} onChange={(e) => setProfile(e.target.value)}>
              <Radio.Button value="production">Production</Radio.Button>
              <Radio.Button value="preview">Preview</Radio.Button>
            </Radio.Group>
          </div>

          <Row gutter={12}>
            <Col flex="auto">
              <Button
                type="primary"
                size="large"
                icon={<PlayCircleOutlined />}
                loading={isBuilding}
                onClick={handleBuild}
                block
              >
                {isBuilding ? 'Building...' : 'Start Build'}
              </Button>
            </Col>
            {isBuilding && (
              <Col>
                <Popconfirm title="Cancel the current build?" onConfirm={handleStop}>
                  <Button size="large" danger icon={<StopOutlined />}>
                    Cancel
                  </Button>
                </Popconfirm>
              </Col>
            )}
          </Row>
        </Space>
      </Card>

      {/* Progress */}
      {isBuilding && (
        <Card size="small" title="Progress">
          <Row gutter={16}>
            {(platform === 'both' || platform === 'ios') && (
              <Col span={platform === 'both' ? 12 : 24}>
                <Text type="secondary"><AppleOutlined /> iOS: {status.ios}</Text>
                <Progress percent={progress.ios} size="small" status="active" />
              </Col>
            )}
            {(platform === 'both' || platform === 'android') && (
              <Col span={platform === 'both' ? 12 : 24}>
                <Text type="secondary"><AndroidOutlined /> Android: {status.android}</Text>
                <Progress percent={progress.android} size="small" status="active" />
              </Col>
            )}
          </Row>
        </Card>
      )}

      {/* Build Log */}
      <BuildLogViewer />

      {/* Build Artifacts */}
      <Card
        size="small"
        title="Build Artifacts"
        extra={
          <Space size="small">
            {selectedPaths.size > 0 && (
              <Popconfirm
                title={`${selectedPaths.size}개 아티팩트를 삭제하시겠습니까?`}
                description="로컬 파일이 완전히 제거됩니다."
                onConfirm={handleDeleteSelected}
              >
                <Button
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  loading={batchDeleting}
                >
                  {selectedPaths.size}개 삭제
                </Button>
              </Popconfirm>
            )}
            <Button
              size="small"
              icon={<ReloadOutlined />}
              onClick={loadArtifacts}
            >
              Refresh
            </Button>
          </Space>
        }
      >
        {artifacts.length === 0 ? (
          <Text type="secondary">No artifacts found</Text>
        ) : (
          <>
            <Row align="middle" justify="space-between" style={{ marginBottom: 8 }}>
              <Col>
                <Checkbox
                  checked={artifacts.length > 0 && selectedPaths.size === artifacts.length}
                  indeterminate={selectedPaths.size > 0 && selectedPaths.size < artifacts.length}
                  onChange={toggleSelectAll}
                >
                  <Text type="secondary">
                    전체 선택 · {artifacts.length}개 · {formatFileSize(totalSize)}
                  </Text>
                </Checkbox>
              </Col>
            </Row>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              {artifacts.map((a) => (
                <Row
                  key={a.path}
                  align="middle"
                  style={{
                    padding: '4px 0',
                    borderRadius: 8,
                    background: selectedPaths.has(a.path) ? 'rgba(102, 126, 234, 0.08)' : undefined
                  }}
                >
                  <Col>
                    <Checkbox
                      checked={selectedPaths.has(a.path)}
                      onChange={() => toggleSelect(a.path)}
                      style={{ marginRight: 8 }}
                    />
                  </Col>
                  <Col flex="auto">
                    <Space>
                      {a.platform === 'ios' ? <AppleOutlined /> : <AndroidOutlined />}
                      <div>
                        <Space size={4}>
                          <Text>{a.filename}</Text>
                          {a.version && (
                            <Tag color="purple" style={{ margin: 0 }}>
                              v{a.version}{a.buildNumber ? ` (${a.buildNumber})` : ''}
                            </Tag>
                          )}
                        </Space>
                        <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                          {formatDate(a.date)} · {formatFileSize(a.size)}
                        </Text>
                      </div>
                    </Space>
                  </Col>
                </Row>
              ))}
            </Space>
            <Divider style={{ margin: '12px 0' }} />
            <Button
              type="primary"
              icon={<RocketOutlined />}
              onClick={() => onNavigate('deploy')}
              block
            >
              Deploy to Store →
            </Button>
          </>
        )}
      </Card>
    </Space>
  )
}
