export type PageId =
  | 'dashboard'
  | 'direct-project-setup'
  | 'project-revision'
  | 'reports'

export interface NavigationItem {
  id: PageId
  label: string
}

export interface Project {
  id: string
  name: string
  category: string
  status: 'In progress' | 'In review' | 'Completed'
  updated: string
  owner: string
  ownerInitials: string
}

export const navigationItems: NavigationItem[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'direct-project-setup', label: 'Direct Project Setup' },
  { id: 'project-revision', label: 'Project Revision' },
  { id: 'reports', label: 'Reports' },
]

export const summaryMetrics = [
  {
    label: 'Active projects',
    value: '12',
    trend: '+2 this month',
    icon: 'projects',
    tone: 'blue',
  },
  {
    label: 'Awaiting review',
    value: '4',
    trend: '2 need attention',
    icon: 'review',
    tone: 'purple',
  },
  {
    label: 'Due this week',
    value: '3',
    trend: 'Across 2 teams',
    icon: 'due',
    tone: 'amber',
  },
  {
    label: 'Completed this month',
    value: '8',
    trend: '+18% vs last month',
    icon: 'completed',
    tone: 'green',
  },
] as const

export const recentProjects: Project[] = [
  {
    id: 'DPS-2026-0148',
    name: 'North Campus Expansion',
    category: 'New project setup',
    status: 'In progress',
    updated: 'Nov 20, 2026',
    owner: 'S. Patel',
    ownerInitials: 'SP',
  },
  {
    id: 'DPS-2026-0142',
    name: 'Research Lab Modernization',
    category: 'Project revision',
    status: 'In review',
    updated: 'Nov 19, 2026',
    owner: 'C. Nguyen',
    ownerInitials: 'CN',
  },
  {
    id: 'DPS-2026-0136',
    name: 'Westside Health Center',
    category: 'New project setup',
    status: 'Completed',
    updated: 'Nov 18, 2026',
    owner: 'M. Rivera',
    ownerInitials: 'MR',
  },
  {
    id: 'DPS-2026-0129',
    name: 'Digital Learning Initiative',
    category: 'Project revision',
    status: 'In progress',
    updated: 'Nov 17, 2026',
    owner: 'J. Brooks',
    ownerInitials: 'JB',
  },
]
