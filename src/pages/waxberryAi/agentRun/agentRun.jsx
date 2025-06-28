import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import Header from '../components/header/index';
import Menu from '../components/menu/index';
import MarkdownRenderer from '@components/MarkdownRenderer';
import FileList from "../components/fileList/fileList";
import FileListV2 from "../components/fileList/fileList-V2";
import Voice from '@components/Voice/index';
import FormulaModal from "../components/formulaModal/formulaModal";
import TableModal from "../components/tableModal/tableModal";
import ExtraDialogue from "../components/extraDialogue/extraDialogue";
import DrawCode from '../components/drawCode/drawCode';
import axios from 'axios';
import Qs from 'qs';
import moment from "moment";
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { Input,Tooltip,message as Message,Popover,Cascader,Tree } from 'antd';
import {
    DownOutlined,
    FileTextOutlined,
    FolderOutlined,
    LoadingOutlined,
    RightOutlined,
    PlusOutlined
} from '@ant-design/icons';
import { withTranslation } from 'react-i18next';

import DefaultPng from '../img/default.png';

import './agentRun.scss';

const TreeNode = Tree.TreeNode;
const urlObj = Qs.parse(window.location.search.split('?')[1]);
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

function share() {
    let content = location.href;
    if(navigator.clipboard){
        navigator.clipboard.writeText(content);
        Message.success("地址已复制到剪切板");
    }else{
        let inputDom = document.createElement('textarea');
        inputDom.value = content;
        document.body.appendChild(inputDom);
        inputDom.select();
        const result = document.execCommand('copy');
        // 判断是否复制成功
        if (result) {
            Message.success("地址已复制到剪切板");
        }
        document.body.removeChild(inputDom);
    }
}

let fileReplace = {};//@替换
let isUserScrolling = false;//用户是否滚动

class AgentRun extends Component {
    constructor(props) {
        super(props);
        this.state = {
            message: "",
            conversationId: '',
            conversationList: [],
            messageData: [],
            isExecuting: false,
            waxberryObj: {},
            fileList: [],
            agentSupplementaryInfo: {},
            inputFileOptions: [],
            inputFileOpen: false,
            treeUploadFile:'',
            spinning:false,
            selectedKeys: [],
            selectMenu: "code",
            codeTreeData: [],
            codeData: "",
            codeLogs: "",
            expandedKeys: [],
            monacoLanguage: '',
            onlinePreviewUrl:'',
            stopSign:0,
            insertTableData: []
        };
    }

    componentWillMount() {
        if(urlObj.id){
            this.initData(urlObj.id);
        }
    }

    componentDidMount() {
    }

    componentWillUnmount() {
        if(controller){
            controller.abort();
        }
    }

    initData(id) {
        //获取纳豆
        axios.get(`${globalInitConfig.REACT_APP_API_BASE_URL}mgr/agent/agent/findById?id=${id}`).then(r1=>{
            if(r1.data.code === 200){
                let waxberryObj = r1.data.data;
                //获取智能体对应的关系
                axios.get(`${globalInitConfig.REACT_APP_API_BASE_URL}mgr/agent/agentUserRelation/findUserRelation?agentId=${id}`).then(r2=>{
                    if(r2.data.code === 200){
                        let agentRelation = r2.data.data;
                        if(agentRelation){
                            waxberryObj.vesselId = agentRelation.vesselId;
                            waxberryObj.vesselPort = agentRelation.vesselPort;
                            this.setState({
                                waxberryObj
                            },()=>{
                                this.getConversationList();
                            })
                        }else{
                            //添加智能体对应的关系
                            axios.post(`${globalInitConfig.REACT_APP_API_BASE_URL}mgr/agent/agentUserRelation/add?agentId=${id}`).then(r3=>{
                                if(r3.data.code === 200){
                                    let agentRelation = r3.data.data;
                                    waxberryObj.vesselId = agentRelation.vesselId;
                                    waxberryObj.vesselPort = agentRelation.vesselPort;
                                    this.setState({
                                        waxberryObj
                                    })
                                }
                            });
                        }
                    }
                });
            }
        });
        //获取纳豆扩展
        axios.get(`${globalInitConfig.REACT_APP_API_BASE_URL}mgr/agent/agentSupplementaryInfo/findById?waxberryId=${id}`).then(res=>{
            if(res.data.code === 200){
                this.setState({
                    agentSupplementaryInfo: res.data.data || { waxberryId: id }
                })
            }
        });
    }

    getConversationList(){
        let waxberryObj = this.state.waxberryObj;
        axios.get(`${globalInitConfig.REACT_APP_API_BASE_URL}mgr/vessel/conversationRelation/findConversationRelation?vesselId=${waxberryObj.vesselId}`).then(res=>{
            if(res.data.code === 200){
                this.setState({
                    conversationList: res.data.data || []
                })
            }
        });
    }

    getMessageData() {
        axios.get(`${globalInitConfig.REACT_APP_API_BASE_URL}mgr/conversation/message/list?pageNo=0&pageSize=1000&conversationId=${this.state.conversationId}`).then(res=>{
            if(res.data.code === 200){
                let messageData = res.data.data.content;
                this.setState({
                    messageData
                },()=>{
                    if(messageData.length>0){
                        let node = document.getElementById("dialogues");
                        node.scrollTop = node.scrollHeight + 50;
                    }
                })
            }
        });
    }

