import {getHexagramData} from '../data/hexagrams.js';
import {getChangingLine} from '../data/changing-lines.js';
import {getClassicalInterpretations} from '../data/classical-sources.js';
import {getHexagramCycle} from '../data/hexagram-cycles.js';
import {switchTab} from './ui.js';

const TRIGRAMS=[
  {bits:'111',symbol:'☰',name:'Цянь',nature:'Небо'},
  {bits:'110',symbol:'☱',name:'Дуй',nature:'Озеро'},
  {bits:'101',symbol:'☲',name:'Лі',nature:'Вогонь'},
  {bits:'100',symbol:'☳',name:'Чжень',nature:'Грім'},
  {bits:'011',symbol:'☴',name:'Сюнь',nature:'Вітер'},
  {bits:'010',symbol:'☵',name:'Кань',nature:'Вода'},
  {bits:'001',symbol:'☶',name:'Ґень',nature:'Гора'},
  {bits:'000',symbol:'☷',name:'Кунь',nature:'Земля'}
];

const KING_WEN_MATRIX=[
  [1,43,14,34,9,5,26,11],
  [10,58,38,54,61,60,41,19],
  [13,49,30,55,37,63,22,36],
  [25,17,21,51,42,3,27,24],
  [44,28,50,32,57,48,18,46],
  [6,47,64,40,59,29,4,7],
  [33,31,56,62,53,39,52,15],
  [12,45,35,16,20,8,23,2]
];

const $=selector=>document.querySelector(selector);

function addStylesheet(){
  if(document.querySelector('link[data-library-style]'))return;
  const link=document.createElement('link');
  link.rel='stylesheet';
  link.href='css/library.css';
  link.dataset.libraryStyle='true';
  document.head.appendChild(link);
}

function createLibraryTab(){
  if($('#tab-library'))return;
  const section=document.createElement('section');
  section.id='tab-library';
  section.className='tab-content';
  section.setAttribute('aria-labelledby','nav-library');
  section.innerHTML=`
    <div class="section-heading library-heading">
      <div>
        <h2>Бібліотека</h2>
        <p class="library-intro">Оберіть нижню триграму зліва та верхню зверху. На перетині — номер гексаграми.</p>
      </div>
    </div>
    <div class="library-table-wrap" aria-label="Таблиця 64 гексаграм">
      <table id="library-matrix" class="library-matrix"></table>
    </div>
    <article id="library-detail" class="card library-detail hidden" aria-live="polite"></article>
  `;
  const settings=$('#tab-settings');
  settings?.parentElement?.insertBefore(section,settings);
}

function createLibraryNav(){
  if($('#nav-library'))return;
  const button=document.createElement('button');
  button.id='nav-library';
  button.className='nav-btn';
  button.dataset.tab='library';
  button.type='button';
  button.innerHTML='<span>☷</span>Бібліотека';
  button.addEventListener('click',()=>switchTab('library'));
  const settings=$('#nav-settings');
  settings?.parentElement?.insertBefore(button,settings);
}

function trigramLabel(trigram){
  return `<span class="trigram-symbol">${trigram.symbol}</span><span class="trigram-nature">${trigram.nature}</span><span class="trigram-name">${trigram.name}</span>`;
}

function renderMatrix(){
  const table=$('#library-matrix');
  if(!table)return;
  const head=document.createElement('thead');
  const headRow=document.createElement('tr');
  const corner=document.createElement('th');
  corner.className='matrix-corner';
  corner.innerHTML='<span>Верхня →</span><span>Нижня ↓</span>';
  headRow.appendChild(corner);
  TRIGRAMS.forEach(trigram=>{
    const th=document.createElement('th');
    th.scope='col';
    th.className='trigram-header';
    th.innerHTML=trigramLabel(trigram);
    headRow.appendChild(th);
  });
  head.appendChild(headRow);

  const body=document.createElement('tbody');
  TRIGRAMS.forEach((lower,rowIndex)=>{
    const row=document.createElement('tr');
    const rowHead=document.createElement('th');
    rowHead.scope='row';
    rowHead.className='trigram-header row-header';
    rowHead.innerHTML=trigramLabel(lower);
    row.appendChild(rowHead);
    KING_WEN_MATRIX[rowIndex].forEach((number,columnIndex)=>{
      const cell=document.createElement('td');
      const button=document.createElement('button');
      button.type='button';
      button.className='hex-cell';
      button.textContent=number;
      const upper=TRIGRAMS[columnIndex];
      const hex=getHexagramData(number);
      button.setAttribute('aria-label',`Гексаграма №${number} ${hex.name}. Нижня ${lower.nature}, верхня ${upper.nature}`);
      button.title=`№${number} ${hex.name}`;
      button.addEventListener('click',()=>openHexagram(number,rowIndex,columnIndex));
      cell.appendChild(button);
      row.appendChild(cell);
    });
    body.appendChild(row);
  });

  table.replaceChildren(head,body);
}

