import Swal from 'sweetalert2'

export function useMessage() {
  const confirm = async ({
    title = 'Confirm',
    text = 'Are you sure?',
    confirmText = 'Yes',
    cancelText = 'Cancel',
    icon = 'question',
  } = {}) => {
    const result = await Swal.fire({
      title,
      text,
      icon,
      showCancelButton: true,
      confirmButtonColor: '#00703C',
      cancelButtonColor: '#d33',
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      allowOutsideClick: false,
      backdrop: 'rgba(0,0,0,0.5)',
    })

    return result.isConfirmed
  }

  const success = (message) => {
    return Swal.fire({
      icon: 'success',
      title: 'Success',
      text: message,
      timer: 2000,
      showConfirmButton: false,
    })
  }

  const error = (message) => {
    return Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message,
    })
  }

  return { confirm, success, error }
}
