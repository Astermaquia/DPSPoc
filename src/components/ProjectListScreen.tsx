import { useEffect, useState } from 'react'
import {
  Avatar,
  Button,
  Card,
  Input,
  Select,
  Text,
} from '@fluentui/react-components'
import { Add24Regular, Search24Regular } from '@fluentui/react-icons'
import { loadProjects, type Project } from '../data/dashboardData'
import ProjectStatusBadge from './ProjectStatusBadge'

interface ProjectListScreenProps {
  onNewRequest: () => void
  onEditRequest: (recordId: number) => void
}

const pageSizes = [20, 50, 100] as const

function ProjectListScreen({
  onNewRequest,
  onEditRequest,
}: ProjectListScreenProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [searchText, setSearchText] = useState('')
  const [pageSize, setPageSize] = useState<number>(pageSizes[0])
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    let isCurrent = true

    loadProjects()
      .then((data) => {
        if (isCurrent) {
          setProjects(data)
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

  const normalizedSearch = searchText.trim().toLowerCase()
  const matchingProjects = projects.filter((project) =>
    [
      project.name,
      project.id,
      project.projectNumber,
      project.category,
      project.workflowStep,
      project.status,
      project.updated,
      project.owner,
    ]
      .join(' ')
      .toLowerCase()
      .includes(normalizedSearch),
  )
  const pageCount = Math.ceil(matchingProjects.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const visibleProjects = matchingProjects.slice(
    startIndex,
    startIndex + pageSize,
  )
  const firstRecord = matchingProjects.length === 0 ? 0 : startIndex + 1
  const lastRecord = startIndex + visibleProjects.length

  const retryLoading = () => {
    setProjects([])
    setError(null)
    setIsLoading(true)
    setRetryCount((count) => count + 1)
  }

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
          <h1 className="page-title">Direct Project Setup</h1>
          <Text className="page-description">
            Browse and track all project setup requests.
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

      <Card className="dashboard-panel project-list-panel">
        <div className="panel-heading project-list-toolbar">
          <div className="panel-intro">
            <Text as="h2" className="panel-title">
              All projects
            </Text>
            <Text as="span" className="panel-subtitle">
              {isLoading
                ? 'Loading project requests...'
                : `${matchingProjects.length} project requests`}
            </Text>
          </div>
          <div className="project-list-controls">
            <Input
              aria-label="Search all projects"
              className="project-list-search"
              contentBefore={<Search24Regular />}
              onChange={(_, data) => {
                setSearchText(data.value)
                setCurrentPage(1)
              }}
              placeholder="Search projects"
              size="small"
              value={searchText}
            />
            <label className="project-page-size">
              <span>Rows per page</span>
              <Select
                aria-label="Rows per page"
                onChange={(event) => {
                  setPageSize(Number(event.target.value))
                  setCurrentPage(1)
                }}
                size="small"
                value={String(pageSize)}
              >
                {pageSizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </Select>
            </label>
          </div>
        </div>

        <div className="projects-table-wrap">
          <table
            aria-busy={isLoading}
            className="projects-table project-list-table"
          >
            <thead>
              <tr>
                <th scope="col">Project / request</th>
                <th scope="col">Project number</th>
                <th scope="col">Request type</th>
                <th scope="col">Current step</th>
                <th scope="col">Status</th>
                <th scope="col">Last updated</th>
                <th scope="col">Owner</th>
              </tr>
            </thead>
            <tbody>
              {visibleProjects.map((project) => (
                <tr
                  className={
                    project.recordId === null ? undefined : 'project-table-row-open'
                  }
                  key={project.key}
                  onClick={() => {
                    if (project.recordId !== null) {
                      onEditRequest(project.recordId)
                    }
                  }}
                >
                  <td>
                    <Button
                      aria-label={`Edit request ${project.id}`}
                      appearance="subtle"
                      className="project-record-button"
                      disabled={project.recordId === null}
                      onClick={(event) => {
                        event.stopPropagation()
                        if (project.recordId !== null) {
                          onEditRequest(project.recordId)
                        }
                      }}
                    >
                      <div className="project-metadata">
                        <Text className="project-name">{project.name}</Text>
                        <Text className="project-id">{project.id}</Text>
                      </div>
                    </Button>
                  </td>
                  <td>{project.projectNumber}</td>
                  <td>{project.category}</td>
                  <td>{project.workflowStep}</td>
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
                  <td colSpan={7}>
                    Loading project requests from SharePoint...
                  </td>
                </tr>
              )}
              {!isLoading && error && (
                <tr>
                  <td colSpan={7}>Project requests are unavailable.</td>
                </tr>
              )}
              {!isLoading && !error && visibleProjects.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    {searchText
                      ? 'No projects match your search.'
                      : 'No project requests found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="project-list-pagination">
          <Text aria-live="polite" className="project-pagination-status">
            Showing {firstRecord}–{lastRecord} of {matchingProjects.length}{' '}
            projects
          </Text>
          <div className="project-pagination-controls">
            <Text className="project-pagination-status">
              {pageCount === 0
                ? 'Page 0 of 0'
                : `Page ${currentPage} of ${pageCount}`}
            </Text>
            <Button
              appearance="secondary"
              disabled={currentPage <= 1 || isLoading}
              onClick={() => setCurrentPage((page) => page - 1)}
              size="small"
            >
              Previous
            </Button>
            <Button
              appearance="secondary"
              disabled={pageCount === 0 || currentPage >= pageCount || isLoading}
              onClick={() => setCurrentPage((page) => page + 1)}
              size="small"
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default ProjectListScreen