    handleChange(e) {
        let message = e.target.value;
        if(message.length>1 && message.slice(-2) === "@f"){
            this.getCodeTree();
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

    newSend(message) {
        if(!message){
            return;
        }
        let waxberryObj = this.state.waxberryObj;
        let params = {
            "title": message.substring(0,500),
            "chatType": "8"
        };
        axios.post(globalInitConfig.REACT_APP_API_BASE_URL + "mgr/conversation/add", params).then(res=>{
            if(res.data.code === 200){
                let obj = res.data.data;
                this.setState({
                    conversationId: obj.id
                },()=>{
                    this.send(message);
                });
                axios.post(`${globalInitConfig.REACT_APP_API_BASE_URL}mgr/vessel/conversationRelation/add`, {
                    "vesselId": waxberryObj.vesselId,
                    "conversationId": obj.id,
                    "conversationName": obj.title
                }).then(r=>{
                    this.getConversationList();
                })
            }
        });
    }
    menuChange(key) {
        this.setState({
            selectMenu: key
        })
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
        if(!this.state.agentSupplementaryInfo.roleInstruction){
            Message.warning("请填写角色指令后重试");
            return;
        }
        if(!this.state.conversationId){
            this.newSend(message);
            return;
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
            this.messageScroll();
            this.fetchData(message,conversationMessage);
        });
    }

    fetchData(message,conversationMessage) {
        controller = new AbortController();
        let fileList = this.state.fileList;
        let messageData = this.state.messageData;
        let waxberryObj = this.state.waxberryObj;
        var that = this;
        let params = {
            functionType: "4",
            functionData: {
                fileId: fileList.filter(file=>file.type==="file").map(file=>file.fileId).join(','),
                pictureId: fileList.filter(file=>file.type==="image").map(file=>file.fileId).join(','),
                waxberryType: 1,
                waxberryId: waxberryObj.id,
                questionData: message,
                containerId: waxberryObj.vesselId,
                waxberryAppPort: waxberryObj.vesselPort,
                conversationMessage,
                sessionId: this.state.conversationId
            }
        };
        axios.post(globalInitConfig.REACT_APP_API_BASE_URL + "mgr/commonChat/functionData", params).then(res=>{
            if(res.data.code === 200){
                let query = res.data.data;
                var newContent = "";
                const startTime = performance.now(); // 记录开始时间
                const eventSource = fetchEventSource(query.url, {
                    method: 'POST',
                    headers: {
                        "Content-Type": 'application/json',
                        "Authorization": localStorage.getItem('access_token') ? `Bearer ${localStorage.getItem('access_token')}` : ''
                    },
                    signal: controller.signal,
                    body: JSON.stringify(query.params),
                    openWhenHidden: true,
                    onmessage(event) {
                        try {
                            if(event.data) {
                                // console.log(event.data);
                                let data = JSON.parse(event.data);
                                let content = data.content;
                                //处理内容
                                if (content) {
                                    newContent = newContent + content;
                                    messageData[messageData.length - 1].reponse = newContent;
                                    that.setState({
                                        messageData
                                    }, () => {
                                        if(!isUserScrolling){
                                            let node = document.getElementById("dialogues");
                                            node.scrollTop = node.scrollHeight + 50;
                                        }
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
                        controller.abort();
                        eventSource.close();
                    },
                    onclose(close) {
                        newContent = newContent || "...";
                        const endTime = performance.now(); // 记录结束时间
                        const durationInMilliseconds = endTime - startTime; // 计算持续时间
                        const durationInSeconds = (durationInMilliseconds / 1000).toFixed(2);
                        that.setState({
                            isExecuting: false
                        });
                        let params = {
                            "conversationId": that.state.conversationId,
                            "parentId": "0",
                            "query": message,
                            "reponse": newContent,
                            "reponseFileId": fileList.map(v=>v.fileId).join(',')
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
        });
    }

    stopGenerating() {
        controller.abort();
        let messageData = this.state.messageData;
        let obj = messageData[messageData.length-1];
        obj.reponse += "...";
        let stopSign=this.state.stopSign
        stopSign++
        this.setState({
            isExecuting: false,
            messageData,
            stopSign
        });
        let params = {
            "conversationId": this.state.conversationId,
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

    copy(content) {
        if(navigator.clipboard){
            navigator.clipboard.writeText(content).then(()=>{

            });
        }else{
            let inputDom = document.createElement('textarea');
            inputDom.value = content;
            document.body.appendChild(inputDom);
            inputDom.select();
            const result = document.execCommand('copy');
            // 判断是否复制成功
            if (result) {

            }
            document.body.removeChild(inputDom);
        }
    }

    fileUploader(type,file) {
        let that = this;
        let fileList = this.state.fileList;

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
                formData.append("path","/waxberry/attachment/" + fileObj.fileName);
                axios.post(
                    `${globalInitConfig.REACT_APP_API_SBX_URL}/sandboxes/${that.state.waxberryObj.vesselId}/upload`,
                    formData,
                    { headers: { 'Content-Type': undefined } }
                ).then(res=> {
                    if(res.data.success){
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

    handleFileUpload(type,e) {
        const files = e.target.files;
        for (let i = 0; i < files.length; i++) {
            this.fileUploader(type,files[i]);
        }
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

    updateMessage(message) {
        this.setState({
            message
        })
    }

    getWaxberryById(waxberryObj){
        axios.get(`${globalInitConfig.REACT_APP_API_BASE_URL}mgr/agent/agent/findById?id=${waxberryObj.id}`).then(res=>{
            if(res.data.code === 200){
                let data = res.data.data;
                this.setState({
                    waxberryObj: {
                        ...waxberryObj,
                        isLike: data.isLike,
                        likeCount: data.likeCount,
                        isCollect: data.isCollect,
                        collectCount: data.collectCount
                    }
                });
            }
        });
    }

    like() {
        let waxberryObj = this.state.waxberryObj;
        axios.get(`${globalInitConfig.REACT_APP_API_BASE_URL}mgr/agent/agent/saveAgentLike?id=${waxberryObj.id}`).then(res => {
            const data = res.data;
            if (data.code === 200) {
                this.getWaxberryById(waxberryObj);
            } else {
                Message.error(data.message);
            }
        });
    }

    star() {
        let waxberryObj = this.state.waxberryObj;
        axios.get(`${globalInitConfig.REACT_APP_API_BASE_URL}mgr/agent/agent/saveAgentCollect?id=${waxberryObj.id}`).then(res => {
            const data = res.data;
            if (data.code === 200) {
                this.getWaxberryById(waxberryObj);
            } else {
                Message.error(data.message);
            }
        });
    }

    getCodeTree(){
        let waxberryObj = this.state.waxberryObj;
        axios.get(`${globalInitConfig.REACT_APP_API_SBX_URL}/sandboxes/${waxberryObj.vesselId}/tree?path=/waxberry`).then(res => {
            const data = res.data;
            if (data.data) {
                this.setState({
                    spinning: false,
                    codeTreeData: [data.data]
                });
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
                isUserScrolling = true;
            }else{
                startY = scrollTop;
            }
            //到底（提前20）
            if( (scrollTop+clientHeight+20) >= scrollHeight){
                isUserScrolling = false;
            }
        });
    }

    newConversation(){
        if(this.state.isExecuting) return;
        this.setState({
            conversationId: "",
            messageData: [],
            fileList: []
        })
    }

    selectConversation(conversationId){
        if(this.state.isExecuting) return;
        this.setState({
            conversationId,
            messageData: [],
            fileList: []
        },()=>{
            this.getMessageData();
        })
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

    deleteConversation(e,conversation) {
        e.stopPropagation();
        axios.delete(globalInitConfig.REACT_APP_API_BASE_URL + "mgr/vessel/conversationRelation/deleteConversationRelation?id=" + conversation.id).then(res=> {
            if(res.data.code === 200){
                if(conversation.conversationId === this.state.conversationId) {
                    if(controller) controller.abort();
                    this.setState({
                        conversationId: '',
                        messageData: [],
                        isExecuting: false
                    });
                }
                this.getConversationList();
                axios.post(globalInitConfig.REACT_APP_API_BASE_URL + "mgr/conversation/delete", {
                    ids: conversation.conversationId
                })
            }
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


    render() {
        const { message,messageData,isExecuting,waxberryObj,showFormulaModal,showTableModal,
            fileList,agentSupplementaryInfo,inputFileOptions,inputFileOpen,conversationId,conversationList,
            insertTableData }  = this.state;
        const { t } = this.props;
        const loop = data => data.map((item) => {
            let title = item.type==="file" ? <span className="label"><FileTextOutlined />{item.name}</span> : <span className="label"><FolderOutlined />{item.name}</span>;
            if (item.children && item.children.length) {
                return <TreeNode key={item.path} title={title} fileName={item.name} type={item.type}>{loop(item.children)}</TreeNode>;
            }
            return <TreeNode key={item.path} title={title} fileName={item.name} type={item.type}/>;
        });
        const content = (
            <div className="agentInfo">
                <div className="data-volume">
                    <div className="datas">
                        <div className="dataCount">
                            <span className="count">{waxberryObj.runCount}</span>
                            <span className="label">{t('agentRun.applicationCount')}</span>
                        </div>
                        <div className="dataCount">
                            <span className="count">{waxberryObj.likeCount}</span>
                            <span className="label">{t('agentRun.likeCount')}</span>
                        </div>
                        <div className="dataCount">
                            <span className="count">{waxberryObj.collectCount}</span>
                            <span className="label">{t('agentRun.collectCount')}</span>
                        </div>
                    </div>
                    <div className="operate">
                        <div className="btn" onClick={()=>share()}>
                            <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="24" height="24" viewBox="0 0 24 24"><defs><clipPath id="master_svg0_26_1523"><rect x="0" y="0" width="24" height="24" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_26_1523)"><g><path d="M8.476955625,12.313912265625Q8.476955625,12.488122265625,8.459875624999999,12.661492265625Q8.442805625,12.834862265625,8.408815624999999,13.005722265625Q8.374825625,13.176582265625001,8.324255625,13.343292265625Q8.273685624999999,13.510002265625001,8.207025625,13.670952265625Q8.140355625,13.831892265625001,8.058235625,13.985532265625Q7.976115625,14.139172265625,7.879325625,14.284022265625001Q7.782545625,14.428872265625,7.672025625,14.563532265625Q7.561515625,14.698202265625,7.438325625,14.821382265625001Q7.315145625,14.944572265625,7.180475625,15.055082265625Q7.045815625,15.165602265625001,6.900965625,15.262382265625Q6.756115625,15.359172265625,6.602475625,15.441292265625Q6.448835625,15.523412265625,6.287885625,15.590082265625Q6.126945625,15.656742265624999,5.960235625,15.707322265624999Q5.793525625,15.757892265625,5.622665625,15.791872265624999Q5.451805625,15.825862265625,5.278435625,15.842932265624999Q5.105065625,15.860012265625,4.9308556249999995,15.860012265625Q4.7566556250000005,15.860012265625,4.583285625,15.842932265624999Q4.409915625,15.825862265625,4.239055625000001,15.791872265624999Q4.068185625,15.757892265625,3.901485625,15.707322265624999Q3.734775625,15.656742265624999,3.573825625,15.590082265625Q3.412885625,15.523412265625,3.259245625,15.441292265625Q3.105605625,15.359172265625,2.960755625,15.262382265625Q2.815905625,15.165602265625001,2.681245625,15.055082265625Q2.546575625,14.944572265625,2.423395625,14.821382265625001Q2.300208625,14.698202265625,2.189691625,14.563532265625Q2.079175625,14.428872265625,1.9823906249999999,14.284022265625001Q1.885605625,14.139172265625,1.803483625,13.985532265625Q1.721362625,13.831892265625001,1.654695625,13.670952265625Q1.588029625,13.510002265625001,1.5374596249999999,13.343292265625Q1.486889625,13.176582265625001,1.452902825,13.005722265625Q1.418916425,12.834862265625,1.401841025,12.661492265625Q1.384765625,12.488122265625,1.384765625,12.313912265625Q1.384765625,12.139712265625,1.401841025,11.966342265625Q1.418916425,11.792972265625,1.452902825,11.622112265625Q1.486889625,11.451242265625,1.5374596249999999,11.284542265625Q1.588029625,11.117832265625001,1.654695625,10.956882265625Q1.721362625,10.795942265625,1.803483625,10.642302265625Q1.885605625,10.488662265624999,1.9823906249999999,10.343812265625001Q2.079175625,10.198962265625,2.189691625,10.064302265625Q2.300208625,9.929632265625,2.423395625,9.806452265625Q2.546575625,9.683265265625,2.681245625,9.572748265625Q2.815905625,9.462232265625,2.960755625,9.365447265625Q3.105605625,9.268662265625,3.259245625,9.186540265625Q3.412885625,9.104419265625,3.573825625,9.037752265625Q3.734775625,8.971086265625,3.901485625,8.920516265625Q4.068185625,8.869946265625,4.239055625000001,8.835959465625Q4.409915625,8.801973065625,4.583285625,8.784897665625Q4.7566556250000005,8.767822265625,4.9308556249999995,8.767822265625Q5.105065625,8.767822265625,5.278435625,8.784897665625Q5.451805625,8.801973065625,5.622665625,8.835959465625Q5.793525625,8.869946265625,5.960235625,8.920516265625Q6.126945625,8.971086265625,6.287885625,9.037752265625Q6.448835625,9.104419265625,6.602475625,9.186540265625Q6.756115625,9.268662265625,6.900965625,9.365447265625Q7.045815625,9.462232265625,7.180475625,9.572748265625Q7.315145625,9.683265265625,7.438325625,9.806452265625Q7.561515625,9.929632265625,7.672025625,10.064302265625Q7.782545625,10.198962265625,7.879325625,10.343812265625001Q7.976115625,10.488662265624999,8.058235625,10.642302265625Q8.140355625,10.795942265625,8.207025625,10.956882265625Q8.273685624999999,11.117832265625001,8.324265624999999,11.284542265625Q8.374825625,11.451242265625,8.408815624999999,11.622112265625Q8.442805625,11.792972265625,8.459875624999999,11.966342265625Q8.476955625,12.139712265625,8.476955625,12.313912265625Z" fill="currentColor"/></g><g><path d="M19.05226328125,15.4921875C18.26245328125,15.4944875,17.533543281249997,15.7546875,16.94292328125,16.1929875C16.66635328125,16.3991875,16.30073328125,16.4390875,15.98901328125,16.2960875L10.46010328125,13.7530875C9.98667328125,13.5351875,9.42651228125,13.7437875,9.21557528125,14.2171875C9.16166928125,14.3366875,9.10541828125,14.4515875,9.04213828125,14.5640875C8.77963728125,15.0398875,8.98354408125,15.6374875,9.47573128125,15.8648875L15.15229328125,18.4593875C15.377293281250001,18.5624875,15.51557328125,18.7851875,15.51557328125,19.0312875L15.51557328125,19.0359875C15.51557328125,20.9929875,17.10229328125,22.5819875,19.06166328125,22.5819875C21.02806328125,22.5819875,22.61946328125,20.9812875,22.60546328125,19.0124875C22.59136328125,17.0694875,20.99526328125,15.4874875,19.05226328125,15.4921875ZM10.47885328125,10.7859375L16.15776328125,7.8187475C16.46010328125,7.6593775,16.82807328125,7.6757775,17.11167328125,7.8679675C17.67417328125,8.2499975,18.35385328125,8.4726575,19.08276328125,8.4726575C21.00936328125,8.4726575,22.59136328125,6.9046875,22.60546328125,4.9757774999999995C22.61946328125,3.0187475,21.037463281249998,1.4296875,19.08506328125,1.4296875C17.13979328125,1.4296875,15.56245328125,3.0070275,15.56245328125,4.9523475L15.56245328125,4.9851575C15.564793281250001,5.3367175,15.37260328125,5.6624975,15.05854328125,5.8265675L9.42416928125,8.7703175C8.95541958125,9.0140675,8.78666928125,9.5953175,9.03979428125,10.0593775C9.09135728125,10.1554675,9.14291928125,10.2539075,9.18745028125,10.3523475C9.41245128125,10.8398475,10.00307328125,11.0343775,10.47885328125,10.7859375Z" fill="currentColor"/></g></g></svg>
                        </div>
                        {waxberryObj.isLike === 0 ?
                            <div className="btn" onClick={()=>this.like()}>
                                <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="24" height="24" viewBox="0 0 24 24"><defs><clipPath id="master_svg0_41_9670"><rect x="0" y="0" width="24" height="24" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_41_9670)"><g><path d="M12.15,3.49899C14.789,1.605491,18.4285,1.8724910000000001,20.778,4.24899C22.0405,5.52699,22.75,7.26899,22.75,9.085989999999999C22.75,10.90299,22.04,12.645,20.779,13.922L13.8785,20.942C13.3886,21.4569,12.7092,21.7488,11.9985,21.75C11.2911,21.7494,10.61456,21.4601,10.1255,20.949L3.2184999999999997,13.9165C1.9585,12.6385,1.25,10.89799,1.25,9.082989999999999C1.25,7.26799,1.9585,5.52699,3.2190000000000003,4.24849C5.568,1.87249,9.208,1.60549,11.847,3.49899L11.998,3.61099L12.15,3.49899ZM19.711,5.302989999999999C17.7275,3.29699,14.5745,3.2254899999999997,12.508,5.13999L11.998,5.6119900000000005L11.489,5.13999C9.422,3.2254899999999997,6.269,3.29699,4.2865,5.302490000000001C3.304,6.29849,2.75,7.66049,2.75,9.08249C2.75,10.50499,3.304,11.86699,4.2875,12.864L11.2025,19.905C11.4145,20.1265,11.701,20.25,11.9985,20.25C12.296,20.25,12.5825,20.1265,12.8015,19.8975L19.71,12.869C20.6945,11.87299,21.2495,10.50999,21.2495,9.085989999999999C21.2495,7.66249,20.6945,6.29899,19.7105,5.302989999999999L19.711,5.302989999999999Z" fill="currentColor"/></g></g></svg>
                                {t('waxberryPlaza.like')}
                            </div> :
                            <div className="btn" onClick={()=>this.like()}>
                                <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="24" height="24" viewBox="0 0 24 24"><defs><clipPath id="master_svg0_140_80743"><rect x="0" y="0" width="24" height="24" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_140_80743)"><g><path d="M12.146459375,3.7016818750000002C14.722659375,1.853251875,18.275459375,2.113897875,20.569059375,4.433831875C21.801559375,5.681421875,22.494159375,7.381951875,22.494159375,9.155711875C22.494159375,10.929461875,21.801059375,12.630021875,20.570059375,13.876621875L13.833759375,20.729521875C13.355459375,21.232121875,12.692359375,21.517121875,11.998559375,21.518321875C11.307959375,21.517721875,10.647529375,21.235321875,10.170119375,20.736321875L3.427509375,13.871221875C2.197496375,12.623621875,1.505859375,10.924581875,1.505859375,9.152781874999999C1.505859375,7.380981875,2.197496375,5.681411875,3.4279993749999997,4.433341875C5.721089375,2.113896875,9.274449375,1.853251875,11.850659375,3.7016818750000002L11.998059375,3.811021875L12.146459375,3.7016818750000002Z" fill="#F76965"/></g></g></svg>
                                {t('waxberryPlaza.like')}
                            </div>
                        }
                        {waxberryObj.isCollect === 0 ?
                            <div className="btn" onClick={()=>this.star()}>
                                <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="24" height="24" viewBox="0 0 24 24"><defs><clipPath id="master_svg0_41_15071"><rect x="0" y="0" width="24" height="24" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_41_15071)"><g><path d="M22.1820734375,9.5435434375C22.0951734375,9.2844034375,21.8710734375,9.094623437500001,21.6002734375,9.0530034375L15.4334734375,8.1011134375L12.6777734375,2.2014764375C12.5580734375,1.9452574375,12.3011734375,1.7810169455,12.0178734375,1.7802734375Q12.0171734375,1.7802734375,12.0164734375,1.7802734375C11.7346934375,1.7802734375,11.4777334375,1.9430514375,11.3565734375,2.1985494375L8.572943437500001,8.0920034375L2.3873734375,9.0179634375C2.1201944375,9.0639434375,1.9004794375,9.2537534375,1.8165365375,9.5114334375C1.7318499375,9.7683934375,1.7982850375,10.0516134375,1.9866294375,10.2457934375L6.4679434375,14.8555734375L5.398533437499999,21.3508734375C5.3532734375,21.6260734375,5.4693334375,21.9041734375,5.6978234375,22.0655734375C5.9255734375,22.2268734375,6.2263334375,22.2443734375,6.4708634375,22.1093734375L11.9872734375,19.0748734375L17.4919734375,22.1282734375C17.6022734375,22.1896734375,17.7241734375,22.2202734375,17.8460734375,22.2202734375C17.9934734375,22.2202734375,18.1402734375,22.1764734375,18.2650734375,22.0866734375C18.4934734375,21.9260734375,18.6110734375,21.6486734375,18.5664734375,21.3727734375L17.5189734375,14.8745734375L22.0112734375,10.2844534375C22.2017734375,10.0895634375,22.2681734375,9.8026934375,22.1820734375,9.5435434375ZM16.2181734375,14.1175734375C16.056873437500002,14.2825734375,15.9823734375,14.5153734375,16.0195734375,14.7438734375L16.8867734375,20.1222734375L12.3434734375,17.602473437500002C12.1244734375,17.4797734375,11.8572734375,17.4797734375,11.6375934375,17.600973437500002L7.0840134375,20.1062734375L7.9694734375,14.7299734375C8.006693437500001,14.5022734375,7.9337134375,14.2693734375,7.7723734375,14.1029734375L4.0006134375,10.2231534375L9.1605234375,9.4804934375C9.2119034375,9.4716234375,9.2610434375,9.457513437500001,9.3075934375,9.4389734375C9.4874734375,9.3773134375,9.6432434375,9.2460034375,9.7309034375,9.0603034375L12.0135734375,4.2278634375L14.2764734375,9.0726934375C14.3800734375,9.2931534375,14.5859734375,9.447903437499999,14.8268734375,9.4851234375L19.9745734375,10.2793434375L16.2181734375,14.1175734375Z" fill="currentColor"/></g></g></svg>
                                {t('waxberryPlaza.favorite')}
                            </div> :
                            <div className="btn" onClick={()=>this.star()}>
                                <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="24" height="24" viewBox="0 0 24 24"><defs><clipPath id="master_svg0_140_80750"><rect x="0" y="0" width="24" height="24" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_140_80750)"><g><path d="M22.1820734375,9.5435434375C22.0951734375,9.2844034375,21.8710734375,9.094623437500001,21.6002734375,9.0530034375L15.4334734375,8.1011134375L12.6777734375,2.2014764375C12.5580734375,1.9452574375,12.3011734375,1.7810169455,12.0178734375,1.7802734375Q12.0171734375,1.7802734375,12.0164734375,1.7802734375C11.7346934375,1.7802734375,11.4777334375,1.9430514375,11.3565734375,2.1985494375L8.572943437500001,8.0920034375L2.3873734375,9.0179634375C2.1201944375,9.0639434375,1.9004794375,9.2537534375,1.8165365375,9.5114334375C1.7318499375,9.7683934375,1.7982850375,10.0516134375,1.9866294375,10.2457934375L6.4679434375,14.8555734375L5.398533437499999,21.3508734375C5.3532734375,21.6260734375,5.4693334375,21.9041734375,5.6978234375,22.0655734375C5.9255734375,22.2268734375,6.2263334375,22.2443734375,6.4708634375,22.1093734375L11.9872734375,19.0748734375L17.4919734375,22.1282734375C17.6022734375,22.1896734375,17.7241734375,22.2202734375,17.8460734375,22.2202734375C17.9934734375,22.2202734375,18.1402734375,22.1764734375,18.2650734375,22.0866734375C18.4934734375,21.9260734375,18.6110734375,21.6486734375,18.5664734375,21.3727734375L17.5189734375,14.8745734375L22.0112734375,10.2844534375C22.2017734375,10.0895634375,22.2681734375,9.8026934375,22.1820734375,9.5435434375Z" fill="#FFCD44"/></g></g></svg>
                                {t('waxberryPlaza.favorite')}
                            </div>
                        }
                    </div>
                </div>
                <div className="publish-info">
                    <div className="publish-info-title">{t('agentRun.publishInfoTitle')}</div>
                    <div className="publish-info-data">
                        {t('agentRun.publisher')}: {waxberryObj.creatorName}
                    </div>
                    <div className="publish-info-data">
                        {t('agentRun.publishTime')}: {moment(waxberryObj.updateTime).format("YYYY-MM-DD HH:mm:ss")}
                    </div>
                </div>
                {/* <div className="attr-info">
                    <div className="attr-info-title">{t('agentRun.attribute')}</div>
                    <div className="attrs">
                        <div className="attr">
                            <span>{t('task')}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="16" height="16" viewBox="0 0 16 16"><defs><clipPath id="master_svg0_228_022264"><rect x="0" y="0" width="16" height="16" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_228_022264)"><g><path d="M4.98389590625,5.5899658203125C4.65327490625,5.5899651210275,4.38525390625,5.8963678203125,4.38525390625,6.2743358203125C4.38525390625,6.6523058203125,4.65327490625,6.9587058203125,4.98389590625,6.9587058203125L7.39898390625,6.9587058203125C7.72960390625,6.9587058203125,7.99762390625,6.6523058203125,7.99762390625,6.2743358203125C7.99762390625,5.8963678203125,7.72960390625,5.5899651210275,7.39898390625,5.5899658203125L4.98389590625,5.5899658203125ZM4.98389590625,9.0411458203125C4.65327490625,9.0411458203125,4.38525390625,9.3475458203125,4.38525390625,9.7255158203125C4.38525390625,10.1034858203125,4.65327490625,10.4098858203125,4.98389590625,10.4098858203125L8.60653390625,10.4098858203125C8.93715390625,10.4098858203125,9.20517390625,10.1034858203125,9.20517390625,9.7255158203125C9.20517390625,9.3475458203125,8.93715390625,9.0411458203125,8.60653390625,9.0411458203125L4.98389590625,9.0411458203125Z" fill="#FFFFFF"/></g><g><path d="M3.1761876562499998,0.7701416015625C2.51328065625,0.7701416015625,1.97509765625,1.3571796015625,1.97509765625,2.0802616015625L1.97509765625,13.9197416015625C1.97509765625,14.6438416015625,2.51328065625,15.2299416015625,3.1761876562499998,15.2299416015625L11.61882765625,15.2299416015625C12.28169765625,15.2299416015625,12.81989765625,14.6428416015625,12.81989765625,13.9197416015625L12.81989765625,6.6861816015625C12.81989765625,6.3259416015625,12.55219765625,6.0339116015625,12.22189765625,6.0339116015625C11.89168765625,6.0339116015625,11.62395765625,6.3259416015625,11.62395765625,6.6861816015625L11.62395765625,13.9216416015625L11.62224765625,13.9235416015625L11.62053765625,13.9253416015625L3.1744776562499997,13.9253416015625L3.17276765625,13.9235416015625C3.17240765625,13.9229416015625,3.17211765625,13.9223416015625,3.1719176562499998,13.9216416015625L3.1719176562499998,2.0784016015624998L3.17276765625,2.0765316015625C3.1732176562500003,2.0757916015625,3.17379765625,2.0751616015625,3.1744776562499997,2.0746716015624997L9.20725765625,2.0746716015624997C9.53751765625,2.0746716015624997,9.80523765625,1.7826416015625,9.80523765625,1.4224066015624999C9.80523765625,1.0621706015624999,9.53751765625,0.7701419348025,9.20725765625,0.7701419348025L3.1761876562499998,0.7701416015625Z" fill="#FFFFFF"/></g><g><path d="M13.849558125,2.9974476562500003C14.083478125,2.76356865625,14.083478125,2.38438065625,13.849558125,2.15050465625C13.615648125,1.91662895625,13.236388125000001,1.91662865625,13.002468125,2.15050465625L9.380516125,5.77266765625C9.146598425,6.00654765625,9.146598425,6.38573765625,9.380516125,6.61960765625C9.614433125,6.85348765625,9.993689125,6.85348765625,10.227608125,6.61961765625L13.849558125,2.9974476562500003Z" fill="#FFFFFF"/></g></g></svg>
                        </div>
                        <div className="attr">
                            <span>{t('log')}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="16" height="16" viewBox="0 0 16 16"><defs><clipPath id="master_svg0_228_022274"><rect x="0" y="0" width="16" height="16" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_228_022274)"><g><path d="M13.87460859375,2.65942859375C14.16960859375,2.65942859375,14.40870859375,2.89852859375,14.40870859375,3.19347859375L14.40870859375,12.80650859375C14.40870859375,13.69140859375,13.69140859375,14.40870859375,12.80650859375,14.40870859375L3.19347859375,14.40870859375C2.30862559375,14.40870859375,1.59130859375,13.69140859375,1.59130859375,12.80650859375L1.59130859375,3.19347859375C1.59130859375,2.89852859375,1.83041459375,2.65942859375,2.12536659375,2.65942859375C2.4203185937500002,2.65942859375,2.65942859375,2.89852859375,2.65942859375,3.19347859375L2.65942859375,12.80650859375C2.65942859375,13.10150859375,2.89852859375,13.34060859375,3.19347859375,13.34060859375L12.80650859375,13.34060859375C13.10150859375,13.34060859375,13.34060859375,13.10150859375,13.34060859375,12.80650859375L13.34060859375,3.19347859375C13.34060859375,2.89852859375,13.57970859375,2.65942859375,13.87460859375,2.65942859375ZM9.60216859375,10.40325859375C9.89712859375,10.40325859375,10.13622859375,10.64236859375,10.13622859375,10.93731859375C10.13622859375,11.23226859375,9.89712859375,11.47137859375,9.60216859375,11.47137859375L6.39782859375,11.47137859375C6.10287859375,11.47137859375,5.86376859375,11.23226859375,5.86376859375,10.93731859375C5.86376859375,10.64236859375,6.10287859375,10.40325859375,6.39782859375,10.40325859375L9.60216859375,10.40325859375ZM9.60216859375,7.73296859375C9.89712859375,7.73296859375,10.13622859375,7.97207859375,10.13622859375,8.26702859375C10.13622859375,8.56197859375,9.89712859375,8.80108859375,9.60216859375,8.80108859375L6.39782859375,8.80108859375C6.10287859375,8.80108859375,5.86376859375,8.56197859375,5.86376859375,8.26702859375C5.86376859375,7.97207859375,6.10287859375,7.73296859375,6.39782859375,7.73296859375L9.60216859375,7.73296859375ZM9.60216859375,5.06267859375C9.89712859375,5.06267859375,10.13622859375,5.3017885937500004,10.13622859375,5.59673859375C10.13622859375,5.89168859375,9.89712859375,6.13079859375,9.60216859375,6.13079859375L6.39782859375,6.13079859375C6.10287859375,6.13079859375,5.86376859375,5.89168859375,5.86376859375,5.59673859375C5.86376859375,5.3017885937500004,6.10287859375,5.06267859375,6.39782859375,5.06267859375L9.60216859375,5.06267859375ZM11.20434859375,1.591308975738C11.49929859375,1.591308975738,11.73840859375,1.83041459375,11.73840859375,2.12536659375C11.73840859375,2.4203185937500002,11.49929859375,2.65942859375,11.20434859375,2.65942859375L4.79565859375,2.65942859375C4.50069859375,2.65942859375,4.26159859375,2.4203185937500002,4.26159859375,2.12536659375C4.26159859375,1.83041459375,4.50069859375,1.591308975738,4.79565859375,1.591308975738L11.20434859375,1.591308975738Z" fill="#FFFFFF"/></g></g></svg>
                        </div>
                        <div className="attr">
                            <span>{t('waxberry')}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="16" height="15.953262329101562" viewBox="0 0 16 15.953262329101562"><defs><clipPath id="master_svg0_228_022282"><rect x="0" y="0" width="16" height="15.953262329101562" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_228_022282)"><g><path d="M5.01391419921875,3.532500265625C4.78600419921875,3.304596465625,4.44415419921875,3.304596465625,4.21625419921875,3.532500265625L0.11398219921875,7.520812265625C-0.11392170078125,7.748722265625,-0.11392170078125,8.090572265625,0.11398219921875,8.318482265625L4.10229419921875,12.306792265625C4.33020419921875,12.534702265625,4.67205419921875,12.534702265625,4.89996419921875,12.306792265625C5.12786419921875,12.078892265625,5.12786419921875,11.737032265625,4.89996419921875,11.509132265625L1.36745419921875,7.976622265625L5.01391419921875,4.330163265625C5.12786419921875,4.102259265625,5.12786419921875,3.760404265625,5.01391419921875,3.532500265625ZM9.11618419921875,3.532500265625C8.88827419921875,3.532500265625,8.54642419921875,3.6464522656250002,8.43247419921875,3.988307265625L6.38133419921875,11.737032265625C6.26738419921875,12.078892265625,6.49528419921875,12.306792265625,6.83714419921875,12.420742265625C7.17899419921875,12.534702265625,7.40690419921875,12.306792265625,7.52085419921875,11.964942265625L9.57198419921875,4.216212265625C9.68593419921875,3.988308265625,9.45803419921875,3.646453265625,9.11618419921875,3.532500265625ZM15.83935419921875,7.520812265625L11.85105419921875,3.532500265625C11.62315419921875,3.304596465625,11.28125419921875,3.304596465625,11.05335419921875,3.532500265625C10.82545419921875,3.760404265625,10.82545419921875,4.102259265625,11.05335419921875,4.330163265625L14.58585419921875,7.976622265625L10.93945419921875,11.623082265625C10.71155419921875,11.850982265625,10.71155419921875,12.192842265625,10.93945419921875,12.420742265625C11.16735419921875,12.648652265625,11.50915419921875,12.648652265625,11.73705419921875,12.420742265625L15.72535419921875,8.432432265625C15.953254199218751,8.204522265625,15.953254199218751,7.748722265625,15.83935419921875,7.520812265625Z" fill="#FFFFFF"/></g></g></svg>
                        </div>
                    </div>
                </div> */}
                <div className="publish-info" style={{flexGrow:1}}>
                    <div className="publish-info-title">{t('agentRun.attribute')}</div>
                    <DrawCode waxberryObj={waxberryObj} functionItems={['log','code']}/>
                </div>

            </div>
        );

        return (
            <div className="agentRun-app">
                <Header/>
                <div className="app-content">
                    <Menu menu="home" type="agentRun" fileId={waxberryObj.imgeFileId}/>
                    <div className="app-content-box right_bj">
                        <div className="app-content-box-header">
                            <div className="header-left">
                                <img src={waxberryObj.imgeFileId ? `${globalInitConfig.REACT_APP_API_FS_URL}file/download/${waxberryObj.imgeFileId}` : DefaultPng} width="48" height="48"/>
                                <div className="label">
                                    <span className="name">{waxberryObj.name}</span>
                                    <span className="desc">{waxberryObj.discription}</span>
                                </div>
                            </div>
                            <Popover content={content} arrow={false} placement="leftTop" trigger="click" overlayClassName="infoPopover">
                                <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="24" height="24" viewBox="0 0 24 24"><defs><clipPath id="master_svg0_228_050277"><rect x="0" y="0" width="24" height="24" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_228_050277)"><g><path d="M11.999740234375,0.060546875C5.423740234375,0.060546875,0.083740234375,5.388546875,0.083740234375,11.976546875C0.083740234375,18.564546875,5.423740234375,23.880546875,11.999740234375,23.880546875C18.575740234375,23.880546875,23.915740234375,18.552546875,23.915740234375,11.964546875C23.915740234375,5.376546875,18.587740234375,0.060546875,11.999740234375,0.060546875ZM11.999740234375,22.128546875C6.383740234375,22.128546875,1.835740234375,17.580546875,1.835740234375,11.964546875C1.835740234375,6.348546875,6.383740234375,1.800546875,11.999740234375,1.800546875C17.615740234375,1.800546875,22.163740234375,6.348546875,22.163740234375,11.964546875C22.163740234375,17.580546875,17.615740234375,22.128546875,11.999740234375,22.128546875Z" fill="currentColor" /></g><g><path d="M10.679931640625,7.127453125C10.679931640625,6.779453125,10.799931640625,6.491453125,11.051931640625,6.275453125C11.303932640625,6.059453125,11.615931640625,5.939453125,12.011931640625,5.939453125C12.407931640625,5.939453125,12.731931640625,6.047453125,12.983931640625,6.275453125C13.235931640625001,6.503453125,13.355931640625,6.779453125,13.355931640625,7.127453125C13.355931640625,7.475453125,13.235931640625001,7.763453125,12.983931640625,7.991453125C12.731931640625,8.219453125,12.407931640625,8.339453125,12.023931640625,8.339453125C11.639930640625,8.339453125,11.327931640625,8.219453125,11.075931640625,7.991453125C10.811931640625,7.751453125,10.679931640625,7.463453125,10.679931640625,7.127453125ZM10.859931640625,17.531453125L10.859931640625,9.659453125L13.151931640625,9.659453125L13.151931640625,17.519453125L10.859931640625,17.519453125L10.859931640625,17.531453125Z" fill="currentColor"/></g></g></svg>
                            </Popover>
                        </div>
                        <div className="app-content-div">
                            <div className="app-content-div-left">
                                <div className="newSend" onClick={()=>this.newConversation()}><PlusOutlined/>{this.props.t('agentRun.createConversations')}</div>
                                <div className="historyMessage">
                                    <span className="label">{this.props.t('agentRun.historicalConversations')}</span>
                                    <div className="historyMessageData">
                                        {conversationList.map(item=>(
                                            <div className={conversationId === item.conversationId ? "item-active" : "item"} key={item.conversationId} onClick={()=>this.selectConversation(item.conversationId)}>
                                                <span className="name">{item.conversationName}</span>
                                                <svg onClick={(e)=>this.deleteConversation(e,item)} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="14" height="14" viewBox="0 0 14 14"><defs><clipPath id="master_svg0_385_97474"><rect x="0" y="0" width="14" height="14" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_385_97474)"><g><path d="M10.65873779296875,5.180328125L10.31402779296875,11.710608125C10.30134779296875,11.950528125,10.103167792968751,12.138528125,9.862887792968749,12.138528125L4.1371077929687505,12.138528125C3.8968277929687503,12.138528125,3.69864779296875,11.950528125,3.68596779296875,11.710608125L3.34125779296875,5.180328125C3.32813779296875,4.931168125,3.51943779296875,4.718538125,3.76857779296875,4.705358125C4.01888779296875,4.6932881250000005,4.230417792968749,4.883588125,4.24353779296875,5.132688125L4.56563779296875,11.235048125L9.43436779296875,11.235048125L9.756467792968749,5.132688125C9.76969779296875,4.8834881249999995,9.983767792968749,4.694058125,10.23142779296875,4.705358125C10.48055779296875,4.718548125,10.67185779296875,4.931168125,10.65873779296875,5.180328125ZM11.85625779296875,3.6683081250000003C11.85625779296875,3.917788125,11.65398779296875,4.120058125,11.40450779296875,4.120058125L2.59548579296875,4.120058125C2.34600479296875,4.120058125,2.14373779296875,3.917788125,2.14373779296875,3.6683081250000003C2.14373779296875,3.418828125,2.34600479296875,3.2165581249999997,2.59548579296875,3.2165581249999997L5.0800777929687495,3.2165581249999997L5.08008779296875,2.200142125C5.08008779296875,1.981819125,5.22566779296875,1.861328125,5.4439777929687505,1.861328125L8.55590779296875,1.861328125C8.77422779296875,1.861328125,8.91990779296875,1.981819125,8.91990779296875,2.200142125L8.91990779296875,3.2165681250000002L11.40450779296875,3.2165681250000002C11.65398779296875,3.2165681250000002,11.85625779296875,3.4188381249999997,11.85625779296875,3.6683081250000003ZM5.8706377929687505,3.2165681250000002L8.12935779296875,3.2165681250000002L8.12935779296875,2.651890125L5.8706377929687505,2.651890125L5.8706377929687505,3.2165681250000002ZM6.06004779296875,10.557428125C6.06319779296875,10.557428125,6.06632779296875,10.557428125,6.069537792968751,10.557428125C6.28779779296875,10.557428125,6.46050779296875,10.347468125,6.45538779296875,10.129208125L6.34051779296875,5.246468125C6.33538779296875,5.028188125,6.15640779296875,4.849878125,5.93603779296875,4.8546781249999995C5.7177677929687505,4.859818125,5.54505779296875,5.037938125,5.55017779296875,5.256198125L5.66504779296875,10.149268125C5.67011779296875,10.364328125,5.84602779296875,10.557428125,6.06004779296875,10.557428125ZM7.92266779296875,10.557428125C8.136637792968749,10.557428125,8.31260779296875,10.375918125,8.31767779296875,10.160858125L8.43254779296875,5.284618125C8.43767779296875,5.066358125,8.264957792968751,4.8826181250000005,8.04668779296875,4.877488125C7.82501779296875,4.874278125,7.64732779296875,5.043788125,7.64220779296875,5.2620081249999995L7.52733779296875,10.142928125C7.52220779296875,10.361198125,7.69492779296875,10.557428125,7.91319779296875,10.557428125C7.91639779296875,10.557428125,7.91953779296875,10.557428125,7.92266779296875,10.557428125Z" fill="currentColor"/></g></g></svg>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="app-content-div-right">
                                <div className="app-content-data">
                                    {messageData.length > 0 ?
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
                                                                    <svg onClick={()=>this.copy(dialogue.reponse)} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="24" height="24" viewBox="0 0 24 24"><defs><clipPath id="master_svg0_140_036157"><rect x="0" y="0" width="24" height="24" rx="4"/></clipPath></defs><g clipPath="url(#master_svg0_140_036157)"><g><path d="M14.33519,7.66667C14.88759,7.66667,15.33541,8.11438,15.33541,8.66667L15.33541,18C15.33541,18.552300000000002,14.88759,19,14.33519,19L7.0002200000000006,19C6.447815,19,6,18.552300000000002,6,18L6,8.66667C5.999999880764,8.11438,6.447815,7.66667,7.0002200000000006,7.66667L14.33519,7.66667ZM14.00178,9L7.33363,9L7.33363,17.6667L14.00178,17.6667L14.00178,9ZM16.9998,5.000000178814C17.5152,4.999681234,17.9465,5.391043,17.996000000000002,5.904L18,6L18,14.99533C17.9996,15.3481,17.7245,15.6394,17.3723,15.6601C17.0201,15.6808,16.712699999999998,15.4236,16.671,15.0733L16.6664,14.99533L16.6664,6.33333L10.00089,6.33333C9.66283,6.33329,9.37829,6.08033,9.33874,5.744667L9.33407,5.666667C9.33412,5.328684,9.58714,5.044211,9.92287,5.00466675L10.00089,5.000000178814L16.9998,5.000000178814Z" fill="var(--text-color1)"/></g></g></svg>
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
                                        </div> :
                                        <div className="agentExtend">
                                            <img src={waxberryObj.imgeFileId ? `${globalInitConfig.REACT_APP_API_FS_URL}file/download/${waxberryObj.imgeFileId}` : DefaultPng} width="90" height="90"/>
                                            <span className="agentName">{waxberryObj.name}</span>
                                            <span className="prologue" onClick={()=> this.updateMessage(agentSupplementaryInfo.prologue)}>{agentSupplementaryInfo.prologue}</span>
                                            {agentSupplementaryInfo.recommendedQuestionOne && <span className="recommendedQuestion" onClick={()=> this.updateMessage(agentSupplementaryInfo.recommendedQuestionOne)}>{agentSupplementaryInfo.recommendedQuestionOne}</span> }
                                            {agentSupplementaryInfo.recommendedQuestionTwo && <span className="recommendedQuestion" onClick={()=> this.updateMessage(agentSupplementaryInfo.recommendedQuestionTwo)}>{agentSupplementaryInfo.recommendedQuestionTwo}</span> }
                                            {agentSupplementaryInfo.recommendedQuestionThree && <span className="recommendedQuestion" onClick={()=> this.updateMessage(agentSupplementaryInfo.recommendedQuestionThree)}>{agentSupplementaryInfo.recommendedQuestionThree}</span> }
                                        </div>
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
                                            <input style={{display: 'none'}} ref={node => this.fileUpload = node} type="file" multiple accept=".pdf,.txt,.csv,.docx,.doc,.xlsx,.xls,.pptx,.ppt,.md,.mobi,.epub,.py,.java,.js,.ts,.cpp,.h,.hpp,.html,.css,.php,.rb,.pl,.sh,.bash,.swift,.kt,.go,.dart,.scala,.css,.xml,.vue,.json,.yaml,.yml,.xml,.env,.ini,.toml,.plist,.feature,.bat,.md,.cmd,.ps1,.vbs,.vmc,.vbox,.dockerfile,.proto,.lua,.mod,.sum,.png,.jpeg,.jpg,.webp" onChange={this.handleFileUpload.bind(this,"file")}/>
                                            <input style={{display: 'none'}} ref={node => this.imageUpload = node} type="file" multiple accept="image/*" onChange={this.handleFileUpload.bind(this,"image")}/>
                                            {fileList.length>0 && <FileListV2 fileList={fileList} closeFunction={(index)=>this.closeFunction(index)} onClickFunction={(fileName)=>this.fileClickFunction(fileName)}/>}
                                            {insertTableData.length>0 && <ExtraDialogue
                                                tablesData={insertTableData}
                                                handleTableChange={(data)=>this.setState({insertTableData:data})}
                                                tableMdChange={(data)=>this.setState({insertTableMd:data})}
                                            />}
                                            <TextArea
                                                value={message}
                                                placeholder="请输入你的问题，支持上传文件内容进行提问"
                                                onChange={(e)=>this.handleChange(e)}
                                                autoSize={{ minRows: 1, maxRows: 8 }}
                                                // onPressEnter={()=> this.send()}
                                            />
                                            <div className="operate">
                                                <div className="link">
                                                    <svg onClick={()=> this.fileUpload.click()}  xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="24" height="24" viewBox="0 0 24 24"><defs><clipPath id="master_svg0_323_071428"><rect x="24" y="0" width="24" height="24" rx="0"/></clipPath></defs><g transform="matrix(-1,0,0,1,48,0)" clipPath="url(#master_svg0_323_071428)"><g transform="matrix(0.7384299635887146,-0.6743301749229431,0.6743301749229431,0.7384299635887146,-1.5584574058884755,18.442791270619637)"><path d="M39.413321826171874,13.877295126953126C38.69382182617188,13.079195126953126,37.714321826171876,12.633075126953125,36.693721826171874,12.635125126953126L36.689721826171876,12.635125126953126C35.673021826171876,12.633075126953125,34.695421826171874,13.077145126953125,33.97792182617187,13.871155126953125L33.97592182617188,13.873205126953124L26.892291826171874,21.674155126953124C26.233391826171875,22.402655126953125,26.037871826171873,23.495455126953125,26.395681826171874,24.444955126953126C26.753481826171875,25.394555126953126,27.596161826171876,26.012555126953124,28.530741826171877,26.010555126953125C29.121211826171873,26.010555126953125,29.709731826171875,25.764955126953126,30.157461826171875,25.269755126953125L37.24112182617188,17.468765126953123C37.542221826171875,17.137245126953125,37.542221826171875,16.601075126953127,37.24112182617188,16.269565126953125C36.94002182617187,15.938045126953124,36.45322182617188,15.938045126953124,36.15212182617188,16.269565126953125L29.070381826171875,24.070555126953124C28.925691826171875,24.228055126953123,28.730171826171876,24.316055126953124,28.526831826171875,24.316055126953124C28.323491826171875,24.316055126953124,28.127971826171876,24.226055126953124,27.985251826171876,24.066455126953123C27.838611826171874,23.910855126953123,27.756491826171874,23.696055126953127,27.754531826171874,23.470955126953125C27.754531826171874,23.245755126953124,27.834701826171873,23.030955126953124,27.979381826171874,22.873355126953125L35.06302182617188,15.072405126953125C35.493221826171876,14.595585126953125,36.07972182617188,14.329555126953124,36.689721826171876,14.331605126953125L36.69172182617187,14.331605126953125C37.30372182617187,14.329555126953124,37.89222182617188,14.599685126953124,38.324321826171875,15.076495126953125C38.760321826171875,15.555355126953124,39.00082182617187,16.195885126953126,39.00082182617187,16.873255126953126C39.00272182617188,17.546525126953124,38.760321826171875,18.193195126953125,38.32822182617188,18.667965126953124L36.41602182617187,20.773725126953124L36.40432182617187,20.786005126953125L31.103781826171875,26.626455126953125C29.600231826171875,28.279955126953126,27.164061826171874,28.282055126953125,25.658571826171876,26.628555126953124C24.935151826171875,25.834555126953127,24.530421826171874,24.756055126953125,24.534331826171876,23.632555126953125C24.534331826171876,22.498855126953124,24.935151826171875,21.432655126953126,25.662481826171874,20.632525126953126L32.884961826171875,12.678095126953124C33.186021826171874,12.346575126953125,33.186021826171874,11.810415126953124,32.884961826171875,11.478895126953125C32.583861826171876,11.147375226953125,32.09701182617187,11.147375226953125,31.795921826171877,11.478895126953125L24.573441826171877,19.433325126953125C23.558692826171875,20.544525126953125,22.989731936171875,22.056855126953124,22.993642262371875,23.632555126953125C22.993642262371875,25.218555126953127,23.552826826171874,26.710355126953125,24.569531826171875,27.827755126953125C25.578411826171873,28.940955126953124,26.948991826171873,29.565155126953126,28.378241826171873,29.561055126953125C29.809441826171877,29.563055126953124,31.181991826171874,28.938955126953125,32.19282182617187,27.823655126953124L39.68312182617187,19.574525126953127C39.75742182617188,19.490625126953127,39.81612182617188,19.390345126953125,39.853221826171875,19.281885126953124C40.299021826171874,18.577915126953126,40.54152182617187,17.747075126953124,40.54152182617187,16.871205126953125C40.54342182617188,15.747725126953124,40.13672182617188,14.669255126953125,39.413321826171874,13.877295126953126Z" fill="currentColor"/></g></g></svg>
                                                    <svg onClick={()=> this.imageUpload.click()} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="24" height="24" viewBox="0 0 24 24"><defs><clipPath id="master_svg0_323_071430"><rect x="0" y="0" width="24" height="24" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_323_071430)"><g><path d="M21.25006103515625,3.75L21.25006103515625,20.25L3.25006103515625,20.25L3.25006103515625,3.75L21.25006103515625,3.75ZM17.33456103515625,12.3375L12.26256103515625,16.558500000000002L8.96806103515625,13.9595L4.75006103515625,17.3705L4.75006103515625,18.75L19.75006103515625,18.75L19.75006103515625,14.341L17.33456103515625,12.3375ZM19.75006103515625,5.25L4.75006103515625,5.25L4.75006103515625,15.4415L8.95656103515625,12.04L12.23706103515625,14.628L17.33356103515625,10.388L19.75006103515625,12.392L19.75006103515625,5.25ZM9.50006103515625,6.25C10.74270103515625,6.25,11.75006103515625,7.25736,11.75006103515625,8.5C11.75006103515625,9.74264,10.74270103515625,10.75,9.50006103515625,10.75C8.25742103515625,10.75,7.25006103515625,9.74264,7.25006103515625,8.5C7.25006103515625,7.25736,8.25742103515625,6.25,9.50006103515625,6.25ZM9.50006103515625,7.75C9.08585103515625,7.75,8.75006103515625,8.08579,8.75006103515625,8.5C8.75006103515625,8.91421,9.08585103515625,9.25,9.50006103515625,9.25C9.91427103515625,9.25,10.25006103515625,8.91421,10.25006103515625,8.5C10.25006103515625,8.08579,9.91427103515625,7.75,9.50006103515625,7.75Z" fill="currentColor"/></g></g></svg>
                                                    {/*<Voice onVoiceInput={this.handleVoiceInput.bind(this)} />*/}
                                                    <svg onClick={()=>this.setState({showTableModal:true})} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="24" height="24" viewBox="0 0 24 24"><defs><clipPath id="master_svg0_323_071434"><rect x="0" y="0" width="24" height="24" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_323_071434)"><g><g><path d="M21.234611376953126,18.7876916015625L21.234611376953126,5.2123506015625Q21.234611376953126,4.5502466015625,20.766411376953126,4.0820716015625Q20.298211376953127,3.6138916015625,19.636111376953124,3.6138916015625L4.363870376953125,3.6138916015625Q3.701766376953125,3.6138916015625,3.233589376953125,4.0820696015625Q2.765411376953125,4.5502466015625,2.765411376953125,5.2123506015625L2.765411376953125,18.7876916015625Q2.765411376953125,19.449791601562502,3.233592376953125,19.9179916015625Q3.701766376953125,20.3861916015625,4.363870376953125,20.3861916015625L19.636111376953124,20.3861916015625Q20.298211376953127,20.3861916015625,20.766411376953126,19.9179916015625Q21.234611376953126,19.449791601562502,21.234611376953126,18.7876916015625ZM19.636111376953124,5.1138916015625Q19.734611376953126,5.1138916015625,19.734611376953126,5.2123506015625L19.734611376953126,18.7876916015625Q19.734611376953126,18.8861916015625,19.636111376953124,18.8861916015625L4.363870376953125,18.8861916015625Q4.265411376953125,18.8861916015625,4.265411376953125,18.7876916015625L4.265411376953125,5.2123506015625Q4.265411376953125,5.1138916015625,4.363870376953125,5.1138916015625L19.636111376953124,5.1138916015625Z" fill="currentColor"/></g><g><path d="M3.515411376953125,8.704645156860352L20.484611376953126,8.704645156860352Q20.558411376953124,8.704645156860352,20.630911376953126,8.71905615686035Q20.703311376953124,8.733467156860351,20.771611376953125,8.761735156860352Q20.839811376953126,8.790004156860352,20.901311376953124,8.831043156860352Q20.962711376953123,8.872082156860351,21.014911376953126,8.924315156860352Q21.067111376953125,8.976548156860352,21.108211376953125,9.037967156860352Q21.149211376953126,9.099387156860352,21.177511376953124,9.167632156860352Q21.205811376953125,9.235878156860352,21.220211376953124,9.30832715686035Q21.234611376953126,9.380776656860352,21.234611376953126,9.454645156860352Q21.234611376953126,9.528513656860351,21.220211376953124,9.600963156860352Q21.205811376953125,9.673412156860351,21.177511376953124,9.741658156860352Q21.149211376953126,9.80990315686035,21.108211376953125,9.87132315686035Q21.067111376953125,9.932742156860352,21.014911376953126,9.98497515686035Q20.962711376953123,10.037208156860352,20.901311376953124,10.078247156860352Q20.839811376953126,10.119286156860351,20.771611376953125,10.147555156860351Q20.703311376953124,10.175823156860352,20.630911376953126,10.190234156860352Q20.558411376953124,10.204645156860352,20.484611376953126,10.204645156860352L3.515411376953125,10.204645156860352Q3.441542876953125,10.204645156860352,3.369093376953125,10.190234156860352Q3.296644376953125,10.175823156860352,3.228398376953125,10.147555156860351Q3.160153376953125,10.119286156860351,3.098733376953125,10.078247156860352Q3.037314376953125,10.037208156860352,2.985081376953125,9.98497515686035Q2.932848376953125,9.932742156860352,2.891809376953125,9.87132315686035Q2.850770376953125,9.80990315686035,2.822501376953125,9.741658156860352Q2.794233376953125,9.673412156860351,2.779822376953125,9.600963156860352Q2.765411376953125,9.528513656860351,2.765411376953125,9.454645156860352Q2.765411376953125,9.380776656860352,2.779822376953125,9.30832715686035Q2.794233376953125,9.235878156860352,2.822501376953125,9.167632156860352Q2.850770376953125,9.099387156860352,2.891809376953125,9.037967156860352Q2.932848376953125,8.976548156860352,2.985081376953125,8.924315156860352Q3.037314376953125,8.872082156860351,3.098733376953125,8.831043156860352Q3.160153376953125,8.790004156860352,3.228398376953125,8.761735156860352Q3.296644376953125,8.733467156860351,3.369093376953125,8.71905615686035Q3.441542876953125,8.704645156860352,3.515411376953125,8.704645156860352Z" fill="currentColor"/></g><g><path d="M8.49250841140747,9.454645156860352Q8.49250841140747,9.380776656860352,8.50691941140747,9.30832715686035Q8.52133041140747,9.235878156860352,8.549598411407471,9.167632156860352Q8.577867411407471,9.099387156860352,8.61890641140747,9.037967156860352Q8.65994541140747,8.976548156860352,8.712178411407471,8.924315156860352Q8.76441141140747,8.872082156860351,8.825830411407471,8.831043156860352Q8.887250411407472,8.790004156860352,8.95549541140747,8.761735156860352Q9.023741411407471,8.733467156860351,9.09619041140747,8.71905615686035Q9.168639911407471,8.704645156860352,9.24250841140747,8.704645156860352Q9.31637691140747,8.704645156860352,9.388826411407472,8.71905615686035Q9.46127541140747,8.733467156860351,9.52952141140747,8.761735156860352Q9.59776641140747,8.790004156860352,9.65918641140747,8.831043156860352Q9.72060541140747,8.872082156860351,9.77283841140747,8.924315156860352Q9.825071411407471,8.976548156860352,9.86611041140747,9.037967156860352Q9.90714941140747,9.099387156860352,9.93541841140747,9.167632156860352Q9.96368641140747,9.235878156860352,9.978097411407472,9.30832715686035Q9.99250841140747,9.380776656860352,9.99250841140747,9.454645156860352L9.99250841140747,19.63614515686035Q9.99250841140747,19.710045156860353,9.978097411407472,19.78244515686035Q9.96368641140747,19.854945156860353,9.93541841140747,19.92314515686035Q9.90714941140747,19.99144515686035,9.86611041140747,20.05284515686035Q9.825071411407471,20.11424515686035,9.77283841140747,20.16644515686035Q9.72060541140747,20.21874515686035,9.65918641140747,20.25974515686035Q9.59776641140747,20.30074515686035,9.52952141140747,20.329045156860353Q9.46127541140747,20.35734515686035,9.388826411407472,20.37174515686035Q9.31637691140747,20.38614515686035,9.24250841140747,20.38614515686035Q9.168639911407471,20.38614515686035,9.09619041140747,20.37174515686035Q9.023741411407471,20.35734515686035,8.95549541140747,20.329045156860353Q8.887250411407472,20.30074515686035,8.825830411407471,20.25974515686035Q8.76441141140747,20.21874515686035,8.712178411407471,20.16644515686035Q8.65994541140747,20.11424515686035,8.61890641140747,20.05284515686035Q8.577867411407471,19.99144515686035,8.549598411407471,19.92314515686035Q8.52133041140747,19.854945156860353,8.50691941140747,19.78244515686035Q8.49250841140747,19.710045156860353,8.49250841140747,19.63614515686035L8.49250841140747,9.454645156860352Z" fill="currentColor"/></g><g><path d="M14.007491111755371,9.454645156860352Q14.007491111755371,9.380776656860352,14.02190211175537,9.30832715686035Q14.036313111755371,9.235878156860352,14.064581111755372,9.167632156860352Q14.092850111755372,9.099387156860352,14.133889111755371,9.037967156860352Q14.17492811175537,8.976548156860352,14.227161111755372,8.924315156860352Q14.279394111755371,8.872082156860351,14.340813111755372,8.831043156860352Q14.402233111755372,8.790004156860352,14.470478111755371,8.761735156860352Q14.538724111755371,8.733467156860351,14.61117311175537,8.71905615686035Q14.683622611755371,8.704645156860352,14.757491111755371,8.704645156860352Q14.83135961175537,8.704645156860352,14.903809111755372,8.71905615686035Q14.97625811175537,8.733467156860351,15.044504111755371,8.761735156860352Q15.11274911175537,8.790004156860352,15.17416911175537,8.831043156860352Q15.235588111755371,8.872082156860351,15.28782111175537,8.924315156860352Q15.340054111755371,8.976548156860352,15.381093111755371,9.037967156860352Q15.42213211175537,9.099387156860352,15.45040111175537,9.167632156860352Q15.478669111755371,9.235878156860352,15.493080111755372,9.30832715686035Q15.507491111755371,9.380776656860352,15.507491111755371,9.454645156860352L15.507491111755371,19.63614515686035Q15.507491111755371,19.710045156860353,15.493080111755372,19.78244515686035Q15.478669111755371,19.854945156860353,15.45040111175537,19.92314515686035Q15.42213211175537,19.99144515686035,15.381093111755371,20.05284515686035Q15.340054111755371,20.11424515686035,15.28782111175537,20.16644515686035Q15.235588111755371,20.21874515686035,15.17416911175537,20.25974515686035Q15.11274911175537,20.30074515686035,15.044504111755371,20.329045156860353Q14.97625811175537,20.35734515686035,14.903809111755372,20.37174515686035Q14.83135961175537,20.38614515686035,14.757491111755371,20.38614515686035Q14.683622611755371,20.38614515686035,14.61117311175537,20.37174515686035Q14.538724111755371,20.35734515686035,14.470478111755371,20.329045156860353Q14.402233111755372,20.30074515686035,14.340813111755372,20.25974515686035Q14.279394111755371,20.21874515686035,14.227161111755372,20.16644515686035Q14.17492811175537,20.11424515686035,14.133889111755371,20.05284515686035Q14.092850111755372,19.99144515686035,14.064581111755372,19.92314515686035Q14.036313111755371,19.854945156860353,14.02190211175537,19.78244515686035Q14.007491111755371,19.710045156860353,14.007491111755371,19.63614515686035L14.007491111755371,9.454645156860352Z" fill="currentColor"/></g><g><path d="M3.515411376953125,13.795398712158203L20.484611376953126,13.795398712158203Q20.558411376953124,13.795398712158203,20.630911376953126,13.809809712158202Q20.703311376953124,13.824220712158203,20.771611376953125,13.852488712158204Q20.839811376953126,13.880757712158204,20.901311376953124,13.921796712158203Q20.962711376953123,13.962835712158203,21.014911376953126,14.015068712158204Q21.067111376953125,14.067301712158203,21.108211376953125,14.128720712158204Q21.149211376953126,14.190140712158204,21.177511376953124,14.258385712158203Q21.205811376953125,14.326631712158203,21.220211376953124,14.399080712158202Q21.234611376953126,14.471530212158203,21.234611376953126,14.545398712158203Q21.234611376953126,14.619267212158203,21.220211376953124,14.691716712158204Q21.205811376953125,14.764165712158203,21.177511376953124,14.832411712158203Q21.149211376953126,14.900656712158202,21.108211376953125,14.962076712158202Q21.067111376953125,15.023495712158203,21.014911376953126,15.075728712158202Q20.962711376953123,15.127961712158204,20.901311376953124,15.169000712158203Q20.839811376953126,15.210039712158203,20.771611376953125,15.238308712158203Q20.703311376953124,15.266576712158203,20.630911376953126,15.280987712158204Q20.558411376953124,15.295398712158203,20.484611376953126,15.295398712158203L3.515411376953125,15.295398712158203Q3.441542876953125,15.295398712158203,3.369093376953125,15.280987712158204Q3.296644376953125,15.266576712158203,3.228398376953125,15.238308712158203Q3.160153376953125,15.210039712158203,3.098733376953125,15.169000712158203Q3.037314376953125,15.127961712158204,2.985081376953125,15.075728712158202Q2.932848376953125,15.023495712158203,2.891809376953125,14.962076712158202Q2.850770376953125,14.900656712158202,2.822501376953125,14.832411712158203Q2.794233376953125,14.764165712158203,2.779822376953125,14.691716712158204Q2.765411376953125,14.619267212158203,2.765411376953125,14.545398712158203Q2.765411376953125,14.471530212158203,2.779822376953125,14.399080712158202Q2.794233376953125,14.326631712158203,2.822501376953125,14.258385712158203Q2.850770376953125,14.190140712158204,2.891809376953125,14.128720712158204Q2.932848376953125,14.067301712158203,2.985081376953125,14.015068712158204Q3.037314376953125,13.962835712158203,3.098733376953125,13.921796712158203Q3.160153376953125,13.880757712158204,3.228398376953125,13.852488712158204Q3.296644376953125,13.824220712158203,3.369093376953125,13.809809712158202Q3.441542876953125,13.795398712158203,3.515411376953125,13.795398712158203Z" fill="currentColor"/></g><g><path d="M4.265411376953125,5.212649497709045L4.265411376953125,18.787650487709044Q4.265411376953125,18.886150487709045,4.363870376953125,18.886150487709045L19.636111376953124,18.886150487709045Q19.734611376953126,18.886150487709045,19.734611376953126,18.787650487709044L19.734611376953126,5.212350487709045Q19.734611376953126,5.138481987709046,19.749011376953124,5.0660324877090455Q19.763411376953126,4.993583487709046,19.791711376953124,4.9253374877090454Q19.819911376953126,4.857092487709045,19.861011376953126,4.795672487709045Q19.902011376953126,4.734253487709045,19.954211376953126,4.682020487709045Q20.006511376953124,4.629787487709045,20.067911376953123,4.588748487709045Q20.129311376953126,4.547709487709046,20.197611376953127,4.519440487709045Q20.265811376953124,4.491172487709045,20.338311376953126,4.476761487709045Q20.410711376953124,4.462350487709045,20.484611376953126,4.462350487709045Q20.558411376953124,4.462350487709045,20.630911376953126,4.476761487709045Q20.703311376953124,4.491172487709045,20.771611376953125,4.519440487709045Q20.839811376953126,4.547709487709046,20.901311376953124,4.588748487709045Q20.962711376953123,4.629787487709045,21.014911376953126,4.682020487709045Q21.067111376953125,4.734253487709045,21.108211376953125,4.795672487709045Q21.149211376953126,4.857092487709045,21.177511376953124,4.9253374877090454Q21.205811376953125,4.993583487709046,21.220211376953124,5.0660324877090455Q21.234611376953126,5.138481987709046,21.234611376953126,5.212350487709045L21.234611376953126,18.787650487709044Q21.234611376953126,19.449850487709046,20.766411376953126,19.917950487709046Q20.298211376953127,20.386150487709045,19.636111376953124,20.386150487709045L4.363870376953125,20.386150487709045Q3.701767376953125,20.386150487709045,3.233591376953125,19.917950487709046Q2.765411376953125,19.449850487709046,2.765411376953125,18.787650487709044L2.765411376953125,5.212350487709045Q2.765411376953125,5.138481987709046,2.779822376953125,5.0660324877090455Q2.794233376953125,4.993583487709046,2.822501376953125,4.9253374877090454Q2.850770376953125,4.857092487709045,2.891809376953125,4.795672487709045Q2.932848376953125,4.734253487709045,2.985081376953125,4.682020487709045Q3.037314376953125,4.629787487709045,3.098733376953125,4.588748487709045Q3.160153376953125,4.547709487709046,3.228398376953125,4.519440487709045Q3.296644376953125,4.491172487709045,3.369093376953125,4.476761487709045Q3.441542876953125,4.462350487709045,3.515411376953125,4.462350487709045Q3.589279876953125,4.462350487709045,3.661729376953125,4.476761487709045Q3.734178376953125,4.491172487709045,3.802424376953125,4.519440487709045Q3.870669376953125,4.547709487709046,3.932089376953125,4.588748487709045Q3.993508376953125,4.629787487709045,4.045741376953125,4.682020487709045Q4.097974376953125,4.734253487709045,4.139013376953125,4.795672487709045Q4.180052376953125,4.857092487709045,4.208321376953125,4.9253374877090454Q4.236589376953125,4.993583487709046,4.251000376953125,5.0660324877090455Q4.265411376953125,5.138481987709046,4.265411376953125,5.212350487709045L4.265411376953125,5.212649497709045Z" fill="currentColor"/></g></g></g></svg>
                                                    <svg onClick={()=>this.setState({showFormulaModal:true})} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="24" height="24" viewBox="0 0 24 24"><defs><clipPath id="master_svg0_323_071432"><rect x="0" y="0" width="24" height="24" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_323_071432)"><g><path d="M3.6429491015625,15.218025L2.2541808015625,15.237225L2.2310791015625,13.409815L4.8202491015625,13.374175L5.487539101562501,15.018825L8.2606291015625,3.640625L21.7786791015625,3.640625L21.7786791015625,5.468005L9.644959101562499,5.468005L5.9078091015625,20.807025L3.6429491015625,15.218025ZM10.4552991015625,19.447525L13.5100791015625,14.123425L10.5450391015625,8.284005L18.6190791015625,8.284005L19.7403791015625,11.025075000000001L18.1028791015625,11.733185L17.4390791015625,10.107735L13.4762791015625,10.107735L15.5412791015625,14.172725L13.5651791015625,17.620125L17.4595791015625,17.620125L18.1143791015625,16.147225L19.7288791015625,16.907425L18.5995791015625,19.447525L10.4552991015625,19.447525Z" fill="currentColor"/></g></g></svg>
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
                            </div>
                        </div>
                    </div>
                </div>
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
export default withTranslation()(AgentRun);
