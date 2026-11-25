import { useState } from 'react'
import {
  Avatar,
  Badge,
  Button,
  Card,
  Input,
  Text,
} from '@fluentui/react-components'
import { ArrowRight24Regular, Search24Regular } from '@fluentui/react-icons'
import { recentProjects } from '../data/mockData'

interface RecentProjectsProps {
  onViewAll: () => void
}

const statusColor = {
  'In progress': 'informative',
  'In review': 'warning',
  Completed: 'success',
} as const

function RecentProjects({ onViewAll }: RecentProjectsProps) {
  const [searchText, setSearchText] = useState('')
  const filteredProjects = recentProjects.filter((project) =>
    `${project.name} ${project.id} ${project.category}`
      .toLowerCase()
      .includes(searchText.toLowerCase()),
  )

  return (
    <Card className="dashboard-panel">
      <div className="panel-heading">
        <div className="panel-intro">
          <Text as="h2" className="panel-title">
            Recent projects
          </Text>
          <Text as="span" className="panel-subtitle">
            The latest activity across your project requests
          </Text>
        </div>
        <Input
          aria-label="Search recent projects"
          className="project-search"
          contentBefore={<Search24Regular />}
          onChange={(_, data) => setSearchText(data.value)}
          placeholder="Search projects"
          size="small"
          value={searchText}
        />
      </div>
      <div className="projects-table-wrap">
        <table className="projects-table">
          <thead>
            <tr>
              <th scope="col">Project</th>
              <th scope="col">Request type</th>
              <th scope="col">Status</th>
              <th scope="col">Last updated</th>
              <th scope="col">Owner</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.map((project) => (
              <tr key={project.id}>
                <td>
                  <div className="project-metadata">
                    <Text className="project-name">{project.name}</Text>
                    <Text className="project-id">{project.id}</Text>
                  </div>
                </td>
                <td>{project.category}</td>
                <td>
                  <Badge
                    appearance="tint"
                    color={statusColor[project.status]}
                    className="project-status"
                    size="small"
                  >
                    {project.status}
                  </Badge>
                </td>
                <td>{project.updated}</td>
                <td>
                  <span className="project-owner">
                    <Avatar
                      aria-label={project.owner}
                      color="colorful"
                      initials={project.ownerInitials}
                      size={28}
                    />
                    {project.owner}
                  </span>
                </td>
              </tr>
            ))}
            {filteredProjects.length === 0 && (
              <tr>
                <td colSpan={5}>No projects match your search.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="panel-heading">
        <Text className="panel-subtitle">
          Showing {filteredProjects.length} of {recentProjects.length} projects
        </Text>
        <Button
          appearance="subtle"
          icon={<ArrowRight24Regular />}
          iconPosition="after"
          onClick={onViewAll}
          size="small"
        >
          View all projects
        </Button>
      </div>
    </Card>
  )
}

export default RecentProjects
