import React, { useEffect,useState,useRef } from 'react';
import ReactDOM from 'react-dom';

import Header from '../components/header/index';
import LeftMenu from '../components/menu/index';
import getCurrentUser from '@components/getCurrentUser';

import axios from 'axios';
import { useMenu } from '@/pages/waxberryAi/components/menu/menuContext';
import { Input,Form } from 'antd';
import { HeartOutlined,StarOutlined,CloseOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import Empty2Png from '../img/empty2.png';
import RunSvg from "../img/run.svg";
import CardDefaultPng from '../img/cardDefault.png';
import CardDefaultPng1 from '../img/cardDefault1.png';
import LargeModelPng from '@/pages/waxberryAi/components/menu/img/largeModel.png';

const AppIcon=()=> <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="14" height="14" viewBox="0 0 14 14"><defs><clipPath id="master_svg0_228_42520"><rect x="0" y="0" width="14" height="14" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_228_42520)"><g><path d="M5.42795375,6.7450584375L2.36232175,6.7450584375C1.88183575,6.7450584375,1.49609375,6.3593184375,1.49609375,5.8788284375L1.49609375,2.8131984375C1.49609375,2.3394754375,1.8886037500000001,1.9469654375,2.36232175,1.9469654375L5.42795375,1.9469654375C5.90844375,1.9469654375,6.29418375,2.3327074375,6.29418375,2.8131984375L6.29418375,5.8788284375C6.29418375,6.3593184375,5.90844375,6.7450584375,5.42795375,6.7450584375ZM5.42795375,12.5040984375L2.36232175,12.5040984375C1.88183575,12.5040984375,1.49609375,12.1183984375,1.49609375,11.6378984375L1.49609375,8.5722584375C1.49609375,8.0917684375,1.88183575,7.7060284375,2.36232175,7.7060284375L5.42795375,7.7060284375C5.90844375,7.7060284375,6.29418375,8.0917684375,6.29418375,8.5722584375L6.29418375,11.6378984375C6.29418375,12.1115984375,5.90844375,12.5040984375,5.42795375,12.5040984375ZM11.18701375,12.5040984375L8.12138375,12.5040984375C7.64089375,12.5040984375,7.25515375,12.1183984375,7.25515375,11.6378984375L7.25515375,8.5722584375C7.25515375,8.0917684375,7.64089375,7.7060284375,8.12138375,7.7060284375L11.18701375,7.7060284375C11.66749375,7.7060284375,12.05329375,8.0917684375,12.05329375,8.5722584375L12.05329375,11.6378984375C12.05329375,12.1115984375,11.66069375,12.5040984375,11.18701375,12.5040984375ZM12.26299375,3.7403284375L10.25988375,1.7371764375C9.92151375,1.3988059375,9.37335375,1.3988059375,9.03498375,1.7371764375L7.03183375,3.7403284375C6.69346375,4.0786984375,6.69346375,4.6268584375,7.03183375,4.9652284375L9.03498375,6.9683784375C9.37335375,7.3067484375,9.92151375,7.3067484375,10.25988375,6.9683784375L12.26299375,4.9652284375C12.60139375,4.6200884375,12.60139375,4.0719284375,12.26299375,3.7403284375ZM9.82677375,6.0412484375C9.73202375,6.1359884375,9.56960375,6.1359884375,9.47486375,6.0412484375L7.95896375,4.5253484375C7.86422375,4.4306084375,7.86422375,4.2681884375,7.95896375,4.1734384375L9.47486375,2.6575384375C9.56960375,2.5627984374999997,9.73202375,2.5627984374999997,9.82677375,2.6575384375L11.34266375,4.1734384375C11.43741375,4.2681884375,11.43741375,4.4306084375,11.34266375,4.5253484375L9.82677375,6.0412484375Z" fill="currentColor"/></g></g></svg>
const IntelligenceIcon=()=><svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="14" height="14" viewBox="0 0 14 14"><defs><clipPath id="master_svg0_228_40372"><rect x="0" y="0" width="14" height="14" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_228_40372)"><g><path d="M8.84917,5.93081L9.52331,7.72197C9.61961,8.00479,9.81222,8.19334,10.101130000000001,8.28761L11.93092,8.94751C12.17168,9.04178,12.31614,9.3246,12.21984,9.56028C12.17168,9.70168,12.07538,9.79596,11.93092,9.84309L10.101130000000001,10.50299C9.81222,10.59727,9.61961,10.78581,9.52331,11.0686L8.84917,12.8127C8.75287,13.0483,8.46396,13.1897,8.223189999999999,13.0955C8.07874,13.0483,7.98243,12.9541,7.93428,12.8127L7.26015,11.0215C7.16384,10.73868,6.97123,10.55013,6.68232,10.45586L4.90069,9.79596C4.65992,9.70168,4.5154700000000005,9.41887,4.61177,9.18319C4.65992,9.04178,4.75623,8.94751,4.90069,8.90037L6.73047,8.24047C7.01939,8.1462,7.212,7.95765,7.3083,7.67484L7.98243,5.88367C8.07874,5.64799,8.367650000000001,5.50658,8.60841,5.60086C8.70472,5.69513,8.801020000000001,5.7894,8.84917,5.93081ZM5.14145,1.122942L5.52667,2.1128C5.57482,2.2542,5.71927,2.39561,5.86373,2.44275L6.87493,2.81984C7.01939,2.8669700000000002,7.11569,3.00838,7.06754,3.14979C7.01939,3.24406,6.97123,3.2912,6.87493,3.33833L5.815580000000001,3.66828C5.67112,3.71542,5.52666,3.85683,5.47851,3.99823L5.09329,4.98809C5.04514,5.1295,4.9006799999999995,5.22377,4.75623,5.17663C4.65992,5.1295,4.61177,5.08236,4.56362,4.98809L4.1784,3.99823C4.13025,3.85683,3.9857899999999997,3.71542,3.84133,3.66828L2.830135,3.29119C2.6856783,3.24406,2.5893733,3.10265,2.6375262,2.96124C2.6856783,2.8669700000000002,2.733831,2.81984,2.830135,2.7727L3.84133,2.39561C3.9857899999999997,2.34848,4.13025,2.20707,4.1784,2.0656600000000003L4.56362,1.075805C4.61177,0.9343975,4.75623,0.8401253,4.9006799999999995,0.8872618C5.04514,0.981534,5.09329,1.02867,5.14145,1.122942Z" fill="currentColor"/></g></g></svg>
const SmallModuleIcon=()=> <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="14" height="14" viewBox="0 0 14 14"><defs><clipPath id="master_svg0_228_41378"><rect x="0" y="0" width="14" height="14" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_228_41378)"><g><path d="M6.290859375,13.74637578125C6.485159375,13.85867578125,6.705179375,13.91897578125,6.929609375,13.92137578125C7.154039375,13.91897578125,7.374059375,13.85867578125,7.568359375,13.74637578125L12.485909375,10.93757578125C12.879909375,10.71007578125,13.123209375,10.29007578125,13.124609375,9.83507578125L13.124609375,4.20882578125C13.114409375,3.74460578125,12.853109375,3.32248578125,12.442109375,3.10632578125L7.568359375,0.28882878125C7.173099375,0.06062488125,6.686119375,0.06062488125,6.290859375,0.28882878125L1.425859375,3.10632578125C1.031787375,3.33384578125,0.788480965,3.75379578125,0.787109375,4.20882578125L0.787109375,9.83507578125C0.788428635,10.28787578125,1.027702375,10.70657578125,1.417109375,10.93757578125L6.290859375,13.74637578125ZM3.997759375,5.90196578125Q3.845559375,6.05146578125,3.648119375,6.13222578125Q3.450669375,6.21298578125,3.237339375,6.21298578125Q3.184029375,6.21298578125,3.130979375,6.20775578125Q3.077919375,6.20253578125,3.025629375,6.19212578125Q2.973339375,6.18172578125,2.922329375,6.16624578125Q2.871309375,6.15076578125,2.822049375,6.13036578125Q2.772799375,6.10996578125,2.725779375,6.08482578125Q2.6787593750000003,6.05968578125,2.634439375,6.03006578125Q2.590109375,6.00044578125,2.548899375,5.96661578125Q2.507689375,5.93278578125,2.469989375,5.89508578125Q2.432289375,5.85738578125,2.398469375,5.81616578125Q2.364649375,5.77494578125,2.335029375,5.73061578125Q2.305409375,5.68627578125,2.280279375,5.63925578125Q2.2551493750000002,5.59222578125,2.234739375,5.54296578125Q2.2143393749999998,5.49370578125,2.198869375,5.44267578125Q2.183389375,5.39165578125,2.1729893750000002,5.33935578125Q2.162589375,5.28705578125,2.157359375,5.23399578125Q2.152139375,5.18093578125,2.152139375,5.12761578125Q2.152139375,5.07428578125,2.157359375,5.02122578125Q2.162589375,4.96816578125,2.1729893750000002,4.91586578125Q2.183389375,4.86356578125,2.198869375,4.81254578125Q2.2143393749999998,4.76151578125,2.234739375,4.71225578125Q2.2551493750000002,4.66299578125,2.280279375,4.61596578125Q2.305409375,4.56894578125,2.335029375,4.52460578125Q2.364649375,4.48027578125,2.398469375,4.43905578125Q2.432289375,4.39783578125,2.469989375,4.36013578125Q2.507689375,4.32243578125,2.548899375,4.28860578125Q2.590109375,4.25477578125,2.634439375,4.22515578125Q2.6787593750000003,4.19553578125,2.725779375,4.17039578125Q2.772799375,4.14526578125,2.822049375,4.12485578125Q2.871309375,4.10444578125,2.922329375,4.088975781249999Q2.973339375,4.07349578125,3.025629375,4.06309578125Q3.077919375,4.05268578125,3.130979375,4.047465781250001Q3.184029375,4.04223578125,3.237339375,4.04223578125Q3.341979375,4.04223578125,3.444679375,4.06222578125Q3.547379375,4.08222578125,3.644369375,4.12147578125Q3.741359375,4.16072578125,3.829069375,4.21778578125Q3.916779375,4.27484578125,3.991969375,4.34760578125Q4.067159375,4.42037578125,4.127069375,4.50617578125Q4.186979375,4.59197578125,4.229389375,4.68763578125Q4.2717993750000005,4.78329578125,4.295159375,4.88530578125Q4.318519375,4.98730578125,4.3219593750000005,5.09189578125L6.932629375,6.09905578125L9.538179375,5.07922578125Q9.542799375,4.97550578125,9.566999375,4.87455578125Q9.591199375,4.77359578125,9.634109375,4.67905578125Q9.677019375,4.58452578125,9.737069375,4.49983578125Q9.797129375,4.41515578125,9.872149375,4.34339578125Q9.947179375,4.27163578125,10.034449375,4.21540578125Q10.121719375,4.15917578125,10.218069375,4.12051578125Q10.314429375,4.08185578125,10.416359375,4.06216578125Q10.518289375,4.042475781249999,10.622109375,4.042475781249999Q10.675409375,4.042475781249999,10.728459375,4.04770578125Q10.781499375,4.05292578125,10.833809375,4.0633257812500005Q10.886109375,4.073725781249999,10.937109375,4.08919578125Q10.988109375,4.10467578125,11.037309375,4.12507578125Q11.086609375,4.14546578125,11.133609375,4.17059578125Q11.180609375,4.19572578125,11.224909375,4.22533578125Q11.269209375,4.25494578125,11.310409375,4.28876578125Q11.351609375,4.32257578125,11.389309375,4.36026578125Q11.427009375,4.39795578125,11.460809375,4.43916578125Q11.494609375,4.48036578125,11.524209375,4.52468578125Q11.553909375,4.56900578125,11.579009375,4.61601578125Q11.604109375,4.66302578125,11.624509375,4.71226578125Q11.644909375,4.76151578125,11.660409375,4.81252578125Q11.675909375,4.86352578125,11.686309375,4.91580578125Q11.696709375,4.96808578125,11.701909375,5.02113578125Q11.707109375,5.07417578125,11.707109375,5.12747578125Q11.707109375,5.18078578125,11.701909375,5.23382578125Q11.696709375,5.28687578125,11.686309375,5.33915578125Q11.675909375,5.39143578125,11.660409375,5.44243578125Q11.644909375,5.49344578125,11.624509375,5.54269578125Q11.604109375,5.59193578125,11.579009375,5.63894578125Q11.553909375,5.68595578125,11.524209375,5.73027578125Q11.494609375,5.77459578125,11.460809375,5.81579578125Q11.427009375,5.85699578125,11.389309375,5.89469578125Q11.351609375,5.93238578125,11.310409375,5.96619578125Q11.269209375,6.00001578125,11.224909375,6.02962578125Q11.180609375,6.05923578125,11.133609375,6.08436578125Q11.086609375,6.10949578125,11.037309375,6.12988578125Q10.988109375,6.15028578125,10.937109375,6.16575578125Q10.886109375,6.18123578125,10.833809375,6.19163578125Q10.781499375,6.20203578125,10.728459375,6.20725578125Q10.675409375,6.21247578125,10.622109375,6.21247578125Q10.402589375,6.21247578125,10.200329375,6.12714578125Q9.998079375,6.04180578125,9.844899375,5.88455578125L7.306639375,6.90472578125L7.306639375,10.25997578125Q7.388869375,10.28577578125,7.466019375,10.32417578125Q7.543159375,10.36257578125,7.613279375,10.41267578125Q7.683399375,10.46277578125,7.744739375,10.52327578125Q7.806079375,10.58377578125,7.857099375,10.65327578125Q7.908129375,10.72267578125,7.947559375,10.79937578125Q7.986989375,10.87597578125,8.013839375,10.95787578125Q8.040689375,11.03977578125,8.054279375,11.12487578125Q8.067879375,11.20997578125,8.067879375,11.29617578125Q8.067879375,11.34957578125,8.062649375,11.40257578125Q8.057419375,11.45567578125,8.047019375,11.50797578125Q8.036619375,11.56037578125,8.021139375,11.61137578125Q8.005659375,11.66237578125,7.985249375,11.71167578125Q7.964849375,11.76097578125,7.939709375,11.80797578125Q7.914569375,11.85507578125,7.884949375,11.89937578125Q7.855329375,11.94377578125,7.821499375,11.98497578125Q7.787669375,12.02617578125,7.749959375,12.06397578125Q7.712259375,12.10167578125,7.671039375,12.13547578125Q7.629819375,12.16937578125,7.585479375,12.19897578125Q7.541149375,12.22857578125,7.494119375,12.25377578125Q7.447089375,12.27887578125,7.397829375,12.29927578125Q7.348569375,12.31967578125,7.297539375,12.33517578125Q7.246509375,12.35067578125,7.194209375,12.36107578125Q7.141919375,12.37147578125,7.088849375,12.37667578125Q7.035779375,12.38197578125,6.982459375,12.38197578125Q6.929139375,12.38197578125,6.876069375,12.37667578125Q6.823009375,12.37147578125,6.770709375,12.36107578125Q6.718409375,12.35067578125,6.667379375,12.33517578125Q6.616359375,12.31967578125,6.567089375,12.29927578125Q6.517829375,12.27887578125,6.470799375,12.25377578125Q6.423769375,12.22857578125,6.379439375,12.19897578125Q6.335099375,12.16937578125,6.293879375,12.13547578125Q6.252659375,12.10167578125,6.214959375,12.06397578125Q6.177249375,12.02617578125,6.143429375,11.98497578125Q6.109599375,11.94377578125,6.079969375,11.89937578125Q6.050349375,11.85507578125,6.025209375,11.80797578125Q6.000079375,11.76097578125,5.979669375,11.71167578125Q5.959259375,11.66237578125,5.943789375,11.61137578125Q5.928309375,11.56037578125,5.917899375,11.50797578125Q5.907499375,11.45567578125,5.902269375,11.40257578125Q5.897049375,11.34957578125,5.897049375,11.29617578125Q5.897049375,11.15447578125,5.933429375,11.01747578125Q5.969809375,10.88047578125,6.040129375,10.75737578125Q6.110449375,10.63437578125,6.209989375,10.53347578125Q6.309539375,10.43257578125,6.431639375,10.36067578125L6.431639375,6.89652578125L3.997759375,5.90196578125Z" fillRule="evenodd" fill="currentColor"/></g></g></svg>;
const UserIcon=()=><svg  fill="none" version="1.1" width="24" height="24" viewBox="0 0 8 8"><defs><clipPath id="master_svg0_385_094480/514_001924"><rect x="0" y="0" width="8" height="8" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_385_094480/514_001924)"><g><path d="M3.905859375,1.008424165C3.162109375,1.052174175,2.549609375,1.658424375,2.499609375,2.4021693749999997C2.443359375,3.277179375,3.130859375,4.008419375,3.993359375,4.008419375C4.824609375,4.008419375,5.493359375,3.333429375,5.493359375,2.508429375C5.499609375,1.6459243749999999,4.774609375,0.958424575,3.905859375,1.008424165ZM3.999609375,4.495929374999999C2.999609375,4.495929374999999,1.005859375,4.995929374999999,1.005859375,5.995919375L1.005859375,6.745919375C1.005859375,6.883419375,1.118359375,6.995919375,1.255859375,6.995919375L6.743359375,6.995919375C6.880859375,6.995919375,6.993359375,6.883419375,6.993359375,6.745919375L6.993359375,5.989679375C6.993359375,4.995929374999999,4.999609375,4.495929374999999,3.999609375,4.495929374999999Z" fill="currentColor" fillOpacity="1"/></g></g></svg>

