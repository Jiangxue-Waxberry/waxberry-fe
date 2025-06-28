import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import Header from '../components/header/index';
import LeftMenu from '../components/menu/index';

import axios from 'axios';
import getCurrentUser from '@components/getCurrentUser';
import { message, Input, Select } from 'antd';
import { CloseOutlined, PlusOutlined } from '@ant-design/icons';
import { withTranslation } from 'react-i18next';

const { TextArea } = Input;

import './industrialPromptWords.scss';
const UserIcon=()=><svg  fill="none" version="1.1" width="8" height="8" viewBox="0 0 8 8"><defs><clipPath id="master_svg0_385_094480/514_001924"><rect x="0" y="0" width="8" height="8" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_385_094480/514_001924)"><g><path d="M3.905859375,1.008424165C3.162109375,1.052174175,2.549609375,1.658424375,2.499609375,2.4021693749999997C2.443359375,3.277179375,3.130859375,4.008419375,3.993359375,4.008419375C4.824609375,4.008419375,5.493359375,3.333429375,5.493359375,2.508429375C5.499609375,1.6459243749999999,4.774609375,0.958424575,3.905859375,1.008424165ZM3.999609375,4.495929374999999C2.999609375,4.495929374999999,1.005859375,4.995929374999999,1.005859375,5.995919375L1.005859375,6.745919375C1.005859375,6.883419375,1.118359375,6.995919375,1.255859375,6.995919375L6.743359375,6.995919375C6.880859375,6.995919375,6.993359375,6.883419375,6.993359375,6.745919375L6.993359375,5.989679375C6.993359375,4.995929374999999,4.999609375,4.495929374999999,3.999609375,4.495929374999999Z" fill="#B6B7EA" fillOpacity="1"/></g></g></svg>
const PublishIcon=()=><svg  fill="none" version="1.1" width="24" height="24" viewBox="0 0 24 24"><defs><clipPath id="master_svg0_514_99353"><rect x="0" y="0" width="24" height="24" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_514_99353)"><g><path d="M13.803462709960938,18.397315624999997C13.513602709960939,18.397315624999997,13.229462709960938,18.295715625,13.000172709960937,18.103515625L11.169152709960937,16.564315625L9.200852709960937,18.134615625000002C9.007852709960938,18.288915625,8.742992709960937,18.317615625000002,8.521562709960937,18.209615624999998C8.299842709960938,18.101215625000002,8.159842709960937,17.875215625,8.162412709960938,17.628015625L8.198272709960937,14.136715625L6.500969709960938,12.640415625C6.191109709960937,12.380275625,6.027250709960938,11.970125625,6.073679749960937,11.553265625C6.120251609960937,11.135975625,6.3706827099609376,10.772545625,6.743542709960938,10.580115625000001L16.124902709960935,5.744069625C16.56960270996094,5.514782125,17.087502709960937,5.569068325,17.47540270996094,5.884642625C17.863502709960937,6.200645625,18.02120270996094,6.696645625,17.886902709960935,7.178795625L15.010902709960938,17.481915625C14.895902709960938,17.893415625,14.583332709960937,18.214615625,14.175182709960938,18.340715625C14.052752709960938,18.378615625000002,13.927462709960938,18.397315624999997,13.803462709960938,18.397315624999997ZM11.179722709960938,15.098005625C11.326152709960937,15.098005625,11.472302709960937,15.148015625,11.591302709960939,15.247865625L13.790462709960938,17.096215625L16.630302709960937,6.922795625L7.366402709960937,11.698125625L9.263712709960938,13.370565625000001C9.403282709960937,13.493285625,9.482282709960938,13.670995625,9.480422709960937,13.856855625L9.455422709960938,16.295115625L10.780862709960937,15.237725625C10.894092709960937,15.147205625,11.034762709960937,15.097935625,11.179722709960938,15.098005625Z" fill="#5A4BFF" fillOpacity="1"/></g><g><path d="M11.429036416992188,13.8359125C11.265321416992187,13.8359125,11.101748416992187,13.7734825,10.976746416992187,13.6484825C10.726887616992187,13.3986225,10.726887616992187,12.9936225,10.976746416992187,12.7440525L13.370052416992188,10.3514565C13.619912416992188,10.1015977,14.024632416992187,10.1015977,14.274492416992187,10.3514565C14.524352416992187,10.6013165,14.524352416992187,11.0063195,14.274492416992187,11.2558925L11.881182416992187,13.6484825C11.756325416992187,13.7734825,11.592609416992188,13.8359125,11.429036416992188,13.8359125Z" fill="#5A4BFF" fillOpacity="1" /></g></g></svg>
const CancelPublishIcon=()=><svg version="1.1" width="24" height="24" viewBox="0 0 24 24"><defs><clipPath id="master_svg0_514_030148"><rect x="0" y="0" width="24" height="24" rx="4"/></clipPath></defs><g clipPath="url(#master_svg0_514_030148)"><g><path d="M16.4319328515625,13.4827096875L17.7308228515625,14.7816296875C17.9261228515625,14.9768896875,17.9261228515625,15.2934696875,17.7308228515625,15.4887296875C17.5356228515625,15.6839896875,17.2190228515625,15.6839896875,17.0237228515625,15.4887296875L9.0077728515625,7.4727696875C8.8125128515625,7.2775096875,8.8125128515625,6.9609296875,9.0077728515625,6.7656626875C9.2030328515625,6.5704006875,9.5196228515625,6.5704006875,9.7148828515625,6.7656626875L11.5080028515625,8.5587896875L16.4476228515625,6.0124436875C16.873222851562502,5.7930096875,17.3688228515625,5.8449627875,17.7400228515625,6.1469746875C18.111522851562498,6.4493966875,18.262422851562498,6.9240796875,18.133922851562502,7.3855096875L16.4319328515625,13.4827096875ZM12.4168428515625,9.467619687500001L16.9313228515625,7.1405096875L15.4382928515625,12.489069687499999L14.063662851562501,11.114439687499999L14.5180928515625,10.6601396875C14.7572128515625,10.4212896875,14.7572128515625,10.0336996875,14.5180928515625,9.7945796875C14.2789728515625,9.5554496875,13.891652851562501,9.5554496875,13.652532851562501,9.7945796875L13.1980928515625,10.2488796875L12.4168428515625,9.467619687500001ZM13.4571728515625,17.840629687499998C13.6766128515625,18.0247296875,13.9485428515625,18.1219296875,14.2259428515625,18.1219296875C14.3446128515625,18.1219296875,14.4645228515625,18.104029687500002,14.581682851562501,18.067729687499998C14.9722928515625,17.9470296875,15.2714328515625,17.6397296875,15.3814928515625,17.2458296875L15.8768928515625,15.4710796875L14.8832428515625,14.4774396875L14.213502851562499,16.8766296875L12.1088528515625,15.1077996875C11.9949628515625,15.0122296875,11.8551028515625,14.9643796875,11.7149628515625,14.9643796875C11.5762328515625,14.9642996875,11.4416128515625,15.0114596875,11.3332528515625,15.0980896875L10.0647728515625,16.110029687500003L10.0887028515625,13.7765596875C10.0904728515625,13.5986896875,10.014872851562501,13.4286096875,9.881292851562499,13.3111696875L8.0655328515625,11.7106096875L10.7385428515625,10.3327396875L9.8297328515625,9.4239296875L7.4694398515625,10.6406496875C7.1126038515625,10.8248096875,6.8729359515625,11.1726196875,6.8283656515625,11.571969687500001C6.7839320515625,11.9709196875,6.9407488515625,12.3634396875,7.2372918515624995,12.6123996875L8.8616428515625,14.0443996875L8.827332851562499,17.3856296875C8.8248728515625,17.622229687500003,8.9588528515625,17.8384296875,9.1710428515625,17.9422296875C9.3829528515625,18.0456296875,9.6364328515625,18.0181296875,9.8211428515625,17.8704296875L11.7048528515625,16.3676296875L13.4571728515625,17.840629687499998ZM11.3620828515625,12.0843396875L11.9262028515625,11.5203896875L12.791762851562499,12.3859596875L12.2276428515625,12.9499096875C12.108152851562501,13.0695396875,11.9514728515625,13.1292796875,11.7949328515625,13.1292796875C11.6382528515625,13.1292796875,11.4817128515625,13.0695396875,11.3620828515625,12.9499096875C11.1229628515625,12.7107896875,11.1229628515625,12.323189687500001,11.3620828515625,12.0843396875Z" fillRule="evenodd" fill="#5A4BFF" fillOpacity="1"/></g></g></svg>
function scrollToDiv(divId) {
    const element = document.getElementById(divId);
    if (element) {
        element.classList.add('data-highlight');
        element.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
            element.classList.remove('data-highlight');
        }, 1000);
    }
}

