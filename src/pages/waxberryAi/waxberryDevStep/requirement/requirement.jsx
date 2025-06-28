import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import MarkdownRenderer from '@components/MarkdownRenderer';
import FileList from "../../components/fileList/fileList";
import Voice from "@/components/Voice";
import FormulaModal from "../../components/formulaModal/formulaModal";
import TableModal from "../../components/tableModal/tableModal";
import ExtraDialogue from "../../components/extraDialogue/extraDialogue";

import axios from 'axios';
import { fetchEventSource } from '@microsoft/fetch-event-source';

import { Input,Tooltip,message as Message,Cascader } from 'antd';
import {
    FileTextOutlined,
    FolderOutlined,
    DownOutlined,
    LoadingOutlined,
    RightOutlined,
    CloseOutlined
} from '@ant-design/icons';
import { withTranslation } from 'react-i18next';

import ModelSvg from '../../img/model.svg';
import WarningSvg from "../../img/warning.svg";

let controller;
const { TextArea } = Input;

function getTextFileWordCount(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const fileContent = event.target.result;
            const words = fileContent.trim().split(/\s+/).length;
            resolve(words);
        };
        reader.onerror = (error) => {
            console.error('读取文件失败:', error);
            reject(0);
        };
        reader.readAsText(file);
    });
}

let fileReplace = {};//@替换
let isUserScrolling = false;//用户是否滚动
let docketIp = globalInitConfig.REACT_APP_API_SBX_IP_URL;
let langChainHttp = globalInitConfig.REACT_APP_API_CORE_URL;

class Requirement extends Component {
    constructor(props) {
        super(props);
        this.state = {
            message: "",
            messageObj: {},
            messageData: [],
            isExecuting: false,
            waxberryObj: props.waxberryObj || {},
            fileList: [],
            inputFileOptions: [],
            inputFileOpen: false,
            requirementContent: '',
            insertTableData: []
        };
    }

    componentWillMount() {
        this.initData();
        this.getCodeTree();
    }

    componentDidMount() {

        this.messageResizable();
        this.messageScroll();

    }

    componentWillUnmount() {
        if(controller) controller.abort();
    }

    initData() {
        if(this.props.requirementMessage){
            this.newSend(this.props.requirementMessage);
        }else{
            let waxberryObj = this.props.waxberryObj;
            axios.get(`${globalInitConfig.REACT_APP_API_BASE_URL}mgr/agent/agentConversationRelation/findAgentConversationRelation?agentId=${waxberryObj.id}&conversationType=1`).then(res=>{
                if(res.data.code === 200){
                    let conversationId = res.data.data.conversationId;
                    axios.get(`${globalInitConfig.REACT_APP_API_BASE_URL}mgr/conversation/message/list?pageNo=0&pageSize=1000&conversationId=${conversationId}`).then(r=>{
                        if(r.data.code === 200){
                            this.setState({
                                messageObj: { id: conversationId },
                                messageData: r.data.data.content
                            },()=>{
                                let node = document.getElementById("dialogues");
                                let timer;
                                timer = setInterval(()=>{
                                    if(isUserScrolling || (node.scrollTop+node.clientHeight === node.scrollHeight)){
                                        clearInterval(timer);
                                    }else{
                                        node.scrollTop = node.scrollHeight
                                    }
                                },1000);
                            })
                        }
                    });
                    axios.get(`${langChainHttp}/workflow/session/${waxberryObj.vesselId}/tags`).then(r=>{
                        this.setState({
                            requirementContent: r.data.tags.requirements_report
                        })
                    });
                }
            });
        }
    }

    newSend(message) {
        if(!message){
            return;
        }
        let params = {
            "title": message.substring(0,500),
            "chatType": "8"
        };
        axios.post(globalInitConfig.REACT_APP_API_BASE_URL + "mgr/conversation/add", params).then(res=>{
            if(res.data.code === 200){
                let obj = res.data.data;
                this.setState({
                    messageObj: obj
                },()=>{
                    this.send(message);
                });
                axios.post(`${globalInitConfig.REACT_APP_API_BASE_URL}mgr/agent/agentConversationRelation/add`, {
                    "agentId": this.props.waxberryObj.id,
                    "conversationId": obj.id,
                    "conversationType": 1
                })
            }
        });
    }

    handleChange(e) {
        let message = e.target.value;
        if(message.length>1 && message.slice(-2) === "@f"){
            this.setState({
                inputFileOpen: true,
                message: message.slice(0,-1)
            })
        }else{
            this.setState({
                message
            })
        }
    }

    send(message){
        if(this.state.isExecuting){
            return;
        }
        if(!message){
            let inputMessage = this.state.message;
            if(!inputMessage){
                return;
            }
            message = inputMessage;
        }
        for(let key in fileReplace){
            message = message.replace(key,fileReplace[key]);
        }
        let insertTableMd = this.state.insertTableMd;
        if(insertTableMd){
            message = insertTableMd + "\n\n" + message;
        }
        let fileList = this.state.fileList;
        let conversationMessage = [...this.state.messageData,{
            "query": message,
            "reponse": "",
            "reponseFileId": fileList.map(v=>v.fileId).join(','),
            "fileList": [...fileList]
        }];
        this.setState({
            message: "",
            isExecuting: true,
            messageData: conversationMessage
        },()=>{
            let node = document.getElementById("dialogues");
            node.scrollTop = node.scrollHeight;
            this.fetchData(message);
        });
    }

    fetchData(message) {
        let that = this;
        controller = new AbortController();
        let newContent = "";
        let isRequirement = false;
        let newRequirementContent = "";
        let messageData = this.state.messageData;
        let waxberryObj = this.state.waxberryObj;
        let url = `${langChainHttp}/workflow/session/stream`;
        let params = {
            "flow_id": "requirements_to_development",
            "session_id": waxberryObj.vesselId,
            "message": message,
            "metadata": {
                "server_port": waxberryObj.vesselPort+'',
                "server_name": docketIp,
                "sandbox_id": waxberryObj.vesselId,
                "waxberryID": waxberryObj.id
            }
        };
        const startTime = performance.now(); // 记录开始时间
        const eventSource = fetchEventSource(url, {
            method: 'POST',
            headers: {
                "Content-Type": 'application/json',
                "Authorization": localStorage.getItem('access_token') ? `Bearer ${localStorage.getItem('access_token')}` : ''
            },
            signal: controller.signal,
            body: JSON.stringify(params),
            openWhenHidden: true,
            onmessage(event) {
                try {
                    if(event.data) {
                        let data = JSON.parse(event.data);
                        let content = data.content;
                        //处理内容
                        if (content) {
                            if(isRequirement){
                                newRequirementContent += content;
                            }else{
                                newContent += content;
                                if(newContent.includes('<requirements_report>')){
                                    isRequirement = true;
                                    newRequirementContent = '<requirements_report>' + newContent.split('<requirements_report>')[1];
                                    newContent = `<div class='requirements_report'>
                                                       <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="16" height="16" viewBox="0 0 16 16"><defs><clipPath id="master_svg0_361_45528"><rect x="0" y="0" width="16" height="16" rx="0"/></clipPath></defs><g clip-path="url(#master_svg0_361_45528)"><g><path d="M10.89756875,9.44878875L5.10242875,9.44878875C4.7040187499999995,9.44878875,4.37803875,9.77475875,4.37803875,10.17317875C4.37803875,10.57159875,4.7040187499999995,10.89756875,5.10242875,10.89756875L10.89756875,10.89756875C11.29598875,10.89756875,11.62196875,10.57159875,11.62196875,10.17317875C11.62196875,9.77475875,11.29598875,9.44878875,10.89756875,9.44878875ZM13.07076875,1.48046875L2.92924875,1.48046875C2.13242175,1.48046875,1.48046875,2.13242175,1.48046875,2.92924875L1.48046875,13.07076875C1.48046875,13.86756875,2.13242175,14.51956875,2.92924875,14.51956875L13.07076875,14.51956875C13.86756875,14.51956875,14.51956875,13.86756875,14.51956875,13.07076875L14.51956875,2.92924875C14.51956875,2.13242175,13.86756875,1.48046875,13.07076875,1.48046875ZM13.07076875,13.07076875L2.92924875,13.07076875L2.92924875,2.92924875L5.10242875,2.92924875L5.10242875,3.65364875C5.10242875,4.0520587500000005,5.42840875,4.37803875,5.82681875,4.37803875C6.22523875,4.37803875,6.55121875,4.0520587500000005,6.55121875,3.65364875L6.55121875,2.92924875L9.44878875,2.92924875L9.44878875,3.65364875C9.44878875,4.0520587500000005,9.77475875,4.37803875,10.17317875,4.37803875C10.57159875,4.37803875,10.89756875,4.0520587500000005,10.89756875,3.65364875L10.89756875,2.92924875L13.07076875,2.92924875L13.07076875,13.07076875ZM5.10242875,6.55121875C4.7040187499999995,6.55121875,4.37803875,6.87718875,4.37803875,7.27560875C4.37803875,7.67401875,4.7040187499999995,7.99999875,5.10242875,7.99999875L10.89756875,7.99999875C11.29598875,7.99999875,11.62196875,7.67401875,11.62196875,7.27560875C11.62196875,6.87718875,11.29598875,6.55121875,10.89756875,6.55121875L5.10242875,6.55121875Z" fill="var(--text-color1)"/></g></g></svg>
                                                       <span>需求报告</span>
                                                  </div>`;
                                }
                            }
                            messageData[messageData.length - 1].reponse = newContent;
                            that.setState({
                                messageData,
                                requirementContent: newRequirementContent
                            }, () => {
                                if(!isUserScrolling){
                                    let node = document.getElementById("dialogues");
                                    node.scrollTop = node.scrollHeight;
                                }
                                let node = document.getElementById("requirement");
                                node.scrollTop = node.scrollHeight;
                            });
                        }
                    }
                }catch (e) {
                    console.log(e);
                    that.setState({
                        isExecuting: false
                    });
                    controller.abort();
                }
            },
            onerror(err) {
                that.setState({
                    isExecuting: false
                });
                controller.abort();
                eventSource.close();
            },
            onclose(close) {
                const endTime = performance.now(); // 记录结束时间
                const durationInMilliseconds = endTime - startTime; // 计算持续时间
                const durationInSeconds = (durationInMilliseconds / 1000).toFixed(2);
                that.setState({
                    isExecuting: false
                });
                newContent = newContent || "...";
                let params = {
                    "conversationId": that.state.messageObj.id,
                    "parentId": "0",
                    "query": message,
                    "reponse": newContent,
                    "reponseFileId": that.state.fileList.map(v=>v.fileId).join(',')
                };
                axios.post(globalInitConfig.REACT_APP_API_BASE_URL + "mgr/conversation/message/add", params).then(res=>{
                    if(res.data.code === 200) {
                        messageData[messageData.length - 1].id = res.data.data.id;
                        messageData[messageData.length - 1].reponse = newContent;
                        messageData[messageData.length - 1].duration = durationInSeconds;
                        that.setState({
                            messageData
                        }, () => {
                            if(!isUserScrolling){
                                let node = document.getElementById("dialogues");
                                node.scrollTop = node.scrollHeight;
                            }
                        });
                    }
                });
            }
        })
    }

