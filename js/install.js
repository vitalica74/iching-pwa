let deferredInstallPrompt=null;

const installCard=document.querySelector('#install-app-card');
const installButton=document.querySelector('#install-app-button');
const installHint=document.querySelector('#install-app-hint');

function isStandalone(){
  return window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true;
}

function hideInstall(){
  installCard?.classList.add('hidden');
  deferredInstallPrompt=null;
}

function showInstall(){
  if(isStandalone())return hideInstall();
  installCard?.classList.remove('hidden');
}

if(isStandalone()){
  hideInstall();
}else{
  window.addEventListener('beforeinstallprompt',event=>{
    event.preventDefault();
    deferredInstallPrompt=event;
    if(installHint)installHint.textContent='Встановіть Книгу Змін як окремий застосунок. Після встановлення він працюватиме з головного екрана та офлайн.';
    showInstall();
  });

  installButton?.addEventListener('click',async()=>{
    if(!deferredInstallPrompt){
      if(installHint)installHint.textContent='Автоматичне встановлення зараз недоступне. Відкрийте меню браузера ⋮ та виберіть «Встановити додаток» або «Додати на головний екран».';
      return;
    }

    const prompt=deferredInstallPrompt;
    deferredInstallPrompt=null;
    await prompt.prompt();
    const choice=await prompt.userChoice;
    if(choice.outcome==='accepted')hideInstall();
    else if(installHint)installHint.textContent='Встановлення скасовано. Кнопка залишиться доступною, коли браузер знову дозволить встановлення.';
  });

  window.addEventListener('appinstalled',hideInstall);
}
