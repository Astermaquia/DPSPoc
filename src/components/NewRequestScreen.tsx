import { useEffect, useRef, useState } from 'react'
import {
  Button,
  Checkbox,
  Input,
  Select,
} from '@fluentui/react-components'
import {
  Add24Regular,
  ArrowDownloadRegular,
  ArrowSortRegular,
  CommentRegular,
  DismissRegular,
  FullScreenMaximizeRegular,
  GridDotsRegular,
  ImageRegular,
  PrintRegular,
  Search24Regular,
} from '@fluentui/react-icons'
import {
  createProjectRequest,
  getProjectRequest,
  requestTypes,
  type ProjectRequestAction,
  type ProjectRequestType,
  updateProjectRequest,
} from '../data/projectRequests'
import './NewRequestScreen.css'

interface NewRequestScreenProps {
  onClose: () => void
  recordId: number | null
}

interface FormFieldProps {
  id: string
  label: string
  required?: boolean
  helper?: string
  children: React.ReactNode
}

interface RevisionRow {
  id: number
  costpointId: string
  projectName: string
  needsGfas: string
  gfasNumber: string
  subaward: string
  owningOrg: string
}

const approvalPeople = [
  'Alex Morgan',
  'Casey Nguyen',
  'Jordan Brooks',
  'Sam Patel',
]

