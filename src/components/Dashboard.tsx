import { useEffect, useState } from 'react'
import { Button, Text } from '@fluentui/react-components'
import { Add24Regular } from '@fluentui/react-icons'
import { loadDashboardData, type DashboardData } from '../data/dashboardData'
import { type PageId } from '../data/mockData'
import RecentProjects from './RecentProjects'
import SummaryCard from './SummaryCard'

interface DashboardProps {
  onNavigate: (page: PageId) => void
  onNewRequest: () => void
}

function Dashboard({ onNavigate, onNewRequest }: DashboardProps) {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    let isCurrent = true

    loadDashboardData()
      .then((data) => {
        if (isCurrent) {
          setDashboardData(data)
        }
      })
      .catch((cause: unknown) => {
        if (isCurrent) {
          setError(
            cause instanceof Error && cause.message
              ? cause.message
              : 'Unable to load project data from SharePoint.',
          )
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false)
        }
      })

    return () => {
      isCurrent = false
    }
  }, [retryCount])

  const retryLoading = () => {
    setDashboardData(null)
    setError(null)
    setIsLoading(true)
    setRetryCount((count) => count + 1)
  }

  const metrics = dashboardData?.summaryMetrics ?? [
    {
      label: 'Active projects',
      value: '—',
      trend: isLoading ? 'Loading from SharePoint...' : 'Data unavailable',
      icon: 'projects',
      tone: 'blue',
    },
    {
      label: 'Awaiting review',
      value: '—',
      trend: isLoading ? 'Loading from SharePoint...' : 'Data unavailable',
      icon: 'review',
      tone: 'purple',
    },
    {
      label: 'Due this week',
      value: '—',
      trend: 'No due-date field on this list',
      icon: 'due',
      tone: 'amber',
    },
    {
      label: 'Completed this month',
      value: '—',
      trend: isLoading ? 'Loading from SharePoint...' : 'Data unavailable',
      icon: 'completed',
      tone: 'green',
    },
  ] as const
  const currentDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date())

  return (
    <div className="dashboard-content">
      <section className="page-heading">
        <div>
          <Text className="eyebrow">{currentDate}</Text>
          <h1 className="page-title">Welcome back, Sudha S</h1>
          <Text className="page-description">
            Here’s what’s happening with your project setup and revision
            requests.
          </Text>
        </div>
        <Button
          appearance="primary"
          className="heading-action"
          icon={<Add24Regular />}
          onClick={onNewRequest}
        >
          Start a request
        </Button>
      </section>

      {error && (
        <div className="dashboard-data-error" role="alert">
          <span>{error}</span>
          <Button
            appearance="secondary"
            onClick={retryLoading}
            size="small"
          >
            Retry
          </Button>
        </div>
      )}

      <section
        aria-busy={isLoading}
        aria-label="Project summary"
        className="summary-grid"
      >
        {metrics.map((metric) => (
          <SummaryCard key={metric.label} metric={metric} />
        ))}
      </section>

      <RecentProjects
        error={error}
        isLoading={isLoading}
        onViewAll={() => onNavigate('direct-project-setup')}
        projects={dashboardData?.projects ?? []}
      />
    </div>
  )
}

export default Dashboard
