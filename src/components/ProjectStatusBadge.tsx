import { Badge } from '@fluentui/react-components'

interface ProjectStatusBadgeProps {
  status: string
}

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'success'
    case 'rejected':
      return 'danger'
    case 'sent back':
      return 'warning'
    case 'in progress':
    case 'reassigned':
      return 'informative'
    default:
      return 'subtle'
  }
}

function ProjectStatusBadge({ status }: ProjectStatusBadgeProps) {
  return (
    <Badge
      appearance="tint"
      className="project-status"
      color={getStatusColor(status)}
      size="small"
    >
      {status}
    </Badge>
  )
}

export default ProjectStatusBadge
