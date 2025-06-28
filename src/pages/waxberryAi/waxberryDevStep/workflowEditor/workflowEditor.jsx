import React, { useState, useCallback, createContext, useContext, useEffect } from 'react';

import Dagre from 'dagre';
import {
    ReactFlow,
    useNodesState,
    useEdgesState,
    addEdge,
    Controls,
    Handle,
    Position,
    ReactFlowProvider,
    useReactFlow,
    Panel
} from '@xyflow/react';
import { Drawer, Form, Input, Select, Popover, Tooltip } from 'antd';

import '@xyflow/react/dist/style.css';
import './workflowEditor.scss';

// 创建上下文
const NodeContext = createContext(null);

const StartSvg = () => <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="16" height="16" viewBox="0 0 16 16"><defs><clipPath id="master_svg0_323_27118"><rect x="0" y="0" width="16" height="16" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_323_27118)"><g><path d="M8,2.860986C8.69417,2.860986,9.36708,2.996726,10.00004,3.26444C10.61188,3.52327,11.16157,3.8939,11.63377,4.366099999999999C12.106,4.8383,12.4767,5.387980000000001,12.7354,5.99982C13.0033,6.63291,13.139,7.30583,13.139,8C13.139,8.69417,13.0033,9.36708,12.7356,10.00004C12.4767,10.61188,12.1061,11.16157,11.6339,11.63377C11.1617,12.106,10.61202,12.4767,10.00018,12.7354C9.36708,13.0033,8.69417,13.139,8,13.139C7.30583,13.139,6.63291,13.0033,5.99996,12.7356C5.38812,12.4767,4.83843,12.1061,4.36623,11.6339C3.89404,11.1617,3.52327,10.61202,3.26457,10.00018C2.996726,9.36708,2.8609869999999997,8.69417,2.8609869999999997,8C2.8609869999999997,7.30583,2.996726,6.63291,3.26444,5.99996C3.52327,5.38812,3.8939,4.83843,4.366099999999999,4.36623C4.8383,3.89404,5.387980000000001,3.52327,5.99982,3.26457C6.63291,2.996726,7.30583,2.8609869999999997,8,2.860986ZM8,2C4.68628,1.999999794725,2,4.68628,2,8C2,11.31372,4.68628,14,8,14C11.31372,14,14,11.31372,14,8C14,4.68628,11.31372,1.999999794725,8,2Z" fill="currentColor" fillOpacity="1"/></g><g><path d="M5.277797208831787,5.277797208831787Q4.150224208831787,6.4053742088317875,4.150224208831787,8.000004208831786Q4.150224208831787,9.594634208831788,5.277797208831787,10.722204208831787Q6.4053742088317875,11.849774208831787,8.000004208831786,11.849774208831787Q9.594634208831788,11.849774208831787,10.722204208831787,10.722204208831787Q11.849774208831787,9.594634208831788,11.849774208831787,8.000004208831786Q11.849774208831787,6.4053742088317875,10.722204208831787,5.277797208831787Q9.594634208831788,4.150224208831787,8.000004208831786,4.150224208831787Q6.4053742088317875,4.150224208831787,5.277797208831787,5.277797208831787ZM5.984904208831788,10.015094208831787Q5.150224208831787,9.180414208831788,5.150224208831787,8.000004208831786Q5.150224208831787,6.819584208831787,5.984904208831788,5.984904208831788Q6.819584208831787,5.150224208831787,8.000004208831786,5.150224208831787Q9.180414208831788,5.150224208831787,10.015094208831787,5.984904208831788Q10.849774208831787,6.819584208831787,10.849774208831787,8.000004208831786Q10.849774208831787,9.180414208831788,10.015094208831787,10.015094208831787Q9.180414208831788,10.849774208831787,8.000004208831786,10.849774208831787Q6.819584208831787,10.849774208831787,5.984904208831788,10.015094208831787Z" fillRule="evenodd" fill="currentColor" fillOpacity="1"/></g></g></svg>;
const TaskSvg = () => <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="16" height="16" viewBox="0 0 16 16"><defs><clipPath id="master_svg0_323_67461"><rect x="0" y="0" width="16" height="16" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_323_67461)"><g><rect x="3.699999988079071" y="3.699999988079071" width="8.600000023841858" height="8.600000023841858" rx="0.30000001192092896" fillOpacity="0" strokeOpacity="1" stroke="currentColor" fill="none" strokeWidth="1.399999976158142"/></g></g></svg>;
const MergeSvg = () => <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="15.99915885925293" height="15.99915885925293" viewBox="0 0 15.99915885925293 15.99915885925293"><defs><clipPath id="master_svg0_323_67471"><rect x="0" y="15.99915885925293" width="16" height="16" rx="0"/></clipPath></defs><g transform="matrix(0,-0.9999474287033081,0.9999474287033081,0,-15.99831776272572,15.99915885925293)" clipPath="url(#master_svg0_323_67471)"><g><path d="M8.310444443359376,20.69912635925293L11.284824443359375,20.69912635925293L11.284824443359375,21.95978635925293C11.464674443359375,22.13734635925293,11.704654443359376,22.13734635925293,11.885054443359374,21.95978635925293L14.165254443359375,20.479186359252928C14.345654443359376,20.36062635925293,14.345654443359376,20.12406635925293,14.165254443359375,19.94650635925293L11.885054443359374,18.40576535925293C11.704654443359376,18.22820695925293,11.464674443359375,18.22820695925293,11.284824443359375,18.40576535925293L11.284824443359375,19.51406635925293L7.710184443359375,19.51406635925293L5.3097144433593755,23.66091635925293L2.909244443359375,23.66091635925293L2.909244443359375,23.66434635925293L2.299815443359375,23.66434635925293C1.999684443359375,23.66434635925293,1.699554443359375,23.96046635925293,1.699554443359375,24.25658635925293C1.699554443359375,24.55270635925293,1.999685443359375,24.848836359252928,2.299815443359375,24.848836359252928L5.900804443359375,24.848836359252928L5.898514443359375,24.84482635925293L5.909974443359375,24.84482635925293L8.309874443359375,20.69912635925293L8.310444443359376,20.69912635925293ZM11.884554443359375,26.04133635925293C11.704654443359376,25.86377635925293,11.464674443359375,25.86377635925293,11.284824443359375,26.04133635925293L11.284824443359375,27.214366359252928L9.510394443359374,27.214366359252928L7.710184443359375,24.25315635925293L7.109924443359375,25.43706635925293Q8.790424443359374,28.22071635925293,8.910134443359375,28.39829635925293L11.284824443359375,28.39829635925293L11.284824443359375,29.59539635925293C11.464674443359375,29.77289635925293,11.704654443359376,29.77289635925293,11.884554443359375,29.59539635925293L14.165254443359375,28.11418635925293C14.345154443359375,27.995616359252928,14.345154443359375,27.75906635925293,14.165254443359375,27.581506359252927L11.885054443359374,26.040766359252927L11.884554443359375,26.04133635925293Z" fill="currentColor" fillOpacity="1"/></g></g></svg>;
const BranchSvg = () => <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="16" height="16" viewBox="0 0 16 16"><defs><clipPath id="master_svg0_323_67481"><rect x="16" y="0" width="16" height="16" rx="0"/></clipPath></defs><g transform="matrix(0,1,-1,0,16,-16)" clipPath="url(#master_svg0_323_67481)"><g><path d="M27.381964853515626,2.34765625C27.413194853515627,2.34765625,27.443344853515626,2.35734724,27.468104853515626,2.37511415L29.891374853515625,4.10603625C29.974274853515624,4.16507625,29.974274853515624,4.28820625,29.891374853515625,4.34723625L27.468644853515627,6.07815625C27.423484853515625,6.11077625,27.363854853515626,6.11527625,27.314304853515623,6.08982625C27.264764853515626,6.06436625,27.233694853515622,6.01326625,27.233904853515625,5.95756625L27.233364853515624,4.77041625L24.230224853515626,4.77041625C24.144084853515626,4.77041625,24.050404853515623,4.864626250000001,24.031024853515625,5.00891625L24.027254853515625,5.06544625L24.027254853515625,10.93605625C24.027254853515625,11.09218625,24.110704853515625,11.20417625,24.197384853515626,11.22678625L24.229694853515625,11.23109625L27.233904853515625,11.23109625L27.233904853515625,10.04932625C27.233834853515624,9.99381625,27.264824853515627,9.94292625,27.314184853515627,9.91751625C27.363534853515624,9.892106250000001,27.422954853515627,9.896426250000001,27.468104853515626,9.92872625L29.891374853515625,11.65964625C29.974274853515624,11.71868625,29.974274853515624,11.84181625,29.891374853515625,11.90084625L27.468644853515627,13.63175625C27.423484853515625,13.66435625,27.363854853515626,13.66885625,27.314304853515623,13.64345625C27.264764853515626,13.61795625,27.233694853515622,13.56685625,27.233904853515625,13.51115625L27.233364853515624,12.30787625L24.230224853515626,12.30787625C23.537324853515624,12.30787625,22.995164853515625,11.72964625,22.953164853515624,11.02434625L22.950474853515626,10.93605625L22.949934853515625,8.53914625L21.219554853515625,8.53914625C20.857634853515624,9.56319625,19.608614853515625,9.94561625,18.735391853515626,9.29974625C17.862168853515627,8.65387625,17.862168853515627,7.34762625,18.735391853515626,6.70175625C19.608614853515625,6.05588625,20.857634853515624,6.43830625,21.219554853515625,7.46236625L22.949934853515625,7.46236625L22.949934853515625,5.06544625C22.949934853515625,4.35100625,23.464634853515626,3.74423625,24.144624853515623,3.6968662500000002L24.229694853515625,3.69363625L27.232834853515627,3.69363625L27.233904853515625,2.49571325C27.233904853515625,2.41387815,27.300124853515626,2.3476562018642,27.381964853515626,2.34765625Z" fill="currentColor" fillOpacity="1"/></g></g></svg>;
const JudgeSvg = () => <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="16" height="16" viewBox="0 0 16 16"><defs><clipPath id="master_svg0_323_67491"><rect x="16" y="0" width="16" height="16" rx="0"/></clipPath></defs><g transform="matrix(0,1,-1,0,16,-16)" clipPath="url(#master_svg0_323_67491)"><g transform="matrix(0.7071067690849304,-0.7071067690849304,0.7071067690849304,0.7071067690849304,-0.3847759962081909,15.071067690849304)"><rect x="18.69999998807907" y="8.699999988079071" width="7.600000023841858" height="7.600000023841858" rx="0.30000001192092896" fillOpacity="0" strokeOpacity="1" stroke="currentColor" fill="none" strokeWidth="1.399999976158142"/></g></g></svg>;
const EndSvg = () => <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="16" height="16" viewBox="0 0 16 16"><defs><clipPath id="master_svg0_323_27122"><rect x="0" y="0" width="16" height="16" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_323_27122)"><g><path d="M8,2.860986C8.69417,2.860986,9.36708,2.996726,10.00004,3.26444C10.61188,3.52327,11.16157,3.8939,11.63377,4.366099999999999C12.106,4.8383,12.4767,5.387980000000001,12.7354,5.99982C13.0033,6.63291,13.139,7.30583,13.139,8C13.139,8.69417,13.0033,9.36708,12.7356,10.00004C12.4767,10.61188,12.1061,11.16157,11.6339,11.63377C11.1617,12.106,10.61202,12.4767,10.00018,12.7354C9.36708,13.0033,8.69417,13.139,8,13.139C7.30583,13.139,6.63291,13.0033,5.99996,12.7356C5.38812,12.4767,4.83843,12.1061,4.36623,11.6339C3.89404,11.1617,3.52327,10.61202,3.26457,10.00018C2.996726,9.36708,2.8609869999999997,8.69417,2.8609869999999997,8C2.8609869999999997,7.30583,2.996726,6.63291,3.26444,5.99996C3.52327,5.38812,3.8939,4.83843,4.366099999999999,4.36623C4.8383,3.89404,5.387980000000001,3.52327,5.99982,3.26457C6.63291,2.996726,7.30583,2.8609869999999997,8,2.860986ZM8,2C4.68628,1.999999794725,2,4.68628,2,8C2,11.31372,4.68628,14,8,14C11.31372,14,14,11.31372,14,8C14,4.68628,11.31372,1.999999794725,8,2Z" fill="currentColor" fillOpacity="1"/></g><g><path d="M11.349940625,8.000170624999999Q11.349940625,8.164730625,11.333810625,8.328500625Q11.317680625000001,8.492270625,11.285570625,8.653670625Q11.253470625,8.815080625,11.205700625,8.972550625Q11.157930624999999,9.130030625,11.094950625,9.282070625Q11.031980625,9.434110624999999,10.954400625,9.579240625Q10.876830625,9.724370624999999,10.785400625000001,9.861200625Q10.693970625,9.998030625,10.589580625,10.125240625Q10.485180625,10.252450625,10.368810625,10.368810625Q10.252450625,10.485180625,10.125240625,10.589580625Q9.998030625,10.693970625,9.861200625,10.785400625000001Q9.724370624999999,10.876830625,9.579240625,10.954400625Q9.434110624999999,11.031980625,9.282070625,11.094950625Q9.130030625,11.157930624999999,8.972550625,11.205700625Q8.815080625,11.253470625,8.653670625,11.285580625Q8.492270625,11.317680625000001,8.328500625,11.333810625Q8.164730625,11.349940625,8.000170624999999,11.349940625Q7.835600625,11.349940625,7.671830625,11.333810625Q7.508060625000001,11.317680625000001,7.346660625,11.285580625Q7.185250625,11.253470625,7.027780625,11.205700625Q6.8703006250000005,11.157930624999999,6.718260625,11.094950625Q6.566220625,11.031980625,6.421090625,10.954400625Q6.275960625,10.876830625,6.139130625,10.785400625000001Q6.002300625,10.693970625,5.875090625,10.589580625Q5.7478806250000005,10.485180625,5.631516625,10.368810625Q5.515152625,10.252450625,5.410754625,10.125240625Q5.306356625,9.998030625,5.214929625,9.861200625Q5.123502625,9.724370624999999,5.045927625,9.579240625Q4.968352625,9.434110624999999,4.905376625,9.282070625Q4.842401625,9.130030625,4.794630625,8.972550625Q4.746860425,8.815080625,4.7147556250000004,8.653670625Q4.682650825,8.492270625,4.666520725,8.328500625Q4.650390625,8.164730625,4.650390625,8.000170624999999Q4.650390625,7.835600625,4.666520725,7.671830625Q4.682650825,7.508060625000001,4.7147556250000004,7.346660625Q4.746860425,7.185250625,4.794630625,7.027780625Q4.842401625,6.8703006250000005,4.905376625,6.718260625Q4.968352625,6.566220625,5.045927625,6.421090625Q5.123502625,6.275960625,5.214929625,6.139130625Q5.306356625,6.002300625,5.410754625,5.875090625Q5.515152625,5.7478806250000005,5.631516625,5.631516625Q5.7478806250000005,5.515152625,5.875090625,5.410754625Q6.002300625,5.306356625,6.139130625,5.214929625Q6.275960625,5.123502625,6.421090625,5.045927625Q6.566220625,4.968352625,6.718260625,4.905376625Q6.8703006250000005,4.842401625,7.027780625,4.794630625Q7.185250625,4.746860425,7.346660625,4.7147556250000004Q7.508060625000001,4.682650825,7.671830625,4.666520725Q7.835600625,4.650390625,8.000170624999999,4.650390625Q8.164730625,4.650390625,8.328500625,4.666520725Q8.492270625,4.682650825,8.653670625,4.7147556250000004Q8.815080625,4.746860425,8.972550625,4.794630625Q9.130030625,4.842401625,9.282070625,4.905376625Q9.434110624999999,4.968352625,9.579240625,5.045927625Q9.724370624999999,5.123502625,9.861200625,5.214929625Q9.998030625,5.306356625,10.125240625,5.410754625Q10.252450625,5.515152625,10.368810625,5.631516625Q10.485180625,5.7478806250000005,10.589580625,5.875090625Q10.693970625,6.002300625,10.785400625000001,6.139130625Q10.876830625,6.275960625,10.954400625,6.421090625Q11.031980625,6.566220625,11.094950625,6.718260625Q11.157930624999999,6.8703006250000005,11.205700625,7.027780625Q11.253470625,7.185260625,11.285570625,7.346660625Q11.317680625000001,7.508060625000001,11.333810625,7.671830625Q11.349940625,7.835600625,11.349940625,8.000170624999999Z" fill="currentColor" fillOpacity="1"/></g></g></svg>;
const DragSvg = () => <svg style={{marginLeft: 'auto'}} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="16" height="16" viewBox="0 0 16 16"><defs><clipPath id="master_svg0_323_67457"><rect x="0" y="0" width="16" height="16" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_323_67457)"><g><path d="M7,3C7,3.55228,6.55228,4,6,4C5.447715,4,5,3.55228,5,3C5,2.447715,5.447715,2,6,2C6.55228,2,7,2.447715,7,3ZM6,9C6.55228,9,7,8.55229,7,8C7,7.44772,6.55228,7,6,7C5.447715,7,5,7.44772,5,8C5,8.55229,5.447715,9,6,9ZM6,14C6.55228,14,7,13.5523,7,13C7,12.4477,6.55228,12,6,12C5.447715,12,5,12.4477,5,13C5,13.5523,5.447715,14,6,14ZM11,3C11,3.55228,10.55229,4,10,4C9.44771,4,9,3.55228,9,3C9,2.447715,9.44771,2,10,2C10.55229,2,11,2.447715,11,3ZM10,9C10.55229,9,11,8.55229,11,8C11,7.44772,10.55229,7,10,7C9.44771,7,9,7.44772,9,8C9,8.55229,9.44771,9,10,9ZM10,14C10.55229,14,11,13.5523,11,13C11,12.4477,10.55229,12,10,12C9.44771,12,9,12.4477,9,13C9,13.5523,9.44771,14,10,14Z" fill="currentColor"/></g></g></svg>;
const EditSvg = ({onClick}) => <svg onClick={onClick} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="16" height="16" viewBox="0 0 16 16"><defs><clipPath id="master_svg0_323_67871"><rect x="0" y="0" width="16" height="16" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_323_67871)"><g><path d="M8.53962,4.0939575C8.678799999999999,3.9660794,8.898489999999999,3.969106,9.03382,4.100766L10.95769,5.97208C11.10118,6.111470000000001,11.092939999999999,6.33872,10.939689999999999,6.4680800000000005L6.30405,10.38365C6.23778,10.43971,6.15215,10.46983,6.06401,10.46808L4.34559,10.43267C4.153575,10.42883,4,10.27755,4,10.09225L4,8.409189999999999C3.9999818209,8.31605,4.0395301,8.226980000000001,4.109431,8.16272L8.53962,4.0939575ZM9.00805,9.567309999999999L11.65381,9.61702C11.84877,9.62068,12.00373,9.77607,11.999929999999999,9.96408C11.99613,10.152090000000001,11.835,10.30153,11.640039999999999,10.29787L8.99429,10.24816C8.79922,10.24455,8.644169999999999,10.08904,8.64807,9.900929999999999C8.65197,9.712810000000001,8.81334,9.563410000000001,9.00841,9.567309999999999L9.00805,9.567309999999999ZM8.77613,4.817021L4.706006,8.55489L4.706006,9.75897L5.94152,9.784510000000001L10.192029999999999,6.194380000000001L8.77613,4.817021ZM11.636510000000001,11.26944C11.83147,11.26803,11.9907,11.4193,11.99216,11.60731C11.99363,11.79532,11.83677,11.948879999999999,11.64181,11.950289999999999L4.70883,11.99999C4.514005,12.00122,4.354985,11.85,4.353524,11.66212C4.352063,11.47424,4.508713,11.320730000000001,4.7035350000000005,11.31914L11.636510000000001,11.26944Z" fill="currentColor"/></g></g></svg>;
const DeleteSvg = ({onClick}) => <svg onClick={onClick} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="16" height="16" viewBox="0 0 16 16"><defs><clipPath id="master_svg0_323_67526"><rect x="0" y="0" width="16" height="16" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_323_67526)"><g><path d="M7.1368009375,4.4248043125L8.8631009375,4.4248043125Q9.0358309375,4.4248043125,9.1579609375,4.3026703125Q9.280090937499999,4.1805363125,9.280090937499999,4.0078123125Q9.2801009375,3.8350883125,9.1579609375,3.7129543125Q9.0358309375,3.5908203125,8.8631009375,3.5908203125L7.1368009375,3.5908203125Q6.9640809375,3.5908203125,6.8419409375,3.7129543125Q6.7198109375,3.8350883125,6.7198109375,4.0078123125Q6.7198109375,4.1805363125,6.8419409375,4.3026703125Q6.9640809375,4.4248043125,7.1368009375,4.4248043125ZM4.7777179375,5.5037403125L4.7777179375,11.1288103125Q4.7777179375,11.6590603125,5.1526709375,12.0340003125Q5.5276209375,12.4089503125,6.0578609375,12.4089503125L9.9420409375,12.4089503125Q10.472280937499999,12.4089503125,10.847230937500001,12.0340003125Q11.222190937499999,11.6590603125,11.2221809375,11.1288103125L11.2221809375,6.3814803125Q11.2221809375,6.208750312499999,11.1000509375,6.0866203125Q10.9779209375,5.964490312500001,10.8051909375,5.964490312500001Q10.632470937499999,5.964490312500001,10.510330937500001,6.0866203125Q10.388200937499999,6.208750312499999,10.388200937499999,6.3814803125L10.388200937499999,11.1288103125Q10.388200937499999,11.3136103125,10.2575209375,11.4442903125Q10.1268509375,11.5749703125,9.9420409375,11.5749703125L6.0578609375,11.5749703125Q5.8730609375,11.5749703125,5.7423809375,11.4442903125Q5.6117009375,11.3136203125,5.6117009375,11.1288103125L5.6117009375,5.5037403125L11.5604509375,5.5037403125Q11.733170937499999,5.5037403125,11.8553109375,5.3816103125Q11.977440937499999,5.2594703124999995,11.977440937499999,5.0867503124999995Q11.977440937499999,4.9140303124999996,11.8553109375,4.7918903125Q11.733170937499999,4.6697603125,11.5604509375,4.6697603125L4.4394529375,4.6697603125Q4.2667289375,4.6697603125,4.1445949375,4.7918903125Q4.0224609375,4.9140303124999996,4.0224609375,5.0867503124999995Q4.0224609375,5.2594703124999995,4.1445949375,5.3816103125Q4.2667289375,5.5037403125,4.4394529375,5.5037403125L4.7777179375,5.5037403125ZM6.7198109375,7.2446303125L6.7198109375,9.8340803125Q6.7198109375,10.0068103125,6.8419409375,10.1289403125Q6.9640809375,10.2510703125,7.1368009375,10.2510703125Q7.3095209375,10.2510703125,7.4316609375,10.1289403125Q7.5537909375000005,10.0068103125,7.5537909375000005,9.8340803125L7.5537909375000005,7.2446303125Q7.5537909375000005,7.0719103125,7.4316609375,6.9497703125Q7.3095209375,6.8276403125,7.1368009375,6.8276403125Q6.9640809375,6.8276403125,6.8419409375,6.9497703125Q6.7198109375,7.0719103125,6.7198109375,7.2446303125ZM8.4461109375,7.2446303125L8.4461109375,9.8340803125Q8.4461109375,10.0068103125,8.5682409375,10.1289403125Q8.690380937499999,10.2510703125,8.8631009375,10.2510703125Q9.0358309375,10.2510703125,9.1579609375,10.1289403125Q9.280090937499999,10.0068103125,9.280090937499999,9.8340803125L9.280090937499999,7.2446303125Q9.2801009375,7.0719103125,9.1579609375,6.9497703125Q9.0358309375,6.8276403125,8.8631009375,6.8276403125Q8.690380937499999,6.8276403125,8.5682409375,6.9497703125Q8.4461109375,7.0719103125,8.4461109375,7.2446303125Z" fillRule="evenodd" fill="currentColor"/></g></g></svg>;

