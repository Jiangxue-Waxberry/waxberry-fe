import React, { useEffect,useState } from 'react';

import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Input,Table,Space,Button,Form } from 'antd';
import {CloseOutlined} from "@ant-design/icons";

import SuccessSvg from '../../img/success.svg';
import ErrorSvg from '../../img/error.svg';
import ReviewSvg from '../../img/review.svg';

const SearchSvg = () => <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="16" height="16" viewBox="0 0 16 16"><defs><clipPath id="master_svg0_760_005664"><rect x="0" y="0" width="16" height="16" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_760_005664)"><g><path d="M13.78183671875,15.22706611328125L11.57223671875,13.01746611328125C7.42799671875,16.11526611328125,1.46816671875,13.88926611328125,0.36948971875000003,8.83315611328125C-0.72918328125,3.77704611328125,3.76941671875,-0.72155488671875,8.82552671875,0.37711711328124997C13.88163671875,1.47578611328125,16.10763671875,7.43562611328125,13.00983671875,11.57986611328125L15.21853671875,13.79036611328125C15.60293671875,14.18916611328125,15.59723671875,14.82236611328125,15.20553671875,15.21406611328125C14.81383671875,15.60576611328125,14.18063671875,15.61156611328125,13.78183671875,15.22706611328125ZM2.23296671875,7.31991611328125C2.23296671875,10.12564611328125,4.50746671875,12.40016611328125,7.31319671875,12.40016611328125C10.11893671875,12.40016611328125,12.39343671875,10.12564611328125,12.39343671875,7.31991611328125C12.39343671875,4.51417611328125,10.11893671875,2.23967611328125,7.31319671875,2.23967611328125C4.50852671875,2.24018611328125,2.23487671875,4.51342611328125,2.23387671875,7.31808611328125L2.23296671875,7.31991611328125Z" fill="#1F2037" /></g></g></svg>;

