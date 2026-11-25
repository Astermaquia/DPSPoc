import { Card, Text } from '@fluentui/react-components'
import {
  ArrowTrendingLines24Regular,
  DocumentBulletList24Regular,
  FolderOpen24Regular,
} from '@fluentui/react-icons'
import type { PageId } from '../data/mockData'

interface PlaceholderScreenProps {
  page: Exclude<PageId, 'dashboard'>
}

const pageDetails = {
  'direct-project-setup': {
    title: 'Direct Project Setup',
    description:
      'Create and track requests to set up a new direct project. This workspace will bring request details, approvals, and project setup information together.',
    icon: <FolderOpen24Regular />,
  },
  'project-revision': {
    title: 'Project Revision',
    description:
      'Review and manage changes to existing projects, including project updates, new charging nodes, and revision approvals.',
    icon: <ArrowTrendingLines24Regular />,
  },
  reports: {
    title: 'Reports',
    description:
      'View project setup activity, request status, and approval progress. Reporting views will be added to this workspace.',
    icon: <DocumentBulletList24Regular />,
  },
}

function PlaceholderScreen({ page }: PlaceholderScreenProps) {
  const details = pageDetails[page]

  return (
    <div className="placeholder-screen">
      <Card className="placeholder-card">
        <span className="placeholder-icon" aria-hidden="true">
          {details.icon}
        </span>
        <div className="placeholder-content">
          <Text as="h1" className="placeholder-title">
            {details.title}
          </Text>
          <Text className="placeholder-copy">{details.description}</Text>
          <Text className="placeholder-note">
            This screen is a UI placeholder. Data connections and workflow
            actions are intentionally not configured yet.
          </Text>
        </div>
      </Card>
    </div>
  )
}

export default PlaceholderScreen