// 自定义 Hook
const useNodeOperations = (id, type, data) => {
    const { deleteElements } = useReactFlow();
    const { handleNodeEdit } = useContext(NodeContext);

    const onDelete = (e) => {
        e.stopPropagation();
        deleteElements({ nodes: [{ id }] });
    };

    const onEdit = (e) => {
        e.stopPropagation();
        handleNodeEdit({ id, type, data });
    };

    return { onDelete, onEdit };
};

// 自定义的节点组件
const StartNode = ({ id, data }) => {
    const { onDelete, onEdit } = useNodeOperations(id, 'start', data);

    const content = (
        <div className="popover-content">
            <div><span className="label">类型：</span>{getNodeTypeName('start')}</div>
            <div><span className="label">名称：</span>{data.label}</div>
            <div><span className="label">描述：</span>{data.description}</div>
            <div><span className="label">其他：</span>{data.other}</div>
        </div>
    );

    return (
        <div className="custom-node">
            <Popover
                title="节点信息"
                content={content}
                color="var(--bg-color26)"
                arrow={false}
                placement="rightTop"
                overlayClassName="nodeInfoPopover"
            >
                <div className="node-name">
                    <StartSvg/>
                    <span className="label">{data.label}</span>
                    <div className="operate">
                        <EditSvg onClick={onEdit}/>
                        <DeleteSvg onClick={onDelete}/>
                    </div>
                </div>
            </Popover>
            <Handle type="source" position={Position.Bottom} />
        </div>
    );
};

