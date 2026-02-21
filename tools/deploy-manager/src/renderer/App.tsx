import { useState } from 'react'
import { Layout, Menu, Typography, theme } from 'antd'
import {
  DashboardOutlined,
  BuildOutlined,
  RocketOutlined,
  RadarChartOutlined,
  SettingOutlined
} from '@ant-design/icons'
import { DashboardPage } from './pages/DashboardPage'
import { BuildPage } from './pages/BuildPage'
import { DeployPage } from './pages/DeployPage'
import { MonitorPage } from './pages/MonitorPage'
import { SettingsPage } from './pages/SettingsPage'

const { Sider, Content } = Layout
const { Text } = Typography

type PageKey = 'dashboard' | 'build' | 'deploy' | 'monitor' | 'settings'

const menuItems = [
  { key: 'dashboard', icon: <DashboardOutlined />, label: '' },
  { key: 'build', icon: <BuildOutlined />, label: '' },
  { key: 'deploy', icon: <RocketOutlined />, label: '' },
  { key: 'monitor', icon: <RadarChartOutlined />, label: '' },
  { key: 'settings', icon: <SettingOutlined />, label: '' }
]

function getPageMap(onNavigate: (page: PageKey) => void): Record<PageKey, React.ReactNode> {
  return {
    dashboard: <DashboardPage onNavigate={onNavigate} />,
    build: <BuildPage onNavigate={onNavigate} />,
    deploy: <DeployPage />,
    monitor: <MonitorPage />,
    settings: <SettingsPage />
  }
}

const pageTitles: Record<PageKey, string> = {
  dashboard: 'Dashboard',
  build: 'Build',
  deploy: 'Deploy',
  monitor: 'Monitor',
  settings: 'Settings'
}

export function App(): JSX.Element {
  const [currentPage, setCurrentPage] = useState<PageKey>('dashboard')
  const pageMap = getPageMap(setCurrentPage)

  return (
    <Layout style={{ height: '100vh' }}>
      <Sider
        width={64}
        className="glass-sider"
        style={{ paddingTop: 48 }}
      >
        <Menu
          mode="inline"
          inlineCollapsed
          selectedKeys={[currentPage]}
          items={menuItems}
          onClick={({ key }) => setCurrentPage(key as PageKey)}
          style={{ border: 'none' }}
        />
      </Sider>
      <Layout style={{ background: 'transparent' }}>
        {/* Titlebar drag region */}
        <div
          className="titlebar-drag glass-titlebar"
          style={{
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 16,
            paddingRight: 16
          }}
        >
          <Text strong style={{ fontSize: 13 }}>
            {pageTitles[currentPage]}
          </Text>
          <Text
            type="secondary"
            style={{ marginLeft: 'auto', fontSize: 11 }}
            className="titlebar-no-drag"
          >
            Sometimes Deploy Manager
          </Text>
        </div>
        <Content
          className="glass-content"
          style={{
            padding: 20,
            overflow: 'auto'
          }}
        >
          {pageMap[currentPage]}
        </Content>
      </Layout>
    </Layout>
  )
}
