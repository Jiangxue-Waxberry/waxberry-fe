import React, { Component } from 'react';
import ReactDOM from 'react-dom';


import { CodeEditor,isTextFile } from '@components/CodeEditor';
import CustomUpload from "@components/CustomUpload";

import axios from 'axios';
import moment from 'moment';

import { Input,Select,Switch,message,Cascader,Dropdown,Spin } from 'antd';
import { PlusOutlined,CloseOutlined,HeartOutlined,StarOutlined } from '@ant-design/icons';
import { withTranslation } from 'react-i18next';

import AiSvg from '../img/ai.svg';
import DefaultPng from '../img/default.png';
import CardDefaultPng from '../img/cardDefault.png';
import CardDefaultPng1 from '../img/cardDefault1.png';
import WarningSvg from '../img/warning.svg';
import Empty1Png from '../img/empty1.png';
import Empty2Png from '../img/empty2.png';
import AppstoreSvg from '../img/appstore.svg';

import './myWaxberry.scss';
import RunSvg from "../img/run.svg";

import appIcon from '@/pages/waxberryAi/img/appIcon.png'
import LargeModelPng from '@/pages/waxberryAi/components/menu/img/largeModel.png';
import intelligence  from '@/pages/waxberryAi/img/intelligence.png'
import smallModuleImg from '@/pages/waxberryAi/img/smallModuleIcon.png'
import PromptWordList from '@/pages/waxberryAi/industrialPromptWords/industrialPromptWords'
import duplicateIcon from '@/pages/waxberryAi/img/duplicateIcon.svg'

const AppIcon=()=> <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="14" height="14" viewBox="0 0 14 14"><defs><clipPath id="master_svg0_228_42520"><rect x="0" y="0" width="14" height="14" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_228_42520)"><g><path d="M5.42795375,6.7450584375L2.36232175,6.7450584375C1.88183575,6.7450584375,1.49609375,6.3593184375,1.49609375,5.8788284375L1.49609375,2.8131984375C1.49609375,2.3394754375,1.8886037500000001,1.9469654375,2.36232175,1.9469654375L5.42795375,1.9469654375C5.90844375,1.9469654375,6.29418375,2.3327074375,6.29418375,2.8131984375L6.29418375,5.8788284375C6.29418375,6.3593184375,5.90844375,6.7450584375,5.42795375,6.7450584375ZM5.42795375,12.5040984375L2.36232175,12.5040984375C1.88183575,12.5040984375,1.49609375,12.1183984375,1.49609375,11.6378984375L1.49609375,8.5722584375C1.49609375,8.0917684375,1.88183575,7.7060284375,2.36232175,7.7060284375L5.42795375,7.7060284375C5.90844375,7.7060284375,6.29418375,8.0917684375,6.29418375,8.5722584375L6.29418375,11.6378984375C6.29418375,12.1115984375,5.90844375,12.5040984375,5.42795375,12.5040984375ZM11.18701375,12.5040984375L8.12138375,12.5040984375C7.64089375,12.5040984375,7.25515375,12.1183984375,7.25515375,11.6378984375L7.25515375,8.5722584375C7.25515375,8.0917684375,7.64089375,7.7060284375,8.12138375,7.7060284375L11.18701375,7.7060284375C11.66749375,7.7060284375,12.05329375,8.0917684375,12.05329375,8.5722584375L12.05329375,11.6378984375C12.05329375,12.1115984375,11.66069375,12.5040984375,11.18701375,12.5040984375ZM12.26299375,3.7403284375L10.25988375,1.7371764375C9.92151375,1.3988059375,9.37335375,1.3988059375,9.03498375,1.7371764375L7.03183375,3.7403284375C6.69346375,4.0786984375,6.69346375,4.6268584375,7.03183375,4.9652284375L9.03498375,6.9683784375C9.37335375,7.3067484375,9.92151375,7.3067484375,10.25988375,6.9683784375L12.26299375,4.9652284375C12.60139375,4.6200884375,12.60139375,4.0719284375,12.26299375,3.7403284375ZM9.82677375,6.0412484375C9.73202375,6.1359884375,9.56960375,6.1359884375,9.47486375,6.0412484375L7.95896375,4.5253484375C7.86422375,4.4306084375,7.86422375,4.2681884375,7.95896375,4.1734384375L9.47486375,2.6575384375C9.56960375,2.5627984374999997,9.73202375,2.5627984374999997,9.82677375,2.6575384375L11.34266375,4.1734384375C11.43741375,4.2681884375,11.43741375,4.4306084375,11.34266375,4.5253484375L9.82677375,6.0412484375Z" fill="currentColor"/></g></g></svg>
const IntelligenceIcon=()=><svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="14" height="14" viewBox="0 0 14 14"><defs><clipPath id="master_svg0_228_40372"><rect x="0" y="0" width="14" height="14" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_228_40372)"><g><path d="M8.84917,5.93081L9.52331,7.72197C9.61961,8.00479,9.81222,8.19334,10.101130000000001,8.28761L11.93092,8.94751C12.17168,9.04178,12.31614,9.3246,12.21984,9.56028C12.17168,9.70168,12.07538,9.79596,11.93092,9.84309L10.101130000000001,10.50299C9.81222,10.59727,9.61961,10.78581,9.52331,11.0686L8.84917,12.8127C8.75287,13.0483,8.46396,13.1897,8.223189999999999,13.0955C8.07874,13.0483,7.98243,12.9541,7.93428,12.8127L7.26015,11.0215C7.16384,10.73868,6.97123,10.55013,6.68232,10.45586L4.90069,9.79596C4.65992,9.70168,4.5154700000000005,9.41887,4.61177,9.18319C4.65992,9.04178,4.75623,8.94751,4.90069,8.90037L6.73047,8.24047C7.01939,8.1462,7.212,7.95765,7.3083,7.67484L7.98243,5.88367C8.07874,5.64799,8.367650000000001,5.50658,8.60841,5.60086C8.70472,5.69513,8.801020000000001,5.7894,8.84917,5.93081ZM5.14145,1.122942L5.52667,2.1128C5.57482,2.2542,5.71927,2.39561,5.86373,2.44275L6.87493,2.81984C7.01939,2.8669700000000002,7.11569,3.00838,7.06754,3.14979C7.01939,3.24406,6.97123,3.2912,6.87493,3.33833L5.815580000000001,3.66828C5.67112,3.71542,5.52666,3.85683,5.47851,3.99823L5.09329,4.98809C5.04514,5.1295,4.9006799999999995,5.22377,4.75623,5.17663C4.65992,5.1295,4.61177,5.08236,4.56362,4.98809L4.1784,3.99823C4.13025,3.85683,3.9857899999999997,3.71542,3.84133,3.66828L2.830135,3.29119C2.6856783,3.24406,2.5893733,3.10265,2.6375262,2.96124C2.6856783,2.8669700000000002,2.733831,2.81984,2.830135,2.7727L3.84133,2.39561C3.9857899999999997,2.34848,4.13025,2.20707,4.1784,2.0656600000000003L4.56362,1.075805C4.61177,0.9343975,4.75623,0.8401253,4.9006799999999995,0.8872618C5.04514,0.981534,5.09329,1.02867,5.14145,1.122942Z" fill="currentColor"/></g></g></svg>
const SmallModuleIcon=()=> <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="14" height="14" viewBox="0 0 14 14"><defs><clipPath id="master_svg0_228_41378"><rect x="0" y="0" width="14" height="14" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_228_41378)"><g><path d="M6.290859375,13.74637578125C6.485159375,13.85867578125,6.705179375,13.91897578125,6.929609375,13.92137578125C7.154039375,13.91897578125,7.374059375,13.85867578125,7.568359375,13.74637578125L12.485909375,10.93757578125C12.879909375,10.71007578125,13.123209375,10.29007578125,13.124609375,9.83507578125L13.124609375,4.20882578125C13.114409375,3.74460578125,12.853109375,3.32248578125,12.442109375,3.10632578125L7.568359375,0.28882878125C7.173099375,0.06062488125,6.686119375,0.06062488125,6.290859375,0.28882878125L1.425859375,3.10632578125C1.031787375,3.33384578125,0.788480965,3.75379578125,0.787109375,4.20882578125L0.787109375,9.83507578125C0.788428635,10.28787578125,1.027702375,10.70657578125,1.417109375,10.93757578125L6.290859375,13.74637578125ZM3.997759375,5.90196578125Q3.845559375,6.05146578125,3.648119375,6.13222578125Q3.450669375,6.21298578125,3.237339375,6.21298578125Q3.184029375,6.21298578125,3.130979375,6.20775578125Q3.077919375,6.20253578125,3.025629375,6.19212578125Q2.973339375,6.18172578125,2.922329375,6.16624578125Q2.871309375,6.15076578125,2.822049375,6.13036578125Q2.772799375,6.10996578125,2.725779375,6.08482578125Q2.6787593750000003,6.05968578125,2.634439375,6.03006578125Q2.590109375,6.00044578125,2.548899375,5.96661578125Q2.507689375,5.93278578125,2.469989375,5.89508578125Q2.432289375,5.85738578125,2.398469375,5.81616578125Q2.364649375,5.77494578125,2.335029375,5.73061578125Q2.305409375,5.68627578125,2.280279375,5.63925578125Q2.2551493750000002,5.59222578125,2.234739375,5.54296578125Q2.2143393749999998,5.49370578125,2.198869375,5.44267578125Q2.183389375,5.39165578125,2.1729893750000002,5.33935578125Q2.162589375,5.28705578125,2.157359375,5.23399578125Q2.152139375,5.18093578125,2.152139375,5.12761578125Q2.152139375,5.07428578125,2.157359375,5.02122578125Q2.162589375,4.96816578125,2.1729893750000002,4.91586578125Q2.183389375,4.86356578125,2.198869375,4.81254578125Q2.2143393749999998,4.76151578125,2.234739375,4.71225578125Q2.2551493750000002,4.66299578125,2.280279375,4.61596578125Q2.305409375,4.56894578125,2.335029375,4.52460578125Q2.364649375,4.48027578125,2.398469375,4.43905578125Q2.432289375,4.39783578125,2.469989375,4.36013578125Q2.507689375,4.32243578125,2.548899375,4.28860578125Q2.590109375,4.25477578125,2.634439375,4.22515578125Q2.6787593750000003,4.19553578125,2.725779375,4.17039578125Q2.772799375,4.14526578125,2.822049375,4.12485578125Q2.871309375,4.10444578125,2.922329375,4.088975781249999Q2.973339375,4.07349578125,3.025629375,4.06309578125Q3.077919375,4.05268578125,3.130979375,4.047465781250001Q3.184029375,4.04223578125,3.237339375,4.04223578125Q3.341979375,4.04223578125,3.444679375,4.06222578125Q3.547379375,4.08222578125,3.644369375,4.12147578125Q3.741359375,4.16072578125,3.829069375,4.21778578125Q3.916779375,4.27484578125,3.991969375,4.34760578125Q4.067159375,4.42037578125,4.127069375,4.50617578125Q4.186979375,4.59197578125,4.229389375,4.68763578125Q4.2717993750000005,4.78329578125,4.295159375,4.88530578125Q4.318519375,4.98730578125,4.3219593750000005,5.09189578125L6.932629375,6.09905578125L9.538179375,5.07922578125Q9.542799375,4.97550578125,9.566999375,4.87455578125Q9.591199375,4.77359578125,9.634109375,4.67905578125Q9.677019375,4.58452578125,9.737069375,4.49983578125Q9.797129375,4.41515578125,9.872149375,4.34339578125Q9.947179375,4.27163578125,10.034449375,4.21540578125Q10.121719375,4.15917578125,10.218069375,4.12051578125Q10.314429375,4.08185578125,10.416359375,4.06216578125Q10.518289375,4.042475781249999,10.622109375,4.042475781249999Q10.675409375,4.042475781249999,10.728459375,4.04770578125Q10.781499375,4.05292578125,10.833809375,4.0633257812500005Q10.886109375,4.073725781249999,10.937109375,4.08919578125Q10.988109375,4.10467578125,11.037309375,4.12507578125Q11.086609375,4.14546578125,11.133609375,4.17059578125Q11.180609375,4.19572578125,11.224909375,4.22533578125Q11.269209375,4.25494578125,11.310409375,4.28876578125Q11.351609375,4.32257578125,11.389309375,4.36026578125Q11.427009375,4.39795578125,11.460809375,4.43916578125Q11.494609375,4.48036578125,11.524209375,4.52468578125Q11.553909375,4.56900578125,11.579009375,4.61601578125Q11.604109375,4.66302578125,11.624509375,4.71226578125Q11.644909375,4.76151578125,11.660409375,4.81252578125Q11.675909375,4.86352578125,11.686309375,4.91580578125Q11.696709375,4.96808578125,11.701909375,5.02113578125Q11.707109375,5.07417578125,11.707109375,5.12747578125Q11.707109375,5.18078578125,11.701909375,5.23382578125Q11.696709375,5.28687578125,11.686309375,5.33915578125Q11.675909375,5.39143578125,11.660409375,5.44243578125Q11.644909375,5.49344578125,11.624509375,5.54269578125Q11.604109375,5.59193578125,11.579009375,5.63894578125Q11.553909375,5.68595578125,11.524209375,5.73027578125Q11.494609375,5.77459578125,11.460809375,5.81579578125Q11.427009375,5.85699578125,11.389309375,5.89469578125Q11.351609375,5.93238578125,11.310409375,5.96619578125Q11.269209375,6.00001578125,11.224909375,6.02962578125Q11.180609375,6.05923578125,11.133609375,6.08436578125Q11.086609375,6.10949578125,11.037309375,6.12988578125Q10.988109375,6.15028578125,10.937109375,6.16575578125Q10.886109375,6.18123578125,10.833809375,6.19163578125Q10.781499375,6.20203578125,10.728459375,6.20725578125Q10.675409375,6.21247578125,10.622109375,6.21247578125Q10.402589375,6.21247578125,10.200329375,6.12714578125Q9.998079375,6.04180578125,9.844899375,5.88455578125L7.306639375,6.90472578125L7.306639375,10.25997578125Q7.388869375,10.28577578125,7.466019375,10.32417578125Q7.543159375,10.36257578125,7.613279375,10.41267578125Q7.683399375,10.46277578125,7.744739375,10.52327578125Q7.806079375,10.58377578125,7.857099375,10.65327578125Q7.908129375,10.72267578125,7.947559375,10.79937578125Q7.986989375,10.87597578125,8.013839375,10.95787578125Q8.040689375,11.03977578125,8.054279375,11.12487578125Q8.067879375,11.20997578125,8.067879375,11.29617578125Q8.067879375,11.34957578125,8.062649375,11.40257578125Q8.057419375,11.45567578125,8.047019375,11.50797578125Q8.036619375,11.56037578125,8.021139375,11.61137578125Q8.005659375,11.66237578125,7.985249375,11.71167578125Q7.964849375,11.76097578125,7.939709375,11.80797578125Q7.914569375,11.85507578125,7.884949375,11.89937578125Q7.855329375,11.94377578125,7.821499375,11.98497578125Q7.787669375,12.02617578125,7.749959375,12.06397578125Q7.712259375,12.10167578125,7.671039375,12.13547578125Q7.629819375,12.16937578125,7.585479375,12.19897578125Q7.541149375,12.22857578125,7.494119375,12.25377578125Q7.447089375,12.27887578125,7.397829375,12.29927578125Q7.348569375,12.31967578125,7.297539375,12.33517578125Q7.246509375,12.35067578125,7.194209375,12.36107578125Q7.141919375,12.37147578125,7.088849375,12.37667578125Q7.035779375,12.38197578125,6.982459375,12.38197578125Q6.929139375,12.38197578125,6.876069375,12.37667578125Q6.823009375,12.37147578125,6.770709375,12.36107578125Q6.718409375,12.35067578125,6.667379375,12.33517578125Q6.616359375,12.31967578125,6.567089375,12.29927578125Q6.517829375,12.27887578125,6.470799375,12.25377578125Q6.423769375,12.22857578125,6.379439375,12.19897578125Q6.335099375,12.16937578125,6.293879375,12.13547578125Q6.252659375,12.10167578125,6.214959375,12.06397578125Q6.177249375,12.02617578125,6.143429375,11.98497578125Q6.109599375,11.94377578125,6.079969375,11.89937578125Q6.050349375,11.85507578125,6.025209375,11.80797578125Q6.000079375,11.76097578125,5.979669375,11.71167578125Q5.959259375,11.66237578125,5.943789375,11.61137578125Q5.928309375,11.56037578125,5.917899375,11.50797578125Q5.907499375,11.45567578125,5.902269375,11.40257578125Q5.897049375,11.34957578125,5.897049375,11.29617578125Q5.897049375,11.15447578125,5.933429375,11.01747578125Q5.969809375,10.88047578125,6.040129375,10.75737578125Q6.110449375,10.63437578125,6.209989375,10.53347578125Q6.309539375,10.43257578125,6.431639375,10.36067578125L6.431639375,6.89652578125L3.997759375,5.90196578125Z" fillRule="evenodd" fill="currentColor"/></g></g></svg>

