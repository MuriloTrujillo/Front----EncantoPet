
// Google Login
function receberLoginGoogle(resposta) {
  const status = document.getElementById("google-status");

  if (!resposta.credential) {
    status.textContent = "Não foi possível receber a credencial do Google.";
    return;
  }
  
  sessionStorage.setItem("gId", resposta.credential)
  status.textContent = "Credencial recebida do Google! Falta validar no backend.";
  window.location.href = "dados-pessoais.html";
  console.log("");
  
}