    stopGenerating() {
        controller.abort();
        let messageData = this.state.messageData;
        let obj = messageData[messageData.length-1];
        obj.reponse += "...";
        this.setState({
            isExecuting: false,
            messageData
        });
        let params = {
            "conversationId": this.state.messageObj.id,
            "parentId": "0",
            "query": obj.query,
            "reponse": obj.reponse
        };
        axios.post(globalInitConfig.REACT_APP_API_BASE_URL + "mgr/conversation/message/add", params).then(res=>{
            if(res.data.code === 200) {
                messageData[messageData.length - 1].id = res.data.data.id;
                this.setState({
                    messageData
                });
            }
        });
    }

    getCodeTree(){
        let waxberryObj = this.state.waxberryObj;
        axios.get(`${globalInitConfig.REACT_APP_API_SBX_URL}/sandboxes/${waxberryObj.vesselId}/tree?path=/waxberry`).then(res => {
            const data = res.data;
            if (data.data) {
                this.setState({
                    inputFileOptions: this.convertInputFileTree([data.data])
                });
            } else {
                Message.error(data.message);
            }
        });
    }

    convertInputFileTree(data){
        return data.map((item) => {
            let fileOption = {};
            fileOption.fileName = item.name;
            fileOption.label = item.type==="file" ? <span className="label"><FileTextOutlined />{item.name}</span> : <span className="label"><FolderOutlined />{item.name}</span>;
            fileOption.value = item.path;
            if (item.children) {
                fileOption.children = this.convertInputFileTree(item.children);
            }else{
                fileOption.disabled = item.type==="directory";
            }
            return fileOption;
        });
    }

    messageResizable() {
        let drag = document.getElementById('drag');
        let resizable = document.getElementById('dragDiv');
        let isResizing = false;
        let startX;
        let startWidth;
        drag.addEventListener('mousedown', (e) => {
            isResizing = true;
            startX = e.clientX;
            startWidth = resizable.offsetWidth;

            function onMouseMove(e) {
                if (!isResizing) return;

                const deltaX = e.clientX - startX;
                const newWidth = startWidth - deltaX;

                resizable.style.width = `${newWidth}px`;
            }

            function onMouseUp() {
                window.dispatchEvent(new Event('resize'));
                isResizing = false;
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            }

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    }

    copy(content) {
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
                Message.success("复制成功");
            }
            document.body.removeChild(inputDom);
        }
    }

    deleteMessage(id) {
        if(id){
            axios.post(globalInitConfig.REACT_APP_API_BASE_URL + "mgr/conversation/message/delete", {
                ids: id
            }).then(res=> {
                if(res.data.code === 200){
                    this.setState({
                        messageData: this.state.messageData.filter(item=> item.id!==id)
                    })
                }
            })
        }
    }

    handleFileUpload(type,e) {
        const files = e.target.files;
        for (let i = 0; i < files.length; i++) {
            this.fileUploader(type,files[i]);
        }
    }

