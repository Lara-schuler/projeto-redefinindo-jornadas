document.addEventListener('DOMContentLoaded', () => {
  const toggleSenha = document.getElementById('toggleSenha');
  const senhaInput = document.getElementById('senha');

  if (toggleSenha && senhaInput) {
    toggleSenha.addEventListener('click', () => {
      if (senhaInput.type === 'password') {
        senhaInput.type = 'text';
        toggleSenha.classList.remove('bi-eye');
        toggleSenha.classList.add('bi-eye-slash');
      } else {
        senhaInput.type = 'password';
        toggleSenha.classList.remove('bi-eye-slash');
        toggleSenha.classList.add('bi-eye');
      }
    });
  }

  const toggleConfirmarSenha = document.getElementById('toggleConfirmarSenha');
  const confirmarSenhaInput = document.getElementById('confirmar-senha');

  if (toggleConfirmarSenha && confirmarSenhaInput) {
    toggleConfirmarSenha.addEventListener('click', () => {
      if (confirmarSenhaInput.type === 'password') {
        confirmarSenhaInput.type = 'text';
        toggleConfirmarSenha.classList.remove('bi-eye');
        toggleConfirmarSenha.classList.add('bi-eye-slash');
      } else {
        confirmarSenhaInput.type = 'password';
        toggleConfirmarSenha.classList.remove('bi-eye-slash');
        toggleConfirmarSenha.classList.add('bi-eye');
      }
    });
  }
});
