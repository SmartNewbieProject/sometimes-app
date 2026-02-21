import { useEffect, useState } from 'react'
import {
  Card,
  Space,
  Typography,
  Button,
  Row,
  Col,
  Divider,
  message,
  Tag,
  Radio
} from 'antd'
import {
  RocketOutlined,
  AppleOutlined,
  AndroidOutlined,
  FileTextOutlined,
  ThunderboltOutlined,
  ReloadOutlined
} from '@ant-design/icons'
import { useDeployStore } from '../stores/deploy-store'
import { ReleaseNotesEditor } from '../components/ReleaseNotesEditor'
import { DeployProgress } from '../components/DeployProgress'

const { Title, Text } = Typography

interface BuildArtifact {
  platform: string
  path: string
  filename: string
  size: number
  date: string
  version: string
  buildNumber: string
}

export function DeployPage(): JSX.Element {
  const [artifacts, setArtifacts] = useState<BuildArtifact[]>([])
  const [version, setVersion] = useState('')
  const [selectedIos, setSelectedIos] = useState<string>('')
  const [selectedAndroid, setSelectedAndroid] = useState<string>('')

  const {
    isDeploying,
    setDeploying,
    releaseNotes,
    setReleaseNotes,
    updateStep,
    resetSteps,
    iosSteps,
    androidSteps
  } = useDeployStore()

  useEffect(() => {
    loadArtifacts()
    loadVersion()

    const unsubProgress = window.api.deploy.onProgress((data: any) => {
      const stepStatus = data.step === 'done' ? 'finish' : data.step === 'error' ? 'error' : 'process'

      // Mark current step and finish previous ones
      updateStep(data.platform, data.step, stepStatus, data.message)

      if (data.step === 'done') {
        message.success(`${data.platform === 'ios' ? 'iOS' : 'Android'} deploy completed!`)
      }
      if (data.step === 'error') {
        message.error(`${data.platform}: ${data.message}`)
        setDeploying(false)
      }
    })

    return () => unsubProgress()
  }, [])

  const loadArtifacts = async () => {
    try {
      const list: BuildArtifact[] = await window.api.build.artifacts()
      setArtifacts(list)
      // Auto-select the latest artifact for each platform
      const firstIos = list.find((a) => a.platform === 'ios')
      const firstAndroid = list.find((a) => a.platform === 'android')
      if (firstIos) setSelectedIos(firstIos.path)
      if (firstAndroid) setSelectedAndroid(firstAndroid.path)
    } catch {
      // ignore
    }
  }

  const loadVersion = async () => {
    try {
      const v = await window.api.version.read()
      setVersion(v.version)
    } catch {
      // ignore
    }
  }

  const [aiLoading, setAiLoading] = useState(false)

  const handleAIGenerate = async () => {
    setAiLoading(true)
    try {
      const result = await window.api.deploy.generateReleaseNotesAI()
      if (result.success) {
        setReleaseNotes(result.notes)
        message.success('AI release notes generated!')
      } else {
        message.error(result.error)
      }
    } catch {
      message.error('Failed to generate AI release notes')
    } finally {
      setAiLoading(false)
    }
  }

  const handleGenerateNotes = async () => {
    try {
      const notes = await window.api.deploy.generateReleaseNotes()
      setReleaseNotes(notes)
      message.success('Release notes generated!')
    } catch {
      message.error('Failed to generate release notes')
    }
  }

  const getSelectedArtifact = (platform: string): BuildArtifact | undefined => {
    const selectedPath = platform === 'ios' ? selectedIos : selectedAndroid
    return artifacts.find((a) => a.path === selectedPath)
  }

  const deployIOS = async (): Promise<boolean> => {
    const ipa = getSelectedArtifact('ios')
    if (!ipa) {
      message.warning('Please select an iOS artifact')
      return false
    }
    if (!releaseNotes.ko) {
      message.warning('Please generate or write release notes first')
      return false
    }
    const deployVersion = ipa.version || version
    const buildNumber = ipa.buildNumber
    try {
      const result = await window.api.deploy.ios({ version: deployVersion, buildNumber, releaseNotes })
      return result.success
    } catch {
      message.error('iOS deploy failed')
      return false
    }
  }

  const deployAndroid = async (): Promise<boolean> => {
    const aab = getSelectedArtifact('android')
    if (!aab) {
      message.warning('Please select an Android artifact')
      return false
    }
    if (!releaseNotes.ko) {
      message.warning('Please generate or write release notes first')
      return false
    }
    const deployVersion = aab.version || version
    try {
      const result = await window.api.deploy.android({ aabPath: aab.path, releaseNotes, version: deployVersion })
      return result.success
    } catch {
      message.error('Android deploy failed')
      return false
    }
  }

  const handleDeployIOS = async () => {
    resetSteps()
    setDeploying(true)
    await deployIOS()
    setDeploying(false)
  }

  const handleDeployAndroid = async () => {
    resetSteps()
    setDeploying(true)
    await deployAndroid()
    setDeploying(false)
  }

  const handleDeployAll = async () => {
    resetSteps()
    setDeploying(true)
    await deployIOS()
    await deployAndroid()
    setDeploying(false)
  }

  const formatSize = (bytes: number) => {
    if (bytes > 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
    return `${(bytes / 1024).toFixed(0)} KB`
  }

  const iosArtifacts = artifacts.filter((a) => a.platform === 'ios')
  const androidArtifacts = artifacts.filter((a) => a.platform === 'android')

  const renderArtifactSelector = (
    list: BuildArtifact[],
    selected: string,
    onSelect: (path: string) => void,
    icon: React.ReactNode,
    label: string
  ) => (
    <div>
      <Text strong style={{ display: 'block', marginBottom: 8 }}>{icon} {label}</Text>
      {list.length === 0 ? (
        <Text type="secondary" style={{ fontSize: 12 }}>No {label} artifacts</Text>
      ) : (
        <Radio.Group
          value={selected}
          onChange={(e) => onSelect(e.target.value)}
          style={{ width: '100%' }}
        >
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            {list.map((a) => (
              <Radio key={a.path} value={a.path} style={{ width: '100%' }}>
                <Row align="middle" style={{ display: 'inline-flex', gap: 8 }}>
                  <Text
                    code
                    style={{ fontSize: 12, cursor: 'pointer' }}
                    onClick={(e) => { e.preventDefault(); window.api.system.showInFolder(a.path) }}
                  >
                    {a.filename}
                  </Text>
                  {a.version && (
                    <Tag color="purple" style={{ margin: 0 }}>
                      v{a.version}{a.buildNumber ? ` (${a.buildNumber})` : ''}
                    </Tag>
                  )}
                  <Tag>{formatSize(a.size)}</Tag>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {new Date(a.date).toLocaleString('ko-KR')}
                  </Text>
                </Row>
              </Radio>
            ))}
          </Space>
        </Radio.Group>
      )}
    </div>
  )

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0, color: 'rgba(255,255,255,0.95)' }}>Deploy</Title>

      {/* Artifacts */}
      <Card
        size="small"
        title="Build Artifacts"
        extra={
          <Button size="small" icon={<ReloadOutlined />} onClick={loadArtifacts}>
            Refresh
          </Button>
        }
      >
        {artifacts.length === 0 ? (
          <Text type="secondary">No build artifacts found. Run a build first.</Text>
        ) : (
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {renderArtifactSelector(iosArtifacts, selectedIos, setSelectedIos, <AppleOutlined />, 'iOS')}
            {androidArtifacts.length > 0 && iosArtifacts.length > 0 && <Divider style={{ margin: 0 }} />}
            {renderArtifactSelector(androidArtifacts, selectedAndroid, setSelectedAndroid, <AndroidOutlined />, 'Android')}
          </Space>
        )}
      </Card>

      {/* Release Notes */}
      <Card
        size="small"
        title="Release Notes"
        extra={
          <Space>
            <Button
              icon={<FileTextOutlined />}
              size="small"
              onClick={handleGenerateNotes}
            >
              Auto Generate
            </Button>
            <Button
              type="primary"
              icon={<ThunderboltOutlined />}
              size="small"
              onClick={handleAIGenerate}
              loading={aiLoading}
            >
              AI Generate
            </Button>
          </Space>
        }
      >
        <ReleaseNotesEditor
          notes={releaseNotes}
          onChange={setReleaseNotes}
        />
      </Card>

      {/* Deploy Progress */}
      {isDeploying && (
        <Row gutter={16}>
          <Col span={12}>
            <DeployProgress title="iOS Deploy" steps={iosSteps} />
          </Col>
          <Col span={12}>
            <DeployProgress title="Android Deploy" steps={androidSteps} />
          </Col>
        </Row>
      )}

      {/* Deploy Actions */}
      <Card size="small">
        <Row gutter={12}>
          <Col span={8}>
            <Button
              icon={<AppleOutlined />}
              size="large"
              block
              onClick={handleDeployIOS}
              loading={isDeploying}
            >
              iOS Deploy
            </Button>
          </Col>
          <Col span={8}>
            <Button
              icon={<AndroidOutlined />}
              size="large"
              block
              onClick={handleDeployAndroid}
              loading={isDeploying}
            >
              Android Deploy
            </Button>
          </Col>
          <Col span={8}>
            <Button
              type="primary"
              icon={<ThunderboltOutlined />}
              size="large"
              block
              onClick={handleDeployAll}
              loading={isDeploying}
            >
              Deploy All
            </Button>
          </Col>
        </Row>
      </Card>
    </Space>
  )
}