    fileUploader(type,file) {
        let that = this;
        let fileList = this.state.fileList;
        let waxberryObj = this.state.waxberryObj;

        let suffixName = "";
        let split = file.name.split('.');
        if(split.length>1){
            suffixName = split.pop();
        }
        let fileObj = {
            type,
            fileName: file.name,
            fileSize: file.size,
            suffixName,
            progress: 0
        };
        if(type === "file"){
            getTextFileWordCount(file).then((wordCount) => {
                fileObj.wordNumber = wordCount;
            }).catch((error) => {
                console.error('获取字数失败:', error);
            });
        }
        //文件大小不能超过30M
        let fileSize = 1048576*30;
        if(fileObj.fileSize > fileSize){
            Message.warning(this.props.t('message.sizeCannotExceed')+"30M");
            return;
        }
        //总大小不能超过100M
        let totalSize = 1048576*100;
        let total = fileList.reduce((accumulator, current) => accumulator + current.fileSize, fileObj.fileSize);
        if(total > totalSize){
            Message.warning(this.props.t('message.totalSizeCannotExceed')+"100M");
            return;
        }
        fileList.push(fileObj);
        that.setState({
            fileList
        });

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

        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                fileObj.progress = (event.loaded / event.total) * 100;
                that.setState({
                    fileList
                })
            }
        };

        xhr.onload = () => {
            let resFile = JSON.parse(xhr.response);
            if (xhr.status === 200 && resFile.code === 200) {
                fileObj.fileId = resFile.data.id;
                fileObj.progress = 0;
                let params = {
                    file,
                    path: "/waxberry/attachment/" + fileObj.fileName,
                };
                axios.post(`${globalInitConfig.REACT_APP_API_SBX_URL}/sandboxes/${waxberryObj.vesselId}/upload`, params).then(res=> {
                    if(res.data.code === 200){
                        that.getCodeTree();
                        that.setState({
                            fileList
                        })
                    }
                })
            } else {
                console.log(`Upload of ${file.name} failed.`);
            }
        };

        xhr.send(formData);
    }

    closeFunction(index){
        let fileList = this.state.fileList;
        fileList.splice(index,1);
        this.setState({
            fileList
        })
    }

    fileClickFunction(fileName){
        let message = this.state.message;
        let link = '@' + fileName;
        fileReplace[link] = `/waxberry/attachment/${fileName}`;
        this.setState({
            message: message + link
        })
    }

    /**
     * 展开/收起文件
     */
    openFile(item) {
        var that = this;
        if(item.openFile){
            item.openFile = false;
            that.setState({});
        }else {
            item.openFile = true;
            if (item.fileList) {
                that.setState({});
                return;
            }
            axios.post(`${globalInitConfig.REACT_APP_API_BASE_URL}mgr/attachment/getByFileIds`,{
                fileIds: item.reponseFileId
            }).then(res => {
                if (res.data.code === 200) {
                    let fileList = res.data.data.fileInfos || [];
                    fileList.forEach(file=>{
                        file.progress = 0;
                        if(file.suffixName){
                            file.suffixName = file.suffixName.substring(1);
                        }
                    });
                    item.fileList = fileList;
                    that.setState({});
                }
            })
        }
    }

    inputFileChange(value, selectedOptions) {
        let message = this.state.message;
        let node = selectedOptions[selectedOptions.length-1];
        fileReplace['@'+node.fileName] = value[value.length-1];
        this.setState({
            message: message + node.fileName,
            inputFileOpen: false
        })
    }

    messageScroll(){
        //记录上次滚动位置
        let startY = 0;
        // 监听滚动事件
        $("#dialogues").on('scroll',(e)=> {
            let scrollTop = e.target.scrollTop;
            let clientHeight = e.target.clientHeight;
            let scrollHeight = e.target.scrollHeight;
            //用户滚动
            if(scrollTop < startY){
                isUserScrolling = true
            }else{
                startY = scrollTop;
            }
            //到底（提前20）
            if( (scrollTop+clientHeight+20) >= scrollHeight){
                isUserScrolling = false
            }
        });
    }

    addFlow() {
        this.setState({
            showAddFlowModal: true
        })
    }

    okModal(){
        this.hideModal();
        this.props.addFlow();
    }

    hideModal() {
        this.setState({
            showAddFlowModal: false
        })
    }

    handleVoiceInput(value){
        this.setState({
            message: value
        })
    }

    formulaOk(val) {
        let message = this.state.message;
        this.setState({
            showFormulaModal: false,
            message: message + val
        })
    }

    tableOk(val) {
        this.setState({
            showTableModal: false,
            insertTableData: [...this.state.insertTableData,val]
        })
    }

    handleDrop(e){
        e.preventDefault();
        e.stopPropagation();

        if (e.dataTransfer.files.length) {
            this.fileUploader("file",e.dataTransfer.files[0]);
        }
    }

    handlePaste(e){
        const items = (e.clipboardData || window.clipboardData).items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].kind === 'file') {
                const file = items[i].getAsFile();
                this.fileUploader("file",file);
                break;
            }
        }
    }

    render() {
        const { message,messageData,isExecuting,waxberryObj,fileList,inputFileOptions,inputFileOpen,showAddFlowModal,requirementContent,showFormulaModal,showTableModal,insertTableData }  = this.state;
        const { t } = this.props;

        return (
            <div className="app-content-data right_bj">
                <div className="app-content-left">
                    <div className="left-header">
                        <div className="label">{waxberryObj.name}</div>
                        <div className="model">
                            <img className="modelSvg" src={ModelSvg}/>DeepSeek v3
                            <svg className="FilterSvg" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="16" height="16" viewBox="0 0 16 16"><defs><clipPath id="master_svg0_721_66786"><rect x="0" y="0" width="16" height="16" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_721_66786)"><g><g><path d="M11.262648487091065,3.4399452209472656L12.938188487091065,3.4399452209472656C13.297168487091064,3.4399452209472656,13.588188487091065,3.7309602209472654,13.588188487091065,4.089945220947266C13.588188487091065,4.4489352209472655,13.297168487091064,4.7399452209472654,12.938188487091065,4.7399452209472654L11.262648487091065,4.7399452209472654C10.903663487091064,4.7399452209472654,10.612648487091064,4.4489352209472655,10.612648487091064,4.089945220947266C10.612648487091064,3.7309602209472654,10.903663487091064,3.4399452209472656,11.262648487091065,3.4399452209472656Z" fillRule="evenodd" fill="currentColor" fillOpacity="1"/></g><g><path d="M8.154985904693604,2.9746092796325683C8.154985904693604,2.615624279632568,8.446000904693603,2.3246092796325684,8.804985904693604,2.3246092796325684C9.163975904693604,2.3246092796325684,9.454985904693604,2.615624279632568,9.454985904693604,2.9746092796325683L9.454985904693604,5.208659279632569C9.454985904693604,5.567649279632569,9.163975904693604,5.858659279632569,8.804985904693604,5.858659279632569C8.446000904693603,5.858659279632569,8.154985904693604,5.567649279632569,8.154985904693604,5.208659279632569L8.154985904693604,2.9746092796325683Z" fillRule="evenodd" fill="currentColor" fillOpacity="1"/></g><g><path d="M3.0624999046325683,3.4399452209472656L8.805409904632569,3.4399452209472656C9.164399904632567,3.4399452209472656,9.455409904632567,3.7309602209472654,9.455409904632567,4.089945220947266C9.455409904632567,4.4489352209472655,9.164399904632567,4.7399452209472654,8.805409904632569,4.7399452209472654L3.0624999046325683,4.7399452209472654C2.703514904632568,4.7399452209472654,2.4124999046325684,4.4489352209472655,2.4124999046325684,4.089945220947266C2.4124999046325684,3.7309602209472654,2.703514904632568,3.4399452209472656,3.0624999046325683,3.4399452209472656Z" fillRule="evenodd" fill="currentColor" fillOpacity="1"/></g><g><path d="M3.0624999046325683,7.350160121917725L5.296549904632569,7.350160121917725C5.655539904632569,7.350160121917725,5.946549904632569,7.641175121917724,5.946549904632569,8.000160121917725C5.946549904632569,8.359150121917725,5.655539904632569,8.650160121917725,5.296549904632569,8.650160121917725L3.0624999046325683,8.650160121917725C2.703514904632568,8.650160121917725,2.4124999046325684,8.359150121917725,2.4124999046325684,8.000160121917725C2.4124999046325684,7.641175121917724,2.703514904632568,7.350160121917725,3.0624999046325683,7.350160121917725Z" fillRule="evenodd" fill="currentColor" fillOpacity="1"/></g><g><path d="M6.480113506317139,6.884824180603028C6.480113506317139,6.525839180603027,6.7711285063171385,6.234824180603027,7.130113506317139,6.234824180603027C7.4891035063171385,6.234824180603027,7.7801135063171385,6.525839180603027,7.7801135063171385,6.884824180603028L7.7801135063171385,9.118874180603028C7.7801135063171385,9.477864180603028,7.4891035063171385,9.768874180603028,7.130113506317139,9.768874180603028C6.7711285063171385,9.768874180603028,6.480113506317139,9.477864180603028,6.480113506317139,9.118874180603028L6.480113506317139,6.884824180603028Z" fillRule="evenodd" fill="currentColor" fillOpacity="1"/></g><g transform="matrix(1,-0.0025653275661170483,0.0025653273332864046,1,-0.018859844346941657,0.016620534905417372)"><path d="M7.128913307189942,7.351827621459961L12.936313307189941,7.351827621459961C13.295303307189942,7.351827621459961,13.586313307189942,7.642842621459961,13.586313307189942,8.001827621459961C13.586313307189942,8.360817621459962,13.295303307189942,8.651827621459962,12.936313307189941,8.651827621459962L7.128913307189942,8.651827621459962C6.769928307189941,8.651827621459962,6.478913307189941,8.360817621459962,6.478913307189941,8.001827621459961C6.478913307189941,7.642842621459961,6.769928307189941,7.351827621459961,7.128913307189942,7.351827621459961Z" fillRule="evenodd" fill="currentColor" fillOpacity="1"/></g><g><path d="M11.262648487091065,11.260374546051025L12.938188487091065,11.260374546051025C13.297168487091064,11.260374546051025,13.588188487091065,11.551389546051025,13.588188487091065,11.910374546051026C13.588188487091065,12.269364546051026,13.297168487091064,12.560374546051026,12.938188487091065,12.560374546051026L11.262648487091065,12.560374546051026C10.903663487091064,12.560374546051026,10.612648487091064,12.269364546051026,10.612648487091064,11.910374546051026C10.612648487091064,11.551389546051025,10.903663487091064,11.260374546051025,11.262648487091065,11.260374546051025Z" fillRule="evenodd" fill="currentColor" fillOpacity="1"/></g><g><path d="M8.154985904693604,10.793170356750489C8.154985904693604,10.434185356750488,8.446000904693603,10.143170356750488,8.804985904693604,10.143170356750488C9.163975904693604,10.143170356750488,9.454985904693604,10.434185356750488,9.454985904693604,10.793170356750489L9.454985904693604,13.027220356750489C9.454985904693604,13.386210356750489,9.163975904693604,13.677220356750489,8.804985904693604,13.677220356750489C8.446000904693603,13.677220356750489,8.154985904693604,13.386210356750489,8.154985904693604,13.027220356750489L8.154985904693604,10.793170356750489Z" fillRule="evenodd" fill="currentColor" fillOpacity="1"/></g><g><path d="M3.0624999046325683,11.260374546051025L8.57612990463257,11.260374546051025C8.935109904632569,11.260374546051025,9.226129904632568,11.551389546051025,9.226129904632568,11.910374546051026C9.226129904632568,12.269364546051026,8.935109904632569,12.560374546051026,8.57612990463257,12.560374546051026L3.0624999046325683,12.560374546051026C2.703514904632568,12.560374546051026,2.4124999046325684,12.269364546051026,2.4124999046325684,11.910374546051026C2.4124999046325684,11.551389546051025,2.703514904632568,11.260374546051025,3.0624999046325683,11.260374546051025Z" fillRule="evenodd" fill="currentColor" fillOpacity="1"/></g></g></g></svg>
                        </div>
                    </div>
                    <div className="dialogues" id="dialogues">
                        {messageData.map((dialogue,key)=>(
                            <div className="dialogue" key={key}>
                                <div className="question">
                                    {dialogue.reponseFileId && <div className="fileOperate" onClick={()=>this.openFile(dialogue)}>
                                        <div className="fileCount">
                                            <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="16" height="16" viewBox="0 0 16 16"><defs><clipPath id="master_svg0_228_58626"><rect x="16" y="0" width="16" height="16" rx="0"/></clipPath></defs><g transform="matrix(-1,0,0,1,32,0)" clipPath="url(#master_svg0_228_58626)"><g transform="matrix(0.7384299635887146,-0.6743301749229431,0.6743301749229431,0.7384299635887146,-1.0748418173901868,12.137206164551195)"><path d="M26.32119876499176,9.268419627990722C25.82979876499176,8.721379627990723,25.16089876499176,8.415602627990722,24.46382876499176,8.417005627990722L24.46116876499176,8.417005627990722C23.76681876499176,8.415602627990722,23.09917876499176,8.719979627990723,22.60912876499176,9.264209627990724L22.60778876499176,9.265619627990723L17.77006876499176,14.612559627990723C17.32007876499176,15.111899627990724,17.18654876499176,15.860929627990723,17.43089876499176,16.51175962799072C17.67525876499176,17.162589627990723,18.25076876499176,17.586179627990724,18.88902876499176,17.58477962799072C19.29228876499176,17.58477962799072,19.69420876499176,17.416469627990722,19.99998876499176,17.077029627990722L24.83771876499176,11.730089627990722C25.043348764991762,11.502859627990723,25.043348764991762,11.135359627990724,24.83771876499176,10.908129627990723C24.63207876499176,10.680899627990723,24.29959876499176,10.680899627990723,24.09395876499176,10.908129627990723L19.25756876499176,16.25506962799072C19.15875876499176,16.36307962799072,19.02522876499176,16.423389627990723,18.886358764991762,16.423389627990723C18.74748876499176,16.423389627990723,18.61395876499176,16.36166962799072,18.51648876499176,16.25226962799072C18.41633876499176,16.145659627990725,18.36025876499176,15.998379627990722,18.35892876499176,15.844089627990723C18.35892876499176,15.689799627990723,18.413668764991762,15.542519627990723,18.512478764991762,15.434509627990723L23.350208764991763,10.087569627990723C23.64396876499176,9.760749627990723,24.044558764991763,9.578409627990723,24.46116876499176,9.579809627990723L24.46249876499176,9.579809627990723C24.88043876499176,9.578409627990723,25.28239876499176,9.763559627990723,25.57749876499176,10.090379627990723C25.875198764991758,10.418599627990723,26.039498764991762,10.857629627990722,26.039498764991762,11.321919627990724C26.04079876499176,11.783389627990722,25.875198764991758,12.226629627990722,25.58009876499176,12.552049627990723L24.27421876499176,13.995389627990722L24.26620876499176,14.003799627990723L20.64625876499176,18.006979627990724C19.61942876499176,19.140379627990722,17.95566876499176,19.141779627990722,16.92749876499176,18.00837962799072C16.43344876499176,17.464179627990724,16.15704876499176,16.72495962799072,16.15971876499176,15.954899627990722C16.15971876499176,15.177829627990722,16.43344876499176,14.447039627990723,16.93016876499176,13.898599627990723L21.86270876499176,8.446461627990722C22.06833876499176,8.219230627990722,22.06833876499176,7.851733627990723,21.86270876499176,7.624502627990722C21.65706876499176,7.397271927990722,21.32458876499176,7.397271927990722,21.11894876499176,7.624502627990722L16.18641876499176,13.076639627990723C15.49340976499176,13.838289627990722,15.104842194991761,14.874849627990724,15.10751272169176,15.954899627990722C15.10751272169176,17.04195962799072,15.48940376499176,18.06447962799072,16.183748764991762,18.830379627990723C16.87275876499176,19.59337962799072,17.80878876499176,20.021179627990723,18.78487876499176,20.018379627990722C19.76230876499176,20.019779627990722,20.69967876499176,19.591979627990725,21.39001876499176,18.827579627990723L26.50549876499176,13.173429627990723C26.556198764991763,13.115919627990722,26.596298764991758,13.047189627990722,26.621698764991763,12.972849627990723C26.92609876499176,12.490329627990722,27.09169876499176,11.920849627990723,27.09169876499176,11.320509627990722C27.092998764991762,10.550449627990723,26.81529876499176,9.811249627990723,26.32119876499176,9.268419627990722Z" fill="currentColor"/></g></g></svg>
                                            {dialogue.reponseFileId.split(',').length}{t('files')}
                                        </div>
                                        {dialogue.openFile ? <DownOutlined/> : <RightOutlined/>}
                                    </div>}
                                    {dialogue.openFile && <FileList fileList={dialogue.fileList}/> }
                                    <MarkdownRenderer content={dialogue.query}/>
                                </div>
                                {dialogue.reponse ?
                                    <div className="answer">
                                        <MarkdownRenderer content={dialogue.reponse}/>
                                        {dialogue.id && <div className="operate">
                                            {dialogue.duration && <span className="duration">总计用时：{dialogue.duration}秒</span>}
                                            <Tooltip title={t('copy')}>
                                                <svg onClick={()=>this.copy(dialogue.reponse)} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="24" height="24" viewBox="0 0 24 24"><defs><clipPath id="master_svg0_140_036157"><rect x="0" y="0" width="24" height="24" rx="4"/></clipPath></defs><g clipPath="url(#master_svg0_140_036157)"><g><path d="M14.33519,7.66667C14.88759,7.66667,15.33541,8.11438,15.33541,8.66667L15.33541,18C15.33541,18.552300000000002,14.88759,19,14.33519,19L7.0002200000000006,19C6.447815,19,6,18.552300000000002,6,18L6,8.66667C5.999999880764,8.11438,6.447815,7.66667,7.0002200000000006,7.66667L14.33519,7.66667ZM14.00178,9L7.33363,9L7.33363,17.6667L14.00178,17.6667L14.00178,9ZM16.9998,5.000000178814C17.5152,4.999681234,17.9465,5.391043,17.996000000000002,5.904L18,6L18,14.99533C17.9996,15.3481,17.7245,15.6394,17.3723,15.6601C17.0201,15.6808,16.712699999999998,15.4236,16.671,15.0733L16.6664,14.99533L16.6664,6.33333L10.00089,6.33333C9.66283,6.33329,9.37829,6.08033,9.33874,5.744667L9.33407,5.666667C9.33412,5.328684,9.58714,5.044211,9.92287,5.00466675L10.00089,5.000000178814L16.9998,5.000000178814Z" fill="currentColor"/></g></g></svg>
                                            </Tooltip>
                                            <Tooltip title={t('delete')}>
                                                <svg onClick={()=>this.deleteMessage(dialogue.id)} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="24" height="24" viewBox="0 0 24 24"><defs><clipPath id="master_svg0_140_030708"><rect x="0" y="0" width="24" height="24" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_140_030708)"><g><path d="M10.697949999999999,6.32406L13.302050000000001,6.32406Q13.56261,6.32406,13.746839999999999,6.13016Q13.93108,5.936255,13.93108,5.662032Q13.93108,5.38781,13.746839999999999,5.193905Q13.56261,5,13.302050000000001,5L10.697949999999999,5Q10.43739,5,10.253160000000001,5.193905Q10.06892,5.387809,10.06892,5.662032Q10.06892,5.936255,10.253160000000001,6.13016Q10.43739,6.32406,10.697949999999999,6.32406ZM7.1393,8.03703L7.1393,16.967599999999997Q7.1393,17.8094,7.70491,18.4047Q8.27052,19,9.07038,19L14.92962,19Q15.72948,19,16.295099999999998,18.4047Q16.8607,17.8094,16.8607,16.967599999999997L16.8607,9.43055Q16.8607,9.15633,16.6765,8.96243Q16.4922,8.76852,16.2317,8.76852Q15.97112,8.76852,15.78688,8.96243Q15.60265,9.15633,15.60265,9.43055L15.60265,16.967599999999997Q15.60265,17.261,15.40552,17.4685Q15.2084,17.6759,14.92962,17.6759L9.07038,17.6759Q8.791599999999999,17.6759,8.59448,17.4685Q8.39735,17.261,8.39735,16.967599999999997L8.39735,8.03703L17.371000000000002,8.03703Q17.631500000000003,8.03703,17.8158,7.84312Q18,7.64922,18,7.375Q18,7.10077,17.8158,6.90687Q17.631500000000003,6.71296,17.371000000000002,6.71296L6.629028,6.71296Q6.368476,6.71296,6.184238,6.90687Q6,7.10077,6,7.375Q6,7.64922,6.184238,7.84312Q6.368476,8.03703,6.629028,8.03703L7.1393,8.03703ZM10.06892,10.80092L10.06892,14.91204Q10.06892,15.1863,10.253160000000001,15.3802Q10.43739,15.5741,10.697949999999999,15.5741Q10.9585,15.5741,11.14274,15.3802Q11.32697,15.1863,11.32697,14.91204L11.32697,10.80092Q11.32697,10.5267,11.14274,10.332799999999999Q10.9585,10.13889,10.697949999999999,10.13889Q10.4374,10.13889,10.253160000000001,10.332799999999999Q10.06892,10.5267,10.06892,10.80092ZM12.67303,10.80092L12.67303,14.91204Q12.67303,15.1863,12.85726,15.3802Q13.0415,15.5741,13.302050000000001,15.5741Q13.56261,15.5741,13.746839999999999,15.3802Q13.93108,15.1863,13.93108,14.91204L13.93108,10.80092Q13.93108,10.5267,13.746839999999999,10.332799999999999Q13.5626,10.13889,13.302050000000001,10.13889Q13.0415,10.13889,12.85726,10.332799999999999Q12.67303,10.5267,12.67303,10.80092Z" fillRule="evenodd" fill="var(--text-color1)"/></g></g></svg>
                                            </Tooltip>
                                        </div>}
                                    </div> :
                                    <div className="ai">{t('home.thinking')}：<LoadingOutlined /></div>
                                }
                            </div>
                        ))}
                    </div>
                    {
                        !isExecuting && requirementContent && <span className="addFlow" onClick={()=>this.props.addFlow()}>创建工程</span>
                    }
                    <div className="inputDiv">
                        <Cascader
                            open={inputFileOpen}
                            className="inputFileCascader"
                            popupClassName="inputFileCascaderPopup"
                            placement="topLeft"
                            options={inputFileOptions}
                            onChange={this.inputFileChange.bind(this)}
                            onDropdownVisibleChange={(open)=> this.setState({inputFileOpen:open})}
                        />
                        <div className="input" onDrop={this.handleDrop.bind(this)} onPaste={this.handlePaste.bind(this)}>
                            <input style={{display: 'none'}} ref={node => this.fileUpload = node} type="file" accept=".txt,.doc,.docx,.pptx,.ppt,.xlsx,.xls" onChange={this.handleFileUpload.bind(this,"file")}/>
                            <input style={{display: 'none'}} ref={node => this.imageUpload = node} type="file" accept="image/*" onChange={this.handleFileUpload.bind(this,"image")}/>
                            {fileList.length>0 && <FileList fileList={fileList} closeFunction={(index)=>this.closeFunction(index)} onClickFunction={(fileName)=>this.fileClickFunction(fileName)}/>}
                            {insertTableData.length>0 && <ExtraDialogue
                                tablesData={insertTableData}
                                handleTableChange={(data)=>this.setState({insertTableData:data})}
                                tableMdChange={(data)=>this.setState({insertTableMd:data})}
                            />}
                            <TextArea
                                value={message}
                                placeholder={t('home.enterQuestionLetMeHelp')+"~"}
                                onChange={(e)=>this.handleChange(e)}
                                autoSize={{ minRows: 1, maxRows: 10 }}
                            />
                            <div className="operate">
                                <div className="link">
                                    <svg onClick={()=> this.fileUpload.click()}  xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="24" height="24" viewBox="0 0 24 24"><defs><clipPath id="master_svg0_323_071428"><rect x="24" y="0" width="24" height="24" rx="0"/></clipPath></defs><g transform="matrix(-1,0,0,1,48,0)" clipPath="url(#master_svg0_323_071428)"><g transform="matrix(0.7384299635887146,-0.6743301749229431,0.6743301749229431,0.7384299635887146,-1.5584574058884755,18.442791270619637)"><path d="M39.413321826171874,13.877295126953126C38.69382182617188,13.079195126953126,37.714321826171876,12.633075126953125,36.693721826171874,12.635125126953126L36.689721826171876,12.635125126953126C35.673021826171876,12.633075126953125,34.695421826171874,13.077145126953125,33.97792182617187,13.871155126953125L33.97592182617188,13.873205126953124L26.892291826171874,21.674155126953124C26.233391826171875,22.402655126953125,26.037871826171873,23.495455126953125,26.395681826171874,24.444955126953126C26.753481826171875,25.394555126953126,27.596161826171876,26.012555126953124,28.530741826171877,26.010555126953125C29.121211826171873,26.010555126953125,29.709731826171875,25.764955126953126,30.157461826171875,25.269755126953125L37.24112182617188,17.468765126953123C37.542221826171875,17.137245126953125,37.542221826171875,16.601075126953127,37.24112182617188,16.269565126953125C36.94002182617187,15.938045126953124,36.45322182617188,15.938045126953124,36.15212182617188,16.269565126953125L29.070381826171875,24.070555126953124C28.925691826171875,24.228055126953123,28.730171826171876,24.316055126953124,28.526831826171875,24.316055126953124C28.323491826171875,24.316055126953124,28.127971826171876,24.226055126953124,27.985251826171876,24.066455126953123C27.838611826171874,23.910855126953123,27.756491826171874,23.696055126953127,27.754531826171874,23.470955126953125C27.754531826171874,23.245755126953124,27.834701826171873,23.030955126953124,27.979381826171874,22.873355126953125L35.06302182617188,15.072405126953125C35.493221826171876,14.595585126953125,36.07972182617188,14.329555126953124,36.689721826171876,14.331605126953125L36.69172182617187,14.331605126953125C37.30372182617187,14.329555126953124,37.89222182617188,14.599685126953124,38.324321826171875,15.076495126953125C38.760321826171875,15.555355126953124,39.00082182617187,16.195885126953126,39.00082182617187,16.873255126953126C39.00272182617188,17.546525126953124,38.760321826171875,18.193195126953125,38.32822182617188,18.667965126953124L36.41602182617187,20.773725126953124L36.40432182617187,20.786005126953125L31.103781826171875,26.626455126953125C29.600231826171875,28.279955126953126,27.164061826171874,28.282055126953125,25.658571826171876,26.628555126953124C24.935151826171875,25.834555126953127,24.530421826171874,24.756055126953125,24.534331826171876,23.632555126953125C24.534331826171876,22.498855126953124,24.935151826171875,21.432655126953126,25.662481826171874,20.632525126953126L32.884961826171875,12.678095126953124C33.186021826171874,12.346575126953125,33.186021826171874,11.810415126953124,32.884961826171875,11.478895126953125C32.583861826171876,11.147375226953125,32.09701182617187,11.147375226953125,31.795921826171877,11.478895126953125L24.573441826171877,19.433325126953125C23.558692826171875,20.544525126953125,22.989731936171875,22.056855126953124,22.993642262371875,23.632555126953125C22.993642262371875,25.218555126953127,23.552826826171874,26.710355126953125,24.569531826171875,27.827755126953125C25.578411826171873,28.940955126953124,26.948991826171873,29.565155126953126,28.378241826171873,29.561055126953125C29.809441826171877,29.563055126953124,31.181991826171874,28.938955126953125,32.19282182617187,27.823655126953124L39.68312182617187,19.574525126953127C39.75742182617188,19.490625126953127,39.81612182617188,19.390345126953125,39.853221826171875,19.281885126953124C40.299021826171874,18.577915126953126,40.54152182617187,17.747075126953124,40.54152182617187,16.871205126953125C40.54342182617188,15.747725126953124,40.13672182617188,14.669255126953125,39.413321826171874,13.877295126953126Z" fill="var(--text-color1)"/></g></g></svg>
                                    <svg onClick={()=> this.imageUpload.click()} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="24" height="24" viewBox="0 0 24 24"><defs><clipPath id="master_svg0_323_071430"><rect x="0" y="0" width="24" height="24" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_323_071430)"><g><path d="M21.25006103515625,3.75L21.25006103515625,20.25L3.25006103515625,20.25L3.25006103515625,3.75L21.25006103515625,3.75ZM17.33456103515625,12.3375L12.26256103515625,16.558500000000002L8.96806103515625,13.9595L4.75006103515625,17.3705L4.75006103515625,18.75L19.75006103515625,18.75L19.75006103515625,14.341L17.33456103515625,12.3375ZM19.75006103515625,5.25L4.75006103515625,5.25L4.75006103515625,15.4415L8.95656103515625,12.04L12.23706103515625,14.628L17.33356103515625,10.388L19.75006103515625,12.392L19.75006103515625,5.25ZM9.50006103515625,6.25C10.74270103515625,6.25,11.75006103515625,7.25736,11.75006103515625,8.5C11.75006103515625,9.74264,10.74270103515625,10.75,9.50006103515625,10.75C8.25742103515625,10.75,7.25006103515625,9.74264,7.25006103515625,8.5C7.25006103515625,7.25736,8.25742103515625,6.25,9.50006103515625,6.25ZM9.50006103515625,7.75C9.08585103515625,7.75,8.75006103515625,8.08579,8.75006103515625,8.5C8.75006103515625,8.91421,9.08585103515625,9.25,9.50006103515625,9.25C9.91427103515625,9.25,10.25006103515625,8.91421,10.25006103515625,8.5C10.25006103515625,8.08579,9.91427103515625,7.75,9.50006103515625,7.75Z" fill="var(--text-color1)"/></g></g></svg>
                                    {/*<Voice onVoiceInput={this.handleVoiceInput.bind(this)} />*/}
                                    <svg onClick={()=>this.setState({showTableModal:true})} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="24" height="24" viewBox="0 0 24 24"><defs><clipPath id="master_svg0_323_071434"><rect x="0" y="0" width="24" height="24" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_323_071434)"><g><g><path d="M21.234611376953126,18.7876916015625L21.234611376953126,5.2123506015625Q21.234611376953126,4.5502466015625,20.766411376953126,4.0820716015625Q20.298211376953127,3.6138916015625,19.636111376953124,3.6138916015625L4.363870376953125,3.6138916015625Q3.701766376953125,3.6138916015625,3.233589376953125,4.0820696015625Q2.765411376953125,4.5502466015625,2.765411376953125,5.2123506015625L2.765411376953125,18.7876916015625Q2.765411376953125,19.449791601562502,3.233592376953125,19.9179916015625Q3.701766376953125,20.3861916015625,4.363870376953125,20.3861916015625L19.636111376953124,20.3861916015625Q20.298211376953127,20.3861916015625,20.766411376953126,19.9179916015625Q21.234611376953126,19.449791601562502,21.234611376953126,18.7876916015625ZM19.636111376953124,5.1138916015625Q19.734611376953126,5.1138916015625,19.734611376953126,5.2123506015625L19.734611376953126,18.7876916015625Q19.734611376953126,18.8861916015625,19.636111376953124,18.8861916015625L4.363870376953125,18.8861916015625Q4.265411376953125,18.8861916015625,4.265411376953125,18.7876916015625L4.265411376953125,5.2123506015625Q4.265411376953125,5.1138916015625,4.363870376953125,5.1138916015625L19.636111376953124,5.1138916015625Z" fill="var(--text-color1)"/></g><g><path d="M3.515411376953125,8.704645156860352L20.484611376953126,8.704645156860352Q20.558411376953124,8.704645156860352,20.630911376953126,8.71905615686035Q20.703311376953124,8.733467156860351,20.771611376953125,8.761735156860352Q20.839811376953126,8.790004156860352,20.901311376953124,8.831043156860352Q20.962711376953123,8.872082156860351,21.014911376953126,8.924315156860352Q21.067111376953125,8.976548156860352,21.108211376953125,9.037967156860352Q21.149211376953126,9.099387156860352,21.177511376953124,9.167632156860352Q21.205811376953125,9.235878156860352,21.220211376953124,9.30832715686035Q21.234611376953126,9.380776656860352,21.234611376953126,9.454645156860352Q21.234611376953126,9.528513656860351,21.220211376953124,9.600963156860352Q21.205811376953125,9.673412156860351,21.177511376953124,9.741658156860352Q21.149211376953126,9.80990315686035,21.108211376953125,9.87132315686035Q21.067111376953125,9.932742156860352,21.014911376953126,9.98497515686035Q20.962711376953123,10.037208156860352,20.901311376953124,10.078247156860352Q20.839811376953126,10.119286156860351,20.771611376953125,10.147555156860351Q20.703311376953124,10.175823156860352,20.630911376953126,10.190234156860352Q20.558411376953124,10.204645156860352,20.484611376953126,10.204645156860352L3.515411376953125,10.204645156860352Q3.441542876953125,10.204645156860352,3.369093376953125,10.190234156860352Q3.296644376953125,10.175823156860352,3.228398376953125,10.147555156860351Q3.160153376953125,10.119286156860351,3.098733376953125,10.078247156860352Q3.037314376953125,10.037208156860352,2.985081376953125,9.98497515686035Q2.932848376953125,9.932742156860352,2.891809376953125,9.87132315686035Q2.850770376953125,9.80990315686035,2.822501376953125,9.741658156860352Q2.794233376953125,9.673412156860351,2.779822376953125,9.600963156860352Q2.765411376953125,9.528513656860351,2.765411376953125,9.454645156860352Q2.765411376953125,9.380776656860352,2.779822376953125,9.30832715686035Q2.794233376953125,9.235878156860352,2.822501376953125,9.167632156860352Q2.850770376953125,9.099387156860352,2.891809376953125,9.037967156860352Q2.932848376953125,8.976548156860352,2.985081376953125,8.924315156860352Q3.037314376953125,8.872082156860351,3.098733376953125,8.831043156860352Q3.160153376953125,8.790004156860352,3.228398376953125,8.761735156860352Q3.296644376953125,8.733467156860351,3.369093376953125,8.71905615686035Q3.441542876953125,8.704645156860352,3.515411376953125,8.704645156860352Z" fill="var(--text-color1)"/></g><g><path d="M8.49250841140747,9.454645156860352Q8.49250841140747,9.380776656860352,8.50691941140747,9.30832715686035Q8.52133041140747,9.235878156860352,8.549598411407471,9.167632156860352Q8.577867411407471,9.099387156860352,8.61890641140747,9.037967156860352Q8.65994541140747,8.976548156860352,8.712178411407471,8.924315156860352Q8.76441141140747,8.872082156860351,8.825830411407471,8.831043156860352Q8.887250411407472,8.790004156860352,8.95549541140747,8.761735156860352Q9.023741411407471,8.733467156860351,9.09619041140747,8.71905615686035Q9.168639911407471,8.704645156860352,9.24250841140747,8.704645156860352Q9.31637691140747,8.704645156860352,9.388826411407472,8.71905615686035Q9.46127541140747,8.733467156860351,9.52952141140747,8.761735156860352Q9.59776641140747,8.790004156860352,9.65918641140747,8.831043156860352Q9.72060541140747,8.872082156860351,9.77283841140747,8.924315156860352Q9.825071411407471,8.976548156860352,9.86611041140747,9.037967156860352Q9.90714941140747,9.099387156860352,9.93541841140747,9.167632156860352Q9.96368641140747,9.235878156860352,9.978097411407472,9.30832715686035Q9.99250841140747,9.380776656860352,9.99250841140747,9.454645156860352L9.99250841140747,19.63614515686035Q9.99250841140747,19.710045156860353,9.978097411407472,19.78244515686035Q9.96368641140747,19.854945156860353,9.93541841140747,19.92314515686035Q9.90714941140747,19.99144515686035,9.86611041140747,20.05284515686035Q9.825071411407471,20.11424515686035,9.77283841140747,20.16644515686035Q9.72060541140747,20.21874515686035,9.65918641140747,20.25974515686035Q9.59776641140747,20.30074515686035,9.52952141140747,20.329045156860353Q9.46127541140747,20.35734515686035,9.388826411407472,20.37174515686035Q9.31637691140747,20.38614515686035,9.24250841140747,20.38614515686035Q9.168639911407471,20.38614515686035,9.09619041140747,20.37174515686035Q9.023741411407471,20.35734515686035,8.95549541140747,20.329045156860353Q8.887250411407472,20.30074515686035,8.825830411407471,20.25974515686035Q8.76441141140747,20.21874515686035,8.712178411407471,20.16644515686035Q8.65994541140747,20.11424515686035,8.61890641140747,20.05284515686035Q8.577867411407471,19.99144515686035,8.549598411407471,19.92314515686035Q8.52133041140747,19.854945156860353,8.50691941140747,19.78244515686035Q8.49250841140747,19.710045156860353,8.49250841140747,19.63614515686035L8.49250841140747,9.454645156860352Z" fill="var(--text-color1)"/></g><g><path d="M14.007491111755371,9.454645156860352Q14.007491111755371,9.380776656860352,14.02190211175537,9.30832715686035Q14.036313111755371,9.235878156860352,14.064581111755372,9.167632156860352Q14.092850111755372,9.099387156860352,14.133889111755371,9.037967156860352Q14.17492811175537,8.976548156860352,14.227161111755372,8.924315156860352Q14.279394111755371,8.872082156860351,14.340813111755372,8.831043156860352Q14.402233111755372,8.790004156860352,14.470478111755371,8.761735156860352Q14.538724111755371,8.733467156860351,14.61117311175537,8.71905615686035Q14.683622611755371,8.704645156860352,14.757491111755371,8.704645156860352Q14.83135961175537,8.704645156860352,14.903809111755372,8.71905615686035Q14.97625811175537,8.733467156860351,15.044504111755371,8.761735156860352Q15.11274911175537,8.790004156860352,15.17416911175537,8.831043156860352Q15.235588111755371,8.872082156860351,15.28782111175537,8.924315156860352Q15.340054111755371,8.976548156860352,15.381093111755371,9.037967156860352Q15.42213211175537,9.099387156860352,15.45040111175537,9.167632156860352Q15.478669111755371,9.235878156860352,15.493080111755372,9.30832715686035Q15.507491111755371,9.380776656860352,15.507491111755371,9.454645156860352L15.507491111755371,19.63614515686035Q15.507491111755371,19.710045156860353,15.493080111755372,19.78244515686035Q15.478669111755371,19.854945156860353,15.45040111175537,19.92314515686035Q15.42213211175537,19.99144515686035,15.381093111755371,20.05284515686035Q15.340054111755371,20.11424515686035,15.28782111175537,20.16644515686035Q15.235588111755371,20.21874515686035,15.17416911175537,20.25974515686035Q15.11274911175537,20.30074515686035,15.044504111755371,20.329045156860353Q14.97625811175537,20.35734515686035,14.903809111755372,20.37174515686035Q14.83135961175537,20.38614515686035,14.757491111755371,20.38614515686035Q14.683622611755371,20.38614515686035,14.61117311175537,20.37174515686035Q14.538724111755371,20.35734515686035,14.470478111755371,20.329045156860353Q14.402233111755372,20.30074515686035,14.340813111755372,20.25974515686035Q14.279394111755371,20.21874515686035,14.227161111755372,20.16644515686035Q14.17492811175537,20.11424515686035,14.133889111755371,20.05284515686035Q14.092850111755372,19.99144515686035,14.064581111755372,19.92314515686035Q14.036313111755371,19.854945156860353,14.02190211175537,19.78244515686035Q14.007491111755371,19.710045156860353,14.007491111755371,19.63614515686035L14.007491111755371,9.454645156860352Z" fill="var(--text-color1)"/></g><g><path d="M3.515411376953125,13.795398712158203L20.484611376953126,13.795398712158203Q20.558411376953124,13.795398712158203,20.630911376953126,13.809809712158202Q20.703311376953124,13.824220712158203,20.771611376953125,13.852488712158204Q20.839811376953126,13.880757712158204,20.901311376953124,13.921796712158203Q20.962711376953123,13.962835712158203,21.014911376953126,14.015068712158204Q21.067111376953125,14.067301712158203,21.108211376953125,14.128720712158204Q21.149211376953126,14.190140712158204,21.177511376953124,14.258385712158203Q21.205811376953125,14.326631712158203,21.220211376953124,14.399080712158202Q21.234611376953126,14.471530212158203,21.234611376953126,14.545398712158203Q21.234611376953126,14.619267212158203,21.220211376953124,14.691716712158204Q21.205811376953125,14.764165712158203,21.177511376953124,14.832411712158203Q21.149211376953126,14.900656712158202,21.108211376953125,14.962076712158202Q21.067111376953125,15.023495712158203,21.014911376953126,15.075728712158202Q20.962711376953123,15.127961712158204,20.901311376953124,15.169000712158203Q20.839811376953126,15.210039712158203,20.771611376953125,15.238308712158203Q20.703311376953124,15.266576712158203,20.630911376953126,15.280987712158204Q20.558411376953124,15.295398712158203,20.484611376953126,15.295398712158203L3.515411376953125,15.295398712158203Q3.441542876953125,15.295398712158203,3.369093376953125,15.280987712158204Q3.296644376953125,15.266576712158203,3.228398376953125,15.238308712158203Q3.160153376953125,15.210039712158203,3.098733376953125,15.169000712158203Q3.037314376953125,15.127961712158204,2.985081376953125,15.075728712158202Q2.932848376953125,15.023495712158203,2.891809376953125,14.962076712158202Q2.850770376953125,14.900656712158202,2.822501376953125,14.832411712158203Q2.794233376953125,14.764165712158203,2.779822376953125,14.691716712158204Q2.765411376953125,14.619267212158203,2.765411376953125,14.545398712158203Q2.765411376953125,14.471530212158203,2.779822376953125,14.399080712158202Q2.794233376953125,14.326631712158203,2.822501376953125,14.258385712158203Q2.850770376953125,14.190140712158204,2.891809376953125,14.128720712158204Q2.932848376953125,14.067301712158203,2.985081376953125,14.015068712158204Q3.037314376953125,13.962835712158203,3.098733376953125,13.921796712158203Q3.160153376953125,13.880757712158204,3.228398376953125,13.852488712158204Q3.296644376953125,13.824220712158203,3.369093376953125,13.809809712158202Q3.441542876953125,13.795398712158203,3.515411376953125,13.795398712158203Z" fill="var(--text-color1)"/></g><g><path d="M4.265411376953125,5.212649497709045L4.265411376953125,18.787650487709044Q4.265411376953125,18.886150487709045,4.363870376953125,18.886150487709045L19.636111376953124,18.886150487709045Q19.734611376953126,18.886150487709045,19.734611376953126,18.787650487709044L19.734611376953126,5.212350487709045Q19.734611376953126,5.138481987709046,19.749011376953124,5.0660324877090455Q19.763411376953126,4.993583487709046,19.791711376953124,4.9253374877090454Q19.819911376953126,4.857092487709045,19.861011376953126,4.795672487709045Q19.902011376953126,4.734253487709045,19.954211376953126,4.682020487709045Q20.006511376953124,4.629787487709045,20.067911376953123,4.588748487709045Q20.129311376953126,4.547709487709046,20.197611376953127,4.519440487709045Q20.265811376953124,4.491172487709045,20.338311376953126,4.476761487709045Q20.410711376953124,4.462350487709045,20.484611376953126,4.462350487709045Q20.558411376953124,4.462350487709045,20.630911376953126,4.476761487709045Q20.703311376953124,4.491172487709045,20.771611376953125,4.519440487709045Q20.839811376953126,4.547709487709046,20.901311376953124,4.588748487709045Q20.962711376953123,4.629787487709045,21.014911376953126,4.682020487709045Q21.067111376953125,4.734253487709045,21.108211376953125,4.795672487709045Q21.149211376953126,4.857092487709045,21.177511376953124,4.9253374877090454Q21.205811376953125,4.993583487709046,21.220211376953124,5.0660324877090455Q21.234611376953126,5.138481987709046,21.234611376953126,5.212350487709045L21.234611376953126,18.787650487709044Q21.234611376953126,19.449850487709046,20.766411376953126,19.917950487709046Q20.298211376953127,20.386150487709045,19.636111376953124,20.386150487709045L4.363870376953125,20.386150487709045Q3.701767376953125,20.386150487709045,3.233591376953125,19.917950487709046Q2.765411376953125,19.449850487709046,2.765411376953125,18.787650487709044L2.765411376953125,5.212350487709045Q2.765411376953125,5.138481987709046,2.779822376953125,5.0660324877090455Q2.794233376953125,4.993583487709046,2.822501376953125,4.9253374877090454Q2.850770376953125,4.857092487709045,2.891809376953125,4.795672487709045Q2.932848376953125,4.734253487709045,2.985081376953125,4.682020487709045Q3.037314376953125,4.629787487709045,3.098733376953125,4.588748487709045Q3.160153376953125,4.547709487709046,3.228398376953125,4.519440487709045Q3.296644376953125,4.491172487709045,3.369093376953125,4.476761487709045Q3.441542876953125,4.462350487709045,3.515411376953125,4.462350487709045Q3.589279876953125,4.462350487709045,3.661729376953125,4.476761487709045Q3.734178376953125,4.491172487709045,3.802424376953125,4.519440487709045Q3.870669376953125,4.547709487709046,3.932089376953125,4.588748487709045Q3.993508376953125,4.629787487709045,4.045741376953125,4.682020487709045Q4.097974376953125,4.734253487709045,4.139013376953125,4.795672487709045Q4.180052376953125,4.857092487709045,4.208321376953125,4.9253374877090454Q4.236589376953125,4.993583487709046,4.251000376953125,5.0660324877090455Q4.265411376953125,5.138481987709046,4.265411376953125,5.212350487709045L4.265411376953125,5.212649497709045Z" fill="var(--text-color1)"/></g></g></g></svg>
                                    <svg onClick={()=>this.setState({showFormulaModal:true})} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="24" height="24" viewBox="0 0 24 24"><defs><clipPath id="master_svg0_323_071432"><rect x="0" y="0" width="24" height="24" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_323_071432)"><g><path d="M3.6429491015625,15.218025L2.2541808015625,15.237225L2.2310791015625,13.409815L4.8202491015625,13.374175L5.487539101562501,15.018825L8.2606291015625,3.640625L21.7786791015625,3.640625L21.7786791015625,5.468005L9.644959101562499,5.468005L5.9078091015625,20.807025L3.6429491015625,15.218025ZM10.4552991015625,19.447525L13.5100791015625,14.123425L10.5450391015625,8.284005L18.6190791015625,8.284005L19.7403791015625,11.025075000000001L18.1028791015625,11.733185L17.4390791015625,10.107735L13.4762791015625,10.107735L15.5412791015625,14.172725L13.5651791015625,17.620125L17.4595791015625,17.620125L18.1143791015625,16.147225L19.7288791015625,16.907425L18.5995791015625,19.447525L10.4552991015625,19.447525Z" fill="var(--text-color1)"/></g></g></svg>
                                </div>
                                {isExecuting ?
                                    <Tooltip title={t('home.stopGeneratin')}>
                                        <svg onClick={()=>this.stopGenerating()} fill="none" version="1.1" width="32" height="32" viewBox="0 0 32 32"><g><g><g><path d="M27.865000228881836,16.000000228881838Q27.865000228881836,16.291300228881838,27.850700228881834,16.582200228881838Q27.836400228881836,16.873100228881835,27.807900228881834,17.163000228881835Q27.779300228881837,17.452800228881834,27.736600228881837,17.741000228881838Q27.693800228881837,18.029100228881838,27.637000228881835,18.314700228881836Q27.580200228881836,18.60040022888184,27.509400228881837,18.883000228881833Q27.438600228881835,19.165500228881836,27.354100228881837,19.444200228881837Q27.269500228881835,19.723000228881837,27.171400228881836,19.997200228881837Q27.073300228881838,20.271400228881834,26.961800228881835,20.540500228881836Q26.850400228881835,20.809600228881838,26.725800228881837,21.072900228881835Q26.601300228881836,21.336200228881836,26.464000228881837,21.593100228881838Q26.326700228881837,21.850000228881836,26.176900228881834,22.099800228881836Q26.027200228881835,22.349700228881836,25.865400228881835,22.591800228881837Q25.703600228881836,22.834000228881838,25.530100228881835,23.068000228881836Q25.356500228881835,23.301900228881834,25.171800228881835,23.527100228881835Q24.987000228881836,23.752200228881836,24.791400228881837,23.968000228881834Q24.595800228881835,24.183900228881836,24.389800228881835,24.389800228881835Q24.183900228881836,24.595800228881835,23.968000228881834,24.791400228881837Q23.752200228881836,24.987000228881836,23.527100228881835,25.171800228881835Q23.301900228881834,25.356500228881835,23.068000228881836,25.530100228881835Q22.834000228881838,25.703600228881836,22.591800228881837,25.865400228881835Q22.349700228881836,26.027200228881835,22.099800228881836,26.176900228881834Q21.850000228881836,26.326700228881837,21.593100228881838,26.464000228881837Q21.336200228881836,26.601300228881836,21.072900228881835,26.725800228881837Q20.809600228881838,26.850400228881835,20.540500228881836,26.961800228881835Q20.271400228881834,27.073300228881838,19.997200228881837,27.171400228881836Q19.723000228881837,27.269500228881835,19.444200228881837,27.354100228881837Q19.165500228881836,27.438600228881835,18.883000228881833,27.509400228881837Q18.60040022888184,27.580200228881836,18.314700228881836,27.637000228881835Q18.029100228881838,27.693800228881837,17.741000228881838,27.736600228881837Q17.452800228881834,27.779300228881837,17.163000228881835,27.807900228881834Q16.873100228881835,27.836400228881836,16.582200228881838,27.850700228881834Q16.291300228881838,27.865000228881836,16.000000228881838,27.865000228881836Q15.708700228881836,27.865000228881836,15.417800228881836,27.850700228881834Q15.126900228881835,27.836400228881836,14.837000228881836,27.807900228881834Q14.547200228881836,27.779300228881837,14.259000228881836,27.736600228881837Q13.970920228881836,27.693800228881837,13.685250228881836,27.637000228881835Q13.399580228881836,27.580200228881836,13.117040228881836,27.509400228881837Q12.834500228881836,27.438600228881835,12.555770228881835,27.354100228881837Q12.277040228881836,27.269500228881835,12.002800228881835,27.171400228881836Q11.728560228881836,27.073300228881838,11.459460228881836,26.961800228881835Q11.190360228881836,26.850400228881835,10.927060228881835,26.725800228881837Q10.663750228881835,26.601300228881836,10.406880228881835,26.464000228881837Q10.150000228881837,26.326700228881837,9.900170228881837,26.176900228881834Q9.650340228881836,26.027200228881835,9.408160228881837,25.865400228881835Q9.165980228881836,25.703600228881836,8.932030228881835,25.530100228881835Q8.698080228881835,25.356500228881835,8.472920228881836,25.171800228881835Q8.247770228881837,24.987000228881836,8.031950228881836,24.791400228881837Q7.816140228881836,24.595800228881835,7.610180228881836,24.389800228881835Q7.404220228881836,24.183900228881836,7.208610228881836,23.968000228881834Q7.013010228881836,23.752200228881836,6.828230228881836,23.527100228881835Q6.643450228881836,23.301900228881834,6.4699402288818355,23.068000228881836Q6.296430228881836,22.834000228881838,6.1346102288818365,22.591800228881837Q5.972790228881836,22.349700228881836,5.823050228881836,22.099800228881836Q5.673310228881836,21.850000228881836,5.536000228881836,21.593100228881838Q5.398700228881836,21.336200228881836,5.274170228881836,21.072900228881835Q5.149630228881836,20.809600228881838,5.038169228881836,20.540500228881836Q4.926705228881836,20.271400228881834,4.828580228881836,19.997200228881837Q4.730454228881836,19.723000228881837,4.645903228881836,19.444200228881837Q4.561352228881836,19.165500228881836,4.490579228881836,18.883000228881833Q4.419806228881836,18.60040022888184,4.362983228881836,18.314700228881836Q4.306159228881836,18.029100228881838,4.263421228881836,17.741000228881838Q4.220682828881836,17.452800228881834,4.192133428881836,17.163000228881835Q4.163584028881836,16.873100228881835,4.149292128881836,16.582200228881838Q4.135000228881836,16.291300228881838,4.135000228881836,16.000000228881838Q4.135000228881836,15.708700228881836,4.149292128881836,15.417800228881836Q4.163584028881836,15.126900228881835,4.192133428881836,14.837000228881836Q4.220682828881836,14.547200228881836,4.263421228881836,14.259000228881836Q4.306159228881836,13.970920228881836,4.362983228881836,13.685250228881836Q4.419806228881836,13.399580228881836,4.490579228881836,13.117040228881836Q4.561352228881836,12.834500228881836,4.645903228881836,12.555770228881835Q4.730454228881836,12.277040228881836,4.828580228881836,12.002800228881835Q4.926705228881836,11.728560228881836,5.038169228881836,11.459460228881836Q5.149630228881836,11.190360228881836,5.274170228881836,10.927060228881835Q5.398700228881836,10.663750228881835,5.536000228881836,10.406880228881835Q5.673310228881836,10.150000228881837,5.823050228881836,9.900170228881837Q5.972790228881836,9.650340228881836,6.1346102288818365,9.408160228881837Q6.296430228881836,9.165980228881836,6.4699402288818355,8.932030228881835Q6.643450228881836,8.698080228881835,6.828230228881836,8.472920228881836Q7.013010228881836,8.247770228881837,7.208610228881836,8.031950228881836Q7.404220228881836,7.816140228881836,7.610180228881836,7.610180228881836Q7.816140228881836,7.404220228881836,8.031950228881836,7.208610228881836Q8.247770228881837,7.013010228881836,8.472920228881836,6.828230228881836Q8.698080228881835,6.643450228881836,8.932030228881835,6.4699402288818355Q9.165980228881836,6.296430228881836,9.408160228881837,6.1346102288818365Q9.650340228881836,5.972790228881836,9.900170228881837,5.823050228881836Q10.150000228881837,5.673310228881836,10.406880228881835,5.536000228881836Q10.663750228881835,5.398700228881836,10.927060228881835,5.274170228881836Q11.190360228881836,5.149630228881836,11.459460228881836,5.038169228881836Q11.728560228881836,4.926705228881836,12.002800228881835,4.828580228881836Q12.277040228881836,4.730454228881836,12.555770228881835,4.645903228881836Q12.834500228881836,4.561352228881836,13.117040228881836,4.490579228881836Q13.399580228881836,4.419806228881836,13.685250228881836,4.362983228881836Q13.970920228881836,4.306159228881836,14.259000228881836,4.263421228881836Q14.547200228881836,4.220682828881836,14.837000228881836,4.192133428881836Q15.126900228881835,4.163584028881836,15.417800228881836,4.149292128881836Q15.708700228881836,4.135000228881836,16.000000228881838,4.135000228881836Q16.291300228881838,4.135000228881836,16.582200228881838,4.149292128881836Q16.873100228881835,4.163584028881836,17.163000228881835,4.192133428881836Q17.452800228881834,4.220682828881836,17.741000228881838,4.263421228881836Q18.029100228881838,4.306159228881836,18.314700228881836,4.362983228881836Q18.60040022888184,4.419806228881836,18.883000228881833,4.490579228881836Q19.165500228881836,4.561352228881836,19.444200228881837,4.645903228881836Q19.723000228881837,4.730454228881836,19.997200228881837,4.828580228881836Q20.271400228881834,4.926705228881836,20.540500228881836,5.038169228881836Q20.809600228881838,5.149630228881836,21.072900228881835,5.274170228881836Q21.336200228881836,5.398700228881836,21.593100228881838,5.536000228881836Q21.850000228881836,5.673310228881836,22.099800228881836,5.823050228881836Q22.349700228881836,5.972790228881836,22.591800228881837,6.1346102288818365Q22.834000228881838,6.296430228881836,23.068000228881836,6.4699402288818355Q23.301900228881834,6.643450228881836,23.527100228881835,6.828230228881836Q23.752200228881836,7.013010228881836,23.968000228881834,7.208610228881836Q24.183900228881836,7.404220228881836,24.389800228881835,7.610180228881836Q24.595800228881835,7.816140228881836,24.791400228881837,8.031950228881836Q24.987000228881836,8.247770228881837,25.171800228881835,8.472920228881836Q25.356500228881835,8.698080228881835,25.530100228881835,8.932030228881835Q25.703600228881836,9.165980228881836,25.865400228881835,9.408160228881837Q26.027200228881835,9.650340228881836,26.176900228881834,9.900170228881837Q26.326700228881837,10.150000228881837,26.464000228881837,10.406880228881835Q26.601300228881836,10.663750228881835,26.725800228881837,10.927060228881835Q26.850400228881835,11.190360228881836,26.961800228881835,11.459460228881836Q27.073300228881838,11.728560228881836,27.171400228881836,12.002800228881835Q27.269500228881835,12.277040228881836,27.354100228881837,12.555770228881835Q27.438600228881835,12.834500228881836,27.509400228881837,13.117040228881836Q27.580200228881836,13.399580228881836,27.637000228881835,13.685250228881836Q27.693800228881837,13.970920228881836,27.736600228881837,14.259000228881836Q27.779300228881837,14.547200228881836,27.807900228881834,14.837000228881836Q27.836400228881836,15.126900228881835,27.850700228881834,15.417800228881836Q27.865000228881836,15.708700228881836,27.865000228881836,16.000000228881838ZM24.865000228881836,16.000000228881838Q24.865000228881836,15.782400228881835,24.854300228881836,15.565000228881836Q24.843600228881837,15.347700228881836,24.822300228881836,15.131100228881836Q24.801000228881836,14.914500228881836,24.769000228881836,14.699200228881836Q24.737100228881836,14.484000228881836,24.694700228881835,14.270500228881836Q24.652200228881835,14.057080228881835,24.599300228881837,13.845980228881835Q24.546400228881836,13.634880228881835,24.483300228881834,13.426630228881836Q24.420100228881836,13.218370228881836,24.346800228881836,13.013470228881836Q24.273500228881836,12.808570228881836,24.190200228881835,12.607510228881836Q24.106900228881837,12.406450228881836,24.013900228881838,12.209720228881835Q23.920800228881834,12.012990228881836,23.818200228881835,11.821070228881837Q23.715600228881836,11.629140228881836,23.603800228881838,11.442480228881836Q23.491900228881835,11.255820228881836,23.371000228881837,11.074870228881835Q23.250100228881838,10.893920228881836,23.120400228881834,10.719120228881836Q22.990800228881834,10.544330228881837,22.852700228881837,10.376100228881835Q22.714700228881835,10.207880228881836,22.568500228881835,10.046630228881835Q22.422400228881838,9.885380228881836,22.268500228881837,9.731500228881835Q22.114600228881837,9.577610228881836,21.953400228881836,9.431470228881835Q21.792100228881836,9.285320228881837,21.623900228881837,9.147260228881837Q21.455700228881835,9.009200228881836,21.280900228881837,8.879560228881836Q21.106100228881836,8.749930228881837,20.925100228881835,8.629020228881835Q20.744200228881837,8.508120228881836,20.557500228881835,8.396230228881837Q20.370900228881837,8.284350228881836,20.178900228881837,8.181770228881836Q19.987000228881836,8.079180228881835,19.790300228881836,7.986130228881835Q19.593500228881837,7.893090228881836,19.392500228881836,7.809810228881836Q19.191400228881836,7.7265302288818365,18.986500228881837,7.653210228881836Q18.781600228881835,7.5799002288818365,18.573400228881837,7.5167202288818356Q18.365100228881836,7.453550228881836,18.154000228881834,7.400670228881836Q17.942900228881836,7.347790228881836,17.729500228881836,7.305340228881835Q17.516000228881836,7.262880228881836,17.300800228881837,7.230950228881836Q17.085500228881834,7.199020228881836,16.868900228881834,7.177690228881836Q16.652300228881835,7.1563602288818355,16.435000228881837,7.145680228881836Q16.217600228881835,7.135000228881836,16.000000228881838,7.135000228881836Q15.782400228881835,7.135000228881836,15.565000228881836,7.145680228881836Q15.347700228881836,7.1563602288818355,15.131100228881836,7.177690228881836Q14.914500228881836,7.199020228881836,14.699200228881836,7.230950228881836Q14.484000228881836,7.262880228881836,14.270500228881836,7.305340228881835Q14.057080228881835,7.347790228881836,13.845980228881835,7.400670228881836Q13.634880228881835,7.453550228881836,13.426630228881836,7.5167202288818356Q13.218370228881836,7.5799002288818365,13.013470228881836,7.653210228881836Q12.808570228881836,7.7265302288818365,12.607510228881836,7.809810228881836Q12.406450228881836,7.893090228881836,12.209720228881835,7.986130228881835Q12.012990228881836,8.079180228881835,11.821070228881837,8.181770228881836Q11.629140228881836,8.284350228881836,11.442480228881836,8.396240228881837Q11.255820228881836,8.508120228881836,11.074870228881835,8.629020228881835Q10.893920228881836,8.749930228881837,10.719120228881836,8.879560228881836Q10.544330228881837,9.009200228881836,10.376100228881835,9.147260228881837Q10.207880228881836,9.285320228881837,10.046630228881835,9.431470228881835Q9.885380228881836,9.577610228881836,9.731500228881835,9.731500228881835Q9.577610228881836,9.885380228881836,9.431470228881835,10.046630228881835Q9.285320228881837,10.207880228881836,9.147260228881837,10.376100228881835Q9.009200228881836,10.544330228881837,8.879560228881836,10.719130228881836Q8.749930228881837,10.893920228881836,8.629020228881835,11.074870228881835Q8.508120228881836,11.255820228881836,8.396230228881837,11.442480228881836Q8.284350228881836,11.629140228881836,8.181770228881836,11.821070228881837Q8.079180228881835,12.012990228881836,7.986130228881835,12.209720228881835Q7.893090228881836,12.406450228881836,7.809810228881836,12.607510228881836Q7.7265302288818365,12.808570228881836,7.653210228881836,13.013470228881836Q7.5799002288818365,13.218370228881836,7.5167202288818356,13.426630228881836Q7.453550228881836,13.634880228881835,7.400670228881836,13.845980228881835Q7.347790228881836,14.057080228881835,7.305340228881835,14.270500228881836Q7.262880228881836,14.484000228881836,7.230950228881836,14.699200228881836Q7.199020228881836,14.914500228881836,7.177690228881836,15.131100228881836Q7.1563602288818355,15.347700228881836,7.145680228881836,15.565000228881836Q7.135000228881836,15.782400228881835,7.135000228881836,16.000000228881838Q7.135000228881836,16.217600228881835,7.145680228881836,16.435000228881837Q7.1563602288818355,16.652300228881835,7.177690228881836,16.868900228881834Q7.199020228881836,17.085500228881834,7.230950228881836,17.300800228881837Q7.262880228881836,17.516000228881836,7.305340228881835,17.729500228881836Q7.347790228881836,17.942900228881836,7.400670228881836,18.154000228881834Q7.453550228881836,18.365100228881836,7.5167202288818356,18.573400228881837Q7.5799002288818365,18.781600228881835,7.653210228881836,18.986500228881837Q7.7265302288818365,19.191400228881836,7.809810228881836,19.392500228881836Q7.893090228881836,19.593500228881837,7.986130228881835,19.790300228881836Q8.079180228881835,19.987000228881836,8.181770228881836,20.178900228881837Q8.284350228881836,20.370900228881837,8.396230228881837,20.557500228881835Q8.508120228881836,20.744200228881837,8.629020228881835,20.925100228881835Q8.749930228881837,21.106100228881836,8.879560228881836,21.280900228881837Q9.009200228881836,21.455700228881835,9.147260228881837,21.623900228881837Q9.285320228881837,21.792100228881836,9.431470228881835,21.953400228881836Q9.577610228881836,22.114600228881837,9.731500228881835,22.268500228881837Q9.885380228881836,22.422400228881838,10.046630228881835,22.568500228881835Q10.207880228881836,22.714700228881835,10.376100228881835,22.852700228881837Q10.544330228881837,22.990800228881834,10.719130228881836,23.120400228881834Q10.893920228881836,23.250100228881838,11.074870228881835,23.371000228881837Q11.255820228881836,23.491900228881835,11.442480228881836,23.603800228881838Q11.629140228881836,23.715600228881836,11.821070228881837,23.818200228881835Q12.012990228881836,23.920800228881834,12.209720228881835,24.013900228881838Q12.406450228881836,24.106900228881837,12.607510228881836,24.190200228881835Q12.808570228881836,24.273500228881836,13.013470228881836,24.346800228881836Q13.218370228881836,24.420100228881836,13.426630228881836,24.483300228881834Q13.634880228881835,24.546400228881836,13.845980228881835,24.599300228881837Q14.057080228881835,24.652200228881835,14.270500228881836,24.694700228881835Q14.484000228881836,24.737100228881836,14.699200228881836,24.769000228881836Q14.914500228881836,24.801000228881836,15.131100228881836,24.822300228881836Q15.347700228881836,24.843600228881837,15.565000228881836,24.854300228881836Q15.782400228881835,24.865000228881836,16.000000228881838,24.865000228881836Q16.217600228881835,24.865000228881836,16.435000228881837,24.854300228881836Q16.652300228881835,24.843600228881837,16.868900228881834,24.822300228881836Q17.085500228881834,24.801000228881836,17.300800228881837,24.769000228881836Q17.516000228881836,24.737100228881836,17.729500228881836,24.694700228881835Q17.942900228881836,24.652200228881835,18.154000228881834,24.599300228881837Q18.365100228881836,24.546400228881836,18.573400228881837,24.483300228881834Q18.781600228881835,24.420100228881836,18.986500228881837,24.346800228881836Q19.191400228881836,24.273500228881836,19.392500228881836,24.190200228881835Q19.593500228881837,24.106900228881837,19.790300228881836,24.013900228881838Q19.987000228881836,23.920800228881834,20.178900228881837,23.818200228881835Q20.370900228881837,23.715600228881836,20.557500228881835,23.603800228881838Q20.744200228881837,23.491900228881835,20.925100228881835,23.371000228881837Q21.106100228881836,23.250100228881838,21.280900228881837,23.120400228881834Q21.455700228881835,22.990800228881834,21.623900228881837,22.852700228881837Q21.792100228881836,22.714700228881835,21.953400228881836,22.568500228881835Q22.114600228881837,22.422400228881838,22.268500228881837,22.268500228881837Q22.422400228881838,22.114600228881837,22.568500228881835,21.953400228881836Q22.714700228881835,21.792100228881836,22.852700228881837,21.623900228881837Q22.990800228881834,21.455700228881835,23.120400228881834,21.280900228881837Q23.250100228881838,21.106100228881836,23.371000228881837,20.925100228881835Q23.491900228881835,20.744200228881837,23.603800228881838,20.557500228881835Q23.715600228881836,20.370900228881837,23.818200228881835,20.178900228881837Q23.920800228881834,19.987000228881836,24.013900228881838,19.790300228881836Q24.106900228881837,19.593500228881837,24.190200228881835,19.392500228881836Q24.273500228881836,19.191400228881836,24.346800228881836,18.986500228881837Q24.420100228881836,18.781600228881835,24.483300228881834,18.573400228881837Q24.546400228881836,18.365100228881836,24.599300228881837,18.154000228881834Q24.652200228881835,17.942900228881836,24.694700228881835,17.729500228881836Q24.737100228881836,17.516000228881836,24.769000228881836,17.300800228881837Q24.801000228881836,17.085500228881834,24.822300228881836,16.868900228881834Q24.843600228881837,16.652300228881835,24.854300228881836,16.435000228881837Q24.865000228881836,16.217600228881835,24.865000228881836,16.000000228881838Z" fillRule="evenodd" fill="#3461E2" /></g><g><rect x="12.89536190032959" y="12.895505905151367" width="6.209272861480713" height="6.209272861480713" rx="1" fill="#3461E2" /></g></g></g></svg>
                                    </Tooltip> :
                                    <Tooltip title={t('home.send')}>
                                        <svg className={message.length > 0 ? "sendActive" : "send"} onClick={()=>this.send()} fill="none" version="1.1" width="32" height="32" viewBox="0 0 32 32"><defs><clipPath id="master_svg0_9_08092"><rect x="6" y="7" width="18" height="18" rx="0"/></clipPath></defs><g><g><ellipse cx="16" cy="16" rx="16" ry="16" fill="currentColor" /></g><g clipPath="url(#master_svg0_9_08092)"><g><path d="M23.20373388671875,8.186527112304688C23.20373388671875,8.184770112304687,23.20193388671875,8.184770112304687,23.20193388671875,8.183012112304688C23.16503388671875,8.110942112304688,23.11233388671875,8.045902112304688,23.04723388671875,7.993168112304687C22.98393388671875,7.940433812304687,22.91193388671875,7.901761912304687,22.83633388671875,7.877152512304687C22.83453388671875,7.877152512304687,22.83283388671875,7.8753948123046875,22.83103388671875,7.8753948123046875C22.80113388671875,7.864847912304688,22.76953388671875,7.859574412304688,22.73783388671875,7.8543010123046875C22.72913388671875,7.852543232304687,22.72033388671875,7.8490275923046875,22.70973388671875,7.8490275923046875C22.67983388671875,7.8455119503046875,22.651733886718752,7.8455119503046875,22.62183388671875,7.847269802304687C22.60953388671875,7.847269802304687,22.59903388671875,7.845512017304688,22.58673388671875,7.847269802304687C22.502333886718752,7.852543232304687,22.41793388671875,7.8771526123046876,22.34063388671875,7.915824512304687L7.08103888671875,15.483205112304688C6.93162488671875,15.555275112304688,6.81736668671875,15.685355112304688,6.76463228671875,15.843555112304688C6.74881188671875,15.887505112304687,6.74178068671875,15.934965112304688,6.73650728671875,15.980665112304688C6.72068694671875,16.073835112304685,6.72420258671875,16.170515112304688,6.75408538671875,16.26191511230469C6.80330418671875,16.42187511230469,6.91404588671875,16.553715112304687,7.06345988671875,16.629305112304685L10.93592388671875,18.664815112304687C11.02908388671875,18.71411511230469,11.13103388671875,18.73871511230469,11.23650388671875,18.73871511230469C11.47029388671875,18.74041511230469,11.684753886718749,18.61391511230469,11.79900388671875,18.410015112304688C11.966003886718749,18.10581511230469,11.848223886718749,17.727935112304685,11.53885388671875,17.564455112304685L8.70877388671875,16.077345112304688L20.09063388671875,10.431255112304687L13.14900388671875,18.40291511230469C13.14373388671875,18.40821511230469,13.14197388671875,18.415215112304686,13.136703886718749,18.420515112304688C12.96443388671875,18.53301511230469,12.85193388671875,18.722815112304687,12.85193388671875,18.940815112304687L12.85193388671875,23.530515112304688C12.85369388671875,23.69741511230469,12.92224388671875,23.857415112304686,13.04178388671875,23.97521511230469C13.16131388671875,24.093015112304688,13.32303388671875,24.156215112304686,13.490023886718749,24.154515112304686L13.490023886718749,24.156215112304686C13.84158388671875,24.156215112304686,14.12635388671875,23.876715112304687,14.12635388671875,23.532215112304687L14.12635388671875,19.204515112304687L21.70423388671875,10.498055112304687L20.12923388671875,21.981815112304687L16.13377388671875,20.062315112304688C15.81912388671875,19.911115112304685,15.44119388671875,20.03771511230469,15.28123388671875,20.347115112304685C15.20740388671875,20.496515112304685,15.19686388671875,20.66871511230469,15.25135388671875,20.82691511230469C15.30584388671875,20.985115112304687,15.42186388671875,21.11351511230469,15.57303388671875,21.183815112304686L20.320833886718752,23.467215112304686C20.40873388671875,23.509415112304687,20.50373388671875,23.530515112304688,20.60213388671875,23.530515112304688C20.60563388671875,23.530515112304688,20.60913388671875,23.52871511230469,20.61263388671875,23.52871511230469C20.62323388671875,23.52871511230469,20.63553388671875,23.532215112304687,20.646033886718747,23.532215112304687C20.962533886718752,23.534015112304687,21.23143388671875,23.303715112304687,21.27713388671875,22.990815112304688L23.24593388671875,8.645316112304688C23.28983388671875,8.497660112304688,23.28103388671875,8.334183112304688,23.20373388671875,8.186527112304688Z" fill="#FFFFFF" /></g></g></g></svg>
                                    </Tooltip>
                                }
                            </div>
                        </div>
                    </div>
                </div>
                <div id="drag"/>
                <div id="dragDiv" className="app-content-right">
                    <div className="right-header">
                        <span className="label">需求报告</span>
                    </div>
                    <div id="requirement" className="right-content">
                        <MarkdownRenderer content={requirementContent}/>
                    </div>
                </div>
                {showAddFlowModal && <div className="custom-modal">
                    <div className="custom-modal-box">
                        <div className="custom-modal-title">
                            <span>确认创建</span>
                            <CloseOutlined onClick={this.hideModal.bind(this)}/>
                        </div>
                        <div className="custom-modal-content">
                            <img src={WarningSvg}/>是否根据当前需求报告，创建流程
                        </div>
                        <div className="custom-modal-footer">
                            <div className="ok" onClick={this.okModal.bind(this)}>{t('confirm')}</div>
                            <div className="close" onClick={this.hideModal.bind(this)}>{t('cancel')}</div>
                        </div>
                    </div>
                </div>}
                {showFormulaModal && <FormulaModal
                    onOk={val => this.formulaOk(val)}
                    onCancel={() => this.setState({showFormulaModal:false})}
                />}
                {showTableModal && <TableModal
                    onOk={val => this.tableOk(val)}
                    onCancel={() => this.setState({showTableModal:false})}
                />}
            </div>
        );
    }
}
export default withTranslation()(Requirement);
