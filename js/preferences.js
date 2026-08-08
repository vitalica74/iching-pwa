const KEY='iching-pwa-preferences-v1';
const DEFAULTS={context:'general',mode:'practical',collection:'official'};
export function loadPreferences(){
  try{
    const raw=JSON.parse(localStorage.getItem(KEY)||'{}');
    const legacyMode=raw.mode||(raw.style==='classic'?'classic':'practical');
    return {...DEFAULTS,...raw,mode:legacyMode};
  }catch{return {...DEFAULTS}}
}
export function savePreferences(value){localStorage.setItem(KEY,JSON.stringify(value))}
