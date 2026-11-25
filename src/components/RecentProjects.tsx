import { useState } from 'react'
import {
  Avatar,
  Button,
  Card,
  Input,
  Text,
} from '@fluentui/react-components'
import { ArrowRight24Regular, Search24Regular } from '@fluentui/react-icons'
import type { Project } from '../data/dashboardData'
import ProjectStatusBadge from './ProjectStatusBadge'

interface RecentProjectsProps {
  projects: Project[]
  isLoading: boolean
  error: string | null
  onViewAll: () => void
}

function RecentProjects({
  projects,
  isLoading,
  error,
  onViewAll,
}: RecentProjectsProps) {
  const [searchText, setSearchText] = useState('')
  const matchingProjects = projects.filter((project) =>
    `${project.name} ${project.id} ${project.category}`
      .toLowerCase()
      .includes(searchText.toLowerCase()),
  )
  const visibleProjects = matchingProjects.slice(0, 5)

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
        <table aria-busy={isLoading} className="projects-table">
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
            {visibleProjects.map((project) => (
              <tr key={project.key}>
                <td>
                  <div className="project-metadata">
                    <Text className="project-name">{project.name}</Text>
                    <Text className="project-id">{project.id}</Text>
                  </div>
                </td>
                <td>{project.category}</td>
                <td>
                  <ProjectStatusBadge status={project.status} />
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
            {isLoading && (
              <tr>
                <td colSpan={5}>Loading project requests from SharePoint...</td>
              </tr>
            )}
            {!isLoading && error && (
              <tr>
                <td colSpan={5}>Project requests are unavailable.</td>
              </tr>
            )}
            {!isLoading && !error && visibleProjects.length === 0 && (
              <tr>
                <td colSpan={5}>
                  {searchText
                    ? 'No projects match your search.'
                    : 'No project requests found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="panel-heading">
        <Text className="panel-subtitle">
          Showing {visibleProjects.length} of {matchingProjects.length} matching
          projects
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
