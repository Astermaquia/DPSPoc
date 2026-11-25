import { lazy, Suspense, useState } from 'react'
import { FluentProvider, webLightTheme } from '@fluentui/react-components'
import AppHeader from './components/AppHeader'
import AppSidebar from './components/AppSidebar'
import Dashboard from './components/Dashboard'
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

  const navigateTo = (page: PageId) => {
    setActivePage(page)
    setIsMobileNavigationOpen(false)
  }

  return (
    <FluentProvider theme={webLightTheme}>
      {isNewRequestOpen ? (
        <Suspense
          fallback={
            <div className="request-form-loading">Loading request form...</div>
          }
        >
          <NewRequestScreen onClose={() => setIsNewRequestOpen(false)} />
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
            onNewRequest={() => setIsNewRequestOpen(true)}
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
                  onNewRequest={() => setIsNewRequestOpen(true)}
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
