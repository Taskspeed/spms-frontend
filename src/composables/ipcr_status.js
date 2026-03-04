export function useIPCRStatus() {
  const getStatusColor = (status) => {
    if (!status) return 'grey'

    const s = String(status).toLowerCase()

    if (s.includes('approved')) return 'positive' // Green
    if (s.includes('draft')) return 'info' // Blue
    if (s.includes('pending')) return 'warning' // Orange
    if (s.includes('for approval')) return 'warning' // Orange
    if (s.includes('review')) return 'purple' // Purple
    if (s.includes('rejected')) return 'negative' // Red
    if (s.includes('returned')) return 'negative' // Red
    if (s.includes('cancelled')) return 'grey-7' // Dark Grey
    if (s.includes('completed')) return 'teal' // Teal

    return 'grey' // Default
  }

  const getStatusTextColor = (status) => {
    if (!status) return 'black'

    const s = String(status).toLowerCase()

    // For dark backgrounds, use white text
    if (s.includes('approved')) return 'white'
    if (s.includes('draft')) return 'white'
    if (s.includes('review')) return 'white'
    if (s.includes('rejected')) return 'white'
    if (s.includes('returned')) return 'white'
    if (s.includes('cancelled')) return 'white'
    if (s.includes('completed')) return 'white'

    return 'black'
  }

  const getStatusIcon = (status) => {
    if (!status) return 'help_outline'

    const s = String(status).toLowerCase()

    if (s.includes('approved')) return 'check_circle'
    if (s.includes('draft')) return 'edit_note'
    if (s.includes('pending')) return 'hourglass_empty'
    if (s.includes('for approval')) return 'hourglass_empty'
    if (s.includes('review')) return 'rate_review'
    if (s.includes('rejected')) return 'cancel'
    if (s.includes('returned')) return 'undo'
    if (s.includes('cancelled')) return 'block'
    if (s.includes('completed')) return 'task_alt'

    return 'help_outline'
  }

  return {
    getStatusColor,
    getStatusTextColor,
    getStatusIcon,
  }
}