function renderHexagramFigure(lowerBits,upperBits){
  const bits=(lowerBits+upperBits).split('');
  return `<div class="library-hexagram" aria-hidden="true">${bits.map(bit=>`<span class="library-line ${bit==='1'?'yang':'yin'}"></span>`).join('')}</div>`;
}

function lineDetails(hexagram){
  return Array.from({length:6},(_,index)=>{
    const line=getChangingLine(hexagram,index+1);
    const classical=line.classical||{};
    return `
      <details class="library-line-details">
        <summary><span>Лінія ${index+1}</span><strong>${line.title}</strong></summary>
        <div class="library-line-body">
          <p class="line-stage">${line.stage}</p>
          <p>${line.meaning}</p>
          <p><strong>Практично:</strong> ${line.advice}</p>
          <details class="library-classics">
            <summary>Класичні трактування лінії</summary>
            <div>
              <h5>Ріхард Вільгельм</h5>
              <p>${classical.wilhelm||'Текст ще доповнюється.'}</p>
              <h5>Юліан Шуцький</h5>
              <p>${classical.shchutsky||'Текст ще доповнюється.'}</p>
            </div>
          </details>
        </div>
      </details>`;
  }).join('');
}

function openHexagram(number,rowIndex,columnIndex){
  const detail=$('#library-detail');
  if(!detail)return;
  const hex=getHexagramData(number);
  const lower=TRIGRAMS[rowIndex];
  const upper=TRIGRAMS[columnIndex];
  const cycle=getHexagramCycle(number);
  const classics=getClassicalInterpretations(number)||{};

  document.querySelectorAll('.hex-cell.selected').forEach(el=>el.classList.remove('selected'));
  const selected=[...document.querySelectorAll('.hex-cell')].find(el=>Number(el.textContent)===number);
  selected?.classList.add('selected');

  detail.innerHTML=`
    <div class="library-detail-head">
      ${renderHexagramFigure(lower.bits,upper.bits)}
      <div>
        <p class="progress">Гексаграма №${number}</p>
        <h2>${hex.name}</h2>
        <p class="trigram-pair">${lower.symbol} ${lower.nature} внизу · ${upper.symbol} ${upper.nature} вгорі</p>
      </div>
    </div>

    <section class="library-summary-block">
      <h3>Суть</h3><p>${hex.desc}</p>
      <h3>Практична рекомендація</h3><p>${hex.advice}</p>
      <h3>Застереження</h3><p>${hex.caution}</p>
    </section>

    <details class="knowledge-details library-cycle" open>
      <summary>Цикл стану</summary>
      <div class="details-body"><p>${Array.isArray(cycle)&&cycle.length?cycle.join(' → '):'Цикл для цієї гексаграми ще доповнюється.'}</p></div>
    </details>

    <details class="knowledge-details">
      <summary>Класичні трактування гексаграми</summary>
      <div class="details-body">
        <h4>Ріхард Вільгельм</h4><p>${classics.wilhelm||'Текст ще доповнюється.'}</p>
        <h4>Юліан Шуцький</h4><p>${classics.shchutsky||'Текст ще доповнюється.'}</p>
        <small class="library-note">Стислі авторські перекази, не цитати.</small>
      </div>
    </details>

    <section class="library-lines-section">
      <h3>Шість ліній</h3>
      <p class="muted detail-muted">Лінії подано знизу вгору — від початку процесу до його завершення.</p>
      ${lineDetails(hex)}
    </section>
  `;
  detail.classList.remove('hidden');
  detail.scrollIntoView({behavior:'smooth',block:'start'});
}

function initLibrary(){
  addStylesheet();
  createLibraryTab();
  createLibraryNav();
  renderMatrix();
}

initLibrary();
