import React, {useState,useEffect,useRef } from 'react';
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
import DrawCode from '../components/drawCode/drawCode';
import CustomUpload from "@components/CustomUpload";

import axios from 'axios';
import Qs from 'qs';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { Input,Tooltip,Select,Switch,message as Message,Cascader,Spin,Drawer,Tree } from 'antd';
import {
    DownOutlined,
    LoadingOutlined,
    CloseOutlined,
    RightOutlined,
    CaretDownFilled,
    FileTextOutlined,
    FolderOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import ModelSvg from './../img/model.svg';
import DefaultPng from '../img/default.png';
import AiSvg from '../img/ai.svg';
import CardDefaultPng from '../img/cardDefault.png';

import './agent.scss';
import WarningSvg from "../img/warning.svg";

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

let fileReplace = {};//@替换
let isUserScrolling = false;//用户是否滚动

const Agent =()=> {

    const [message, setMessage] = useState("");
    const [messageObj, setMessageObj] = useState({});
    const [messageData, setMessageData] = useState([]);
    const [isExecuting, setIsExecuting] = useState(false);
    const [waxberryObj, setWaxberryObj] = useState({});
    const [agentMenuList, setAgentMenuList] = useState([]);
    const [showWaxberryModal, setShowWaxberryModal] = useState(false);
    const [fileList, setFileList] = useState([]);
    const [tab, setTab] = useState('extend');
    const [agentSupplementaryInfo, setAgentSupplementaryInfo] = useState({});
    const [spinning, setSpinning] = useState(false);
    const [inputFileOptions, setInputFileOptions] = useState([]);
    const [inputFileOpen, setInputFileOpen] = useState(false);
    const [iconSpinning, setIconSpinning] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [selectedKeys, setSelectedKeys] = useState([]);
    const [selectMenu, setSelectMenu] = useState("code");
    const [expandedKeys, setExpandedKeys] = useState([]);
    const [monacoLanguage, setMonacoLanguage] = useState('');
    const [drawerWidth, setDrawerWidth] = useState('calc(40% - 24px)');
    const [iconSpinning1, setIconSpinning1] = useState(false);
    const [iconSpinning2, setIconSpinning2] = useState(false);
    const [detailSpinning, setDetailSpinning] = useState(false);
    const [stopSign, setStopSign] = useState(0);
    const [treeUploadFile,setTreeUploadFile]=useState(null);
    const [selectTreeType ,setSelectTreeType]=useState('');
    const [showFormulaModal,setShowFormulaModal]=useState(false);
    const [showTableModal,setShowTableModal]=useState(false);
    const [insertTableData,setInsertTableData]=useState([]);
    const [insertTableMd,setInsertTableMd]=useState();
    const [showPublishModal,setShowPublishModal]=useState(false)

    const eventSource=useRef(null)
    const {t}=useTranslation()
    const callbackMapRef = useRef(new Map());
    const imageUploadRef =useRef(null)
    const fileUploadRef=useRef(null)
    const functionMap=useRef({
        getCodeTree,
        fetchData,
        deleteSession
    })
    useEffect(() => {
        getAgentMenuList();
    }, []);

    // componentDidMount
    useEffect(() => {
        messageResizable();
        if (urlObj.id) {
            initData(urlObj.id);
        } else {
            newSend("我的Agent应用");
        }

        return () => {
            if(controller) controller.abort();
        };
    }, []);

    useEffect(()=>{
        invokeCallBackList('waxberryObj')
    },[ waxberryObj])

    useEffect(()=>{
        functionMap.current.fetchData = fetchData;
        const callList=callbackMapRef.current.get('messageData')||[]
        callList.forEach(callBack=>callBack())
        callbackMapRef.current.set('messageData',[])
    },[messageData])
    useEffect(()=>{
        invokeCallBackList('agentSupplementaryInfo')
    },[agentSupplementaryInfo])

    useEffect(()=>{
        invokeCallBackList('monacoLanguage')
    },[monacoLanguage])
    const invokeCallBackList=(key)=>{
        functionMap.current={
            getCodeTree,
            fetchData,
            deleteSession
        }
        const callList=callbackMapRef.current.get(key)||[]
        callList.forEach(callBack=>callBack())
        callbackMapRef.current.set(key,[])
    }
    const setCallBackList=(key,callback)=>{
        if(!callbackMapRef.current.get(key)){
            callbackMapRef.current.set(key,[])
        }
        const callList=callbackMapRef.current.get(key)
        callList.push(callback)
    }
    const resetState = () => {
        setMessage("");
        setMessageObj({});
        setMessageData([]);
        setIsExecuting(false);
        setWaxberryObj({});
        setAgentMenuList([]);
        setShowWaxberryModal(false);
        setFileList([]);
        setTab("extend");
        setAgentSupplementaryInfo({});
        setSpinning(false);
        setInputFileOptions([]);
        setInputFileOpen(false);
        setIconSpinning(false);
        setDrawerVisible(false);
        setSelectedKeys([]);
        setSelectMenu("code");
        setExpandedKeys([]);
        setMonacoLanguage("");
        setDrawerWidth("calc(40% - 24px)");
        setIconSpinning1(false);
        setIconSpinning2(false);
        setDetailSpinning(false);
        setStopSign(0);
        setTreeUploadFile(null);
        setSelectTreeType('')
        setShowFormulaModal(false)
        setShowTableModal(false)

    };

    function initData(id) {
        //获取纳豆
        axios.get(`${globalInitConfig.REACT_APP_API_BASE_URL}mgr/agent/agent/findById?id=${id}`).then(r1=>{
            if(r1.data.code === 200){
                let waxberryObj = r1.data.data||{};

                setWaxberryObj(waxberryObj)
                setCallBackList('waxberryObj',()=>{
                    functionMap.current.getCodeTree();
                })
            }
        });
        //获取纳豆扩展
        axios.get(`${globalInitConfig.REACT_APP_API_BASE_URL}mgr/agent/agentSupplementaryInfo/findById?waxberryId=${id}`).then(res=>{
            if(res.data.code === 200){
                setAgentSupplementaryInfo(res.data.data || { waxberryId: id })

            }
        });
    }

    function newSend(message) {
        if(!message){
            return;
        }
        axios.post(globalInitConfig.REACT_APP_API_BASE_URL + "mgr/agent/agent/addAgent", {
            name: message.substring(0,20),
            type: 1
        }).then(r=>{
            if(r.data.code === 200){
                let waxberryObj = r.data.data;
                window.history.replaceState({}, '', `/agent?id=${waxberryObj.id}`);
                setWaxberryObj(waxberryObj)
                setCallBackList('waxberryObj',()=>{
                    functionMap.current.getCodeTree()
                })
                setAgentSupplementaryInfo({ waxberryId: waxberryObj.id })
                let params = {
                    "id": waxberryObj.vesselId,
                    "title": message.substring(0,500),
                    "chatType": "8"
                };
                axios.post(globalInitConfig.REACT_APP_API_BASE_URL + "mgr/conversation/add", params).then(res=>{
                    if(res.data.code === 200){
                        let obj = res.data.data;
                        setMessageObj(obj)

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

    function  handleChange(e) {
        let message = e.target.value;
        if(message.length>1 && message.slice(-2) === "@f"){
            getCodeTree();
            setMessage(message.slice(0,-1))
            setInputFileOpen(true)

        }else{

            setMessage(message)
        }
    }

    function send(newMessage){
        if(isExecuting){
            return;
        }
        if(!newMessage){
            let inputMessage = message;
            if(!inputMessage){
                return;
            }
            newMessage = inputMessage;
        }
        if(!agentSupplementaryInfo.roleInstruction){
            Message.warning("请填写角色指令后重试");
            return;
        }
        for(let key in fileReplace){
            newMessage =  newMessage.replace(key,fileReplace[key]);
        }

        if(insertTableMd){
            newMessage = insertTableMd + "\n\n" + newMessage;
        }
        let conversationMessage = [...messageData,{
            "query":  newMessage,
            "reponse": "",
            "reponseFileId": fileList.map(v=>v.fileId).join(','),
            "fileList": [...fileList]
        }];
        setMessage("");
        setIsExecuting(true);
        setMessageData(conversationMessage);
        setCallBackList('messageData',()=>{
            let node = document.getElementById("dialogues");
            node.scrollTop = node.scrollHeight;
            messageScroll();
            functionMap.current.fetchData( newMessage,conversationMessage);
        })

    }

    function fetchData(message,conversationMessage) {
        controller = new AbortController();
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
                sessionId: waxberryObj.vesselId
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
                                    setMessageData([...messageData])
                                    setCallBackList('messageData',() => {
                                        if(!isUserScrolling){
                                            let node = document.getElementById("dialogues");
                                            node.scrollTop = node.scrollHeight + 50;
                                        }
                                    })


                                }
                            }
                        }catch (e) {
                            console.log(e);
                            setIsExecuting(false)
                            controller.abort();
                        }
                    },
                    onerror(err) {
                        console.log(err);
                        controller.abort();
                        eventSource.close();
                    },
                    onclose(close) {
                        const endTime = performance.now(); // 记录结束时间
                        const durationInMilliseconds = endTime - startTime; // 计算持续时间
                        const durationInSeconds = (durationInMilliseconds / 1000).toFixed(2);
                        messageData[messageData.length - 1].id = 'xxx';
                        messageData[messageData.length - 1].duration = durationInSeconds;
                        setIsExecuting(false)
                        setMessageData([...messageData])

                    }
                })
            }
        });
    }

    function stopGenerating() {
        controller.abort();
        let stopSign=stopSign;
        stopSign++;
        let obj = messageData[messageData.length-1];
        obj.reponse += "...";
        obj.id = "xxx";
        setMessageData([...messageData]);
        setIsExecuting(false);
        setStopSign(stopSign)

    }

    function  handleUpload(info) {
        if (info.file.status === 'done') {

            let obj = info.file.response.data;
            waxberryObj.imgeFileId = obj.id;
            setWaxberryObj({...waxberryObj})

        }
    }

    function  getAgentMenuList() {
        axios.get(`${globalInitConfig.REACT_APP_API_BASE_URL}mgr/agent/agentClassification/findAllAgentClassification`).then(res=>{
            if(res.data.code === 200){
                let data = res.data.data;
                convertTree(data);
                setAgentMenuList(data)

            }
        });
    }

    function  convertTree(data){
        data.forEach(item=>{
            item.value = item.id;
            item.label = item.name;
            if(item.children){
                convertTree(item.children);
            }
        })
    }

    function  onKeyPress(e){
        if (e.key === 'Enter') {
            // 阻止回车键的默认换行行为
            e.preventDefault();
        }
    }

    function waxberryObjChange(key,value){

        waxberryObj[key] = value;
        waxberryObj.isChange = true;
        setWaxberryObj({
            ...waxberryObj
        });
    }

    function  getWaxberryDetail(){

        axios.get(`${globalInitConfig.REACT_APP_API_SBX_URL}/sandboxes/${waxberryObj.vesselId}/read_file?path=/waxberry/README.md`).then(res => {
            const data = res.data;
            if (data) {
                waxberryObj.detail = data;
                setWaxberryObj({
                    ...waxberryObj
                });
            }
        });
    }

    function handleAttachmentUpload(info) {

        waxberryObj.fileList = info.fileList;
        setWaxberryObj({
            ...waxberryObj
        });
    }

    function  handleCoverUpload(info) {
        if (info.file.status === 'done') {

            let obj = info.file.response.data;
            waxberryObj.coverFileId = obj.id;
            setWaxberryObj({
                ...waxberryObj
            });
        }
    }

    function  hideWaxberryModal(){
        axios.get(`${globalInitConfig.REACT_APP_API_BASE_URL}mgr/agent/agent/findById?id=${waxberryObj.id}`).then(r1=> {
            if (r1.data.code === 200) {

                setWaxberryObj( r1.data.data);
            }
        });

        setShowWaxberryModal(false)
    }

    function waxberryModalOk(flag){

        //仅作校验
        if (flag) {
            if(!waxberryObj.name || !waxberryObj.discription || !waxberryObj.groupId) {
                Message.warning(t('message.pleaseCompleteInformationProceeding'));
                return;
            }
            setShowWaxberryModal(false);
            setShowPublishModal(true);
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
        waxberryObj.status = 1;
        waxberryObj.fileId = fileId;
        waxberryObj.fileName = fileName;
        setWaxberryDetail(waxberryObj);

        axios.post(globalInitConfig.REACT_APP_API_BASE_URL + 'mgr/agent/agent/updateAgent', waxberryObj).then(res => {
            const data = res.data;
            if (data.code === 200) {
                setShowPublishModal(false);
                Message.success(t('operationSuccessful'));
            } else {
                Message.error(data.message);
            }
        });
    }

    function  handleFileChange(e) {

        let file = e.target.files[0];
        if(file){
            let reader = new FileReader();
            reader.onload = (event) =>{
                waxberryObj.detail = event.target.result;
                setWaxberryObj({
                    ...waxberryObj
                })
            };
            reader.readAsText(file);
        }
    }

    function copy(content) {
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

    function  deleteMessage(id) {
        if(id){
            axios.post(globalInitConfig.REACT_APP_API_BASE_URL + "mgr/conversation/message/delete", {
                ids: id
            }).then(res=> {
                if(res.data.code === 200){
                    setMessageData(messageData.filter(item=> item.id!==id))

                }
            })
        }
    }
    function openCodeView(){

        setDrawerVisible(true)
    }
    function menuChange(key) {

        setSelectMenu(key)
    }

    function  fileUploader(type,file) {

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
            Message.warning(t('message.totalSizeCannotExceed')+"100M");
            return;
        }
        fileList.push(fileObj);

        setFileList([...fileList])
        const formData = new FormData();
        formData.append('file', file);
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
                setFileList([...fileList])
            }
        };

        xhr.onload = () => {
            let resFile = JSON.parse(xhr.response);
            if (xhr.status === 200 && resFile.code === 200) {
                fileObj.fileId = resFile.data.id;
                fileObj.progress = 0;
                formData.append("path","/waxberry/attachment/" + fileObj.fileName);
                axios.post(
                    `${globalInitConfig.REACT_APP_API_SBX_URL}/sandboxes/${waxberryObj.vesselId}/upload`,
                    formData,
                    { headers: { 'Content-Type': undefined } }
                ).then(res=> {
                    if(res.data.success){
                        getCodeTree();
                        setFileList([...fileList])
                    }
                })
            } else {
                console.log(`Upload of ${file.name} failed.`);
            }
        };

        xhr.send(formData);
    }

    function handleFileUpload(type,e) {
        const files = e.target.files;
        for (let i = 0; i < files.length; i++) {
            fileUploader(type,files[i]);
        }
    }

    function handleDrop(e){
        e.preventDefault();
        e.stopPropagation();

        if (e.dataTransfer.files.length) {
            fileUploader("file",e.dataTransfer.files[0]);
        }
    }

    function  handlePaste(e){
        const items = (e.clipboardData || window.clipboardData).items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].kind === 'file') {
                const file = items[i].getAsFile();
                fileUploader("file",file);
                break;
            }
        }
    }

    function  closeFunction(index){

        fileList.splice(index,1);
        setFileList([...fileList])
    }

    function fileClickFunction(fileName){

        let link = '@' + fileName;
        fileReplace[link] = `/waxberry/attachment/${fileName}`;

        setMessage(message + link)
    }

    /**
     * 展开/收起文件
     */
    function  openFile(item) {
        var that = this;
        if(item.openFile){
            item.openFile = false;
            resetState()
            //that.setState({});
        }else {
            item.openFile = true;
            if (item.fileList) {
                resetState()
                //  that.setState({});
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
                    resetState()
                    // that.setState({});
                }
            })
        }
    }

    function waxberryBlur(){

        if(!waxberryObj.isChange){
            return
        }

        if(!waxberryObj.name) {
            Message.warning("请填写名称");
            return;
        }
        let params = {
            id: waxberryObj.id,
            name: waxberryObj.name,
            discription: waxberryObj.discription
        };
        axios.post(globalInitConfig.REACT_APP_API_BASE_URL + 'mgr/agent/agent/updateAgent', params).then(res=>{
            if(res.data.code === 200){
                waxberryObj.isChange = false;
                Message.success(t('operationSuccessful'));
            }
        });
    }

    function  selectTab(tab){

        setTab(tab)
    }

    function  agentBlur(){

        if(agentSupplementaryInfo.isChange) {
            axios.post(globalInitConfig.REACT_APP_API_BASE_URL + 'mgr/agent/agentSupplementaryInfo/addOrUpdate', agentSupplementaryInfo).then(res => {
                if (res.data.code === 200) {
                    Message.success(t('operationSuccessful'));
                    setAgentSupplementaryInfo(res.data.data || {})
                    setCallBackList('agentSupplementaryInfo', () => {
                        functionMap.current.deleteSession();
                    })

                }
            });
        }
    }

    function  agentObjChange(key,value){

        agentSupplementaryInfo[key] = value;
        agentSupplementaryInfo.isChange = true;

        setAgentSupplementaryInfo({...agentSupplementaryInfo})
    }

    function  inToolBoxChange(value){

        agentSupplementaryInfo.useToolBox = value;
        axios.post(globalInitConfig.REACT_APP_API_BASE_URL + 'mgr/agent/agentSupplementaryInfo/addOrUpdate', agentSupplementaryInfo).then(res => {
            if (res.data.code === 200) {
                Message.success(t('operationSuccessful'));
                setAgentSupplementaryInfo(res.data.data || {})
                setCallBackList('agentSupplementaryInfo', () => {
                    functionMap.current.deleteSession();
                })

            }
        });
    }

    function  generate_user_prompt(){
        setSpinning(true);
        axios.post(`${globalInitConfig.REACT_APP_API_CORE_URL}/chat/agent/generate_user_prompt`,{
            type: 0,
            user_message: waxberryObj.name
        }).then(r => {
            agentSupplementaryInfo.roleInstruction = r.data.response.content;
            axios.post(globalInitConfig.REACT_APP_API_BASE_URL + 'mgr/agent/agentSupplementaryInfo/addOrUpdate', agentSupplementaryInfo).then(res=>{
                if(res.data.code === 200){
                    setSpinning(false)
                    setAgentSupplementaryInfo(res.data.data || {})
                }

            });
        });
    }

    function  user_prompt_template(){

        setSpinning(true)
        let template = "# Role: [角色名称]\n" +
            "## Profile:\n" +
            "- language: [语言类型]\n" +
            "- description: [角色描述]\n" +
            "## Goals:\n" +
            "[目标1]\n" +
            "[目标2]\n" +
            "## Skills:\n" +
            "[技能1]\n" +
            "[技能2]\n" +
            "## Workflows:\n" +
            "[步骤1]\n" +
            "[步骤2]\n" +
            "[步骤3]\n" +
            "## Constrains:\n" +
            "你现在要做为一个agent仅仅支持[业务范围]，其它的事情你不要再处理，回复用户你只是做本业务相关的Agent无法处理其它业务。\n" +
            "[其他约束条件]\n" +
            "## OutputFormat:\n" +
            "[输出部分1]：\n" +
            "[输出部分2]：\n" +
            "[输出部分3]：\n" +
            "## Examples:\n" +
            "输入：\n" +
            "[示例输入内容]\n" +
            "输出：\n" +
            "[示例输出内容]\n" +
            "## Initialization:\n" +
            "[欢迎语及初始引导内容]\n" +
            "## Irrelevant Response Template:\n" +
            "[无关内容的标准回复模板]";

        agentSupplementaryInfo.roleInstruction = template;
        axios.post(globalInitConfig.REACT_APP_API_BASE_URL + 'mgr/agent/agentSupplementaryInfo/addOrUpdate', agentSupplementaryInfo).then(res=>{
            if(res.data.code === 200){
                setSpinning(false)
                setAgentSupplementaryInfo(res.data.data || {})
            }
        });
    }

    function updateMessage(message) {
        setMessage(message)

    }

    function  publish() {

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

        setShowWaxberryModal(true)
        setWaxberryObj({...waxberryObj})
        getWaxberryDetail();
    }

    function setWaxberryDetail(item){
        let params = {
            path: "/waxberry/README.md",
            content: item.detail
        };
        axios.post(`${globalInitConfig.REACT_APP_API_SBX_URL}/sandboxes/${item.vesselId}/write_file`,params);
    }

    function  convertInputFileTree(data){
        return data.map((item) => {
            let fileOption = {};
            fileOption.fileName = item.name;
            fileOption.label = item.type==="file" ? <span className="label"><FileTextOutlined />{item.name}</span> : <span className="label"><FolderOutlined />{item.name}</span>;
            fileOption.value = item.path;
            if (item.children) {
                fileOption.children = convertInputFileTree(item.children);
            }else{
                fileOption.disabled = item.type==="directory";
            }
            return fileOption;
        });
    }

    function  inputFileChange(value, selectedOptions) {

        let node = selectedOptions[selectedOptions.length-1];
        fileReplace['@'+node.fileName] = value[value.length-1];

        setMessage(message + node.fileName)
        setInputFileOpen(false)
    }

    function   messageScroll(){
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

    function   messageResizable() {
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

    function  generateImageBlur() {

        setIconSpinning(true)

        axios.post(`${globalInitConfig.REACT_APP_API_PLUG_URL}api/v1/textToImage`,{text: waxberryObj.name}).then(res => {
            if (res.data.code === 200) {
                waxberryObj.imgeFileId = res.data.data.id;

                setIconSpinning(false)
                setWaxberryObj({...waxberryObj})
                axios.post(globalInitConfig.REACT_APP_API_BASE_URL + 'mgr/agent/agent/updateAgent', waxberryObj);
            }
        });
    }

    function  generateImage(key,iconSpinning) {

        const setMap=  {iconSpinning1:setIconSpinning1, iconSpinning2:setIconSpinning2}
        setMap[iconSpinning](true)

        axios.post(`${globalInitConfig.REACT_APP_API_PLUG_URL}api/v1/textToImage`,{text: waxberryObj.name}).then(res => {
            if (res.data.code === 200) {
                waxberryObj[key] = res.data.data.id;

                setWaxberryObj({...waxberryObj})
                setMap[iconSpinning](false)
            }
        });
    }

    function deleteSession(){

        axios.post(`${globalInitConfig.REACT_APP_API_CORE_URL}/chat/session/delete/${waxberryObj.vesselId}`).then(res => {
            setMessageData([])
        });
    }

    function getCodeTree(){
        setSpinning(true)

        axios.get(`${globalInitConfig.REACT_APP_API_SBX_URL}/sandboxes/${waxberryObj.vesselId}/tree?path=/waxberry`).then(res => {
            const data = res.data;
            if (data.data) {

                setSpinning(false);

                setInputFileOptions(convertInputFileTree([data.data]))
            } else {
                Message.error(data.message);
            }
        });
    }

    function  toggleFull(width) {
        if(drawerWidth==='100%') width='calc(40% - 24px)'

        setDrawerWidth(width)
    }

    function handleVoiceInput(value){

        setMessage(value)
    }

    function   formulaOk(val) {


        setShowFormulaModal(false)
        setMessage(message + val)
    }

    function  tableOk(val) {

        setShowTableModal(false)
        setInsertTableData( [...insertTableData,val])

    }

    function  generate_detail_prompt(){

        setDetailSpinning(true)

        axios.post(`${globalInitConfig.REACT_APP_API_CORE_URL}/chat/agent/generate_user_prompt`,{
            type: 1,
            user_message: waxberryObj.name+','+waxberryObj.discription
        }).then(r => {
            waxberryObj.detail = r.data.response.content;

            setWaxberryObj({...waxberryObj});
            setDetailSpinning(false)
        });
    }

    const props = {
        accept: "image/png, image/jpeg",
        showUploadList: false,
        multiple: false,
        onChange: handleUpload
    };

    const attachmentProps = {
        showUploadList: true,
        multiple: true,
        onChange: handleAttachmentUpload
    };

    const coverProps = {
        accept: "image/png, image/jpeg",
        showUploadList: false,
        multiple: false,
        onChange: handleCoverUpload
    };
    const loop = data => data.map((item) => {
        let title = item.type==="file" ? <span className="label"><FileTextOutlined />{item.name}</span> : <span className="label"><FolderOutlined />{item.name}</span>;
        if (item.children && item.children.length) {
            return <TreeNode key={item.path} title={title} fileName={item.name} type={item.type}>{loop(item.children)}</TreeNode>;
        }
        return <TreeNode key={item.path} title={title} fileName={item.name} type={item.type}/>;
    });
    return (
        <div className="agent-app">
            <Header/>
            <div className="app-content">
                <Menu menu="home" type="agent" fileId={waxberryObj.imgeFileId}/>
                <div className="app-content-box right_bj">
                    <div className="app-content-box-header">
                        <span>{waxberryObj.name}</span>
                        <div className="model-type">
                            <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="14" height="14" viewBox="0 0 14 14"><defs><clipPath id="master_svg0_228_40372"><rect x="0" y="0" width="14" height="14" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_228_40372)"><g><path d="M8.84917,5.93081L9.52331,7.72197C9.61961,8.00479,9.81222,8.19334,10.101130000000001,8.28761L11.93092,8.94751C12.17168,9.04178,12.31614,9.3246,12.21984,9.56028C12.17168,9.70168,12.07538,9.79596,11.93092,9.84309L10.101130000000001,10.50299C9.81222,10.59727,9.61961,10.78581,9.52331,11.0686L8.84917,12.8127C8.75287,13.0483,8.46396,13.1897,8.223189999999999,13.0955C8.07874,13.0483,7.98243,12.9541,7.93428,12.8127L7.26015,11.0215C7.16384,10.73868,6.97123,10.55013,6.68232,10.45586L4.90069,9.79596C4.65992,9.70168,4.5154700000000005,9.41887,4.61177,9.18319C4.65992,9.04178,4.75623,8.94751,4.90069,8.90037L6.73047,8.24047C7.01939,8.1462,7.212,7.95765,7.3083,7.67484L7.98243,5.88367C8.07874,5.64799,8.367650000000001,5.50658,8.60841,5.60086C8.70472,5.69513,8.801020000000001,5.7894,8.84917,5.93081ZM5.14145,1.122942L5.52667,2.1128C5.57482,2.2542,5.71927,2.39561,5.86373,2.44275L6.87493,2.81984C7.01939,2.8669700000000002,7.11569,3.00838,7.06754,3.14979C7.01939,3.24406,6.97123,3.2912,6.87493,3.33833L5.815580000000001,3.66828C5.67112,3.71542,5.52666,3.85683,5.47851,3.99823L5.09329,4.98809C5.04514,5.1295,4.9006799999999995,5.22377,4.75623,5.17663C4.65992,5.1295,4.61177,5.08236,4.56362,4.98809L4.1784,3.99823C4.13025,3.85683,3.9857899999999997,3.71542,3.84133,3.66828L2.830135,3.29119C2.6856783,3.24406,2.5893733,3.10265,2.6375262,2.96124C2.6856783,2.8669700000000002,2.733831,2.81984,2.830135,2.7727L3.84133,2.39561C3.9857899999999997,2.34848,4.13025,2.20707,4.1784,2.0656600000000003L4.56362,1.075805C4.61177,0.9343975,4.75623,0.8401253,4.9006799999999995,0.8872618C5.04514,0.981534,5.09329,1.02867,5.14145,1.122942Z" fill="currentColor"/></g></g></svg>
                            <span className="model-type-name">{t('agent')}</span>
                        </div>
                        <div className="publish" onClick={()=>publish()}>
                            <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="16" height="16" viewBox="0 0 16 16"><defs><clipPath id="master_svg0_228_88040"><rect x="0" y="0" width="16" height="16" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_228_88040)"><g><path d="M9.9725235546875,14.99651796875C9.6554935546875,14.99651796875,9.3447135546875,14.88541796875,9.0939335546875,14.67511796875L7.0912735546875,12.99171796875L4.9384635546875,14.70921796875C4.7273635546875,14.87791796875,4.4376835546875,14.90931796875,4.1954935546875,14.79121796875C3.9529935546875,14.67261796875,3.7998735546875,14.42541796875,3.8026835546875,14.15511796875L3.8419035546875,10.33651796875L1.9854935546874999,8.699957968749999C1.6465865546875,8.41542796875,1.4673683546875,7.96683796875,1.5181496146875,7.51089796875C1.5690871546875,7.05448796875,1.8429935546875,6.65698796875,2.2508055546875,6.44652796875L12.5115435546875,1.15714796875C12.9980435546875,0.90636656875,13.5644435546875,0.96574146875,13.9886435546875,1.31089796875C14.4131435546875,1.65652296875,14.5856435546875,2.1990179687499998,14.4387435546875,2.72636796875L11.2931535546875,13.99531796875C11.1673735546875,14.44541796875,10.8254935546875,14.79671796875,10.3790835546875,14.93461796875C10.2451835546875,14.97601796875,10.1081535546875,14.99651796875,9.9725235546875,14.99651796875ZM7.1028335546875,11.38791796875C7.2629935546875,11.38791796875,7.4228335546875,11.44261796875,7.5529935546875,11.55181796875L9.9583035546875,13.57341796875L13.0644435546875,2.4463679687499997L2.9320535546875,7.66933796875L5.0072135546875,9.49855796875C5.1598735546875005,9.63276796875,5.2462735546875,9.82714796875,5.2442435546875,10.03042796875L5.2169035546875,12.69731796875L6.6665935546875,11.54071796875C6.7904335546875,11.44171796875,6.9442835546875,11.38781796875,7.1028335546875,11.38791796875Z" fill="currentColor"/></g><g><path d="M7.194032765625,9.291196484375C7.014970765625,9.291196484375,6.836064765625,9.222916484375,6.699345765625,9.086196484375C6.426064465625,8.812916484375,6.426064465625,8.369946484375,6.699345765625,8.096986484375L9.317004765625,5.480107484375C9.590284765625,5.206826184375,10.032944765625,5.206826184375,10.306224765625,5.480107484375C10.579504765625,5.753388484375,10.579504765625,6.196357484375,10.306224765625,6.469326484375L7.688564765625,9.086196484375C7.552004765625,9.222916484375,7.372938765625,9.291196484375,7.194032765625,9.291196484375Z" fill="currentColor"/></g></g></svg>
                            {t('publish')}
                        </div>
                    </div>
                    <div className="app-content-data">
                        <div id="dragDiv" className="app-content-left">
                            <div className="left-header">
                                <div className="label">{t('agentRun.applicationConfiguration')}</div>
                                <div className="model">
                                    <img className="modelSvg" src={ModelSvg}/>DeepSeek v3
                                    <svg className="FilterSvg" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="16" height="16" viewBox="0 0 16 16"><defs><clipPath id="master_svg0_721_66786"><rect x="0" y="0" width="16" height="16" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_721_66786)"><g><g><path d="M11.262648487091065,3.4399452209472656L12.938188487091065,3.4399452209472656C13.297168487091064,3.4399452209472656,13.588188487091065,3.7309602209472654,13.588188487091065,4.089945220947266C13.588188487091065,4.4489352209472655,13.297168487091064,4.7399452209472654,12.938188487091065,4.7399452209472654L11.262648487091065,4.7399452209472654C10.903663487091064,4.7399452209472654,10.612648487091064,4.4489352209472655,10.612648487091064,4.089945220947266C10.612648487091064,3.7309602209472654,10.903663487091064,3.4399452209472656,11.262648487091065,3.4399452209472656Z" fillRule="evenodd" fill="currentColor" fillOpacity="1"/></g><g><path d="M8.154985904693604,2.9746092796325683C8.154985904693604,2.615624279632568,8.446000904693603,2.3246092796325684,8.804985904693604,2.3246092796325684C9.163975904693604,2.3246092796325684,9.454985904693604,2.615624279632568,9.454985904693604,2.9746092796325683L9.454985904693604,5.208659279632569C9.454985904693604,5.567649279632569,9.163975904693604,5.858659279632569,8.804985904693604,5.858659279632569C8.446000904693603,5.858659279632569,8.154985904693604,5.567649279632569,8.154985904693604,5.208659279632569L8.154985904693604,2.9746092796325683Z" fillRule="evenodd" fill="currentColor" fillOpacity="1"/></g><g><path d="M3.0624999046325683,3.4399452209472656L8.805409904632569,3.4399452209472656C9.164399904632567,3.4399452209472656,9.455409904632567,3.7309602209472654,9.455409904632567,4.089945220947266C9.455409904632567,4.4489352209472655,9.164399904632567,4.7399452209472654,8.805409904632569,4.7399452209472654L3.0624999046325683,4.7399452209472654C2.703514904632568,4.7399452209472654,2.4124999046325684,4.4489352209472655,2.4124999046325684,4.089945220947266C2.4124999046325684,3.7309602209472654,2.703514904632568,3.4399452209472656,3.0624999046325683,3.4399452209472656Z" fillRule="evenodd" fill="currentColor" fillOpacity="1"/></g><g><path d="M3.0624999046325683,7.350160121917725L5.296549904632569,7.350160121917725C5.655539904632569,7.350160121917725,5.946549904632569,7.641175121917724,5.946549904632569,8.000160121917725C5.946549904632569,8.359150121917725,5.655539904632569,8.650160121917725,5.296549904632569,8.650160121917725L3.0624999046325683,8.650160121917725C2.703514904632568,8.650160121917725,2.4124999046325684,8.359150121917725,2.4124999046325684,8.000160121917725C2.4124999046325684,7.641175121917724,2.703514904632568,7.350160121917725,3.0624999046325683,7.350160121917725Z" fillRule="evenodd" fill="currentColor" fillOpacity="1"/></g><g><path d="M6.480113506317139,6.884824180603028C6.480113506317139,6.525839180603027,6.7711285063171385,6.234824180603027,7.130113506317139,6.234824180603027C7.4891035063171385,6.234824180603027,7.7801135063171385,6.525839180603027,7.7801135063171385,6.884824180603028L7.7801135063171385,9.118874180603028C7.7801135063171385,9.477864180603028,7.4891035063171385,9.768874180603028,7.130113506317139,9.768874180603028C6.7711285063171385,9.768874180603028,6.480113506317139,9.477864180603028,6.480113506317139,9.118874180603028L6.480113506317139,6.884824180603028Z" fillRule="evenodd" fill="currentColor" fillOpacity="1"/></g><g transform="matrix(1,-0.0025653275661170483,0.0025653273332864046,1,-0.018859844346941657,0.016620534905417372)"><path d="M7.128913307189942,7.351827621459961L12.936313307189941,7.351827621459961C13.295303307189942,7.351827621459961,13.586313307189942,7.642842621459961,13.586313307189942,8.001827621459961C13.586313307189942,8.360817621459962,13.295303307189942,8.651827621459962,12.936313307189941,8.651827621459962L7.128913307189942,8.651827621459962C6.769928307189941,8.651827621459962,6.478913307189941,8.360817621459962,6.478913307189941,8.001827621459961C6.478913307189941,7.642842621459961,6.769928307189941,7.351827621459961,7.128913307189942,7.351827621459961Z" fillRule="evenodd" fill="currentColor" fillOpacity="1"/></g><g><path d="M11.262648487091065,11.260374546051025L12.938188487091065,11.260374546051025C13.297168487091064,11.260374546051025,13.588188487091065,11.551389546051025,13.588188487091065,11.910374546051026C13.588188487091065,12.269364546051026,13.297168487091064,12.560374546051026,12.938188487091065,12.560374546051026L11.262648487091065,12.560374546051026C10.903663487091064,12.560374546051026,10.612648487091064,12.269364546051026,10.612648487091064,11.910374546051026C10.612648487091064,11.551389546051025,10.903663487091064,11.260374546051025,11.262648487091065,11.260374546051025Z" fillRule="evenodd" fill="currentColor" fillOpacity="1"/></g><g><path d="M8.154985904693604,10.793170356750489C8.154985904693604,10.434185356750488,8.446000904693603,10.143170356750488,8.804985904693604,10.143170356750488C9.163975904693604,10.143170356750488,9.454985904693604,10.434185356750488,9.454985904693604,10.793170356750489L9.454985904693604,13.027220356750489C9.454985904693604,13.386210356750489,9.163975904693604,13.677220356750489,8.804985904693604,13.677220356750489C8.446000904693603,13.677220356750489,8.154985904693604,13.386210356750489,8.154985904693604,13.027220356750489L8.154985904693604,10.793170356750489Z" fillRule="evenodd" fill="currentColor" fillOpacity="1"/></g><g><path d="M3.0624999046325683,11.260374546051025L8.57612990463257,11.260374546051025C8.935109904632569,11.260374546051025,9.226129904632568,11.551389546051025,9.226129904632568,11.910374546051026C9.226129904632568,12.269364546051026,8.935109904632569,12.560374546051026,8.57612990463257,12.560374546051026L3.0624999046325683,12.560374546051026C2.703514904632568,12.560374546051026,2.4124999046325684,12.269364546051026,2.4124999046325684,11.910374546051026C2.4124999046325684,11.551389546051025,2.703514904632568,11.260374546051025,3.0624999046325683,11.260374546051025Z" fillRule="evenodd" fill="currentColor" fillOpacity="1"/></g></g></g></svg>
                                </div>
                            </div>
                            <div className="left-content-data">
                                <div className="left-content-data-title">
                                    <CaretDownFilled />{t('agentRun.basicInformation')}
                                    <div className="useToolBox">
                                        <Switch checked={agentSupplementaryInfo.useToolBox==="1"} onChange={(checked)=>inToolBoxChange(checked?"1":"0")}/>
                                        {t('agentRun.toolbox')}
                                    </div>
                                </div>
                                <div className="left-content-data-info">
                                    <div className="icon">
                                        <Spin spinning={iconSpinning}>
                                            <CustomUpload {...props}>
                                                <img src={waxberryObj.imgeFileId ? `${globalInitConfig.REACT_APP_API_FS_URL}file/download/${waxberryObj.imgeFileId}` : DefaultPng} width="90" height="90"/>
                                            </CustomUpload>
                                        </Spin>
                                        <span className="size">{t('waxberryForm.recommendedAspectRatio')}：1:1</span>
                                        <img onClick={()=>generateImageBlur()} src={AiSvg} className="ai"/>
                                    </div>
                                    <div className="info-data">
                                        <Input value={waxberryObj.name} onBlur={()=>waxberryBlur()} onChange={(e)=>waxberryObjChange("name",e.target.value)} placeholder={t('waxberryForm.pleaseEnter')}/>
                                        <TextArea rows={2} value={waxberryObj.discription} onBlur={()=>waxberryBlur()} onChange={(e)=>waxberryObjChange("discription",e.target.value)} placeholder={t('agentRun.describeYourAppForDisplay')}/>
                                    </div>
                                </div>
                                <div className="left-content-data-capacity">
                                    <div className="capacity-header">
                                        <div className="tabs">
                                            <div className={tab === "extend" ? "tab tabActive" : "tab"} onClick={()=>selectTab("extend")}>
                                                <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="16" height="16" viewBox="0 0 16 16"><defs><clipPath id="master_svg0_228_75882"><rect x="0" y="0" width="16" height="16" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_228_75882)"><g><path d="M11.61849,2L4.3815100000000005,2C3.07081,2,2,3.07239,2,4.38204L2,11.61796C2,12.929,3.0721499999999997,14,4.3815100000000005,14L11.61849,14C12.9292,14,14,12.9276,14,11.61796L14,4.38338C14.0013,3.07239,12.9292,2,11.61849,2ZM5.926740000000001,10.28954L4.11079,8.479890000000001L5.195,8.479890000000001L5.20706,5.9008L6.64507,5.9008L6.64507,8.454419999999999L7.75475,8.454419999999999L5.926740000000001,10.28954ZM10.82511,7.52949L10.81304,10.10858L9.375029999999999,10.10858L9.375029999999999,7.55496L8.265360000000001,7.55496L10.09337,5.71984L11.90931,7.52949L10.82511,7.52949Z" fill="currentColor"/></g></g></svg>
                                                {t('agentRun.agentConfig')}
                                            </div>
                                            <div className={tab === "instruction" ? "tab tabActive" : "tab"} onClick={()=>selectTab("instruction")}>
                                                <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="16" height="16" viewBox="0 0 16 16"><defs><clipPath id="master_svg0_385_74273"><rect x="0" y="0" width="16" height="16" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_385_74273)"><g><path d="M13.4482890625,2.59765625C13.7824890625,2.59765625,14.0536890625,2.86886125,14.0536890625,3.20302525L14.0536890625,11.67819625C14.0536890625,12.01235625,13.7824890625,12.28356625,13.4482890625,12.28356625L4.6432090625,12.28356625L1.9462890625,14.40235625L1.9462890625,3.20302525C1.9462890625,2.86886125,2.2174940625,2.59765625,2.5516580625,2.59765625L13.4482890625,2.59765625ZM7.3716090625,5.68503625L7.1010090625,5.26854625C6.0192090625,5.7377062500000005,5.2758190625,6.68692625,5.2758190625,7.74631625C5.2758190625,8.34866625,5.4435090625,8.72035625,5.7552690625,9.05149625C5.9514090625,9.25974625,6.2619690625,9.40805625,6.5870490625,9.40805625C7.1718390625,9.40805625,7.6464490625,8.93344625,7.6464490625,8.34866625C7.6464490625,7.79172625,7.2160290625,7.34314625,6.6693790625,7.29229625C6.5725190625,7.28321625,6.4732390625,7.28502625,6.3794090625,7.29834625L6.3794090625,7.24265625C6.3830390625,6.98718625,6.4350990625,6.25408625,7.2596090625,5.74981625L7.3716090625,5.68503625L7.1010090625,5.26854625L7.3716090625,5.68503625ZM10.1278490625,5.26854625C9.0460590625,5.7377062500000005,8.3026690625,6.68692625,8.3026690625,7.74631625C8.3026690625,8.34866625,8.4703490625,8.72035625,8.7821190625,9.05149625C8.978259062500001,9.25974625,9.2888090625,9.40805625,9.6138990625,9.40805625C10.1986790625,9.40805625,10.6732890625,8.93344625,10.6732890625,8.34866625C10.6732890625,7.79172625,10.2428690625,7.34314625,9.696229062499999,7.29229625C9.5993690625,7.28321625,9.500089062499999,7.28502625,9.406249062499999,7.29834625C9.406249062499999,7.10886625,9.388699062499999,6.23168625,10.3984490625,5.68503625L10.1278490625,5.26854625Z" fill="currentColor"/></g></g></svg>
                                                {t('agentRun.promptWords')}
                                            </div>
                                        </div>
                                        {tab === "instruction" && <div className="operate">
                                            <img src={AiSvg} onClick={()=>generate_user_prompt()}/>
                                            <div className="template" onClick={()=>user_prompt_template()}>
                                                <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="16" height="16" viewBox="0 0 16 16"><defs><clipPath id="master_svg0_228_17244"><rect x="0" y="0" width="16" height="16" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_228_17244)"><g><path d="M12.1667,1.8330078125C13.1792,1.8330078125,14,2.6538408125,14,3.6663378125L14,13.6663078125C14,14.0657078125,13.555,14.3038078125,13.2227,14.0823078125L12.017,13.2787078125L11.06667,13.9913078125C10.82963,14.1691078125,10.5037,14.1691078125,10.26667,13.9913078125L9.33333,13.2913078125L8.4,13.9913078125C8.16296,14.1691078125,7.83704,14.1691078125,7.6,13.9913078125L6.66667,13.2913078125L5.7333300000000005,13.9913078125C5.4963,14.1691078125,5.17037,14.1691078125,4.93333,13.9913078125L3.983,13.2787078125L2.777332,14.0823078125C2.445,14.3040078125,2,14.0657078125,2,13.6663078125L2,3.6663378125C2,2.6538408125,2.820833,1.8330078125,3.83333,1.8330078125L12.1667,1.8330078125ZM12.1667,2.8330078125L3.83333,2.8330078125C3.3731,2.8330078125,3,3.2061078125,3,3.6663378125L3,12.7320078125L3.6245000000000003,12.3157078125C3.8597200000000003,12.1589078125,4.168229999999999,12.1675078125,4.39433,12.3372078125L5.33333,13.0413078125L6.26667,12.3413078125C6.5037,12.1636078125,6.82963,12.1636078125,7.06667,12.3413078125L8,13.0413078125L8.93333,12.3413078125C9.17037,12.1636078125,9.4963,12.1636078125,9.733329999999999,12.3413078125L10.66667,13.0413078125L11.60567,12.3372078125C11.83177,12.1675078125,12.1403,12.1589078125,12.3755,12.3157078125L13,12.7320078125L13,3.6663378125C13,3.2061078125,12.6269,2.8330078125,12.1667,2.8330078125ZM8.83333,8.1663378125C9.10948,8.1663378125,9.33333,8.3901978125,9.33333,8.6663378125C9.33333,8.9424878125,9.10948,9.1663378125,8.83333,9.1663378125L5.5,9.1663378125C5.22386,9.1663378125,5,8.9424878125,5,8.6663378125C5,8.3901978125,5.22386,8.1663378125,5.5,8.1663378125L8.83333,8.1663378125ZM10.5,5.4996778125C10.77614,5.4996778125,11,5.7235278125,11,5.9996778125C11,6.2758178125,10.77614,6.4996778125,10.5,6.4996778125L5.5,6.4996778125C5.22386,6.4996778125,5,6.2758178125,5,5.9996778125C5,5.7235278125,5.22386,5.4996778125,5.5,5.4996778125L10.5,5.4996778125Z" fill="currentColor"/></g></g></svg>
                                                {t('template')}
                                            </div>
                                        </div>}
                                    </div>
                                    <div className="capacity-content">
                                        {tab === "instruction" && <Spin spinning={spinning}><TextArea className="instruction" value={agentSupplementaryInfo.roleInstruction} onBlur={()=>agentBlur()} onChange={(e)=> agentObjChange("roleInstruction",e.target.value)} placeholder={t('waxberryForm.pleaseEnter')}/></Spin>}
                                        {tab === "extend" &&
                                        <div className="extend">
                                            <div className="left-content-data-title">
                                                <CaretDownFilled />
                                                <span><font color="red">*</font>{t('agentRun.restrictions')}</span>
                                            </div>
                                            <Input value={agentSupplementaryInfo.impose} onBlur={()=> agentBlur()} onChange={(e)=> agentObjChange("impose",e.target.value)} placeholder={t('agentRun.enterRestrictions')}/>
                                            <div className="left-content-data-title">
                                                <CaretDownFilled />
                                                <span><font color="red">*</font>{t('agentRun.openingStatement')}</span>
                                            </div>
                                            <TextArea rows={2} value={agentSupplementaryInfo.prologue} onBlur={()=> agentBlur()} onChange={(e)=> agentObjChange("prologue",e.target.value)} placeholder={t('agentRun.enterOpeningStatement')}/>
                                            <div className="left-content-data-title"><CaretDownFilled />{t('agentRun.recommendedQuestions')}</div>
                                            <Input value={agentSupplementaryInfo.recommendedQuestionOne} onBlur={()=> agentBlur()} onChange={(e)=> agentObjChange("recommendedQuestionOne",e.target.value)} placeholder={t('agentRun.enterRecommendedQuestions')}/>
                                            <Input value={agentSupplementaryInfo.recommendedQuestionTwo} onBlur={()=> agentBlur()} onChange={(e)=> agentObjChange("recommendedQuestionTwo",e.target.value)} placeholder={t('agentRun.enterRecommendedQuestions')}/>
                                            <Input value={agentSupplementaryInfo.recommendedQuestionThree} onBlur={()=> agentBlur()} onChange={(e)=> agentObjChange("recommendedQuestionThree",e.target.value)} placeholder={t('agentRun.enterRecommendedQuestions')}/>
                                        </div>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="app-content-right">
                            <div id="drag"/>
                            <div className="right-header">
                                <span className="label">{t('agentRun.previewTest')}</span>
                                <svg onClick={()=> deleteSession()} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="24" height="24" viewBox="0 0 24 24"><defs><clipPath id="master_svg0_385_56025"><rect x="0" y="0" width="24" height="24" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_385_56025)"><g transform="matrix(0.7071067690849304,0.7071067690849304,-0.7071067690849304,0.7071067690849304,3.57686682685744,-8.45953865989577)"><path d="M33.3797,7.913670625L27.45,1.983980625C26.517200000000003,1.051171625,24.9938,1.051171625,24.0609,1.983980625L21.520310000000002,4.524610625L18.13125,1.135550625C16.73438,-0.261328375,14.44688,-0.261328375,13.04766,1.135550625C11.650781,2.532420625,11.650781,4.819920625,13.04766,6.219140625L16.43672,9.608200625L13.89375,12.148790625C12.960938,13.081590625,12.960938,14.605090625,13.89375,15.537890625L19.823439999999998,21.467590625C20.75625,22.400390625,22.2797,22.400390625,23.2125,21.467590625L33.3797,11.300390625C34.3125,10.369890625,34.3125,8.844140625,33.3797,7.913670625ZM15.59531,13.163690625L17.79375,10.965190625L18.47344,10.285590625C18.84844,9.910550625,18.84844,9.303510625,18.47344,8.928520625L17.79375,8.248830625L14.40469,4.859770625C13.75078,4.205860625,13.75078,3.144140625,14.40469,2.492580625C15.05859,1.838670625,16.12031,1.838670625,16.77188,2.492580625L20.16094,5.881640625L20.84063,6.561330625C21.21563,6.936330625,21.82266,6.936330625,22.197699999999998,6.561330625L22.877299999999998,5.881640625L25.0758,3.683200625C25.4484,3.310550625,26.060200000000002,3.310550625,26.4328,3.683200625L27.4242,4.674610625L16.58672,15.514490625L15.59531,14.523090625C15.22031,14.148090625,15.22031,13.538690625,15.59531,13.163690625ZM31.6805,10.285590625L29.2922,12.673790625L27.4148,10.796490625C27.0422,10.423790625,26.430500000000002,10.423790625,26.0578,10.796490625C25.685200000000002,11.169090625,25.685200000000002,11.780890625,26.0578,12.153490625L27.935200000000002,14.030890625L25.898400000000002,16.069890625L24.0211,14.192590625C23.648400000000002,13.819890625,23.0367,13.819890625,22.664099999999998,14.192590625C22.2914,14.565190625,22.2914,15.176990625,22.664099999999998,15.549590625L24.5414,17.426990625L22.2,19.768390625C21.82734,20.140990625,21.21562,20.140990625,20.84297,19.768390625L17.94375,16.871490625L28.7836,6.031640625L31.6805,8.928510625C32.0531,9.301170625,32.0531,9.912890625,31.6805,10.285590625Z" fill="currentColor"/></g></g></svg>
                                <svg onClick={()=> openCodeView()} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="24" height="24" viewBox="0 0 24 24"><defs><clipPath id="master_svg0_228_050277"><rect x="0" y="0" width="24" height="24" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_228_050277)"><g><path d="M11.999740234375,0.060546875C5.423740234375,0.060546875,0.083740234375,5.388546875,0.083740234375,11.976546875C0.083740234375,18.564546875,5.423740234375,23.880546875,11.999740234375,23.880546875C18.575740234375,23.880546875,23.915740234375,18.552546875,23.915740234375,11.964546875C23.915740234375,5.376546875,18.587740234375,0.060546875,11.999740234375,0.060546875ZM11.999740234375,22.128546875C6.383740234375,22.128546875,1.835740234375,17.580546875,1.835740234375,11.964546875C1.835740234375,6.348546875,6.383740234375,1.800546875,11.999740234375,1.800546875C17.615740234375,1.800546875,22.163740234375,6.348546875,22.163740234375,11.964546875C22.163740234375,17.580546875,17.615740234375,22.128546875,11.999740234375,22.128546875Z" fill="currentColor" /></g><g><path d="M10.679931640625,7.127453125C10.679931640625,6.779453125,10.799931640625,6.491453125,11.051931640625,6.275453125C11.303932640625,6.059453125,11.615931640625,5.939453125,12.011931640625,5.939453125C12.407931640625,5.939453125,12.731931640625,6.047453125,12.983931640625,6.275453125C13.235931640625001,6.503453125,13.355931640625,6.779453125,13.355931640625,7.127453125C13.355931640625,7.475453125,13.235931640625001,7.763453125,12.983931640625,7.991453125C12.731931640625,8.219453125,12.407931640625,8.339453125,12.023931640625,8.339453125C11.639930640625,8.339453125,11.327931640625,8.219453125,11.075931640625,7.991453125C10.811931640625,7.751453125,10.679931640625,7.463453125,10.679931640625,7.127453125ZM10.859931640625,17.531453125L10.859931640625,9.659453125L13.151931640625,9.659453125L13.151931640625,17.519453125L10.859931640625,17.519453125L10.859931640625,17.531453125Z" fill="currentColor"/></g></g></svg>
                            </div>
                            {messageData.length > 0 ?
                                <div className="dialogues" id="dialogues">
                                    {messageData.map((dialogue,key)=>(
                                        <div className="dialogue" key={key}>
                                            <div className="question">
                                                {dialogue.reponseFileId && <div className="fileOperate" onClick={()=> openFile(dialogue)}>
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
                                                            <svg onClick={()=> copy(dialogue.reponse)} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="24" height="24" viewBox="0 0 24 24"><defs><clipPath id="master_svg0_140_036157"><rect x="0" y="0" width="24" height="24" rx="4"/></clipPath></defs><g clipPath="url(#master_svg0_140_036157)"><g><path d="M14.33519,7.66667C14.88759,7.66667,15.33541,8.11438,15.33541,8.66667L15.33541,18C15.33541,18.552300000000002,14.88759,19,14.33519,19L7.0002200000000006,19C6.447815,19,6,18.552300000000002,6,18L6,8.66667C5.999999880764,8.11438,6.447815,7.66667,7.0002200000000006,7.66667L14.33519,7.66667ZM14.00178,9L7.33363,9L7.33363,17.6667L14.00178,17.6667L14.00178,9ZM16.9998,5.000000178814C17.5152,4.999681234,17.9465,5.391043,17.996000000000002,5.904L18,6L18,14.99533C17.9996,15.3481,17.7245,15.6394,17.3723,15.6601C17.0201,15.6808,16.712699999999998,15.4236,16.671,15.0733L16.6664,14.99533L16.6664,6.33333L10.00089,6.33333C9.66283,6.33329,9.37829,6.08033,9.33874,5.744667L9.33407,5.666667C9.33412,5.328684,9.58714,5.044211,9.92287,5.00466675L10.00089,5.000000178814L16.9998,5.000000178814Z" fill="var(--text-color1)"/></g></g></svg>
                                                        </Tooltip>
                                                        <Tooltip title={t('delete')}>
                                                            <svg onClick={()=> deleteMessage(dialogue.id)} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="24" height="24" viewBox="0 0 24 24"><defs><clipPath id="master_svg0_140_030708"><rect x="0" y="0" width="24" height="24" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_140_030708)"><g><path d="M10.697949999999999,6.32406L13.302050000000001,6.32406Q13.56261,6.32406,13.746839999999999,6.13016Q13.93108,5.936255,13.93108,5.662032Q13.93108,5.38781,13.746839999999999,5.193905Q13.56261,5,13.302050000000001,5L10.697949999999999,5Q10.43739,5,10.253160000000001,5.193905Q10.06892,5.387809,10.06892,5.662032Q10.06892,5.936255,10.253160000000001,6.13016Q10.43739,6.32406,10.697949999999999,6.32406ZM7.1393,8.03703L7.1393,16.967599999999997Q7.1393,17.8094,7.70491,18.4047Q8.27052,19,9.07038,19L14.92962,19Q15.72948,19,16.295099999999998,18.4047Q16.8607,17.8094,16.8607,16.967599999999997L16.8607,9.43055Q16.8607,9.15633,16.6765,8.96243Q16.4922,8.76852,16.2317,8.76852Q15.97112,8.76852,15.78688,8.96243Q15.60265,9.15633,15.60265,9.43055L15.60265,16.967599999999997Q15.60265,17.261,15.40552,17.4685Q15.2084,17.6759,14.92962,17.6759L9.07038,17.6759Q8.791599999999999,17.6759,8.59448,17.4685Q8.39735,17.261,8.39735,16.967599999999997L8.39735,8.03703L17.371000000000002,8.03703Q17.631500000000003,8.03703,17.8158,7.84312Q18,7.64922,18,7.375Q18,7.10077,17.8158,6.90687Q17.631500000000003,6.71296,17.371000000000002,6.71296L6.629028,6.71296Q6.368476,6.71296,6.184238,6.90687Q6,7.10077,6,7.375Q6,7.64922,6.184238,7.84312Q6.368476,8.03703,6.629028,8.03703L7.1393,8.03703ZM10.06892,10.80092L10.06892,14.91204Q10.06892,15.1863,10.253160000000001,15.3802Q10.43739,15.5741,10.697949999999999,15.5741Q10.9585,15.5741,11.14274,15.3802Q11.32697,15.1863,11.32697,14.91204L11.32697,10.80092Q11.32697,10.5267,11.14274,10.332799999999999Q10.9585,10.13889,10.697949999999999,10.13889Q10.4374,10.13889,10.253160000000001,10.332799999999999Q10.06892,10.5267,10.06892,10.80092ZM12.67303,10.80092L12.67303,14.91204Q12.67303,15.1863,12.85726,15.3802Q13.0415,15.5741,13.302050000000001,15.5741Q13.56261,15.5741,13.746839999999999,15.3802Q13.93108,15.1863,13.93108,14.91204L13.93108,10.80092Q13.93108,10.5267,13.746839999999999,10.332799999999999Q13.5626,10.13889,13.302050000000001,10.13889Q13.0415,10.13889,12.85726,10.332799999999999Q12.67303,10.5267,12.67303,10.80092Z" fillRule="evenodd" fill="var(--text-color1)"/></g></g></svg>
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
                                    <span className="prologue" onClick={()=>  updateMessage(agentSupplementaryInfo.prologue)}>{agentSupplementaryInfo.prologue}</span>
                                    {agentSupplementaryInfo.recommendedQuestionOne && <span className="recommendedQuestion" onClick={()=>  updateMessage(agentSupplementaryInfo.recommendedQuestionOne)}>{agentSupplementaryInfo.recommendedQuestionOne}</span> }
                                    {agentSupplementaryInfo.recommendedQuestionTwo && <span className="recommendedQuestion" onClick={()=>  updateMessage(agentSupplementaryInfo.recommendedQuestionTwo)}>{agentSupplementaryInfo.recommendedQuestionTwo}</span> }
                                    {agentSupplementaryInfo.recommendedQuestionThree && <span className="recommendedQuestion" onClick={()=>  updateMessage(agentSupplementaryInfo.recommendedQuestionThree)}>{agentSupplementaryInfo.recommendedQuestionThree}</span> }
                                </div>
                            }
                            <div className="inputDiv">
                                <Cascader
                                    open={inputFileOpen}
                                    className="inputFileCascader"
                                    popupClassName="inputFileCascaderPopup"
                                    placement="topLeft"
                                    options={inputFileOptions}
                                    onChange={ inputFileChange }
                                    onDropdownVisibleChange={(open)=> setInputFileOpen(open)  }
                                />
                                <div className="input" onDrop={ handleDrop } onPaste={ handlePaste }>
                                    <input style={{display: 'none'}} ref={node =>  fileUploadRef.current = node} type="file" multiple accept=".pdf,.txt,.csv,.docx,.doc,.xlsx,.xls,.pptx,.ppt,.md,.mobi,.epub,.py,.java,.js,.ts,.cpp,.h,.hpp,.html,.css,.php,.rb,.pl,.sh,.bash,.swift,.kt,.go,.dart,.scala,.css,.xml,.vue,.json,.yaml,.yml,.xml,.env,.ini,.toml,.plist,.feature,.bat,.md,.cmd,.ps1,.vbs,.vmc,.vbox,.dockerfile,.proto,.lua,.mod,.sum,.png,.jpeg,.jpg,.webp" onChange={ (e)=>handleFileUpload("file",e)}/>
                                    <input style={{display: 'none'}} ref={node =>  imageUploadRef.current = node} type="file" multiple accept="image/*" onChange={ (e)=>handleFileUpload("image",e)}/>
                                    {fileList.length>0 && <FileListV2 fileList={fileList} closeFunction={(index)=> closeFunction(index)} onClickFunction={(fileName)=> fileClickFunction(fileName)}/>}
                                    {insertTableData.length>0 && <ExtraDialogue
                                        tablesData={insertTableData}
                                        handleTableChange={(data)=>setInsertTableData(data)}
                                        tableMdChange={(data)=>setInsertTableMd(data)}
                                    />}
                                    <TextArea
                                        value={message}
                                        placeholder={t('agentRun.enterQuestionWithFileUpload')}
                                        onChange={(e)=> handleChange(e)}
                                        autoSize={{ minRows: 1, maxRows: 8 }}
                                        // onKeyPress={(e)=> onKeyPress(e)}
                                        // onPressEnter={()=>  send()}
                                    />
                                    <div className="operate">
                                        <div className="link">
                                            <svg onClick={()=>  fileUploadRef.current.click()}  xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="24" height="24" viewBox="0 0 24 24"><defs><clipPath id="master_svg0_323_071428"><rect x="24" y="0" width="24" height="24" rx="0"/></clipPath></defs><g transform="matrix(-1,0,0,1,48,0)" clipPath="url(#master_svg0_323_071428)"><g transform="matrix(0.7384299635887146,-0.6743301749229431,0.6743301749229431,0.7384299635887146,-1.5584574058884755,18.442791270619637)"><path d="M39.413321826171874,13.877295126953126C38.69382182617188,13.079195126953126,37.714321826171876,12.633075126953125,36.693721826171874,12.635125126953126L36.689721826171876,12.635125126953126C35.673021826171876,12.633075126953125,34.695421826171874,13.077145126953125,33.97792182617187,13.871155126953125L33.97592182617188,13.873205126953124L26.892291826171874,21.674155126953124C26.233391826171875,22.402655126953125,26.037871826171873,23.495455126953125,26.395681826171874,24.444955126953126C26.753481826171875,25.394555126953126,27.596161826171876,26.012555126953124,28.530741826171877,26.010555126953125C29.121211826171873,26.010555126953125,29.709731826171875,25.764955126953126,30.157461826171875,25.269755126953125L37.24112182617188,17.468765126953123C37.542221826171875,17.137245126953125,37.542221826171875,16.601075126953127,37.24112182617188,16.269565126953125C36.94002182617187,15.938045126953124,36.45322182617188,15.938045126953124,36.15212182617188,16.269565126953125L29.070381826171875,24.070555126953124C28.925691826171875,24.228055126953123,28.730171826171876,24.316055126953124,28.526831826171875,24.316055126953124C28.323491826171875,24.316055126953124,28.127971826171876,24.226055126953124,27.985251826171876,24.066455126953123C27.838611826171874,23.910855126953123,27.756491826171874,23.696055126953127,27.754531826171874,23.470955126953125C27.754531826171874,23.245755126953124,27.834701826171873,23.030955126953124,27.979381826171874,22.873355126953125L35.06302182617188,15.072405126953125C35.493221826171876,14.595585126953125,36.07972182617188,14.329555126953124,36.689721826171876,14.331605126953125L36.69172182617187,14.331605126953125C37.30372182617187,14.329555126953124,37.89222182617188,14.599685126953124,38.324321826171875,15.076495126953125C38.760321826171875,15.555355126953124,39.00082182617187,16.195885126953126,39.00082182617187,16.873255126953126C39.00272182617188,17.546525126953124,38.760321826171875,18.193195126953125,38.32822182617188,18.667965126953124L36.41602182617187,20.773725126953124L36.40432182617187,20.786005126953125L31.103781826171875,26.626455126953125C29.600231826171875,28.279955126953126,27.164061826171874,28.282055126953125,25.658571826171876,26.628555126953124C24.935151826171875,25.834555126953127,24.530421826171874,24.756055126953125,24.534331826171876,23.632555126953125C24.534331826171876,22.498855126953124,24.935151826171875,21.432655126953126,25.662481826171874,20.632525126953126L32.884961826171875,12.678095126953124C33.186021826171874,12.346575126953125,33.186021826171874,11.810415126953124,32.884961826171875,11.478895126953125C32.583861826171876,11.147375226953125,32.09701182617187,11.147375226953125,31.795921826171877,11.478895126953125L24.573441826171877,19.433325126953125C23.558692826171875,20.544525126953125,22.989731936171875,22.056855126953124,22.993642262371875,23.632555126953125C22.993642262371875,25.218555126953127,23.552826826171874,26.710355126953125,24.569531826171875,27.827755126953125C25.578411826171873,28.940955126953124,26.948991826171873,29.565155126953126,28.378241826171873,29.561055126953125C29.809441826171877,29.563055126953124,31.181991826171874,28.938955126953125,32.19282182617187,27.823655126953124L39.68312182617187,19.574525126953127C39.75742182617188,19.490625126953127,39.81612182617188,19.390345126953125,39.853221826171875,19.281885126953124C40.299021826171874,18.577915126953126,40.54152182617187,17.747075126953124,40.54152182617187,16.871205126953125C40.54342182617188,15.747725126953124,40.13672182617188,14.669255126953125,39.413321826171874,13.877295126953126Z" fill="currentColor"/></g></g></svg>
                                            <svg onClick={()=>  imageUploadRef.current.click()} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="24" height="24" viewBox="0 0 24 24"><defs><clipPath id="master_svg0_323_071430"><rect x="0" y="0" width="24" height="24" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_323_071430)"><g><path d="M21.25006103515625,3.75L21.25006103515625,20.25L3.25006103515625,20.25L3.25006103515625,3.75L21.25006103515625,3.75ZM17.33456103515625,12.3375L12.26256103515625,16.558500000000002L8.96806103515625,13.9595L4.75006103515625,17.3705L4.75006103515625,18.75L19.75006103515625,18.75L19.75006103515625,14.341L17.33456103515625,12.3375ZM19.75006103515625,5.25L4.75006103515625,5.25L4.75006103515625,15.4415L8.95656103515625,12.04L12.23706103515625,14.628L17.33356103515625,10.388L19.75006103515625,12.392L19.75006103515625,5.25ZM9.50006103515625,6.25C10.74270103515625,6.25,11.75006103515625,7.25736,11.75006103515625,8.5C11.75006103515625,9.74264,10.74270103515625,10.75,9.50006103515625,10.75C8.25742103515625,10.75,7.25006103515625,9.74264,7.25006103515625,8.5C7.25006103515625,7.25736,8.25742103515625,6.25,9.50006103515625,6.25ZM9.50006103515625,7.75C9.08585103515625,7.75,8.75006103515625,8.08579,8.75006103515625,8.5C8.75006103515625,8.91421,9.08585103515625,9.25,9.50006103515625,9.25C9.91427103515625,9.25,10.25006103515625,8.91421,10.25006103515625,8.5C10.25006103515625,8.08579,9.91427103515625,7.75,9.50006103515625,7.75Z" fill="currentColor"/></g></g></svg>
                                            {/*<Voice onVoiceInput={ handleVoiceInput } />*/}
                                            <svg onClick={()=>setShowTableModal(true) } xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="24" height="24" viewBox="0 0 24 24"><defs><clipPath id="master_svg0_323_071434"><rect x="0" y="0" width="24" height="24" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_323_071434)"><g><g><path d="M21.234611376953126,18.7876916015625L21.234611376953126,5.2123506015625Q21.234611376953126,4.5502466015625,20.766411376953126,4.0820716015625Q20.298211376953127,3.6138916015625,19.636111376953124,3.6138916015625L4.363870376953125,3.6138916015625Q3.701766376953125,3.6138916015625,3.233589376953125,4.0820696015625Q2.765411376953125,4.5502466015625,2.765411376953125,5.2123506015625L2.765411376953125,18.7876916015625Q2.765411376953125,19.449791601562502,3.233592376953125,19.9179916015625Q3.701766376953125,20.3861916015625,4.363870376953125,20.3861916015625L19.636111376953124,20.3861916015625Q20.298211376953127,20.3861916015625,20.766411376953126,19.9179916015625Q21.234611376953126,19.449791601562502,21.234611376953126,18.7876916015625ZM19.636111376953124,5.1138916015625Q19.734611376953126,5.1138916015625,19.734611376953126,5.2123506015625L19.734611376953126,18.7876916015625Q19.734611376953126,18.8861916015625,19.636111376953124,18.8861916015625L4.363870376953125,18.8861916015625Q4.265411376953125,18.8861916015625,4.265411376953125,18.7876916015625L4.265411376953125,5.2123506015625Q4.265411376953125,5.1138916015625,4.363870376953125,5.1138916015625L19.636111376953124,5.1138916015625Z" fill="currentColor"/></g><g><path d="M3.515411376953125,8.704645156860352L20.484611376953126,8.704645156860352Q20.558411376953124,8.704645156860352,20.630911376953126,8.71905615686035Q20.703311376953124,8.733467156860351,20.771611376953125,8.761735156860352Q20.839811376953126,8.790004156860352,20.901311376953124,8.831043156860352Q20.962711376953123,8.872082156860351,21.014911376953126,8.924315156860352Q21.067111376953125,8.976548156860352,21.108211376953125,9.037967156860352Q21.149211376953126,9.099387156860352,21.177511376953124,9.167632156860352Q21.205811376953125,9.235878156860352,21.220211376953124,9.30832715686035Q21.234611376953126,9.380776656860352,21.234611376953126,9.454645156860352Q21.234611376953126,9.528513656860351,21.220211376953124,9.600963156860352Q21.205811376953125,9.673412156860351,21.177511376953124,9.741658156860352Q21.149211376953126,9.80990315686035,21.108211376953125,9.87132315686035Q21.067111376953125,9.932742156860352,21.014911376953126,9.98497515686035Q20.962711376953123,10.037208156860352,20.901311376953124,10.078247156860352Q20.839811376953126,10.119286156860351,20.771611376953125,10.147555156860351Q20.703311376953124,10.175823156860352,20.630911376953126,10.190234156860352Q20.558411376953124,10.204645156860352,20.484611376953126,10.204645156860352L3.515411376953125,10.204645156860352Q3.441542876953125,10.204645156860352,3.369093376953125,10.190234156860352Q3.296644376953125,10.175823156860352,3.228398376953125,10.147555156860351Q3.160153376953125,10.119286156860351,3.098733376953125,10.078247156860352Q3.037314376953125,10.037208156860352,2.985081376953125,9.98497515686035Q2.932848376953125,9.932742156860352,2.891809376953125,9.87132315686035Q2.850770376953125,9.80990315686035,2.822501376953125,9.741658156860352Q2.794233376953125,9.673412156860351,2.779822376953125,9.600963156860352Q2.765411376953125,9.528513656860351,2.765411376953125,9.454645156860352Q2.765411376953125,9.380776656860352,2.779822376953125,9.30832715686035Q2.794233376953125,9.235878156860352,2.822501376953125,9.167632156860352Q2.850770376953125,9.099387156860352,2.891809376953125,9.037967156860352Q2.932848376953125,8.976548156860352,2.985081376953125,8.924315156860352Q3.037314376953125,8.872082156860351,3.098733376953125,8.831043156860352Q3.160153376953125,8.790004156860352,3.228398376953125,8.761735156860352Q3.296644376953125,8.733467156860351,3.369093376953125,8.71905615686035Q3.441542876953125,8.704645156860352,3.515411376953125,8.704645156860352Z" fill="currentColor"/></g><g><path d="M8.49250841140747,9.454645156860352Q8.49250841140747,9.380776656860352,8.50691941140747,9.30832715686035Q8.52133041140747,9.235878156860352,8.549598411407471,9.167632156860352Q8.577867411407471,9.099387156860352,8.61890641140747,9.037967156860352Q8.65994541140747,8.976548156860352,8.712178411407471,8.924315156860352Q8.76441141140747,8.872082156860351,8.825830411407471,8.831043156860352Q8.887250411407472,8.790004156860352,8.95549541140747,8.761735156860352Q9.023741411407471,8.733467156860351,9.09619041140747,8.71905615686035Q9.168639911407471,8.704645156860352,9.24250841140747,8.704645156860352Q9.31637691140747,8.704645156860352,9.388826411407472,8.71905615686035Q9.46127541140747,8.733467156860351,9.52952141140747,8.761735156860352Q9.59776641140747,8.790004156860352,9.65918641140747,8.831043156860352Q9.72060541140747,8.872082156860351,9.77283841140747,8.924315156860352Q9.825071411407471,8.976548156860352,9.86611041140747,9.037967156860352Q9.90714941140747,9.099387156860352,9.93541841140747,9.167632156860352Q9.96368641140747,9.235878156860352,9.978097411407472,9.30832715686035Q9.99250841140747,9.380776656860352,9.99250841140747,9.454645156860352L9.99250841140747,19.63614515686035Q9.99250841140747,19.710045156860353,9.978097411407472,19.78244515686035Q9.96368641140747,19.854945156860353,9.93541841140747,19.92314515686035Q9.90714941140747,19.99144515686035,9.86611041140747,20.05284515686035Q9.825071411407471,20.11424515686035,9.77283841140747,20.16644515686035Q9.72060541140747,20.21874515686035,9.65918641140747,20.25974515686035Q9.59776641140747,20.30074515686035,9.52952141140747,20.329045156860353Q9.46127541140747,20.35734515686035,9.388826411407472,20.37174515686035Q9.31637691140747,20.38614515686035,9.24250841140747,20.38614515686035Q9.168639911407471,20.38614515686035,9.09619041140747,20.37174515686035Q9.023741411407471,20.35734515686035,8.95549541140747,20.329045156860353Q8.887250411407472,20.30074515686035,8.825830411407471,20.25974515686035Q8.76441141140747,20.21874515686035,8.712178411407471,20.16644515686035Q8.65994541140747,20.11424515686035,8.61890641140747,20.05284515686035Q8.577867411407471,19.99144515686035,8.549598411407471,19.92314515686035Q8.52133041140747,19.854945156860353,8.50691941140747,19.78244515686035Q8.49250841140747,19.710045156860353,8.49250841140747,19.63614515686035L8.49250841140747,9.454645156860352Z" fill="currentColor"/></g><g><path d="M14.007491111755371,9.454645156860352Q14.007491111755371,9.380776656860352,14.02190211175537,9.30832715686035Q14.036313111755371,9.235878156860352,14.064581111755372,9.167632156860352Q14.092850111755372,9.099387156860352,14.133889111755371,9.037967156860352Q14.17492811175537,8.976548156860352,14.227161111755372,8.924315156860352Q14.279394111755371,8.872082156860351,14.340813111755372,8.831043156860352Q14.402233111755372,8.790004156860352,14.470478111755371,8.761735156860352Q14.538724111755371,8.733467156860351,14.61117311175537,8.71905615686035Q14.683622611755371,8.704645156860352,14.757491111755371,8.704645156860352Q14.83135961175537,8.704645156860352,14.903809111755372,8.71905615686035Q14.97625811175537,8.733467156860351,15.044504111755371,8.761735156860352Q15.11274911175537,8.790004156860352,15.17416911175537,8.831043156860352Q15.235588111755371,8.872082156860351,15.28782111175537,8.924315156860352Q15.340054111755371,8.976548156860352,15.381093111755371,9.037967156860352Q15.42213211175537,9.099387156860352,15.45040111175537,9.167632156860352Q15.478669111755371,9.235878156860352,15.493080111755372,9.30832715686035Q15.507491111755371,9.380776656860352,15.507491111755371,9.454645156860352L15.507491111755371,19.63614515686035Q15.507491111755371,19.710045156860353,15.493080111755372,19.78244515686035Q15.478669111755371,19.854945156860353,15.45040111175537,19.92314515686035Q15.42213211175537,19.99144515686035,15.381093111755371,20.05284515686035Q15.340054111755371,20.11424515686035,15.28782111175537,20.16644515686035Q15.235588111755371,20.21874515686035,15.17416911175537,20.25974515686035Q15.11274911175537,20.30074515686035,15.044504111755371,20.329045156860353Q14.97625811175537,20.35734515686035,14.903809111755372,20.37174515686035Q14.83135961175537,20.38614515686035,14.757491111755371,20.38614515686035Q14.683622611755371,20.38614515686035,14.61117311175537,20.37174515686035Q14.538724111755371,20.35734515686035,14.470478111755371,20.329045156860353Q14.402233111755372,20.30074515686035,14.340813111755372,20.25974515686035Q14.279394111755371,20.21874515686035,14.227161111755372,20.16644515686035Q14.17492811175537,20.11424515686035,14.133889111755371,20.05284515686035Q14.092850111755372,19.99144515686035,14.064581111755372,19.92314515686035Q14.036313111755371,19.854945156860353,14.02190211175537,19.78244515686035Q14.007491111755371,19.710045156860353,14.007491111755371,19.63614515686035L14.007491111755371,9.454645156860352Z" fill="currentColor"/></g><g><path d="M3.515411376953125,13.795398712158203L20.484611376953126,13.795398712158203Q20.558411376953124,13.795398712158203,20.630911376953126,13.809809712158202Q20.703311376953124,13.824220712158203,20.771611376953125,13.852488712158204Q20.839811376953126,13.880757712158204,20.901311376953124,13.921796712158203Q20.962711376953123,13.962835712158203,21.014911376953126,14.015068712158204Q21.067111376953125,14.067301712158203,21.108211376953125,14.128720712158204Q21.149211376953126,14.190140712158204,21.177511376953124,14.258385712158203Q21.205811376953125,14.326631712158203,21.220211376953124,14.399080712158202Q21.234611376953126,14.471530212158203,21.234611376953126,14.545398712158203Q21.234611376953126,14.619267212158203,21.220211376953124,14.691716712158204Q21.205811376953125,14.764165712158203,21.177511376953124,14.832411712158203Q21.149211376953126,14.900656712158202,21.108211376953125,14.962076712158202Q21.067111376953125,15.023495712158203,21.014911376953126,15.075728712158202Q20.962711376953123,15.127961712158204,20.901311376953124,15.169000712158203Q20.839811376953126,15.210039712158203,20.771611376953125,15.238308712158203Q20.703311376953124,15.266576712158203,20.630911376953126,15.280987712158204Q20.558411376953124,15.295398712158203,20.484611376953126,15.295398712158203L3.515411376953125,15.295398712158203Q3.441542876953125,15.295398712158203,3.369093376953125,15.280987712158204Q3.296644376953125,15.266576712158203,3.228398376953125,15.238308712158203Q3.160153376953125,15.210039712158203,3.098733376953125,15.169000712158203Q3.037314376953125,15.127961712158204,2.985081376953125,15.075728712158202Q2.932848376953125,15.023495712158203,2.891809376953125,14.962076712158202Q2.850770376953125,14.900656712158202,2.822501376953125,14.832411712158203Q2.794233376953125,14.764165712158203,2.779822376953125,14.691716712158204Q2.765411376953125,14.619267212158203,2.765411376953125,14.545398712158203Q2.765411376953125,14.471530212158203,2.779822376953125,14.399080712158202Q2.794233376953125,14.326631712158203,2.822501376953125,14.258385712158203Q2.850770376953125,14.190140712158204,2.891809376953125,14.128720712158204Q2.932848376953125,14.067301712158203,2.985081376953125,14.015068712158204Q3.037314376953125,13.962835712158203,3.098733376953125,13.921796712158203Q3.160153376953125,13.880757712158204,3.228398376953125,13.852488712158204Q3.296644376953125,13.824220712158203,3.369093376953125,13.809809712158202Q3.441542876953125,13.795398712158203,3.515411376953125,13.795398712158203Z" fill="currentColor"/></g><g><path d="M4.265411376953125,5.212649497709045L4.265411376953125,18.787650487709044Q4.265411376953125,18.886150487709045,4.363870376953125,18.886150487709045L19.636111376953124,18.886150487709045Q19.734611376953126,18.886150487709045,19.734611376953126,18.787650487709044L19.734611376953126,5.212350487709045Q19.734611376953126,5.138481987709046,19.749011376953124,5.0660324877090455Q19.763411376953126,4.993583487709046,19.791711376953124,4.9253374877090454Q19.819911376953126,4.857092487709045,19.861011376953126,4.795672487709045Q19.902011376953126,4.734253487709045,19.954211376953126,4.682020487709045Q20.006511376953124,4.629787487709045,20.067911376953123,4.588748487709045Q20.129311376953126,4.547709487709046,20.197611376953127,4.519440487709045Q20.265811376953124,4.491172487709045,20.338311376953126,4.476761487709045Q20.410711376953124,4.462350487709045,20.484611376953126,4.462350487709045Q20.558411376953124,4.462350487709045,20.630911376953126,4.476761487709045Q20.703311376953124,4.491172487709045,20.771611376953125,4.519440487709045Q20.839811376953126,4.547709487709046,20.901311376953124,4.588748487709045Q20.962711376953123,4.629787487709045,21.014911376953126,4.682020487709045Q21.067111376953125,4.734253487709045,21.108211376953125,4.795672487709045Q21.149211376953126,4.857092487709045,21.177511376953124,4.9253374877090454Q21.205811376953125,4.993583487709046,21.220211376953124,5.0660324877090455Q21.234611376953126,5.138481987709046,21.234611376953126,5.212350487709045L21.234611376953126,18.787650487709044Q21.234611376953126,19.449850487709046,20.766411376953126,19.917950487709046Q20.298211376953127,20.386150487709045,19.636111376953124,20.386150487709045L4.363870376953125,20.386150487709045Q3.701767376953125,20.386150487709045,3.233591376953125,19.917950487709046Q2.765411376953125,19.449850487709046,2.765411376953125,18.787650487709044L2.765411376953125,5.212350487709045Q2.765411376953125,5.138481987709046,2.779822376953125,5.0660324877090455Q2.794233376953125,4.993583487709046,2.822501376953125,4.9253374877090454Q2.850770376953125,4.857092487709045,2.891809376953125,4.795672487709045Q2.932848376953125,4.734253487709045,2.985081376953125,4.682020487709045Q3.037314376953125,4.629787487709045,3.098733376953125,4.588748487709045Q3.160153376953125,4.547709487709046,3.228398376953125,4.519440487709045Q3.296644376953125,4.491172487709045,3.369093376953125,4.476761487709045Q3.441542876953125,4.462350487709045,3.515411376953125,4.462350487709045Q3.589279876953125,4.462350487709045,3.661729376953125,4.476761487709045Q3.734178376953125,4.491172487709045,3.802424376953125,4.519440487709045Q3.870669376953125,4.547709487709046,3.932089376953125,4.588748487709045Q3.993508376953125,4.629787487709045,4.045741376953125,4.682020487709045Q4.097974376953125,4.734253487709045,4.139013376953125,4.795672487709045Q4.180052376953125,4.857092487709045,4.208321376953125,4.9253374877090454Q4.236589376953125,4.993583487709046,4.251000376953125,5.0660324877090455Q4.265411376953125,5.138481987709046,4.265411376953125,5.212350487709045L4.265411376953125,5.212649497709045Z" fill="currentColor"/></g></g></g></svg>
                                            <svg onClick={()=> setShowFormulaModal(true)} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="24" height="24" viewBox="0 0 24 24"><defs><clipPath id="master_svg0_323_071432"><rect x="0" y="0" width="24" height="24" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_323_071432)"><g><path d="M3.6429491015625,15.218025L2.2541808015625,15.237225L2.2310791015625,13.409815L4.8202491015625,13.374175L5.487539101562501,15.018825L8.2606291015625,3.640625L21.7786791015625,3.640625L21.7786791015625,5.468005L9.644959101562499,5.468005L5.9078091015625,20.807025L3.6429491015625,15.218025ZM10.4552991015625,19.447525L13.5100791015625,14.123425L10.5450391015625,8.284005L18.6190791015625,8.284005L19.7403791015625,11.025075000000001L18.1028791015625,11.733185L17.4390791015625,10.107735L13.4762791015625,10.107735L15.5412791015625,14.172725L13.5651791015625,17.620125L17.4595791015625,17.620125L18.1143791015625,16.147225L19.7288791015625,16.907425L18.5995791015625,19.447525L10.4552991015625,19.447525Z" fill="currentColor"/></g></g></svg>
                                        </div>
                                        {isExecuting ?
                                            <Tooltip title={t('home.stopGeneratin')}>
                                                <svg onClick={()=> stopGenerating()} fill="none" version="1.1" width="32" height="32" viewBox="0 0 32 32"><g><g><g><path d="M27.865000228881836,16.000000228881838Q27.865000228881836,16.291300228881838,27.850700228881834,16.582200228881838Q27.836400228881836,16.873100228881835,27.807900228881834,17.163000228881835Q27.779300228881837,17.452800228881834,27.736600228881837,17.741000228881838Q27.693800228881837,18.029100228881838,27.637000228881835,18.314700228881836Q27.580200228881836,18.60040022888184,27.509400228881837,18.883000228881833Q27.438600228881835,19.165500228881836,27.354100228881837,19.444200228881837Q27.269500228881835,19.723000228881837,27.171400228881836,19.997200228881837Q27.073300228881838,20.271400228881834,26.961800228881835,20.540500228881836Q26.850400228881835,20.809600228881838,26.725800228881837,21.072900228881835Q26.601300228881836,21.336200228881836,26.464000228881837,21.593100228881838Q26.326700228881837,21.850000228881836,26.176900228881834,22.099800228881836Q26.027200228881835,22.349700228881836,25.865400228881835,22.591800228881837Q25.703600228881836,22.834000228881838,25.530100228881835,23.068000228881836Q25.356500228881835,23.301900228881834,25.171800228881835,23.527100228881835Q24.987000228881836,23.752200228881836,24.791400228881837,23.968000228881834Q24.595800228881835,24.183900228881836,24.389800228881835,24.389800228881835Q24.183900228881836,24.595800228881835,23.968000228881834,24.791400228881837Q23.752200228881836,24.987000228881836,23.527100228881835,25.171800228881835Q23.301900228881834,25.356500228881835,23.068000228881836,25.530100228881835Q22.834000228881838,25.703600228881836,22.591800228881837,25.865400228881835Q22.349700228881836,26.027200228881835,22.099800228881836,26.176900228881834Q21.850000228881836,26.326700228881837,21.593100228881838,26.464000228881837Q21.336200228881836,26.601300228881836,21.072900228881835,26.725800228881837Q20.809600228881838,26.850400228881835,20.540500228881836,26.961800228881835Q20.271400228881834,27.073300228881838,19.997200228881837,27.171400228881836Q19.723000228881837,27.269500228881835,19.444200228881837,27.354100228881837Q19.165500228881836,27.438600228881835,18.883000228881833,27.509400228881837Q18.60040022888184,27.580200228881836,18.314700228881836,27.637000228881835Q18.029100228881838,27.693800228881837,17.741000228881838,27.736600228881837Q17.452800228881834,27.779300228881837,17.163000228881835,27.807900228881834Q16.873100228881835,27.836400228881836,16.582200228881838,27.850700228881834Q16.291300228881838,27.865000228881836,16.000000228881838,27.865000228881836Q15.708700228881836,27.865000228881836,15.417800228881836,27.850700228881834Q15.126900228881835,27.836400228881836,14.837000228881836,27.807900228881834Q14.547200228881836,27.779300228881837,14.259000228881836,27.736600228881837Q13.970920228881836,27.693800228881837,13.685250228881836,27.637000228881835Q13.399580228881836,27.580200228881836,13.117040228881836,27.509400228881837Q12.834500228881836,27.438600228881835,12.555770228881835,27.354100228881837Q12.277040228881836,27.269500228881835,12.002800228881835,27.171400228881836Q11.728560228881836,27.073300228881838,11.459460228881836,26.961800228881835Q11.190360228881836,26.850400228881835,10.927060228881835,26.725800228881837Q10.663750228881835,26.601300228881836,10.406880228881835,26.464000228881837Q10.150000228881837,26.326700228881837,9.900170228881837,26.176900228881834Q9.650340228881836,26.027200228881835,9.408160228881837,25.865400228881835Q9.165980228881836,25.703600228881836,8.932030228881835,25.530100228881835Q8.698080228881835,25.356500228881835,8.472920228881836,25.171800228881835Q8.247770228881837,24.987000228881836,8.031950228881836,24.791400228881837Q7.816140228881836,24.595800228881835,7.610180228881836,24.389800228881835Q7.404220228881836,24.183900228881836,7.208610228881836,23.968000228881834Q7.013010228881836,23.752200228881836,6.828230228881836,23.527100228881835Q6.643450228881836,23.301900228881834,6.4699402288818355,23.068000228881836Q6.296430228881836,22.834000228881838,6.1346102288818365,22.591800228881837Q5.972790228881836,22.349700228881836,5.823050228881836,22.099800228881836Q5.673310228881836,21.850000228881836,5.536000228881836,21.593100228881838Q5.398700228881836,21.336200228881836,5.274170228881836,21.072900228881835Q5.149630228881836,20.809600228881838,5.038169228881836,20.540500228881836Q4.926705228881836,20.271400228881834,4.828580228881836,19.997200228881837Q4.730454228881836,19.723000228881837,4.645903228881836,19.444200228881837Q4.561352228881836,19.165500228881836,4.490579228881836,18.883000228881833Q4.419806228881836,18.60040022888184,4.362983228881836,18.314700228881836Q4.306159228881836,18.029100228881838,4.263421228881836,17.741000228881838Q4.220682828881836,17.452800228881834,4.192133428881836,17.163000228881835Q4.163584028881836,16.873100228881835,4.149292128881836,16.582200228881838Q4.135000228881836,16.291300228881838,4.135000228881836,16.000000228881838Q4.135000228881836,15.708700228881836,4.149292128881836,15.417800228881836Q4.163584028881836,15.126900228881835,4.192133428881836,14.837000228881836Q4.220682828881836,14.547200228881836,4.263421228881836,14.259000228881836Q4.306159228881836,13.970920228881836,4.362983228881836,13.685250228881836Q4.419806228881836,13.399580228881836,4.490579228881836,13.117040228881836Q4.561352228881836,12.834500228881836,4.645903228881836,12.555770228881835Q4.730454228881836,12.277040228881836,4.828580228881836,12.002800228881835Q4.926705228881836,11.728560228881836,5.038169228881836,11.459460228881836Q5.149630228881836,11.190360228881836,5.274170228881836,10.927060228881835Q5.398700228881836,10.663750228881835,5.536000228881836,10.406880228881835Q5.673310228881836,10.150000228881837,5.823050228881836,9.900170228881837Q5.972790228881836,9.650340228881836,6.1346102288818365,9.408160228881837Q6.296430228881836,9.165980228881836,6.4699402288818355,8.932030228881835Q6.643450228881836,8.698080228881835,6.828230228881836,8.472920228881836Q7.013010228881836,8.247770228881837,7.208610228881836,8.031950228881836Q7.404220228881836,7.816140228881836,7.610180228881836,7.610180228881836Q7.816140228881836,7.404220228881836,8.031950228881836,7.208610228881836Q8.247770228881837,7.013010228881836,8.472920228881836,6.828230228881836Q8.698080228881835,6.643450228881836,8.932030228881835,6.4699402288818355Q9.165980228881836,6.296430228881836,9.408160228881837,6.1346102288818365Q9.650340228881836,5.972790228881836,9.900170228881837,5.823050228881836Q10.150000228881837,5.673310228881836,10.406880228881835,5.536000228881836Q10.663750228881835,5.398700228881836,10.927060228881835,5.274170228881836Q11.190360228881836,5.149630228881836,11.459460228881836,5.038169228881836Q11.728560228881836,4.926705228881836,12.002800228881835,4.828580228881836Q12.277040228881836,4.730454228881836,12.555770228881835,4.645903228881836Q12.834500228881836,4.561352228881836,13.117040228881836,4.490579228881836Q13.399580228881836,4.419806228881836,13.685250228881836,4.362983228881836Q13.970920228881836,4.306159228881836,14.259000228881836,4.263421228881836Q14.547200228881836,4.220682828881836,14.837000228881836,4.192133428881836Q15.126900228881835,4.163584028881836,15.417800228881836,4.149292128881836Q15.708700228881836,4.135000228881836,16.000000228881838,4.135000228881836Q16.291300228881838,4.135000228881836,16.582200228881838,4.149292128881836Q16.873100228881835,4.163584028881836,17.163000228881835,4.192133428881836Q17.452800228881834,4.220682828881836,17.741000228881838,4.263421228881836Q18.029100228881838,4.306159228881836,18.314700228881836,4.362983228881836Q18.60040022888184,4.419806228881836,18.883000228881833,4.490579228881836Q19.165500228881836,4.561352228881836,19.444200228881837,4.645903228881836Q19.723000228881837,4.730454228881836,19.997200228881837,4.828580228881836Q20.271400228881834,4.926705228881836,20.540500228881836,5.038169228881836Q20.809600228881838,5.149630228881836,21.072900228881835,5.274170228881836Q21.336200228881836,5.398700228881836,21.593100228881838,5.536000228881836Q21.850000228881836,5.673310228881836,22.099800228881836,5.823050228881836Q22.349700228881836,5.972790228881836,22.591800228881837,6.1346102288818365Q22.834000228881838,6.296430228881836,23.068000228881836,6.4699402288818355Q23.301900228881834,6.643450228881836,23.527100228881835,6.828230228881836Q23.752200228881836,7.013010228881836,23.968000228881834,7.208610228881836Q24.183900228881836,7.404220228881836,24.389800228881835,7.610180228881836Q24.595800228881835,7.816140228881836,24.791400228881837,8.031950228881836Q24.987000228881836,8.247770228881837,25.171800228881835,8.472920228881836Q25.356500228881835,8.698080228881835,25.530100228881835,8.932030228881835Q25.703600228881836,9.165980228881836,25.865400228881835,9.408160228881837Q26.027200228881835,9.650340228881836,26.176900228881834,9.900170228881837Q26.326700228881837,10.150000228881837,26.464000228881837,10.406880228881835Q26.601300228881836,10.663750228881835,26.725800228881837,10.927060228881835Q26.850400228881835,11.190360228881836,26.961800228881835,11.459460228881836Q27.073300228881838,11.728560228881836,27.171400228881836,12.002800228881835Q27.269500228881835,12.277040228881836,27.354100228881837,12.555770228881835Q27.438600228881835,12.834500228881836,27.509400228881837,13.117040228881836Q27.580200228881836,13.399580228881836,27.637000228881835,13.685250228881836Q27.693800228881837,13.970920228881836,27.736600228881837,14.259000228881836Q27.779300228881837,14.547200228881836,27.807900228881834,14.837000228881836Q27.836400228881836,15.126900228881835,27.850700228881834,15.417800228881836Q27.865000228881836,15.708700228881836,27.865000228881836,16.000000228881838ZM24.865000228881836,16.000000228881838Q24.865000228881836,15.782400228881835,24.854300228881836,15.565000228881836Q24.843600228881837,15.347700228881836,24.822300228881836,15.131100228881836Q24.801000228881836,14.914500228881836,24.769000228881836,14.699200228881836Q24.737100228881836,14.484000228881836,24.694700228881835,14.270500228881836Q24.652200228881835,14.057080228881835,24.599300228881837,13.845980228881835Q24.546400228881836,13.634880228881835,24.483300228881834,13.426630228881836Q24.420100228881836,13.218370228881836,24.346800228881836,13.013470228881836Q24.273500228881836,12.808570228881836,24.190200228881835,12.607510228881836Q24.106900228881837,12.406450228881836,24.013900228881838,12.209720228881835Q23.920800228881834,12.012990228881836,23.818200228881835,11.821070228881837Q23.715600228881836,11.629140228881836,23.603800228881838,11.442480228881836Q23.491900228881835,11.255820228881836,23.371000228881837,11.074870228881835Q23.250100228881838,10.893920228881836,23.120400228881834,10.719120228881836Q22.990800228881834,10.544330228881837,22.852700228881837,10.376100228881835Q22.714700228881835,10.207880228881836,22.568500228881835,10.046630228881835Q22.422400228881838,9.885380228881836,22.268500228881837,9.731500228881835Q22.114600228881837,9.577610228881836,21.953400228881836,9.431470228881835Q21.792100228881836,9.285320228881837,21.623900228881837,9.147260228881837Q21.455700228881835,9.009200228881836,21.280900228881837,8.879560228881836Q21.106100228881836,8.749930228881837,20.925100228881835,8.629020228881835Q20.744200228881837,8.508120228881836,20.557500228881835,8.396230228881837Q20.370900228881837,8.284350228881836,20.178900228881837,8.181770228881836Q19.987000228881836,8.079180228881835,19.790300228881836,7.986130228881835Q19.593500228881837,7.893090228881836,19.392500228881836,7.809810228881836Q19.191400228881836,7.7265302288818365,18.986500228881837,7.653210228881836Q18.781600228881835,7.5799002288818365,18.573400228881837,7.5167202288818356Q18.365100228881836,7.453550228881836,18.154000228881834,7.400670228881836Q17.942900228881836,7.347790228881836,17.729500228881836,7.305340228881835Q17.516000228881836,7.262880228881836,17.300800228881837,7.230950228881836Q17.085500228881834,7.199020228881836,16.868900228881834,7.177690228881836Q16.652300228881835,7.1563602288818355,16.435000228881837,7.145680228881836Q16.217600228881835,7.135000228881836,16.000000228881838,7.135000228881836Q15.782400228881835,7.135000228881836,15.565000228881836,7.145680228881836Q15.347700228881836,7.1563602288818355,15.131100228881836,7.177690228881836Q14.914500228881836,7.199020228881836,14.699200228881836,7.230950228881836Q14.484000228881836,7.262880228881836,14.270500228881836,7.305340228881835Q14.057080228881835,7.347790228881836,13.845980228881835,7.400670228881836Q13.634880228881835,7.453550228881836,13.426630228881836,7.5167202288818356Q13.218370228881836,7.5799002288818365,13.013470228881836,7.653210228881836Q12.808570228881836,7.7265302288818365,12.607510228881836,7.809810228881836Q12.406450228881836,7.893090228881836,12.209720228881835,7.986130228881835Q12.012990228881836,8.079180228881835,11.821070228881837,8.181770228881836Q11.629140228881836,8.284350228881836,11.442480228881836,8.396240228881837Q11.255820228881836,8.508120228881836,11.074870228881835,8.629020228881835Q10.893920228881836,8.749930228881837,10.719120228881836,8.879560228881836Q10.544330228881837,9.009200228881836,10.376100228881835,9.147260228881837Q10.207880228881836,9.285320228881837,10.046630228881835,9.431470228881835Q9.885380228881836,9.577610228881836,9.731500228881835,9.731500228881835Q9.577610228881836,9.885380228881836,9.431470228881835,10.046630228881835Q9.285320228881837,10.207880228881836,9.147260228881837,10.376100228881835Q9.009200228881836,10.544330228881837,8.879560228881836,10.719130228881836Q8.749930228881837,10.893920228881836,8.629020228881835,11.074870228881835Q8.508120228881836,11.255820228881836,8.396230228881837,11.442480228881836Q8.284350228881836,11.629140228881836,8.181770228881836,11.821070228881837Q8.079180228881835,12.012990228881836,7.986130228881835,12.209720228881835Q7.893090228881836,12.406450228881836,7.809810228881836,12.607510228881836Q7.7265302288818365,12.808570228881836,7.653210228881836,13.013470228881836Q7.5799002288818365,13.218370228881836,7.5167202288818356,13.426630228881836Q7.453550228881836,13.634880228881835,7.400670228881836,13.845980228881835Q7.347790228881836,14.057080228881835,7.305340228881835,14.270500228881836Q7.262880228881836,14.484000228881836,7.230950228881836,14.699200228881836Q7.199020228881836,14.914500228881836,7.177690228881836,15.131100228881836Q7.1563602288818355,15.347700228881836,7.145680228881836,15.565000228881836Q7.135000228881836,15.782400228881835,7.135000228881836,16.000000228881838Q7.135000228881836,16.217600228881835,7.145680228881836,16.435000228881837Q7.1563602288818355,16.652300228881835,7.177690228881836,16.868900228881834Q7.199020228881836,17.085500228881834,7.230950228881836,17.300800228881837Q7.262880228881836,17.516000228881836,7.305340228881835,17.729500228881836Q7.347790228881836,17.942900228881836,7.400670228881836,18.154000228881834Q7.453550228881836,18.365100228881836,7.5167202288818356,18.573400228881837Q7.5799002288818365,18.781600228881835,7.653210228881836,18.986500228881837Q7.7265302288818365,19.191400228881836,7.809810228881836,19.392500228881836Q7.893090228881836,19.593500228881837,7.986130228881835,19.790300228881836Q8.079180228881835,19.987000228881836,8.181770228881836,20.178900228881837Q8.284350228881836,20.370900228881837,8.396230228881837,20.557500228881835Q8.508120228881836,20.744200228881837,8.629020228881835,20.925100228881835Q8.749930228881837,21.106100228881836,8.879560228881836,21.280900228881837Q9.009200228881836,21.455700228881835,9.147260228881837,21.623900228881837Q9.285320228881837,21.792100228881836,9.431470228881835,21.953400228881836Q9.577610228881836,22.114600228881837,9.731500228881835,22.268500228881837Q9.885380228881836,22.422400228881838,10.046630228881835,22.568500228881835Q10.207880228881836,22.714700228881835,10.376100228881835,22.852700228881837Q10.544330228881837,22.990800228881834,10.719130228881836,23.120400228881834Q10.893920228881836,23.250100228881838,11.074870228881835,23.371000228881837Q11.255820228881836,23.491900228881835,11.442480228881836,23.603800228881838Q11.629140228881836,23.715600228881836,11.821070228881837,23.818200228881835Q12.012990228881836,23.920800228881834,12.209720228881835,24.013900228881838Q12.406450228881836,24.106900228881837,12.607510228881836,24.190200228881835Q12.808570228881836,24.273500228881836,13.013470228881836,24.346800228881836Q13.218370228881836,24.420100228881836,13.426630228881836,24.483300228881834Q13.634880228881835,24.546400228881836,13.845980228881835,24.599300228881837Q14.057080228881835,24.652200228881835,14.270500228881836,24.694700228881835Q14.484000228881836,24.737100228881836,14.699200228881836,24.769000228881836Q14.914500228881836,24.801000228881836,15.131100228881836,24.822300228881836Q15.347700228881836,24.843600228881837,15.565000228881836,24.854300228881836Q15.782400228881835,24.865000228881836,16.000000228881838,24.865000228881836Q16.217600228881835,24.865000228881836,16.435000228881837,24.854300228881836Q16.652300228881835,24.843600228881837,16.868900228881834,24.822300228881836Q17.085500228881834,24.801000228881836,17.300800228881837,24.769000228881836Q17.516000228881836,24.737100228881836,17.729500228881836,24.694700228881835Q17.942900228881836,24.652200228881835,18.154000228881834,24.599300228881837Q18.365100228881836,24.546400228881836,18.573400228881837,24.483300228881834Q18.781600228881835,24.420100228881836,18.986500228881837,24.346800228881836Q19.191400228881836,24.273500228881836,19.392500228881836,24.190200228881835Q19.593500228881837,24.106900228881837,19.790300228881836,24.013900228881838Q19.987000228881836,23.920800228881834,20.178900228881837,23.818200228881835Q20.370900228881837,23.715600228881836,20.557500228881835,23.603800228881838Q20.744200228881837,23.491900228881835,20.925100228881835,23.371000228881837Q21.106100228881836,23.250100228881838,21.280900228881837,23.120400228881834Q21.455700228881835,22.990800228881834,21.623900228881837,22.852700228881837Q21.792100228881836,22.714700228881835,21.953400228881836,22.568500228881835Q22.114600228881837,22.422400228881838,22.268500228881837,22.268500228881837Q22.422400228881838,22.114600228881837,22.568500228881835,21.953400228881836Q22.714700228881835,21.792100228881836,22.852700228881837,21.623900228881837Q22.990800228881834,21.455700228881835,23.120400228881834,21.280900228881837Q23.250100228881838,21.106100228881836,23.371000228881837,20.925100228881835Q23.491900228881835,20.744200228881837,23.603800228881838,20.557500228881835Q23.715600228881836,20.370900228881837,23.818200228881835,20.178900228881837Q23.920800228881834,19.987000228881836,24.013900228881838,19.790300228881836Q24.106900228881837,19.593500228881837,24.190200228881835,19.392500228881836Q24.273500228881836,19.191400228881836,24.346800228881836,18.986500228881837Q24.420100228881836,18.781600228881835,24.483300228881834,18.573400228881837Q24.546400228881836,18.365100228881836,24.599300228881837,18.154000228881834Q24.652200228881835,17.942900228881836,24.694700228881835,17.729500228881836Q24.737100228881836,17.516000228881836,24.769000228881836,17.300800228881837Q24.801000228881836,17.085500228881834,24.822300228881836,16.868900228881834Q24.843600228881837,16.652300228881835,24.854300228881836,16.435000228881837Q24.865000228881836,16.217600228881835,24.865000228881836,16.000000228881838Z" fillRule="evenodd" fill="#3461E2" /></g><g><rect x="12.89536190032959" y="12.895505905151367" width="6.209272861480713" height="6.209272861480713" rx="1" fill="#3461E2" /></g></g></g></svg>
                                            </Tooltip> :
                                            <Tooltip title={t('home.send')}>
                                                <svg className={message.length > 0 ? "sendActive" : "send"} onClick={()=> send()} fill="none" version="1.1" width="32" height="32" viewBox="0 0 32 32"><defs><clipPath id="master_svg0_9_08092"><rect x="6" y="7" width="18" height="18" rx="0"/></clipPath></defs><g><g><ellipse cx="16" cy="16" rx="16" ry="16" fill="currentColor" /></g><g clipPath="url(#master_svg0_9_08092)"><g><path d="M23.20373388671875,8.186527112304688C23.20373388671875,8.184770112304687,23.20193388671875,8.184770112304687,23.20193388671875,8.183012112304688C23.16503388671875,8.110942112304688,23.11233388671875,8.045902112304688,23.04723388671875,7.993168112304687C22.98393388671875,7.940433812304687,22.91193388671875,7.901761912304687,22.83633388671875,7.877152512304687C22.83453388671875,7.877152512304687,22.83283388671875,7.8753948123046875,22.83103388671875,7.8753948123046875C22.80113388671875,7.864847912304688,22.76953388671875,7.859574412304688,22.73783388671875,7.8543010123046875C22.72913388671875,7.852543232304687,22.72033388671875,7.8490275923046875,22.70973388671875,7.8490275923046875C22.67983388671875,7.8455119503046875,22.651733886718752,7.8455119503046875,22.62183388671875,7.847269802304687C22.60953388671875,7.847269802304687,22.59903388671875,7.845512017304688,22.58673388671875,7.847269802304687C22.502333886718752,7.852543232304687,22.41793388671875,7.8771526123046876,22.34063388671875,7.915824512304687L7.08103888671875,15.483205112304688C6.93162488671875,15.555275112304688,6.81736668671875,15.685355112304688,6.76463228671875,15.843555112304688C6.74881188671875,15.887505112304687,6.74178068671875,15.934965112304688,6.73650728671875,15.980665112304688C6.72068694671875,16.073835112304685,6.72420258671875,16.170515112304688,6.75408538671875,16.26191511230469C6.80330418671875,16.42187511230469,6.91404588671875,16.553715112304687,7.06345988671875,16.629305112304685L10.93592388671875,18.664815112304687C11.02908388671875,18.71411511230469,11.13103388671875,18.73871511230469,11.23650388671875,18.73871511230469C11.47029388671875,18.74041511230469,11.684753886718749,18.61391511230469,11.79900388671875,18.410015112304688C11.966003886718749,18.10581511230469,11.848223886718749,17.727935112304685,11.53885388671875,17.564455112304685L8.70877388671875,16.077345112304688L20.09063388671875,10.431255112304687L13.14900388671875,18.40291511230469C13.14373388671875,18.40821511230469,13.14197388671875,18.415215112304686,13.136703886718749,18.420515112304688C12.96443388671875,18.53301511230469,12.85193388671875,18.722815112304687,12.85193388671875,18.940815112304687L12.85193388671875,23.530515112304688C12.85369388671875,23.69741511230469,12.92224388671875,23.857415112304686,13.04178388671875,23.97521511230469C13.16131388671875,24.093015112304688,13.32303388671875,24.156215112304686,13.490023886718749,24.154515112304686L13.490023886718749,24.156215112304686C13.84158388671875,24.156215112304686,14.12635388671875,23.876715112304687,14.12635388671875,23.532215112304687L14.12635388671875,19.204515112304687L21.70423388671875,10.498055112304687L20.12923388671875,21.981815112304687L16.13377388671875,20.062315112304688C15.81912388671875,19.911115112304685,15.44119388671875,20.03771511230469,15.28123388671875,20.347115112304685C15.20740388671875,20.496515112304685,15.19686388671875,20.66871511230469,15.25135388671875,20.82691511230469C15.30584388671875,20.985115112304687,15.42186388671875,21.11351511230469,15.57303388671875,21.183815112304686L20.320833886718752,23.467215112304686C20.40873388671875,23.509415112304687,20.50373388671875,23.530515112304688,20.60213388671875,23.530515112304688C20.60563388671875,23.530515112304688,20.60913388671875,23.52871511230469,20.61263388671875,23.52871511230469C20.62323388671875,23.52871511230469,20.63553388671875,23.532215112304687,20.646033886718747,23.532215112304687C20.962533886718752,23.534015112304687,21.23143388671875,23.303715112304687,21.27713388671875,22.990815112304688L23.24593388671875,8.645316112304688C23.28983388671875,8.497660112304688,23.28103388671875,8.334183112304688,23.20373388671875,8.186527112304688Z" fill="#ffffff" /></g></g></g></svg>
                                            </Tooltip>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {showWaxberryModal && <div className="waxberry-modal">
                <div className="waxberry-modal-box">
                    <div className="waxberry-modal-title">
                        <span>{t('waxberryForm.waxberryAttributes')}</span>
                        <CloseOutlined onClick={ hideWaxberryModal }/>
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
                                    <img onClick={()=> generateImage('imgeFileId','iconSpinning1')} src={AiSvg} className="ai1"/>
                                </div>
                                <div className="icon">
                                    <span className="label">{t('waxberryForm.cover')}</span>
                                    <Spin spinning={iconSpinning2}>
                                        <CustomUpload {...coverProps}>
                                            <img src={waxberryObj.coverFileId ? `${globalInitConfig.REACT_APP_API_FS_URL}file/download/${waxberryObj.coverFileId}` : CardDefaultPng} width="160" height="90"/>
                                        </CustomUpload>
                                    </Spin>
                                    <span className="size">{t('waxberryForm.recommendedAspectRatio')}：16:9</span>
                                    <img onClick={()=> generateImage('coverFileId','iconSpinning2')} src={AiSvg} className="ai2"/>
                                </div>
                            </div>
                            <div className="form-item">
                                <span className="label"><font color="red">* </font>{t('waxberryForm.name')}</span>
                                <Input value={waxberryObj.name} onChange={(e)=> waxberryObjChange("name",e.target.value)} placeholder={t('waxberryForm.pleaseEnter')}/>
                            </div>
                            <div className="form-item">
                                <span className="label"><font color="red">* </font>{t('waxberryForm.introduction')}</span>
                                <TextArea rows={4} value={waxberryObj.discription} onChange={(e)=> waxberryObjChange("discription",e.target.value)} placeholder={t('waxberryForm.pleaseEnter')}/>
                            </div>
                            <div className="form-item">
                                <span className="label"><font color="red">* </font>{t('waxberryForm.category')}</span>
                                <Cascader
                                    options={agentMenuList}
                                    allowClear={false}
                                    value={waxberryObj.groupId ? waxberryObj.groupId.split('-') : []}
                                    onChange={(value)=> waxberryObjChange("groupId",value.join('-'))}
                                    placeholder={t('waxberryForm.pleaseSelectCategory')}
                                />
                            </div>
                            <div className="form-item">
                                <span className="label">{t('waxberryForm.tags')}</span>
                                <Select
                                    mode="tags"
                                    notFoundContent={t('waxberryForm.createTags')}
                                    value={waxberryObj.agentLabel ? waxberryObj.agentLabel.split(',') : []}
                                    onChange={(value)=> waxberryObjChange("agentLabel",value.join(','))}
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
                                <span>{t('waxberryForm.isModificationAllowed')}</span><Switch checked={waxberryObj.ismodify===0} onChange={(checked)=> waxberryObjChange("ismodify",checked?0:1)} />
                            </div>
                        </div>
                        <div className="detail">
                            <div className="labelBox">
                                <input type="file" accept=".md" id="fileInput" style={{display:'none'}} onChange={ handleFileChange }/>
                                <span className="label">{t('waxberryForm.details')}：</span>
                                <img onClick={()=> generate_detail_prompt()} src={AiSvg} className="ai"/>
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
                                    onChange={(value)=> waxberryObjChange("detail",value)}
                                />
                            </Spin>
                        </div>
                    </div>
                    <div className="waxberry-modal-footer">
                        <div className="close" onClick={ hideWaxberryModal }>{t('cancel')}</div>
                        <div className="ok" onClick={()=>waxberryModalOk(true)}>{t('confirm')}</div>
                    </div>
                </div>
            </div>}
            {showPublishModal && <div className="custom-modal">
                <div className="custom-modal-box">
                    <div className="custom-modal-title">
                        <span>{t('myWaxberry.publishReview')}</span>
                        <CloseOutlined onClick={()=>setShowPublishModal(false)}/>
                    </div>
                    <div className="custom-modal-content">
                        <img src={WarningSvg}/>{t('message.publicMessage')}
                    </div>
                    <div className="custom-modal-footer">
                        <div className="ok" onClick={()=>waxberryModalOk()}>{t('publish')}</div>
                        <div className="close" onClick={()=>setShowPublishModal(false)}>{t('cancel')}</div>
                    </div>
                </div>
            </div>}
            <Drawer
                title={t('agentRun.developmentInfo')}
                placement="right"
                width={drawerWidth}
                onClose={() => {
                    setDrawerWidth('calc(40% - 24px)')
                    setDrawerVisible(false)
                }}
                open={drawerVisible}
                destroyOnClose
                footer={
                    <>
                        <div className="close" onClick={() => {  setDrawerVisible(false)}}>{t('cancel')}</div>
                    </>
                }
            >
                <DrawCode waxberryObj={waxberryObj} functionItems={['log','code']} toggleFull={ ()=>{
                    toggleFull(drawerWidth==="100%"?"calc(40% - 24px)":"100%")

                } }/>
            </Drawer>
            {showFormulaModal && <FormulaModal
                onOk={val =>  formulaOk(val)}
                onCancel={() =>  setShowFormulaModal(false)}
            />}
            {showTableModal && <TableModal
                onOk={val =>  tableOk(val)}
                onCancel={() => setShowTableModal(false)}
            />}
        </div>
    );

}
export default Agent;