const TaskNode = ({ id, data }) => {
    const { onDelete, onEdit } = useNodeOperations(id, 'task', data);

    const content = (
        <div className="popover-content">
            <div><span className="label">类型：</span>{getNodeTypeName('task')}</div>
            <div><span className="label">名称：</span>{data.label}</div>
            <div><span className="label">描述：</span>{data.description}</div>
            <div><span className="label">其他：</span>{data.other}</div>
        </div>
    );

    return (
        <div className="custom-node">
            <Handle type="target" position={Position.Top} />
            <Popover
                title="节点信息"
                content={content}
                color="var(--bg-color26)"
                arrow={false}
                placement="rightTop"
                overlayClassName="nodeInfoPopover"
            >
                <div className="node-name">
                    <TaskSvg/>
                    <span className="label">{data.label}</span>
                    <div className="operate">
                        <EditSvg onClick={onEdit}/>
                        <DeleteSvg onClick={onDelete}/>
                    </div>
                </div>
            </Popover>
            <Handle type="source" position={Position.Bottom} />
        </div>
    );
};

const MergeNode = ({ id, data }) => {
    const { onDelete, onEdit } = useNodeOperations(id, 'merge', data);

    const content = (
        <div className="popover-content">
            <div><span className="label">类型：</span>{getNodeTypeName('merge')}</div>
            <div><span className="label">名称：</span>{data.label}</div>
            <div><span className="label">描述：</span>{data.description}</div>
            <div><span className="label">其他：</span>{data.other}</div>
        </div>
    );

    return (
        <div className="custom-node">
            <Handle type="target" position={Position.Top} />
            <Popover
                title="节点信息"
                content={content}
                color="var(--bg-color26)"
                arrow={false}
                placement="rightTop"
                overlayClassName="nodeInfoPopover"
            >
                <div className="node-name">
                    <MergeSvg/>
                    <span className="label">{data.label}</span>
                    <div className="operate">
                        <EditSvg onClick={onEdit}/>
                        <DeleteSvg onClick={onDelete}/>
                    </div>
                </div>
            </Popover>
            <Handle type="source" position={Position.Bottom} />
        </div>
    );
};

