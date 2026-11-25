import {
  Avatar,
  Button,
  Input,
  Text,
  Tooltip,
} from '@fluentui/react-components'
import {
  Add24Regular,
  AlertRegular,
  AppsListDetail24Regular,
  Navigation24Regular,
  QuestionCircle24Regular,
  Search24Regular,
} from '@fluentui/react-icons'

interface AppHeaderProps {
  onMenuClick: () => void
  onNewRequest: () => void
}

function AppHeader({ onMenuClick, onNewRequest }: AppHeaderProps) {
  return (
    <header className="app-header">
      <Tooltip content="Toggle navigation" relationship="label">
        <Button
          aria-label="Toggle navigation"
          appearance="subtle"
          className="header-menu-button"
          icon={<Navigation24Regular />}
          onClick={onMenuClick}
        />
      </Tooltip>
      <div className="brand-lockup">
        <span className="brand-mark" aria-hidden="true">
          <AppsListDetail24Regular />
        </span>
        <div className="brand-copy">
          <Text className="brand-name" as="span">
            Direct Project Setup
          </Text>
          <Text className="brand-caption" as="span">
            Project operations
          </Text>
        </div>
      </div>
      <Input
        aria-label="Search projects and requests"
        className="header-search"
        contentBefore={<Search24Regular />}
        placeholder="Search projects and requests"
        size="small"
      />
      <div className="header-actions">
        <Tooltip content="Help and support" relationship="label">
          <Button
            aria-label="Help and support"
            appearance="subtle"
            className="header-help"
            icon={<QuestionCircle24Regular />}
          />
        </Tooltip>
        <Tooltip content="Notifications" relationship="label">
          <Button
            aria-label="Notifications"
            appearance="subtle"
            icon={<AlertRegular />}
          />
        </Tooltip>
        <Avatar
          aria-label="Sudha S"
          color="brand"
          name="Sudha S"
          size={32}
        />
        <Button
          aria-label="New request"
          appearance="primary"
          className="header-new-request"
          icon={<Add24Regular />}
          onClick={onNewRequest}
        >
          <span>New request</span>
        </Button>
      </div>
    </header>
  )
}

export default AppHeader
