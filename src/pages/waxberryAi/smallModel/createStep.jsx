import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import axios from 'axios';

import { CodeEditor } from "@/components/CodeEditor";
import getFileTypeTempltate from './getFileTypeTempltate';

import {message, Select, Input, Upload, Switch, Table, Spin, Cascader} from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { withTranslation } from 'react-i18next';

import UploadIcon from './img/upload.png';
import UploadIcon1 from './img/upload1.png';
import TrainPng from './img/trainPng.png';
import DefaultPng from "@/pages/waxberryAi/img/default.png";
import AiSvg from "@/pages/waxberryAi/img/ai.svg";
import CardDefaultPng from "@/pages/waxberryAi/img/cardDefault.png";

const { TextArea } = Input;
const { Dragger } = Upload;

function formatFileSize(bytes) {
    if (bytes === 0) return '0B';

    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let unitIndex = 0;

    while (bytes >= 1024 && unitIndex < units.length - 1) {
        bytes /= 1024;
        unitIndex++;
    }

    return `${Math.round(bytes * 100) / 100}${units[unitIndex]}`;
}

import './createStep.scss';
import WarningSvg from "../img/warning.svg";

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            step: 1,
            waxberryObj: {
                type: 2,
                image: 'waxberry-lm:latest'
            },
            fileList: [],
            modelParamConfig: [],
            columns: [
                {
                    title: '序号',
                    width: '10%',
                    dataIndex: 'index',
                    render: (_, record, index) => index+1
                },
                { title: '参数名',width: '15%', dataIndex: 'name' },
                { title: '类型',width: '10%', dataIndex: 'dataType' },
                {
                    title: '默认值',
                    width: '10%',
                    dataIndex: 'defaultValue',
                    render: (text, record, index) => (
                        <Input value={text} onChange={e=>{
                            record.defaultValue = e.target.value;
                            this.setState({})
                        }}/>
                    )
                },
                { title: '说明',width: '55%', dataIndex: 'description' }
            ],
            showWaxberryModal: false,
            iconSpinning1: false,
            iconSpinning2: false,
            detailSpinning: false,
            agentMenuList: [],
            waxberryExtendObj: props.selectWaxberryObj
        };
    }

    componentWillMount() {
        let waxberryId = this.props.id;
        if(waxberryId){
            this.initData(waxberryId);
        }
        this.getAgentMenuList();
    }

    componentDidMount() {

    }

    initData(id){
        //获取纳豆
        axios.get(`${globalInitConfig.REACT_APP_API_BASE_URL}mgr/agent/agent/findById?id=${id}`).then(r1=> {
            if (r1.data.code === 200) {
                let waxberryObj = r1.data.data;
                this.setState({
                    waxberryObj
                })
            }
        });
        //获取文件列表
        axios.get(`${globalInitConfig.REACT_APP_API_BASE_URL}mgr/baseMinModel/file/findByWaxberryId?waxberryId=${id}`).then(res=> {
            if (res.data.code === 200) {
                this.setState({
                    fileList: res.data.data
                })
            }
        });
        //获取ModelParamConfig
        axios.get(`${globalInitConfig.REACT_APP_API_BASE_URL}mgr/baseMinModel/paramConfig/${id}`).then(res=>{
            if(res.data.code === 200){
                this.setState({
                    modelParamConfig: res.data.data
                })
            }
        });
    }

    next1() {
        let waxberryObj = this.state.waxberryObj;
        if(!waxberryObj.name || !waxberryObj.discription || !waxberryObj.coverFileId) {
            message.warning("请完善信息后操作");
            return;
        }
        let url = globalInitConfig.REACT_APP_API_BASE_URL + "mgr/agent/agent/addAgent";
        if(waxberryObj.id){
            url = globalInitConfig.REACT_APP_API_BASE_URL + 'mgr/agent/agent/updateAgent';
        }
        axios.post(url, waxberryObj).then(res=>{
            const data = res.data;
            if (data.code === 200) {
                let obj = data.data;
                this.setState({
                    step: 2,
                    waxberryObj: obj
                });
                let waxberryExtendObj = this.state.waxberryExtendObj;
                waxberryExtendObj.waxberryId = obj.id;
                waxberryExtendObj.name = obj.name;
                axios.post(`${globalInitConfig.REACT_APP_API_BASE_URL}mgr/baseMinModel/extend/save`,waxberryExtendObj);
            } else {
                message.error(data.message);
            }
        })
    }

    next2() {
        let fileList = this.state.fileList;
        if(fileList.length === 0) return;
        if(this.state.modelParamConfig.length === 0){
            this.getModelDefaultParamConfig();
        }
        this.setState({
            step: 3
        })
    }

    next3() {
        let waxberryObj = this.state.waxberryObj;
        let modelParamConfig = this.state.modelParamConfig;
        modelParamConfig.forEach(item=>{
            item.id = null;
            item.waxberryId = waxberryObj.id;
        });
        axios.post(`${globalInitConfig.REACT_APP_API_BASE_URL}mgr/baseMinModel/paramConfig/saveAll`, modelParamConfig).then(res=>{
            if(res.data.code === 200){
                this.setState({
                    step: 4
                })
            }
        });
    }

    next4(){
        this.setState({
            step: 5
        })
    }

    stepClick(nextStep) {
        let step = this.state.step;
        if (step >= 4) return;
        this.setState({
            step: nextStep
        })
    }

    waxberryObjChange(key,value){
        let waxberryObj = this.state.waxberryObj;
        waxberryObj[key] = value;
        this.setState({
            waxberryObj
        })
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

    handleImgUpload(info) {
        if (info.file.status === 'done') {
            let waxberryObj = this.state.waxberryObj;
            let fileList = this.state.fileList;
            let obj = info.file.response.data;
            let params = {
                waxberryId: waxberryObj.id,
                fileId: obj.id,
                fileName: obj.fileName,
                fileSize: obj.fileSize,
                filename: obj.fileName,
                filesize: obj.fileSize,
                containerId: waxberryObj.vesselId,
                path: "/waxberry/attachment/" + obj.fileName
            };
            axios.post(`${globalInitConfig.REACT_APP_API_BASE_URL}mgr/baseMinModel/file/saveFile`, params).then(res=>{
                if(res.data.code === 200){
                    params.id = res.data.data.id;
                    fileList.push(params);
                    this.setState({
                        fileList
                    })
                }
            });
        }
    }

    handleTestUpload(info) {
        if (info.file.status === 'done') {
            let obj = info.file.response.data;
            this.setState({
                testFileId: obj.id
            })
        }
    }

    deleteFile(fileObj) {
        let fileList = this.state.fileList;
        axios.post(`${globalInitConfig.REACT_APP_API_BASE_URL}mgr/baseMinModel/file/deleteFile`, {id: fileObj.id}).then(res=>{
            if(res.data.code === 200){
                let newFileList = fileList.filter(file => file.fileId !== fileObj.fileId);
                this.setState({
                    fileList: newFileList
                })
            }
        });
    }

    modelTypeChange(value){
        let waxberryExtendObj = this.state.waxberryExtendObj;
        waxberryExtendObj.type = value;
        this.setState({
            waxberryExtendObj
        })
    }

    getModelDefaultParamConfig(){
        axios.get(`${globalInitConfig.REACT_APP_API_BASE_URL}mgr/baseMinModel/defaultParamConfig/getAllByType?type=${this.state.waxberryExtendObj.type}`).then(res=>{
            if(res.data.code === 200){
                this.setState({
                    modelParamConfig: res.data.data
                });
            }
        });
    }

    publish() {
        this.getWaxberryDetail();
        let waxberryObj = this.state.waxberryObj;
        let fileId = waxberryObj.fileId;
        let fileList = [];
        if(fileId){
            let fileIds = fileId.split(',');
            let fileNames = waxberryObj.fileName.split(',');
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
        waxberryObj.fileList = fileList;
        this.setState({
            showWaxberryModal: true,
            waxberryObj
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

    hideWaxberryModal(){
        this.setState({
            showWaxberryModal: false
        })
    }

    waxberryModalOk(flag){
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

        waxberryObj.status = 1;
        this.setWaxberryDetail(waxberryObj);
        axios.post(globalInitConfig.REACT_APP_API_BASE_URL + 'mgr/agent/agent/updateAgent', waxberryObj).then(res=>{
            const data = res.data;
            if (data.code === 200) {
                this.setState({
                    showPublishModal: false
                });
                window.open(`/waxberryMarket`,"_self");
            } else {
                message.error(data.message);
            }
        })
    }

    setWaxberryDetail(item){
        let params = {
            path: "/waxberry/README.md",
            content: item.detail
        };
        axios.post(`${globalInitConfig.REACT_APP_API_SBX_URL}/sandboxes/${item.vesselId}/write_file`,params);
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

    openApp() {
        let waxberryExtendObj = this.state.waxberryExtendObj;
        if(waxberryExtendObj.type === "0"){
            axios.get(`${globalInitConfig.REACT_APP_API_BASE_URL}mgr/system/getProperty?propertyName=waxberry.slm.label.studio`).then(res => {
                if (res.data.code === 200) {
                    window.open(res.data.data);
                }
            })
        }
    }

    render() {
        const { step,waxberryExtendObj,waxberryObj,fileList,columns,modelParamConfig,showWaxberryModal,iconSpinning1,iconSpinning2,detailSpinning,agentMenuList } = this.state;
        const { t } = this.props;

        const stepList = [{
            step: 1,
            label: t('smallModelView.attributeConfig')
        },{
            step: 2,
            label: t('smallModelView.dataPreparation')
        },{
            step: 3,
            label: t('smallModelView.trainingConfig')
        },{
            step: 4,
            label: t('smallModelView.modelTraining')
        },{
            step: 5,
            label: t('smallModelView.testValidation')
        }];

        const uploadParams = {
            creator: window.loginedUser?.userId,
            client: 'waxberryClient',
            securityLevel: 'normal',
            encrypt: false,
            product: 'mgr'
        };

        const props = {
            name: 'file',
            data: uploadParams,
            accept: "image/png, image/jpeg",
            showUploadList: false,
            multiple: false,
            action: `${globalInitConfig.REACT_APP_API_FS_URL}file/upload`,
            onChange: this.handleUpload.bind(this)
        };

        const attachmentProps = {
            name: 'file',
            data: uploadParams,
            showUploadList: true,
            multiple: true,
            action: `${globalInitConfig.REACT_APP_API_FS_URL}file/upload`,
            onChange: this.handleAttachmentUpload.bind(this)
        };

        const coverProps = {
            name: 'file',
            data: uploadParams,
            accept: "image/png, image/jpeg",
            showUploadList: false,
            multiple: false,
            action: `${globalInitConfig.REACT_APP_API_FS_URL}file/upload`,
            onChange: this.handleCoverUpload.bind(this)
        };

        const imgProps = {
            name: 'file',
            data: uploadParams,
            showUploadList: false,
            multiple: false,
            action: `${globalInitConfig.REACT_APP_API_FS_URL}file/upload`,
            onChange: this.handleImgUpload.bind(this)
        };

        const testProps = {
            name: 'file',
            data: uploadParams,
            showUploadList: false,
            accept: "image/png, image/jpeg",
            multiple: false,
            action: `${globalInitConfig.REACT_APP_API_FS_URL}file/upload`,
            onChange: this.handleTestUpload.bind(this)
        };

        return (
            <div className="small-model-create_step right_bj">
                <div className="content-header">
                    <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="24" height="24" viewBox="0 0 24 24"><defs><clipPath id="master_svg0_385_84534"><rect x="0" y="0" width="24" height="24" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_385_84534)"><g><path d="M10.904642548828125,22.3479953125C11.202582548828126,22.5201953125,11.539952548828126,22.6126953125,11.884082548828125,22.6162953125C12.228222548828125,22.6126953125,12.565562548828124,22.5201953125,12.863562548828124,22.3479953125L20.403862548828126,18.0410953125C21.008162548828125,17.6921953125,21.381162548828126,17.048295312500002,21.383262548828124,16.350595312499998L21.383262548828124,7.7234453125C21.367662548828125,7.0116153125,20.966962548828125,6.3643453125,20.336762548828126,6.0329053125L12.863562548828124,1.7126353125C12.257442548828125,1.3627153125,11.510722548828126,1.3627153125,10.904642548828125,1.7126353125L3.444802548828125,6.0329053125C2.840544548828125,6.3817653125,2.467465708828125,7.0257153125,2.465362548828125,7.7234453125L2.465362548828125,16.350595312499998C2.467385458828125,17.0447953125,2.834280548828125,17.6868953125,3.431385548828125,18.0410953125L10.904642548828125,22.3479953125ZM7.388322548828125,10.3198553125Q7.272752548828125,10.4333453125,7.137462548828125,10.5224153125Q7.002172548828125,10.6114853125,6.852252548828125,10.6727953125Q6.702332548828125,10.7340953125,6.543412548828125,10.7653353125Q6.3844825488281245,10.7965753125,6.222512548828125,10.7965753125Q6.140762548828125,10.7965753125,6.059412548828125,10.7885653125Q5.978052548828125,10.7805453125,5.897882548828125,10.7645953125Q5.817702548828125,10.7486453125,5.739472548828125,10.7249153125Q5.661242548828125,10.7011753125,5.585722548828125,10.6698953125Q5.510192548828125,10.6386053125,5.438102548828125,10.6000653125Q5.366002548828125,10.5615153125,5.298032548828125,10.5160953125Q5.2300625488281245,10.4706753125,5.166872548828125,10.4188053125Q5.103672548828126,10.3669353125,5.045872548828125,10.3091253125Q4.988062548828125,10.2513053125,4.936202548828125,10.1881053125Q4.8843425488281245,10.1249053125,4.838932548828125,10.0569153125Q4.793512548828125,9.9889353125,4.754972548828125,9.9168353125Q4.716442548828125,9.8447253125,4.685152548828125,9.7691853125Q4.653872548828125,9.6936553125,4.630142548828125,9.6154153125Q4.606412548828125,9.5371753125,4.590462548828125,9.4569853125Q4.574512548828125,9.3767953125,4.566502548828125,9.2954253125Q4.558492548828125,9.214055312500001,4.558492548828125,9.1322953125Q4.558492548828125,9.0505353125,4.566502548828125,8.969175312499999Q4.574512548828125,8.8878053125,4.590462548828125,8.807615312500001Q4.606412548828125,8.7274253125,4.630142548828125,8.6491853125Q4.653872548828125,8.570945312500001,4.685152548828125,8.4954053125Q4.716442548828125,8.4198653125,4.754972548828125,8.3477653125Q4.793512548828125,8.2756553125,4.838932548828125,8.207675312500001Q4.8843425488281245,8.139695312499999,4.936202548828125,8.076485312500001Q4.988062548828125,8.013285312499999,5.045872548828125,7.9554753125Q5.103672548828126,7.8976653125,5.166872548828125,7.8457953125Q5.2300625488281245,7.7939253125,5.298032548828125,7.7484953125Q5.366002548828125,7.7030753125,5.438102548828125,7.6645353125Q5.510192548828125,7.6259953125,5.585722548828125,7.5947053125Q5.661242548828125,7.5634153125,5.739472548828125,7.5396853125Q5.817702548828125,7.5159453125,5.897882548828125,7.4999953125Q5.978052548828125,7.4840453125,6.059412548828125,7.4760353125Q6.140762548828125,7.4680153125,6.222512548828125,7.4680153125Q6.302552548828125,7.4680153125,6.382222548828125,7.4757053125Q6.461892548828125,7.4833853125,6.540462548828125,7.4986753125Q6.619032548828125,7.5139753125,6.695762548828125,7.5367453125Q6.772502548828125,7.5595153125,6.846692548828125,7.5895353125Q6.920892548828125,7.6195653125,6.991862548828125,7.6565753125Q7.062842548828125,7.6935953125,7.129932548828125,7.7372453125Q7.197022548828125,7.7809053125,7.259622548828125,7.8307953125Q7.322212548828125,7.8806853125,7.379732548828125,7.9363553125Q7.437242548828125,7.9920253125,7.489152548828125,8.0529653125Q7.541062548828125,8.1139053125,7.586882548828125,8.1795353125Q7.632702548828125,8.245175312499999,7.672012548828125,8.314905312499999Q7.711322548828125,8.3846453125,7.743762548828125,8.457825312499999Q7.776202548828125,8.5310153125,7.801462548828125,8.606975312500001Q7.826732548828125,8.6829353125,7.844592548828125,8.7609653125Q7.862452548828125,8.8390053125,7.872732548828125,8.9183953125Q7.883022548828125,8.9977853125,7.885642548828125,9.077795312500001L11.888492548828125,10.6220353125L15.883962548828125,9.058175312500001Q15.887462548828125,8.978845312499999,15.898562548828124,8.900205312499999Q15.909662548828125,8.821565312499999,15.928162548828125,8.7443453125Q15.946662548828124,8.6671153125,15.972462548828124,8.5920053125Q15.998262548828125,8.5168953125,16.031062548828125,8.4445853125Q16.063862548828126,8.372275312500001,16.103462548828126,8.3034153125Q16.143062548828127,8.2345553125,16.188962548828123,8.1697853125Q16.234862548828126,8.105005312500001,16.286762548828126,8.0448953125Q16.338662548828125,7.9847953125,16.396062548828127,7.9299053125Q16.453462548828124,7.8750153125,16.515862548828125,7.8258353125Q16.578162548828125,7.7766653125,16.644962548828126,7.7336553125Q16.711662548828123,7.6906453125,16.782262548828125,7.6541853125Q16.852762548828125,7.6177253125,16.926462548828127,7.5881553125Q17.000162548828126,7.5585853125,17.076362548828126,7.5361653125Q17.152562548828126,7.5137553125,17.230562548828125,7.4986953125Q17.308562548828125,7.4836353125,17.387562548828125,7.4760653125Q17.466662548828126,7.4685053125,17.546062548828125,7.4685053125Q17.627762548828123,7.4685053125,17.709062548828125,7.4765153125Q17.790462548828124,7.4845253125,17.870562548828126,7.5004753125Q17.950762548828123,7.5164153125,18.028962548828126,7.5401453125Q18.107162548828125,7.5638653125,18.182662548828127,7.5951453125Q18.258262548828124,7.6264253125,18.330262548828124,7.6649553125Q18.402362548828123,7.7034853125,18.470362548828124,7.7488853125Q18.538262548828126,7.7942953125,18.601462548828124,7.8461453125Q18.664662548828126,7.8979953125,18.722462548828126,7.9557953125Q18.780262548828127,8.0135853125,18.832062548828127,8.076765312500001Q18.883962548828126,8.1399453125,18.929362548828124,8.2079053125Q18.974762548828124,8.275865312499999,19.013262548828123,8.3479453125Q19.051862548828126,8.4200253125,19.083062548828124,8.4955353125Q19.114362548828126,8.5710453125,19.138062548828124,8.649265312499999Q19.161862548828125,8.727475312500001,19.177762548828124,8.8076353125Q19.193762548828126,8.8878053125,19.201762548828125,8.9691453125Q19.209762548828124,9.0504753125,19.209762548828124,9.1322153125Q19.209762548828124,9.2139453125,19.201762548828125,9.295285312499999Q19.193762548828126,9.3766253125,19.177762548828124,9.4567853125Q19.161862548828125,9.5369453125,19.138062548828124,9.6151553125Q19.114362548828126,9.6933753125,19.083062548828124,9.7688853125Q19.051862548828126,9.8443953125,19.013262548828123,9.9164753125Q18.974762548828124,9.9885553125,18.929362548828124,10.0565153125Q18.883962548828126,10.1244753125,18.832062548828127,10.1876553125Q18.780262548828127,10.2508353125,18.722462548828126,10.3086253125Q18.664662548828126,10.3664253125,18.601462548828124,10.4182753125Q18.538262548828126,10.4701253125,18.470362548828124,10.5155353125Q18.402362548828123,10.5609453125,18.330262548828124,10.5994653125Q18.258262548828124,10.6379953125,18.182662548828127,10.6692753125Q18.107162548828125,10.7005553125,18.028962548828126,10.7242753125Q17.950762548828123,10.7480053125,17.870562548828126,10.7639453125Q17.790462548828124,10.7798953125,17.709062548828125,10.7879053125Q17.627762548828123,10.7959153125,17.546062548828125,10.7959153125Q17.379362548828126,10.7959153125,17.216062548828127,10.7628753125Q17.052762548828127,10.7298353125,16.899262548828126,10.6650553125Q16.745762548828125,10.6002853125,16.608162548828126,10.5063553125Q16.470462548828124,10.4124253125,16.354262548828125,10.2930653125L12.462212548828125,11.8572953125L12.462212548828125,17.0022953125Q12.588262548828125,17.0416953125,12.706562548828124,17.100595312499998Q12.824862548828126,17.1594953125,12.932362548828126,17.236295312499998Q13.039962548828125,17.3130953125,13.133962548828125,17.4058953125Q13.228062548828126,17.4987953125,13.306262548828125,17.6052953125Q13.384562548828125,17.7117953125,13.444962548828125,17.8292953125Q13.505462548828126,17.9467953125,13.546562548828126,18.0723953125Q13.587762548828126,18.1978953125,13.608662548828125,18.3284953125Q13.629462548828124,18.4589953125,13.629462548828124,18.5910953125Q13.629462548828124,18.6728953125,13.621462548828125,18.7542953125Q13.613462548828124,18.8356953125,13.597462548828124,18.9158953125Q13.581562548828124,18.9960953125,13.557762548828125,19.0743953125Q13.534062548828125,19.1526953125,13.502762548828125,19.2281953125Q13.471462548828125,19.3037953125,13.432962548828124,19.3758953125Q13.394362548828125,19.4480953125,13.348962548828124,19.5160953125Q13.303562548828126,19.5840953125,13.251662548828126,19.6472953125Q13.199762548828126,19.7104953125,13.141962548828126,19.7683953125Q13.084162548828125,19.8261953125,13.020962548828125,19.8780953125Q12.957762548828125,19.9299953125,12.889762548828125,19.9753953125Q12.821762548828126,20.0207953125,12.749662548828125,20.0593953125Q12.677562548828124,20.0979953125,12.602062548828124,20.1292953125Q12.526462548828125,20.1605953125,12.448262548828126,20.1842953125Q12.370012548828125,20.2079953125,12.289822548828125,20.2239953125Q12.209632548828125,20.2399953125,12.128262548828125,20.2479953125Q12.046892548828126,20.2559953125,11.965132548828125,20.2559953125Q11.883362548828124,20.2559953125,11.801992548828125,20.2479953125Q11.720622548828125,20.2399953125,11.640432548828125,20.2239953125Q11.560232548828125,20.2079953125,11.481992548828124,20.1842953125Q11.403752548828125,20.1605953125,11.328212548828125,20.1292953125Q11.252672548828125,20.0979953125,11.180562548828124,20.0593953125Q11.108452548828126,20.0207953125,11.040472548828125,19.9753953125Q10.972482548828125,19.9299953125,10.909282548828125,19.8780953125Q10.846072548828126,19.8261953125,10.788262548828126,19.7683953125Q10.730442548828124,19.7104953125,10.678572548828125,19.6472953125Q10.626702548828124,19.5840953125,10.581282548828124,19.5160953125Q10.535852548828124,19.4480953125,10.497312548828125,19.3758953125Q10.458762548828126,19.3037953125,10.427472548828124,19.2281953125Q10.396182548828126,19.1526953125,10.372452548828125,19.0743953125Q10.348722548828125,18.9960953125,10.332762548828125,18.9158953125Q10.316812548828125,18.8356953125,10.308802548828126,18.7542953125Q10.300792548828124,18.6728953125,10.300782548828124,18.5910953125Q10.300792548828124,18.4828953125,10.314792548828125,18.3755953125Q10.328792548828126,18.2682953125,10.356572548828126,18.1636953125Q10.384342548828126,18.0590953125,10.425422548828125,17.9589953125Q10.466492548828125,17.8588953125,10.520182548828124,17.7648953125Q10.573862548828124,17.6709953125,10.639252548828125,17.5847953125Q10.704652548828125,17.4985953125,10.780642548828125,17.4215953125Q10.856642548828125,17.344595312499997,10.941972548828126,17.2779953125Q11.027292548828125,17.2114953125,11.120512548828126,17.156595312500002L11.120512548828126,11.8448953125L7.388322548828125,10.3198553125Z" fill="currentColor"/></g></g></svg>
                    {t('smallModel')}
                </div>
                <div className="step-content">
                    <div className="step-content-header">
                        {stepList.map(item=>(
                            <React.Fragment key={item.step}>
                                {step > item.step ?
                                    <div className="step-data step-data-complete" onClick={()=>this.stepClick(item.step)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="16" height="16" viewBox="0 0 16 16"><defs><clipPath id="master_svg0_385_88287"><rect x="0" y="0" width="16" height="16" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_385_88287)"><g><path d="M8.002730312499999,0.095703125C3.6574003125,0.095703125,0.1220703125,3.631033125,0.1220703125,7.976363125C0.1220703125,12.321703125,3.6574003125,15.857003125,8.002730312499999,15.857003125C12.3480703125,15.857003125,15.8833703125,12.321703125,15.8833703125,7.976363125C15.8833703125,3.631033125,12.3480703125,0.095703125,8.002730312499999,0.095703125ZM12.4124703125,6.465383125L7.2876103125,11.719103125C7.1651403125,11.844503125,6.9971403125,11.915703125,6.8217403125,11.916703125L6.8181903125,11.916703125C6.6441003125,11.916703125,6.4770303125,11.847403125,6.3538803125,11.724303125L3.5981003125,8.969123125C3.3415203125,8.712933125,3.3415203125,8.297033125,3.5981003125,8.040523125C3.8546103125,7.783943125,4.2701903125,7.783943125,4.5267003125,8.040523125L6.8130703125,10.326203125L11.4736703125,5.547013125C11.7275703125,5.287943125,12.1437703125,5.283083125,12.4022703125,5.536763125C12.6616703125,5.790403125,12.6661703125,6.206293125,12.4124703125,6.465383125Z" fill="#FFFFFF"/></g></g></svg>
                                        <span className="label">{item.label}</span>
                                    </div> :
                                    <div className={step === item.step ? "step-data step-data-active" : "step-data"}>
                                        <span className="step">{item.step}</span>
                                        <span className="label">{item.label}</span>
                                    </div>
                                }
                                {item.step !== 5 && <svg className={step === item.step ? "split-active" : "split"} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="12" height="12" viewBox="0 0 12 12"><defs><clipPath id="master_svg0_385_87696"><rect x="0" y="0" width="12" height="12" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_385_87696)"><g><path d="M4.276295,12L3.203125357628,10.9268L8.129954999999999,6L3.203125,1.07317L4.276295,0L10.276295000000001,6L4.276295,12Z" fill="currentColor"/></g></g></svg> }
                            </React.Fragment>
                        ))}
                    </div>
                    {step === 1 && <div className="step-content-data">
                        <div className="step-content-data-title">
                            <span className="label">{t('smallModelView.attributeConfig')}</span>
                            <span className="button" onClick={()=>this.next1()}>{t('smallModelView.next')}</span>
                        </div>
                        <div className="step-form-box">
                            <div className="step-form">
                                <div className="form-item">
                                    <span className="label">{t('smallModelView.type')}:</span>
                                    <Select
                                        value={waxberryExtendObj.type}
                                        disabled={waxberryExtendObj.templateName}
                                        onChange={(value)=>this.modelTypeChange(value)}
                                        options={[{ value: '0', label: t('smallModelView.visualModel') },{ value: '1', label: t('smallModelView.dataModel') }]}
                                    />
                                </div>
                                <div className="form-item">
                                    <span className="label"><font color="red">*</font>{t('waxberryForm.name')}:</span>
                                    <Input value={waxberryObj.name} onChange={(e)=>this.waxberryObjChange("name",e.target.value)} placeholder={t('waxberryForm.pleaseEnter')}/>
                                </div>
                                <div className="form-item">
                                    <span className="label"><font color="red">*</font>{t('waxberryForm.introduction')}:</span>
                                    <TextArea rows={3} value={waxberryObj.discription} onChange={(e)=>this.waxberryObjChange("discription",e.target.value)} placeholder={t('waxberryForm.pleaseEnter')}/>
                                </div>
                                <div className="form-item">
                                    <span className="label">{t('waxberryForm.tags')}:</span>
                                    <Select
                                        mode="tags"
                                        notFoundContent={t('waxberryForm.createTags')}
                                        value={waxberryObj.agentLabel ? waxberryObj.agentLabel.split(',') : []}
                                        onChange={(value)=>this.waxberryObjChange("agentLabel",value.join(','))}
                                        placeholder={t('waxberryForm.createTags')}
                                    />
                                </div>
                                <div className="form-item">
                                    <span className="label"><font color="red">*</font>{t('smallModelView.screenshot')}:</span>
                                    <Dragger {...coverProps}>
                                        {waxberryObj.coverFileId ?
                                            <img src={`${globalInitConfig.REACT_APP_API_FS_URL}file/download/${waxberryObj.coverFileId}`} width="100%" height="90"/> :
                                            <div className="uploadCustom">
                                                <img src={UploadIcon}/>
                                                <div className="uploadText">{t('smallModelView.uploadImage')}</div>
                                            </div>
                                        }
                                    </Dragger>
                                </div>
                                <div className="form-item-switch">
                                    <span className="label">{t('waxberryForm.isModificationAllowed')}</span>
                                    <Switch checked={waxberryObj.ismodify===0} onChange={(checked)=>this.waxberryObjChange("ismodify",checked?0:1)} />
                                </div>
                                <div className="form-item-switch">
                                    <span className="label">{t('waxberryForm.isCopyingAllowed')}</span>
                                    <Switch checked={waxberryObj.iscopy===0} onChange={(checked)=>this.waxberryObjChange("iscopy",checked?0:1)} />
                                </div>
                                <div className="form-item">
                                    <span className="label">模板:</span>
                                    <div className="custom-label">
                                        <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="24" height="24" viewBox="0 0 24 24"><defs><clipPath id="master_svg0_385_84534"><rect x="0" y="0" width="24" height="24" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_385_84534)"><g><path d="M10.904642548828125,22.3479953125C11.202582548828126,22.5201953125,11.539952548828126,22.6126953125,11.884082548828125,22.6162953125C12.228222548828125,22.6126953125,12.565562548828124,22.5201953125,12.863562548828124,22.3479953125L20.403862548828126,18.0410953125C21.008162548828125,17.6921953125,21.381162548828126,17.048295312500002,21.383262548828124,16.350595312499998L21.383262548828124,7.7234453125C21.367662548828125,7.0116153125,20.966962548828125,6.3643453125,20.336762548828126,6.0329053125L12.863562548828124,1.7126353125C12.257442548828125,1.3627153125,11.510722548828126,1.3627153125,10.904642548828125,1.7126353125L3.444802548828125,6.0329053125C2.840544548828125,6.3817653125,2.467465708828125,7.0257153125,2.465362548828125,7.7234453125L2.465362548828125,16.350595312499998C2.467385458828125,17.0447953125,2.834280548828125,17.6868953125,3.431385548828125,18.0410953125L10.904642548828125,22.3479953125ZM7.388322548828125,10.3198553125Q7.272752548828125,10.4333453125,7.137462548828125,10.5224153125Q7.002172548828125,10.6114853125,6.852252548828125,10.6727953125Q6.702332548828125,10.7340953125,6.543412548828125,10.7653353125Q6.3844825488281245,10.7965753125,6.222512548828125,10.7965753125Q6.140762548828125,10.7965753125,6.059412548828125,10.7885653125Q5.978052548828125,10.7805453125,5.897882548828125,10.7645953125Q5.817702548828125,10.7486453125,5.739472548828125,10.7249153125Q5.661242548828125,10.7011753125,5.585722548828125,10.6698953125Q5.510192548828125,10.6386053125,5.438102548828125,10.6000653125Q5.366002548828125,10.5615153125,5.298032548828125,10.5160953125Q5.2300625488281245,10.4706753125,5.166872548828125,10.4188053125Q5.103672548828126,10.3669353125,5.045872548828125,10.3091253125Q4.988062548828125,10.2513053125,4.936202548828125,10.1881053125Q4.8843425488281245,10.1249053125,4.838932548828125,10.0569153125Q4.793512548828125,9.9889353125,4.754972548828125,9.9168353125Q4.716442548828125,9.8447253125,4.685152548828125,9.7691853125Q4.653872548828125,9.6936553125,4.630142548828125,9.6154153125Q4.606412548828125,9.5371753125,4.590462548828125,9.4569853125Q4.574512548828125,9.3767953125,4.566502548828125,9.2954253125Q4.558492548828125,9.214055312500001,4.558492548828125,9.1322953125Q4.558492548828125,9.0505353125,4.566502548828125,8.969175312499999Q4.574512548828125,8.8878053125,4.590462548828125,8.807615312500001Q4.606412548828125,8.7274253125,4.630142548828125,8.6491853125Q4.653872548828125,8.570945312500001,4.685152548828125,8.4954053125Q4.716442548828125,8.4198653125,4.754972548828125,8.3477653125Q4.793512548828125,8.2756553125,4.838932548828125,8.207675312500001Q4.8843425488281245,8.139695312499999,4.936202548828125,8.076485312500001Q4.988062548828125,8.013285312499999,5.045872548828125,7.9554753125Q5.103672548828126,7.8976653125,5.166872548828125,7.8457953125Q5.2300625488281245,7.7939253125,5.298032548828125,7.7484953125Q5.366002548828125,7.7030753125,5.438102548828125,7.6645353125Q5.510192548828125,7.6259953125,5.585722548828125,7.5947053125Q5.661242548828125,7.5634153125,5.739472548828125,7.5396853125Q5.817702548828125,7.5159453125,5.897882548828125,7.4999953125Q5.978052548828125,7.4840453125,6.059412548828125,7.4760353125Q6.140762548828125,7.4680153125,6.222512548828125,7.4680153125Q6.302552548828125,7.4680153125,6.382222548828125,7.4757053125Q6.461892548828125,7.4833853125,6.540462548828125,7.4986753125Q6.619032548828125,7.5139753125,6.695762548828125,7.5367453125Q6.772502548828125,7.5595153125,6.846692548828125,7.5895353125Q6.920892548828125,7.6195653125,6.991862548828125,7.6565753125Q7.062842548828125,7.6935953125,7.129932548828125,7.7372453125Q7.197022548828125,7.7809053125,7.259622548828125,7.8307953125Q7.322212548828125,7.8806853125,7.379732548828125,7.9363553125Q7.437242548828125,7.9920253125,7.489152548828125,8.0529653125Q7.541062548828125,8.1139053125,7.586882548828125,8.1795353125Q7.632702548828125,8.245175312499999,7.672012548828125,8.314905312499999Q7.711322548828125,8.3846453125,7.743762548828125,8.457825312499999Q7.776202548828125,8.5310153125,7.801462548828125,8.606975312500001Q7.826732548828125,8.6829353125,7.844592548828125,8.7609653125Q7.862452548828125,8.8390053125,7.872732548828125,8.9183953125Q7.883022548828125,8.9977853125,7.885642548828125,9.077795312500001L11.888492548828125,10.6220353125L15.883962548828125,9.058175312500001Q15.887462548828125,8.978845312499999,15.898562548828124,8.900205312499999Q15.909662548828125,8.821565312499999,15.928162548828125,8.7443453125Q15.946662548828124,8.6671153125,15.972462548828124,8.5920053125Q15.998262548828125,8.5168953125,16.031062548828125,8.4445853125Q16.063862548828126,8.372275312500001,16.103462548828126,8.3034153125Q16.143062548828127,8.2345553125,16.188962548828123,8.1697853125Q16.234862548828126,8.105005312500001,16.286762548828126,8.0448953125Q16.338662548828125,7.9847953125,16.396062548828127,7.9299053125Q16.453462548828124,7.8750153125,16.515862548828125,7.8258353125Q16.578162548828125,7.7766653125,16.644962548828126,7.7336553125Q16.711662548828123,7.6906453125,16.782262548828125,7.6541853125Q16.852762548828125,7.6177253125,16.926462548828127,7.5881553125Q17.000162548828126,7.5585853125,17.076362548828126,7.5361653125Q17.152562548828126,7.5137553125,17.230562548828125,7.4986953125Q17.308562548828125,7.4836353125,17.387562548828125,7.4760653125Q17.466662548828126,7.4685053125,17.546062548828125,7.4685053125Q17.627762548828123,7.4685053125,17.709062548828125,7.4765153125Q17.790462548828124,7.4845253125,17.870562548828126,7.5004753125Q17.950762548828123,7.5164153125,18.028962548828126,7.5401453125Q18.107162548828125,7.5638653125,18.182662548828127,7.5951453125Q18.258262548828124,7.6264253125,18.330262548828124,7.6649553125Q18.402362548828123,7.7034853125,18.470362548828124,7.7488853125Q18.538262548828126,7.7942953125,18.601462548828124,7.8461453125Q18.664662548828126,7.8979953125,18.722462548828126,7.9557953125Q18.780262548828127,8.0135853125,18.832062548828127,8.076765312500001Q18.883962548828126,8.1399453125,18.929362548828124,8.2079053125Q18.974762548828124,8.275865312499999,19.013262548828123,8.3479453125Q19.051862548828126,8.4200253125,19.083062548828124,8.4955353125Q19.114362548828126,8.5710453125,19.138062548828124,8.649265312499999Q19.161862548828125,8.727475312500001,19.177762548828124,8.8076353125Q19.193762548828126,8.8878053125,19.201762548828125,8.9691453125Q19.209762548828124,9.0504753125,19.209762548828124,9.1322153125Q19.209762548828124,9.2139453125,19.201762548828125,9.295285312499999Q19.193762548828126,9.3766253125,19.177762548828124,9.4567853125Q19.161862548828125,9.5369453125,19.138062548828124,9.6151553125Q19.114362548828126,9.6933753125,19.083062548828124,9.7688853125Q19.051862548828126,9.8443953125,19.013262548828123,9.9164753125Q18.974762548828124,9.9885553125,18.929362548828124,10.0565153125Q18.883962548828126,10.1244753125,18.832062548828127,10.1876553125Q18.780262548828127,10.2508353125,18.722462548828126,10.3086253125Q18.664662548828126,10.3664253125,18.601462548828124,10.4182753125Q18.538262548828126,10.4701253125,18.470362548828124,10.5155353125Q18.402362548828123,10.5609453125,18.330262548828124,10.5994653125Q18.258262548828124,10.6379953125,18.182662548828127,10.6692753125Q18.107162548828125,10.7005553125,18.028962548828126,10.7242753125Q17.950762548828123,10.7480053125,17.870562548828126,10.7639453125Q17.790462548828124,10.7798953125,17.709062548828125,10.7879053125Q17.627762548828123,10.7959153125,17.546062548828125,10.7959153125Q17.379362548828126,10.7959153125,17.216062548828127,10.7628753125Q17.052762548828127,10.7298353125,16.899262548828126,10.6650553125Q16.745762548828125,10.6002853125,16.608162548828126,10.5063553125Q16.470462548828124,10.4124253125,16.354262548828125,10.2930653125L12.462212548828125,11.8572953125L12.462212548828125,17.0022953125Q12.588262548828125,17.0416953125,12.706562548828124,17.100595312499998Q12.824862548828126,17.1594953125,12.932362548828126,17.236295312499998Q13.039962548828125,17.3130953125,13.133962548828125,17.4058953125Q13.228062548828126,17.4987953125,13.306262548828125,17.6052953125Q13.384562548828125,17.7117953125,13.444962548828125,17.8292953125Q13.505462548828126,17.9467953125,13.546562548828126,18.0723953125Q13.587762548828126,18.1978953125,13.608662548828125,18.3284953125Q13.629462548828124,18.4589953125,13.629462548828124,18.5910953125Q13.629462548828124,18.6728953125,13.621462548828125,18.7542953125Q13.613462548828124,18.8356953125,13.597462548828124,18.9158953125Q13.581562548828124,18.9960953125,13.557762548828125,19.0743953125Q13.534062548828125,19.1526953125,13.502762548828125,19.2281953125Q13.471462548828125,19.3037953125,13.432962548828124,19.3758953125Q13.394362548828125,19.4480953125,13.348962548828124,19.5160953125Q13.303562548828126,19.5840953125,13.251662548828126,19.6472953125Q13.199762548828126,19.7104953125,13.141962548828126,19.7683953125Q13.084162548828125,19.8261953125,13.020962548828125,19.8780953125Q12.957762548828125,19.9299953125,12.889762548828125,19.9753953125Q12.821762548828126,20.0207953125,12.749662548828125,20.0593953125Q12.677562548828124,20.0979953125,12.602062548828124,20.1292953125Q12.526462548828125,20.1605953125,12.448262548828126,20.1842953125Q12.370012548828125,20.2079953125,12.289822548828125,20.2239953125Q12.209632548828125,20.2399953125,12.128262548828125,20.2479953125Q12.046892548828126,20.2559953125,11.965132548828125,20.2559953125Q11.883362548828124,20.2559953125,11.801992548828125,20.2479953125Q11.720622548828125,20.2399953125,11.640432548828125,20.2239953125Q11.560232548828125,20.2079953125,11.481992548828124,20.1842953125Q11.403752548828125,20.1605953125,11.328212548828125,20.1292953125Q11.252672548828125,20.0979953125,11.180562548828124,20.0593953125Q11.108452548828126,20.0207953125,11.040472548828125,19.9753953125Q10.972482548828125,19.9299953125,10.909282548828125,19.8780953125Q10.846072548828126,19.8261953125,10.788262548828126,19.7683953125Q10.730442548828124,19.7104953125,10.678572548828125,19.6472953125Q10.626702548828124,19.5840953125,10.581282548828124,19.5160953125Q10.535852548828124,19.4480953125,10.497312548828125,19.3758953125Q10.458762548828126,19.3037953125,10.427472548828124,19.2281953125Q10.396182548828126,19.1526953125,10.372452548828125,19.0743953125Q10.348722548828125,18.9960953125,10.332762548828125,18.9158953125Q10.316812548828125,18.8356953125,10.308802548828126,18.7542953125Q10.300792548828124,18.6728953125,10.300782548828124,18.5910953125Q10.300792548828124,18.4828953125,10.314792548828125,18.3755953125Q10.328792548828126,18.2682953125,10.356572548828126,18.1636953125Q10.384342548828126,18.0590953125,10.425422548828125,17.9589953125Q10.466492548828125,17.8588953125,10.520182548828124,17.7648953125Q10.573862548828124,17.6709953125,10.639252548828125,17.5847953125Q10.704652548828125,17.4985953125,10.780642548828125,17.4215953125Q10.856642548828125,17.344595312499997,10.941972548828126,17.2779953125Q11.027292548828125,17.2114953125,11.120512548828126,17.156595312500002L11.120512548828126,11.8448953125L7.388322548828125,10.3198553125Z" fill="currentColor"/></g></g></svg>
                                        <span>{waxberryExtendObj.templateName}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>}
                    {step === 2 && <div className="step-content-data">
                        <div className="step-content-data-title">
                            <span className="label">{t('smallModelView.dataList')}<span className="count">{fileList.length}</span></span>
                            <Upload {...imgProps}>
                                <span className="button">{t('waxberryForm.upload')}</span>
                            </Upload>
                            {waxberryExtendObj.type === "0" && <span className="button" onClick={()=>this.openApp()}>{t('smallModelView.openSoftware')}</span> }
                            <span className="button" onClick={()=>this.next2()}>{t('smallModelView.next')}</span>
                        </div>
                        <div className="step-data-box">
                            {fileList.length>0 ?
                                <div className="step-file-list">
                                    {fileList.map(file=>(
                                        <div className="file-info" key={file.fileId}>
                                            <span className="img" dangerouslySetInnerHTML={{ __html: getFileTypeTempltate(file.filename.split('.')[1]) }}/>
                                            <span className="label">{file.filename}</span>
                                            <span className="size">{formatFileSize(file.filesize)}</span>
                                            <CloseOutlined onClick={()=>this.deleteFile(file)}/>
                                        </div>
                                    ))}
                                </div> :
                                <div className="data-empty">
                                    <Dragger {...imgProps}>
                                        <div className="data-upload">
                                            <img src={UploadIcon1}/>
                                            <span className="label">{t('smallModelView.dragFileHereOrClickToUpload')}</span>
                                        </div>
                                    </Dragger>
                                </div>
                            }
                        </div>
                    </div>}
                    {step === 3 && <div className="step-content-data">
                        <div className="step-content-data-title">
                            <span className="label">{t('smallModelView.trainingConfig')}</span>
                            <span className="button" onClick={()=>this.next3()}>{t('smallModelView.next')}</span>
                        </div>
                        <div className="step-table-box">
                            <Table
                                rowKey="id"
                                columns={columns}
                                dataSource={modelParamConfig}
                                pagination={false}
                            />
                        </div>
                    </div>}
                    {step === 4 && <div className="step-content-data">
                        <div className="step-content-data-title">
                            <span className="label">{t('smallModelView.modelTraining')}</span>
                            <span className="button" onClick={()=>this.next4()}>{t('smallModelView.next')}</span>
                        </div>
                        <div className="step-train-box">
                            <img src={TrainPng}/>
                        </div>
                    </div>}
                    {step === 5 && <div className="step-content-data">
                        <div className="step-content-data-title">
                            <span className="label">{t('smallModelView.testValidation')}</span>
                            <span className="button" onClick={()=>this.publish()}>
                                <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="14" height="14" viewBox="0 0 14 14"><defs><clipPath id="master_svg0_41_4595"><rect x="0" y="0" width="14" height="14" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_41_4595)"><g><path d="M8.7259428515625,13.1219296875C8.4485428515625,13.1219296875,8.1766128515625,13.0247296875,7.9571728515625,12.8406296875L6.2048528515625,11.3676296875L4.3211428515625006,12.8704296875C4.1364328515625,13.0181296875,3.8829528515625,13.0456296875,3.6710428515625,12.9422296875C3.4588528515625,12.8384296875,3.3248728515625,12.6222296875,3.3273328515625,12.3856296875L3.3616428515625,9.0443996875L1.7372918515625,7.6123996875C1.4407488515625,7.3634396875,1.2839320515625,6.9709196875,1.3283656515625,6.5719696875C1.3729359515625,6.1726196875,1.6126038515625,5.8248096875,1.9694398515625,5.6406496875L10.9476228515625,1.0124436875C11.3732228515625,0.7930096875,11.8688228515625,0.8449627875,12.2400228515625,1.1469746875C12.6115228515625,1.4493966875,12.7624228515625,1.9240796875,12.6339228515625,2.3855096875L9.8814928515625,12.2458296875C9.7714328515625,12.6397296875,9.4722928515625,12.9470296875,9.081682851562501,13.0677296875C8.9645228515625,13.1040296875,8.8446128515625,13.1219296875,8.7259428515625,13.1219296875ZM6.2149628515625,9.9643796875C6.3551028515625,9.9643796875,6.4949628515625,10.0122296875,6.6088528515625,10.1077996875L8.713502851562499,11.8766296875L11.4313228515625,2.1405096875L2.5655328515624998,6.7106096875L4.3812928515625,8.3111696875C4.5148728515625,8.4286096875,4.590472851562501,8.5986896875,4.5887028515625,8.7765596875L4.5647728515625,11.1100296875L5.8332528515625,10.0980896875C5.9416128515625,10.0114596875,6.0762328515625,9.9642996875,6.2149628515625,9.9643796875Z" fill="currentColor"/></g><g><path d="M6.2948091875,8.129772656250001C6.1381301875,8.129772656250001,5.9815871875,8.07002265625,5.8619581875,7.95039265625C5.6228369875,7.711272656249999,5.6228369875,7.32367265625,5.8619581875,7.084832656250001L8.1524071875,4.79506365625C8.3915271875,4.55594245625,8.7788571875,4.55594245625,9.0179771875,4.79506365625C9.2570971875,5.03418465625,9.2570971875,5.42178165625,9.0179771875,5.66063265625L6.7275271875,7.95039265625C6.6080321875,8.07002265625,6.4513521874999995,8.129772656250001,6.2948091875,8.129772656250001Z" fill="currentColor"/></g></g></svg>
                                <span>{t('publish')}</span>
                            </span>
                        </div>
                        <div className="step-test-box">
                            <div className="form-item">
                                <span className="label">{t('smallModelView.uploadImage')}</span>
                                <Dragger {...testProps}>
                                    {this.state.testFileId ?
                                        <img src={`${globalInitConfig.REACT_APP_API_FS_URL}file/download/${this.state.testFileId}`} width="100%" height="160"/> :
                                        <div className="uploadCustom">
                                            <img src={UploadIcon}/>
                                            <div className="uploadText">{t('smallModelView.uploadImage')}</div>
                                        </div>
                                    }
                                </Dragger>
                            </div>
                            <div className="form-item">
                                <span className="label">结果</span>
                                <span className="result"></span>
                            </div>
                        </div>
                    </div>}
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
                                            <Upload {...props}>
                                                <img src={waxberryObj.imgeFileId ? `${globalInitConfig.REACT_APP_API_FS_URL}file/download/${waxberryObj.imgeFileId}` : DefaultPng} width="90" height="90"/>
                                            </Upload>
                                        </Spin>
                                        <span className="size">{t('waxberryForm.recommendedAspectRatio')}：1:1</span>
                                        <img onClick={()=>this.generateImage('imgeFileId','iconSpinning1')} src={AiSvg} className="ai1"/>
                                    </div>
                                    <div className="icon">
                                        <span className="label">{t('waxberryForm.cover')}</span>
                                        <Spin spinning={iconSpinning2}>
                                            <Upload {...coverProps}>
                                                <img src={waxberryObj.coverFileId ? `${globalInitConfig.REACT_APP_API_FS_URL}file/download/${waxberryObj.coverFileId}` : CardDefaultPng} width="160" height="90"/>
                                            </Upload>
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
                                    <Upload {...attachmentProps} fileList={waxberryObj.fileList}>
                                        <div className="upload">{t('upload')}</div>
                                    </Upload>
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
                        <div className="waxberry-modal-footer">
                            <div className="close" onClick={this.hideWaxberryModal.bind(this)}>{t('cancel')}</div>
                            <div className="ok" onClick={()=>this.waxberryModalOk(true)}>{t('publish')}</div>
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
                            <div className="ok" onClick={()=>this.waxberryModalOk()}>{t('publish')}</div>
                            <div className="close" onClick={()=>this.setState({showPublishModal: false})}>{t('cancel')}</div>
                        </div>
                    </div>
                </div>}
            </div>
        );
    }
}
export default withTranslation()(App);