const BranchNode = ({ id, data }) => {
    const { onDelete, onEdit } = useNodeOperations(id, 'branch', data);

    const content = (
        <div className="popover-content">
            <div><span className="label">类型：</span>{getNodeTypeName('branch')}</div>
            <div><span className="label">名称：</span>{data.label}</div>
            <div><span className="label">描述：</span>{data.description}</div>
            <div><span className="label">其他：</span>{data.other}</div>
        </div>
    );

    return (
        <div className="custom-node">
            <Handle type="target" position={Position.Top} />
            <Popover
                title="节点信息"
                content={content}
                color="var(--bg-color26)"
                arrow={false}
                placement="rightTop"
                overlayClassName="nodeInfoPopover"
            >
                <div className="node-name">
                    <BranchSvg/>
                    <span className="label">{data.label}</span>
                    <div className="operate">
                        <EditSvg onClick={onEdit}/>
                        <DeleteSvg onClick={onDelete}/>
                    </div>
                </div>
            </Popover>
            <Handle type="source" position={Position.Bottom} />
        </div>
    );
};

const JudgeNode = ({ id, data }) => {
    const { onDelete, onEdit } = useNodeOperations(id, 'judge', data);

    const content = (
        <div className="popover-content">
            <div><span className="label">类型：</span>{getNodeTypeName('judge')}</div>
            <div><span className="label">名称：</span>{data.label}</div>
            <div><span className="label">描述：</span>{data.description}</div>
            <div><span className="label">其他：</span>{data.other}</div>
        </div>
    );

    return (
        <div className="custom-node">
            <Handle type="target" position={Position.Top} />
            <Popover
                title="节点信息"
                content={content}
                color="var(--bg-color26)"
                arrow={false}
                placement="rightTop"
                overlayClassName="nodeInfoPopover"
            >
                <div className="node-name">
                    <JudgeSvg/>
                    <span className="label">{data.label}</span>
                    <div className="operate">
                        <EditSvg onClick={onEdit}/>
                        <DeleteSvg onClick={onDelete}/>
                    </div>
                </div>
            </Popover>
            <Handle type="source" position={Position.Bottom}/>
        </div>
    );
};

