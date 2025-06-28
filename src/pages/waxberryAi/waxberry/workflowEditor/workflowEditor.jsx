import React from 'react';

import {
    ReactFlow,
    Handle,
    Position
} from '@xyflow/react';
import { Popover } from 'antd';

import StartSvg from './img/start.svg';
import TaskSvg from './img/task.svg';
import MergeSvg from './img/merge.svg';
import BranchSvg from './img/branch.svg';
import JudgeSvg from './img/judge.svg';
import EndSvg from './img/end.svg';

import '@xyflow/react/dist/style.css';
import './workflowEditor.scss';
const theme=localStorage.getItem('theme');
const getNodeTypeName = (type) => {
    switch (type) {
        case 'start': return '开始节点' ;
        case 'task': return '任务节点';
        case 'merge': return '合并节点';
        case 'branch': return '分支节点';
        case 'judge': return '判断节点';
        case 'end': return '结束节点';
        default: return '新节点';
    }
};

// 自定义的节点组件
const StartNode = ({ id, data }) => {

    const content = (
        <div className="popover-content">
            <div><span className="label">类型：</span>{getNodeTypeName('start')}</div>
            <div><span className="label">名称：</span>{data.label}</div>
            <div><span className="label">描述：</span>{data.description}</div>
            <div><span className="label">其他：</span>{data.other}</div>
        </div>
    );

    return (
        <div className="custom-node">
            <Popover
                title="节点信息"
                content={content}
                color={theme==="light"?'#F8F9FA':'#2f2d66'}
                arrow={false}
                placement="rightTop"
                overlayClassName="nodeInfoPopover"
            >
                <div className="node-name">
                    <img src={StartSvg}/>
                    <span className="label">{data.label}</span>
                </div>
            </Popover>
            <Handle type="source" position={Position.Bottom} />
        </div>
    );
};

const TaskNode = ({ id, data }) => {

    const content = (
        <div className="popover-content">
            <div><span className="label">类型：</span>{getNodeTypeName('task')}</div>
            <div><span className="label">名称：</span>{data.label}</div>
            <div><span className="label">描述：</span>{data.description}</div>
            <div><span className="label">其他：</span>{data.other}</div>
        </div>
    );

    return (
        <div className="custom-node">
            <Handle type="target" position={Position.Top} />
            <Popover
                title="节点信息"
                content={content}
                color={theme==="light"?'#F8F9FA':'#2f2d66'}
                arrow={false}
                placement="rightTop"
                overlayClassName="nodeInfoPopover"
            >
                <div className="node-name">
                    <img src={TaskSvg}/>
                    <span className="label">{data.label}</span>
                </div>
            </Popover>
            <Handle type="source" position={Position.Bottom} />
        </div>
    );
};

const MergeNode = ({ id, data }) => {

    const content = (
        <div className="popover-content">
            <div><span className="label">类型：</span>{getNodeTypeName('merge')}</div>
            <div><span className="label">名称：</span>{data.label}</div>
            <div><span className="label">描述：</span>{data.description}</div>
            <div><span className="label">其他：</span>{data.other}</div>
        </div>
    );

    return (
        <div className="custom-node">
            <Handle type="target" position={Position.Top}/>
            <Popover
                title="节点信息"
                content={content}
                color={theme==="light"?'#F8F9FA':'#2f2d66'}
                arrow={false}
                placement="rightTop"
                overlayClassName="nodeInfoPopover"
            >
                <div className="node-name">
                    <img src={MergeSvg}/>
                    <span className="label">{data.label}</span>
                </div>
            </Popover>
            <Handle type="source" position={Position.Bottom} />
        </div>
    );
};

const BranchNode = ({ id, data }) => {

    const content = (
        <div className="popover-content">
            <div><span className="label">类型：</span>{getNodeTypeName('branch')}</div>
            <div><span className="label">名称：</span>{data.label}</div>
            <div><span className="label">描述：</span>{data.description}</div>
            <div><span className="label">其他：</span>{data.other}</div>
        </div>
    );

    return (
        <div className="custom-node">
            <Handle type="target" position={Position.Top} />
            <Popover
                title="节点信息"
                content={content}
                color={theme==="light"?'#F8F9FA':'#2f2d66'}
                arrow={false}
                placement="rightTop"
                overlayClassName="nodeInfoPopover"
                trigger="click"
            >
                <div className="node-name">
                    <img src={BranchSvg}/>
                    <span className="label">{data.label}</span>
                </div>
            </Popover>
            <Handle type="source" position={Position.Bottom} />
        </div>
    );
};

const JudgeNode = ({ id, data }) => {

    const content = (
        <div className="popover-content">
            <div><span className="label">类型：</span>{getNodeTypeName('judge')}</div>
            <div><span className="label">名称：</span>{data.label}</div>
            <div><span className="label">描述：</span>{data.description}</div>
            <div><span className="label">其他：</span>{data.other}</div>
        </div>
    );

    return (
        <div className="custom-node">
            <Handle type="target" position={Position.Top} />
            <Popover
                title="节点信息"
                content={content}
                color={theme==="light"?'#F8F9FA':'#2f2d66'}
                arrow={false}
                placement="rightTop"
                overlayClassName="nodeInfoPopover"
            >
                <div className="node-name">
                    <img src={JudgeSvg}/>
                    <span className="label">{data.label}</span>
                </div>
            </Popover>
            <Handle type="source" position={Position.Bottom}/>
        </div>
    );
};

const EndNode = ({ id, data }) => {

    const content = (
        <div className="popover-content">
            <div><span className="label">类型：</span>{getNodeTypeName('end')}</div>
            <div><span className="label">名称：</span>{data.label}</div>
            <div><span className="label">描述：</span>{data.description}</div>
            <div><span className="label">其他：</span>{data.other}</div>
        </div>
    );

    return (
        <div className="custom-node">
            <Handle type="target" position={Position.Top} />
            <Popover
                title="节点信息"
                content={content}
                color={theme==="light"?'#F8F9FA':'#2f2d66'}
                arrow={false}
                placement="rightTop"
                overlayClassName="nodeInfoPopover"
            >
                <div className="node-name">
                    <img src={EndSvg}/>
                    <span className="label">{data.label}</span>
                </div>
            </Popover>
        </div>
    );
};

const nodeTypes = {
    start: StartNode,
    task: TaskNode,
    merge: MergeNode,
    branch: BranchNode,
    judge: JudgeNode,
    end: EndNode
};

const FlowEditor = ({initialNodes,initialEdges}) => (
    <div className="flow-wrapper">
        <ReactFlow
            nodes={initialNodes}
            edges={initialEdges}
            nodeTypes={nodeTypes}
            fitView
        />
    </div>
);

export default FlowEditor;