const { TextArea } = Input;

import './personalData.scss';

const PersonalData = () => {
    const [isAscending, setIsAscending] = useState(true);
    const [waxberryList, setWaxberryList] = useState([]);
    const [selectMenu, setSelectMenu] = useState('publish');
    const [operateModalShow,setOperateModalShow] =useState(false);

    const [fileInfo,setFileInfo]=useState({});
    const { t } = useTranslation();
    const [form]=Form.useForm();
    const imageUpload=useRef(null);
    const { setCurrentUser,currentUser } = useMenu();
    useEffect(() => {
        if(currentUser && currentUser.id) {
            setFileInfo({fileId: currentUser.avatarUrl});
            getWaxberryList();
        }
    }, [currentUser]);

    const getWaxberryList = () => {
        axios
            .get(`${globalInitConfig.REACT_APP_API_BASE_URL}mgr/agent/agent/findByStatusAndGroupId?isAscending=${isAscending}&creatorId=${window.loginedUser?.userId}&pageNo=0&pageSize=1000`)
            .then((res) => {
                if (res.data.code === 200) {
                    setWaxberryList(res.data.data.content);
                }
            });
    };

    const getLikeList = () => {
        axios
            .get(`${globalInitConfig.REACT_APP_API_BASE_URL}mgr/agent/agentLike/findAgentLikeList?pageNo=0&pageSize=1000`)
            .then((res) => {
                if (res.data.code === 200) {
                    setWaxberryList(res.data.data.content);
                }
            });
    };

    const getStarList = () => {
        axios
            .get(`${globalInitConfig.REACT_APP_API_BASE_URL}mgr/agent/agentCollect/findAgentCollectList?pageNo=0&pageSize=1000`)
            .then((res) => {
                if (res.data.code === 200) {
                    setWaxberryList(res.data.data.content);
                }
            });
    };

    const run = (item) => {
        axios.get(`${globalInitConfig.REACT_APP_API_BASE_URL}mgr/agent/agent/agentRunRecord?vesselId=${item.vesselId}`);
        if (item.type === 0) {
            window.open(globalInitConfig.REACT_APP_RUN_URL.replace('ID',item.id.toLowerCase()));
        } else if (item.type === 1) {
            window.open(`/agent_run?id=${item.id}`);
        }
    };

    const selectMenuFn = (menu) => {
        setSelectMenu(menu);
        if (menu === 'publish') getWaxberryList();
        if (menu === 'like') getLikeList();
        if (menu === 'favorite') getStarList();
    };
    const showOperateModal=()=>{
        if(currentUser.loginname)
            setOperateModalShow(true)
        else Message.info(t('personalData.infoLoading'))
    }
    const hideOperateModal=()=>{
        setOperateModalShow(false)
        resetForm()
    }
    const resetForm=()=>{
        form.resetFields()
        setFileInfo({fileId:currentUser.avatarUrl})
    }
    const submitPersonalData=()=>{
        form.validateFields().then((fields)=>{
            axios.put(`${globalInitConfig.REACT_APP_API_BASE_URL}auth/users/me`,fields).then((res)=>{
                if (res.data.code === 200) {
                    Message.success(t('personalData.editSuccess'));
                    let data = res.data.data;
                    setCurrentUser(data);
                    setFileInfo({fileId:data.avatarUrl});
                }
                hideOperateModal()
            })
        })
    }

    function handleFileUpload(e) {
        const file = e.target.files[0];
        let fileObj = {
            fileName: file.name,
            fileSize: file.size
        };
        //总大小不能超过1M
        let totalSize = 2097152;
        if(file.size > totalSize){
            Message.warning(t('message.totalSizeCannotExceed')+"1M");
            return;
        }

        const formData = new FormData();
        formData.append('file',file);
        formData.append('creator', window.loginedUser?.userId);
        formData.append('client', 'waxberryClient');
        formData.append('securityLevel', 'normal');
        formData.append('encrypt', false);
        formData.append('product', 'mgr');

        const xhr = new XMLHttpRequest();
        let url = globalInitConfig.REACT_APP_API_FS_URL + 'file/upload';
        xhr.open('POST', url, true);
        const token = localStorage.getItem('access_token');
        xhr.setRequestHeader('Authorization', token ? `Bearer ${token}` : '');

        xhr.onload = () => {
            let resFile = JSON.parse(xhr.response);
            if (xhr.status === 200 && resFile.code === 200) {
                fileObj.fileId = resFile.data.id;
                form.setFieldsValue({avatarUrl:fileObj.fileId});
                setFileInfo(fileObj);
            } else {
                console.log(`Upload of ${file.name} failed.`);
            }
        };

        xhr.send(formData);
    }

    const iconMap = [
        { name: t('app'), icon: <AppIcon /> },
        { name: t('agent'), icon: <IntelligenceIcon /> },
        { name: t('smallModel'), icon: <SmallModuleIcon /> },
        { name: t('largeModel'), icon: <img src={LargeModelPng} alt="model" /> }
    ];
    const EmptyCommonList=()=>{
        return <div className="content-data-waxberry-empty">
            <img src={Empty2Png} width="186" height="186"/>
            <span className="desc">{t('myWaxberry.noUseWaxberry')}</span>

        </div>
    }
    return (
        <div className="my-app-personal">
            <Header />
            <div className="app-content">
                <LeftMenu menu="personal" />
                <div className="app-content-right right_bj">
                    <div className="content-header">
                        {/* <svg width="24" height="24"><use href="#personalDataIcon" /></svg> */}
                        <UserIcon/>
                        {t('personalData.title')}
                    </div>
                    <div className="personal-data">
                        <div className="personal-data-left">
                            <div className="personal-data-box1">
                                <img style={{borderRadius:32}} src={!currentUser.avatarUrl ? CardDefaultPng1 : `${globalInitConfig.REACT_APP_API_FS_URL}file/download/${currentUser.avatarUrl}`} alt="user" width={64} height={64}/>
                                <span className="userName">{currentUser.loginname}</span>
                                {/* <span className="name">{currentUser.jobKey||t('personalData.noJobInfo')}</span> */}
                            </div>
                            <div className="personal-data-box2">
                                <div className="edit-btn" onClick={showOperateModal}>
                                    <svg width="14" height="14"><use href="#editIcon" /></svg>
                                    {t('personalData.edit')}
                                </div>
                                <span className="desc">{currentUser.description}</span>
                            </div>
                        </div>
                        <div className="personal-data-right">
                            <div className="menus">
                                {['publish', 'like', 'favorite'].map((menu) => (
                                    <div
                                        key={menu}
                                        className={selectMenu === menu ? 'menu menu-active' : 'menu'}
                                        onClick={() => selectMenuFn(menu)}
                                    >
                                        {t(menu === 'publish' ? 'publish' : `waxberryPlaza.${menu}`)}
                                    </div>
                                ))}
                            </div>
                            {waxberryList.length===0?EmptyCommonList():
                                <div className="content-data">
                                    {waxberryList.map((item) => (
                                        <div className="card" key={item.id}>
                                            {item.ismodify === 0 && <span className="custom">{t('waxberryPlaza.customizable')}</span>}
                                            <img
                                                onClick={() => window.open(`/waxberry_detail?id=${item.id}`, '_self')}
                                                src={item.coverFileId ? `${globalInitConfig.REACT_APP_API_FS_URL}file/download/${item.coverFileId}` : CardDefaultPng}
                                                width="324"
                                                height="180"
                                                alt="cover"
                                            />
                                            <div className="card-title">
                                                <div className="label">
                                                    <div className="labelName">{item.name}</div>
                                                    <div className="typeFrame">
                                                        {iconMap[item.type].icon}
                                                        {iconMap[item.type].name}
                                                    </div>
                                                </div>
                                                <div className="user">
                                                    <img src={item.avatarUrl ? `${globalInitConfig.REACT_APP_API_FS_URL}file/download/${item.avatarUrl}` : CardDefaultPng1} width={20} height={20} alt="user" />
                                                    {item.creatorName}
                                                </div>
                                            </div>
                                            <div className="card-desc">
                                                {t('waxberryForm.introduction')}：{item.discription}
                                            </div>
                                            <div className="card-tags">
                                                {item.agentLabel &&
                                                item.agentLabel.split(',').map((label) => (
                                                    <span className="tag" key={label}>{label}</span>
                                                ))}
                                            </div>
                                            <div className="card-footer">
                                                <div className="data">
                                                    <div>
                                                        <HeartOutlined />
                                                        {item.likeCount}
                                                    </div>
                                                    <div>
                                                        <StarOutlined />
                                                        {item.collectCount}
                                                    </div>
                                                </div>
                                                <div className="runDiv">
                                                    <div className="run" onClick={() => run(item)}>
                                                        <img src={RunSvg} alt="run" />
                                                        {t('run')}
                                                    </div>
                                                    <div className="count">0</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            }

                        </div>
                    </div>
                    {operateModalShow && <div className="operate-modal">
                        <div className="operate-modal-box">
                            <div className="box-header">
                                <span className="label">{t('personalData.edit')}</span>
                                <CloseOutlined className="closeIcon" onClick={hideOperateModal}/>
                            </div>
                            <Form initialValues={{
                                loginname:currentUser.loginname,
                                bio:currentUser.bio,
                                avatarUrl:currentUser.avatarUrl
                            }}
                                  form={form}
                                  layout="vertical"
                            >
                                <Form.Item name="avatarUrl"  label={t('personalData.avatar')} >
                                    <div className="uploadImage" onClick={()=> imageUpload.current.click()}>

                                        <input style={{display: 'none'}} ref={imageUpload} type="file" accept="image/*" onChange={(e)=>handleFileUpload(e)}/>
                                        {!fileInfo.fileId ?
                                            <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="64" height="64" viewBox="0 0 32 32"><defs><clipPath id="master_svg0_210_43360"><rect x="0" y="0" width="32" height="32" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_210_43360)"><g><path d="M25.25006103515625,7.75L25.25006103515625,24.25L7.25006103515625,24.25L7.25006103515625,7.75L25.25006103515625,7.75ZM21.33456103515625,16.3375L16.26256103515625,20.558500000000002L12.96806103515625,17.9595L8.75006103515625,21.3705L8.75006103515625,22.75L23.75006103515625,22.75L23.75006103515625,18.341L21.33456103515625,16.3375ZM23.75006103515625,9.25L8.75006103515625,9.25L8.75006103515625,19.441499999999998L12.95656103515625,16.04L16.237061035156252,18.628L21.33356103515625,14.388L23.75006103515625,16.392L23.75006103515625,9.25ZM13.50006103515625,10.25C14.74270103515625,10.25,15.75006103515625,11.25736,15.75006103515625,12.5C15.75006103515625,13.74264,14.74270103515625,14.75,13.50006103515625,14.75C12.25742103515625,14.75,11.25006103515625,13.74264,11.25006103515625,12.5C11.25006103515625,11.25736,12.25742103515625,10.25,13.50006103515625,10.25ZM13.50006103515625,11.75C13.08585103515625,11.75,12.75006103515625,12.08579,12.75006103515625,12.5C12.75006103515625,12.91421,13.08585103515625,13.25,13.50006103515625,13.25C13.91427103515625,13.25,14.25006103515625,12.91421,14.25006103515625,12.5C14.25006103515625,12.08579,13.91427103515625,11.75,13.50006103515625,11.75Z" fill="currentColor"/></g></g></svg>
                                            :<img style={{width:64,height:64}} src={`${globalInitConfig.REACT_APP_API_FS_URL}file/download/${fileInfo.fileId}`} className="img"/>
                                        }
                                    </div>

                                </Form.Item>
                                <Form.Item name="loginname" label={t('personalData.userName')} rules={[{ required: true ,message:t('personalData.rulesUserName')}]}>
                                    <Input   placeholder={t('waxberryForm.pleaseEnter')}/>
                                </Form.Item>
                                <Form.Item name="bio" label={t('personalData.description')} >
                                    <TextArea rows={4}  placeholder={t('waxberryForm.pleaseEnter')}/>
                                </Form.Item>

                            </Form>
                            <div className="box-footer">
                                <div className="close" onClick={hideOperateModal}>{t('cancel')}</div>
                                <div className="ok" onClick={submitPersonalData}>{t('confirm')}</div>
                            </div>
                        </div>
                    </div>}
                </div>
            </div>
        </div>
    );
};

export default PersonalData;
