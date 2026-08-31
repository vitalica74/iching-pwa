// Експериментальний структурний шар І-цзін.
// Він не замінює зміст гексаграм і змінних ліній, а лише додає контекст.
// Лінії записані знизу вгору: 1 = ян, 0 = інь.

const KING_WEN_BITS = {
  1:'111111',2:'000000',3:'100010',4:'010001',5:'111010',6:'010111',7:'010000',8:'000010',
  9:'111011',10:'110111',11:'111000',12:'000111',13:'101111',14:'111101',15:'001000',16:'000100',
  17:'100110',18:'011001',19:'110000',20:'000011',21:'100101',22:'101001',23:'000001',24:'100000',
  25:'100111',26:'111001',27:'100001',28:'011110',29:'010010',30:'101101',31:'001110',32:'011100',
  33:'001111',34:'111100',35:'000101',36:'101000',37:'101011',38:'110101',39:'001010',40:'010100',
  41:'110001',42:'100011',43:'111110',44:'011111',45:'000110',46:'011000',47:'010110',48:'011010',
  49:'101110',50:'011101',51:'100100',52:'001001',53:'001011',54:'110100',55:'101100',56:'001101',
  57:'011011',58:'110110',59:'010011',60:'110010',61:'110011',62:'001100',63:'101010',64:'010101'
};

const PARTNER = {1:4,2:5,3:6,4:1,5:2,6:3};
const POSITION_ROLE = {
  1:'початок і зародження процесу',
  2:'внутрішнє оформлення та врівноваження',
  3:'межа внутрішнього етапу і перехід назовні',
  4:'вхід у зовнішню дію',
  5:'зрілий прояв і центр зовнішнього триграма',
  6:'завершення, межа або надмірність процесу'
};

const typeAt=(bits,position)=>bits?.[position-1]==='1'?'yang':'yin';
const labelType=type=>type==='yang'?'ян':'інь';
const isAppropriate=(type,position)=>(position%2===1&&type==='yang')||(position%2===0&&type==='yin');

export function getStructuralContext(hexagramNumber,changingPositions=[]){
  const bits=KING_WEN_BITS[Number(hexagramNumber)];
  if(!bits)return {available:false,lines:[],summary:''};

  const all=Array.from({length:6},(_,index)=>{
    const position=index+1;
    const type=typeAt(bits,position);
    const partner=PARTNER[position];
    const partnerType=typeAt(bits,partner);
    return {
      position,
      type,
      typeLabel:labelType(type),
      region:position<=3?'inner':'outer',
      regionLabel:position<=3?'внутрішній процес':'зовнішній прояв',
      role:POSITION_ROLE[position],
      appropriate:isAppropriate(type,position),
      central:position===2||position===5,
      partner,
      partnerType,
      correspondence:type!==partnerType
    };
  });

  const yangCount=all.filter(line=>line.type==='yang').length;
  const yinCount=6-yangCount;
  const minority=yangCount===yinCount?null:(yangCount<yinCount?'yang':'yin');
  const strongestMinority=minority&&Math.min(yangCount,yinCount)===1?minority:null;
  const changingSet=new Set(changingPositions.map(Number));
  const lines=all.filter(line=>changingSet.has(line.position));

  const fragments=lines.map(line=>{
    const parts=[`лінія ${line.position}: ${line.role}`];
    parts.push(line.regionLabel);
    parts.push(line.appropriate?'її характер відповідає позиції':'її характер не збігається з природою позиції');
    if(line.central)parts.push('центральна позиція');
    parts.push(line.correspondence?`є відповідність із лінією ${line.partner}`:`немає полярної відповідності з лінією ${line.partner}`);
    if(strongestMinority===line.type)parts.push(`${line.typeLabel} є єдиною рисою цього типу й може мати особливу вагу`);
    else if(minority===line.type)parts.push(`${line.typeLabel} перебуває в меншості й може бути смислово помітнішою`);
    return parts.join('; ');
  });

  return {
    available:true,
    bits,
    yangCount,
    yinCount,
    minority,
    lines,
    all,
    summary:fragments.length
      ? `Структурний шар: ${fragments.join('. ')}.`
      : `Структурний шар: у гексаграмі ${yangCount} ян та ${yinCount} інь; без змінних ліній ці ознаки слугують лише додатковим фоном.`
  };
}

export function structuralReadingNote(){
  return 'Структурні ознаки не означають автоматично «добре» або «погано». Вони уточнюють роль лінії, але не замінюють зміст гексаграми, самої лінії та напрямку переходу.';
}
