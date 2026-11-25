import { Card, Text } from '@fluentui/react-components'
import {
  CalendarLtr24Regular,
  CheckmarkCircle24Regular,
  ClipboardTask24Regular,
  Clock24Regular,
} from '@fluentui/react-icons'
import type { SummaryMetric } from '../data/dashboardData'

const metricIcons = {
  projects: <ClipboardTask24Regular />,
  review: <Clock24Regular />,
  due: <CalendarLtr24Regular />,
  completed: <CheckmarkCircle24Regular />,
}

interface SummaryCardProps {
  metric: SummaryMetric
}

function SummaryCard({ metric }: SummaryCardProps) {
  return (
    <Card className="summary-card">
      <div className="summary-card-top">
        <span className={`summary-icon ${metric.tone}`} aria-hidden="true">
          {metricIcons[metric.icon]}
        </span>
        <Text className="summary-trend" size={200}>
          {metric.trend}
        </Text>
      </div>
      <Text className="summary-value" as="span">
        {metric.value}
      </Text>
      <Text className="summary-label" as="span">
        {metric.label}
      </Text>
    </Card>
  )
}

export default SummaryCard
