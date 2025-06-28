import React, {useState,useEffect,useRef} from 'react'
import { Tooltip,message ,Spin,Tree,Progress,Timeline,Switch } from 'antd';
import { CodeEditor,isTextFile } from '@components/CodeEditor';
import MarkdownRenderer from '@components/MarkdownRenderer';
import Workflow from '@/pages/waxberryAi/waxberry/workflowEditor/workflowEditor';
import Collapse from '@/pages/waxberryAi/waxberry/collapse';
import { useTranslation } from 'react-i18next';
import getFileTypePng from "@/pages/waxberryAi/components/fileList/getFileTypeTempltate";
import axios from 'axios';
import {
    FileTextOutlined,
    FolderOutlined
} from '@ant-design/icons';
import './drawCode.scss';
import {FullIcon} from '@/pages/waxberryAi/img/svgComponent.js'
import DownloadSvg from '@/pages/waxberryAi/img/download.svg';
import UploadSvg from '@/pages/waxberryAi/img/upload.svg';
import ReloadSvg from '@/pages/waxberryAi/img/reload.svg';
import ExportSvg from '@/pages/waxberryAi/img/export.svg';
import DeleteSvg from '@/pages/waxberryAi/img/deleteFile.svg';

import { Base64 } from 'js-base64';
import TaskStatus1 from '@/pages/waxberryAi/img/taskStatus1.png';
import TaskStatus2 from '@/pages/waxberryAi/img/taskStatus2.gif';
import TaskStatus3 from '@/pages/waxberryAi/img/taskStatus3.png';
import EmptyTaskPng from '@/pages/waxberryAi/img/emptyTask.png';
import { fetchEventSource } from '@microsoft/fetch-event-source';
const TreeNode = Tree.TreeNode;
let controller;
let controller1;
function waitForStableWidth(el, callback, stableFrames = 3) {
    let lastWidth = el.offsetWidth;
    let stableCount = 0;

    function checkWidth() {
      const currentWidth = el.offsetWidth;

      if (currentWidth === lastWidth) {
        stableCount++;
        if (stableCount >= stableFrames) {
          callback(currentWidth);
          return;
        }
      } else {
        lastWidth = currentWidth;
        stableCount = 0;
      }

      requestAnimationFrame(checkWidth);
    }

    requestAnimationFrame(checkWidth);
  }
