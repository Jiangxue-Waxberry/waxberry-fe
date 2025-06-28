const fileType1 = ['doc', 'docx'];
const fileType2 = ['xls', 'xlsx', 'xlsm'];
const fileType3 = ['ppt', 'pptx'];
const fileType4 = ['csv', 'tsv', 'dotm', 'xlt', 'xltm', 'dot', 'dotx','xlam', 'xla' ,'pages'];
const fileType5 = ['wps', 'dps', 'et', 'ett', 'wpt'];
const fileType6 = ['odt', 'ods', 'ots', 'odp', 'otp', 'six', 'ott', 'fodt', 'fods'];
const fileType7 = ['vsd', 'vsdx'];
const fileType8 = ['wmf', 'emf'];
const fileType9 = ['psd' , 'eps'];
const fileType10 = ['pdf' , 'ofd', 'rtf'];
const fileType11 = ['xmind'];
const fileType12 = ['bpmn'];
const fileType13 = ['eml'];
const fileType14 = ['epub'];
const fileType15 = ['obj', '3ds', 'stl', 'ply', 'gltf', 'glb', 'off', '3dm', 'fbx', 'dae', 'wrl', '3mf', 'ifc', 'brep', 'step', 'iges', 'fcstd', 'bim'];
const fileType16 = ['dwg', 'dxf', 'dwf', 'iges' , 'igs', 'dwt', 'dng', 'ifc', 'dwfx', 'stl', 'cf2', 'plt'];
const fileType17 = ['txt', 'xml', 'xbrl', 'md', 'java', 'php', 'py', 'js', 'css'];
const fileType18 = ['zip', 'rar', 'jar', 'tar', 'gzip', '7z'];
const fileType19 = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'ico', 'jfif', 'webp'];
const fileType20 = ['tif', 'tiff', 'tga', 'svg'];
const fileType21 = ['mp3', 'wav', 'mp4', 'flv'];
const fileType22 = ['avi','mov','rm','webm','ts','rm','mkv','mpeg','ogg','mpg','rmvb','wmv','3gp','ts','swf'];
const fileType23 = ['dcm'];
const fileType24 = ['drawio'];

const getFileTypeStyle = (type)=> {
  if(!type){
    return 'black';
  }
  if(fileType1.includes(type)) {
    return '#14A9DA';
  }
  if(fileType2.includes(type)) {
    return '#45B058';
  }
  if(fileType3.includes(type)) {
    return '#C25033';
  }
  if(fileType4.includes(type)) {
    return '#F7622C';
  }
  if(fileType5.includes(type)) {
    return '#F7622C';
  }
  if(fileType6.includes(type)) {
    return '#F7622C';
  }
  if(fileType7.includes(type)) {
    return '#4C66BD';
  }
  if(fileType8.includes(type)) {
    return '#868EE9';
  }
  if(fileType9.includes(type)) {
    return '#57A6F8';
  }
  if(fileType10.includes(type)) {
    return '#EA5454';
  }
  if(fileType11.includes(type)) {
    return '#EA3F37';
  }
  if(fileType12.includes(type)) {
    return '#40845B';
  }
  if(fileType13.includes(type)) {
    return '#93458E';
  }
  if(fileType14.includes(type)) {
    return '#9BCFE7';
  }
  if(fileType15.includes(type)) {
    return '#C4C4C4';
  }
  if(fileType16.includes(type)) {
    return '#D13153';
  }
  if(fileType17.includes(type)) {
    return '#F9CA06';
  }
  if(fileType18.includes(type)) {
    return '#C2D0D8';
  }
  if(fileType19.includes(type)) {
    return '#E986A5';
  }
  if(fileType20.includes(type)) {
    return '#868EE9';
  }
  if(fileType21.includes(type)) {
    return '#55D4FF';
  }
  if(fileType22.includes(type)) {
    return '#6488FF';
  }
  if(fileType23.includes(type)) {
    return '#4A87FF';
  }
  if(fileType24.includes(type)) {
    return '#E28C34';
  }
  return 'black';
};

const getFileTypePng = (suffixName) =>{
  return `
    <?xml version="1.0" encoding="UTF-8"?>
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 28 28.03">
      <defs>
        <clipPath id="clippath">
          <rect y=".03" width="28" height="28" style="fill: none;"/>
        </clipPath>
      </defs>
      <g style="clip-path: url(#clippath);">
        <g>
          <path d="M7.34,24.11c-.33,0-.62-.08-.86-.24-.24-.16-.4-.4-.48-.74l.6-.34c.12,.42,.37,.62,.74,.62,.25,0,.44-.09,.55-.28,.11-.18,.17-.45,.17-.81v-3.43h.75v3.51c0,.59-.14,1.02-.41,1.29-.28,.27-.63,.41-1.06,.41Zm4.24-5.2c.36,0,.69,.07,.97,.2,.28,.14,.51,.33,.66,.57,.16,.25,.23,.53,.23,.85,0,.32-.08,.6-.23,.84-.16,.25-.38,.44-.66,.57s-.61,.2-.98,.2h-.89v1.88h-.75v-5.12h1.64Zm-.09,2.59c.37,0,.65-.09,.86-.26,.2-.17,.3-.41,.3-.7,0-.29-.1-.53-.3-.71-.2-.18-.49-.27-.86-.27h-.8v1.94h.8Zm4.96,.46v-.66h1.79v2.03c-.15,.23-.39,.42-.72,.56s-.69,.22-1.09,.22c-.48,0-.91-.11-1.29-.33s-.67-.53-.89-.94-.32-.86-.32-1.38,.11-.98,.33-1.38c.22-.4,.51-.71,.89-.93,.38-.22,.79-.33,1.25-.33,.43,0,.81,.09,1.13,.28,.32,.18,.55,.44,.69,.75l-.62,.36c-.11-.21-.27-.38-.48-.51-.21-.13-.46-.19-.75-.19-.32,0-.6,.08-.85,.24-.25,.16-.44,.39-.58,.69-.14,.3-.21,.64-.21,1.02s.07,.74,.22,1.03,.35,.53,.62,.69,.57,.25,.92,.25c.45,0,.78-.12,1.01-.36v-1.11h-1.04Zm2.18-3.05h3.91v.67h-1.58v4.46h-.76v-4.46h-1.57v-.67Z" style="fill: #fff;"/>
          <g>
            <path d="M3.68,.03C2.46,.03,1.45,.99,1.45,2.22V25.8c0,1.22,.96,2.23,2.23,2.23H23.68c1.23,0,2.23-1.01,2.23-2.23V8.91L17.64,.03H3.68Z" fill="${getFileTypeStyle(suffixName)}"/>
            <path d="M17.63,0V6.09c0,.7,.4,2.77,2.61,2.77h5.67S17.63,0,17.63,0Z" style="fill: #fff;"/>
          </g>
        </g>
      </g>
      <text transform="translate(3.4 23.29)" style="fill: #fff; font-size: 9.14px;"><tspan x="0" y="0">${suffixName}</tspan></text>
    </svg>
  `;
};

export default getFileTypePng;
