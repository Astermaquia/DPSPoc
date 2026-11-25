import type { DirectProjectSetupRead } from '../generated/models/DirectProjectSetupModel'
import { DirectProjectSetupService } from '../generated/services/DirectProjectSetupService'

export interface Project {
  key: string
  recordId: number | null
  id: string
  name: string
  category: string
  projectNumber: string
  workflowStep: string
  status: string
  updated: string
  owner: string
  ownerInitials: string
}

export interface SummaryMetric {
  label: string
  value: string
  trend: string
  icon: 'projects' | 'review' | 'due' | 'completed'
  tone: 'blue' | 'purple' | 'amber' | 'green'
}

export interface DashboardData {
  projects: Project[]
  summaryMetrics: SummaryMetric[]
}

const maximumRecords = 5000

async function getAllProjectRecords(): Promise<DirectProjectSetupRead[]> {
  const records: DirectProjectSetupRead[] = []
  const seenTokens = new Set<string>()
  let skipToken: string | undefined

  do {
    const result = await DirectProjectSetupService.getAll({
      orderBy: ['Modified desc'],
      skipToken,
      top: maximumRecords,
    })

    if (!result.success) {
      throw result.error ?? new Error('SharePoint did not return project data.')
    }

    records.push(...result.data)
    skipToken = result.skipToken

    if (skipToken) {
      if (seenTokens.has(skipToken)) {
        throw new Error('SharePoint returned a repeated page token.')
      }

      seenTokens.add(skipToken)
    }
  } while (skipToken)

  return records
}

function parseDate(value?: string): Date | undefined {
  if (!value) {
    return undefined
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date
}

function formatDate(value?: string): string {
  const date = parseDate(value)

  if (!date) {
    return 'Not available'
  }

  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function mapProject(record: DirectProjectSetupRead): Project {
  const owner = record.Author?.DisplayName?.trim() || 'Unassigned'

  return {
    key: String(record.ID ?? record.field_1 ?? record.Title ?? 'unknown'),
    recordId: record.ID ?? null,
    id: record.field_1?.trim() || 'Request number unavailable',
    name: record.Title?.trim() || 'Untitled request',
    category: record.field_6?.trim() || 'Not specified',
    projectNumber: record.field_9 == null ? '—' : String(record.field_9),
    workflowStep: record.field_2?.trim() || '—',
    status: record.field_4?.trim() || 'Unknown',
    updated: formatDate(record.Modified),
    owner,
    ownerInitials: getInitials(owner),
  }
}

function mapSortedProjects(records: DirectProjectSetupRead[]): Project[] {
  return [...records]
    .sort(
      (left, right) =>
        (parseDate(right.Modified)?.getTime() ?? 0) -
        (parseDate(left.Modified)?.getTime() ?? 0),
    )
    .map(mapProject)
}

export async function loadProjects(): Promise<Project[]> {
  return mapSortedProjects(await getAllProjectRecords())
}

function getCurrentMonthCount(
  records: DirectProjectSetupRead[],
  now: Date,
): number {
  return records.filter((record) => {
    if (record.field_4?.trim().toLowerCase() !== 'completed') {
      return false
    }

    const modified = parseDate(record.Modified)
    return (
      modified?.getFullYear() === now.getFullYear() &&
      modified.getMonth() === now.getMonth()
    )
  }).length
}

function createSummaryMetrics(
  records: DirectProjectSetupRead[],
  now: Date,
): SummaryMetric[] {
  const activeStatuses = new Set(['in progress', 'sent back', 'reassigned'])
  const activeCount = records.filter((record) =>
    activeStatuses.has(record.field_4?.trim().toLowerCase() ?? ''),
  ).length
  const awaitingReviewCount = records.filter(
    (record) =>
      record.field_4?.trim().toLowerCase() === 'in progress' &&
      /review|approval/i.test(record.field_2 ?? ''),
  ).length

  return [
    {
      label: 'Active projects',
      value: String(activeCount),
      trend: 'In progress, sent back, or reassigned',
      icon: 'projects',
      tone: 'blue',
    },
    {
      label: 'Awaiting review',
      value: String(awaitingReviewCount),
      trend: 'At a review or approval step',
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
      value: String(getCurrentMonthCount(records, now)),
      trend: 'Based on last modified date',
      icon: 'completed',
      tone: 'green',
    },
  ]
}

export async function loadDashboardData(
  now = new Date(),
): Promise<DashboardData> {
  const records = await getAllProjectRecords()

  return {
    projects: mapSortedProjects(records),
    summaryMetrics: createSummaryMetrics(records, now),
  }
}
