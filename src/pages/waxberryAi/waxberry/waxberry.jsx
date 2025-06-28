import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import Header from '../components/header/index';
import Menu from '../components/menu/index';
import { CodeEditor,isTextFile } from '@components/CodeEditor';
import MarkdownRenderer from '@components/MarkdownRenderer';
import FileList from "../components/fileList/fileList";
import FileListV2 from "../components/fileList/fileList-V2";
import Voice from '@components/Voice/index';
import FormulaModal from "../components/formulaModal/formulaModal";
import TableModal from "../components/tableModal/tableModal";
import ExtraDialogue from "../components/extraDialogue/extraDialogue";
import CustomUpload from "@components/CustomUpload";

import axios from 'axios';
import Qs from 'qs';
import { Base64 } from 'js-base64';

import { Input,Tooltip,Popover,Select,Switch,message as Message,Cascader,Tree,Spin,Progress,Timeline } from 'antd';
import { FileTextOutlined,FolderOutlined,DownOutlined,LoadingOutlined,CaretRightFilled,CloseOutlined,RightOutlined,EyeOutlined } from '@ant-design/icons';
import { withTranslation } from 'react-i18next';
import DrawCode from '../components/drawCode/drawCode';
import ModelSvg from './../img/model.svg';
import DefaultPng from '../img/default.png';
import AiSvg from '../img/ai.svg';
import CardDefaultPng from '../img/cardDefault.png';
import TaskStatus1 from './../img/taskStatus1.png';
import TaskStatus2 from './../img/taskStatus2.gif';
import TaskStatus3 from './../img/taskStatus3.png';

import './waxberry.scss';

const urlObj = Qs.parse(window.location.search.split('?')[1]);
const TreeNode = Tree.TreeNode;
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
let isComplete = false;
let docketIp = globalInitConfig.REACT_APP_API_SBX_IP_URL;
let langChainHttp = globalInitConfig.REACT_APP_API_CORE_URL;

class Waxberry extends Component {
    constructor(props) {
        super(props);
        this.childRef = React.createRef();
        this.state = {
            message: "",
            messageObj: {},
            messageData: [],
            isExecuting: false,
            selectMenu: "task",
            right_full: false,
            waxberryObj: {},
            agentMenuList: [],
            codeTreeData: [],
            codeData: "",
            codeLogs: "",
            expandedKeys: [],
            selectedKeys: [],
            monacoLanguage: '',
            showWaxberryModal: false,
            popoverVisible: false,
            fileList: [],
            inputFileOptions: [],
            inputFileOpen: false,
            spinning: false,
            iconSpinning1: false,
            iconSpinning2: false,
            detailSpinning: false,
            eventSourceCfg:null,
            stopSign:0,
            requireInform:{
                shouldRequireTree:true,
                shouldRequireCode:false
            },
            insertTableData: []
        };
    }

    componentWillMount() {
        this.getAgentMenuList();
    }

    componentDidMount() {

        if(urlObj.step){
            this.nextInit();
        }else if(urlObj.id){
            isComplete = true;
            this.initData(urlObj.id);
        }else{
            this.newSend("新建的纳豆");
        }

        window.addEventListener('beforeunload', function (event) {
            const msg = '您确定要离开此页面吗？未保存的更改可能会丢失。';
            event.returnValue = msg;
            return msg;
        });


        this.messageScroll();

    }

