import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import Menu from '../components/menu/index';
import Requirement from './requirement/requirement';
import Send from './send/send';
import WorkflowEditor from './workflowEditor/workflowEditor';

import axios from 'axios';
import Qs from "qs";
import {fetchEventSource} from "@microsoft/fetch-event-source";

import {CloseOutlined} from "@ant-design/icons";
import { withTranslation } from 'react-i18next';

import CreateProgressPng from './../img/createProgress.png';
import WarningSvg from "@/pages/waxberryAi/img/warning.svg";
import ProgressGif from './img/progress.gif';

import './waxberryDevStep.scss';

const urlObj = Qs.parse(window.location.search.split('?')[1]);

class WaxberryDevStep extends Component {
    constructor(props) {
        super(props);
        this.state = {
            waxberryObj: {},
            createProgress: 0,
            createProgressLabel: '创建中'
        };
    }

    componentWillMount() {
        if(urlObj.id){
            axios.get(`${globalInitConfig.REACT_APP_API_BASE_URL}mgr/agent/agent/findById?id=${urlObj.id}`).then(r1=> {
                if (r1.data.code === 200) {
                    let waxberryObj = r1.data.data;
                    if(waxberryObj.step === "flow"){
                        axios.get(`${globalInitConfig.REACT_APP_API_CORE_URL}/workflow/session/${waxberryObj.vesselId}/tags`).then(r=>{
                            let data = JSON.parse(r.data.tags.B_workflow);
                            let nodes = data.nodes;
                            let edges = data.edges;
                            if(!nodes[0].type){
                                nodes = nodes.map(node=>{
                                    return {
                                        id: node.id,
                                        type: node.data.type,
                                        data: { label: node.data.label,description: node.detail }
                                    };
                                })
                            }
                            this.setState({
                                waxberryObj,
                                nodes,
                                edges
                            });
                        });
                    }else{
                        this.setState({
                            waxberryObj
                        });
                    }
                }
            })
        }else{
            axios.post(globalInitConfig.REACT_APP_API_BASE_URL + "mgr/agent/agent/addAgent", {
                name: '新建的纳豆',
                type: 0,
                step: 'inputRequirement'
            }).then(r=>{
                if(r.data.code === 200){
                    let waxberryObj = r.data.data;
                    this.setState({
                        waxberryObj
                    });
                    window.history.replaceState({}, '', `/waxberry_dev_step?id=${waxberryObj.id}`);
                }
            })
        }
    }

    componentDidMount() {
    }

    updateFlow = (nodes,edges) =>{
        axios.put(`${globalInitConfig.REACT_APP_API_CORE_URL}/workflow/session/${this.state.waxberryObj.vesselId}/tags`,{
            B_workflow: JSON.stringify({nodes,edges})
        })
        this.setState({
            nodes,edges
        })
    };

    addWaxberry = () => {
        this.setState({
            showAddFlowModal: true
        })
    };

    send = (message) =>{
        let waxberryObj = this.state.waxberryObj;
        waxberryObj.step = 'requirement';
        axios.post(globalInitConfig.REACT_APP_API_BASE_URL + 'mgr/agent/agent/updateAgent',{
            id: waxberryObj.id,
            step: 'requirement'
        });
        this.setState({
            waxberryObj,
            requirementMessage: message
        })
    };

    addFlow = () => {
        let that = this;
        let waxberryObj = this.state.waxberryObj;
        let content = "";
        this.setState({
            createProgress: 20,
            createProgressLabel: '创建流程中，请稍后～'
        });
        let url = `${globalInitConfig.REACT_APP_API_CORE_URL}/workflow/session/${waxberryObj.vesselId}/next`;
        const eventSource = fetchEventSource(url, {
            method: 'POST',
            headers: {
                "Content-Type": 'application/json',
                "Authorization": localStorage.getItem('access_token') ? `Bearer ${localStorage.getItem('access_token')}` : ''
            },
            openWhenHidden: true,
            onmessage(event) {
                if(event.data) {
                    let data = JSON.parse(event.data);
                    content += data.content;
                }
            },
            onerror(err) {
                console.log(err);
                eventSource.close();
            },
            onclose(close) {
                if(content){
                    console.log(content);
                    content = content.replace("<B_workflow>", "").replace("</B_workflow>","");
                    let data = JSON.parse(content);
                    waxberryObj.step = 'flow';
                    axios.post(globalInitConfig.REACT_APP_API_BASE_URL + 'mgr/agent/agent/updateAgent',{
                        id: waxberryObj.id,
                        step: 'flow'
                    });
                    that.setState({
                        waxberryObj,
                        nodes: data.nodes.map(node=>{
                            return {
                                id: node.id,
                                type: node.data.type,
                                data: { label: node.data.label,description: node.detail }
                            };
                        }),
                        edges: data.edges
                    })
                }
                that.setState({
                    createProgress: 0
                })
            }
        })
    };

