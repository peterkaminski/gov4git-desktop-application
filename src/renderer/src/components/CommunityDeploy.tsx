import {
  Breadcrumb,
  BreadcrumbButton,
  BreadcrumbDivider,
  BreadcrumbItem,
  Button,
  Checkbox,
  Field,
  Input,
  MessageBar,
  MessageBarBody,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from '@fluentui/react-components'
import { Verification } from '@octokit/auth-oauth-device/dist-types/types.js'
import { FC, memo, useCallback, useEffect, useMemo, useState } from 'react'

import {
  useCommunityDeployFetchOrgs,
  useCommunityDeployOrg,
  useCommunityDeployOrgs,
  useCommunityDeployPat,
  useCommunityDeployRepo,
  useCommunityDeployRepos,
  useCommunityDeployState,
  useDeployCommunity,
  useSetCommunityDashboardState,
  useSetCommunityDeployOrg,
  useSetCommunityDeployPat,
  useSetCommunityDeployRepo,
  useSetCommunityDeployState,
} from '../store/hooks/communityHooks.js'
import { useStartLoginFlow } from '../store/hooks/userHooks.js'
import { useButtonStyles } from '../styles/buttons.js'
import { useMessageStyles } from '../styles/messages.js'
import { useCommunityDeployStyle } from './CommunityDeploy.styles.js'
import { Loader } from './Loader.js'
import { LoginVerification } from './LoginVerification.js'
import { Message } from './Message.js'

export const CommunityDeploy: FC = memo(function CommunityDeploy() {
  const state = useCommunityDeployState()

  const Component: FC = useMemo(() => {
    switch (state) {
      case 'repo-select':
        return CommunityOrgRepos
      case 'provide-token':
        return Token
      case 'deploy':
        return Deploy
      default:
        return CommunityOrgs
    }
  }, [state])

  return (
    <>
      <h2>Deploy Community</h2>
      <Nav />
      <Component />
    </>
  )
})

const CommunityOrgs: FC = memo(function CommunityOrgs() {
  const buttonStyles = useButtonStyles()
  const orgs = useCommunityDeployOrgs()
  const getOrgs = useCommunityDeployFetchOrgs()
  const selectedOrg = useCommunityDeployOrg()
  const setSelectedOrg = useSetCommunityDeployOrg()
  const styles = useCommunityDeployStyle()
  const setCommunityDashboardState = useSetCommunityDashboardState()
  const setCommunityDeployState = useSetCommunityDeployState()
  const [dataLoading, setDataLoading] = useState(false)
  const [verification, setVerification] = useState<Verification | null>(null)
  const [vericationLoading, setVerificationLoading] = useState(false)
  const startLoginFlow = useStartLoginFlow()

  const loadData = useCallback(async () => {
    setDataLoading(true)
    await getOrgs()
    setDataLoading(false)
  }, [setDataLoading, getOrgs])

  const reauthorize = useCallback(async () => {
    setVerificationLoading(true)
    const verification = await startLoginFlow()
    setVerification(verification)
    setVerificationLoading(false)
  }, [startLoginFlow, setVerification, setVerificationLoading])

  useEffect(() => {
    void loadData()
  }, [loadData])

  return (
    <>
      <MessageBar layout="multiline" intent="info">
        <MessageBarBody>
          Gov4Git communities can only be deployed for{' '}
          <a
            href="https://docs.github.com/en/organizations/collaborating-with-groups-in-organizations/about-organizations"
            target="_blank"
            rel="noreferrer"
          >
            GitHub Organizations
          </a>
          . You must be an admin of an organization in order to deploy a Gov4Git
          community. Listed below are the organizations this app is authorized
          to access and in which you are an admin. If Organizations you wish to
          manage are missing from the list, you may{' '}
          <button className={buttonStyles.link} onClick={reauthorize}>
            Reauthorize
          </button>{' '}
          to grant this application access to additional organizations.
          <Loader isLoading={vericationLoading}>
            <LoginVerification
              verification={verification}
              onLoggedIn={loadData}
            />
          </Loader>
        </MessageBarBody>
      </MessageBar>
      <Loader isLoading={dataLoading}>
        {/* <h2>Deploy Community &gt; Select Organization</h2> */}
        {orgs != null && orgs.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell className={styles.firstCol}></TableHeaderCell>
                <TableHeaderCell>GitHub Organizations</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orgs.map((o) => (
                <TableRow key={o.organizationName}>
                  <TableCell className={styles.firstCol}>
                    <Checkbox
                      checked={o.organizationName === selectedOrg}
                      onChange={() => setSelectedOrg(o.organizationName)}
                    />
                  </TableCell>
                  <TableCell>{o.organizationName}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <div className={styles.buttonRow}>
          <Button onClick={() => setCommunityDashboardState('initial')}>
            Cancel
          </Button>
          <Button
            disabled={selectedOrg === ''}
            appearance="primary"
            onClick={() => setCommunityDeployState('repo-select')}
          >
            Next
          </Button>
        </div>
      </Loader>
    </>
  )
})

const CommunityOrgRepos: FC = memo(function CommunityOrgRepos() {
  const selectedOrg = useCommunityDeployOrg()
  const selectedRepo = useCommunityDeployRepo()
  const setSelectedRepo = useSetCommunityDeployRepo()
  const repos = useCommunityDeployRepos()
  const styles = useCommunityDeployStyle()
  const setCommunityDeployState = useSetCommunityDeployState()

  return (
    <>
      <Loader isLoading={repos == null}>
        {/* <h2>Deploy Community &gt; {selectedOrg} &gt; Select Repo</h2> */}
        {repos != null && repos.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell className={styles.firstCol}></TableHeaderCell>
                <TableHeaderCell>
                  Public GitHub Repos in {selectedOrg}
                </TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {repos.map((r) => (
                <TableRow key={r}>
                  <TableCell className={styles.firstCol}>
                    <Checkbox
                      checked={r === selectedRepo}
                      onChange={() => setSelectedRepo(r)}
                    />
                  </TableCell>
                  <TableCell>{r}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <div className={styles.buttonRow}>
          <Button onClick={() => setCommunityDeployState('initial')}>
            Back
          </Button>
          <Button
            disabled={selectedRepo === ''}
            appearance="primary"
            onClick={() => setCommunityDeployState('provide-token')}
          >
            Next
          </Button>
        </div>
      </Loader>
    </>
  )
})

const Token: FC = memo(function Deploy() {
  const pat = useCommunityDeployPat()
  const setPat = useSetCommunityDeployPat()
  const setCommunityDeployState = useSetCommunityDeployState()
  const selectedOrg = useCommunityDeployOrg()
  const styles = useCommunityDeployStyle()

  return (
    <>
      <div>
        <p>
          Gov4Git requires access to a Personal Access Token in order to manage
          the newly deployed community repo.
        </p>
        <h3 className={styles.instructionTitle}>
          Generating a Personal Access Token
        </h3>
        <ol className={styles.instructionsList}>
          <li>
            Visit{' '}
            <a
              target="_blank"
              href="https://github.com/settings/personal-access-tokens/new"
              rel="noreferrer"
            >
              https://github.com/settings/personal-access-tokens/new
            </a>{' '}
            to get started.
          </li>
          <li>
            Provide a token name, expiration date, and description for the
            token.
          </li>
          <li>
            Select <strong>{selectedOrg}</strong> as the Resource owner.
          </li>
          <li>Select All repositories for the Repository access option.</li>
          <li>
            <div>
              Under Permissions, select the following Repository permissions.
            </div>
            <table className={styles.accessTable}>
              <thead>
                <tr>
                  <th>Option</th>
                  <th>Access Level</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Actions</td>
                  <td>Read and Write</td>
                </tr>
                <tr>
                  <td>Administration</td>
                  <td>Read and Write</td>
                </tr>
                <tr>
                  <td>Contents</td>
                  <td>Read and Write</td>
                </tr>
                <tr>
                  <td>Environments</td>
                  <td>Read and Write</td>
                </tr>
                <tr>
                  <td>Issues</td>
                  <td>Read and Write</td>
                </tr>
                <tr>
                  <td>Pull requests</td>
                  <td>Read and Write</td>
                </tr>
                <tr>
                  <td>Secrets</td>
                  <td>Read and Write</td>
                </tr>
                <tr>
                  <td>Variables</td>
                  <td>Read and Write</td>
                </tr>
                <tr>
                  <td>Workflows</td>
                  <td>Read and Write</td>
                </tr>
              </tbody>
            </table>
            <div>and select the following Organization permissions</div>
            <table className={styles.accessTable}>
              <thead>
                <tr>
                  <th>Option</th>
                  <th>Access Level</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Members</td>
                  <td>Read</td>
                </tr>
              </tbody>
            </table>
          </li>
          <li>Select Generate token</li>
          <li>Copy and paste the token below</li>
        </ol>
      </div>
      <Field
        // @ts-expect-error children signature
        label={{
          children: () => <label htmlFor="pat">Personal Access Token</label>,
        }}
      >
        <Input
          type="password"
          id="pat"
          value={pat}
          onChange={(e) => setPat(e.target.value)}
        />
      </Field>
      <div className={styles.buttonRow}>
        <Button onClick={() => setCommunityDeployState('repo-select')}>
          Back
        </Button>
        <Button
          disabled={pat === ''}
          appearance="primary"
          onClick={() => setCommunityDeployState('deploy')}
        >
          Next
        </Button>
      </div>
    </>
  )
})

const Deploy: FC = memo(function Deploy() {
  const [loading, setLoading] = useState(false)
  const setCommunityDashboardState = useSetCommunityDashboardState()
  const setCommunityDeployState = useSetCommunityDeployState()
  const selectedOrg = useCommunityDeployOrg()
  const selectedRepo = useCommunityDeployRepo()
  const deployCommunity = useDeployCommunity()
  const messageStyles = useMessageStyles()
  const [successMessage, setSuccessMessage] = useState('')

  const deploy = useCallback(async () => {
    setLoading(true)
    await deployCommunity()
    setLoading(false)
    const message = [
      `Success. A Gov4Git community has been deployed for ${selectedOrg}/${selectedRepo}.`,
      `You can view the newly created community repo at <a href="https://github.com/${selectedOrg}/${selectedRepo}-gov.public" target="_blank" rel="noreferrer">https://github.com/${selectedOrg}/${selectedRepo}-gov.public</a>.`,
      'Visit <a href="https://github.com/gov4git/gov4git" target="_blank" rel="noreferrer">https://github.com/gov4git/gov4git</a>',
      'for documenation on how to manage Gov4Git community repos.',
    ].join(' ')
    console.log(message)
    setSuccessMessage(message)
  }, [
    setLoading,
    selectedOrg,
    selectedRepo,
    deployCommunity,
    setSuccessMessage,
  ])

  const dismissMessage = useCallback(() => {
    setSuccessMessage('')
    setCommunityDeployState('initial')
    setCommunityDashboardState('initial')
  }, [setSuccessMessage, setCommunityDashboardState, setCommunityDeployState])

  return (
    <>
      {successMessage === '' && (
        <div>
          <Button
            disabled={loading}
            appearance="primary"
            type="submit"
            onClick={deploy}
          >
            {loading && (
              <>
                <i className="codicon codicon-loading codicon-modifier-spin" />
                &nbsp;
              </>
            )}
            Deploy Gov4Git for {selectedOrg}/{selectedRepo}
          </Button>
        </div>
      )}
      {successMessage !== '' && (
        <Message
          className={messageStyles.success}
          messages={[successMessage]}
          onClose={dismissMessage}
        />
      )}
    </>
  )
})

const Nav: FC = memo(function Nav() {
  const state = useCommunityDeployState()
  const setState = useSetCommunityDeployState()

  return (
    <Breadcrumb>
      <BreadcrumbItem>
        <BreadcrumbButton onClick={() => setState('initial')}>
          Select Organization
        </BreadcrumbButton>
      </BreadcrumbItem>
      {['repo-select', 'provide-token', 'deploy'].includes(state) && (
        <>
          <BreadcrumbDivider />
          <BreadcrumbItem>
            <BreadcrumbButton onClick={() => setState('repo-select')}>
              Select Repo
            </BreadcrumbButton>
          </BreadcrumbItem>
        </>
      )}
      {['provide-token', 'deploy'].includes(state) && (
        <>
          <BreadcrumbDivider />
          <BreadcrumbItem>
            <BreadcrumbButton onClick={() => setState('provide-token')}>
              PAT
            </BreadcrumbButton>
          </BreadcrumbItem>
        </>
      )}
      {['deploy'].includes(state) && (
        <>
          <BreadcrumbDivider />
          <BreadcrumbItem>
            <BreadcrumbButton onClick={() => setState('deploy')}>
              Deploy
            </BreadcrumbButton>
          </BreadcrumbItem>
        </>
      )}
    </Breadcrumb>
  )
})