const language = localStorage.getItem('language') || 'zh';
if(language === "zh"){
    moment.locale('zh-cn');
}else{
    moment.locale('en-cn');
}
const TextArea = Input.TextArea;
function showFullScreenMask(imageSrc, text = "正在复制中，请稍后 ~") {
    // 遮罩容器
    const mask = document.createElement("div");
    mask.style.position = "fixed";
    mask.style.top = 0;
    mask.style.left = 0;
    mask.style.width = "100vw";
    mask.style.height = "100vh";
    mask.style.backgroundColor = "#00000073";
    mask.style.zIndex = 9999;
    mask.style.display = "flex";
    mask.style.flexDirection = "column";
    mask.style.alignItems = "center";
    mask.style.justifyContent = "center";

    // 图片
    const img = document.createElement("img");
    img.src = imageSrc;
    img.style.width = "82px";
    img.style.height = "82px";
    img.style.marginBottom = "16px";

    // 文本
    const message = document.createElement("div");
    message.innerText = text;
    message.style.color = "#fff";
    message.style.fontSize = "24px";

    // 拼装
    mask.appendChild(img);
    mask.appendChild(message);
    document.body.appendChild(mask);

    // 提供关闭方法
    return () => mask.remove();
}

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showWaxberryModal: false,
            waxberryObj: {},
            selectFolder: {id:""},
            waxberryList: [],
            folderList: [],
            agentMenuList: [],
            waxberryType: "0",
            isAscending: true,
            filterType: '',
            iconSpinning1: false,
            iconSpinning2: false,
            promptWordCreateButton:()=>{},
            promptWordSortButton:()=>{},
            promptWordCount:0,
            disableCreateFolder:false,
            detailSpinning: false,
            userAgentNum: {
                total: 0,
                create: 0
            }
        };
    }

    componentWillMount() {
        this.getWaxberryList();
        this.getFolderList();
        this.getAgentMenuList();
        this.getUserAgentNum();
    }

    componentDidMount() {

    }

    getWaxberryList() {
        let waxberryType = this.state.waxberryType;
        let selectFolder = this.state.selectFolder;
        let filterType = this.state.filterType;
        let isAscending = this.state.isAscending;
        let url;
        if(waxberryType === "0"){
            //我开发的
            url = `${globalInitConfig.REACT_APP_API_BASE_URL}mgr/agent/agent/findAllAgentByClassificationId?cid=${selectFolder.id}&type=${filterType}&isAscending=${isAscending}&pageNo=0&pageSize=1000`;
        }else if(waxberryType === "1") {
            //我的应用
            url = `${globalInitConfig.REACT_APP_API_BASE_URL}mgr/agent/agent/findAgentByRunAgent?classificationId=${selectFolder.id}&type=${filterType}&isAscending=${isAscending}&pageNo=0&pageSize=1000`;
        }else if(waxberryType === "2") {
            //我的喜欢
            url = `${globalInitConfig.REACT_APP_API_BASE_URL}mgr/agent/agentLike/findAgentLikeList?pageNo=0&pageSize=1000&type=${filterType}&isAscending=${isAscending}`;
        }else if(waxberryType === "3") {
            //我的收藏
            url = `${globalInitConfig.REACT_APP_API_BASE_URL}mgr/agent/agentCollect/findAgentCollectList?pageNo=0&pageSize=1000&type=${filterType}&isAscending=${isAscending}`;
        }
        if(url)
            axios.get(url).then(res=>{
                if(res.data.code === 200){
                    this.setState({
                        waxberryList: res.data.data.content
                    });
                }else  this.setState({
                    waxberryList:[]
                });
            });
    }

    getFolderList() {
        axios.get(`${globalInitConfig.REACT_APP_API_BASE_URL}mgr/agent/agentFolder/findAllAgentFolderByCreatorId?type=${this.state.waxberryType}`).then(res=>{
            if(res.data.code === 200){
                this.setState({
                    folderList: res.data.data,
                });
            }
        });
    }

    getUserAgentNum() {
        axios.get(`${globalInitConfig.REACT_APP_API_BASE_URL}mgr/agent/agent/userAgentNum`).then(res=>{
            if(res.data.code === 200){
                this.setState({
                    userAgentNum: res.data.data,
                });
            }
        });
    }

    getAgentMenuList() {
        axios.get(`${globalInitConfig.REACT_APP_API_BASE_URL}mgr/agent/agentClassification/findAllAgentClassification`).then(res=>{
            if(res.data.code === 200){
                let data = res.data.data;
                this.convertTree(data);
                this.setState({
                    agentMenuList: data
                });
            }
        });
    }

    convertTree(data){
        data.forEach(item=>{
            item.value = item.id;
            item.label = item.name;
            if(item.children){
                this.convertTree(item.children);
            }
        })
    }

    createWaxberry(){
        let waxberryType = this.state.waxberryType;
        if(waxberryType === "0"){
            window.open(`/waxberry`,"_self");
        }else{
            window.open(`/waxberryMarket`,"_self");
        }
    }

    hideWaxberryModal(){
        this.setState({
            showWaxberryModal: false
        })
    }

    waxberryModalOk(){
        let waxberryObj = this.state.waxberryObj;
        if(!waxberryObj.name || !waxberryObj.discription || !waxberryObj.groupId) {
            message.warning(this.props.t('message.pleaseCompleteInformationProceeding'));
            return;
        }
        let fileId = "";
        let fileName = "";
        waxberryObj.fileList && waxberryObj.fileList.forEach((item,index)=>{
            let obj = item.response.data;
            if(index>0){
                fileId += ",";
                fileName += ",";
            }
            fileId += obj.id;
            fileName += obj.fileName;
        });
        waxberryObj.fileId = fileId;
        waxberryObj.fileName = fileName;
        if(this.state.showWaxberryModal === "publish"){
            waxberryObj.status = 1;
        }
        this.setWaxberryDetail(waxberryObj);
        axios.post(globalInitConfig.REACT_APP_API_BASE_URL + 'mgr/agent/agent/updateAgent', waxberryObj).then(res => {
            const data = res.data;
            if (data.code === 200) {
                this.hideWaxberryModal();
                this.getWaxberryList();
                message.success(this.props.t('operationSuccessful'));
            } else {
                message.error(data.message);
            }
        });
    }

    publishModalOk(flag){
        let waxberryObj = this.state.waxberryObj;

        //仅作校验
        if (flag) {
            if(!waxberryObj.name || !waxberryObj.discription || !waxberryObj.groupId) {
                message.warning(this.props.t('message.pleaseCompleteInformationProceeding'));
                return;
            }
            this.setState({
                showWaxberryModal: false,
                showPublishModal: true
            });
            return;
        }

        let fileId = "";
        let fileName = "";
        waxberryObj.fileList && waxberryObj.fileList.forEach((item,index)=>{
            let obj = item.response.data;
            if(index>0){
                fileId += ",";
                fileName += ",";
            }
            fileId += obj.id;
            fileName += obj.fileName;
        });
        waxberryObj.fileId = fileId;
        waxberryObj.fileName = fileName;
        waxberryObj.status = 1;
        this.setWaxberryDetail(waxberryObj);
        axios.post(globalInitConfig.REACT_APP_API_BASE_URL + 'mgr/agent/agent/updateAgent', waxberryObj).then(res => {
            const data = res.data;
            if (data.code === 200) {
                this.setState({
                    showPublishModal: false
                });
                this.getWaxberryList();
                message.success(this.props.t('operationSuccessful'));
            } else {
                message.error(data.message);
            }
        });
    }

    waxberryObjChange(key,value){
        let waxberryObj = this.state.waxberryObj;
        waxberryObj[key] = value;
        this.setState({
            waxberryObj
        });
    }

    selectFolder(obj) {
        this.setState({
            selectFolder: obj
        },()=>{
            this.getWaxberryList();
        })
    }

    addFolder(){

        const set=new Set(this.state.folderList.map(item=>item.name||item.changeName))
        let count=1
        const validateRepeat=(name)=>{
            let unique=name
            if(set.has(name)){
                name=this.props.t('myWaxberry.createNewFolder')+`(${count})`
                count++
                unique= validateRepeat(name)
            }
            return unique
        }
        const changeName=validateRepeat(this.props.t('myWaxberry.createNewFolder'))

        this.setState({
            folderList: [...this.state.folderList, {
                id: changeName,
                change: 'new',
                changeName
            }]
        })
    }

    editFolder(item) {
        item.change = "edit";
        item.changeName = item.name;
        this.forceUpdate();
    }

    inputChange(item,e) {
        item.changeName = e.target.value;
        console.log(e)
        this.forceUpdate();
        // this.turnCreateFolder(false)
    }

    inputKeyDown(item,e) {
        if(e.keyCode === 13){
            this.inputBlur(item,e);
        }
    }

    inputBlur(item,e) {
        e.stopPropagation();
        if(!item.changeName){
            message.warning(this.props.t('message.pleaseFillFolderNameProceeding'));
            return;
        }
        let params;
        if(item.change === "new") {
            params = {
                "name": item.changeName,
                type: this.state.waxberryType
            }
        }else{
            params = {
                "id": item.id,
                "name": item.changeName
            }
        }
        axios.post(globalInitConfig.REACT_APP_API_BASE_URL + 'mgr/agent/agentFolder/addOrUpdateAgentFolder', params).then(res => {
            const data = res.data;
            if (data.code === 200) {
                this.getFolderList();
                message.success(this.props.t('operationSuccessful'));
            } else if(data.code === 400){
                message.warning(data.message);
            } else {
                message.error(data.message);
            }
            this.turnCreateFolder(false)
        });
    }

    handleUpload(info) {
        if (info.file.status === 'done') {
            let waxberryObj = this.state.waxberryObj;
            let obj = info.file.response.data;
            waxberryObj.imgeFileId = obj.id;
            this.setState({
                waxberryObj
            })
        }
    }

    handleAttachmentUpload(info) {
        let waxberryObj = this.state.waxberryObj;
        waxberryObj.fileList = info.fileList;
        this.setState({
            waxberryObj
        })
    }

    handleCoverUpload(info) {
        if (info.file.status === 'done') {
            let waxberryObj = this.state.waxberryObj;
            let obj = info.file.response.data;
            waxberryObj.coverFileId = obj.id;
            this.setState({
                waxberryObj
            })
        }
    }

    handleWaxberryClick(item,{key}) {
        if(key === "cancelPublish"){
            let params = {
                id: item.id,
                status: 0
            };
            axios.post(globalInitConfig.REACT_APP_API_BASE_URL + 'mgr/agent/agent/updateAgent', params).then(res => {
                const data = res.data;
                if (data.code === 200) {
                    this.getWaxberryList();
                    message.success(this.props.t('operationSuccessful'));
                } else {
                    message.error(data.message);
                }
            });
            return;
        }
        if(key === "edit"){
            let copiedObject = Object.assign({}, item);
            let fileId = copiedObject.fileId;
            let fileList = [];
            if(fileId){
                let fileIds = fileId.split(',');
                let fileNames = copiedObject.fileName.split(',');
                fileIds.forEach((id,index)=>{
                    fileList.push({
                        uid: id,
                        name: fileNames[index],
                        status: 'done',
                        reponse:{
                            data: {
                                id,
                                fileName: fileNames[index]
                            }
                        }
                    })
                })
            }
            copiedObject.fileList = fileList;
            this.setState({
                showWaxberryModal: 'edit',
                waxberryObj: copiedObject
            },()=>{
                this.getWaxberryDetail();
            });
            return;
        }
        if(key === "move"){
            this.setState({
                moveFolderId: '',
                showMoveModal: true,
                waxberryObj: item
            });
            return;
        }
        if(key === "delete"){
            this.setState({
                deleteObj: {
                    id: item.id,
                    name: item.name,
                    deleteType: "1"
                }
            });
        }
    }

    moveModalOk(){
        let { waxberryObj,moveFolderId,waxberryType } = this.state;
        if(!moveFolderId){
            message.warning(this.props.t('message.pleaseSelectFolderOperation'));
            return;
        }
        let params = {
            id: waxberryObj.id,
            classificationId: moveFolderId
        };
        let url = globalInitConfig.REACT_APP_API_BASE_URL + 'mgr/agent/agent/updateAgent';
        if(waxberryType === "1"){
            url = globalInitConfig.REACT_APP_API_BASE_URL + 'mgr/agent/agent/moveAgentRun';
        }
        axios.post(url, params).then(res => {
            const data = res.data;
            if (data.code === 200) {
                this.setState({
                    showMoveModal: false
                });
                this.getWaxberryList();
                message.success(this.props.t('operationSuccessful'));
            } else {
                message.error(data.message);
            }
        });
    }

    hideMoveModal(){
        this.setState({
            showMoveModal: false
        });
    }

    selectMoveFolder(id){
        this.setState({
            moveFolderId: id
        });
    }

    waxberryTypeChange(type){
        this.setState({
            selectFolder: {id:""},
            waxberryType: type,
            waxberryList: []
        },()=>{
            if(type==="4" ){
                return
            }
            this.getWaxberryList();
            if(type === "0" || type === "1"){
                this.getFolderList();
            }
        });
    }

    getWaxberryDetail(){
        let waxberryObj = this.state.waxberryObj;
        axios.get(`${globalInitConfig.REACT_APP_API_SBX_URL}/sandboxes/${waxberryObj.vesselId}/read_file?path=/waxberry/README.md`).then(res => {
            const data = res.data;
            if (data) {
                waxberryObj.detail = data;
                this.setState({
                    waxberryObj
                });
            }
        });
    }

    setWaxberryDetail(item){
        let params = {
            path: "/waxberry/README.md",
            content: item.detail
        };
        axios.post(`${globalInitConfig.REACT_APP_API_SBX_URL}/sandboxes/${item.vesselId}/write_file`,params);
    }

    folderMenuClick(item,{key,domEvent }){
        domEvent.stopPropagation();
        if(key === "edit"){
            this.editFolder(item);
            return;
        }
        if(key === "delete"){
            this.setState({
                deleteObj: {
                    id: item.id,
                    name: item.name,
                    deleteType: "0"
                }
            });
        }
    }

    hideDeleteModal(){
        this.setState({
            deleteObj: undefined
        });
    }

    deleteObj(){
        let deleteObj = this.state.deleteObj;
        if(deleteObj.deleteType === "0"){
            this.deleteFolder(deleteObj.id);
            return;
        }
        if(deleteObj.deleteType === "1"){
            this.deleteWaxberry(deleteObj.id);
        }
    }

    deleteFolder(id){
        axios.get(`${globalInitConfig.REACT_APP_API_BASE_URL}mgr/agent/agentFolder/deleteAgentFolder?id=${id}`).then(res => {
            const data = res.data;
            if (data.code === 200) {
                this.hideDeleteModal();
                this.getFolderList();
                if(this.state.selectFolder.id === id){
                    this.setState({
                        selectFolder: {id:""}
                    },()=>{
                        this.getWaxberryList();
                    });
                }
                message.success(this.props.t('operationSuccessful'));
            } else {
                message.error(data.message);
            }
        });
    }

    deleteWaxberry(id) {
        axios.get(globalInitConfig.REACT_APP_API_BASE_URL + 'mgr/agent/agent/deleteAgent?id=' + id).then(res => {
            const data = res.data;
            if (data.code === 200) {
                this.hideDeleteModal();
                this.getUserAgentNum();
                this.getWaxberryList();
                message.success(this.props.t('operationSuccessful'));
            } else {
                message.error(data.message);
            }
        });
    }

    develop(item){
        if(item.type === 0){
            if(!item.step || item.step === "complete") {
                window.open(`/waxberry?id=${item.id}`);
            }else{
                window.open(`/waxberry_dev_step?id=${item.id}`);
            }
            return;
        }
        if(item.type === 1){
            window.open(`/agent?id=${item.id}`);
            return;
        }
        if(item.type === 2){
            window.open(`/small_model?id=${item.id}`);
        }
    }

    run(item) {
        axios.get(`${globalInitConfig.REACT_APP_API_BASE_URL}mgr/agent/agent/agentRunRecord?vesselId=${item.vesselId}`);
        if(item.type === 0){
            window.open(globalInitConfig.REACT_APP_RUN_URL.replace('ID',item.id.toLowerCase()));
        }
        if(item.type === 1){
            window.open(`/agent_run?id=${item.id}`);
        }
    }

    publish(item) {
        let copiedObject = Object.assign({}, item);
        let fileId = copiedObject.fileId;
        let fileList = [];
        if(fileId){
            let fileIds = fileId.split(',');
            let fileNames = copiedObject.fileName.split(',');
            fileIds.forEach((id,index)=>{
                fileList.push({
                    uid: id,
                    name: fileNames[index],
                    status: 'done',
                    reponse:{
                        data: {
                            id,
                            fileName: fileNames[index]
                        }
                    }
                })
            })
        }
        copiedObject.fileList = fileList;
        this.setState({
            showWaxberryModal: 'publish',
            waxberryObj: copiedObject
        },()=>{
            this.getWaxberryDetail();
        });
    }

    handleFileChange(e) {
        let that = this;
        let waxberryObj = this.state.waxberryObj;
        let file = e.target.files[0];
        if(file){
            let reader = new FileReader();
            reader.onload = (event) =>{
                waxberryObj.detail = event.target.result;
                that.setState({
                    waxberryObj
                })
            };
            reader.readAsText(file);
        }
    }

    ascendChange(sortFuction){
        this.setState({
            isAscending: !this.state.isAscending
        },()=>{
            if(this.state.waxberryType==="4"){
                sortFuction();
                return
            }
            this.getWaxberryList();
        })
    }

    filterTypeChange(value){
        this.setState({
            filterType: value
        },()=>{
            this.getWaxberryList();
        })
    }

    generateImage(key,iconSpinning) {
        this.setState({
            [iconSpinning]: true
        });
        let waxberryObj = this.state.waxberryObj;
        axios.post(`${globalInitConfig.REACT_APP_API_PLUG_URL}api/v1/textToImage`,{text: waxberryObj.name}).then(res => {
            if (res.data.code === 200) {
                waxberryObj[key] = res.data.data.id;
                this.setState({
                    waxberryObj,
                    [iconSpinning]: false
                })
            }
        });
    }
    registerButton(promptWordCreateButton,promptWordSortButton,promptWordCount=0){
        this.setState({
            promptWordCreateButton,
            promptWordSortButton,
            promptWordCount
        })
    }
    turnCreateFolder(disable){
        this.setState({
            disableCreateFolder:disable
        })
    }
    copyWaxberry(id){
        const removeMask=showFullScreenMask(duplicateIcon)
        axios.get(`${globalInitConfig.REACT_APP_API_BASE_URL}mgr/agent/agent/copyAgent?id=${id}`).then(res => {
            if (res.data.code === 200) {
                message.success(this.props.t('operationSuccessful'));
                this.getWaxberryList();
            }else{
                message.warning(res.data.message);
            }
        }).finally(()=>{
            removeMask()
        });
    }

    generate_user_prompt(){
        this.setState({
            detailSpinning: true
        });
        let waxberryObj = this.state.waxberryObj;
        axios.post(`${globalInitConfig.REACT_APP_API_CORE_URL}/chat/agent/generate_user_prompt`,{
            type: 1,
            user_message: waxberryObj.name+','+waxberryObj.discription
        }).then(r => {
            waxberryObj.detail = r.data.response.content;
            this.setState({
                waxberryObj,
                detailSpinning: false
            })
        });
    }
    render() {
        const { showWaxberryModal,selectFolder,waxberryList,folderList,promptWordCreateButton,promptWordSortButton,promptWordCount,
            waxberryObj,showMoveModal,moveFolderId,agentMenuList,waxberryType,deleteObj,disableCreateFolder,detailSpinning,
            isAscending,filterType,iconSpinning1,iconSpinning2,userAgentNum } = this.state;
        const { t } = this.props;

        const iconMap=[
            {
                name: t('app'),
                icon: <AppIcon/>,
            },
            {
                name: t('agent'),
                icon: <IntelligenceIcon/>
            },
            {
                name: t('smallModel'),
                icon: <SmallModuleIcon/>
            },
            {
                name: t('largeModel'),
                icon: LargeModelPng
            }
        ];

        const devMenuItems = (item) =>{
            let items = [{
                key: 'edit',
                label: (
                    <div>
                        <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="16" height="16" viewBox="0 0 16 16"><defs><clipPath id="master_svg0_721_83947"><rect x="0" y="0" width="16" height="16" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_721_83947)"><g><path d="M4.9319387500000005,10.554861875L6.61353875,10.146541875L12.58570875,4.174701875C12.71062875,4.0497418750000005,12.71062875,3.847181875,12.58570875,3.722221875L11.90697875,3.043501875C11.78201875,2.918581875,11.57945875,2.918581875,11.45449875,3.043501875L5.424098750000001,9.073581875L4.9319387500000005,10.554861875ZM4.46537875,8.222061875L10.54889875,2.138539875C11.17373875,1.513715875,12.18678875,1.513715875,12.81161875,2.138539875L13.49061875,2.816941875C14.11571875,3.441811875,14.11571875,4.455111875,13.49061875,5.079981875L7.45545875,11.115181875C7.33081875,11.239801875,7.17427875,11.327711875,7.0029787500000005,11.369261875L4.67273875,11.935021875C4.33355875,12.017421875,3.97638875,11.909221875,3.73996175,11.652391875C3.50353575,11.395621875,3.42510875,11.030741875,3.53514375,10.699501875L4.23305875,8.598381875000001C4.28015875,8.456571875,4.35970875,8.327711875,4.46537875,8.222061875ZM13.92531875,13.761721875C13.92531875,14.115221875,13.63861875,14.402321875,13.28511875,14.402321875L3.84010275,14.401621875C3.48629475,14.402021875,3.19921875,14.115421875,3.19921875,13.761621875C3.19921875,13.407821875,3.48629575,13.121121875,3.84010275,13.121621875L13.28511875,13.121121875C13.63861875,13.121121875,13.92531875,13.408221875,13.92531875,13.761721875Z" fill="currentColor"/></g><g><path d="M9.2802734375,4.106131875L10.1852344375,3.201171875L12.2217134375,5.237651875L11.316753437500001,6.142611875L9.2802734375,4.106131875Z" fill="currentColor"/></g></g></svg>
                        {t('edit')}
                    </div>
                )
            },{
                key: 'move',
                label: (
                    <div>
                        <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="16" height="16" viewBox="0 0 16 16"><defs><clipPath id="master_svg0_721_84128"><rect x="0" y="0" width="16" height="16" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_721_84128)"><g><path d="M13.99879988079071,13.0133Q14.46409988079071,12.46809,14.46409988079071,11.70537L14.46409988079071,6.98037Q14.46409988079071,6.21936,13.99869988079071,5.67468Q13.51839988079071,5.1125,12.83159988079071,5.1125L8.127239880790711,5.1125Q8.03143988079071,4.783440000000001,7.95584988079071,4.4490099999999995L7.95413988079071,4.44181Q7.736899880790711,3.541384,7.604649880790711,3.267117Q7.35529988079071,2.75,6.86674988079071,2.75L3.3816298807907104,2.75Q2.6946938807907106,2.75,2.2148158807907103,3.3125489999999997Q1.7499998807907104,3.85744,1.7499998807907104,4.61963L1.7499998807907104,11.70625Q1.7499998807907104,12.46844,2.2148158807907103,13.0133Q2.6946958807907104,13.5759,3.3816198807907103,13.5759L12.83159988079071,13.5759Q13.518699880790711,13.5759,13.99879988079071,13.0133ZM13.08689988079071,11.76938Q13.08769988079071,11.75804,13.08829988079071,11.7465L13.08829988079071,6.98125Q13.08829988079071,6.75605,12.98109988079071,6.59908Q12.90489988079071,6.4875,12.83079988079071,6.4875L7.71724988079071,6.4875Q7.22435988079071,6.4875,6.972379880790711,5.96307Q6.838209880790711,5.68382,6.61753988079071,4.76729Q6.52996988079071,4.40242,6.47015988079071,4.1833100000000005Q6.461819880790711,4.15274,6.454009880790711,4.125L3.3816298807907104,4.125Q3.3079298807907103,4.125,3.2319998807907107,4.2366399999999995Q3.1249998807907104,4.3939699999999995,3.1249998807907104,4.61963L3.1249998807907104,11.70625Q3.1249998807907104,11.93189,3.23205988079071,12.08942Q3.3082298807907105,12.20152,3.3819398807907106,12.20175L12.83159988079071,12.20175Q12.90539988079071,12.20175,12.98169988079071,12.0896Q13.07379988079071,11.95431,13.08689988079071,11.76938Z" fillRule="evenodd" fill="currentColor" fillOpacity="1"/></g></g></svg>
                        {t('move')}
                    </div>
                )
            },{
                key: 'delete',
                label: (
                    <div className="delete">
                        <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="14" height="14" viewBox="0 0 14 14"><defs><clipPath id="master_svg0_41_4604"><rect x="0" y="0" width="14" height="14" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_41_4604)"><g><path d="M11.34851044921875,4.837532265625001L10.93880044921875,12.598922265625C10.92374044921875,12.884022265625,10.68819044921875,13.107522265625,10.40262044921875,13.107522265625L3.59738044921875,13.107522265625C3.31180044921875,13.107522265625,3.0762604492187497,12.884022265625,3.06119044921875,12.598922265625L2.65149044921875,4.837532265625001C2.63589044921875,4.541412265625,2.86327044921875,4.288682265625,3.15938044921875,4.273032265625C3.45687044921875,4.258672265625,3.70828044921875,4.484862265625,3.72388044921875,4.780912265625L4.10670044921875,12.033722265625L9.89331044921875,12.033722265625L10.27613044921875,4.780912265625C10.29185044921875,4.484732265625,10.54629044921875,4.259602265625,10.84063044921875,4.273032265625C11.13673044921875,4.288702265625,11.36411044921875,4.541412265625,11.34851044921875,4.837532265625001ZM12.77181044921875,3.040462265625C12.77181044921875,3.336982265625,12.53141044921875,3.577382265625,12.23491044921875,3.577382265625L1.76512444921875,3.577382265625C1.46860944921875,3.577382265625,1.22821044921875,3.336982265625,1.22821044921875,3.040462265625C1.22821044921875,2.743952265625,1.46860944921875,2.503552265625,1.76512444921875,2.503552265625L4.71813044921875,2.503552265625L4.71813044921875,1.295511265625C4.71813044921875,1.036029265625,4.89116044921875,0.892822265625,5.15063044921875,0.892822265625L8.84923044921875,0.892822265625C9.108720449218751,0.892822265625,9.28186044921875,1.036029265625,9.28186044921875,1.295511265625L9.28186044921875,2.503562265625L12.23491044921875,2.503562265625C12.53141044921875,2.503562265625,12.77181044921875,2.743962265625,12.77181044921875,3.040462265625ZM5.65772044921875,2.503562265625L8.34227044921875,2.503562265625L8.34227044921875,1.832425265625L5.65772044921875,1.832425265625L5.65772044921875,2.503562265625ZM5.88284044921875,11.228322265625C5.88659044921875,11.228322265625,5.89031044921875,11.228322265625,5.89412044921875,11.228322265625C6.15353044921875,11.228322265625,6.35880044921875,10.978822265625,6.35271044921875,10.719412265625L6.21619044921875,4.916142265625C6.21009044921875,4.656722265625,5.99737044921875,4.444792265625,5.73545044921875,4.4505022656249995C5.47604044921875,4.4566022656249995,5.27077044921875,4.668302265625,5.27686044921875,4.927712265625L5.41337044921875,10.743252265625C5.41940044921875,10.998822265625,5.62848044921875,11.228322265625,5.88284044921875,11.228322265625ZM8.09662044921875,11.228322265625C8.35092044921875,11.228322265625,8.560070449218749,11.012622265625,8.56610044921875,10.757012265625L8.702620449218749,4.961492265625C8.70871044921875,4.7020722656250005,8.503430449218751,4.483702265625,8.24402044921875,4.477602265625C7.98055044921875,4.473792265625001,7.76936044921875,4.675252265625,7.76328044921875,4.934612265625L7.62676044921875,10.735712265625C7.62066044921875,10.995122265625,7.82594044921875,11.228322265625,8.085350449218751,11.228322265625C8.089160449218749,11.228322265625,8.09289044921875,11.228322265625,8.09662044921875,11.228322265625Z" fill="currentColor"/></g></g></svg>
                        {t('delete')}
                    </div>
                )
            }];
            if(item.status !== 0){
                items = items.filter(item=>item.key === 'move');
            }
            return items;
        };

        const folderMenuItems = [{
            key: 'edit',
            label: (
                <div>
                    <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="16" height="16" viewBox="0 0 16 16"><defs><clipPath id="master_svg0_721_83947"><rect x="0" y="0" width="16" height="16" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_721_83947)"><g><path d="M4.9319387500000005,10.554861875L6.61353875,10.146541875L12.58570875,4.174701875C12.71062875,4.0497418750000005,12.71062875,3.847181875,12.58570875,3.722221875L11.90697875,3.043501875C11.78201875,2.918581875,11.57945875,2.918581875,11.45449875,3.043501875L5.424098750000001,9.073581875L4.9319387500000005,10.554861875ZM4.46537875,8.222061875L10.54889875,2.138539875C11.17373875,1.513715875,12.18678875,1.513715875,12.81161875,2.138539875L13.49061875,2.816941875C14.11571875,3.441811875,14.11571875,4.455111875,13.49061875,5.079981875L7.45545875,11.115181875C7.33081875,11.239801875,7.17427875,11.327711875,7.0029787500000005,11.369261875L4.67273875,11.935021875C4.33355875,12.017421875,3.97638875,11.909221875,3.73996175,11.652391875C3.50353575,11.395621875,3.42510875,11.030741875,3.53514375,10.699501875L4.23305875,8.598381875000001C4.28015875,8.456571875,4.35970875,8.327711875,4.46537875,8.222061875ZM13.92531875,13.761721875C13.92531875,14.115221875,13.63861875,14.402321875,13.28511875,14.402321875L3.84010275,14.401621875C3.48629475,14.402021875,3.19921875,14.115421875,3.19921875,13.761621875C3.19921875,13.407821875,3.48629575,13.121121875,3.84010275,13.121621875L13.28511875,13.121121875C13.63861875,13.121121875,13.92531875,13.408221875,13.92531875,13.761721875Z" fill="currentColor"/></g><g><path d="M9.2802734375,4.106131875L10.1852344375,3.201171875L12.2217134375,5.237651875L11.316753437500001,6.142611875L9.2802734375,4.106131875Z" fill="currentColor"/></g></g></svg>
                    {t('edit')}
                </div>
            )
        },{
            key: 'delete',
            label: (
                <div>
                    <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="14" height="14" viewBox="0 0 14 14"><defs><clipPath id="master_svg0_41_4604"><rect x="0" y="0" width="14" height="14" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_41_4604)"><g><path d="M11.34851044921875,4.837532265625001L10.93880044921875,12.598922265625C10.92374044921875,12.884022265625,10.68819044921875,13.107522265625,10.40262044921875,13.107522265625L3.59738044921875,13.107522265625C3.31180044921875,13.107522265625,3.0762604492187497,12.884022265625,3.06119044921875,12.598922265625L2.65149044921875,4.837532265625001C2.63589044921875,4.541412265625,2.86327044921875,4.288682265625,3.15938044921875,4.273032265625C3.45687044921875,4.258672265625,3.70828044921875,4.484862265625,3.72388044921875,4.780912265625L4.10670044921875,12.033722265625L9.89331044921875,12.033722265625L10.27613044921875,4.780912265625C10.29185044921875,4.484732265625,10.54629044921875,4.259602265625,10.84063044921875,4.273032265625C11.13673044921875,4.288702265625,11.36411044921875,4.541412265625,11.34851044921875,4.837532265625001ZM12.77181044921875,3.040462265625C12.77181044921875,3.336982265625,12.53141044921875,3.577382265625,12.23491044921875,3.577382265625L1.76512444921875,3.577382265625C1.46860944921875,3.577382265625,1.22821044921875,3.336982265625,1.22821044921875,3.040462265625C1.22821044921875,2.743952265625,1.46860944921875,2.503552265625,1.76512444921875,2.503552265625L4.71813044921875,2.503552265625L4.71813044921875,1.295511265625C4.71813044921875,1.036029265625,4.89116044921875,0.892822265625,5.15063044921875,0.892822265625L8.84923044921875,0.892822265625C9.108720449218751,0.892822265625,9.28186044921875,1.036029265625,9.28186044921875,1.295511265625L9.28186044921875,2.503562265625L12.23491044921875,2.503562265625C12.53141044921875,2.503562265625,12.77181044921875,2.743962265625,12.77181044921875,3.040462265625ZM5.65772044921875,2.503562265625L8.34227044921875,2.503562265625L8.34227044921875,1.832425265625L5.65772044921875,1.832425265625L5.65772044921875,2.503562265625ZM5.88284044921875,11.228322265625C5.88659044921875,11.228322265625,5.89031044921875,11.228322265625,5.89412044921875,11.228322265625C6.15353044921875,11.228322265625,6.35880044921875,10.978822265625,6.35271044921875,10.719412265625L6.21619044921875,4.916142265625C6.21009044921875,4.656722265625,5.99737044921875,4.444792265625,5.73545044921875,4.4505022656249995C5.47604044921875,4.4566022656249995,5.27077044921875,4.668302265625,5.27686044921875,4.927712265625L5.41337044921875,10.743252265625C5.41940044921875,10.998822265625,5.62848044921875,11.228322265625,5.88284044921875,11.228322265625ZM8.09662044921875,11.228322265625C8.35092044921875,11.228322265625,8.560070449218749,11.012622265625,8.56610044921875,10.757012265625L8.702620449218749,4.961492265625C8.70871044921875,4.7020722656250005,8.503430449218751,4.483702265625,8.24402044921875,4.477602265625C7.98055044921875,4.473792265625001,7.76936044921875,4.675252265625,7.76328044921875,4.934612265625L7.62676044921875,10.735712265625C7.62066044921875,10.995122265625,7.82594044921875,11.228322265625,8.085350449218751,11.228322265625C8.089160449218749,11.228322265625,8.09289044921875,11.228322265625,8.09662044921875,11.228322265625Z" fill="currentColor"/></g></g></svg>
                    {t('delete')}
                </div>
            )
        }];

        const props = {
            accept: "image/png, image/jpeg",
            showUploadList: false,
            multiple: false,
            onChange: this.handleUpload.bind(this)
        };

        const attachmentProps = {
            showUploadList: true,
            multiple: true,
            onChange: this.handleAttachmentUpload.bind(this)
        };

        const coverProps = {
            accept: "image/png, image/jpeg",
            showUploadList: false,
            multiple: false,
            onChange: this.handleCoverUpload.bind(this)
        };

        const ContentDataFolder=()=>
            <div className="content-data-folder">
                <div className={selectFolder.id===""?"folder folder-active":"folder"} onClick={()=>this.selectFolder({id:""})}>
                    <svg className="img1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="16" height="16" viewBox="0 0 16 16"><defs><clipPath id="master_svg0_688_65220"><rect x="0" y="0" width="16" height="16" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_688_65220)"><g><path d="M4.89362,12.25C4.89362,12.5,5.14894,12.75,5.40426,12.75L13.4894,12.75C13.7447,12.75,14,12.5,14,12.25L14,11.91667C14,11.66667,13.7447,11.41667,13.4894,11.41667L5.40426,11.41667C5.14894,11.41667,4.89362,11.66667,4.89362,11.91667L4.89362,12.25ZM3.02128,11.08333C2.510638,11.08333,2,11.5,2,12.08333C2,12.58333,2.425532,13,3.02128,13C3.53191,13,4.04255,12.58333,4.04255,12C3.9574499999999997,11.5,3.53191,11.08333,3.02128,11.08333ZM4.89362,8.16667C4.89362,8.41667,5.14894,8.66667,5.40426,8.66667L13.4894,8.66667C13.7447,8.66667,14,8.41667,14,8.16667L14,7.83333C14,7.58333,13.7447,7.33333,13.4894,7.33333L5.40426,7.33333C5.14894,7.33333,4.89362,7.58333,4.89362,7.83333L4.89362,8.16667ZM3.02128,7C2.425532,7,2,7.5,2,8C2,8.5,2.425532,9,3.02128,9C3.53191,9,4.04255,8.58333,4.04255,8C3.9574499999999997,7.5,3.53191,7,3.02128,7ZM5.40426,3.333333C5.14894,3.333333,4.89362,3.583333,4.89362,3.833333L4.89362,4.16667C4.89362,4.41667,5.14894,4.66667,5.40426,4.66667L13.4894,4.66667C13.7447,4.66667,14,4.41667,14,4.16667L14,3.75C14,3.5,13.7447,3.25,13.4894,3.25L5.40426,3.25L5.40426,3.333333ZM3.02128,3C2.425532,3,2,3.416667,2,3.916667C2,4.41667,2.425532,4.91667,3.02128,4.91667C3.53191,4.91667,4.04255,4.5,4.04255,3.916667C3.9574499999999997,3.416667,3.53191,3,3.02128,3Z" fill="currentColor"/></g></g></svg>
                    <span>{t('all')}</span>
                </div>
                {folderList.map(item=>item.change?(
                    <div className="folder" key={item.id}>
                        <svg className="img1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="16" height="16" viewBox="0 0 16 16"><defs><clipPath id="master_svg0_721_84128"><rect x="0" y="0" width="16" height="16" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_721_84128)"><g><path d="M13.99879988079071,13.0133Q14.46409988079071,12.46809,14.46409988079071,11.70537L14.46409988079071,6.98037Q14.46409988079071,6.21936,13.99869988079071,5.67468Q13.51839988079071,5.1125,12.83159988079071,5.1125L8.127239880790711,5.1125Q8.03143988079071,4.783440000000001,7.95584988079071,4.4490099999999995L7.95413988079071,4.44181Q7.736899880790711,3.541384,7.604649880790711,3.267117Q7.35529988079071,2.75,6.86674988079071,2.75L3.3816298807907104,2.75Q2.6946938807907106,2.75,2.2148158807907103,3.3125489999999997Q1.7499998807907104,3.85744,1.7499998807907104,4.61963L1.7499998807907104,11.70625Q1.7499998807907104,12.46844,2.2148158807907103,13.0133Q2.6946958807907104,13.5759,3.3816198807907103,13.5759L12.83159988079071,13.5759Q13.518699880790711,13.5759,13.99879988079071,13.0133ZM13.08689988079071,11.76938Q13.08769988079071,11.75804,13.08829988079071,11.7465L13.08829988079071,6.98125Q13.08829988079071,6.75605,12.98109988079071,6.59908Q12.90489988079071,6.4875,12.83079988079071,6.4875L7.71724988079071,6.4875Q7.22435988079071,6.4875,6.972379880790711,5.96307Q6.838209880790711,5.68382,6.61753988079071,4.76729Q6.52996988079071,4.40242,6.47015988079071,4.1833100000000005Q6.461819880790711,4.15274,6.454009880790711,4.125L3.3816298807907104,4.125Q3.3079298807907103,4.125,3.2319998807907107,4.2366399999999995Q3.1249998807907104,4.3939699999999995,3.1249998807907104,4.61963L3.1249998807907104,11.70625Q3.1249998807907104,11.93189,3.23205988079071,12.08942Q3.3082298807907105,12.20152,3.3819398807907106,12.20175L12.83159988079071,12.20175Q12.90539988079071,12.20175,12.98169988079071,12.0896Q13.07379988079071,11.95431,13.08689988079071,11.76938Z" fillRule="evenodd" fill="currentColor" fillOpacity="1"/></g></g></svg>
                        <span className="folderName">
                        <input ref={node=> {if(node&&!node.firstFocus) {node.focus();node.firstFocus=true}}} onFocus={()=>{this.turnCreateFolder(true)}} value={item.changeName} onChange={this.inputChange.bind(this,item)} onBlur={this.inputBlur.bind(this,item)} onKeyDown={this.inputKeyDown.bind(this,item)}/>
                      </span>
                    </div>
                ):(
                    <div className={selectFolder.id===item.id?"folder folder-active":"folder"} key={item.id} onClick={()=>this.selectFolder(item)}>
                        <svg className="img1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="16" height="16" viewBox="0 0 16 16"><defs><clipPath id="master_svg0_721_84128"><rect x="0" y="0" width="16" height="16" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_721_84128)"><g><path d="M13.99879988079071,13.0133Q14.46409988079071,12.46809,14.46409988079071,11.70537L14.46409988079071,6.98037Q14.46409988079071,6.21936,13.99869988079071,5.67468Q13.51839988079071,5.1125,12.83159988079071,5.1125L8.127239880790711,5.1125Q8.03143988079071,4.783440000000001,7.95584988079071,4.4490099999999995L7.95413988079071,4.44181Q7.736899880790711,3.541384,7.604649880790711,3.267117Q7.35529988079071,2.75,6.86674988079071,2.75L3.3816298807907104,2.75Q2.6946938807907106,2.75,2.2148158807907103,3.3125489999999997Q1.7499998807907104,3.85744,1.7499998807907104,4.61963L1.7499998807907104,11.70625Q1.7499998807907104,12.46844,2.2148158807907103,13.0133Q2.6946958807907104,13.5759,3.3816198807907103,13.5759L12.83159988079071,13.5759Q13.518699880790711,13.5759,13.99879988079071,13.0133ZM13.08689988079071,11.76938Q13.08769988079071,11.75804,13.08829988079071,11.7465L13.08829988079071,6.98125Q13.08829988079071,6.75605,12.98109988079071,6.59908Q12.90489988079071,6.4875,12.83079988079071,6.4875L7.71724988079071,6.4875Q7.22435988079071,6.4875,6.972379880790711,5.96307Q6.838209880790711,5.68382,6.61753988079071,4.76729Q6.52996988079071,4.40242,6.47015988079071,4.1833100000000005Q6.461819880790711,4.15274,6.454009880790711,4.125L3.3816298807907104,4.125Q3.3079298807907103,4.125,3.2319998807907107,4.2366399999999995Q3.1249998807907104,4.3939699999999995,3.1249998807907104,4.61963L3.1249998807907104,11.70625Q3.1249998807907104,11.93189,3.23205988079071,12.08942Q3.3082298807907105,12.20152,3.3819398807907106,12.20175L12.83159988079071,12.20175Q12.90539988079071,12.20175,12.98169988079071,12.0896Q13.07379988079071,11.95431,13.08689988079071,11.76938Z" fillRule="evenodd" fill="currentColor" fillOpacity="1"/></g></g></svg>
                        <span className="folderName" title={item.name}>{item.name}</span>
                        <Dropdown menu={{ items: folderMenuItems,onClick: this.folderMenuClick.bind(this,item) }}>
                            <svg className="img2" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="16" height="16" viewBox="0 0 16 16"><defs><clipPath id="master_svg0_23_2121"><rect x="16" y="0" width="16" height="16" rx="0"/></clipPath></defs><g transform="matrix(0,1,-1,0,16,-16)" clipPath="url(#master_svg0_23_2121)"><g><path d="M21.5,8Q21.5,8.09849,21.48079,8.19509Q21.461570000000002,8.29169,21.42388,8.38268Q21.38619,8.47368,21.33147,8.55557Q21.27675,8.63746,21.20711,8.70711Q21.13746,8.77675,21.05557,8.83147Q20.97368,8.88619,20.88268,8.92388Q20.79169,8.96157,20.69509,8.98079Q20.598489999999998,9,20.5,9Q20.401509,9,20.30491,8.98079Q20.208311,8.96157,20.117316,8.92388Q20.026322,8.88619,19.94443,8.83147Q19.862537,8.77675,19.792893,8.70711Q19.723249,8.63746,19.66853,8.55557Q19.613811,8.47368,19.5761205,8.38268Q19.5384294,8.29169,19.5192147,8.19509Q19.5,8.09849,19.5,8Q19.5,7.901509,19.5192147,7.80491Q19.5384294,7.708311,19.5761205,7.617316Q19.613811,7.526322,19.66853,7.44443Q19.723249,7.362537,19.792893,7.292893Q19.862537,7.223249,19.94443,7.16853Q20.026322,7.113811,20.117316,7.0761205Q20.208311,7.0384294,20.30491,7.0192147Q20.401509,7,20.5,7Q20.598489999999998,7,20.69509,7.0192147Q20.79169,7.0384294,20.88268,7.0761205Q20.97368,7.113811,21.05557,7.16853Q21.13746,7.223249,21.20711,7.292893Q21.27675,7.362537,21.33147,7.44443Q21.38619,7.526322,21.42388,7.617316Q21.461570000000002,7.708311,21.48079,7.80491Q21.5,7.901509,21.5,8Z" fill="currentColor"/></g><g><path d="M25,8Q25,8.09849,24.98079,8.19509Q24.961570000000002,8.29169,24.92388,8.38268Q24.88619,8.47368,24.83147,8.55557Q24.77675,8.63746,24.70711,8.70711Q24.63746,8.77675,24.55557,8.83147Q24.47368,8.88619,24.38268,8.92388Q24.29169,8.96157,24.19509,8.98079Q24.098489999999998,9,24,9Q23.901509,9,23.80491,8.98079Q23.708311,8.96157,23.617316,8.92388Q23.526322,8.88619,23.44443,8.83147Q23.362537,8.77675,23.292893,8.70711Q23.223249,8.63746,23.16853,8.55557Q23.113811,8.47368,23.0761205,8.38268Q23.0384294,8.29169,23.0192147,8.19509Q23,8.09849,23,8Q23,7.901509,23.0192147,7.80491Q23.0384294,7.708311,23.0761205,7.617316Q23.113811,7.526322,23.16853,7.44443Q23.223249,7.362537,23.292893,7.292893Q23.362537,7.223249,23.44443,7.16853Q23.526322,7.113811,23.617316,7.0761205Q23.708311,7.0384294,23.80491,7.0192147Q23.901509,7,24,7Q24.098489999999998,7,24.19509,7.0192147Q24.29169,7.0384294,24.38268,7.0761205Q24.47368,7.113811,24.55557,7.16853Q24.63746,7.223249,24.70711,7.292893Q24.77675,7.362537,24.83147,7.44443Q24.88619,7.526322,24.92388,7.617316Q24.961570000000002,7.708311,24.98079,7.80491Q25,7.901509,25,8Z" fill="currentColor"/></g><g><path d="M28.5,8Q28.5,8.09849,28.48079,8.19509Q28.461570000000002,8.29169,28.42388,8.38268Q28.38619,8.47368,28.33147,8.55557Q28.27675,8.63746,28.20711,8.70711Q28.13746,8.77675,28.05557,8.83147Q27.97368,8.88619,27.88268,8.92388Q27.79169,8.96157,27.69509,8.98079Q27.598489999999998,9,27.5,9Q27.401509,9,27.30491,8.98079Q27.208311,8.96157,27.117316,8.92388Q27.026322,8.88619,26.94443,8.83147Q26.862537,8.77675,26.792893,8.70711Q26.723249,8.63746,26.66853,8.55557Q26.613811,8.47368,26.5761205,8.38268Q26.5384294,8.29169,26.5192147,8.19509Q26.5,8.09849,26.5,8Q26.5,7.901509,26.5192147,7.80491Q26.5384294,7.708311,26.5761205,7.617316Q26.613811,7.526322,26.66853,7.44443Q26.723249,7.362537,26.792893,7.292893Q26.862537,7.223249,26.94443,7.16853Q27.026322,7.113811,27.117316,7.0761205Q27.208311,7.0384294,27.30491,7.0192147Q27.401509,7,27.5,7Q27.598489999999998,7,27.69509,7.0192147Q27.79169,7.0384294,27.88268,7.0761205Q27.97368,7.113811,28.05557,7.16853Q28.13746,7.223249,28.20711,7.292893Q28.27675,7.362537,28.33147,7.44443Q28.38619,7.526322,28.42388,7.617316Q28.461570000000002,7.708311,28.48079,7.80491Q28.5,7.901509,28.5,8Z" fill="currentColor" fillOpacity="1"/></g></g></svg>
                        </Dropdown>
                    </div>
                ))}
                <div className={disableCreateFolder?'addFolderNoAllow':"addFolder"}  onClick={disableCreateFolder?()=>null:()=>this.addFolder()}>
                    <PlusOutlined/>
                </div>
            </div>


        const CommonList=()=>{
            return  <div className="content-data-waxberry">


                {waxberryList.map(item=>(

                    <div className="waxberry" key={item.id}>

                        <div className="waxberry-left">
                            <img src={item.imgeFileId ? `${globalInitConfig.REACT_APP_API_FS_URL}file/download/${item.imgeFileId}` : DefaultPng} className="img"/>
                            <div className="info">
                                <div className="info-label">
                                    <span className="labelName">{item.name}</span>
                                    <div className="typeFrame">

                                        {iconMap[item.type].icon}
                                        {iconMap[item.type].name}
                                    </div>
                                    {item.status === 1 && <span className="status1">{t('underReview')}</span>}
                                    {item.status === 2 && <span className="status2">{t('published')}</span>}
                                </div>
                                <div className="info-data">
                                    {waxberryType!=="0" && <span className="userName"><img src={item.avatarUrl ? `${globalInitConfig.REACT_APP_API_FS_URL}file/download/${item.avatarUrl}` : CardDefaultPng1} width="20" height="20"/> {item.creatorName}</span>}
                                    <span className="desc">{t('myWaxberry.description')}：{item.discription}</span>
                                    <span className="time">{moment(item.createTime).fromNow()}</span>
                                </div>
                            </div>
                        </div>
                        <div className="waxberry-right">
                            {waxberryType === "0" && item.status === 0 && <div className="function" onClick={()=>this.develop(item)}>
                                <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="16" height="16" viewBox="0 0 16 16"><defs><clipPath id="master_svg0_140_07630"><rect x="0" y="0" width="16" height="16" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_140_07630)"><g><path d="M8.79047,3.506574C8.92814,3.107234,9.34649,2.9012876,9.72489,3.0465792C10.1033,3.191871,10.2984,3.633382,10.1608,4.03272L7.24525,12.49417C7.10728,12.89307,6.6892,13.0986,6.31108,12.95342C5.93297,12.80824,5.73778,12.36722,5.87496,11.96803L8.79047,3.506574ZM11.8488,5.05348C11.5795,4.73741,11.604,4.25078,11.9035,3.966569C12.203,3.682357,12.6641,3.708187,12.9334,4.02426L15.8132,7.405C16.0623,7.69743,16.0623,8.141020000000001,15.8132,8.43345L12.9334,11.81418C12.6643,12.13026,12.2034,12.15626,11.9039,11.87226C11.6044,11.58826,11.5797,11.1018,11.8488,10.785730000000001L14.2913,7.91961L11.8496,5.05348L11.8488,5.05348ZM4.15116,5.05348C4.42064,4.73764,4.3964,4.25104,4.09703,3.966756C3.79766,3.682475,3.33659,3.708224,3.06732,4.02426L0.186802,7.405C-0.0622674,7.69743,-0.0622674,8.141020000000001,0.186802,8.43345L3.06732,11.81418C3.33443,12.13913,3.80213,12.16975,4.10524,11.88213C4.40835,11.59451,4.42904,11.10046,4.15116,10.785730000000001L1.70943,7.91961L4.15116,5.05348Z" fill="currentColor"/></g></g></svg>
                                <span>{t('myWaxberry.development')}</span>
                            </div>}
                            {/*{waxberryType === "0" && item.status === 0 && <div className="function" onClick={()=>this.copyWaxberry(item.id)}>*/}
                                {/*<svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="16" height="16" viewBox="0 0 16 16"><defs><clipPath id="master_svg0_361_49383"><rect x="0" y="0" width="16" height="16" rx="4"/></clipPath></defs><g clipPath="url(#master_svg0_361_49383)"><g><path d="M10.112743203125,3.96741984375C10.612533203125,3.96741984375,11.017693203125,4.38406984375,11.017693203125,4.89801984375L11.017693203125,13.58353984375C11.017693203125,14.09753984375,10.612533203125,14.51413984375,10.112743203125,14.51413984375L3.476478203125,14.51413984375C2.976691203125,14.51413984375,2.571533203125,14.09753984375,2.571533203125,13.58353984375L2.571533203125,4.89801984375C2.571533095247,4.38406984375,2.976691203125,3.96741984375,3.476479203125,3.96741984375L10.112743203125,3.96741984375ZM9.811103203125,5.208219843749999L3.7781232031250003,5.208219843749999L3.7781232031250003,13.27333984375L9.811103203125,13.27333984375L9.811103203125,5.208219843749999ZM12.523523203125,1.485840010153C12.989833203125,1.48554320275,13.380033203125,1.84974284375,13.424833203125,2.32709684375L13.428433203125,2.41643484375L13.428433203125,10.78743984375C13.428133203125,11.11568984375,13.179133203125,11.38684984375,12.860533203125,11.40607984375C12.541873203125,11.42531984375,12.263803203125,11.18597984375,12.226093203125,10.86002984375L12.221873203125,10.78743984375L12.221873203125,2.72662984375L6.191313203125,2.72662984375C5.885463203125,2.7265898437500002,5.628023203125,2.49118984375,5.592243203124999,2.17882284375L5.588023203125,2.10623584375C5.5880632031249995,1.79171084375,5.816973203125,1.52698234375,6.120733203125,1.49018269375L6.191313203125,1.485840010153L12.523523203125,1.485840010153Z" fill="currentColor"/></g></g></svg>*/}
                                {/*<span>{t('copy')}</span>*/}
                            {/*</div>}*/}
                            {waxberryType === "0" && item.status === 0 && <div className="function" onClick={()=>this.publish(item)}>
                                <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="14" height="14" viewBox="0 0 14 14"><defs><clipPath id="master_svg0_41_4595"><rect x="0" y="0" width="14" height="14" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_41_4595)"><g><path d="M8.7259428515625,13.1219296875C8.4485428515625,13.1219296875,8.1766128515625,13.0247296875,7.9571728515625,12.8406296875L6.2048528515625,11.3676296875L4.3211428515625006,12.8704296875C4.1364328515625,13.0181296875,3.8829528515625,13.0456296875,3.6710428515625,12.9422296875C3.4588528515625,12.8384296875,3.3248728515625,12.6222296875,3.3273328515625,12.3856296875L3.3616428515625,9.0443996875L1.7372918515625,7.6123996875C1.4407488515625,7.3634396875,1.2839320515625,6.9709196875,1.3283656515625,6.5719696875C1.3729359515625,6.1726196875,1.6126038515625,5.8248096875,1.9694398515625,5.6406496875L10.9476228515625,1.0124436875C11.3732228515625,0.7930096875,11.8688228515625,0.8449627875,12.2400228515625,1.1469746875C12.6115228515625,1.4493966875,12.7624228515625,1.9240796875,12.6339228515625,2.3855096875L9.8814928515625,12.2458296875C9.7714328515625,12.6397296875,9.4722928515625,12.9470296875,9.081682851562501,13.0677296875C8.9645228515625,13.1040296875,8.8446128515625,13.1219296875,8.7259428515625,13.1219296875ZM6.2149628515625,9.9643796875C6.3551028515625,9.9643796875,6.4949628515625,10.0122296875,6.6088528515625,10.1077996875L8.713502851562499,11.8766296875L11.4313228515625,2.1405096875L2.5655328515624998,6.7106096875L4.3812928515625,8.3111696875C4.5148728515625,8.4286096875,4.590472851562501,8.5986896875,4.5887028515625,8.7765596875L4.5647728515625,11.1100296875L5.8332528515625,10.0980896875C5.9416128515625,10.0114596875,6.0762328515625,9.9642996875,6.2149628515625,9.9643796875Z" fill="currentColor"/></g><g><path d="M6.2948091875,8.129772656250001C6.1381301875,8.129772656250001,5.9815871875,8.07002265625,5.8619581875,7.95039265625C5.6228369875,7.711272656249999,5.6228369875,7.32367265625,5.8619581875,7.084832656250001L8.1524071875,4.79506365625C8.3915271875,4.55594245625,8.7788571875,4.55594245625,9.0179771875,4.79506365625C9.2570971875,5.03418465625,9.2570971875,5.42178165625,9.0179771875,5.66063265625L6.7275271875,7.95039265625C6.6080321875,8.07002265625,6.4513521874999995,8.129772656250001,6.2948091875,8.129772656250001Z" fill="currentColor"/></g></g></svg>
                                <span>{t('publish')}</span>
                            </div>}
                            {waxberryType === "0" && item.status === 2 && <div className="function" onClick={()=>this.handleWaxberryClick(item,{key:'cancelPublish'})}>
                                <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="14" height="14" viewBox="0 0 14 14"><defs><clipPath id="master_svg0_122_44198"><rect x="0" y="0" width="14" height="14" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_122_44198)"><g transform="matrix(0.7071067690849304,0.7071067690849304,-0.7071067690849304,0.7071067690849304,2.62976081771194,-2.1095462961529847)"><path d="M3.861328125,1.61962890625L15.197628125,1.61962890625Q15.246828125,1.61962890625,15.295128125,1.62923590625Q15.343428125,1.63884390625,15.388928125,1.65768890625Q15.434428125,1.6765349062500001,15.475428125,1.70389390625Q15.516328125,1.73125390625,15.551128125,1.76607590625Q15.586028125,1.80089790625,15.613328125,1.84184390625Q15.640728125,1.88278990625,15.659528125,1.9282869062499999Q15.678428125,1.97378390625,15.688028125,2.02208380625Q15.697628125,2.07038320625,15.697628125,2.11962890625Q15.697628125,2.16887460625,15.688028125,2.21717400625Q15.678428125,2.26547390625,15.659528125,2.31097090625Q15.640728125,2.35646790625,15.613328125,2.39741390625Q15.586028125,2.43835990625,15.551128125,2.47318190625Q15.516328125,2.50800390625,15.475428125,2.53536390625Q15.434428125,2.56272290625,15.388928125,2.5815689062500002Q15.343428125,2.60041390625,15.295128125,2.61002190625Q15.246828125,2.61962890625,15.197628125,2.61962890625L3.861328125,2.61962890625Q3.812082425,2.61962890625,3.763783025,2.61002190625Q3.715483125,2.60041390625,3.669986125,2.5815689062500002Q3.624489125,2.56272290625,3.583543125,2.53536390625Q3.542597125,2.50800390625,3.507775125,2.47318190625Q3.472953125,2.43835990625,3.445593125,2.39741390625Q3.418234125,2.35646790625,3.3993881249999998,2.31097090625Q3.380543125,2.26547390625,3.370935125,2.21717400625Q3.361328125,2.16887460625,3.361328125,2.11962890625Q3.361328125,2.07038320625,3.370935125,2.02208380625Q3.380543125,1.97378390625,3.3993881249999998,1.9282869062499999Q3.418234125,1.88278990625,3.445593125,1.84184390625Q3.472953125,1.80089790625,3.507775125,1.76607590625Q3.542597125,1.73125390625,3.583543125,1.70389390625Q3.624489125,1.6765349062500001,3.669986125,1.65768890625Q3.715483125,1.63884390625,3.763783025,1.62923590625Q3.812082425,1.61962890625,3.861328125,1.61962890625Z" fillRule="evenodd" fill="currentColor"/></g><g><path d="M8.7259428515625,13.1219296875C8.4485428515625,13.1219296875,8.1766128515625,13.0247296875,7.9571728515625,12.8406296875L6.2048528515625,11.3676296875L4.3211428515625006,12.8704296875C4.1364328515625,13.0181296875,3.8829528515625,13.0456296875,3.6710428515625,12.9422296875C3.4588528515625,12.8384296875,3.3248728515625,12.6222296875,3.3273328515625,12.3856296875L3.3616428515625,9.0443996875L1.7372918515625,7.6123996875C1.4407488515625,7.3634396875,1.2839320515625,6.9709196875,1.3283656515625,6.5719696875C1.3729359515625,6.1726196875,1.6126038515625,5.8248096875,1.9694398515625,5.6406496875L4.3297328515625,4.423929687499999L5.238542851562499,5.3327396875L2.5655328515624998,6.7106096875L4.3812928515625,8.3111696875C4.5148728515625,8.4286096875,4.590472851562501,8.5986896875,4.5887028515625,8.7765596875L4.5647728515625,11.1100296875L5.8332528515625,10.0980896875C5.9416128515625,10.0114596875,6.0762328515625,9.9642996875,6.2149628515625,9.9643796875C6.3551028515625,9.9643796875,6.4949628515625,10.0122296875,6.6088528515625,10.1077996875L8.713502851562499,11.8766296875L9.3832428515625,9.4774396875L10.3768928515625,10.4710796875L9.8814928515625,12.2458296875C9.7714328515625,12.6397296875,9.4722928515625,12.9470296875,9.081682851562501,13.0677296875C8.9645228515625,13.1040296875,8.8446128515625,13.1219296875,8.7259428515625,13.1219296875ZM10.6855128515625,9.3654896875L12.6339228515625,2.3855096875C12.7624228515625,1.9240796875,12.6115228515625,1.4493966875,12.2400228515625,1.1469746875C11.8688228515625,0.8449627875,11.3732228515625,0.7930096875,10.9476228515625,1.0124436875L5.2629028515625,3.9428796875L6.1717228515625,4.8517096875L11.4313228515625,2.1405096875L9.6918628515625,8.3718496875L10.6855128515625,9.3654896875ZM7.1335928515625,5.8135696875L8.152402851562499,4.7950596875C8.3915328515625,4.5559396875000004,8.778852851562501,4.5559396875000004,9.0179728515625,4.7950596875C9.2570928515625,5.0341796875,9.2570928515625,5.4217796875,9.0179728515625,5.6606296875L7.9991628515625,6.6791396875L7.1335928515625,5.8135696875ZM6.4263828515625,6.5205696875L5.8619628515625,7.0848296875C5.6228328515625,7.3236796875,5.6228328515625,7.7112696875,5.8619628515625,7.9503996875C5.9815828515625,8.0700196875,6.1381328515625,8.1297696875,6.2948128515625,8.1297696875C6.4513528515625,8.1297696875,6.6080328515625,8.0700196875,6.7275228515625,7.9503996875L7.2919428515625,7.3861396875L6.4263828515625,6.5205696875Z" fillRule="evenodd" fill="currentColor"/></g></g></svg>
                                <span>{t('cancelPublish')}</span>
                            </div>}
                            {waxberryType !== "0" && <div className="function" onClick={()=>this.run(item)}>
                                <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="16" height="16" viewBox="0 0 16 16"><defs><clipPath id="master_svg0_172_71066"><rect x="0" y="0" width="16" height="16" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_172_71066)"><g><path d="M5.535952828125,4.0113113125L8.339108828125,5.9401353125L11.229788828124999,7.9281153125C11.239968828125,7.9345753125,11.266438828125,7.9539353125,11.266438828125,8.0001953125C11.266438828125,8.046455312500001,11.239968828125,8.0658153125,11.229788828124999,8.0722753125L8.340118828125,10.061335312499999L5.535952828125,11.9901553125C5.533916828125,11.9793953125,5.532898828125,11.9675653125,5.532898828125,11.9525053125L5.532898828125,4.0489623125000005C5.532898828125,4.0349783125,5.534934828125,4.0220693125,5.535952828125,4.0113113125ZM5.512541828125,3.2001953125C5.141027828125,3.2001953125,4.800048828125,3.5541173125,4.800048828125,4.0489623125000005L4.800048828125,11.9514253125C4.800048828125,12.4462753125,5.141027828125,12.8001953125,5.512541828125,12.8001953125C5.630612828125,12.8001953125,5.752753828125,12.7646953125,5.866748828125,12.6850853125L8.739118828125001,10.7089353125L11.629808828125,8.7209453125C12.123458828124999,8.3810153125,12.123458828124999,7.6183053125,11.629808828125,7.2783653125L8.739118828125001,5.2903753125L5.867768828125,3.3153003125C5.752753828125,3.2367708125,5.631629828125,3.2001953945733,5.512541828125,3.2001953125Z" fill="currentColor"/></g></g></svg>
                                <span>{t('run')}</span>
                            </div>}
                            <Dropdown menu={{ items: devMenuItems(item),onClick: this.handleWaxberryClick.bind(this,item) }}>
                                <svg className="function" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="16" height="16" viewBox="0 0 16 16"><defs><clipPath id="master_svg0_23_2121"><rect x="16" y="0" width="16" height="16" rx="0"/></clipPath></defs><g transform="matrix(0,1,-1,0,16,-16)" clipPath="url(#master_svg0_23_2121)"><g><path d="M21.5,8Q21.5,8.09849,21.48079,8.19509Q21.461570000000002,8.29169,21.42388,8.38268Q21.38619,8.47368,21.33147,8.55557Q21.27675,8.63746,21.20711,8.70711Q21.13746,8.77675,21.05557,8.83147Q20.97368,8.88619,20.88268,8.92388Q20.79169,8.96157,20.69509,8.98079Q20.598489999999998,9,20.5,9Q20.401509,9,20.30491,8.98079Q20.208311,8.96157,20.117316,8.92388Q20.026322,8.88619,19.94443,8.83147Q19.862537,8.77675,19.792893,8.70711Q19.723249,8.63746,19.66853,8.55557Q19.613811,8.47368,19.5761205,8.38268Q19.5384294,8.29169,19.5192147,8.19509Q19.5,8.09849,19.5,8Q19.5,7.901509,19.5192147,7.80491Q19.5384294,7.708311,19.5761205,7.617316Q19.613811,7.526322,19.66853,7.44443Q19.723249,7.362537,19.792893,7.292893Q19.862537,7.223249,19.94443,7.16853Q20.026322,7.113811,20.117316,7.0761205Q20.208311,7.0384294,20.30491,7.0192147Q20.401509,7,20.5,7Q20.598489999999998,7,20.69509,7.0192147Q20.79169,7.0384294,20.88268,7.0761205Q20.97368,7.113811,21.05557,7.16853Q21.13746,7.223249,21.20711,7.292893Q21.27675,7.362537,21.33147,7.44443Q21.38619,7.526322,21.42388,7.617316Q21.461570000000002,7.708311,21.48079,7.80491Q21.5,7.901509,21.5,8Z" fill="currentColor"/></g><g><path d="M25,8Q25,8.09849,24.98079,8.19509Q24.961570000000002,8.29169,24.92388,8.38268Q24.88619,8.47368,24.83147,8.55557Q24.77675,8.63746,24.70711,8.70711Q24.63746,8.77675,24.55557,8.83147Q24.47368,8.88619,24.38268,8.92388Q24.29169,8.96157,24.19509,8.98079Q24.098489999999998,9,24,9Q23.901509,9,23.80491,8.98079Q23.708311,8.96157,23.617316,8.92388Q23.526322,8.88619,23.44443,8.83147Q23.362537,8.77675,23.292893,8.70711Q23.223249,8.63746,23.16853,8.55557Q23.113811,8.47368,23.0761205,8.38268Q23.0384294,8.29169,23.0192147,8.19509Q23,8.09849,23,8Q23,7.901509,23.0192147,7.80491Q23.0384294,7.708311,23.0761205,7.617316Q23.113811,7.526322,23.16853,7.44443Q23.223249,7.362537,23.292893,7.292893Q23.362537,7.223249,23.44443,7.16853Q23.526322,7.113811,23.617316,7.0761205Q23.708311,7.0384294,23.80491,7.0192147Q23.901509,7,24,7Q24.098489999999998,7,24.19509,7.0192147Q24.29169,7.0384294,24.38268,7.0761205Q24.47368,7.113811,24.55557,7.16853Q24.63746,7.223249,24.70711,7.292893Q24.77675,7.362537,24.83147,7.44443Q24.88619,7.526322,24.92388,7.617316Q24.961570000000002,7.708311,24.98079,7.80491Q25,7.901509,25,8Z" fill="currentColor"/></g><g><path d="M28.5,8Q28.5,8.09849,28.48079,8.19509Q28.461570000000002,8.29169,28.42388,8.38268Q28.38619,8.47368,28.33147,8.55557Q28.27675,8.63746,28.20711,8.70711Q28.13746,8.77675,28.05557,8.83147Q27.97368,8.88619,27.88268,8.92388Q27.79169,8.96157,27.69509,8.98079Q27.598489999999998,9,27.5,9Q27.401509,9,27.30491,8.98079Q27.208311,8.96157,27.117316,8.92388Q27.026322,8.88619,26.94443,8.83147Q26.862537,8.77675,26.792893,8.70711Q26.723249,8.63746,26.66853,8.55557Q26.613811,8.47368,26.5761205,8.38268Q26.5384294,8.29169,26.5192147,8.19509Q26.5,8.09849,26.5,8Q26.5,7.901509,26.5192147,7.80491Q26.5384294,7.708311,26.5761205,7.617316Q26.613811,7.526322,26.66853,7.44443Q26.723249,7.362537,26.792893,7.292893Q26.862537,7.223249,26.94443,7.16853Q27.026322,7.113811,27.117316,7.0761205Q27.208311,7.0384294,27.30491,7.0192147Q27.401509,7,27.5,7Q27.598489999999998,7,27.69509,7.0192147Q27.79169,7.0384294,27.88268,7.0761205Q27.97368,7.113811,28.05557,7.16853Q28.13746,7.223249,28.20711,7.292893Q28.27675,7.362537,28.33147,7.44443Q28.38619,7.526322,28.42388,7.617316Q28.461570000000002,7.708311,28.48079,7.80491Q28.5,7.901509,28.5,8Z" fill="currentColor" fillOpacity="1"/></g></g></svg>
                            </Dropdown>
                        </div>
                    </div>
                ))}
            </div>
        }
        const CardList=()=>{
            return <div className="content-data-waxberry">
                <div className="content-data">{waxberryList.map(item=>(
                    <div className="card" key={item.id}>
                        {item.ismodify === 0 && <span className="custom">{t('waxberryPlaza.customizable')}</span>}
                        <img onClick={()=>window.open(`/waxberry_detail?id=${item.id}`,"_self")} src={item.coverFileId ? `${globalInitConfig.REACT_APP_API_FS_URL}file/download/${item.coverFileId}` : CardDefaultPng} width="324" height="180"/>
                        <div className="card-title">
                            <div className="label">
                                <div className="labelName">{item.name}</div>
                                <div
                                    className="typeFrame"
                                >
                                    {iconMap[item.type].icon}
                                    {iconMap[item.type].name}
                                </div>
                            </div>
                            <div className="user">
                                <img src={item.avatarUrl ? `${globalInitConfig.REACT_APP_API_FS_URL}file/download/${item.avatarUrl}` : CardDefaultPng1} width={20} height={20}/>
                                {item.creatorName}
                            </div>
                        </div>
                        <div className="card-desc">{t('waxberryForm.introduction')}：{item.discription}</div>
                        <div className="card-tags">
                            {item.agentLabel && item.agentLabel.split(",").map(label=>(
                                <span className="tag" key={label}>{label}</span>
                            ))}
                        </div>
                        <div className="card-footer">
                            <div className="data">
                                <div><HeartOutlined />{item.likeCount}</div>
                                <div><StarOutlined />{item.collectCount}</div>
                            </div>
                            <div className="runDiv">
                                <div className="run" onClick={()=>this.run(item)}><img src={RunSvg}/>{t('run')}</div>
                                <div className="count">0</div>
                            </div>
                        </div>
                    </div>
                ))}</div>
            </div>
        }
        const EmptyMyDevelopmentList=()=>{
            return <div className="content-data-waxberry-empty">
                <img src={Empty1Png}/>
                <span className="desc">{t('myWaxberry.noWaxberry')}</span>
                {/*<span className="link" onClick={()=>this.createWaxberry()}>{t('myWaxberry.createWaxberry')}</span>*/}
            </div>
        }
        const EmptyCommonList=()=>{
            return <div className="content-data-waxberry-empty">
                <img src={Empty2Png} width="186" height="186"/>
                <span className="desc">{t('myWaxberry.noUseWaxberry')}</span>
                <span className="link" onClick={()=>this.createWaxberry()}>
                  <img src={AppstoreSvg}/>{t('menu.waxberryPlaza')}
                </span>
            </div>
        }
        const computeKey=(type,isEmpty)=>{
            const second=Number(Boolean(isEmpty)).toString();
            return type+second;
        }
        const viewMap={
            '01':()=><>
                {ContentDataFolder()}
                {CommonList()}
            </>,
            '11':()=><>
                {ContentDataFolder()}
                {CommonList()}
            </>,
            '00':()=><>
                {ContentDataFolder()}
                {EmptyMyDevelopmentList()}
            </>,
            '10':()=><>
                {ContentDataFolder()}
                {EmptyCommonList()}
            </>,
            '20':()=><>
                {EmptyCommonList()}
            </>,
            '21':()=>CardList(),
            '30':()=>EmptyCommonList(),
            '31':()=>CardList(),
            '40':()=><PromptWordList isComponent={true} registerButton={this.registerButton.bind(this)} viewMode={false}/>,
            '41':()=><PromptWordList isComponent={true} registerButton={this.registerButton.bind(this)} viewMode={false}/>,

        }
        return (

            <>
                <div className="app-content-right right_bj">
                    <div className="content-header">
                        <div className="label">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none"  version="1.1" width="24" height="24" viewBox="0 0 18 18"><defs><clipPath id="master_svg0_280_29827/385_87043"><rect x="0" y="0" width="18" height="18" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_280_29827/385_87043)"><g><path d="M7.0797740625,6.5006748828125Q7.5463840625,3.6750148828125,9.0331040625,1.7870708828125Q9.4039640625,1.2124218828125,9.8753440625,1.0481758828125Q10.0397740625,0.9250584828125,10.2353240625,0.9453853328125Q10.4303740625,0.9659391828125,10.5540840625,1.1301838828125Q10.6774040625,1.2946148828125,10.6461440625,1.4791728828125001Q10.6153140625,1.6639518828125,10.4716440625,1.7870708828125Q10.1224340625,1.8898398828125,9.8753440625,2.2900348828125Q8.5068740625,4.0161748828125,8.0457640625,6.5392548828125C10.7849940625,6.8866348828125,12.9030140625,9.2255048828125,12.9030140625,12.0591048828125C12.9030140625,15.1321048828125,10.4117940625,17.6234048828125,7.3387140625,17.6234048828125C4.2656340625,17.6234048828125,1.7744140625,15.1321048828125,1.7744140625,12.0591048828125C1.7744140625,9.0727748828125,4.1269040624999995,6.6359348828125,7.0797740625,6.5006748828125Z" fillRule="evenodd" fill="currentColor"  fillOpacity="1"/></g><g transform="matrix(0.9404609203338623,-0.33990177512168884,0.33990177512168884,0.9404609203338623,0.4380206931009525,2.8997186351261917)"><path d="M8.55025145,0.199554443359375Q8.05828075,6.425754443359375,12.97370375,10.576454443359374Q12.97396375,2.548024443359375,8.55025145,0.199554443359375Z" fill="currentColor" fillOpacity="1"/></g></g></svg>
                            <span>{t('myWaxberry.waxberry')}</span>
                            <span className="count">({userAgentNum.create}/{userAgentNum.total})</span>
                        </div>
                        {/* {waxberryType==="4"&&<div className="button" onClick={waxberryType!=="4"?this.createWaxberry.bind(this):promptWordCreateButton}>
                <PlusOutlined/>{waxberryType!=="4"?t('myWaxberry.create'):t('myWaxberry.createPromptWord')}</div>} */}
                    </div>
                    <div className="content-data-tool">
                        <div className="waxberry-type">
                            <div className={waxberryType==="0"?"type type-active":"type"} onClick={()=>this.waxberryTypeChange("0")}>{t('myWaxberry.myDevelopment')}</div>
                            {/*<div className={waxberryType==="4"?"type type-active":"type"} onClick={()=>this.waxberryTypeChange("4")}>{t('myWaxberry.myPromptWord')}</div>*/}

                            <div className={waxberryType==="2"?"type type-active":"type"} onClick={()=>this.waxberryTypeChange("2")}>{t('myWaxberry.myFavor')}</div>
                            <div className={waxberryType==="3"?"type type-active":"type"} onClick={()=>this.waxberryTypeChange("3")}>{t('myWaxberry.myCollection')}</div>
                            <div className={waxberryType==="1"?"type type-active":"type"} onClick={()=>this.waxberryTypeChange("1")}>{t('myWaxberry.historyTrail')}</div>

                        </div>
                        <div className="waxberry-operate">
                            <span className="count">{t('myWaxberry.totalItem.prefix')}{waxberryType!=="4"?waxberryList.length:promptWordCount}{t('myWaxberry.totalItem.suffix')}</span>
                            {waxberryType!=="4"&&<Select
                                value={filterType}
                                getPopupContainer={(triggerNode) => triggerNode.parentNode}
                                onChange={this.filterTypeChange.bind(this)}
                                options={[
                                    { value: '', label: t('myWaxberry.allType') },
                                    { value: '0', label: t('myWaxberry.appType') },
                                    { value: '1', label: t('myWaxberry.agentType') },
                                    { value: '2', label: t('myWaxberry.smallModelType') },
                                    // { value: '3', label: '大模型' }
                                ]}
                            />}
                            <div className="sorted" onClick={this.ascendChange.bind(this,promptWordSortButton)}>
                                <svg style={{transform: isAscending?"":"rotate(180deg)"}} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="16" height="16" viewBox="0 0 16 16"><defs><clipPath id="master_svg0_721_66734"><rect x="0" y="0" width="16" height="16" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_721_66734)"><g><path d="M7.66650390625,2.25L14.33317390625,2.25Q14.40704390625,2.25,14.47948390625,2.264411Q14.55193390625,2.278822,14.62018390625,2.30709Q14.68842390625,2.335359,14.74984390625,2.376398Q14.81126390625,2.417437,14.86350390625,2.46967Q14.91573390625,2.521903,14.95677390625,2.583322Q14.99781390625,2.644742,15.026083906250001,2.712987Q15.05434390625,2.781233,15.06876390625,2.853682Q15.08317390625,2.9261315,15.08317390625,3Q15.08317390625,3.0738685,15.06876390625,3.146318Q15.05434390625,3.218767,15.026083906250001,3.287013Q14.99781390625,3.355258,14.95677390625,3.416678Q14.91573390625,3.478097,14.86350390625,3.53033Q14.81126390625,3.582563,14.74984390625,3.623602Q14.68842390625,3.664641,14.62018390625,3.69291Q14.55193390625,3.721178,14.47948390625,3.735589Q14.40704390625,3.75,14.33317390625,3.75L7.66650390625,3.75Q7.59263540625,3.75,7.52018590625,3.735589Q7.44773690625,3.721178,7.37949090625,3.69291Q7.31124590625,3.664641,7.24982590625,3.623602Q7.18840690625,3.582563,7.13617390625,3.53033Q7.08394090625,3.478097,7.04290190625,3.416678Q7.00186290625,3.355258,6.97359390625,3.287013Q6.94532590625,3.218767,6.93091490625,3.146318Q6.91650390625,3.0738685,6.91650390625,3Q6.91650390625,2.9261315,6.93091490625,2.853682Q6.94532590625,2.781233,6.97359390625,2.712987Q7.00186290625,2.644742,7.04290190625,2.583322Q7.08394090625,2.521903,7.13617390625,2.46967Q7.18840690625,2.417437,7.24982590625,2.376398Q7.31124590625,2.335359,7.37949090625,2.30709Q7.44773690625,2.278822,7.52018590625,2.264411Q7.59263540625,2.25,7.66650390625,2.25Z" fillRule="evenodd" fill="currentColor"/></g><g><path d="M4.86350390625,3.196345625Q4.968993906250001,3.090856625,5.026083906249999,2.953028625Q5.08317390625,2.815199625,5.08317390625,2.666015625Q5.08317390625,2.592147125,5.06876390625,2.519697625Q5.054343906250001,2.447248625,5.026083906249999,2.379002625Q4.99781390625,2.310757625,4.95677390625,2.249337625Q4.91573390625,2.187918625,4.86350390625,2.135685625Q4.81126390625,2.083452625,4.74984390625,2.042413625Q4.68842390625,2.001374625,4.62018390625,1.973105625Q4.5519339062499995,1.944837625,4.47948390625,1.930426625Q4.40704390625,1.916015625,4.33317390625,1.916015625Q4.18398390625,1.916015625,4.04615390625,1.973105625Q3.90833390625,2.030196625,3.80284390625,2.135685625L3.80254390625,2.135980625L1.13646890625,4.8020556249999995L1.13617390625,4.802355625000001Q1.0306849062499999,4.907845625,0.97359390625,5.045665625Q0.91650390625,5.183495625,0.91650390625,5.332685625Q0.91650390625,5.406555625,0.93091490625,5.478995625Q0.94532590625,5.5514456249999995,0.97359390625,5.619695625Q1.00186290625,5.687935625,1.04290190625,5.749355625Q1.08394090625,5.810775625,1.13617390625,5.863015625Q1.18840690625,5.915245625,1.24982590625,5.956285625Q1.31124590625,5.997325625,1.37949090625,6.025595624999999Q1.44773690625,6.053855625000001,1.52018590625,6.068275625Q1.5926354062499999,6.082685625,1.66650390625,6.082685625Q1.81568790625,6.082685625,1.95351690625,6.025595624999999Q2.09134490625,5.968505625000001,2.19683390625,5.863015625L2.19712890625,5.862715625L4.86350390625,3.196345625L4.86350390625,3.196345625Z" fillRule="evenodd" fill="currentColor"/></g><g><path d="M3.58349609375,2.666015625Q3.58349609375,2.592147125,3.59790709375,2.519697625Q3.61231809375,2.447248625,3.64058609375,2.379002625Q3.66885509375,2.310757625,3.70989409375,2.249337625Q3.75093309375,2.187918625,3.80316609375,2.135685625Q3.85539909375,2.083452625,3.91681809375,2.042413625Q3.97823809375,2.001374625,4.04648309375,1.973105625Q4.11472909375,1.944837625,4.18717809375,1.930426625Q4.25962759375,1.916015625,4.33349609375,1.916015625Q4.40736459375,1.916015625,4.47981409375,1.930426625Q4.55226309375,1.944837625,4.62050909375,1.973105625Q4.68875409375,2.001374625,4.75017409375,2.042413625Q4.81159309375,2.083452625,4.86382609375,2.135685625Q4.91605909375,2.187918625,4.95709809375,2.249337625Q4.99813709375,2.310757625,5.02640609375,2.379002625Q5.05467409375,2.447248625,5.06908509375,2.519697625Q5.08349609375,2.592147125,5.08349609375,2.666015625L5.08349609375,13.999315625Q5.08349609375,14.073215625,5.06908509375,14.145715625Q5.05467409375,14.218115625,5.02640609375,14.286315625Q4.99813709375,14.354615625,4.95709809375,14.416015625Q4.91605909375,14.477415625,4.86382609375,14.529715625Q4.81159309375,14.581915625,4.75017409375,14.622915625Q4.68875409375,14.664015625,4.62050909375,14.692215625Q4.55226309375,14.720515625,4.47981409375,14.734915625Q4.40736459375,14.749315625,4.33349609375,14.749315625Q4.25962759375,14.749315625,4.18717809375,14.734915625Q4.11472909375,14.720515625,4.04648309375,14.692215625Q3.97823809375,14.664015625,3.91681809375,14.622915625Q3.85539909375,14.581915625,3.80316609375,14.529715625Q3.75093309375,14.477415625,3.70989409375,14.416015625Q3.66885509375,14.354615625,3.64058609375,14.286315625Q3.61231809375,14.218115625,3.59790709375,14.145715625Q3.58349609375,14.073215625,3.58349609375,13.999315625L3.58349609375,2.666015625Z" fillRule="evenodd" fill="currentColor"/></g><g><path d="M7.66650390625,5.583984375L12.99983390625,5.583984375Q13.07370390625,5.583984375,13.14615390625,5.598395375Q13.21860390625,5.612806375,13.28685390625,5.641074375Q13.35509390625,5.669343375,13.41651390625,5.710382375Q13.47793390625,5.751421375,13.53016390625,5.803654375Q13.58240390625,5.855887375,13.62343390625,5.917306375Q13.664473906249999,5.978726375,13.69274390625,6.046971375Q13.72101390625,6.115217375,13.73542390625,6.187666375Q13.74983390625,6.260115875,13.74983390625,6.333984375Q13.74983390625,6.407852875,13.73542390625,6.480302375Q13.72101390625,6.552751375,13.69274390625,6.620997375Q13.664473906249999,6.689242375,13.62343390625,6.750662375Q13.58240390625,6.812081375,13.53016390625,6.864314375Q13.47793390625,6.916547375,13.41651390625,6.957586375Q13.35509390625,6.998625375,13.28685390625,7.026894375Q13.21860390625,7.055162375,13.14615390625,7.069573375Q13.07370390625,7.083984375,12.99983390625,7.083984375L7.66650390625,7.083984375Q7.59263540625,7.083984375,7.52018590625,7.069573375Q7.44773690625,7.055162375,7.37949090625,7.026894375Q7.31124590625,6.998625375,7.24982590625,6.957586375Q7.18840690625,6.916547375,7.13617390625,6.864314375Q7.08394090625,6.812081375,7.04290190625,6.750662375Q7.00186290625,6.689242375,6.97359390625,6.620997375Q6.94532590625,6.552751375,6.93091490625,6.480302375Q6.91650390625,6.407852875,6.91650390625,6.333984375Q6.91650390625,6.260115875,6.93091490625,6.187666375Q6.94532590625,6.115217375,6.97359390625,6.046971375Q7.00186290625,5.978726375,7.04290190625,5.917306375Q7.08394090625,5.855887375,7.13617390625,5.803654375Q7.18840690625,5.751421375,7.24982590625,5.710382375Q7.31124590625,5.669343375,7.37949090625,5.641074375Q7.44773690625,5.612806375,7.52018590625,5.598395375Q7.59263540625,5.583984375,7.66650390625,5.583984375Z" fillRule="evenodd" fill="currentColor"/></g><g><path d="M7.66650390625,8.916015625L11.66650390625,8.916015625Q11.74037390625,8.916015625,11.81282390625,8.930426624999999Q11.88527390625,8.944837625,11.95351390625,8.973105625Q12.021763906250001,9.001374625,12.08318390625,9.042413625Q12.144603906250001,9.083452625,12.19683390625,9.135685625Q12.24906390625,9.187918625,12.29010390625,9.249337625Q12.33114390625,9.310757625,12.359413906250001,9.379002625Q12.38768390625,9.447248625,12.40209390625,9.519697625Q12.41650390625,9.592147125,12.41650390625,9.666015625Q12.41650390625,9.739884125,12.40209390625,9.812333625Q12.38768390625,9.884782625,12.359413906250001,9.953028625Q12.33114390625,10.021273625,12.29010390625,10.082693625Q12.24906390625,10.144112625,12.19683390625,10.196345625Q12.144603906250001,10.248578625,12.08318390625,10.289617625Q12.021763906250001,10.330656625,11.95351390625,10.358925625Q11.88527390625,10.387193625,11.81282390625,10.401604625000001Q11.74037390625,10.416015625,11.66650390625,10.416015625L7.66650390625,10.416015625Q7.59263540625,10.416015625,7.52018590625,10.401604625000001Q7.44773690625,10.387193625,7.37949090625,10.358925625Q7.31124590625,10.330656625,7.24982590625,10.289617625Q7.18840690625,10.248578625,7.13617390625,10.196345625Q7.08394090625,10.144112625,7.04290190625,10.082693625Q7.00186290625,10.021273625,6.97359390625,9.953028625Q6.94532590625,9.884782625,6.93091490625,9.812333625Q6.91650390625,9.739884125,6.91650390625,9.666015625Q6.91650390625,9.592147125,6.93091490625,9.519697625Q6.94532590625,9.447248625,6.97359390625,9.379002625Q7.00186290625,9.310757625,7.04290190625,9.249337625Q7.08394090625,9.187918625,7.13617390625,9.135685625Q7.18840690625,9.083452625,7.24982590625,9.042413625Q7.31124590625,9.001374625,7.37949090625,8.973105625Q7.44773690625,8.944837625,7.52018590625,8.930426624999999Q7.59263540625,8.916015625,7.66650390625,8.916015625Z" fillRule="evenodd" fill="currentColor"/></g><g><path d="M7.66650390625,12.25L10.33317390625,12.25Q10.40704390625,12.25,10.47948390625,12.264410999999999Q10.55193390625,12.278822,10.62018390625,12.30709Q10.68842390625,12.335359,10.74984390625,12.376398Q10.81126390625,12.417437,10.86350390625,12.46967Q10.91573390625,12.521903,10.95677390625,12.583322Q10.99781390625,12.644742,11.02608390625,12.712987Q11.05434390625,12.781233,11.06876390625,12.853682Q11.08317390625,12.9261315,11.08317390625,13Q11.08317390625,13.0738685,11.06876390625,13.146318Q11.05434390625,13.218767,11.02608390625,13.287013Q10.99781390625,13.355258,10.95677390625,13.416678Q10.91573390625,13.478097,10.86350390625,13.53033Q10.81126390625,13.582563,10.74984390625,13.623602Q10.68842390625,13.664641,10.62018390625,13.69291Q10.55193390625,13.721178,10.47948390625,13.735589000000001Q10.40704390625,13.75,10.33317390625,13.75L7.66650390625,13.75Q7.59263540625,13.75,7.52018590625,13.735589000000001Q7.44773690625,13.721178,7.37949090625,13.69291Q7.31124590625,13.664641,7.24982590625,13.623602Q7.18840690625,13.582563,7.13617390625,13.53033Q7.08394090625,13.478097,7.04290190625,13.416678Q7.00186290625,13.355258,6.97359390625,13.287013Q6.94532590625,13.218767,6.93091490625,13.146318Q6.91650390625,13.0738685,6.91650390625,13Q6.91650390625,12.9261315,6.93091490625,12.853682Q6.94532590625,12.781233,6.97359390625,12.712987Q7.00186290625,12.644742,7.04290190625,12.583322Q7.08394090625,12.521903,7.13617390625,12.46967Q7.18840690625,12.417437,7.24982590625,12.376398Q7.31124590625,12.335359,7.37949090625,12.30709Q7.44773690625,12.278822,7.52018590625,12.264410999999999Q7.59263540625,12.25,7.66650390625,12.25Z" fillRule="evenodd" fill="currentColor"/></g></g></svg>
                            </div>

                        </div>
                    </div>

                    {viewMap[computeKey(waxberryType,Boolean(waxberryList.length>0))]()}

                </div>

                {showWaxberryModal && <div className="waxberry-modal">
                    <div className="waxberry-modal-box">
                        <div className="waxberry-modal-title">
                            <span>{t('waxberryForm.waxberryAttributes')}</span>
                            <CloseOutlined onClick={this.hideWaxberryModal.bind(this)}/>
                        </div>
                        <div className="waxberry-modal-content">
                            <div className="form">
                                <div className="pic">
                                    <div className="icon">
                                        <span className="label">{t('waxberryForm.icon')}</span>
                                        <Spin spinning={iconSpinning1}>
                                            <CustomUpload {...props}>
                                                <img src={waxberryObj.imgeFileId ? `${globalInitConfig.REACT_APP_API_FS_URL}file/download/${waxberryObj.imgeFileId}` : DefaultPng} width="90" height="90"/>
                                            </CustomUpload>
                                        </Spin>
                                        <span className="size">{t('waxberryForm.recommendedAspectRatio')}：1:1</span>
                                        <img onClick={()=>this.generateImage('imgeFileId','iconSpinning1')} src={AiSvg} className="ai1"/>
                                    </div>
                                    <div className="icon">
                                        <span className="label">{t('waxberryForm.cover')}</span>
                                        <Spin spinning={iconSpinning2}>
                                            <CustomUpload {...coverProps}>
                                                <img src={waxberryObj.coverFileId ? `${globalInitConfig.REACT_APP_API_FS_URL}file/download/${waxberryObj.coverFileId}` : CardDefaultPng} width="160" height="90"/>
                                            </CustomUpload>
                                        </Spin>
                                        <span className="size">{t('waxberryForm.recommendedAspectRatio')}：16:9</span>
                                        <img onClick={()=>this.generateImage('coverFileId','iconSpinning2')} src={AiSvg} className="ai2"/>
                                    </div>
                                </div>
                                <div className="form-item">
                                    <span className="label"><font color="red">* </font>{t('waxberryForm.name')}</span>
                                    <Input value={waxberryObj.name} onChange={(e)=>this.waxberryObjChange("name",e.target.value)} placeholder={t('waxberryForm.pleaseEnter')}/>
                                </div>
                                <div className="form-item">
                                    <span className="label"><font color="red">* </font>{t('waxberryForm.introduction')}</span>
                                    <TextArea rows={4} value={waxberryObj.discription} onChange={(e)=>this.waxberryObjChange("discription",e.target.value)} placeholder={t('waxberryForm.pleaseEnter')}/>
                                </div>
                                <div className="form-item">
                                    <span className="label"><font color="red">* </font>{t('waxberryForm.category')}</span>
                                    <Cascader
                                        options={agentMenuList}
                                        allowClear={false}
                                        value={waxberryObj.groupId ? waxberryObj.groupId.split('-') : []}
                                        onChange={(value)=>this.waxberryObjChange("groupId",value.join('-'))}
                                        placeholder={t('waxberryForm.pleaseSelectCategory')}
                                    />
                                </div>
                                <div className="form-item">
                                    <span className="label">{t('waxberryForm.tags')}</span>
                                    <Select
                                        mode="tags"
                                        notFoundContent={t('waxberryForm.createTags')}
                                        value={waxberryObj.agentLabel ? waxberryObj.agentLabel.split(',') : []}
                                        onChange={(value)=>this.waxberryObjChange("agentLabel",value.join(','))}
                                        placeholder={t('waxberryForm.createTags')}
                                    />
                                </div>
                                <div className="form-item">
                                    <span className="label">{t('waxberryForm.relatedAttachments')}</span>
                                    <CustomUpload {...attachmentProps} fileList={waxberryObj.fileList}>
                                        <div className="upload">{t('upload')}</div>
                                    </CustomUpload>
                                </div>
                                <div className="isEdit">
                                    <span>{t('waxberryForm.isModificationAllowed')}</span><Switch checked={waxberryObj.ismodify===0} onChange={(checked)=>this.waxberryObjChange("ismodify",checked?0:1)} />
                                </div>
                            </div>
                            <div className="detail">
                                <div className="labelBox">
                                    <input type="file" accept=".md" id="fileInput" style={{display:'none'}} onChange={this.handleFileChange.bind(this)}/>
                                    <span className="label">{t('waxberryForm.details')}：</span>
                                    <img onClick={()=>this.generate_user_prompt()} src={AiSvg} className="ai"/>
                                    <div className="upload" onClick={()=>document.getElementById('fileInput').click()}>
                                        <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="16" height="16" viewBox="0 0 16 16"><defs><clipPath id="master_svg0_172_55337"><rect x="0" y="0" width="16" height="16" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_172_55337)"><g><path d="M8.09844,7.17188C8.04844,7.10781,7.95156,7.10781,7.90156,7.17188L6.15156,9.38594C6.0875,9.46719,6.14531,9.5875,6.25,9.5875L7.40469,9.5875L7.40469,13.375C7.40469,13.4438,7.46094,13.5,7.52969,13.5L8.46719,13.5C8.53594,13.5,8.59219,13.4438,8.59219,13.375L8.59219,9.58906L9.75,9.58906C9.85469,9.58906,9.9125,9.46875,9.84844,9.3875L8.09844,7.17188ZM12.6781,5.72969C11.9625,3.84219,10.13906,2.5,8.003129999999999,2.5C5.86719,2.5,4.04375,3.84063,3.32812,5.72813C1.989063,6.079689999999999,1,7.3,1,8.75C1,10.47656,2.39844,11.875,4.12344,11.875L4.75,11.875C4.81875,11.875,4.875,11.81875,4.875,11.75L4.875,10.8125C4.875,10.74375,4.81875,10.6875,4.75,10.6875L4.12344,10.6875C3.59687,10.6875,3.10156,10.47812,2.7328099999999997,10.09844C2.36562,9.72031,2.1703099999999997,9.21094,2.1875,8.68281C2.2015599999999997,8.27031,2.34219,7.88281,2.59687,7.55625C2.8578099999999997,7.22344,3.22344,6.98125,3.62969,6.87344L4.22187,6.71875L4.43906,6.14687C4.57344,5.79063,4.76094,5.45781,4.9968699999999995,5.15625C5.22969,4.85625,5.50625,4.59531,5.81562,4.37656C6.45781,3.925,7.21406,3.68594,8.00312,3.68594C8.79219,3.68594,9.54844,3.925,10.19062,4.37656C10.50156,4.59531,10.77656,4.857810000000001,11.0094,5.15625C11.2453,5.45781,11.4328,5.79219,11.5672,6.14687L11.7828,6.71719L12.3734,6.87344C13.2203,7.10156,13.8125,7.87187,13.8125,8.75C13.8125,9.26719,13.6109,9.75469,13.2453,10.12031C12.8797,10.48594,12.3938,10.6875,11.8766,10.6875L11.25,10.6875C11.1812,10.6875,11.125,10.74375,11.125,10.8125L11.125,11.75C11.125,11.81875,11.1812,11.875,11.25,11.875L11.8766,11.875C13.6016,11.875,15,10.47656,15,8.75C15,7.30156,14.0141,6.08281,12.6781,5.72969Z" fill="currentColor"/></g></g></svg>
                                        <span>{t('waxberryForm.upload')}</span>
                                    </div>
                                </div>
                                <Spin spinning={detailSpinning}>
                                    <CodeEditor
                                        value={waxberryObj.detail}
                                        language="markdown"
                                        readOnly={false}
                                        onChange={(value)=>this.waxberryObjChange("detail",value)}
                                    />
                                </Spin>
                            </div>
                        </div>
                        {showWaxberryModal==="edit"?
                            <div className="waxberry-modal-footer">
                                <div className="close" onClick={this.hideWaxberryModal.bind(this)}>{t('cancel')}</div>
                                <div className="ok" onClick={this.waxberryModalOk.bind(this)}>{t('confirm')}</div>
                            </div> :
                            <div className="waxberry-modal-footer">
                                <div className="close" onClick={this.hideWaxberryModal.bind(this)}>{t('cancel')}</div>
                                <div className="ok" onClick={()=>this.publishModalOk(true)}>{t('publish')}</div>
                            </div>
                        }
                    </div>
                </div>}
                {showMoveModal && <div className="move-modal">
                    <div className="move-modal-box">
                        <div className="move-modal-title">
                            <span>{t('move')}</span>
                            <CloseOutlined onClick={this.hideMoveModal.bind(this)}/>
                        </div>
                        <div className="move-modal-content">
                            <span className="label">{t('myWaxberry.moveItem.prefix')}{waxberryObj.name}{t('myWaxberry.moveItem.suffix')}：</span>
                            <div className="folderList">
                                {folderList.map(item=> {
                                    if(item.id === waxberryObj.classificationId){
                                        return;
                                    }
                                    return (
                                        <div key={item.id} className={moveFolderId === item.id ? "folder folder-active" : "folder"}
                                             onClick={() => this.selectMoveFolder(item.id)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="16" height="16" viewBox="0 0 16 16"><defs><clipPath id="master_svg0_721_84128"><rect x="0" y="0" width="16" height="16" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_721_84128)"><g><path d="M13.99879988079071,13.0133Q14.46409988079071,12.46809,14.46409988079071,11.70537L14.46409988079071,6.98037Q14.46409988079071,6.21936,13.99869988079071,5.67468Q13.51839988079071,5.1125,12.83159988079071,5.1125L8.127239880790711,5.1125Q8.03143988079071,4.783440000000001,7.95584988079071,4.4490099999999995L7.95413988079071,4.44181Q7.736899880790711,3.541384,7.604649880790711,3.267117Q7.35529988079071,2.75,6.86674988079071,2.75L3.3816298807907104,2.75Q2.6946938807907106,2.75,2.2148158807907103,3.3125489999999997Q1.7499998807907104,3.85744,1.7499998807907104,4.61963L1.7499998807907104,11.70625Q1.7499998807907104,12.46844,2.2148158807907103,13.0133Q2.6946958807907104,13.5759,3.3816198807907103,13.5759L12.83159988079071,13.5759Q13.518699880790711,13.5759,13.99879988079071,13.0133ZM13.08689988079071,11.76938Q13.08769988079071,11.75804,13.08829988079071,11.7465L13.08829988079071,6.98125Q13.08829988079071,6.75605,12.98109988079071,6.59908Q12.90489988079071,6.4875,12.83079988079071,6.4875L7.71724988079071,6.4875Q7.22435988079071,6.4875,6.972379880790711,5.96307Q6.838209880790711,5.68382,6.61753988079071,4.76729Q6.52996988079071,4.40242,6.47015988079071,4.1833100000000005Q6.461819880790711,4.15274,6.454009880790711,4.125L3.3816298807907104,4.125Q3.3079298807907103,4.125,3.2319998807907107,4.2366399999999995Q3.1249998807907104,4.3939699999999995,3.1249998807907104,4.61963L3.1249998807907104,11.70625Q3.1249998807907104,11.93189,3.23205988079071,12.08942Q3.3082298807907105,12.20152,3.3819398807907106,12.20175L12.83159988079071,12.20175Q12.90539988079071,12.20175,12.98169988079071,12.0896Q13.07379988079071,11.95431,13.08689988079071,11.76938Z" fillRule="evenodd" fill="currentColor" fillOpacity="1"/></g></g></svg>
                                            <span className="name">{item.name}</span>
                                            <span className="time">{moment(item.createTime).fromNow()}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                        <div className="move-modal-footer">
                            <div className="ok" onClick={this.moveModalOk.bind(this)}>{t('move')}</div>
                            <div className="close" onClick={this.hideMoveModal.bind(this)}>{t('cancel')}</div>
                        </div>
                    </div>
                </div>}
                {deleteObj && <div className="custom-modal">
                    <div className="custom-modal-box">
                        <div className="custom-modal-title">
                            <span>{t('myWaxberry.confirmDeletion')}</span>
                            <CloseOutlined onClick={this.hideDeleteModal.bind(this)}/>
                        </div>
                        <div className="custom-modal-content">
                            <img src={WarningSvg}/>{t('myWaxberry.deleteItem.prefix')}{deleteObj.name}{t('myWaxberry.deleteItem.suffix')}
                        </div>
                        <div className="custom-modal-footer">
                            <div className="ok" onClick={this.deleteObj.bind(this)}>{t('confirm')}</div>
                            <div className="close" onClick={this.hideDeleteModal.bind(this)}>{t('cancel')}</div>
                        </div>
                    </div>
                </div>}
                {this.state.showRunErrModal && <div className="custom-modal">
                    <div className="custom-modal-box">
                        <div className="custom-modal-title">
                            <span>{t('confirm')}</span>
                            <CloseOutlined onClick={()=>this.setState({showRunErrModal: false})}/>
                        </div>
                        <div className="custom-modal-content">
                            <img src={WarningSvg}/>{t('message.runErr')}
                        </div>
                        <div className="custom-modal-footer">
                            <div className="ok" onClick={()=>this.setState({showRunErrModal: false})}>{t('confirm')}</div>
                        </div>
                    </div>
                </div>}
                {this.state.showPublishModal && <div className="custom-modal">
                    <div className="custom-modal-box">
                        <div className="custom-modal-title">
                            <span>{t('myWaxberry.publishReview')}</span>
                            <CloseOutlined onClick={()=>this.setState({showPublishModal: false})}/>
                        </div>
                        <div className="custom-modal-content">
                            <img src={WarningSvg}/>{t('message.publicMessage')}
                        </div>
                        <div className="custom-modal-footer">
                            <div className="ok" onClick={()=>this.publishModalOk()}>{t('publish')}</div>
                            <div className="close" onClick={()=>this.setState({showPublishModal: false})}>{t('cancel')}</div>
                        </div>
                    </div>
                </div>}
            </>
        );
    }
}
export default withTranslation()(App);
