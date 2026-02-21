import { useEffect, useState } from 'react'
import {
  Card,
  Space,
  Typography,
  Button,
  Input,
  Form,
  message,
  InputNumber,
  Switch
} from 'antd'
import {
  FolderOpenOutlined,
  SaveOutlined,
  AppleOutlined,
  AndroidOutlined,
  SettingOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography

interface AppConfig {
  sometimesAppPath: string
  ios: {
    appId: string
    bundleId: string
    ascApiKeyId: string
    ascApiKeyIssuerId: string
    ascApiKeyPath: string
    review: {
      contactFirstName: string
      contactLastName: string
      contactEmail: string
      contactPhone: string
      demoAccountName: string
      demoAccountPassword: string
      demoAccountRequired: boolean
      reviewNotes: string
      attachmentPath: string
    }
  }
  android: {
    packageName: string
    serviceAccountPath: string
    track: string
  }
  buildDir: string
  monitorInterval: number
  openaiApiKey: string
}

// Glass section card
const SectionCard = ({
  icon,
  title,
  description,
  children
}: {
  icon: React.ReactNode
  title: string
  description?: string
  children: React.ReactNode
}) => (
  <Card
    size="small"
    className="glass-card"
    style={{ marginTop: 14 }}
    styles={{
      header: { padding: '10px 16px', minHeight: 'auto' },
      body: { padding: '4px 0' }
    }}
    title={
      <Space size={8}>
        <span style={{ fontSize: 15, opacity: 0.8 }}>{icon}</span>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{title}</span>
        {description && (
          <Text type="secondary" style={{ fontSize: 11, fontWeight: 400 }}>
            {description}
          </Text>
        )}
      </Space>
    }
  >
    {children}
  </Card>
)

// Inline form row
const FormRow = ({
  label,
  name,
  children
}: {
  label: string
  name?: string
  children: React.ReactNode
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      padding: '7px 16px',
      borderBottom: '1px solid rgba(0,0,0,0.04)',
      gap: 12
    }}
  >
    <Text style={{ fontSize: 13, minWidth: 120, flexShrink: 0 }}>{label}</Text>
    <div style={{ flex: 1 }}>
      <Form.Item name={name} style={{ margin: 0 }} noStyle>
        {children}
      </Form.Item>
    </div>
  </div>
)

// Subheading
const SubHeading = ({ children }: { children: string }) => (
  <div
    style={{
      padding: '10px 16px 4px',
      fontSize: 11,
      fontWeight: 600,
      color: '#8e8e93',
      textTransform: 'uppercase',
      letterSpacing: 0.5
    }}
  >
    {children}
  </div>
)