function formatSystemDate(value?: string): string {
  const date = value ? new Date(value) : new Date()

  if (Number.isNaN(date.getTime())) {
    return 'Not available'
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

function FormField({
  id,
  label,
  required = false,
  helper,
  children,
}: FormFieldProps) {
  return (
    <div className="request-field">
      <label className="request-field-label" htmlFor={id}>
        {label}
        {required && <span className="required-mark"> *</span>}
      </label>
      {children}
      {helper && <div className="request-field-helper">{helper}</div>}
    </div>
  )
}

function createRevisionRow(id: number): RevisionRow {
  return {
    id,
    costpointId: '',
    projectName: '',
    needsGfas: '',
    gfasNumber: '',
    subaward: '',
    owningOrg: '',
  }
}

function NewRequestScreen({ onClose, recordId }: NewRequestScreenProps) {
  const nextRowId = useRef(1)
  const [projectType, setProjectType] = useState<ProjectRequestType>(
    requestTypes.revision,
  )
  const [revisionType, setRevisionType] = useState(
    'Existing Direct Project - New Charging Node',
  )
  const [requestNumber, setRequestNumber] = useState('')
  const [systemDate, setSystemDate] = useState(() => formatSystemDate())
  const [projectLookup, setProjectLookup] = useState('')
  const [primaryNode, setPrimaryNode] = useState('')
  const [rows, setRows] = useState<RevisionRow[]>([])
  const [selectedRowIds, setSelectedRowIds] = useState<number[]>([])
  const [rowsToAdd, setRowsToAdd] = useState('1')
  const [tableSearchOpen, setTableSearchOpen] = useState(false)
  const [tableSearch, setTableSearch] = useState('')
  const [tableExpanded, setTableExpanded] = useState(false)
  const [feedback, setFeedback] = useState(
    recordId === null ? '' : 'Loading request from SharePoint...',
  )
  const [feedbackTone, setFeedbackTone] = useState<
    'info' | 'success' | 'error'
  >('info')
  const [pendingAction, setPendingAction] =
    useState<ProjectRequestAction | null>(null)
  const [hasSaved, setHasSaved] = useState(false)
  const [isLoadingRecord, setIsLoadingRecord] = useState(recordId !== null)
  const [recordLoadError, setRecordLoadError] = useState(false)

  const visibleRows = rows.filter((row) =>
    `${row.costpointId} ${row.projectName}`
      .toLowerCase()
      .includes(tableSearch.toLowerCase()),
  )
  const allRowsSelected =
    rows.length > 0 && selectedRowIds.length === rows.length

  const showFeedback = (
    message: string,
    tone: 'info' | 'success' | 'error' = 'info',
  ) => {
    setFeedback(message)
    setFeedbackTone(tone)
  }

  useEffect(() => {
    if (recordId === null) {
      return
    }

    let isCurrent = true

    getProjectRequest(recordId)
      .then((record) => {
        if (!isCurrent) {
          return
        }

        setRequestNumber(record.field_1?.trim() || 'Pending assignment')
        setSystemDate(formatSystemDate(record.Created))
        if (
          record.field_6 === requestTypes.newAward ||
          record.field_6 === requestTypes.revision
        ) {
          setProjectType(record.field_6)
        }
        setProjectLookup(
          record.Title?.trim() ||
            (record.field_9 == null ? '' : String(record.field_9)),
        )
        setFeedback('')
      })
      .catch((cause: unknown) => {
        if (!isCurrent) {
          return
        }

        const errorMessage =
          cause instanceof Error && cause.message
            ? cause.message
            : 'Unable to load the request from SharePoint.'
        setRecordLoadError(true)
        showFeedback(`Could not open this request: ${errorMessage}`, 'error')
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoadingRecord(false)
        }
      })

    return () => {
      isCurrent = false
    }
  }, [recordId])

  const addRows = () => {
    const count = Number(rowsToAdd)
    if (!Number.isInteger(count) || count < 1 || count > 50) {
      showFeedback('Enter a row count between 1 and 50.', 'error')
      return
    }

    const newRows = Array.from({ length: count }, () =>
      createRevisionRow(nextRowId.current++),
    )
    setRows((currentRows) => [...currentRows, ...newRows])
    showFeedback('')
  }

  const updateRow = (
    id: number,
    field: keyof Omit<RevisionRow, 'id'>,
    value: string,
  ) => {
    setRows((currentRows) =>
      currentRows.map((row) =>
        row.id === id ? { ...row, [field]: value } : row,
      ),
    )
  }

  const toggleRowSelection = (id: number, selected: boolean) => {
    setSelectedRowIds((currentIds) =>
      selected
        ? [...currentIds, id]
        : currentIds.filter((currentId) => currentId !== id),
    )
  }

  const handleSelectAll = (selected: boolean) => {
    setSelectedRowIds(selected ? rows.map((row) => row.id) : [])
  }

  const persistRequest = async (action: ProjectRequestAction) => {
    if (
      pendingAction ||
      (recordId === null && hasSaved) ||
      (recordId !== null && (isLoadingRecord || recordLoadError))
    ) {
      return
    }

    const title = projectLookup.trim()
    if (!title) {
      showFeedback('Project Lookup is required before saving.', 'error')
      return
    }

    const parsedProjectNumber = Number(title)
    setPendingAction(action)
    showFeedback(
      action === 'save'
        ? 'Saving draft to SharePoint...'
        : 'Submitting request to SharePoint...',
    )

    try {
      const requestFields = {
        action,
        projectNumber: Number.isFinite(parsedProjectNumber)
          ? parsedProjectNumber
          : undefined,
        requestType: projectType,
        title,
      }

      if (recordId === null) {
        await createProjectRequest(requestFields)
        setHasSaved(true)
        showFeedback(
          action === 'save'
            ? 'Draft saved to SharePoint. A request number will be assigned automatically.'
            : 'Request submitted to SharePoint. A request number will be assigned automatically.',
          'success',
        )
      } else {
        await updateProjectRequest({ ...requestFields, recordId })
        showFeedback(
          action === 'save'
            ? 'Changes saved. The current workflow status was preserved.'
            : 'Changes saved and submitted for Project Setup Review.',
          'success',
        )
      }
    } catch (cause: unknown) {
      const errorMessage =
        cause instanceof Error && cause.message
          ? cause.message
          : 'An unexpected SharePoint error occurred.'
      showFeedback(
        `Could not ${action === 'save' ? 'save' : 'submit'} the request: ${errorMessage}`,
        'error',
      )
    } finally {
      setPendingAction(null)
    }
  }

  return (
    <div className="request-form-shell">
      <header className="request-form-topbar">
        <div className="request-form-title">
          {recordId === null ? 'New Request' : 'Edit Request'}
        </div>
        <div className="request-form-topbar-actions">
          <Button
            aria-label="Print request"
            appearance="subtle"
            icon={<PrintRegular />}
            onClick={() => window.print()}
          />
          <Button
            aria-label={recordId === null ? 'Close new request' : 'Close edit request'}
            appearance="subtle"
            disabled={pendingAction !== null}
            icon={<DismissRegular />}
            onClick={onClose}
          />
        </div>
      </header>

      <div className="request-form-workspace">
        <main className="request-form-scroll">
          <section className="request-section general-information">
            <h1 className="request-section-title">General Information</h1>
            <div className="request-introduction">
              <p>
                For New Award requests select New Award Confirmation (CMS Only)
                under New/Existing Project. For new nodes, updates to nodes,
                closing nodes, project personnel updates, or adding a GFAS
                Project # to an existing node, select Revision on existing
                projects.
              </p>
              <p>
                In this site, you can find detailed articles explaining the
                Direct Project Setup process under the DPA menu.
              </p>
              <p>
                For technical assistance please submit a{' '}
                <button
                  className="request-inline-link"
                  onClick={() =>
                    showFeedback('Technical support links are not connected.')
                  }
                  type="button"
                >
                  JSM Ticket
                </button>
                .
              </p>
            </div>

            <div className="request-field-grid">
              <FormField
                helper="This number will be auto generated once the request is submitted"
                id="request-number"
                label="Project Setup Request Number"
              >
                <Input
                  id="request-number"
                  readOnly
                  size="large"
                  value={requestNumber}
                />
              </FormField>
              <FormField
                helper="Date the request was made"
                id="system-date"
                label="System Date"
              >
                <Input
                  id="system-date"
                  readOnly
                  size="large"
                  value={systemDate}
                />
              </FormField>
            </div>

            <FormField
              helper="Select the type of request"
              id="project-type"
              label="New/Existing Project"
              required
            >
              <Select
                id="project-type"
                onChange={(event) => {
                  const value = event.target.value
                  if (
                    value === requestTypes.newAward ||
                    value === requestTypes.revision
                  ) {
                    setProjectType(value)
                  }
                }}
                size="large"
                value={projectType}
              >
                <option value={requestTypes.newAward}>
                  New Award Confirmation (CMS Only)
                </option>
                <option value={requestTypes.revision}>
                  Revision on existing projects
                </option>
              </Select>
            </FormField>

            {projectType === requestTypes.revision && (
              <FormField
                id="revision-type"
                label="Revision Type on Existing Project"
                required
              >
                <Select
                  id="revision-type"
                  onChange={(event) => setRevisionType(event.target.value)}
                  size="large"
                  value={revisionType}
                >
                  <option value="Existing Direct Project - New Charging Node">
                    Existing Direct Project - New Charging Node
                  </option>
                  <option value="Update Existing Node">
                    Update Existing Node
                  </option>
                  <option value="Close Existing Node">
                    Close Existing Node
                  </option>
                  <option value="Project Personnel Update">
                    Project Personnel Update
                  </option>
                  <option value="Add GFAS Project Number">
                    Add GFAS Project Number
                  </option>
                </Select>
              </FormField>
            )}
          </section>

          <section className="request-section approval-section">
            <FormField id="warning-message" label="Warning Message">
              <div className="warning-message">
                If additional funds are provided with this modification, this
                increase needs to be entered in forecast budget in TM1
              </div>
            </FormField>
            <div className="request-field-grid approval-grid">
              <FormField
                helper="This person will be notified on the revisions"
                id="project-manager"
                label="Project Manager Approval"
                required
              >
                <Select id="project-manager" size="large" defaultValue="">
                  <option value="" disabled>
                    Select a person
                  </option>
                  {approvalPeople.map((person) => (
                    <option key={person} value={person}>
                      {person}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField
                helper="This personnel will be notified on revisions"
                id="business-unit-manager"
                label="Business Unit Manager"
                required
              >
                <Select
                  id="business-unit-manager"
                  size="large"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select a person
                  </option>
                  {approvalPeople.map((person) => (
                    <option key={person} value={person}>
                      {person}
                    </option>
                  ))}
                </Select>
              </FormField>
            </div>
          </section>

          <section className="request-section project-details-section">
            <div className="request-section-heading">
              <h2 className="request-section-title">Project Details</h2>
              <p className="request-section-subtitle">
                Select the associated project the request relates to
              </p>
            </div>
            <FormField
              helper="This is a lookup into the Costpoint data"
              id="project-lookup"
              label="Project Lookup"
              required
            >
              <Input
                contentAfter={<Search24Regular />}
                id="project-lookup"
                maxLength={255}
                onChange={(_, data) => setProjectLookup(data.value)}
                placeholder="Search Costpoint projects"
                size="large"
                value={projectLookup}
              />
            </FormField>
            <FormField
              helper="The Costpoint primary node"
              id="primary-node"
              label="CP Primary Node"
            >
              <Input
                className="primary-node-input"
                id="primary-node"
                onChange={(_, data) => setPrimaryNode(data.value)}
                readOnly
                size="large"
                value={primaryNode}
              />
            </FormField>
          </section>

          <section
            className={`request-section revision-section${tableExpanded ? ' is-expanded' : ''}`}
          >
            <div className="revision-section-heading">
              <div className="request-section-heading">
                <h2 className="request-section-title">
                  Project Revision Details
                </h2>
                <p className="revision-guidance">
                  Provide the Node details that need to be added under the
                  existing project. Click Add New Row to populate the table.
                  For projects with many nodes you can use copy/paste from
                  Excel. Use this{' '}
                  <button
                    className="request-inline-link"
                    onClick={() =>
                      showFeedback('The template is not connected in this preview.')
                    }
                    type="button"
                  >
                    template
                  </button>{' '}
                  to get started.
                </p>
                <p className="revision-guidance revision-guidance-emphasis">
                  Owning Orgs will be changed after the month end closing. If
                  you request an owning org change at the end of the fiscal
                  year, please note that the change cannot be completed until
                  the Fiscal Year is closed by Accounting.
                </p>
                <p className="revision-guidance">
                  For help identifying the Owning Organization please use this{' '}
                  <button
                    className="request-inline-link"
                    onClick={() =>
                      showFeedback('The template is not connected in this preview.')
                    }
                    type="button"
                  >
                    template
                  </button>
                </p>
              </div>
              <div className="revision-toolbar">
                {tableSearchOpen && (
                  <Input
                    aria-label="Search revision rows"
                    className="revision-search"
                    onChange={(_, data) => setTableSearch(data.value)}
                    placeholder="Search rows"
                    size="small"
                    value={tableSearch}
                  />
                )}
                <Button
                  aria-label="Search revision rows"
                  appearance="secondary"
                  icon={<Search24Regular />}
                  onClick={() => setTableSearchOpen((open) => !open)}
                  size="large"
                />
                <Button
                  aria-label="Sort revision rows"
                  appearance="secondary"
                  icon={<ArrowSortRegular />}
                  onClick={() =>
                    showFeedback('Row sorting is a UI preview only.')
                  }
                  size="large"
                />
                <Button
                  appearance="secondary"
                  icon={<ArrowDownloadRegular />}
                  onClick={() =>
                    showFeedback('CSV import is not connected in this preview.')
                  }
                  size="large"
                >
                  Import CSV
                </Button>
                <Button
                  aria-label={tableExpanded ? 'Collapse revision table' : 'Expand revision table'}
                  appearance="secondary"
                  icon={<FullScreenMaximizeRegular />}
                  onClick={() => setTableExpanded((expanded) => !expanded)}
                  size="large"
                />
              </div>
            </div>

            <div className="revision-table-scroll">
              <table className="revision-table">
                <thead>
                  <tr>
                    <th className="row-select-cell">
                      <Checkbox
                        aria-label="Select all revision rows"
                        checked={allRowsSelected}
                        onChange={(_, data) =>
                          handleSelectAll(data.checked === true)
                        }
                      />
                    </th>
                    <th className="row-number-cell">#</th>
                    <th>Costpoint Project ID <span>*</span></th>
                    <th>Project Name <span>*</span></th>
                    <th>Do you need GFAS Project? <span>*</span></th>
                    <th>GFAS Project # <span>*</span></th>
                    <th>Subaward Lookup</th>
                    <th>Owning Org</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.length === 0 ? (
                    <tr>
                      <td className="revision-empty" colSpan={8}>
                        {rows.length === 0 ? 'No data found' : 'No matching rows'}
                      </td>
                    </tr>
                  ) : (
                    visibleRows.map((row, index) => (
                      <tr key={row.id}>
                        <td className="row-select-cell">
                          <Checkbox
                            aria-label={`Select revision row ${index + 1}`}
                            checked={selectedRowIds.includes(row.id)}
                            onChange={(_, data) =>
                              toggleRowSelection(row.id, data.checked === true)
                            }
                          />
                        </td>
                        <td className="row-number-cell">{index + 1}</td>
                        <td>
                          <Input
                            aria-label={`Costpoint Project ID row ${index + 1}`}
                            onChange={(_, data) =>
                              updateRow(row.id, 'costpointId', data.value)
                            }
                            size="small"
                            value={row.costpointId}
                          />
                        </td>
                        <td>
                          <Input
                            aria-label={`Project Name row ${index + 1}`}
                            onChange={(_, data) =>
                              updateRow(row.id, 'projectName', data.value)
                            }
                            size="small"
                            value={row.projectName}
                          />
                        </td>
                        <td>
                          <Select
                            aria-label={`Needs GFAS Project row ${index + 1}`}
                            onChange={(event) =>
                              updateRow(row.id, 'needsGfas', event.target.value)
                            }
                            size="small"
                            value={row.needsGfas}
                          >
                            <option value="">Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </Select>
                        </td>
                        <td>
                          <Input
                            aria-label={`GFAS Project number row ${index + 1}`}
                            onChange={(_, data) =>
                              updateRow(row.id, 'gfasNumber', data.value)
                            }
                            size="small"
                            value={row.gfasNumber}
                          />
                        </td>
                        <td>
                          <Input
                            aria-label={`Subaward lookup row ${index + 1}`}
                            onChange={(_, data) =>
                              updateRow(row.id, 'subaward', data.value)
                            }
                            size="small"
                            value={row.subaward}
                          />
                        </td>
                        <td>
                          <Input
                            aria-label={`Owning organization row ${index + 1}`}
                            onChange={(_, data) =>
                              updateRow(row.id, 'owningOrg', data.value)
                            }
                            size="small"
                            value={row.owningOrg}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="revision-add-row">
              <Button
                appearance="primary"
                icon={<Add24Regular />}
                onClick={addRows}
                size="small"
              >
                Add
              </Button>
              <Input
                aria-label="Number of rows to add"
                className="revision-row-count"
                min={1}
                onChange={(_, data) => setRowsToAdd(data.value)}
                size="small"
                type="number"
                value={rowsToAdd}
              />
              <span>more rows</span>
            </div>
          </section>
        </main>

        <aside aria-label="Request tools" className="request-tool-rail">
          <Button
            aria-label="Request overview"
            appearance="subtle"
            icon={<GridDotsRegular />}
          />
          <Button
            aria-label="Request comments"
            appearance="subtle"
            icon={<CommentRegular />}
          />
          <Button
            aria-label="Request attachments"
            appearance="subtle"
            icon={<ImageRegular />}
          />
        </aside>
      </div>

      <footer className="request-form-footer">
        <div
          aria-live="polite"
          className={`request-form-feedback is-${feedbackTone}`}
        >
          {feedback}
        </div>
        <div className="request-form-actions">
          <Button
            appearance="secondary"
            disabled={
              pendingAction !== null ||
              isLoadingRecord ||
              recordLoadError ||
              (recordId === null && hasSaved)
            }
            onClick={() => void persistRequest('save')}
          >
            {pendingAction === 'save'
              ? 'Saving...'
              : recordId === null
                ? 'Save'
                : 'Save changes'}
          </Button>
          <Button
            appearance="secondary"
            disabled={pendingAction !== null}
            onClick={onClose}
          >
            {recordId !== null ? 'Cancel' : hasSaved ? 'Close' : 'Discard'}
          </Button>
          <Button
            appearance="primary"
            disabled={
              pendingAction !== null ||
              isLoadingRecord ||
              recordLoadError ||
              (recordId === null && hasSaved)
            }
            onClick={() => void persistRequest('submit')}
          >
            {pendingAction === 'submit'
              ? 'Submitting...'
              : recordId === null
                ? 'Submit'
                : 'Submit changes'}
          </Button>
        </div>
      </footer>
    </div>
  )
}

export default NewRequestScreen