function copy(content) {
    if(navigator.clipboard){
        navigator.clipboard.writeText(content);
    }else{
        let inputDom = document.createElement('textarea');
        inputDom.value = content;
        document.body.appendChild(inputDom);
        inputDom.select();
        const result = document.execCommand('copy');
        // 判断是否复制成功
        if (result) {
            message.success("复制成功");
        }
        document.body.removeChild(inputDom);
    }
}

class App extends Component {
    static defaultProps = {
        viewMode:true,
        isComponent:false,
        registerButton:()=>{

        }
    };
    constructor(props) {
        super(props);
        this.state = {
            industrialPrompts: {
                count: 0,
                prompts: []
            },
            isAscending: true,
            selectKey: '',
            searchName: '',
            dataObj: {},
            operateType: 'add',
            showOperateModal: false,
            showInfoModal:false,
            currentUser:{}
        };
    }

    componentWillMount() {

    }
    promptWordCreate=()=> this.showOperateModal('add',{})
    promptWordSort=this.ascendChange.bind(this)
    componentDidMount() {
        getCurrentUser().then(currentUser => {

            if (!currentUser){

                return;
            }
            this.setState({currentUser})
            this.getIndustrialPrompts(currentUser);
        });
        this.props.registerButton(this.promptWordCreate,this.promptWordSort)
    }

