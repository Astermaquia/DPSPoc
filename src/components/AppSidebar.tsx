import { Button, Tooltip } from '@fluentui/react-components'
import {
  ArrowTrendingLines24Regular,
  FolderOpen24Regular,
  Home24Regular,
  PersonBoard24Regular,
  QuestionCircle24Regular,
} from '@fluentui/react-icons'
import { navigationItems, type PageId } from '../data/mockData'

interface AppSidebarProps {
  activePage: PageId
  collapsed: boolean
  mobileOpen: boolean
  onNavigate: (page: PageId) => void
}

const navigationIcons = {
  dashboard: <Home24Regular />,
  'direct-project-setup': <FolderOpen24Regular />,
  'project-revision': <ArrowTrendingLines24Regular />,
  reports: <PersonBoard24Regular />,
}

function AppSidebar({
  activePage,
  collapsed,
  mobileOpen,
  onNavigate,
}: AppSidebarProps) {
  const sidebarClassName = [
    'app-sidebar',
    collapsed ? 'is-collapsed' : '',
    mobileOpen ? 'is-mobile-open' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <aside className={sidebarClassName}>
      <div className="sidebar-section-label">
        {collapsed ? 'Menu' : 'Workspace'}
      </div>
      <nav aria-label="Main navigation" className="sidebar-navigation">
        {navigationItems.map((item) => {
          const button = (
            <Button
              aria-current={activePage === item.id ? 'page' : undefined}
              appearance="subtle"
              className={`nav-item${activePage === item.id ? ' is-active' : ''}`}
              icon={navigationIcons[item.id]}
              key={item.id}
              onClick={() => onNavigate(item.id)}
            >
              {!collapsed && <span className="nav-item-label">{item.label}</span>}
            </Button>
          )

          return collapsed ? (
            <Tooltip content={item.label} key={item.id} relationship="label">
              {button}
            </Tooltip>
          ) : (
            button
          )
        })}
      </nav>
      <div className="sidebar-spacer" />
      <div className="sidebar-help">
        {collapsed ? (
          <Tooltip content="Help center" relationship="label">
            <Button
              aria-label="Help center"
              appearance="subtle"
              className="nav-item"
              icon={<QuestionCircle24Regular />}
            />
          </Tooltip>
        ) : (
          <Button
            appearance="subtle"
            className="nav-item"
            icon={<QuestionCircle24Regular />}
          >
            <span className="nav-item-label">Help center</span>
          </Button>
        )}
      </div>
    </aside>
  )
}

export default AppSidebar