const EndNode = ({ id, data }) => {
    const { onDelete, onEdit } = useNodeOperations(id, 'end', data);

    const content = (
        <div className="popover-content">
            <div><span className="label">类型：</span>{getNodeTypeName('end')}</div>
            <div><span className="label">名称：</span>{data.label}</div>
            <div><span className="label">描述：</span>{data.description}</div>
            <div><span className="label">其他：</span>{data.other}</div>
        </div>
    );

    return (
        <div className="custom-node">
            <Handle type="target" position={Position.Top} />
            <Popover
                title="节点信息"
                content={content}
                color="var(--bg-color26)"
                arrow={false}
                placement="rightTop"
                overlayClassName="nodeInfoPopover"
            >
                <div className="node-name">
                    <EndSvg/>
                    <span className="label">{data.label}</span>
                    <div className="operate">
                        <EditSvg onClick={onEdit}/>
                        <DeleteSvg onClick={onDelete}/>
                    </div>
                </div>
            </Popover>
        </div>
    );
};

const nodeTypes = {
    start: StartNode,
    task: TaskNode,
    merge: MergeNode,
    branch: BranchNode,
    judge: JudgeNode,
    end: EndNode
};

const getNodeTypeName = (type) => {
    switch (type) {
        case 'start': return '开始节点' ;
        case 'task': return '任务节点';
        case 'merge': return '合并节点';
        case 'branch': return '分支节点';
        case 'judge': return '判断节点';
        case 'end': return '结束节点';
        default: return '新节点';
    }
};

