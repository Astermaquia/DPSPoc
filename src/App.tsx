import { lazy, Suspense, useState } from 'react'
import { FluentProvider, webLightTheme } from '@fluentui/react-components'
import AppHeader from './components/AppHeader'
import AppSidebar from './components/AppSidebar'
import Dashboard from './components/Dashboard'
import ProjectListScreen from './components/ProjectListScreen'
import PlaceholderScreen from './components/PlaceholderScreen'
import type { PageId } from './data/mockData'
import './App.css'

const NewRequestScreen = lazy(
  () => import('./components/NewRequestScreen'),
)

function App() {
  const [activePage, setActivePage] = useState<PageId>('dashboard')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileNavigationOpen, setIsMobileNavigationOpen] = useState(false)
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false)
  const [editingRecordId, setEditingRecordId] = useState<number | null>(null)

  const navigateTo = (page: PageId) => {
    setActivePage(page)
    setIsMobileNavigationOpen(false)
  }

  const openNewRequest = () => {
    setEditingRecordId(null)
    setIsNewRequestOpen(true)
  }

  const openEditRequest = (recordId: number) => {
    setEditingRecordId(recordId)
    setIsNewRequestOpen(true)
  }

  const closeRequest = () => {
    setIsNewRequestOpen(false)
    setEditingRecordId(null)
  }

  return (
    <FluentProvider theme={webLightTheme}>
      {isNewRequestOpen ? (
        <Suspense
          fallback={
            <div className="request-form-loading">Loading request form...</div>
          }
        >
          <NewRequestScreen
            onClose={closeRequest}
            recordId={editingRecordId}
          />
        </Suspense>
      ) : (
        <div className="app-shell">
          <AppHeader
            onMenuClick={() => {
              if (window.matchMedia('(max-width: 760px)').matches) {
                setIsMobileNavigationOpen((isOpen) => !isOpen)
              } else {
                setIsSidebarCollapsed((isCollapsed) => !isCollapsed)
              }
            }}
            onNewRequest={openNewRequest}
          />
          <div className="app-body">
            <AppSidebar
              activePage={activePage}
              collapsed={isSidebarCollapsed}
              mobileOpen={isMobileNavigationOpen}
              onNavigate={navigateTo}
            />
            <main className="main-content">
              {activePage === 'dashboard' ? (
                <Dashboard
                  onNavigate={navigateTo}
                  onNewRequest={openNewRequest}
                />
              ) : activePage === 'direct-project-setup' ? (
                <ProjectListScreen
                  onEditRequest={openEditRequest}
                  onNewRequest={openNewRequest}
                />
              ) : (
                <PlaceholderScreen page={activePage} />
              )}
            </main>
          </div>
          {isMobileNavigationOpen && (
            <button
              aria-label="Close navigation menu"
              className="navigation-backdrop"
              onClick={() => setIsMobileNavigationOpen(false)}
              type="button"
            />
          )}
        </div>
      )}
    </FluentProvider>
  )
}

export default App
