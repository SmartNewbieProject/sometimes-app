import { useEffect, useRef, useState } from 'react'
import {
  Card,
  Button,
  Space,
  Empty,
  Select,
  Input,
  Segmented,
  Table,
  Tag,
  DatePicker
} from 'antd'
import {
  ClearOutlined,
  SearchOutlined,
  HistoryOutlined,
  ThunderboltOutlined
} from '@ant-design/icons'
import { useBuildStore } from '../stores/build-store'

interface BuildSession {
  id: number
  platform: string
  profile: string
  startedAt: number
  finishedAt: number | null
  status: string
}

interface HistoricalLog {
  id: number
  sessionId: number
  line: string
  type: string
  seq: number
  loggedAt: number
}

type ViewMode = 'live' | 'history'

const TYPE_COLORS: Record<string, string> = {
  error: 'red',
  warn: 'orange',
  success: 'green',
  info: 'default'
}

const columns = [
  {
    title: '#',
    dataIndex: 'seq',
    width: 60
  },
  {
    title: 'Type',
    dataIndex: 'type',
    width: 80,
    render: (type: string) => <Tag color={TYPE_COLORS[type] || 'default'}>{type}</Tag>
  },
  {
    title: 'Log',
    dataIndex: 'line',
    ellipsis: true
  }
]

export function BuildLogViewer(): JSX.Element {
  const { logs, clearLogs, isBuilding } = useBuildStore()
  const endRef = useRef<HTMLDivElement>(null)
  const [mode, setMode] = useState<ViewMode>('live')

  // Historical mode state
  const [sessions, setSessions] = useState<BuildSession[]>([])
  const [selectedSession, setSelectedSession] = useState<number | undefined>()
  const [filterType, setFilterType] = useState<string | undefined>()
  const [filterPlatform, setFilterPlatform] = useState<string | undefined>()
  const [keyword, setKeyword] = useState('')
  const [historicalLogs, setHistoricalLogs] = useState<HistoricalLog[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs.length])

  // Switch to live when building starts
  useEffect(() => {
    if (isBuilding) setMode('live')
  }, [isBuilding])

  // Load sessions when switching to history mode
  useEffect(() => {
    if (mode === 'history') {
      loadSessions()
    }
  }, [mode])

  const loadSessions = async () => {
    try {
      const result = await window.api.build.getSessions(100)
      setSessions(result)
    } catch {
      // ignore
    }
  }

  const searchLogs = async (pageNum = 1) => {
    setLoading(true)
    try {
      const result = await window.api.build.queryLogs({
        sessionId: selectedSession,
        platform: filterPlatform,
        type: filterType,
        keyword: keyword || undefined,
        limit: 100,
        offset: (pageNum - 1) * 100
      })
      setHistoricalLogs(result.rows)
      setTotal(result.total)
      setPage(pageNum)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (mode === 'history') {
      searchLogs(1)
    }
  }, [selectedSession, filterType, filterPlatform])

  const handleSearch = () => {
    searchLogs(1)
  }

  return (
    <Card
      size="small"
      title={
        <Space>
          Build Log
          <Segmented
            size="small"
            value={mode}
            onChange={(v) => setMode(v as ViewMode)}
            options={[
              { label: 'Live', value: 'live', icon: <ThunderboltOutlined /> },
              { label: 'History', value: 'history', icon: <HistoryOutlined /> }
            ]}
          />
        </Space>
      }
      extra={
        mode === 'live' ? (
          <Button size="small" icon={<ClearOutlined />} onClick={clearLogs}>
            Clear
          </Button>
        ) : null
      }
    >
      {mode === 'live' ? (
        // Live mode
        logs.length === 0 ? (
          <Empty description="No build logs yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <div className="build-log" style={{ maxHeight: 350 }}>
            {logs.map((log) => (
              <div key={log.id} className={`log-line ${log.type}`}>
                {log.line}
              </div>
            ))}
            <div ref={endRef} />
          </div>
        )
      ) : (
        // Historical mode
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {/* Filter toolbar */}
          <Space wrap>
            <Select
              placeholder="Session"
              allowClear
              style={{ width: 220 }}
              value={selectedSession}
              onChange={setSelectedSession}
              options={sessions.map((s) => ({
                value: s.id,
                label: `#${s.id} ${s.platform} (${s.profile}) - ${new Date(s.startedAt).toLocaleString()}`
              }))}
            />
            <Select
              placeholder="Platform"
              allowClear
              style={{ width: 120 }}
              value={filterPlatform}
              onChange={setFilterPlatform}
              options={[
                { value: 'ios', label: 'iOS' },
                { value: 'android', label: 'Android' },
                { value: 'both', label: 'Both' }
              ]}
            />
            <Select
              placeholder="Type"
              allowClear
              style={{ width: 110 }}
              value={filterType}
              onChange={setFilterType}
              options={[
                { value: 'info', label: 'Info' },
                { value: 'warn', label: 'Warn' },
                { value: 'error', label: 'Error' },
                { value: 'success', label: 'Success' }
              ]}
            />
            <Input.Search
              placeholder="Keyword"
              allowClear
              style={{ width: 200 }}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onSearch={handleSearch}
            />
          </Space>

          <Table
            dataSource={historicalLogs}
            columns={columns}
            rowKey="id"
            size="small"
            loading={loading}
            pagination={{
              current: page,
              total,
              pageSize: 100,
              showTotal: (t) => `${t} lines`,
              onChange: (p) => searchLogs(p)
            }}
            scroll={{ y: 300 }}
          />
        </Space>
      )}
    </Card>
  )
}
