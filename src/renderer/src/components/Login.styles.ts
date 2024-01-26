import { makeStyles, shorthands } from '@fluentui/react-components'

export const useLoginStyles = makeStyles({
  buttons: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    ...shorthands.gap('8px'),
  },
  logoutArea: {
    ...shorthands.padding('12px', 0),
    fontSize: '1.1rem',
  },
})
