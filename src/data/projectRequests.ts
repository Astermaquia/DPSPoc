import type { DirectProjectSetupWrite } from '../generated/models/DirectProjectSetupModel'
import type { DirectProjectSetupRead } from '../generated/models/DirectProjectSetupModel'
import { DirectProjectSetupService } from '../generated/services/DirectProjectSetupService'

export const requestTypes = {
  newAward: 'New Award Confirmation (CMS Only)',
  revision: 'Revision on Existing Projects',
} as const

export type ProjectRequestType =
  (typeof requestTypes)[keyof typeof requestTypes]

export type ProjectRequestAction = 'save' | 'submit'

interface CreateProjectRequestInput {
  action: ProjectRequestAction
  projectNumber?: number
  requestType: ProjectRequestType
  title: string
}

interface UpdateProjectRequestInput extends CreateProjectRequestInput {
  recordId: number
}

export async function getProjectRequest(
  recordId: number,
): Promise<DirectProjectSetupRead> {
  const result = await DirectProjectSetupService.get(String(recordId))

  if (!result.success) {
    throw result.error ?? new Error('SharePoint did not return the request.')
  }

  return result.data
}

export async function createProjectRequest({
  action,
  projectNumber,
  requestType,
  title,
}: CreateProjectRequestInput): Promise<void> {
  const isDraft = action === 'save'
  const record: Omit<DirectProjectSetupWrite, 'ID'> = {
    Title: title,
    field_2: isDraft ? 'Draft' : 'Project Setup Review',
    field_4: isDraft ? 'Draft' : 'In Progress',
    field_6: requestType,
    ...(projectNumber === undefined ? {} : { field_9: projectNumber }),
  }
  const result = await DirectProjectSetupService.create(record)

  if (!result.success) {
    throw result.error ?? new Error('SharePoint did not create the request.')
  }
}

export async function updateProjectRequest({
  action,
  projectNumber,
  recordId,
  requestType,
  title,
}: UpdateProjectRequestInput): Promise<void> {
  const record: Partial<Omit<DirectProjectSetupWrite, 'ID'>> = {
    Title: title,
    field_6: requestType,
    ...(projectNumber === undefined ? {} : { field_9: projectNumber }),
    ...(action === 'submit'
      ? { field_2: 'Project Setup Review', field_4: 'In Progress' }
      : {}),
  }
  const result = await DirectProjectSetupService.update(
    String(recordId),
    record,
  )

  if (!result.success) {
    throw result.error ?? new Error('SharePoint did not update the request.')
  }
}