export function SettingsPage(): JSX.Element {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const loadConfig = async () => {
    try {
      const config: AppConfig = await window.api.config.get()
      const review = config.ios.review || {}
      form.setFieldsValue({
        sometimesAppPath: config.sometimesAppPath,
        buildDir: config.buildDir,
        monitorInterval: config.monitorInterval / 1000 / 60,
        iosAppId: config.ios.appId,
        iosBundleId: config.ios.bundleId,
        iosKeyId: config.ios.ascApiKeyId,
        iosIssuerId: config.ios.ascApiKeyIssuerId,
        iosKeyPath: config.ios.ascApiKeyPath,
        reviewFirstName: review.contactFirstName,
        reviewLastName: review.contactLastName,
        reviewEmail: review.contactEmail,
        reviewPhone: review.contactPhone,
        reviewDemoRequired: review.demoAccountRequired,
        reviewDemoUser: review.demoAccountName,
        reviewDemoPass: review.demoAccountPassword,
        reviewNotes: review.reviewNotes,
        reviewAttachment: review.attachmentPath,
        androidPackage: config.android.packageName,
        androidSAPath: config.android.serviceAccountPath,
        androidTrack: config.android.track,
        openaiApiKey: config.openaiApiKey
      })
    } catch {
      message.error('Failed to load config')
    }
  }

  useEffect(() => {
    loadConfig()
  }, [])

  const handleSave = async (values: any) => {
    setLoading(true)
    try {
      await window.api.config.set({
        sometimesAppPath: values.sometimesAppPath,
        buildDir: values.buildDir,
        monitorInterval: values.monitorInterval * 60 * 1000,
        ios: {
          appId: values.iosAppId,
          bundleId: values.iosBundleId,
          ascApiKeyId: values.iosKeyId,
          ascApiKeyIssuerId: values.iosIssuerId,
          ascApiKeyPath: values.iosKeyPath,
          review: {
            contactFirstName: values.reviewFirstName || '',
            contactLastName: values.reviewLastName || '',
            contactEmail: values.reviewEmail || '',
            contactPhone: values.reviewPhone || '',
            demoAccountName: values.reviewDemoUser || '',
            demoAccountPassword: values.reviewDemoPass || '',
            demoAccountRequired: values.reviewDemoRequired ?? true,
            reviewNotes: values.reviewNotes || '',
            attachmentPath: values.reviewAttachment || ''
          }
        },
        android: {
          packageName: values.androidPackage,
          serviceAccountPath: values.androidSAPath,
          track: values.androidTrack
        },
        openaiApiKey: values.openaiApiKey
      })
      message.success('Settings saved!')
    } catch {
      message.error('Failed to save settings')
    }
    setLoading(false)
  }

  const selectPath = async (field: string, type: 'file' | 'directory') => {
    const path =
      type === 'file'
        ? await window.api.system.selectFile()
        : await window.api.system.selectDirectory()
    if (path) {
      form.setFieldValue(field, path)
    }
  }

  const inputStyle = { borderRadius: 6, fontSize: 13 }

  const pathSuffix = (field: string, type: 'file' | 'directory') => (
    <FolderOpenOutlined
      onClick={() => selectPath(field, type)}
      style={{ cursor: 'pointer', color: '#667eea' }}
    />
  )

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '8px 0 24px' }}>
      <Title level={4} style={{ margin: '0 0 4px', color: 'rgba(255,255,255,0.95)' }}>
        Settings
      </Title>

      <Form form={form} onFinish={handleSave} size="small">
        {/* ── General ── */}
        <SectionCard icon={<SettingOutlined />} title="General">
          <FormRow label="App Path" name="sometimesAppPath">
            <Input style={inputStyle} addonAfter={pathSuffix('sometimesAppPath', 'directory')} />
          </FormRow>
          <FormRow label="Build Directory" name="buildDir">
            <Input style={inputStyle} addonAfter={pathSuffix('buildDir', 'directory')} />
          </FormRow>
          <FormRow label="Monitor Interval">
            <Form.Item name="monitorInterval" noStyle>
              <InputNumber min={1} max={60} style={{ width: '100%', ...inputStyle }} addonAfter="min" />
            </Form.Item>
          </FormRow>
        </SectionCard>

        {/* ── AI ── */}
        <SectionCard icon={<ThunderboltOutlined />} title="AI" description="Release notes generation">
          <FormRow label="OpenAI API Key" name="openaiApiKey">
            <Input.Password style={inputStyle} placeholder="sk-..." />
          </FormRow>
        </SectionCard>

        {/* ── iOS ── */}
        <SectionCard icon={<AppleOutlined />} title="App Store Connect">
          <FormRow label="App ID" name="iosAppId">
            <Input style={inputStyle} placeholder="6746120889" />
          </FormRow>
          <FormRow label="Bundle ID" name="iosBundleId">
            <Input style={inputStyle} placeholder="com.some-in-univ" />
          </FormRow>
          <FormRow label="API Key ID" name="iosKeyId">
            <Input style={inputStyle} placeholder="S48XP27Q9R" />
          </FormRow>
          <FormRow label="Issuer ID" name="iosIssuerId">
            <Input style={inputStyle} placeholder="e8dbd13d-74e7-45ba-..." />
          </FormRow>
          <FormRow label="API Key (.p8)" name="iosKeyPath">
            <Input style={inputStyle} addonAfter={pathSuffix('iosKeyPath', 'file')} />
          </FormRow>
        </SectionCard>

        {/* ── App Review ── */}
        <SectionCard
          icon={<SafetyCertificateOutlined />}
          title="App Review"
          description="Submitted with each iOS review"
        >
          <SubHeading>Contact Information</SubHeading>
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
            <div style={{ flex: 1, padding: '7px 8px 7px 16px' }}>
              <Text style={{ fontSize: 12, color: '#8e8e93', display: 'block', marginBottom: 2 }}>
                First Name
              </Text>
              <Form.Item name="reviewFirstName" noStyle>
                <Input variant="borderless" style={{ padding: 0, fontSize: 13 }} placeholder="Eungu" />
              </Form.Item>
            </div>
            <div style={{ width: 1, background: 'rgba(0,0,0,0.06)', margin: '8px 0' }} />
            <div style={{ flex: 1, padding: '7px 16px 7px 8px' }}>
              <Text style={{ fontSize: 12, color: '#8e8e93', display: 'block', marginBottom: 2 }}>
                Last Name
              </Text>
              <Form.Item name="reviewLastName" noStyle>
                <Input variant="borderless" style={{ padding: 0, fontSize: 13 }} placeholder="Kang" />
              </Form.Item>
            </div>
          </div>
          <FormRow label="Email" name="reviewEmail">
            <Input style={inputStyle} placeholder="review@example.com" />
          </FormRow>
          <FormRow label="Phone" name="reviewPhone">
            <Input style={inputStyle} placeholder="+82-10-1234-5678" />
          </FormRow>

          <SubHeading>Demo Account</SubHeading>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '7px 16px',
              borderBottom: '1px solid rgba(0,0,0,0.04)'
            }}
          >
            <Text style={{ fontSize: 13, flex: 1 }}>Sign-In Required</Text>
            <Form.Item name="reviewDemoRequired" valuePropName="checked" noStyle>
              <Switch size="small" />
            </Form.Item>
          </div>
          <FormRow label="Username" name="reviewDemoUser">
            <Input style={inputStyle} placeholder="AppleConnect" />
          </FormRow>
          <FormRow label="Password" name="reviewDemoPass">
            <Input.Password style={inputStyle} placeholder="Password" />
          </FormRow>

          <SubHeading>Additional Info</SubHeading>
          <div style={{ padding: '7px 16px', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
            <Text style={{ fontSize: 12, color: '#8e8e93', display: 'block', marginBottom: 4 }}>
              Review Notes
            </Text>
            <Form.Item name="reviewNotes" noStyle>
              <Input.TextArea
                rows={3}
                placeholder="Notes for the Apple reviewer..."
                style={{ ...inputStyle, resize: 'none' }}
              />
            </Form.Item>
          </div>
          <FormRow label="Demo Video" name="reviewAttachment">
            <Input
              style={inputStyle}
              placeholder="/path/to/demo-video.mp4"
              addonAfter={pathSuffix('reviewAttachment', 'file')}
            />
          </FormRow>
        </SectionCard>

        {/* ── Android ── */}
        <SectionCard icon={<AndroidOutlined />} title="Google Play">
          <FormRow label="Package Name" name="androidPackage">
            <Input style={inputStyle} placeholder="com.smartnewb.sometimes" />
          </FormRow>
          <FormRow label="Service Account" name="androidSAPath">
            <Input style={inputStyle} addonAfter={pathSuffix('androidSAPath', 'file')} />
          </FormRow>
          <FormRow label="Track" name="androidTrack">
            <Input style={inputStyle} placeholder="production" />
          </FormRow>
        </SectionCard>

        {/* ── Save Button ── */}
        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <Button
            type="primary"
            htmlType="submit"
            icon={<SaveOutlined />}
            loading={loading}
            size="large"
            className="glass-btn-primary"
            style={{
              borderRadius: 12,
              height: 44,
              paddingInline: 32,
              fontWeight: 600
            }}
          >
            Save Settings
          </Button>
        </div>
      </Form>
    </div>
  )
}
