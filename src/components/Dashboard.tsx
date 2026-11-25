import { Button, Text } from '@fluentui/react-components'
import { Add24Regular } from '@fluentui/react-icons'
import { summaryMetrics, type PageId } from '../data/mockData'
import RecentProjects from './RecentProjects'
import SummaryCard from './SummaryCard'

interface DashboardProps {
  onNavigate: (page: PageId) => void
  onNewRequest: () => void
}

function Dashboard({ onNavigate, onNewRequest }: DashboardProps) {
  return (
    <div className="dashboard-content">
      <section className="page-heading">
        <div>
          <Text className="eyebrow">Monday, November 23, 2026</Text>
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

      <section aria-label="Project summary" className="summary-grid">
        {summaryMetrics.map((metric) => (
          <SummaryCard key={metric.label} metric={metric} />
        ))}
      </section>

      <RecentProjects onViewAll={() => onNavigate('direct-project-setup')} />
    </div>
  )
}

export default Dashboard