    getIndustrialPrompts(currentUser=null){
        const userInfo=currentUser|| this.state.currentUser
        const { searchName,isAscending } = this.state;

        const userId=this.props.isComponent?userInfo.userId||'':''
        axios.get(`${globalInitConfig.REACT_APP_API_BASE_URL}mgr/industrialPrompts/getAll?title=${searchName}&sort=${isAscending?'asc':'desc'}&creatorId=${userId}`).then(res=>{
            if(res.data.code === 200){

                this.setState({
                    industrialPrompts: res.data.data
                });
                this.props.registerButton(this.promptWordCreate,this.promptWordSort,res.data.data?res.data.data.prompts.length:0)




            }
        });
    }

    ascendChange(){
        console.log('hahahah')
        this.setState({
            isAscending: !this.state.isAscending
        },()=>{
            this.getIndustrialPrompts();
        })
    }

    selectChange(id) {
        this.setState({
            selectKey: id
        });
        scrollToDiv(id);
    }

    operateModalOk(){
        let dataObj = this.state.dataObj;
        let operateType = this.state.operateType;
        let url = `${globalInitConfig.REACT_APP_API_BASE_URL}mgr/industrialPrompts/save`;
        if(operateType === "edit"){
            url = `${globalInitConfig.REACT_APP_API_BASE_URL}mgr/industrialPrompts/update`;
        }
        axios.post(url,dataObj).then(res=>{
            if(res.data.code === 200){
                Message.success("操作成功！");
                this.getIndustrialPrompts();
                this.setState({
                    showOperateModal: false
                })
            }
        });
    }
   publishPrompt(item,isCancel){
    const t=this.props.t
    const body={...item,status:isCancel?'0':'1'}
    axios.post(`${globalInitConfig.REACT_APP_API_BASE_URL}mgr/industrialPrompts/update`,body).then(res=>{
        if(res.data.code === 200){
            Message.success(t(isCancel?'industrialPromptWords.unpublishSuccess':'industrialPromptWords.publishSuccess'));
            this.getIndustrialPrompts();

        }
    });
   }
    showOperateModal(type,obj){
        this.setState({
            showOperateModal: true,
            dataObj: {...obj},
            operateType: type
        })
    }

    hideOperateModal(){
        this.setState({
            showOperateModal: false
        })
    }
    showInfoModal(obj){
        this.setState({
            showInfoModal: true,
            dataObj: {...obj},
        })
    }