    okModal(){
        let that = this;
        let waxberryObj = this.state.waxberryObj;
        this.setState({
            showAddFlowModal: false,
            createProgress: 20,
            createProgressLabel: '创建工程中，请稍后～'
        });
        let url = `${globalInitConfig.REACT_APP_API_CORE_URL}/workflow/session/${waxberryObj.vesselId}/next`;
        const eventSource = fetchEventSource(url, {
            method: 'POST',
            headers: {
                "Content-Type": 'application/json',
                "Authorization": localStorage.getItem('access_token') ? `Bearer ${localStorage.getItem('access_token')}` : ''
            },
            openWhenHidden: true,
            onerror(err) {
                console.log(err);
                eventSource.close();
            },
            onclose(close) {
                const eventSource = fetchEventSource(url, {
                    method: 'POST',
                    headers: {
                        "Content-Type": 'application/json',
                        "Authorization": localStorage.getItem('access_token') ? `Bearer ${localStorage.getItem('access_token')}` : ''
                    },
                    openWhenHidden: true,
                    onerror(err) {
                        console.log(err);
                        eventSource.close();
                    },
                    onclose(close) {
                        axios.post(globalInitConfig.REACT_APP_API_BASE_URL + 'mgr/agent/agent/updateAgent',{
                            id: waxberryObj.id,
                            step: 'complete'
                        });
                        waxberryObj.step = "complete";
                        that.setState({
                            createProgress: 0,
                            waxberryObj
                        });
                        window.open(`/waxberry?id=${waxberryObj.id}&step=next`,"_self");
                    }
                })
            }
        })
    }

    hideModal() {
        this.setState({
            showAddFlowModal: false
        })
    }

    render() {
        const { waxberryObj,createProgress,nodes,edges,requirementMessage,createProgressLabel,showAddFlowModal }  = this.state;
        const { t } = this.props;

        const loadContent = () => {
            switch (waxberryObj.step) {
                case "inputRequirement":
                    return <Send waxberryObj={waxberryObj} send={this.send}/>;
                case "requirement":
                    return <Requirement waxberryObj={waxberryObj} requirementMessage={requirementMessage} addFlow={this.addWaxberry}/>;
                case "flow":
                    return (
                        <div className="app-content-data right_bj">
                            <div className="app-content-flow">
                                <div className="content-flow-header">
                                    <span className="label">{waxberryObj.name}</span>
                                    <span className="add" onClick={()=>this.addWaxberry()}>创建工程</span>
                                </div>
                                <WorkflowEditor initialNodes={nodes} initialEdges={edges} updateFlow={this.updateFlow} waxberryObj={waxberryObj}/>
                            </div>
                        </div>
                    );
                default:
                    return <div className="app-content-data right_bj"/>;
            }
        };

        return (
            <div className="requirement-report-app">
                <Menu menu="home" type="requirementReport" fileId={waxberryObj.imgeFileId}/>
                {loadContent()}
                {createProgress > 0 && <div className="createProgress">
                    <div className="createProgressBox">
                        <img src={CreateProgressPng}/>
                        <span className="label">{createProgressLabel}</span>
                        <img src={ProgressGif} height={8} width={200}/>
                    </div>
                </div>}
                {showAddFlowModal && <div className="custom-modal">
                    <div className="custom-modal-box">
                        <div className="custom-modal-title">
                            <span>确认创建</span>
                            <CloseOutlined onClick={this.hideModal.bind(this)}/>
                        </div>
                        <div className="custom-modal-content">
                            <img src={WarningSvg}/>是否根据当前需求报告，创建工程
                        </div>
                        <div className="custom-modal-footer">
                            <div className="ok" onClick={this.okModal.bind(this)}>{t('confirm')}</div>
                            <div className="close" onClick={this.hideModal.bind(this)}>{t('cancel')}</div>
                        </div>
                    </div>
                </div>}
            </div>
        );
    }
}
export default withTranslation()(WaxberryDevStep);