const getLayoutedElements = (nodes, edges, direction) => {
    const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
    g.setGraph({ rankdir: direction });

    edges.forEach((edge) => g.setEdge(edge.source, edge.target));
    nodes.forEach((node) =>
        g.setNode(node.id, {
            ...node,
            width: node.measured?.width ?? 180,
            height: node.measured?.height ?? 28,
        }),
    );

    Dagre.layout(g);

    return nodes.map((node) => {
        const nodeWithPosition = g.node(node.id);
        const x = nodeWithPosition.x - nodeWithPosition.width / 2;
        const y = nodeWithPosition.y - nodeWithPosition.height / 2;

        return { ...node, position: { x, y } };
    });
};

let timeout;

const FlowEditor = ({updateFlow,initialNodes,initialEdges}) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const reactFlowInstance = useReactFlow();

    // 添加抽屉相关状态
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [selectedNode, setSelectedNode] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        if(initialNodes) {
            setNodes(getLayoutedElements(initialNodes, initialEdges, 'TB'));
        }
    }, []);
    useEffect(() => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            updateFlow(nodes, edges);
        }, 300);
    }, [nodes, edges]);

    // 处理节点编辑
    const handleNodeEdit = (nodeData) => {
        setSelectedNode(nodeData);
        form.setFieldsValue({
            type: nodeData.type,
            name: nodeData.data.label,
            description: nodeData.data.description || '',
            other: nodeData.data.other || ''
        });
        setDrawerVisible(true);
    };

    // 修改表单提交处理方法
    const handleDrawerSubmit = () => {
        form.validateFields().then(values => {
            const updatedNodes = nodes.map(node => {
                if (node.id === selectedNode.id) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            label: values.name,
                            description: values.description,
                            other: values.other
                        }
                    };
                }
                return node;
            });
            setNodes(updatedNodes);
            setDrawerVisible(false);
            form.resetFields(); // 重置表单
        });
    };

    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge(params, eds)),
        [setEdges],
    );

    const onDragStart = (event, nodeType) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow');

            if (typeof type === 'undefined' || !type) {
                return;
            }

            const position = reactFlowInstance.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newNode = {
                id: `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                type,
                position,
                data: { label: getNodeTypeName(type) },
            };
            setNodes((nds) => nds.concat(newNode));
        },
        [reactFlowInstance, setNodes],
    );

    const nodeLayout = () =>{
        setNodes(getLayoutedElements(nodes, edges, 'TB'));
    };

    return (
        <NodeContext.Provider value={{ handleNodeEdit }}>
            <div className="workflowEditor">
                <div className="workflowEditorLeft">
                    <div className="node" onDragStart={(event) => onDragStart(event, 'start')} draggable>
                        <StartSvg/>
                        <span>开始节点</span>
                        <DragSvg/>
                    </div>
                    <div className="node" onDragStart={(event) => onDragStart(event, 'task')} draggable>
                        <TaskSvg/>
                        <span>任务节点</span>
                        <DragSvg/>
                    </div>
                    <div className="node" onDragStart={(event) => onDragStart(event, 'merge')} draggable>
                        <MergeSvg/>
                        <span>合并节点</span>
                        <DragSvg/>
                    </div>
                    <div className="node" onDragStart={(event) => onDragStart(event, 'branch')} draggable>
                        <BranchSvg/>
                        <span>分支节点</span>
                        <DragSvg/>
                    </div>
                    <div className="node" onDragStart={(event) => onDragStart(event, 'judge')} draggable>
                        <JudgeSvg/>
                        <span>判断节点</span>
                        <DragSvg/>
                    </div>
                    <div className="node" onDragStart={(event) => onDragStart(event, 'end')} draggable>
                        <EndSvg/>
                        <span>结束节点</span>
                        <DragSvg/>
                    </div>
                </div>
                <div className="reactflow-wrapper" onDragOver={onDragOver} onDrop={onDrop}>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        nodeTypes={nodeTypes}
                        fitView
                    >
                        <Controls position="top-left"/>
                        <Panel className="nodeLayout">
                            <Tooltip title="整理节点">
                                <svg onClick={nodeLayout} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="24" height="24" viewBox="0 0 24 24"><defs><clipPath id="master_svg0_323_67418"><rect x="0" y="0" width="24" height="24" rx="4"/></clipPath></defs><g clipPath="url(#master_svg0_323_67418)"><rect x="0" y="0" width="24" height="24" rx="4" fill="var(--bg-color41)"/><g><path d="M14.40416375,15.730125439453126C14.72609375,15.730125439453126,14.98699375,15.991025439453125,14.98699375,16.312925439453124L14.98699375,18.877425439453127C14.98699375,19.199225439453123,14.72609375,19.460225439453126,14.40416375,19.460225439453126L9.74154375,19.460225439453126C9.41965375,19.460225439453126,9.15871375,19.199225439453123,9.15871375,18.877425439453127L9.15871375,16.312925439453124C9.15871375,15.991025439453125,9.41965375,15.730125439453126,9.74154375,15.730125439453126L14.40416375,15.730125439453126ZM8.57588375,5.472349439453125L8.57588375,6.808775439453125L5.66408375,6.808775439453125L5.66408375,17.501925439453125L6.89967375,17.501925439453125L6.90025375,16.895725439453123L8.211623750000001,18.138925439453125L6.90025375,19.382725439453125L6.89967375,18.838325439453126L5.66175375,18.838325439453126L5.66116375,18.838325439453126C5.05284075,18.838425439453125,4.54676125,18.370625439453125,4.49900796,17.764225439453124L4.49900796,17.760125439453127L4.49609375,17.672725439453124L4.49609375,6.638005439453125L4.49609375,6.637425439453125C4.4960415022,6.029095439453125,4.96379775,5.523017439453125,5.5702437499999995,5.4752634394531245L5.57432375,5.4752634394531245L5.66175375,5.472349439453125L8.57588375,5.472349439453125ZM17.09969375,4.928571439453125L17.09969375,5.472349439453125L18.33879375,5.472349439453125C18.94719375,5.472297439453125,19.45319375,5.9400554394531255,19.50099375,6.546505439453124L19.50099375,6.550585439453124L19.50389375,6.638005439453125L19.50389375,17.673225439453127C19.50399375,18.281625439453123,19.036193750000002,18.787625439453123,18.42979375,18.835425439453125L18.42569375,18.835425439453125L18.33829375,18.838325439453126L15.56919375,18.838325439453126L15.56919375,17.501925439453125L18.33589375,17.501925439453125L18.33589375,6.808775439453125L17.09969375,6.808775439453125L17.09969375,7.414915439453125L15.78839375,6.171745439453125L17.09969375,4.928571439453125ZM13.82075375,16.895725439453123L10.32378375,16.895725439453123L10.32378375,18.294525439453125L13.82075375,18.294525439453125L13.82075375,16.895725439453123ZM14.40416375,10.134975439453125C14.72609375,10.134975439453125,14.98699375,10.395915439453125,14.98699375,10.717795439453125L14.98699375,13.282245439453124C14.98699375,13.604125439453124,14.72609375,13.865065439453126,14.40416375,13.865065439453126L9.74154375,13.865065439453126C9.41965375,13.865065439453126,9.15871375,13.604125439453124,9.15871375,13.282245439453124L9.15871375,10.717795439453125C9.15871375,10.395915439453125,9.41965375,10.134975439453125,9.74154375,10.134975439453125L14.40416375,10.134975439453125ZM13.82075375,11.300045439453125L10.32378375,11.300045439453125L10.32378375,12.699415439453125L13.82075375,12.699415439453125L13.82075375,11.300045439453125ZM14.40416375,4.539825439453125C14.72609375,4.539825439453125,14.98699375,4.800766439453125,14.98699375,5.122653439453125L14.98699375,7.687095439453125C14.98699375,8.008985439453125,14.72609375,8.269925439453125,14.40416375,8.269925439453125L9.74154375,8.269925439453125C9.41965375,8.269925439453125,9.15871375,8.008985439453125,9.15871375,7.687095439453125L9.15871375,5.122653439453125C9.15871375,4.800766439453125,9.41965375,4.539825439453125,9.74154375,4.539825439453125L14.40416375,4.539825439453125ZM13.82075375,5.705485439453125L10.32378375,5.705485439453125L10.32378375,7.104265439453124L13.82075375,7.104265439453124L13.82075375,5.705485439453125Z" fill="currentColor"/></g></g></svg>
                            </Tooltip>
                        </Panel>
                    </ReactFlow>
                </div>

                {/* 添加编辑抽屉 */}
                <Drawer
                    title="编辑节点"
                    placement="right"
                    width={400}
                    onClose={() => {
                        setDrawerVisible(false);
                        form.resetFields();
                    }}
                    open={drawerVisible}
                    destroyOnClose
                    footer={
                        <>
                            <div className="close" onClick={() => {setDrawerVisible(false);form.resetFields();}}>取消</div>
                            <div className="ok" onClick={handleDrawerSubmit}>确定</div>
                        </>
                    }
                >
                    <Form
                        form={form}
                        layout="vertical"
                        initialValues={{
                            type: selectedNode?.type,
                            name: selectedNode?.data?.label,
                            description: selectedNode?.data?.description || '',
                            other: selectedNode?.data?.other || ''
                        }}
                    >
                        <Form.Item
                            name="type"
                            label="类型"
                        >
                            <Select disabled>
                                <Select.Option value="start">开始节点</Select.Option>
                                <Select.Option value="task">任务节点</Select.Option>
                                <Select.Option value="merge">合并节点</Select.Option>
                                <Select.Option value="branch">分支节点</Select.Option>
                                <Select.Option value="judge">判断节点</Select.Option>
                                <Select.Option value="end">结束节点</Select.Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="name"
                            label="名称"
                            rules={[{ required: true, message: '请输入节点名称' }]}
                        >
                            <Input placeholder="请输入节点名称" />
                        </Form.Item>

                        <Form.Item
                            name="description"
                            label="描述"
                        >
                            <Input.TextArea
                                placeholder="请输入节点描述"
                                rows={4}
                            />
                        </Form.Item>

                        <Form.Item
                            name="other"
                            label="其他"
                        >
                            <Input placeholder="请输入其他信息" />
                        </Form.Item>
                    </Form>
                </Drawer>
            </div>
        </NodeContext.Provider>
    );
};

const WorkflowEditor = ({updateFlow,initialNodes,initialEdges}) => (
    <ReactFlowProvider>
        <FlowEditor updateFlow={updateFlow} initialNodes={initialNodes} initialEdges={initialEdges}/>
    </ReactFlowProvider>
);

export default WorkflowEditor;
