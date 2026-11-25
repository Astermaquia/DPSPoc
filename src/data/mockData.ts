export type PageId =
  | 'dashboard'
  | 'direct-project-setup'
  | 'project-revision'
  | 'reports'

export interface NavigationItem {
  id: PageId
  label: string
}

export const navigationItems: NavigationItem[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'direct-project-setup', label: 'Direct Project Setup' },
  { id: 'project-revision', label: 'Project Revision' },
  { id: 'reports', label: 'Reports' },
]