function WaxberryApproval()  {

    const { t } = useTranslation();

    const [form] = Form.useForm();
    const [searchName, setSearchName] = useState('');
    const [tableData, setTableData] = useState([]);
    const [filteredInfo, setFilteredInfo] = useState({});
    const [sortedInfo, setSortedInfo] = useState({});
    const [rejectData, setRejectData] = useState(null);

    const columns = [
        {
            title: '审批编号',
            dataIndex: 'approvalCode',
            key: 'approvalCode',
            width: 170,
            fixed: 'left',
            ellipsis: true
        },
        {
            title: '申请人用户名',
            dataIndex: 'username',
            key: 'username',
            width: 170,
            fixed: 'left',
            ellipsis: true
        },
        {
            title: '联系人手机号',
            dataIndex: 'mobile',
            key: 'mobile',
            width: 170,
            ellipsis: true
        },
        {
            title: '申请人类型',
            dataIndex: 'userType',
            key: 'userType',
            width: 170,
            filters: [
                { text: '个人', value: 'PERSONAL' },
                { text: '企业', value: 'ENTERPRISE' },
                { text: '高校', value: 'COLLEGE' },
                { text: '管理员', value: 'ADMIN' },
            ],
            filteredValue: filteredInfo.userType || null,
            render: (text, record) => {
                let label = "";
                if(text === "PERSONAL"){
                    label = "个人";
                }
                if(text === "ENTERPRISE"){
                    label = "企业";
                }
                if(text === "COLLEGE"){
                    label = "高校";
                }
                if(text === "ADMIN"){
                    label = "管理员";
                }
                return label;
            },
        },
        {
            title: '名称',
            dataIndex: 'agentName',
            key: 'agentName',
            width: 250,
            ellipsis: true
        },
        {
            title: '类型',
            dataIndex: 'agentType',
            key: 'agentType',
            width: 170,
            filters: [
                { text: 'App', value: '0' },
                { text: '智能体', value: '1' },
                { text: '小模型', value: '2' },
            ],
            filteredValue: filteredInfo.agentType || null,
            render: (text, record) => {
                let label = "App";
                if(text === 1){
                    label = "智能体";
                }
                if(text === 2){
                    label = "小模型";
                }
                if(text === 3){
                    label = "大模型";
                }
                return label;
            }
        },
        {
            title: '简介',
            dataIndex: 'agentDiscription',
            key: 'agentDiscription',
            width: 170,
            ellipsis: true
        },
        {
            title: '分类',
            dataIndex: 'agentClassification',
            key: 'agentClassification',
            width: 170,
            ellipsis: true
        },
        {
            title: '是否允许修改',
            dataIndex: 'agentIsmodify',
            key: 'agentIsmodify',
            width: 170,
            render: (text, record) => {
                let label = "False";
                if(text === 0){
                    label = "True";
                }
                return label;
            }
        },
        {
            title: '创建时间',
            dataIndex: 'agentCreateTime',
            key: 'agentCreateTime',
            width: 200,
            sorter: true,
            ellipsis: true
        },
        {
            title: '提交时间',
            dataIndex: 'approvalCreateTime',
            key: 'approvalCreateTime',
            width: 200,
            sorter: true,
            ellipsis: true
        },
        {
            title: '审核滞留时间/h',
            dataIndex: 'hour',
            key: 'hour',
            width: 150,
            sorter: true,
            ellipsis: true
        },
        {
            title: '状态',
            dataIndex: 'approvalStatus',
            key: 'approvalStatus',
            width: 220,
            filters: [
                { text: '审核中', value: 'PROCESS' },
                { text: '已通过', value: 'PASS' },
                { text: '被驳回', value: 'REFUSE' },
            ],
            filteredValue: filteredInfo.approvalStatus || null,
            render: (text, record) => {
                let label = "已通过";
                let icon = SuccessSvg;
                if(text === "REFUSE"){
                    icon = ErrorSvg;
                    label = "被驳回";
                }
                if(text === "PROCESS"){
                    icon = ReviewSvg;
                    label = "审核中";
                }
                return <div className="progress">
                    <img src={icon}/>
                    <span>{label}</span>
                </div>;
            },
        },
        {
            title: '操作',
            key: 'action',
            width: 250,
            fixed: 'right',
            render: (_, record) => (
                <Space size="middle">
                    <Button type="link" size="small" onClick={()=>goDetail(record)}>详情</Button>
                    {record.approvalStatus === "PROCESS" && <Button type="link" size="small" onClick={()=>handleAction(record.id,"PASS")}>通过</Button>}
                    {record.approvalStatus === "PROCESS" && <Button type="link" size="small" danger onClick={()=>setRejectData(record)}>驳回</Button>}
                </Space>
            ),
        },
    ];

    useEffect(()=>{
        getTableData();
    },[filteredInfo,sortedInfo,searchName]);

    const getTableData = () =>{
        let sort = '';
        let sortField = '';
        if(sortedInfo.columnKey){
            sort = sortedInfo.order === "ascend" ? 0 : 1;
            sortField = sortedInfo.columnKey;
        }
        axios.get(`${globalInitConfig.REACT_APP_API_BASE_URL}mgr/agent/agentApproval/findAgentApprovalList?name=${searchName}&sort=${sort}&sortField=${sortField}&userType=${filteredInfo.userType || ''}&agentType=${filteredInfo.agentType || ''}&approvalStatus=${filteredInfo.approvalStatus || ''}&pageSize=1000`).then(res=>{
            if(res.data.code === 200){
                setTableData(res.data.data.content);
            }
        })
    };

    const handleChange = (pagination, filters, sorter) => {
        setFilteredInfo(filters);
        setSortedInfo(sorter);
    };

    const handleRefuseAction = (form) => {
        let params = {
            id: rejectData.id,
            status: 'REFUSE',
            ...form
        };
        axios.post(`${globalInitConfig.REACT_APP_API_BASE_URL}mgr/agent/agentApproval/updateAgentApproval`,params).then(res=>{
            if(res.data.code === 200){
                setRejectData(null);
                getTableData();
                Message.success("操作成功");
            }else{
                Message.error(res.data.message);
            }
        })
    };

    const handleAction = (id, status) => {
        let params = {
            id,
            status
        };
        axios.post(`${globalInitConfig.REACT_APP_API_BASE_URL}mgr/agent/agentApproval/updateAgentApproval`,params).then(res=>{
            if(res.data.code === 200){
                getTableData();
                Message.success("操作成功");
            }else{
                Message.error(res.data.message);
            }
        })
    };

    const goDetail = (item) => {
        if(item.agentType === 0){
            window.open(`/waxberry?id=${item.agentId}`);
            return;
        }
        if(item.agentType === 1){
            window.open(`/agent?id=${item.agentId}`);
            return;
        }
        if(item.agentType === 2){
            window.open(`/small_model?id=${item.agentId}`);
        }
    };

    const onFinishFailed = (errorInfo) => {
        console.log("Failed:", errorInfo);
    };

    return (
        <>
            <div className="approval-tool">
                <Input value={searchName} addonBefore={<SearchSvg/>} placeholder="搜索纳豆~" onChange={e=>setSearchName(e.target.value)}/>
                <span className="btn">批量审批</span>
            </div>
            <Table
                rowKey="id"
                size="middle"
                columns={columns}
                dataSource={tableData}
                pagination={false}
                scroll={{ x: 'max-content',y: 'calc(100% - 46px)' }}
                onChange={handleChange}
            />
            {rejectData && <div className="approval-modal">
                <div className="modal-box">
                    <div className="modal-title">
                        <span>审批语</span>
                        <CloseOutlined onClick={()=>setRejectData(null)}/>
                    </div>
                    <div className="modal-content">
                        <Form
                            initialValues={{
                                approvalLanguage:'',
                            }}
                            form={form}
                            layout="vertical"
                            onFinish={handleRefuseAction}
                            onFinishFailed={onFinishFailed}
                        >
                            <Form.Item name="approvalLanguage" label="审批语" rules={[{ required: true ,message: "请输入"}]}>
                                <Input.TextArea rows={8} placeholder="请输入"/>
                            </Form.Item>
                        </Form>
                    </div>
                    <div className="modal-footer">
                        <div className="ok" onClick={()=>form.submit()}>{t('confirm')}</div>
                        <div className="close" onClick={()=>setRejectData(null)}>{t('cancel')}</div>
                    </div>
                </div>
            </div>}
        </>
    );
}

export default WaxberryApproval;
