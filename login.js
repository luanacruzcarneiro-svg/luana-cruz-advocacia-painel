const loginForm=document.querySelector('#loginForm');
const loginError=document.querySelector('#loginError');
const loginButton=document.querySelector('#loginButton');
let csrfToken='';
fetch('/api/csrf',{credentials:'same-origin'}).then(r=>r.json()).then(d=>{csrfToken=d.csrfToken}).catch(()=>{loginError.textContent='Não foi possível iniciar o acesso. Tente novamente.'});
loginForm.addEventListener('submit',async e=>{e.preventDefault();loginError.textContent='';loginButton.disabled=true;loginButton.textContent='Verificando…';try{const r=await fetch('/api/login',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json','X-CSRF-Token':csrfToken},body:JSON.stringify({username:loginForm.username.value,password:loginForm.password.value})});const d=await r.json();if(!r.ok)throw new Error(d.error||'Não foi possível entrar.');location.replace('/')}catch(err){loginError.textContent=err.message;loginButton.disabled=false;loginButton.textContent='Entrar no painel'}});