    componentWillUnmount() {
        // 在组件卸载时销毁 SSE 连接
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }
    }

    nextInit() {
        //获取纳豆
        axios.get(`${globalInitConfig.REACT_APP_API_BASE_URL}mgr/agent/agent/findById?id=${urlObj.id}`).then(r1=>{
            if(r1.data.code === 200){
                let waxberryObj = r1.data.data;
                this.setState({
                    waxberryObj
                });
                //添加会话
                let params = {
                    "id": waxberryObj.vesselId,
                    "title": "需求分析已完成 ,我将开始实施",
                    "chatType": "8"
                };
                axios.post(globalInitConfig.REACT_APP_API_BASE_URL + "mgr/conversation/add", params).then(res=>{
                    if(res.data.code === 200){
                        let obj = res.data.data;
                        this.setState({
                            messageObj: obj,
                            isExecuting: true,
                            messageData: [{
                                "query": "需求分析已完成 ,我将开始实施",
                                "reponse": "",
                                "reponseFileId": "",
                                "fileList": []
                            }]
                        },()=>{
                            window.history.replaceState({}, '', `/waxberry?id=${waxberryObj.id}`);
                            this.nextFetch();
                        });
                        axios.post(`${globalInitConfig.REACT_APP_API_BASE_URL}mgr/agent/agentConversationRelation/add`, {
                            "agentId": waxberryObj.id,
                            "conversationId": obj.id,
                            "conversationType": 2
                        })
                    }
                });
            }
        });
    }

    nextFetch() {
        let messageData = this.state.messageData;
        let waxberryObj = this.state.waxberryObj;
        let that = this;
        let newContent = "";
        const startTime = performance.now(); // 记录开始时间
        let url = `${langChainHttp}/workflow/session/${waxberryObj.vesselId}/next`;

        const eventSourceCfg={
            url,
            requireConfig:{
                method: 'POST',
                openWhenHidden: true,
            },
            eventHook:{
                onmessage(event) {

                    try {
                        if(event.data) {

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
                                        node.scrollTop = node.scrollHeight;
                                    }
                                });
                            }
                        }
                    }catch (e) {
                        console.log(e);
                        that.setState({
                            isExecuting: false
                        });

                    }
                },
                onerror(err) {
                    that.setState({
                        isExecuting: false
                    });

                },
                onclose(close) {
                    const endTime = performance.now(); // 记录结束时间
                    const durationInMilliseconds = endTime - startTime; // 计算持续时间
                    const durationInSeconds = (durationInMilliseconds / 1000).toFixed(2);

                    that.setState({
                        isExecuting: false,
                        waxberryObj:{...that.state.waxberryObj,effect(data){
                                that.setState({
                                    inputFileOptions: data
                                });
                            }},

                    });
                    newContent = newContent || "...";
                    if(newContent.includes("<attempt_completion>")){
                        isComplete = true;
                    }
                    let params = {
                        "conversationId": that.state.messageObj.id,
                        "parentId": "0",
                        "query": "需求分析已完成 ,我将开始实施",
                        "reponse": newContent,
                        "reponseFileId": ""
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
            },

        }
        this.setState({
            eventSourceCfg
        })
    }

    initData(id) {
        //获取纳豆
        axios.get(`${globalInitConfig.REACT_APP_API_BASE_URL}mgr/agent/agent/findById?id=${id}`).then(r1=>{
            if(r1.data.code === 200){
                let waxberryObj = r1.data.data;
                //获取会话
                axios.get(`${globalInitConfig.REACT_APP_API_BASE_URL}mgr/conversation/getConversationById?id=${waxberryObj.vesselId}`).then(r2=>{
                    if(r2.data.code === 200){
                        let messageObj = r2.data.data;
                        //获取聊天记录
                        axios.get(`${globalInitConfig.REACT_APP_API_BASE_URL}mgr/conversation/message/list?pageNo=0&pageSize=1000&conversationId=${messageObj.id}`).then(r3=>{
                            if(r3.data.code === 200){
                                let messageData = r3.data.data.content;
                                this.setState({
                                    waxberryObj,
                                    messageObj,
                                    messageData
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
                    }
                });
            }
        });
    }

    newSend(message) {
        if(!message){
            return;
        }
        axios.post(globalInitConfig.REACT_APP_API_BASE_URL + "mgr/agent/agent/addAgent", {
            name: message.substring(0,20),
            type: 0
        }).then(r=>{
            if(r.data.code === 200){
                let waxberryObj = r.data.data;
                this.setState({
                    waxberryObj
                },()=>{
                    window.history.replaceState({}, '', `/waxberry?id=${waxberryObj.id}`);
                });
                let params = {
                    "id": waxberryObj.vesselId,
                    "title": message.substring(0,500),
                    "chatType": "8"
                };
                axios.post(globalInitConfig.REACT_APP_API_BASE_URL + "mgr/conversation/add", params).then(res=>{
                    if(res.data.code === 200){
                        let obj = res.data.data;
                        this.setState({
                            messageObj: obj
                        });
                        axios.post(`${globalInitConfig.REACT_APP_API_BASE_URL}mgr/agent/agentConversationRelation/add`, {
                            "agentId": waxberryObj.id,
                            "conversationId": obj.id,
                            "conversationType": 2
                        })
                    }
                });
            }else{
                Message.error(r.data.message);
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

    menuChange(key) {
        this.setState({
            selectMenu: key
        },()=>{
            if(key === "code"){
                this.codeResizable();
            }
        })
    }

    toggleFull() {
        this.setState({
            right_full: !this.state.right_full
        },()=>{
            //window.dispatchEvent(new Event('resize'));
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
            if(this.state.waxberryObj.step){
                this.nextFetchData(message,conversationMessage);
            }else {
                this.fetchData(message,conversationMessage);
            }
        });
    }

    fetchData(message,conversationMessage) {
        let that = this;
        let waxberryObj = this.state.waxberryObj;
        let fileList = this.state.fileList;
        let messageData = this.state.messageData;
        let params = {
            functionType: "4",
            functionData: {
                fileId: fileList.filter(file=>file.type==="file").map(file=>file.fileId).join(','),
                pictureId: fileList.filter(file=>file.type==="image").map(file=>file.fileId).join(','),
                waxberryType: 0,
                waxberryId: waxberryObj.id,
                questionData: message,
                containerId: waxberryObj.vesselId,
                waxberryAppPort: waxberryObj.vesselPort,
                conversationMessage
            }
        };
        axios.post(globalInitConfig.REACT_APP_API_BASE_URL + "mgr/commonChat/functionData", params).then(res=>{
            if(res.data.code === 200){
                let query = res.data.data;
                var newContent = "";
                const startTime = performance.now(); // 记录开始时间

                const eventSourceCfg={
                    url:query.url,
                    requireConfig:{
                        method: 'POST',
                        body: JSON.stringify(query.params),
                        openWhenHidden: true
                    },
                    eventHook:{
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
                                                node.scrollTop = node.scrollHeight;
                                            }
                                        });
                                    }
                                }
                            }catch (e) {
                                console.log(e);
                                that.setState({
                                    isExecuting: false
                                });

                            }
                        },
                        onerror(err) {
                            that.setState({
                                isExecuting: false
                            });


                        },
                        onclose(close,waxberryTask) {
                            let fetchWaxberryTask=new Promise(resolve=>resolve(null))
                            newContent = newContent || "...";
                            const endTime = performance.now(); // 记录结束时间
                            const durationInMilliseconds = endTime - startTime; // 计算持续时间
                            const durationInSeconds = (durationInMilliseconds / 1000).toFixed(2);
                            // that.getCodeTree();
                            that.setState({
                                isExecuting: false
                            });
                            if(newContent.includes("<attempt_completion>")){
                                isComplete = true;
                            }

                            // 使用正则表达式匹配 <plan_mode_response>...</plan_mode_response> 的内容
                            const resRegex = /<plan_mode_response>([\s\S]*?)<\/plan_mode_response>/;
                            const resMatch = newContent.match(resRegex);
                            if (resMatch) {
                                const planModeResponseContent = resMatch[1];
                                // 使用正则表达式匹配mermaid内容
                                const regex = /```mermaid\n([\s\S]*?)```/;
                                const match = planModeResponseContent.match(regex);
                                if(!match) return;

                                if(waxberryTask){
                                    waxberryTask.content = match[0];
                                    fetchWaxberryTask =axios.post(globalInitConfig.REACT_APP_API_BASE_URL + "mgr/agent/agentTask/updateAgentTask", waxberryTask).then(res=>{
                                        if(res.data.code === 200) {
                                            // that.setState({
                                            //     waxberryTask
                                            // });
                                            return waxberryTask
                                        }
                                    });
                                }else{
                                    let params ={
                                        name: 'mermaid',
                                        content: match[0],
                                        agentId: waxberryObj.id
                                    };
                                    fetchWaxberryTask =  axios.post(globalInitConfig.REACT_APP_API_BASE_URL + "mgr/agent/agentTask/addAgentTask", params).then(res=>{
                                        if(res.data.code === 200) {
                                            // that.setState({
                                            //     waxberryTask: res.data.data
                                            // });
                                            return res.data.data
                                        }
                                    });
                                }
                            }

                            let params = {
                                "conversationId": that.state.messageObj.id,
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
                            return fetchWaxberryTask
                        }
                    }
                }
                this.setState({
                    eventSourceCfg
                })
            }
        });
    }

    nextFetchData(message,conversationMessage) {
        let that = this;
        let fileList = this.state.fileList;
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
        var newContent = "";
        const startTime = performance.now(); // 记录开始时间
        const eventSourceCfg={
            url,
            requireConfig:{
                method: 'POST',
                body: JSON.stringify(params),
                openWhenHidden: true
            },
            eventHook:{
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
                                        node.scrollTop = node.scrollHeight;
                                    }
                                });
                            }
                        }
                    }catch (e) {
                        console.log(e);
                        that.setState({
                            isExecuting: false
                        });
                    }
                },
                onerror(err) {
                    that.setState({
                        isExecuting: false
                    });
                },
                onclose(close,waxberryTask) {
                    let fetchWaxberryTask = new Promise(resolve=>resolve(null));
                    newContent = newContent || "...";
                    const endTime = performance.now(); // 记录结束时间
                    const durationInMilliseconds = endTime - startTime; // 计算持续时间
                    const durationInSeconds = (durationInMilliseconds / 1000).toFixed(2);
                    that.setState({
                        isExecuting: false
                    });
                    if(newContent.includes("<attempt_completion>")){
                        isComplete = true;
                    }

                    let params = {
                        "conversationId": that.state.messageObj.id,
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
                    return fetchWaxberryTask
                }
            }
        };
        this.setState({
            eventSourceCfg
        })
    }

    stopGenerating() {

        let messageData = this.state.messageData;
        let obj = messageData[messageData.length-1];
        obj.reponse += "...";
        let stopSign = this.state.stopSign;
        stopSign++;
        this.setState({
            isExecuting: false,
            messageData,
            stopSign
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

    visibleChange(visible){
        this.setState({
            popoverVisible: visible
        });
        if(!visible){
            let waxberryObj = this.state.waxberryObj;
            axios.post(globalInitConfig.REACT_APP_API_BASE_URL + 'mgr/agent/agent/updateAgent', waxberryObj).then(res => {
                const data = res.data;
                if (data.code === 200) {
                    Message.success(this.props.t('operationSuccessful'));
                } else {
                    Message.error(data.message);
                }
            });
        }
    }

    run() {
        let waxberryObj = this.state.waxberryObj;
        axios.get(`${globalInitConfig.REACT_APP_API_BASE_URL}mgr/agent/agent/agentRunRecord?vesselId=${waxberryObj.vesselId}`);
        if(waxberryObj.type === 0){
            window.open(globalInitConfig.REACT_APP_RUN_URL.replace('ID',waxberryObj.id.toLowerCase()));
        }
        if(waxberryObj.type === 1){
            window.open(`/agent_run?id=${waxberryObj.id}`);
        }
    }

    getCodeTree(){
        this.setState({
            spinning: true
        });
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

    getCodeData(){
        let { waxberryObj,selectedKeys,selectTreeType } = this.state;
        if(selectedKeys.length===0 || selectTreeType !== "file"){
            return;
        }
        axios.get(`${globalInitConfig.REACT_APP_API_SBX_URL}/sandboxes/${waxberryObj.vesselId}/read_file?path=${selectedKeys[0]}`).then(res => {
            const data = res.data;
            if (data) {
                this.setState({
                    codeData: data
                });
            }
        });
    }

    onKeyPress(e){
        if (e.key === 'Enter') {
            // 阻止回车键的默认换行行为
            e.preventDefault();
        }
    }



    waxberryObjChange(key,value){
        let waxberryObj = this.state.waxberryObj;
        waxberryObj[key] = value;
        this.setState({
            waxberryObj
        });
    }

    moreInfo() {
        this.setState({
            popoverVisible: false
        });
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
        this.getWaxberryDetail();
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

    hideWaxberryModal(){
        this.setState({
            showWaxberryModal: false
        })
    }

    waxberryModalOk(){
        let waxberryObj = this.state.waxberryObj;
        if(!waxberryObj.name || !waxberryObj.discription || !waxberryObj.groupId) {
            Message.warning(this.props.t('message.pleaseCompleteInformationProceeding'));
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
        this.setWaxberryDetail(waxberryObj);
        axios.post(globalInitConfig.REACT_APP_API_BASE_URL + 'mgr/agent/agent/updateAgent', waxberryObj).then(res => {
            const data = res.data;
            if (data.code === 200) {
                this.hideWaxberryModal();
                this.getWaxberryList();
                Message.success(this.props.t('operationSuccessful'));
            } else {
                Message.error(data.message);
            }
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

    codeResizable() {
        let drag = document.getElementById('codeDrag');
        let resizable = document.getElementById('codeDragDiv');
        let isResizing = false;
        let startX;
        let startWidth;
        drag.addEventListener('mousedown', (e) => {
            isResizing = true;
            startX = e.clientX;
            startWidth = resizable.offsetWidth;

            function onMouseMove(e) {
                if (!isResizing) return;
                const deltaX = startX - e.clientX;
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
                        that.setState({
                            fileList,
                            waxberryObj:{...that.state.waxberryObj,effect(data){
                                    that.setState({
                                        inputFileOptions: data
                                    });
                                }},
                            requireInform:{...that.state.requireInform}
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

    inputFileChange(value, selectedOptions) {
        let message = this.state.message;
        let node = selectedOptions[selectedOptions.length-1];
        fileReplace['@'+node.fileName] = value[value.length-1];
        this.setState({
            message: message + node.fileName,
            inputFileOpen: false
        })
    }

    setWaxberryDetail(item){
        let params = {
            path: "/waxberry/README.md",
            content: item.detail
        };
        axios.post(`${globalInitConfig.REACT_APP_API_SBX_URL}/sandboxes/${item.vesselId}/write_file`,params);
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

    closeTreeUpload() {
        this.setState({
            treeUploadFile: undefined
        })
    }

    handleVoiceInput(value){
        this.setState({
            message: value
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

    generate_detail_prompt(){
        this.setState({
            detailSpinning: true
        });
        let waxberryObj = this.state.waxberryObj;
        axios.post(`${langChainHttp}/chat/agent/generate_user_prompt`,{
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
        const { message,selectMenu,messageObj,messageData,isExecuting,right_full,waxberryObj,agentMenuList,codeTreeData,expandedKeys,selectedKeys,selectTreeType,codeData,codeLogs,monacoLanguage,
            showWaxberryModal,popoverVisible,fileList,waxberryTask,inputFileOptions,inputFileOpen,onlinePreviewUrl,treeUploadFile,iconSpinning1,iconSpinning2,requirementContent,workflow,showFormulaModal,
            showTableModal,detailSpinning,insertTableData }  = this.state;
        const { t } = this.props;

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

        const content = (
            <div className="form">
                <div className="operate">
                    <span className="id" onClick={()=>this.copy(waxberryObj.id)}>
                        <span>ID：{waxberryObj.id}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="18" height="18" viewBox="0 0 18 18"><defs><clipPath id="master_svg0_280_37539"><rect x="0" y="0" width="18" height="18" rx="4"/></clipPath></defs><g clipPath="url(#master_svg0_280_37539)"><g><path d="M10.75139,5.75C11.165700000000001,5.75,11.50156,6.085789999999999,11.50156,6.5L11.50156,13.5C11.50156,13.9142,11.165700000000001,14.25,10.75139,14.25L5.250166,14.25C4.835861,14.25,4.5,13.9142,4.5,13.5L4.5,6.5C4.4999999105732,6.085789999999999,4.835861,5.75,5.250167,5.75L10.75139,5.75ZM10.50133,6.75L5.5002200000000006,6.75L5.5002200000000006,13.25L10.50133,13.25L10.50133,6.75ZM12.74983,3.75000013411C13.13642,3.749760926,13.45989,4.043283,13.497,4.428L13.5,4.5L13.5,11.246500000000001C13.49971,11.511050000000001,13.29335,11.72958,13.0292,11.745090000000001C12.76505,11.76059,12.53453,11.5677,12.50328,11.305L12.499780000000001,11.246500000000001L12.499780000000001,4.75L7.5006699999999995,4.75C7.24712,4.749967,7.033720000000001,4.560247,7.00406,4.3085L7.00056,4.25C7.00059,3.996513,7.1903500000000005,3.7831582,7.44215,3.75350006L7.5006699999999995,3.75000013411L12.74983,3.75000013411Z" fill="#FFFFFF"/></g></g></svg>
                    </span>
                    <span onClick={()=>this.moreInfo()}>{t('more')}<RightOutlined/></span>
                </div>
                <div className="pic">
                    <div className="icon">
                        <Spin spinning={iconSpinning1}>
                            <CustomUpload {...props}>
                                <img src={waxberryObj.imgeFileId ? `${globalInitConfig.REACT_APP_API_FS_URL}file/download/${waxberryObj.imgeFileId}` : DefaultPng} width="90" height="90"/>
                            </CustomUpload>
                        </Spin>
                        <img onClick={()=>this.generateImage('imgeFileId','iconSpinning1')} src={AiSvg} className="ai" width="28" height="28"/>
                    </div>
                </div>
                <div className="form-item">
                    <span className="label">{t('waxberryForm.name')}</span>
                    <Input value={waxberryObj.name} onChange={(e)=>this.waxberryObjChange("name",e.target.value)} placeholder={t('waxberryForm.pleaseEnter')}/>
                </div>
                <div className="form-item">
                    <span className="label">{t('waxberryForm.introduction')}</span>
                    <TextArea rows={4} value={waxberryObj.discription} onChange={(e)=>this.waxberryObjChange("discription",e.target.value)} placeholder={t('waxberryForm.pleaseEnter')}/>
                </div>
                <div className="form-item">
                    <span className="label">{t('waxberryForm.category')}</span>
                    <Cascader
                        getPopupContainer={(triggerNode) => triggerNode.parentNode}
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
                        getPopupContainer={(triggerNode) => triggerNode.parentNode}
                        notFoundContent={t('waxberryForm.createTags')}
                        value={waxberryObj.agentLabel ? waxberryObj.agentLabel.split(',') : []}
                        onChange={(value)=>this.waxberryObjChange("agentLabel",value.join(','))}
                        placeholder={t('waxberryForm.createTags')}
                    />
                </div>
                <div className="isEdit">
                    <span>{t('waxberryForm.isModificationAllowed')}</span><Switch checked={waxberryObj.ismodify===0} onChange={(checked)=>this.waxberryObjChange("ismodify",checked?0:1)} />
                </div>
            </div>
        );

        const loop = data => data.map((item) => {
            let title = item.type==="file" ? <span className="label"><FileTextOutlined />{item.name}</span> : <span className="label"><FolderOutlined />{item.name}</span>;
            if (item.children && item.children.length) {
                return <TreeNode key={item.path} title={title} fileName={item.name} type={item.type}>{loop(item.children)}</TreeNode>;
            }
            return <TreeNode key={item.path} title={title} fileName={item.name} type={item.type}/>;
        });

        const getTaskStatus = status => {
            if(status === false){
                return TaskStatus1;
            }
            if(status === "run"){
                return TaskStatus2;
            }
            if(status === true){
                return TaskStatus3;
            }
        };

        return (
            <div className="waxberry-app">
                <Header/>
                <div className="app-content">
                    <Menu menu="home" type="waxberry" fileId={waxberryObj.imgeFileId} togglePopover={this.childRef}/>
                    <div className="app-content-data right_bj">
                        <div className="app-content-left">
                            <div className="left-header">
                                <Popover
                                    overlayClassName="updatePopover"
                                    open={popoverVisible}
                                    content={content}
                                    arrow={false}
                                    placement="bottom"
                                    trigger="click"
                                    onOpenChange={(e)=>this.visibleChange(e)}>
                                    <div ref={this.childRef} className="label">
                                        {waxberryObj.name}<DownOutlined />
                                        <div  className="model-type">
                                            <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="14" height="14" viewBox="0 0 14 14"><defs><clipPath id="master_svg0_228_42520"><rect x="0" y="0" width="14" height="14" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_228_42520)"><g><path d="M5.42795375,6.7450584375L2.36232175,6.7450584375C1.88183575,6.7450584375,1.49609375,6.3593184375,1.49609375,5.8788284375L1.49609375,2.8131984375C1.49609375,2.3394754375,1.8886037500000001,1.9469654375,2.36232175,1.9469654375L5.42795375,1.9469654375C5.90844375,1.9469654375,6.29418375,2.3327074375,6.29418375,2.8131984375L6.29418375,5.8788284375C6.29418375,6.3593184375,5.90844375,6.7450584375,5.42795375,6.7450584375ZM5.42795375,12.5040984375L2.36232175,12.5040984375C1.88183575,12.5040984375,1.49609375,12.1183984375,1.49609375,11.6378984375L1.49609375,8.5722584375C1.49609375,8.0917684375,1.88183575,7.7060284375,2.36232175,7.7060284375L5.42795375,7.7060284375C5.90844375,7.7060284375,6.29418375,8.0917684375,6.29418375,8.5722584375L6.29418375,11.6378984375C6.29418375,12.1115984375,5.90844375,12.5040984375,5.42795375,12.5040984375ZM11.18701375,12.5040984375L8.12138375,12.5040984375C7.64089375,12.5040984375,7.25515375,12.1183984375,7.25515375,11.6378984375L7.25515375,8.5722584375C7.25515375,8.0917684375,7.64089375,7.7060284375,8.12138375,7.7060284375L11.18701375,7.7060284375C11.66749375,7.7060284375,12.05329375,8.0917684375,12.05329375,8.5722584375L12.05329375,11.6378984375C12.05329375,12.1115984375,11.66069375,12.5040984375,11.18701375,12.5040984375ZM12.26299375,3.7403284375L10.25988375,1.7371764375C9.92151375,1.3988059375,9.37335375,1.3988059375,9.03498375,1.7371764375L7.03183375,3.7403284375C6.69346375,4.0786984375,6.69346375,4.6268584375,7.03183375,4.9652284375L9.03498375,6.9683784375C9.37335375,7.3067484375,9.92151375,7.3067484375,10.25988375,6.9683784375L12.26299375,4.9652284375C12.60139375,4.6200884375,12.60139375,4.0719284375,12.26299375,3.7403284375ZM9.82677375,6.0412484375C9.73202375,6.1359884375,9.56960375,6.1359884375,9.47486375,6.0412484375L7.95896375,4.5253484375C7.86422375,4.4306084375,7.86422375,4.2681884375,7.95896375,4.1734384375L9.47486375,2.6575384375C9.56960375,2.5627984374999997,9.73202375,2.5627984374999997,9.82677375,2.6575384375L11.34266375,4.1734384375C11.43741375,4.2681884375,11.43741375,4.4306084375,11.34266375,4.5253484375L9.82677375,6.0412484375Z" fill="currentColor"/></g></g></svg>
                                            <span className="model-type-name">{t('app')}</span>
                                        </div>
                                    </div>
                                </Popover>
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
                            </div>
                            {
                                (!isExecuting && isComplete) && <div className="run" onClick={()=>this.run()}><CaretRightFilled />{t('run')}</div>
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
                                        placeholder={t('home.enterQuestionLetMeHelp')+"~"}
                                        onChange={(e)=>this.handleChange(e)}
                                        autoSize={{ minRows: 2, maxRows: 10 }}
                                    />
                                    <div className="operate">
                                        <div className="link">
                                            <svg onClick={()=> this.fileUpload.click()}  xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="24" height="24" viewBox="0 0 24 24"><defs><clipPath id="master_svg0_323_071428"><rect x="24" y="0" width="24" height="24" rx="0"/></clipPath></defs><g transform="matrix(-1,0,0,1,48,0)" clipPath="url(#master_svg0_323_071428)"><g transform="matrix(0.7384299635887146,-0.6743301749229431,0.6743301749229431,0.7384299635887146,-1.5584574058884755,18.442791270619637)"><path d="M39.413321826171874,13.877295126953126C38.69382182617188,13.079195126953126,37.714321826171876,12.633075126953125,36.693721826171874,12.635125126953126L36.689721826171876,12.635125126953126C35.673021826171876,12.633075126953125,34.695421826171874,13.077145126953125,33.97792182617187,13.871155126953125L33.97592182617188,13.873205126953124L26.892291826171874,21.674155126953124C26.233391826171875,22.402655126953125,26.037871826171873,23.495455126953125,26.395681826171874,24.444955126953126C26.753481826171875,25.394555126953126,27.596161826171876,26.012555126953124,28.530741826171877,26.010555126953125C29.121211826171873,26.010555126953125,29.709731826171875,25.764955126953126,30.157461826171875,25.269755126953125L37.24112182617188,17.468765126953123C37.542221826171875,17.137245126953125,37.542221826171875,16.601075126953127,37.24112182617188,16.269565126953125C36.94002182617187,15.938045126953124,36.45322182617188,15.938045126953124,36.15212182617188,16.269565126953125L29.070381826171875,24.070555126953124C28.925691826171875,24.228055126953123,28.730171826171876,24.316055126953124,28.526831826171875,24.316055126953124C28.323491826171875,24.316055126953124,28.127971826171876,24.226055126953124,27.985251826171876,24.066455126953123C27.838611826171874,23.910855126953123,27.756491826171874,23.696055126953127,27.754531826171874,23.470955126953125C27.754531826171874,23.245755126953124,27.834701826171873,23.030955126953124,27.979381826171874,22.873355126953125L35.06302182617188,15.072405126953125C35.493221826171876,14.595585126953125,36.07972182617188,14.329555126953124,36.689721826171876,14.331605126953125L36.69172182617187,14.331605126953125C37.30372182617187,14.329555126953124,37.89222182617188,14.599685126953124,38.324321826171875,15.076495126953125C38.760321826171875,15.555355126953124,39.00082182617187,16.195885126953126,39.00082182617187,16.873255126953126C39.00272182617188,17.546525126953124,38.760321826171875,18.193195126953125,38.32822182617188,18.667965126953124L36.41602182617187,20.773725126953124L36.40432182617187,20.786005126953125L31.103781826171875,26.626455126953125C29.600231826171875,28.279955126953126,27.164061826171874,28.282055126953125,25.658571826171876,26.628555126953124C24.935151826171875,25.834555126953127,24.530421826171874,24.756055126953125,24.534331826171876,23.632555126953125C24.534331826171876,22.498855126953124,24.935151826171875,21.432655126953126,25.662481826171874,20.632525126953126L32.884961826171875,12.678095126953124C33.186021826171874,12.346575126953125,33.186021826171874,11.810415126953124,32.884961826171875,11.478895126953125C32.583861826171876,11.147375226953125,32.09701182617187,11.147375226953125,31.795921826171877,11.478895126953125L24.573441826171877,19.433325126953125C23.558692826171875,20.544525126953125,22.989731936171875,22.056855126953124,22.993642262371875,23.632555126953125C22.993642262371875,25.218555126953127,23.552826826171874,26.710355126953125,24.569531826171875,27.827755126953125C25.578411826171873,28.940955126953124,26.948991826171873,29.565155126953126,28.378241826171873,29.561055126953125C29.809441826171877,29.563055126953124,31.181991826171874,28.938955126953125,32.19282182617187,27.823655126953124L39.68312182617187,19.574525126953127C39.75742182617188,19.490625126953127,39.81612182617188,19.390345126953125,39.853221826171875,19.281885126953124C40.299021826171874,18.577915126953126,40.54152182617187,17.747075126953124,40.54152182617187,16.871205126953125C40.54342182617188,15.747725126953124,40.13672182617188,14.669255126953125,39.413321826171874,13.877295126953126Z" fill="currentColor"/></g></g></svg>
                                            <svg onClick={()=> this.imageUpload.click()} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="24" height="24" viewBox="0 0 24 24"><defs><clipPath id="master_svg0_323_071430"><rect x="0" y="0" width="24" height="24" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_323_071430)"><g><path d="M21.25006103515625,3.75L21.25006103515625,20.25L3.25006103515625,20.25L3.25006103515625,3.75L21.25006103515625,3.75ZM17.33456103515625,12.3375L12.26256103515625,16.558500000000002L8.96806103515625,13.9595L4.75006103515625,17.3705L4.75006103515625,18.75L19.75006103515625,18.75L19.75006103515625,14.341L17.33456103515625,12.3375ZM19.75006103515625,5.25L4.75006103515625,5.25L4.75006103515625,15.4415L8.95656103515625,12.04L12.23706103515625,14.628L17.33356103515625,10.388L19.75006103515625,12.392L19.75006103515625,5.25ZM9.50006103515625,6.25C10.74270103515625,6.25,11.75006103515625,7.25736,11.75006103515625,8.5C11.75006103515625,9.74264,10.74270103515625,10.75,9.50006103515625,10.75C8.25742103515625,10.75,7.25006103515625,9.74264,7.25006103515625,8.5C7.25006103515625,7.25736,8.25742103515625,6.25,9.50006103515625,6.25ZM9.50006103515625,7.75C9.08585103515625,7.75,8.75006103515625,8.08579,8.75006103515625,8.5C8.75006103515625,8.91421,9.08585103515625,9.25,9.50006103515625,9.25C9.91427103515625,9.25,10.25006103515625,8.91421,10.25006103515625,8.5C10.25006103515625,8.08579,9.91427103515625,7.75,9.50006103515625,7.75Z" fill="currentColor"/></g></g></svg>
                                            {/*<Voice onVoiceInput={this.handleVoiceInput.bind(this)} />*/}
                                            <svg onClick={()=>this.setState({showTableModal:true})} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="24" height="24" viewBox="0 0 24 24"><defs><clipPath id="master_svg0_323_071434"><rect x="0" y="0" width="24" height="24" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_323_071434)"><g><g><path d="M21.234611376953126,18.7876916015625L21.234611376953126,5.2123506015625Q21.234611376953126,4.5502466015625,20.766411376953126,4.0820716015625Q20.298211376953127,3.6138916015625,19.636111376953124,3.6138916015625L4.363870376953125,3.6138916015625Q3.701766376953125,3.6138916015625,3.233589376953125,4.0820696015625Q2.765411376953125,4.5502466015625,2.765411376953125,5.2123506015625L2.765411376953125,18.7876916015625Q2.765411376953125,19.449791601562502,3.233592376953125,19.9179916015625Q3.701766376953125,20.3861916015625,4.363870376953125,20.3861916015625L19.636111376953124,20.3861916015625Q20.298211376953127,20.3861916015625,20.766411376953126,19.9179916015625Q21.234611376953126,19.449791601562502,21.234611376953126,18.7876916015625ZM19.636111376953124,5.1138916015625Q19.734611376953126,5.1138916015625,19.734611376953126,5.2123506015625L19.734611376953126,18.7876916015625Q19.734611376953126,18.8861916015625,19.636111376953124,18.8861916015625L4.363870376953125,18.8861916015625Q4.265411376953125,18.8861916015625,4.265411376953125,18.7876916015625L4.265411376953125,5.2123506015625Q4.265411376953125,5.1138916015625,4.363870376953125,5.1138916015625L19.636111376953124,5.1138916015625Z" fill="currentColor"/></g><g><path d="M3.515411376953125,8.704645156860352L20.484611376953126,8.704645156860352Q20.558411376953124,8.704645156860352,20.630911376953126,8.71905615686035Q20.703311376953124,8.733467156860351,20.771611376953125,8.761735156860352Q20.839811376953126,8.790004156860352,20.901311376953124,8.831043156860352Q20.962711376953123,8.872082156860351,21.014911376953126,8.924315156860352Q21.067111376953125,8.976548156860352,21.108211376953125,9.037967156860352Q21.149211376953126,9.099387156860352,21.177511376953124,9.167632156860352Q21.205811376953125,9.235878156860352,21.220211376953124,9.30832715686035Q21.234611376953126,9.380776656860352,21.234611376953126,9.454645156860352Q21.234611376953126,9.528513656860351,21.220211376953124,9.600963156860352Q21.205811376953125,9.673412156860351,21.177511376953124,9.741658156860352Q21.149211376953126,9.80990315686035,21.108211376953125,9.87132315686035Q21.067111376953125,9.932742156860352,21.014911376953126,9.98497515686035Q20.962711376953123,10.037208156860352,20.901311376953124,10.078247156860352Q20.839811376953126,10.119286156860351,20.771611376953125,10.147555156860351Q20.703311376953124,10.175823156860352,20.630911376953126,10.190234156860352Q20.558411376953124,10.204645156860352,20.484611376953126,10.204645156860352L3.515411376953125,10.204645156860352Q3.441542876953125,10.204645156860352,3.369093376953125,10.190234156860352Q3.296644376953125,10.175823156860352,3.228398376953125,10.147555156860351Q3.160153376953125,10.119286156860351,3.098733376953125,10.078247156860352Q3.037314376953125,10.037208156860352,2.985081376953125,9.98497515686035Q2.932848376953125,9.932742156860352,2.891809376953125,9.87132315686035Q2.850770376953125,9.80990315686035,2.822501376953125,9.741658156860352Q2.794233376953125,9.673412156860351,2.779822376953125,9.600963156860352Q2.765411376953125,9.528513656860351,2.765411376953125,9.454645156860352Q2.765411376953125,9.380776656860352,2.779822376953125,9.30832715686035Q2.794233376953125,9.235878156860352,2.822501376953125,9.167632156860352Q2.850770376953125,9.099387156860352,2.891809376953125,9.037967156860352Q2.932848376953125,8.976548156860352,2.985081376953125,8.924315156860352Q3.037314376953125,8.872082156860351,3.098733376953125,8.831043156860352Q3.160153376953125,8.790004156860352,3.228398376953125,8.761735156860352Q3.296644376953125,8.733467156860351,3.369093376953125,8.71905615686035Q3.441542876953125,8.704645156860352,3.515411376953125,8.704645156860352Z" fill="currentColor"/></g><g><path d="M8.49250841140747,9.454645156860352Q8.49250841140747,9.380776656860352,8.50691941140747,9.30832715686035Q8.52133041140747,9.235878156860352,8.549598411407471,9.167632156860352Q8.577867411407471,9.099387156860352,8.61890641140747,9.037967156860352Q8.65994541140747,8.976548156860352,8.712178411407471,8.924315156860352Q8.76441141140747,8.872082156860351,8.825830411407471,8.831043156860352Q8.887250411407472,8.790004156860352,8.95549541140747,8.761735156860352Q9.023741411407471,8.733467156860351,9.09619041140747,8.71905615686035Q9.168639911407471,8.704645156860352,9.24250841140747,8.704645156860352Q9.31637691140747,8.704645156860352,9.388826411407472,8.71905615686035Q9.46127541140747,8.733467156860351,9.52952141140747,8.761735156860352Q9.59776641140747,8.790004156860352,9.65918641140747,8.831043156860352Q9.72060541140747,8.872082156860351,9.77283841140747,8.924315156860352Q9.825071411407471,8.976548156860352,9.86611041140747,9.037967156860352Q9.90714941140747,9.099387156860352,9.93541841140747,9.167632156860352Q9.96368641140747,9.235878156860352,9.978097411407472,9.30832715686035Q9.99250841140747,9.380776656860352,9.99250841140747,9.454645156860352L9.99250841140747,19.63614515686035Q9.99250841140747,19.710045156860353,9.978097411407472,19.78244515686035Q9.96368641140747,19.854945156860353,9.93541841140747,19.92314515686035Q9.90714941140747,19.99144515686035,9.86611041140747,20.05284515686035Q9.825071411407471,20.11424515686035,9.77283841140747,20.16644515686035Q9.72060541140747,20.21874515686035,9.65918641140747,20.25974515686035Q9.59776641140747,20.30074515686035,9.52952141140747,20.329045156860353Q9.46127541140747,20.35734515686035,9.388826411407472,20.37174515686035Q9.31637691140747,20.38614515686035,9.24250841140747,20.38614515686035Q9.168639911407471,20.38614515686035,9.09619041140747,20.37174515686035Q9.023741411407471,20.35734515686035,8.95549541140747,20.329045156860353Q8.887250411407472,20.30074515686035,8.825830411407471,20.25974515686035Q8.76441141140747,20.21874515686035,8.712178411407471,20.16644515686035Q8.65994541140747,20.11424515686035,8.61890641140747,20.05284515686035Q8.577867411407471,19.99144515686035,8.549598411407471,19.92314515686035Q8.52133041140747,19.854945156860353,8.50691941140747,19.78244515686035Q8.49250841140747,19.710045156860353,8.49250841140747,19.63614515686035L8.49250841140747,9.454645156860352Z" fill="currentColor"/></g><g><path d="M14.007491111755371,9.454645156860352Q14.007491111755371,9.380776656860352,14.02190211175537,9.30832715686035Q14.036313111755371,9.235878156860352,14.064581111755372,9.167632156860352Q14.092850111755372,9.099387156860352,14.133889111755371,9.037967156860352Q14.17492811175537,8.976548156860352,14.227161111755372,8.924315156860352Q14.279394111755371,8.872082156860351,14.340813111755372,8.831043156860352Q14.402233111755372,8.790004156860352,14.470478111755371,8.761735156860352Q14.538724111755371,8.733467156860351,14.61117311175537,8.71905615686035Q14.683622611755371,8.704645156860352,14.757491111755371,8.704645156860352Q14.83135961175537,8.704645156860352,14.903809111755372,8.71905615686035Q14.97625811175537,8.733467156860351,15.044504111755371,8.761735156860352Q15.11274911175537,8.790004156860352,15.17416911175537,8.831043156860352Q15.235588111755371,8.872082156860351,15.28782111175537,8.924315156860352Q15.340054111755371,8.976548156860352,15.381093111755371,9.037967156860352Q15.42213211175537,9.099387156860352,15.45040111175537,9.167632156860352Q15.478669111755371,9.235878156860352,15.493080111755372,9.30832715686035Q15.507491111755371,9.380776656860352,15.507491111755371,9.454645156860352L15.507491111755371,19.63614515686035Q15.507491111755371,19.710045156860353,15.493080111755372,19.78244515686035Q15.478669111755371,19.854945156860353,15.45040111175537,19.92314515686035Q15.42213211175537,19.99144515686035,15.381093111755371,20.05284515686035Q15.340054111755371,20.11424515686035,15.28782111175537,20.16644515686035Q15.235588111755371,20.21874515686035,15.17416911175537,20.25974515686035Q15.11274911175537,20.30074515686035,15.044504111755371,20.329045156860353Q14.97625811175537,20.35734515686035,14.903809111755372,20.37174515686035Q14.83135961175537,20.38614515686035,14.757491111755371,20.38614515686035Q14.683622611755371,20.38614515686035,14.61117311175537,20.37174515686035Q14.538724111755371,20.35734515686035,14.470478111755371,20.329045156860353Q14.402233111755372,20.30074515686035,14.340813111755372,20.25974515686035Q14.279394111755371,20.21874515686035,14.227161111755372,20.16644515686035Q14.17492811175537,20.11424515686035,14.133889111755371,20.05284515686035Q14.092850111755372,19.99144515686035,14.064581111755372,19.92314515686035Q14.036313111755371,19.854945156860353,14.02190211175537,19.78244515686035Q14.007491111755371,19.710045156860353,14.007491111755371,19.63614515686035L14.007491111755371,9.454645156860352Z" fill="currentColor"/></g><g><path d="M3.515411376953125,13.795398712158203L20.484611376953126,13.795398712158203Q20.558411376953124,13.795398712158203,20.630911376953126,13.809809712158202Q20.703311376953124,13.824220712158203,20.771611376953125,13.852488712158204Q20.839811376953126,13.880757712158204,20.901311376953124,13.921796712158203Q20.962711376953123,13.962835712158203,21.014911376953126,14.015068712158204Q21.067111376953125,14.067301712158203,21.108211376953125,14.128720712158204Q21.149211376953126,14.190140712158204,21.177511376953124,14.258385712158203Q21.205811376953125,14.326631712158203,21.220211376953124,14.399080712158202Q21.234611376953126,14.471530212158203,21.234611376953126,14.545398712158203Q21.234611376953126,14.619267212158203,21.220211376953124,14.691716712158204Q21.205811376953125,14.764165712158203,21.177511376953124,14.832411712158203Q21.149211376953126,14.900656712158202,21.108211376953125,14.962076712158202Q21.067111376953125,15.023495712158203,21.014911376953126,15.075728712158202Q20.962711376953123,15.127961712158204,20.901311376953124,15.169000712158203Q20.839811376953126,15.210039712158203,20.771611376953125,15.238308712158203Q20.703311376953124,15.266576712158203,20.630911376953126,15.280987712158204Q20.558411376953124,15.295398712158203,20.484611376953126,15.295398712158203L3.515411376953125,15.295398712158203Q3.441542876953125,15.295398712158203,3.369093376953125,15.280987712158204Q3.296644376953125,15.266576712158203,3.228398376953125,15.238308712158203Q3.160153376953125,15.210039712158203,3.098733376953125,15.169000712158203Q3.037314376953125,15.127961712158204,2.985081376953125,15.075728712158202Q2.932848376953125,15.023495712158203,2.891809376953125,14.962076712158202Q2.850770376953125,14.900656712158202,2.822501376953125,14.832411712158203Q2.794233376953125,14.764165712158203,2.779822376953125,14.691716712158204Q2.765411376953125,14.619267212158203,2.765411376953125,14.545398712158203Q2.765411376953125,14.471530212158203,2.779822376953125,14.399080712158202Q2.794233376953125,14.326631712158203,2.822501376953125,14.258385712158203Q2.850770376953125,14.190140712158204,2.891809376953125,14.128720712158204Q2.932848376953125,14.067301712158203,2.985081376953125,14.015068712158204Q3.037314376953125,13.962835712158203,3.098733376953125,13.921796712158203Q3.160153376953125,13.880757712158204,3.228398376953125,13.852488712158204Q3.296644376953125,13.824220712158203,3.369093376953125,13.809809712158202Q3.441542876953125,13.795398712158203,3.515411376953125,13.795398712158203Z" fill="#FFFFFF"/></g><g><path d="M4.265411376953125,5.212649497709045L4.265411376953125,18.787650487709044Q4.265411376953125,18.886150487709045,4.363870376953125,18.886150487709045L19.636111376953124,18.886150487709045Q19.734611376953126,18.886150487709045,19.734611376953126,18.787650487709044L19.734611376953126,5.212350487709045Q19.734611376953126,5.138481987709046,19.749011376953124,5.0660324877090455Q19.763411376953126,4.993583487709046,19.791711376953124,4.9253374877090454Q19.819911376953126,4.857092487709045,19.861011376953126,4.795672487709045Q19.902011376953126,4.734253487709045,19.954211376953126,4.682020487709045Q20.006511376953124,4.629787487709045,20.067911376953123,4.588748487709045Q20.129311376953126,4.547709487709046,20.197611376953127,4.519440487709045Q20.265811376953124,4.491172487709045,20.338311376953126,4.476761487709045Q20.410711376953124,4.462350487709045,20.484611376953126,4.462350487709045Q20.558411376953124,4.462350487709045,20.630911376953126,4.476761487709045Q20.703311376953124,4.491172487709045,20.771611376953125,4.519440487709045Q20.839811376953126,4.547709487709046,20.901311376953124,4.588748487709045Q20.962711376953123,4.629787487709045,21.014911376953126,4.682020487709045Q21.067111376953125,4.734253487709045,21.108211376953125,4.795672487709045Q21.149211376953126,4.857092487709045,21.177511376953124,4.9253374877090454Q21.205811376953125,4.993583487709046,21.220211376953124,5.0660324877090455Q21.234611376953126,5.138481987709046,21.234611376953126,5.212350487709045L21.234611376953126,18.787650487709044Q21.234611376953126,19.449850487709046,20.766411376953126,19.917950487709046Q20.298211376953127,20.386150487709045,19.636111376953124,20.386150487709045L4.363870376953125,20.386150487709045Q3.701767376953125,20.386150487709045,3.233591376953125,19.917950487709046Q2.765411376953125,19.449850487709046,2.765411376953125,18.787650487709044L2.765411376953125,5.212350487709045Q2.765411376953125,5.138481987709046,2.779822376953125,5.0660324877090455Q2.794233376953125,4.993583487709046,2.822501376953125,4.9253374877090454Q2.850770376953125,4.857092487709045,2.891809376953125,4.795672487709045Q2.932848376953125,4.734253487709045,2.985081376953125,4.682020487709045Q3.037314376953125,4.629787487709045,3.098733376953125,4.588748487709045Q3.160153376953125,4.547709487709046,3.228398376953125,4.519440487709045Q3.296644376953125,4.491172487709045,3.369093376953125,4.476761487709045Q3.441542876953125,4.462350487709045,3.515411376953125,4.462350487709045Q3.589279876953125,4.462350487709045,3.661729376953125,4.476761487709045Q3.734178376953125,4.491172487709045,3.802424376953125,4.519440487709045Q3.870669376953125,4.547709487709046,3.932089376953125,4.588748487709045Q3.993508376953125,4.629787487709045,4.045741376953125,4.682020487709045Q4.097974376953125,4.734253487709045,4.139013376953125,4.795672487709045Q4.180052376953125,4.857092487709045,4.208321376953125,4.9253374877090454Q4.236589376953125,4.993583487709046,4.251000376953125,5.0660324877090455Q4.265411376953125,5.138481987709046,4.265411376953125,5.212350487709045L4.265411376953125,5.212649497709045Z" fill="currentColor"/></g></g></g></svg>
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
                        <div className="app-content-right" style={right_full?{width: "100%"}:null}>
                        <DrawCode defaultMenu="task" resizable={true}  width={710} requireInform={this.state.requireInform}
                        waxberryObj={waxberryObj}  toggleFull={()=>this.toggleFull()} query={this.state.eventSourceCfg} stopSign={this.state.stopSign}
                         functionItems={waxberryObj.step?['requirement','task','log','code']:['task','log','code']}/>
                        </div>
                    </div>
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
                                    <img onClick={()=>this.generate_detail_prompt()} src={AiSvg} className="ai"/>
                                    <span className="upload" onClick={()=>document.getElementById('fileInput').click()}>
                                        <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="16" height="16" viewBox="0 0 16 16"><defs><clipPath id="master_svg0_172_55337"><rect x="0" y="0" width="16" height="16" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_172_55337)"><g><path d="M8.09844,7.17188C8.04844,7.10781,7.95156,7.10781,7.90156,7.17188L6.15156,9.38594C6.0875,9.46719,6.14531,9.5875,6.25,9.5875L7.40469,9.5875L7.40469,13.375C7.40469,13.4438,7.46094,13.5,7.52969,13.5L8.46719,13.5C8.53594,13.5,8.59219,13.4438,8.59219,13.375L8.59219,9.58906L9.75,9.58906C9.85469,9.58906,9.9125,9.46875,9.84844,9.3875L8.09844,7.17188ZM12.6781,5.72969C11.9625,3.84219,10.13906,2.5,8.003129999999999,2.5C5.86719,2.5,4.04375,3.84063,3.32812,5.72813C1.989063,6.079689999999999,1,7.3,1,8.75C1,10.47656,2.39844,11.875,4.12344,11.875L4.75,11.875C4.81875,11.875,4.875,11.81875,4.875,11.75L4.875,10.8125C4.875,10.74375,4.81875,10.6875,4.75,10.6875L4.12344,10.6875C3.59687,10.6875,3.10156,10.47812,2.7328099999999997,10.09844C2.36562,9.72031,2.1703099999999997,9.21094,2.1875,8.68281C2.2015599999999997,8.27031,2.34219,7.88281,2.59687,7.55625C2.8578099999999997,7.22344,3.22344,6.98125,3.62969,6.87344L4.22187,6.71875L4.43906,6.14687C4.57344,5.79063,4.76094,5.45781,4.9968699999999995,5.15625C5.22969,4.85625,5.50625,4.59531,5.81562,4.37656C6.45781,3.925,7.21406,3.68594,8.00312,3.68594C8.79219,3.68594,9.54844,3.925,10.19062,4.37656C10.50156,4.59531,10.77656,4.857810000000001,11.0094,5.15625C11.2453,5.45781,11.4328,5.79219,11.5672,6.14687L11.7828,6.71719L12.3734,6.87344C13.2203,7.10156,13.8125,7.87187,13.8125,8.75C13.8125,9.26719,13.6109,9.75469,13.2453,10.12031C12.8797,10.48594,12.3938,10.6875,11.8766,10.6875L11.25,10.6875C11.1812,10.6875,11.125,10.74375,11.125,10.8125L11.125,11.75C11.125,11.81875,11.1812,11.875,11.25,11.875L11.8766,11.875C13.6016,11.875,15,10.47656,15,8.75C15,7.30156,14.0141,6.08281,12.6781,5.72969Z" fill="currentColor"/></g></g></svg>
                                        {t('waxberryForm.upload')}
                                    </span>
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
                            <div className="ok" onClick={this.waxberryModalOk.bind(this)}>{t('confirm')}</div>
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
export default withTranslation()(Waxberry);