function watchResize(recordFull,width){
    const resizable = document.getElementById('drawCode');

    const parentElement=resizable.parentElement

    waitForStableWidth(parentElement, function (finalWidth) {
        if(!recordFull.current){
            parentElement.style.width=``
            resizable.style.width=width.current+'px'
            return
      }

        console.log(parentElement.offsetWidth)
        resizable.style.width=`${parentElement.offsetWidth-2}px`
      });


}
function DrawCode(props){
    const {waxberryObj,functionItems=['requirement','task','log','code'],defaultMenu='code',
        stopSign=0,requireInform={},resizable=false,allowTerminal=false
        ,query,toggleFull,width} =props
    const treeFileUpload=useRef(null)
    const [inputFileOptions, setInputFileOptions] = useState([]);
    const [selectMenu, setSelectMenu] = useState(defaultMenu);
    const [treeUploadFile, setTreeUploadFile] = useState('');
    const [spinning, setSpinning] = useState(false);
    const [selectedKeys, setSelectedKeys] = useState([]);
    const [codeTreeData, setCodeTreeData] = useState([]);
    const [codeData, setCodeData] = useState("");
    const [codeLogs, setCodeLogs] = useState("");
    const [waxberryTask,setWaxberryTask]=useState([])
    const [expandedKeys, setExpandedKeys] = useState([]);
    const [monacoLanguage, setMonacoLanguage] = useState('');
    const [onlinePreviewUrl, setOnlinePreviewUrl] = useState('');
    const [selectTreeType,setSelectTreeType] = useState('')
    const [requirementContent,setRequirementContent] = useState([])
    const [workflow,setWorkflow] = useState(null)
    const [logReadonly,setLogReadonly]=useState(true)
    const [alreadyGetTask,setAlreadyGetTask]=useState(false)
    const [full,setFull]=useState(false)
    const recordFull=useRef(false)
    const recordWidth=useRef(width||720)
    const { t } = useTranslation();
    const [Message, contextHolder] = message.useMessage();
    const eventSource=useRef(null)
    const isShowAll=useRef(true) //暂时设置true关闭只看100个
    const allCodeLogs=useRef("")
    const firstCall=useRef(true)
    const shouldUpdateTaskStatus=useRef(false)
    const setLogs=(data)=>{
        let logs=allCodeLogs.current
        logs = logs + data + "\n";

        if(isShowAll.current){
            setCodeLogs(logs)
        }else {
            const limitLogs=logs.split('\n')
            setCodeLogs(limitLogs.slice(0,100).join('\n'))
        }
        allCodeLogs.current=logs
    }
    function menuChange(key) {
        setSelectMenu(key)

    }
    useEffect(()=>{
     if(toggleFull)   document.getElementById('drawCode').style.width=width?width+'px':'720px'
     const newWatchResize=watchResize.bind(null,recordFull,recordWidth)

     window.addEventListener('resize',newWatchResize)
        return ()=>{
              window.removeEventListener('resize',newWatchResize)
        }
    },[])
    useEffect(()=>{
        if(!waxberryObj||!waxberryObj.vesselId) return
        if(firstCall.current){
            getCodeTree();
            getCodeLogs();
            getTags();
            if(functionItems.includes('task')){
                getWaxberryTask()
            }else{
                setAlreadyGetTask(true);
            }
            firstCall.current=false
        }

        if(firstCall.current){}

        if(waxberryObj.shouldGetCodeTree) getCodeTree()
        if(resizable)  messageResizable()
        if(selectMenu==='code') codeResizable();
        return ()=>{
            if(controller) controller.abort();
            if(controller1) controller1.abort();
        }
    },[waxberryObj])
    useEffect(()=>{

        if(!firstCall.current){
            if(requireInform.shouldRequireTree){
                getCodeTree()
            }
        }
    },[requireInform])
    useEffect(()=>{
        if(selectedKeys.length===0||!waxberryObj||!waxberryObj.vesselId) return
        getCodeData()
    },[selectTreeType,selectedKeys])
    useEffect(()=>{
        codeResizable()
    },[selectMenu])
    useEffect(()=>{
        if(query&&query.url)
            startTaskStream(query)
    },[query])
    useEffect(()=>{
        if(stopSign>0) controller.abort()
    },[stopSign])
   useEffect(()=>{
      if(alreadyGetTask&&shouldUpdateTaskStatus.current) {
        startTaskStream(query)
        shouldUpdateTaskStatus.current=false
        //callStack.current=[]
      }
   },[alreadyGetTask])
   useEffect(()=>{

     if(!firstCall.current){
        console.log('sssyyayay')
        window.dispatchEvent(new Event('resize'));

     }
   },[full])

    function getTags(){

        if(!waxberryObj.step) return;
        axios.get(`${globalInitConfig.REACT_APP_API_CORE_URL}/workflow/session/${waxberryObj.vesselId}/tags`).then(r=>{
            if(!r.data.detail) {
                let tags = r.data.tags;
                setRequirementContent(tags.requirements_report)
                setWorkflow(tags.B_workflow)

            }
        })
    }
    function showAllLog(){
        isShowAll.current=true
        setCodeLogs(allCodeLogs.current)
    }
    function startTaskStream(query){

        controller = new AbortController();
        const {url="",requireConfig={},eventHook={onmessage(){},onerror(){},onclose(){},}}=query;
        const {onmessage,onerror,onclose}=eventHook;
        if(alreadyGetTask){
            const eventSource = fetchEventSource(url, {
                ...requireConfig,
                headers: {
                    "Content-Type": 'application/json',
                    "Authorization": localStorage.getItem('access_token') ? `Bearer ${localStorage.getItem('access_token')}` : ''
                },
                signal: controller.signal,
                onmessage(event) {

                    try {
                        if(event.data) {

                            let data = JSON.parse(event.data);
                            let newWaxberryTask =[...waxberryTask];
                            const updateStatus=(tasks)=>{


                                if(data.event_type === "task_start"){
                                  tasks[data.section_index].completed = "run";
                                    setWaxberryTask(newWaxberryTask)

                                }
                                if(data.event_type === "task_complete"){
                                   tasks[data.section_index].completed = true;
                                    setWaxberryTask(newWaxberryTask)
                                }
                            }
                            updateStatus(newWaxberryTask)

                            onmessage(event)

                        }
                    }catch (e) {
                        console.log(e,'ssss')
                        onerror(e)
                        controller.abort();
                    }
                },
                onerror(err) {
                    onerror(err)
                    console.log(err)
                    eventSource.close();
                    controller.abort();
                },
                onclose(close) {
                    getCodeTree();
                    const fetchWaxberryTask = onclose(close,waxberryTask);
                    if(fetchWaxberryTask && typeof fetchWaxberryTask.then === 'function')
                        fetchWaxberryTask.then(data=>{
                            if(data) setWaxberryTask(data)
                        })

                }
            })
        } else shouldUpdateTaskStatus.current=true


    }
    function getWaxberryTask() {
        if(waxberryObj.step) {
            axios.get(`${globalInitConfig.REACT_APP_API_CORE_URL}/workflow/session/${waxberryObj.vesselId}/development/progress`).then(r => {
                if (!r.data.detail) {
                    setWaxberryTask(r.data.tasks)
                    setAlreadyGetTask(true)

                }
            })
        }else{
            axios.get(`${globalInitConfig.REACT_APP_API_BASE_URL}mgr/agent/agentTask/findAgentTaskByAgentId?agentId=${waxberryObj.id}&pageNo=0&pageSize=5`).then(res=>{
                if(res.data.code === 200){
                    setWaxberryTask( res.data.data.content[0]||[])
                    setAlreadyGetTask(true)

                }
            });
        }
    }
    function getCodeLogs() {
        let url = `${globalInitConfig.REACT_APP_API_SBX_URL}/sandboxes/${waxberryObj.vesselId}/logs?tail=100&follow=true&format=sse`;
        controller1 = new AbortController();
        const eventSource = fetchEventSource(url, {
            headers: {
                "Authorization": localStorage.getItem('access_token') ? `Bearer ${localStorage.getItem('access_token')}` : ''
            },
            signal: controller1.signal,
            onmessage(event) {
                try {
                    if(event.data) {
                        setCodeLogs(codeLogs + event.data + "\n")
                        setLogs(event.data)
                    }
                }catch (e) {
                    console.log(e);
                    controller1.abort();
                }
            },
            onerror(err) {
                console.log(err);
                controller1.abort();
                eventSource.close();
            }
        })
    }
    function getCodeTree(){
        setSpinning(true)
        axios.get(`${globalInitConfig.REACT_APP_API_SBX_URL}/sandboxes/${waxberryObj.vesselId}/tree?path=/waxberry`).then(res => {
            const data = res.data;
            if (data.data) {

                setSpinning(false)
                setCodeTreeData([data.data])
                const fileOptions=  convertInputFileTree([data.data])
                setInputFileOptions(fileOptions)
                if(typeof waxberryObj.effect ==='function') waxberryObj.effect(fileOptions)

            } else {
                Message.error(data.message);
            }
        });
    }

    function convertInputFileTree(data){
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


    function exportWaxberry(){
        const xhr = new XMLHttpRequest();
        let url = `${globalInitConfig.REACT_APP_API_SBX_URL}/sandboxes/${waxberryObj.vesselId}/pack?path=/waxberry`;
        xhr.open('GET', url, true);
        const token = localStorage.getItem('access_token');
        xhr.setRequestHeader('Authorization', token ? `Bearer ${token}` : '');

        xhr.responseType = 'blob';

        xhr.onload = function() {
            if (xhr.status === 200) {
                let filename = `${waxberryObj.id}.tar`;
                const blob = xhr.response;
                const objectUrl = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = objectUrl;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(objectUrl);
                document.body.removeChild(a);
            } else {
                console.error('下载失败:', xhr.statusText);
            }
        };

        xhr.onerror = function() {
            console.error('下载失败: 网络错误');
        };

        xhr.send();
    }



    function downloadFile() {
        if(selectedKeys.length===0 || selectTreeType !== "file"){
            return;
        }
        const xhr = new XMLHttpRequest();
        let url = `${globalInitConfig.REACT_APP_API_SBX_URL}/sandboxes/${waxberryObj.vesselId}/download?path=${selectedKeys[0]}`;
        xhr.open('GET', url, true);
        const token = localStorage.getItem('access_token');
        xhr.setRequestHeader('Authorization', token ? `Bearer ${token}` : '');

        xhr.responseType = 'blob';

        xhr.onload = function() {
            if (xhr.status === 200) {
                let filename = selectedKeys[0].split('/').pop();
                const blob = xhr.response;
                const objectUrl = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = objectUrl;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(objectUrl);
                document.body.removeChild(a);
            } else {
                console.error('下载失败:', xhr.statusText);
            }
        };

        xhr.onerror = function() {
            console.error('下载失败: 网络错误');
        };

        xhr.send();
    }


    function deleteFile() {
        if(selectedKeys.length===0) return;
        axios.delete(`${globalInitConfig.REACT_APP_API_SBX_URL}/sandboxes/${waxberryObj.vesselId}/files?path=${encodeURIComponent(selectedKeys[0])}&recursive=true`).then(res => {
            Message.success(t('operationSuccessful'));
            getCodeTree();
        })
    }

    function treeSelect(selectedKeys,{node}) {
        setSelectedKeys(selectedKeys)
        setSelectTreeType(node.type)
        if(node.type !== "file"){
            return;
        }
        if(isTextFile(node.fileName)){
            setOnlinePreviewUrl('')
            setMonacoLanguage(node.fileName.split('.').pop())
        }else{
            onlinePreview(node);
        }
    }

    function treeExpand(expandedKeys) {

        setExpandedKeys(expandedKeys)
    }
    function handleTreeUpload(e) {
        if (selectedKeys.length === 0 || selectTreeType === "file") {
            Message.warning(t('message.pleaseSelectFolderOperation'));
            return;
        }
        const file = e.target.files[0];
        let suffixName = "";
        let split = file.name.split('.');
        if(split.length>1){
            suffixName = split.pop();
        }
        let treeUploadFile = {
            fileName: file.name,
            suffixName,
            progress: 0
        };

        setTreeUploadFile(treeUploadFile);
        const formData = new FormData();
        formData.append('file',file);
        formData.append('path', selectedKeys[0] + "/" + treeUploadFile.fileName);

        const xhr = new XMLHttpRequest();
        let url = `${globalInitConfig.REACT_APP_API_SBX_URL}/sandboxes/${waxberryObj.vesselId}/upload`;
        xhr.open('POST', url, true);
        const token = localStorage.getItem('access_token');
        xhr.setRequestHeader('Authorization', token ? `Bearer ${token}` : '');

        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                treeUploadFile.progress = (event.loaded / event.total) * 100;
                setTreeUploadFile(treeUploadFile)
            }
        };

        xhr.onload = () => {
            if (xhr.status === 200) {
                Message.success(t('operationSuccessful'));
                setTreeUploadFile(undefined);
                getCodeTree();
            } else {
                console.log(`Upload of ${file.name} failed.`);
            }
        };

        xhr.send(formData);
    }
    function getCodeData(){

        if(selectedKeys.length===0 || selectTreeType !== "file"){
            return;
        }
        axios.get(`${globalInitConfig.REACT_APP_API_SBX_URL}/sandboxes/${waxberryObj.vesselId}/read_file?path=${selectedKeys[0]}`).then(res => {
            const data = res.data;
            if (data) {
                setCodeData(data)
            }
        });
    }
    function onlinePreview(node) {
        let fileUrl = `${globalInitConfig.REACT_APP_API_SBX_URL}/sandboxes/${waxberryObj.vesselId}/download?path=${node.key}&fullfilename=${node.fileName}`;
        let url = globalInitConfig.kkfileview_url + 'onlinePreview?url=' + encodeURIComponent(Base64.encode(fileUrl))+ '&watermarkTxt=' + encodeURIComponent(window.loginedUser?.loginname);

        setOnlinePreviewUrl(url)
    }

    function closeTreeUpload() {
        setTreeUploadFile(undefined)
    }

    function messageResizable() {
        if(full) return
        let drag = document.getElementById('drag');
        let resizable = document.getElementById('drawCode');
        let isResizing = false;
        let startX;
        let startWidth;
        console.log({resizable,drag})
        drag.addEventListener('mousedown', (e) => {
            isResizing = true;
            startX = e.clientX;
            console.log(resizable)
            startWidth = resizable.offsetWidth;
             let newWidth
            function onMouseMove(e) {
                if (!isResizing) return;

                const deltaX = e.clientX - startX;
                 newWidth = startWidth - deltaX;

                resizable.style.width = `${newWidth}px`;
            }

            function onMouseUp() {
                recordWidth.current=newWidth
                window.dispatchEvent(new Event('resize'));
                isResizing = false;
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            }

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    }
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
    const fullWindow=()=>{
         toggleFull()
         recordFull.current=!recordFull.current
         console.log( recordFull.current)
         setFull(recordFull.current)
    }
    function codeResizable() {
        let drag = document.getElementById('codeDrag');
        let resizable = document.getElementById('codeDragDiv');
        const container = document.getElementById('drawCode');
        // if(!container.style.width){
        //     const width=container.getBoundingClientRect().width
        //     container.style.width=`${width}px`
        // }
        if(!drag) return
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
    const loop = data => data.map((item) => {
        let title = item.type==="file" ? <span className="label"><FileTextOutlined />{item.name}</span> : <span className="label"><FolderOutlined />{item.name}</span>;
        if (item.children && item.children.length) {
            return <TreeNode key={item.path} title={title} fileName={item.name} type={item.type}>{loop(item.children)}</TreeNode>;
        }
        return <TreeNode key={item.path} title={title} fileName={item.name} type={item.type}/>;
    });
    const functionMap={
        requirement:( <div key="requirement" className={selectMenu==="requirement"?"menu menu-active":"menu"} onClick={()=>menuChange("requirement")}>
            <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="16" height="16" viewBox="0 0 16 16"><defs><clipPath id="master_svg0_361_45507"><rect x="0" y="0" width="16" height="16" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_361_45507)"><g><path d="M10.89756875,9.44878875L5.10242875,9.44878875C4.7040187499999995,9.44878875,4.37803875,9.77475875,4.37803875,10.17317875C4.37803875,10.57159875,4.7040187499999995,10.89756875,5.10242875,10.89756875L10.89756875,10.89756875C11.29598875,10.89756875,11.62196875,10.57159875,11.62196875,10.17317875C11.62196875,9.77475875,11.29598875,9.44878875,10.89756875,9.44878875ZM13.07076875,1.48046875L2.92924875,1.48046875C2.13242175,1.48046875,1.48046875,2.13242175,1.48046875,2.92924875L1.48046875,13.07076875C1.48046875,13.86756875,2.13242175,14.51956875,2.92924875,14.51956875L13.07076875,14.51956875C13.86756875,14.51956875,14.51956875,13.86756875,14.51956875,13.07076875L14.51956875,2.92924875C14.51956875,2.13242175,13.86756875,1.48046875,13.07076875,1.48046875ZM13.07076875,13.07076875L2.92924875,13.07076875L2.92924875,2.92924875L5.10242875,2.92924875L5.10242875,3.65364875C5.10242875,4.0520587500000005,5.42840875,4.37803875,5.82681875,4.37803875C6.22523875,4.37803875,6.55121875,4.0520587500000005,6.55121875,3.65364875L6.55121875,2.92924875L9.44878875,2.92924875L9.44878875,3.65364875C9.44878875,4.0520587500000005,9.77475875,4.37803875,10.17317875,4.37803875C10.57159875,4.37803875,10.89756875,4.0520587500000005,10.89756875,3.65364875L10.89756875,2.92924875L13.07076875,2.92924875L13.07076875,13.07076875ZM5.10242875,6.55121875C4.7040187499999995,6.55121875,4.37803875,6.87718875,4.37803875,7.27560875C4.37803875,7.67401875,4.7040187499999995,7.99999875,5.10242875,7.99999875L10.89756875,7.99999875C11.29598875,7.99999875,11.62196875,7.67401875,11.62196875,7.27560875C11.62196875,6.87718875,11.29598875,6.55121875,10.89756875,6.55121875L5.10242875,6.55121875Z" fill="currentColor"/></g></g></svg>
            {t('home.require')}
        </div>),
        flow:( <div key="flow" className={selectMenu==="flow"?"menu menu-active":"menu"} onClick={()=>menuChange("flow")}>
            <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="16" height="16" viewBox="0 0 16 16"><defs><clipPath id="master_svg0_361_45484"><rect x="0" y="0" width="16" height="16" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_361_45484)"><g><path d="M11.466796875,7.333251953125L4.800126875,7.333251953125C4.063750875,7.333251953125,3.466797113419,7.930205953125,3.466796875,8.666581953125L12.800126875,8.666581953125C12.800126875,7.930205953125,12.203176875,7.333251953125,11.466796875,7.333251953125Z" fill="currentColor"/></g><g><path d="M8.800126875,6L7.466796875,6L7.466796875,8.66667L8.800126875,8.66667L8.800126875,6ZM11.466796875,7.33333L11.466796875,10.66667L12.800126875,10.66667L12.800126875,8.66667C12.800126875,7.93029,12.203176875,7.33333,11.466796875,7.33333ZM4.800126875,7.33333C4.063750875,7.33333,3.466796875,7.93029,3.466796875,8.66667L3.466796875,10.66667L4.800126875,10.66667L4.800126875,7.33333Z" fill="currentColor"/></g><g><path d="M9.466796875,2.33333L9.466796875,5L6.800126875,5L6.800126875,2.33333L9.466796875,2.33333ZM9.466796875,1L6.800126875,1C6.063746875,0.999999880791,5.466796875,1.596954,5.466796875,2.33333L5.466796875,5C5.466796875,5.73638,6.063746875,6.33333,6.800126875,6.33333L9.466796875,6.33333C10.203176875,6.33333,10.800126875,5.73638,10.800126875,5L10.800126875,2.33333C10.800126875,1.596954,10.203176875,1,9.466796875,1ZM5.466796875,11L5.466796875,13.6667L2.800126875,13.6667L2.800126875,11L5.466796875,11ZM5.466796875,9.66667L2.800126875,9.66667C2.063750875,9.66667,1.466796875,10.26362,1.466796875,11L1.466796875,13.6667C1.466796875,14.403,2.063750875,15,2.800126875,15L5.466796875,15C6.203176875,15,6.800126875,14.403,6.800126875,13.6667L6.800126875,11C6.800126875,10.26362,6.203176875,9.66667,5.466796875,9.66667ZM13.466796875,11L13.466796875,13.6667L10.800126875,13.6667L10.800126875,11L13.466796875,11ZM13.466796875,9.66667L10.800126875,9.66667C10.063746875,9.66667,9.466796875,10.26362,9.466796875,11L9.466796875,13.6667C9.466796875,14.403,10.063746875,15,10.800126875,15L13.466796875,15C14.203196875,15,14.800096875,14.403,14.800096875,13.6667L14.800096875,11C14.800096875,10.26362,14.203196875,9.66667,13.466796875,9.66667Z" fill="currentColor"/></g></g></svg>
            {t('home.flow')}
        </div>),
        task:(<div key="task" className={selectMenu==="task"?"menu menu-active":"menu"} onClick={()=>menuChange("task")}>
            <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="16" height="16" viewBox="0 0 16 16"><defs><clipPath id="master_svg0_721_66762"><rect x="0" y="0" width="16" height="16" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_721_66762)"><g><path d="M2.48824904375,10.8227289Q1.99052734375,11.320454,1.99052734375,12.024329999999999Q1.99052734375,12.72821,2.48824904375,13.22594Q2.98597434375,13.72367,3.68985734375,13.72367Q4.39373734375,13.72367,4.89146734375,13.22594Q5.38919734375,12.72821,5.38919734375,12.024329999999999Q5.38919734375,11.320455,4.89146734375,10.8227275Q4.39373734375,10.325,3.68985734375,10.325Q2.98597434375,10.325,2.48824904375,10.8227289ZM3.26606934375,12.44812Q3.09052734375,12.27258,3.09052734375,12.024329999999999Q3.09052734375,11.776087,3.26606934375,11.600544Q3.44161134375,11.425,3.68985734375,11.425Q3.93810734375,11.425,4.11364734375,11.600545Q4.28919734375,11.77609,4.28919734375,12.024329999999999Q4.28919734375,12.27258,4.11364734375,12.44812Q3.93810734375,12.62367,3.68985734375,12.62367Q3.44161134375,12.62367,3.26606934375,12.44812Z" fill="currentColor"/></g><g><path d="M2.48825044375,2.7758481Q1.99052734375,3.273571,1.99052734375,3.977455Q1.99052734375,4.681355,2.48825244375,5.179075Q2.98597234375,5.676795,3.68985734375,5.676795Q4.39373734375,5.676795,4.89146734375,5.179075Q5.38919734375,4.681355,5.38919734375,3.977455Q5.38919734375,3.273572,4.89146734375,2.7758468Q4.39373734375,2.278125,3.68985734375,2.278125Q2.98597334375,2.278125,2.48825044375,2.7758481ZM3.2660653437500002,4.401255Q3.09052734375,4.225715,3.09052734375,3.977455Q3.09052734375,3.729206,3.2660683437499998,3.553665Q3.44160834375,3.378125,3.68985734375,3.378125Q3.93810734375,3.378125,4.11364734375,3.553667Q4.28919734375,3.729209,4.28919734375,3.977455Q4.28919734375,4.225715,4.11364734375,4.401255Q3.93810734375,4.576795,3.68985734375,4.576795Q3.4416033437499998,4.576795,3.2660653437500002,4.401255Z" fill="currentColor"/></g><g><path d="M2.48825244375,6.797323975Q1.99052734375,7.295044375,1.99052734375,7.998939375Q1.99052734375,8.702839375,2.48825244375,9.200559375000001Q2.98597234375,9.698279375,3.68985734375,9.698279375Q4.39373734375,9.698279375,4.89146734375,9.200559375000001Q5.38919734375,8.702839375,5.38919734375,7.998939375Q5.38919734375,7.295044375,4.89146734375,6.797322675Q4.39373734375,6.299609375,3.68985734375,6.299609375Q2.98597234375,6.299609375,2.48825244375,6.797323975ZM3.2660653437500002,8.422739374999999Q3.09052734375,8.247199375000001,3.09052734375,7.998939375Q3.09052734375,7.750682375,3.26606634375,7.575145375Q3.4416033437499998,7.399609375,3.68985734375,7.399609375Q3.93810734375,7.399609375,4.11365734375,7.575147375Q4.28919734375,7.750685375,4.28919734375,7.998939375Q4.28919734375,8.247199375000001,4.11364734375,8.422739374999999Q3.93810734375,8.598279375,3.68985734375,8.598279375Q3.4416033437499998,8.598279375,3.2660653437500002,8.422739374999999Z" fill="currentColor"/></g><g><path d="M7.138671875,7.35L13.460001875,7.35Q13.524021874999999,7.35,13.586811875,7.36249Q13.649601875,7.374979,13.708751875,7.399478Q13.767891875,7.423978,13.821121875,7.459545Q13.874351875,7.495112,13.919621875,7.540381Q13.964891875,7.585649,14.000461875,7.638879Q14.036021875,7.69211,14.060521875,7.751256Q14.085021874999999,7.810402,14.097511875,7.873191Q14.110001875,7.9359806,14.110001875,8Q14.110001875,8.0640194,14.097511875,8.126809Q14.085021874999999,8.189598,14.060521875,8.248744Q14.036021875,8.30789,14.000461875,8.361121Q13.964891875,8.414351,13.919621875,8.459619Q13.874351875,8.504888,13.821121875,8.540455Q13.767891875,8.576022,13.708751875,8.600522Q13.649601875,8.625021,13.586811875,8.63751Q13.524021874999999,8.65,13.460001875,8.65L7.138671875,8.65Q7.074652475,8.65,7.011862875,8.63751Q6.949073875,8.625021,6.889927875,8.600522Q6.830781875,8.576022,6.777550875,8.540455Q6.724320875,8.504888,6.679052875,8.459619Q6.633783875,8.414351,6.598216875,8.361121Q6.562649875,8.30789,6.538149875,8.248744Q6.513650875,8.189598,6.501161875,8.126809Q6.488671875,8.0640194,6.488671875,8Q6.488671875,7.9359806,6.501161875,7.873191Q6.513650875,7.810402,6.538149875,7.751256Q6.562649875,7.69211,6.598216875,7.638879Q6.633783875,7.585649,6.679052875,7.540381Q6.724320875,7.495112,6.777550875,7.459545Q6.830781875,7.423978,6.889927875,7.399478Q6.949073875,7.374979,7.011862875,7.36249Q7.074652475,7.35,7.138671875,7.35Z" fill="currentColor"/></g><g><path d="M7.138671875,11.371484375L13.460001875,11.371484375Q13.524021874999999,11.371484375,13.586811875,11.383974375Q13.649601875,11.396463375,13.708751875,11.420962375Q13.767891875,11.445462375,13.821121875,11.481029375Q13.874351875,11.516596375,13.919621875,11.561865375Q13.964891875,11.607133375,14.000461875,11.660363375Q14.036021875,11.713594375,14.060521875,11.772740375Q14.085021874999999,11.831886375,14.097511875,11.894675375Q14.110001875,11.957464975,14.110001875,12.021484375Q14.110001875,12.085503775,14.097511875,12.148293375Q14.085021874999999,12.211082375,14.060521875,12.270228375Q14.036021875,12.329374375,14.000461875,12.382605375Q13.964891875,12.435835375,13.919621875,12.481103375Q13.874351875,12.526372375,13.821121875,12.561939375Q13.767891875,12.597506375,13.708751875,12.622006375Q13.649601875,12.646505375,13.586811875,12.658994375Q13.524021874999999,12.671484375,13.460001875,12.671484375L7.138671875,12.671484375Q7.074652475,12.671484375,7.011862875,12.658994375Q6.949073875,12.646505375,6.889927875,12.622006375Q6.830781875,12.597506375,6.777550875,12.561939375Q6.724320875,12.526372375,6.679052875,12.481103375Q6.633783875,12.435835375,6.598216875,12.382605375Q6.562649875,12.329374375,6.538149875,12.270228375Q6.513650875,12.211082375,6.501161875,12.148293375Q6.488671875,12.085503775,6.488671875,12.021484375Q6.488671875,11.957464975,6.501161875,11.894675375Q6.513650875,11.831886375,6.538149875,11.772740375Q6.562649875,11.713594375,6.598216875,11.660363375Q6.633783875,11.607133375,6.679052875,11.561865375Q6.724320875,11.516596375,6.777550875,11.481029375Q6.830781875,11.445462375,6.889927875,11.420962375Q6.949073875,11.396463375,7.011862875,11.383974375Q7.074652475,11.371484375,7.138671875,11.371484375Z" fill="currentColor"/></g><g><path d="M7.138671875,3.328515625L13.460001875,3.328515625Q13.524021874999999,3.328515625,13.586811875,3.341005625Q13.649601875,3.3534946249999997,13.708751875,3.377993625Q13.767891875,3.402493625,13.821121875,3.438060625Q13.874351875,3.4736276249999998,13.919621875,3.518896625Q13.964891875,3.564164625,14.000461875,3.617394625Q14.036021875,3.670625625,14.060521875,3.729771625Q14.085021874999999,3.788917625,14.097511875,3.851706625Q14.110001875,3.914496225,14.110001875,3.978515625Q14.110001875,4.042535025,14.097511875,4.105324625Q14.085021874999999,4.168113625,14.060521875,4.227259625Q14.036021875,4.286405625,14.000461875,4.339636625Q13.964891875,4.392866625,13.919621875,4.438134625Q13.874351875,4.483403625,13.821121875,4.518970625Q13.767891875,4.554537625,13.708751875,4.579037625Q13.649601875,4.603536625,13.586811875,4.616025625Q13.524021874999999,4.628515625,13.460001875,4.628515625L7.138671875,4.628515625Q7.074652475,4.628515625,7.011862875,4.616025625Q6.949073875,4.603536625,6.889927875,4.579037625Q6.830781875,4.554537625,6.777550875,4.518970625Q6.724320875,4.483403625,6.679052875,4.438134625Q6.633783875,4.392866625,6.598216875,4.339636625Q6.562649875,4.286405625,6.538149875,4.227259625Q6.513650875,4.168113625,6.501161875,4.105324625Q6.488671875,4.042535025,6.488671875,3.978515625Q6.488671875,3.914496225,6.501161875,3.851706625Q6.513650875,3.788917625,6.538149875,3.729771625Q6.562649875,3.670625625,6.598216875,3.617394625Q6.633783875,3.564164625,6.679052875,3.518896625Q6.724320875,3.4736276249999998,6.777550875,3.438060625Q6.830781875,3.402493625,6.889927875,3.377993625Q6.949073875,3.3534946249999997,7.011862875,3.341005625Q7.074652475,3.328515625,7.138671875,3.328515625Z" fill="currentColor"/></g></g></svg>
            {t('home.task')}
        </div>),
        log:(
            <div key="log" className={selectMenu==="log"?"menu menu-active":"menu"} onClick={()=>menuChange("log")}>
                <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="16" height="16" viewBox="0 0 16 16"><defs><clipPath id="master_svg0_721_66771"><rect x="0" y="0" width="16" height="16" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_721_66771)"><g><path d="M13.14845234375,14.1759375Q13.31905234375,14.0014375,13.31905234375,13.7550375L13.31905234375,2.2451885000000003Q13.31895234375,1.9988044999999999,13.14815234375,1.8243105Q12.97605234375,1.6484375,12.73185234375,1.6484375L3.26829934375,1.6484375Q3.02420034375,1.6484375,2.85197434375,1.8245005Q2.68115234375,1.9991275,2.68115234375,2.2451885000000003L2.68115234375,13.7550375Q2.68115234375,14.0014375,2.85203834375,14.1759375Q3.02419034375,14.3517375,3.26840334375,14.3517375L12.73195234375,14.3517375Q12.97645234375,14.3517375,13.14845234375,14.1759375ZM11.96744234375,3.0262075Q12.02705234375,3.0886775,12.02705234375,3.1787375L12.02705234375,12.7318375Q12.02698234375,12.8218375,11.96742234375,12.8843375Q11.91087234375,12.9436375,11.83227234375,12.9436375L4.17716234375,12.9436375Q4.09868234375,12.9436375,4.04202234375,12.8842375Q3.98237234375,12.8217375,3.98237234375,12.7318375L3.98237234375,3.1787375Q3.98237234375,3.0888875000000002,4.04203234375,3.0263275Q4.09870234375,2.9669075,4.17716234375,2.9669075L11.83237234375,2.9669075Q11.91085234375,2.9669075,11.96744234375,3.0262075ZM8.20879234375,6.1427675Q8.47151234375,6.1427675,8.65495234375,5.9407175Q8.83250234375,5.7451475,8.83250234375,5.4714675Q8.832592343750001,5.1977875000000004,8.65498234375,5.0021675000000005Q8.47152234375,4.8001275,8.208802343750001,4.8001275L5.534772343749999,4.8001275Q5.2719323437500005,4.8001275,5.08849234375,5.0021775Q4.9109623437500005,5.1977275,4.9109623437500005,5.4714475Q4.9109623437500005,5.7451675,5.08849234375,5.9407175Q5.2719323437500005,6.1427675,5.534772343749999,6.1427675L8.20879234375,6.1427675ZM11.06552234375,8.6617675Q11.32830234375,8.6617575,11.51173234375,8.459837499999999Q11.68932234375,8.2643275,11.68933234375,7.9905675Q11.68942234375,7.7168175,11.51181234375,7.5211875Q11.32836234375,7.3191275,11.06562234375,7.3191275L5.534772343749999,7.3191275Q5.27192234375,7.3191275,5.08849234375,7.5211975Q4.9109623437500005,7.7167675,4.9109623437500005,7.9905475Q4.9109623437500005,8.2643375,5.088512343750001,8.4598275Q5.27192234375,8.6617575,5.534772343749999,8.6617675L11.06552234375,8.6617675ZM9.904752343750001,11.1808675Q10.167612343750001,11.1808675,10.35106234375,10.9789175Q10.52867234375,10.7833975,10.52867234375,10.5095475Q10.52857234375,10.2357175,10.35097234375,10.0402075Q10.16749234375,9.8382275,9.90465234375,9.8382275L5.5348823437500005,9.8382275Q5.27202234375,9.8382275,5.08860234375,10.0402275Q4.91107234375,10.2357575,4.91107234375,10.5095475Q4.91107234375,10.7833975,5.08861234375,10.9789075Q5.27201234375,11.1808675,5.5348823437500005,11.1808675L9.904752343750001,11.1808675Z" fill="currentColor"/></g></g></svg>
                {t('home.log')}
            </div>
        ),
        code:(
            <div key="code" className={selectMenu==="code"?"menu menu-active":"menu"} onClick={()=>menuChange("code")}>
                <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="16" height="16" viewBox="0 0 16 16"><defs><clipPath id="master_svg0_721_86068"><rect x="0" y="0" width="16" height="16" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_721_86068)"><g><g><path d="M9.23953445602417,5.123295Q9.24973445602417,5.0620696,9.24973445602417,5Q9.24973445602417,4.9261315,9.23532445602417,4.853682Q9.22091445602417,4.781233,9.19264445602417,4.712987Q9.16437445602417,4.644742,9.12333445602417,4.583322Q9.08230445602417,4.521903,9.03006445602417,4.46967Q8.97783445602417,4.417437,8.91641445602417,4.376398Q8.85499445602417,4.335359,8.78674445602417,4.30709Q8.71850445602417,4.278822,8.64605445602417,4.264411Q8.57360445602417,4.25,8.49973645602417,4.25Q8.43367645602417,4.25,8.36863345602417,4.261548Q8.30359045602417,4.273095,8.24156845602417,4.295835Q8.17954545602417,4.318574,8.12245245602417,4.351806Q8.06535945602417,4.385037,8.01495445602417,4.427736Q7.96454945602417,4.470436,7.92238445602417,4.521289Q7.88021945602417,4.572143,7.84759245602417,4.629584Q7.81496645602417,4.687025,7.79288345602417,4.749284Q7.77080045602417,4.811544,7.75994045602417,4.876705L7.75990545602417,4.876916L6.75997845602417,10.8767Q6.74977445602417,10.93793,6.74977445602417,11Q6.74977445602417,11.07387,6.76418545602417,11.14632Q6.77859645602417,11.21877,6.80686445602417,11.28701Q6.83513345602417,11.355260000000001,6.87617245602417,11.41668Q6.9172114560241695,11.478100000000001,6.96944445602417,11.53033Q7.02167745602417,11.58256,7.08309645602417,11.6236Q7.14451645602417,11.66464,7.21276145602417,11.692910000000001Q7.28100745602417,11.72118,7.35345645602417,11.73559Q7.42590595602417,11.75,7.49977445602417,11.75Q7.5658345560241695,11.75,7.63087745602417,11.73845Q7.69592045602417,11.7269,7.75794345602417,11.70416Q7.8199664560241695,11.681429999999999,7.87705945602417,11.64819Q7.93415245602417,11.61496,7.98455745602417,11.57226Q8.03496245602417,11.52956,8.07712745602417,11.47871Q8.11929245602417,11.427859999999999,8.15191845602417,11.37042Q8.18454445602417,11.31297,8.20662745602417,11.250720000000001Q8.22871045602417,11.18846,8.23957045602417,11.12329L8.239595456024169,11.12314L9.23949445602417,5.123505L9.23953445602417,5.123295L9.23953445602417,5.123295Z" fill="currentColor"/></g><g><path d="M12.004713533569335,4.445133L15.004512533569336,7.1723300000000005Q15.005652533569336,7.173360000000001,15.006782533569336,7.1744Q15.061232533569335,7.22431,15.104902533569335,7.2838899999999995Q15.148572533569336,7.34347,15.179782533569336,7.41042Q15.210992533569335,7.4773700000000005,15.228532533569336,7.54913Q15.246082533569336,7.62088,15.249292533569335,7.69468Q15.252502533569336,7.76848,15.241252533569336,7.84149Q15.230002533569337,7.91449,15.204722533569337,7.9839Q15.179452533569336,8.05331,15.141122533569336,8.11646Q15.102792533569335,8.1796,15.052872533569335,8.23406L12.053263533569336,11.50648L12.052987533569336,11.50678Q11.946444533569336,11.62302,11.802116533569336,11.68651Q11.657788533569336,11.75,11.500112533569336,11.75Q11.426244033569336,11.75,11.353794533569335,11.73559Q11.281345533569336,11.72118,11.213099533569336,11.692910000000001Q11.144854533569337,11.66464,11.083434533569337,11.6236Q11.022015533569336,11.58256,10.969782533569337,11.53033Q10.917549533569336,11.478100000000001,10.876510533569336,11.41668Q10.835471533569336,11.355260000000001,10.807202533569336,11.28701Q10.778934533569336,11.21877,10.764523533569335,11.14632Q10.750112533569336,11.07387,10.750112533569336,11Q10.750112533569336,10.85927,10.801128533569337,10.728110000000001Q10.852145533569336,10.59696,10.947237533569336,10.49322L13.438262533569336,7.77563L10.995683533569336,5.5550239999999995L10.995597533569336,5.554946Q10.878335533569336,5.44834,10.814224533569336,5.303409Q10.750112533569336,5.158478,10.750112533569336,5Q10.750112533569336,4.9261315,10.764523533569335,4.853682Q10.778934533569336,4.781233,10.807202533569336,4.712987Q10.835471533569336,4.644742,10.876510533569336,4.583322Q10.917549533569336,4.521903,10.969782533569337,4.46967Q11.022015533569336,4.417437,11.083434533569337,4.376398Q11.144854533569337,4.335359,11.213099533569336,4.30709Q11.281345533569336,4.278822,11.353794533569335,4.264411Q11.426244033569336,4.25,11.500112533569336,4.25Q11.640047533569335,4.25,11.770566533569337,4.300461Q11.901086533569336,4.350922,12.004627533569336,4.445054L12.004713533569335,4.445133Z" fill="currentColor"/></g><g><path d="M5.0044,5.554946Q5.12166,5.44834,5.185779999999999,5.303409Q5.249890000000001,5.158478,5.249890000000001,5Q5.249890000000001,4.9261315,5.23548,4.853682Q5.22106,4.781233,5.1928,4.712987Q5.16453,4.644742,5.12349,4.583322Q5.08245,4.521903,5.03022,4.46967Q4.9779800000000005,4.417437,4.9165600000000005,4.376398Q4.8551400000000005,4.335359,4.7869,4.30709Q4.71865,4.278822,4.6462,4.264411Q4.57376,4.25,4.499890000000001,4.25Q4.3599499999999995,4.25,4.22943,4.300461Q4.09891,4.350922,3.99537,4.445054L3.99517,4.445237L0.995485,7.1723300000000005Q0.994349,7.173360000000001,0.993217,7.1744Q0.938763,7.22431,0.895094,7.2838899999999995Q0.851425,7.34347,0.820217,7.41042Q0.78901,7.4773700000000005,0.771464,7.54913Q0.753919,7.62088,0.750709,7.69468Q0.747499,7.76848,0.758748,7.84149Q0.769997,7.91449,0.795273,7.9839Q0.820549,8.05331,0.85888,8.11646Q0.897211,8.1796,0.947125,8.23406L3.94674,11.50648L3.94701,11.50678Q4.05356,11.62302,4.19788,11.68651Q4.34221,11.75,4.499890000000001,11.75Q4.57376,11.75,4.6462,11.73559Q4.71865,11.72118,4.7869,11.692910000000001Q4.8551400000000005,11.66464,4.9165600000000005,11.6236Q4.9779800000000005,11.58256,5.03022,11.53033Q5.08245,11.478100000000001,5.12349,11.41668Q5.16453,11.355260000000001,5.1928,11.28701Q5.22106,11.21877,5.23548,11.14632Q5.249890000000001,11.07387,5.249890000000001,11Q5.249890000000001,10.85927,5.198869999999999,10.728110000000001Q5.14785,10.59696,5.05276,10.49322L2.56174,7.77563L5.0042,5.555128L5.0044,5.554946L5.0044,5.554946Z" fill="currentColor" /></g></g></g></svg>
                {t('home.code')}
            </div>
        )
    }
    return <div  className="projectInfoView">
        {resizable&&<div id="drag"/>}
        <div id="drawCode" className="drawCode" >
            {contextHolder}
            <div className="right-header">

                {
                    functionItems.map(key=>functionMap[key])
                }
                {props.toggleFull&&<div className="operate">
                    <div onClick={fullWindow}><FullIcon/></div>
                </div>}

            </div>
            {selectMenu==="requirement" && requirementContent && <div className="contentDiv">
                <MarkdownRenderer content={requirementContent}/>
            </div>}
            {selectMenu==="flow" && workflow && <div className="contentDiv">
                <Workflow initialNodes={workflow.nodes} initialEdges={workflow.edges}/>
            </div>}
            {selectMenu==="task" && (
                waxberryTask ? <div className="taskDiv">
                    {waxberryObj.step ?
                        <Timeline>
                            {waxberryTask.map((obj,index)=>(
                                <Timeline.Item key={index} dot={<img src={getTaskStatus(obj.completed)} width="20" height="20"/>}><Collapse task={obj.task}/></Timeline.Item>
                            ))}
                        </Timeline> :
                        <MarkdownRenderer content={waxberryTask.content}/>
                    }
                </div> : <div className="taskDiv">
                    <div className="emptyTask">
                        <img src={EmptyTaskPng}/>
                        <span>{t('drawCode.noTask')}</span>
                    </div>
                </div>
            )}

            {selectMenu==="code" && <div className="codeDiv">
                <div className="codeTitle">
                    <span>{waxberryObj.name}</span>
                    <div className="operate">
                        {/*<Switch  checkedChildren={t('drawCode.readonly')} size="small" onChange={()=>setLogReadonly(!logReadonly)}  checked={logReadonly} />*/}
                        {/*<Tooltip title={t('export')} placement="bottom"><img src={ExportSvg} onClick={()=>exportWaxberry()}/></Tooltip>*/}
                        <Tooltip title={t('refresh')} placement="bottom"><img src={ReloadSvg} onClick={()=>getCodeTree()}/></Tooltip>
                        <Tooltip title={t('download')} placement="bottom"><img src={DownloadSvg} onClick={()=>downloadFile()}/></Tooltip>
                        <Tooltip title={t('upload')} placement="bottom"><img src={UploadSvg} onClick={()=>treeFileUpload.current.click()}/></Tooltip>
                        <input style={{display: 'none'}} ref={node => treeFileUpload.current = node} type="file" onChange={(e)=>handleTreeUpload(e)}/>
                        <Tooltip title={t('delete')} placement="bottom"><img src={DeleteSvg} onClick={()=>deleteFile()}/></Tooltip>
                    </div>
                    {treeUploadFile && <div className="treeUpload">
                        <span className="img" dangerouslySetInnerHTML={{ __html: getFileTypePng(treeUploadFile.suffixName) }}/>
                        <div className="fileData">
                        <span className="fileName">
                            {treeUploadFile.fileName}
                            <svg onClick={()=>closeTreeUpload()} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="14" height="14" viewBox="0 0 14 14"><defs><clipPath id="master_svg0_280_25224"><rect x="0" y="0" width="14" height="14" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_280_25224)"><g><path d="M11.60808,5.05382C11.35573,4.45869,10.9962,3.92385,10.53617,3.46494C10.07726,3.00603,9.54242,2.645377,8.947289999999999,2.393033C8.33095,2.131755,7.67552,2,7.00111,2C6.32671,2,5.671279999999999,2.131755,5.05382,2.393033C4.45869,2.645378,3.92385,3.0049099999999997,3.46494,3.46494C3.00603,3.92385,2.645377,4.45869,2.393032,5.05382C2.131755,5.670170000000001,2,6.32559,2,7C2,7.67441,2.131755,8.32984,2.393032,8.94618C2.645377,9.54131,3.0049099999999997,10.07615,3.46494,10.53506C3.92385,10.99397,4.45869,11.35462,5.05382,11.60697C5.67016,11.86825,6.32559,12,7,12C7.6744,12,8.329830000000001,11.86825,8.94618,11.60697C9.54131,11.35462,10.07614,10.99509,10.53505,10.53506C10.99396,10.07615,11.35462,9.54131,11.60696,8.94618C11.86824,8.32984,11.99999,7.67441,11.99999,7C12.0011,6.32559,11.86824,5.670170000000001,11.60808,5.05382ZM7.00111,11.09669C4.742290000000001,11.09669,2.904421,9.25882,2.904421,7C2.904421,4.74118,4.742290000000001,2.903305,7.00111,2.903305C9.25993,2.903305,11.09781,4.74118,11.09781,7C11.09781,9.25882,9.25993,11.09669,7.00111,11.09669ZM9.05783,4.95556C8.88365,4.78138,8.60004,4.78138,8.42586,4.95556L6.9933,6.38812L5.56074,4.95556C5.38655,4.78138,5.10295,4.78138,4.9287600000000005,4.95556C4.75458,5.12975,4.75458,5.413349999999999,4.9287600000000005,5.587540000000001L6.36132,7.0201L4.9287600000000005,8.45266C4.75458,8.62684,4.75458,8.91045,4.9287600000000005,9.08464C5.10295,9.25882,5.38655,9.25882,5.56074,9.08464L6.9933,7.65208L8.42586,9.08464C8.60004,9.25882,8.88365,9.25882,9.05783,9.08464C9.23202,8.91045,9.23202,8.62684,9.05783,8.45266L7.62528,7.0201L9.05783,5.587540000000001C9.23202,5.413349999999999,9.23202,5.128629999999999,9.05783,4.95556Z" fill="#FFFFFF"/></g></g></svg>
                        </span>
                            <Progress percent={treeUploadFile.progress} size={['100%',3]} strokeColor="#8B81FF" showInfo={false}/>
                        </div>
                    </div>}
                </div>
                <div className="codeBox">
                    <Spin spinning={spinning}>
                        <div id="codeDragDiv" className="codeTree">
                            <Tree
                                expandedKeys={expandedKeys}
                                selectedKeys={selectedKeys}
                                onSelect={treeSelect}
                                onExpand={treeExpand}
                            >
                                {loop(codeTreeData)}
                            </Tree>
                        </div>
                    </Spin>
                    <div className="codeData">
                        <div id="codeDrag"/>

                        {onlinePreviewUrl ?
                            <iframe
                                src={onlinePreviewUrl}
                                style={{border: 'none',width:'100%',height:'100%'}}
                            /> :
                            <CodeEditor

                                value={codeData}
                                language={monacoLanguage}
                                readOnly={logReadonly}
                            />
                        }

                    </div>
                </div>
            </div>}
            {selectMenu==="log" && <div className="logDiv">
                <CodeEditor
                    type="log"
                    value={codeLogs}
                    language="python"
                    readOnly={false}
                    autoScroll={true}
                    showAll={showAllLog}
                    allowTerminal={allowTerminal}
                />
            </div>}
        </div>
    </div>

}
export default DrawCode
