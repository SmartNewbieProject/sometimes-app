import { Tabs, Input } from 'antd'

const { TextArea } = Input

interface Props {
  notes: { ko: string; ja: string; 'en-US': string }
  onChange: (notes: { ko: string; ja: string; 'en-US': string }) => void
}

export function ReleaseNotesEditor({ notes, onChange }: Props): JSX.Element {
  const tabs = [
    { key: 'ko', label: 'Korean', flag: '🇰🇷' },
    { key: 'ja', label: 'Japanese', flag: '🇯🇵' },
    { key: 'en-US', label: 'English', flag: '🇺🇸' }
  ] as const

  return (
    <div className="release-notes-editor">
      <Tabs
        size="small"
        items={tabs.map((t) => ({
          key: t.key,
          label: `${t.flag} ${t.label}`,
          children: (
            <TextArea
              rows={6}
              value={notes[t.key]}
              onChange={(e) =>
                onChange({ ...notes, [t.key]: e.target.value })
              }
              placeholder={`Enter ${t.label} release notes...`}
            />
          )
        }))}
      />
    </div>
  )
}
