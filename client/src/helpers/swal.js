import Swal from 'sweetalert2';

export const showToast = (icon, title) => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: '#1e293b',
    color: '#fff',
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  })

  Toast.fire({
    icon: icon,
    title: title
  })
}

export const showConfirm = async (title, text) => {
  return Swal.fire({
    title: title,
    text: text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#79dffc', // Neon Blue
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, do it!',
    background: '#1e293b',
    color: '#fff',
    iconColor: '#bc13fe' // Neon Purple
  })
}