    hideInfoModal(){
        this.setState({
            showInfoModal: false
        })
    }

    dataObjChange(key,value){
        let dataObj = this.state.dataObj;
        dataObj[key] = value;
        this.setState({
            dataObj
        });
    }

    searchChange(e) {
        this.setState({
            searchName: e.target.value
        },()=>{
            this.getIndustrialPrompts();
        })
    }

    deletePrompt(id){
        axios.post(`${globalInitConfig.REACT_APP_API_BASE_URL}mgr/industrialPrompts/delete`,{ids: id}).then(res=>{
            if(res.data.code === 200){
                message.success("操作成功！");
                this.getIndustrialPrompts();
            }
        });
    }
    createButton(){
        const t=this.props.t
      return  this.props.viewMode?null:<div className="add" onClick={()=> this.showOperateModal('add',{})}><PlusOutlined />{t('industrialPromptWords.createNewPromptWords')}</div>
    }
    sortButton(){
        const { industrialPrompts,isAscending,selectKey,dataObj,operateType,showOperateModal,searchName,showInfoModal } = this.state;
        return (<div className="sorted" onClick={this.ascendChange.bind(this)}>
            <svg style={{transform: isAscending?"":"rotate(180deg)"}} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="16" height="16" viewBox="0 0 16 16"><defs><clipPath id="master_svg0_273_36224"><rect x="0" y="0" width="16" height="16" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_273_36224)"><g><path d="M7.1582121875,2.2813L0.9285701875,2.2813C0.4745701875,2.2813,0.1044921875,2.65044,0.1044921875,3.10538C0.1044921875,3.56333,0.4736331875,3.92946,0.9285701875,3.92946L7.1582121875,3.92946C7.6132121875,3.92946,7.9822921875,3.56032,7.9822921875,3.10538C7.9822921875,2.65044,7.6141521875,2.2813,7.1582121875,2.2813ZM7.1582121875,7.22691L0.9285701875,7.22691C0.4745701875,7.22691,0.1044921875,7.59505,0.1044921875,8.050989999999999C0.1044921875,8.508939999999999,0.4736331875,8.87507,0.9285701875,8.87507L7.1582121875,8.87507C7.6132121875,8.87507,7.9822921875,8.50593,7.9822921875,8.050989999999999C7.9822921875,7.59605,7.6141521875,7.22691,7.1582121875,7.22691ZM7.1582121875,12.17255L0.9285701875,12.17255C0.4745701875,12.17255,0.1044921875,12.54165,0.1044921875,12.99665C0.1044921875,13.45555,0.4736331875,13.82075,0.9285701875,13.82075L7.1582121875,13.82075C7.6132121875,13.82075,7.9822921875,13.45155,7.9822921875,12.99665C7.9832921875,12.54065,7.6141521875,12.17255,7.1582121875,12.17255ZM8.2514021875,6.23799L11.2191921875,6.23799L11.2191921875,14.64185C11.2191921875,15.09885,11.5852921875,15.46895,12.0432921875,15.46895C12.4981921875,15.46895,12.8672921875,15.10075,12.8672921875,14.64185L12.8672921875,6.23799L15.8350921875,6.23799C15.9998921875,6.23799,16.0156921875,6.0199,15.9396921875,5.9113Q14.8056921875,4.2621,12.5376921875,0.962724Q12.2573921875,0.5008182,12.0431921875,0.53339636Q11.7954921875,0.53339636,11.5487921875,0.962724Q9.2807621875,4.26113,8.1477221875,5.9093C8.072712187499999,6.01885,8.0865221875,6.23796,8.2513721875,6.23796L8.2514021875,6.23799Z" fill="#FFFFFF"/></g></g></svg>
        </div>)
    }
    render() {
        const { industrialPrompts,isAscending,selectKey,dataObj,operateType,showOperateModal,searchName,showInfoModal } = this.state;
        const { t ,isComponent} = this.props;

        return (


            <div className="industrialPromptWords">
                <div className="app-content-right right_bj">
                    {!isComponent&&<div className="content-header">
                        <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="24" height="24" viewBox="0 0 18 18"><defs><clipPath id="master_svg0_210_14291"><rect x="0" y="0" width="18" height="18" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_210_14291)"><g><path d="M16.6435,11.489L15.2143,10.72523C15.1868,10.71052,15.1563,10.70298,15.1254,10.70325L15.1052,10.70325C15.0727,10.70353,15.0408,10.71244,15.0125,10.72913L14.0247,11.3131C14.0138,11.3194,14.0034,11.3265,13.9934,11.3344C13.9645,11.3547,13.9475,11.3889,13.9482,11.4252C13.9478,11.4425,13.9499,11.4597,13.9545,11.4763L13.9545,11.4776C13.9696,11.5267,14.0031,11.5673,14.0474,11.5903L14.6897,11.9375C14.7525,11.9714,14.7921,12.0385,14.7929,12.1121C14.7936,12.1857,14.7554,12.2537,14.6933,12.289L9.08706,15.4796C9.03117,15.5114,8.963750000000001,15.5121,8.90724,15.4816L3.30363,12.4516C3.24158,12.418,3.20206,12.3519,3.2006,12.2791C3.19913,12.2063,3.23594,12.1385,3.2966,12.1022L4.001329999999999,11.6811C4.01821,11.671,4.02322,11.6678,4.0377600000000005,11.6587C4.11078,11.6126,4.1031200000000005,11.5468,4.10234,11.5388C4.10156,11.5309,4.097799999999999,11.4539,4.03979,11.4161C4.0301,11.4099,4.02947,11.4096,4.01868,11.4034L3.02499,10.83657C2.99625,10.8202,2.96394,10.81179,2.93117,10.81215L2.90975,10.81215C2.87987,10.81245,2.85047,10.82003,2.8239099999999997,10.83429L1.346896,11.6256C1.131257,11.7481,0.99793107,11.9843,1.0000243363,12.2401C1.00211757,12.4958,1.13929,12.7296,1.356904,12.8483L8.717880000000001,16.9392C8.806339999999999,16.9865,8.90586,17.0069,9.00497,16.9979L9.01748,16.9979C9.12693,16.997,9.23513,16.994999999999997,9.29455,16.943199999999997C9.30513,16.9344,9.31649,16.9267,9.32848,16.920099999999998L16.654400000000003,12.7121C16.8652,12.597,16.997999999999998,12.3704,17,12.1226C17,12.1063,16.9984,12.1138,16.9987,12.0969C17.003,11.904,16.9285,11.6495,16.6433,11.4894L16.6435,11.489ZM16.6435,8.17337L15.2143,7.4094C15.1868,7.39469,15.1563,7.38715,15.1254,7.38742L15.1052,7.38742C15.0727,7.3877,15.0408,7.39661,15.0125,7.41331L14.0246,7.99707C14.0136,8.00338,14.0032,8.0105,13.9933,8.01839C13.9644,8.0387,13.9473,8.07292,13.9481,8.10923C13.9476,8.1265,13.9498,8.143740000000001,13.9543,8.16034L13.9543,8.16164C13.9695,8.21067,14.003,8.251280000000001,14.0472,8.27429L14.6897,8.621839999999999C14.7525,8.65573,14.7921,8.72287,14.7929,8.79645C14.7936,8.87003,14.7554,8.93804,14.6933,8.9733L9.08706,12.1639C9.03117,12.1957,8.963750000000001,12.1965,8.90724,12.1659L3.30363,9.13593C3.24158,9.10237,3.20206,9.03622,3.2006,8.963429999999999C3.19913,8.890640000000001,3.23595,8.82283,3.2966,8.78659L4.001329999999999,8.36545C4.01821,8.355360000000001,4.02322,8.35211,4.0377600000000005,8.34299C4.11078,8.29692,4.1031200000000005,8.23115,4.10234,8.22318C4.10156,8.2152,4.097799999999999,8.138200000000001,4.03979,8.100439999999999C4.0301,8.094249999999999,4.02947,8.09392,4.01868,8.08774L3.02499,7.52091C2.99625,7.50454,2.96394,7.49613,2.93117,7.49649L2.90975,7.49649C2.87987,7.49679,2.85047,7.50437,2.8239099999999997,7.51863L1.346896,8.309940000000001C1.131257,8.43248,0.99793107,8.66866,1.0000243363,8.92442C1.00211757,9.18017,1.13929,9.41395,1.356904,9.53264L8.717880000000001,13.6235C8.806339999999999,13.6709,8.90586,13.6913,9.00497,13.6823L9.01748,13.6823C9.12693,13.6813,9.23513,13.6793,9.29455,13.6276C9.30513,13.6188,9.31649,13.611,9.32848,13.6045L16.654400000000003,9.39541C16.8652,9.28031,16.997999999999998,9.05376,17,8.805959999999999C17,8.78968,16.9984,8.797170000000001,16.9987,8.78024C17.003,8.58733,16.9285,8.3329,16.6433,8.17271L16.6435,8.17337ZM1.306555,6.16522L8.63345,10.32168C8.7234,10.37091,8.825099999999999,10.39205,8.92632,10.38256C9.04312,10.38256,9.16086,10.38256,9.21919,10.32168L16.6044,6.16522C16.820999999999998,6.04459,16.9563,5.80961,16.9563,5.55387C16.9563,5.29812,16.820999999999998,5.06314,16.6044,4.94252L9.33693,1.0916085C9.15925,0.9694639,8.928709999999999,0.9694639,8.75103,1.0916085L1.365817,4.94252C1.145726,5.05924,1.00894168,5.29652,1.0135291,5.55362C0.955049,5.7978,1.131271,6.04198,1.306398,6.1644L1.306555,6.16522Z" fill="currentColor"/></g></g></svg>
                        {t('menu.industrialPromptWords')}
                    </div>}
                    <div className="content-data">
                        { !isComponent&&<div className="content-data-left">
                            <div className="count">
                                <span>{t('industrialPromptWords.allTips')}</span>
                                <span>{industrialPrompts.count}</span>
                            </div>
                            <Input value={searchName} onChange={(e)=>this.searchChange(e)} placeholder={t('search')+"~"}/>
                            <div className="data-list">
                                {industrialPrompts.prompts.map(item=>(
                                    <span key={item.id} title={item.title} className={selectKey===item.id?"data data-active":"data"} onClick={()=>this.selectChange(item.id)}>{item.title}</span>
                                ))}
                            </div>
                        </div>}
                        <div className="content-data-right">
                            {!isComponent&&<div className="right-tool">
                                {this.createButton()}
                                {/* {this.sortButton()} */}
                            </div>}
                            <div className="data-list">
                                {
                                    isComponent&&  <div  className="data createData">
                                        <div style={{width:'100%',display:'flex',justifyContent:'center'}}>
                                            <div onClick={()=> this.showOperateModal('add',{})} className="createButton">
                                                <div className="createButtonInner"> <PlusOutlined  /></div>
                                            </div>
                                        </div>
                                        <div style={{width:'100%',display:'flex',justifyContent:'center'}}>
                                            <div className="publisher">{t('industrialPromptWords.createNewPromptWords')}  </div>
                                        </div>
                                    </div>
                                }
                                {industrialPrompts.prompts.map(item=>(
                                    <div key={item.id} id={item.id} className="data">
                                        <div className="title">
                                            <span className="label" title={item.title}>{item.title}</span>

                                            <div className="operate">

                                                {this.props.viewMode?null:<>
                                                    {item.status!=='1'?<div style={{display:'flex'}} onClick={()=>this.publishPrompt(item)}><PublishIcon/></div>:<div style={{display:'flex'}} onClick={()=>this.publishPrompt(item,true)}><CancelPublishIcon/></div>}

                                                    {item.status!=='1'? <><svg onClick={()=> this.showOperateModal('edit',item)} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="24" height="24" viewBox="0 0 24 24"><defs><clipPath id="master_svg0_280_25272"><rect x="0" y="0" width="24" height="24" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_280_25272)"><g><path d="M12.809429999999999,6.140936C13.0182,5.9491191,13.34774,5.953659,13.55073,6.151149L16.436500000000002,8.95813C16.6518,9.1672,16.639400000000002,9.50807,16.4095,9.70212L9.45608,15.57548C9.35666,15.65957,9.22822,15.70475,9.09601,15.70212L6.518385,15.64901C6.230363,15.64324,6,15.41632,6,15.13837L6,12.61378C5.9999727314,12.47408,6.0592952,12.34047,6.164146,12.24408L12.809429999999999,6.140936ZM13.512080000000001,14.35097L17.4807,14.42552C17.7732,14.43102,18.0056,14.6641,17.9999,14.94612C17.9942,15.22814,17.752499999999998,15.4523,17.4601,15.4468L13.491430000000001,15.37225C13.198830000000001,15.36682,12.96626,15.13356,12.97211,14.85139C12.97796,14.56922,13.22002,14.34511,13.512609999999999,14.35097L13.512080000000001,14.35097ZM13.164200000000001,7.22553L7.05901,12.832329999999999L7.05901,14.63846L8.912279999999999,14.67676L15.28804,9.29157L13.164200000000001,7.22553ZM17.4548,16.9042C17.7472,16.902,17.9861,17.128999999999998,17.9882,17.411C17.9904,17.692999999999998,17.755200000000002,17.923299999999998,17.462699999999998,17.9254L7.06324,18C6.771008,18.0018,6.532478,17.775,6.530286,17.4932C6.528094,17.211399999999998,6.763069,16.981099999999998,7.0553,16.9787L17.4548,16.9042Z" fill="#4B3BDB" fillOpacity="1"/></g></g></svg>
                                                            <svg onClick={()=> this.deletePrompt(item.id)} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="24" height="24" viewBox="0 0 24 24"><defs><clipPath id="master_svg0_280_42839"><rect x="0" y="0" width="24" height="24" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_280_42839)"><g><path d="M10.697949999999999,6.32406L13.302050000000001,6.32406Q13.56261,6.32406,13.746839999999999,6.13016Q13.93108,5.936255,13.93108,5.662032Q13.93108,5.38781,13.746839999999999,5.193905Q13.56261,5,13.302050000000001,5L10.697949999999999,5Q10.43739,5,10.253160000000001,5.193905Q10.06892,5.387809,10.06892,5.662032Q10.06892,5.936255,10.253160000000001,6.13016Q10.43739,6.32406,10.697949999999999,6.32406ZM7.1393,8.03703L7.1393,16.967599999999997Q7.1393,17.8094,7.70491,18.4047Q8.27052,19,9.07038,19L14.92962,19Q15.72948,19,16.295099999999998,18.4047Q16.8607,17.8094,16.8607,16.967599999999997L16.8607,9.43055Q16.8607,9.15633,16.6765,8.96243Q16.4922,8.76852,16.2317,8.76852Q15.97112,8.76852,15.78688,8.96243Q15.60265,9.15633,15.60265,9.43055L15.60265,16.967599999999997Q15.60265,17.261,15.40552,17.4685Q15.2084,17.6759,14.92962,17.6759L9.07038,17.6759Q8.791599999999999,17.6759,8.59448,17.4685Q8.39735,17.261,8.39735,16.967599999999997L8.39735,8.03703L17.371000000000002,8.03703Q17.631500000000003,8.03703,17.8158,7.84312Q18,7.64922,18,7.375Q18,7.10077,17.8158,6.90687Q17.631500000000003,6.71296,17.371000000000002,6.71296L6.629028,6.71296Q6.368476,6.71296,6.184238,6.90687Q6,7.10077,6,7.375Q6,7.64922,6.184238,7.84312Q6.368476,8.03703,6.629028,8.03703L7.1393,8.03703ZM10.06892,10.80092L10.06892,14.91204Q10.06892,15.1863,10.253160000000001,15.3802Q10.43739,15.5741,10.697949999999999,15.5741Q10.9585,15.5741,11.14274,15.3802Q11.32697,15.1863,11.32697,14.91204L11.32697,10.80092Q11.32697,10.5267,11.14274,10.332799999999999Q10.9585,10.13889,10.697949999999999,10.13889Q10.4374,10.13889,10.253160000000001,10.332799999999999Q10.06892,10.5267,10.06892,10.80092ZM12.67303,10.80092L12.67303,14.91204Q12.67303,15.1863,12.85726,15.3802Q13.0415,15.5741,13.302050000000001,15.5741Q13.56261,15.5741,13.746839999999999,15.3802Q13.93108,15.1863,13.93108,14.91204L13.93108,10.80092Q13.93108,10.5267,13.746839999999999,10.332799999999999Q13.5626,10.13889,13.302050000000001,10.13889Q13.0415,10.13889,12.85726,10.332799999999999Q12.67303,10.5267,12.67303,10.80092Z" fillRule="evenodd" fill="#4B3BDB" fillOpacity="1"/></g></g></svg>
                                                        </>
                                                        :null}


                                                </>}
                                                <svg onClick={()=> copy(item.content)} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="24" height="24" viewBox="0 0 24 24"><defs><clipPath id="master_svg0_273_28593"><rect x="0" y="0" width="24" height="24" rx="4"/></clipPath></defs><g clipPath="url(#master_svg0_273_28593)"><g><path d="M13.94599,8.28571C14.40633,8.28571,14.77951,8.66947,14.77951,9.14286L14.77951,17.142899999999997C14.77951,17.6162,14.40633,18,13.94599,18L7.833518,18C7.373179,18,7,17.6162,7,17.142899999999997L7,9.14286C6.9999999006368,8.66947,7.373179,8.28571,7.833519,8.28571L13.94599,8.28571ZM13.66815,9.42857L8.11136,9.42857L8.11136,16.857100000000003L13.66815,16.857100000000003L13.66815,9.42857ZM16.16648,6.000000153269C16.59602,5.999726772,16.95543,6.33518,16.99667,6.774857L17,6.857143L17,14.56743C16.999670000000002,14.86977,16.77039,15.11952,16.476889999999997,15.13724C16.18338,15.15496,15.92726,14.93451,15.89253,14.63429L15.88864,14.56743L15.88864,7.14286L10.33407,7.14286C10.05236,7.14282,9.815249999999999,6.925996,9.78228,6.638286L9.7784,6.571429C9.77843,6.281729,9.98928,6.0378951,10.26906,6.00400007L10.33407,6.000000153269L16.16648,6.000000153269Z" fill="#4B3BDB" fillOpacity="1"/></g></g></svg>


                                            </div>
                                        </div>
                                        <div className="info"  onClick={()=>this.showInfoModal(item)}>{item.content}</div>
                                        <div className="promptWordFooter">
                                            {this.props.viewMode&&<div className="publisher">
                                                <div className="userIconContainer" ><UserIcon/></div>
                                                {item.creatorName}
                                            </div>}
                                            {!this.props.viewMode&&<span className={item.status!=="1"?"status unpublish":"status publish"} >{item.status=='1'?t('published'):t('unpublish')}</span>}
                                        </div>

                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {showOperateModal && <div className="operate-modal">
                    <div className="operate-modal-box">
                        <div className="box-header">
                            <span className="label">{operateType === "add" ? "添加" : "编辑"}</span>
                            <CloseOutlined onClick={this.hideOperateModal.bind(this)}/>
                        </div>
                        <div className="form">
                            <div className="form-item">
                                <span className="label">标题</span>
                                <Input value={dataObj.title} onChange={(e)=>this.dataObjChange("title",e.target.value)} placeholder={t('waxberryForm.pleaseEnter')}/>
                            </div>
                            <div className="form-item">
                                <span className="label">提示词</span>
                                <TextArea rows={4} value={dataObj.content} onChange={(e)=>this.dataObjChange("content",e.target.value)} placeholder={t('waxberryForm.pleaseEnter')}/>
                            </div>
                        </div>
                        <div className="box-footer">
                            <div className="close" onClick={this.hideOperateModal.bind(this)}>{t('cancel')}</div>
                            <div className="ok" onClick={this.operateModalOk.bind(this)}>{t('confirm')}</div>
                        </div>
                    </div>
                </div>}
                {showInfoModal && <div className="operate-modal">
                    <div className="operate-modal-box">
                        <div className="box-header">
                            <span className="label">{dataObj.title}</span>
                            <CloseOutlined onClick={this.hideInfoModal.bind(this)}/>
                        </div>
                        <div className="form" >

                            {dataObj.content}
                        </div>
                        <div className="box-footer">
                            <div className="close" onClick={this.hideInfoModal.bind(this)}>{t('cancel')}</div>

                        </div>
                    </div>
                </div>}
            </div>
        );
    }
}
export default withTranslation()(App);
