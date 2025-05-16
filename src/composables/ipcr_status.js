export const useIPCRStatus = () => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'positive';
      case 'Incomplete':
        return 'orange';
      case 'Not Reviewed':
        return 'grey-6';
      default:
        return 'grey';
    }
  };

  const getStatusTextColor = () => 'white';

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved':
        return 'check_circle';
      case 'Incomplete':
        return 'error_outline';
      case 'Not Reviewed':
        return 'hourglass_empty';
      default:
        return 'help_outline';
    }
  };

  return {
    getStatusColor,
    getStatusTextColor,
    getStatusIcon,
  };
};
