import { Button, Card } from '@fluentui/react-components'
import { Add32Filled, People32Filled } from '@fluentui/react-icons'
import { FC, memo, useCallback, useMemo } from 'react'

import {
  useCommunityDashboardState,
  useCommunityJoinErrors,
  useSetCommunityDashboardState,
  useSetCommunityJoinErrors,
} from '../store/hooks/communityHooks.js'
import { useCardStyles, useHeadingsStyles } from '../styles/index.js'
import { useMessageStyles } from '../styles/messages.js'
import { CommunityDeploy } from './CommunityDeploy.js'
import { CommunityJoin2 } from './CommunityJoin2.js'
import { CommunityManage } from './CommunityManage.js'
import { CommunityTable } from './CommunityTable.js'
import { useDashboardCommunityStyle } from './DashboardCommunity.styles.js'
import { Message } from './Message.js'

export const DashboardCommunity: FC = memo(function DashboardCommunity() {
  const headerStyles = useHeadingsStyles()
  const communityErrors = useCommunityJoinErrors()
  const setCommunityErrors = useSetCommunityJoinErrors()
  const messageStyles = useMessageStyles()
  const cardStyles = useCardStyles()
  const communityDashboardState = useCommunityDashboardState()

  const Component: FC = useMemo(() => {
    switch (communityDashboardState) {
      case 'join':
        return CommunityJoin2
      case 'deploy':
        return CommunityDeploy
      case 'manage':
        return CommunityManage
      default:
        return DashboardCommunityButtons
    }
  }, [communityDashboardState])

  const dismissError = useCallback(() => {
    setCommunityErrors([])
  }, [setCommunityErrors])

  return (
    <>
      <h2 className={headerStyles.pageHeading}>Communities</h2>
      <Card className={cardStyles.primary}>
        {communityErrors.length > 0 && (
          <Message
            messages={communityErrors}
            onClose={dismissError}
            className={messageStyles.error}
          />
        )}
        <CommunityTable />
        <br />
        <Component />
      </Card>
    </>
  )
})

export const DashboardCommunityButtons: FC = memo(
  function DashboardCommunityButtons() {
    const styles = useDashboardCommunityStyle()
    const setCommunityDashboardState = useSetCommunityDashboardState()

    return (
      <div className={styles.buttonRow}>
        <Button
          appearance="primary"
          icon={<People32Filled />}
          onClick={() => setCommunityDashboardState('join')}
        >
          Join a Community
        </Button>
        <Button
          appearance="primary"
          icon={<Add32Filled />}
          onClick={() => setCommunityDashboardState('deploy')}
        >
          Deploy a New Community
        </Button>
      </div>
    )
  },
)