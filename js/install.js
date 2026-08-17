let deferredInstallPrompt=null;

function isStandalone(){
  return window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true;
}

function ensureInstallCard(){
  let card=document.querySelector('#install-app-card');
  if(card)return card;

  const settings=document.querySelector('#tab-settings');
  if(!settings)return null;

  card=document.createElement('article');
  card.id='install-app-card';
  card.className='card settings-card hidden';
  card.innerHTML=`
    <h2>Встановити додаток</h2>
    <p id="install-app-hint" class="muted">Встановіть Книгу Змін як окремий застосунок. Після встановлення він працюватиме з головного екрана та офлайн.</p>
    <button id="install-app-button" class="secondary-button full" type="button">Встановити Книгу Змін</button>
  `;
  settings.prepend(card);
  return card;
}

const installCard=ensureInstallCard();
const installButton=installCard?.querySelector('#install-app-button');
const installHint=installCard?.querySelector('#install-app-hint');

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
    else if(installHint)installHint.textContent='Встановлення скасовано. Кнопка з’явиться знову, коли браузер повторно дозволить встановлення.';
  });

  window.addEventListener('appinstalled',hideInstall);
}
