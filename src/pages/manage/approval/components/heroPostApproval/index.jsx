import React, { useEffect,useState } from 'react';

import axios from "axios";
import { useTranslation } from 'react-i18next';
import { Input,Table,Space,Button,Form } from 'antd';
import {CloseOutlined} from "@ant-design/icons";

import SuccessSvg from '../../img/success.svg';
import ErrorSvg from '../../img/error.svg';
import ReviewSvg from '../../img/review.svg';

const SearchSvg = () => <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="16" height="16" viewBox="0 0 16 16"><defs><clipPath id="master_svg0_760_005664"><rect x="0" y="0" width="16" height="16" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_760_005664)"><g><path d="M13.78183671875,15.22706611328125L11.57223671875,13.01746611328125C7.42799671875,16.11526611328125,1.46816671875,13.88926611328125,0.36948971875000003,8.83315611328125C-0.72918328125,3.77704611328125,3.76941671875,-0.72155488671875,8.82552671875,0.37711711328124997C13.88163671875,1.47578611328125,16.10763671875,7.43562611328125,13.00983671875,11.57986611328125L15.21853671875,13.79036611328125C15.60293671875,14.18916611328125,15.59723671875,14.82236611328125,15.20553671875,15.21406611328125C14.81383671875,15.60576611328125,14.18063671875,15.61156611328125,13.78183671875,15.22706611328125ZM2.23296671875,7.31991611328125C2.23296671875,10.12564611328125,4.50746671875,12.40016611328125,7.31319671875,12.40016611328125C10.11893671875,12.40016611328125,12.39343671875,10.12564611328125,12.39343671875,7.31991611328125C12.39343671875,4.51417611328125,10.11893671875,2.23967611328125,7.31319671875,2.23967611328125C4.50852671875,2.24018611328125,2.23487671875,4.51342611328125,2.23387671875,7.31808611328125L2.23296671875,7.31991611328125Z" fill="#1F2037" /></g></g></svg>;

function HeroPostApproval()  {

    const { t } = useTranslation();

    const [form]=Form.useForm();
    const [currentMenu, setCurrentMenu] = useState('HPA');
    const [searchName, setSearchName] = useState('');
    const [tableData, setTableData] = useState([]);
    const [filteredInfo, setFilteredInfo] = useState({});
    const [sortedInfo, setSortedInfo] = useState({});
    const [rejectData, setRejectData] = useState(null);

    const columns1 = [
        {
            title: '审批编号',
            dataIndex: 'approvalNumber',
            key: 'approvalNumber',
            width: 170,
            ellipsis: true
        },
        {
            title: '类型',
            dataIndex: 'approval',
            key: 'approval',
            width: 170,
            ellipsis: true
        },
        {
            title: '申请人用户名',
            dataIndex: 'applicant',
            key: 'applicant',
            width: 170,
            ellipsis: true
        },
        {
            title: '申请人类型',
            dataIndex: 'userRole',
            key: 'userRole',
            width: 170,
            filters: [
                { text: '个人', value: 'PERSONAL' },
                { text: '企业', value: 'ENTERPRISE' },
                { text: '高校', value: 'COLLEGE' },
                { text: '管理员', value: 'ADMIN' },
            ],
            filteredValue: filteredInfo.userRole || null,
            render: (text, record) => {
                let label = "";
                if (text === "PERSONAL") {
                    label = "个人";
                }
                if (text === "ENTERPRISE") {
                    label = "企业";
                }
                if (text === "COLLEGE") {
                    label = "高校";
                }
                if (text === "ADMIN") {
                    label = "管理员";
                }
                return label;
            }
        },
        {
            title: '联系人姓名',
            dataIndex: 'contacts',
            key: 'contacts',
            width: 170,
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
            title: '需求类型',
            dataIndex: 'demandType',
            key: 'demandType',
            width: 170,
            ellipsis: true
        },
        {
            title: '标题',
            dataIndex: 'title',
            key: 'title',
            width: 170,
            ellipsis: true
        },
        {
            title: '预算',
            dataIndex: 'budget',
            key: 'budget',
            width: 170,
            ellipsis: true
        },
        {
            title: '提交时间',
            dataIndex: 'creatorTime',
            key: 'creatorTime',
            width: 200,
            sorter: true
        },
        {
            title: '审核滞留时间/h',
            dataIndex: 'hour',
            key: 'hour',
            width: 150,
            ellipsis: true
        },
        {
            title: '状态',
            dataIndex: 'statusId',
            key: 'statusId',
            width: 170,
            filters: [
                { text: '审核中', value: 'AdminReview' },
                { text: '已通过', value: 'PASS' },
                { text: '被驳回', value: 'Reject' },
            ],
            filteredValue: filteredInfo.statusId || null,
            render: (text, record) => {
                const { label,icon } = getStatusInfo(text);
                return <div className="progress">
                    <img src={icon}/>
                    <span>{label}</span>
                </div>;
            },
        },
        {
            title: '操作',
            key: 'action',
            width: 220,
            fixed: 'right',
            render: (_, record) => (
                <Space size="middle">
                    <Button type="link" size="small" onClick={()=>goDetail(record,"1")}>详情</Button>
                    {record.statusId === "AdminReview" && <Button type="link" size="small" onClick={()=>handlePassAction(record)}>通过</Button>}
                    {record.statusId === "AdminReview" && <Button type="link" size="small" danger onClick={()=>setRejectData(record)}>驳回</Button>}
                </Space>
            ),
        }
    ];
    const columns2 = [
        {
            title: '审批编号',
            dataIndex: 'approvalNumber',
            key: 'approvalNumber',
            width: 170,
            ellipsis: true
        },
        {
            title: '类型',
            dataIndex: 'approval',
            key: 'approval',
            width: 170,
            ellipsis: true
        },
        {
            title: '申请人用户名',
            dataIndex: 'applicant',
            key: 'applicant',
            width: 170,
            ellipsis: true
        },
        {
            title: '申请人类型',
            dataIndex: 'userRole',
            key: 'userRole',
            width: 170,
            filters: [
                { text: '个人', value: 'PERSONAL' },
                { text: '企业', value: 'ENTERPRISE' },
                { text: '高校', value: 'COLLEGE' },
                { text: '管理员', value: 'ADMIN' },
            ],
            filteredValue: filteredInfo.userRole || null,
            render: (text, record) => {
                let label = "";
                if (text === "PERSONAL") {
                    label = "个人";
                }
                if (text === "ENTERPRISE") {
                    label = "企业";
                }
                if (text === "COLLEGE") {
                    label = "高校";
                }
                if (text === "ADMIN") {
                    label = "管理员";
                }
                return label;
            }
        },
        {
            title: '英雄帖',
            dataIndex: 'demandNumber',
            key: 'demandNumber',
            width: 170,
            render: (text, record) => {
                return text ? <a href={`${globalInitConfig.REACT_APP_API_OPERATION_URL}demandDetail?demandNumber=${text}`}>{text}</a> : '';
            },
        },
        {
            title: '英雄帖失效时间',
            dataIndex: 'deadline',
            key: 'deadline',
            width: 200,
            ellipsis: true
        },
        {
            title: '提交时间',
            dataIndex: 'creatorTime',
            key: 'creatorTime',
            width: 200,
            sorter: true
        },
        {
            title: '审核滞留时间/h',
            dataIndex: 'hour',
            key: 'hour',
            width: 150,
            ellipsis: true
        },
        {
            title: '状态',
            dataIndex: 'statusId',
            key: 'statusId',
            width: 170,
            filters: [
                { text: '审核中', value: 'AdminReview' },
                { text: '已通过', value: 'PASS' },
                { text: '被驳回', value: 'Reject' },
            ],
            filteredValue: filteredInfo.statusId || null,
            render: (text, record) => {
                const { label,icon } = getStatusInfo(text);
                return <div className="progress">
                    <img src={icon}/>
                    <span>{label}</span>
                </div>;
            },
        },
        {
            title: '操作',
            key: 'action',
            width: 220,
            fixed: 'right',
            render: (_, record) => (
                <Space size="middle">
                    <Button type="link" size="small" onClick={()=>goDetail(record,"2")}>详情</Button>
                    {record.statusId === "AdminReview" && <Button type="link" size="small" onClick={()=>handlePassAction(record)}>通过</Button>}
                    {record.statusId === "AdminReview" && <Button type="link" size="small" danger onClick={()=>setRejectData(record)}>驳回</Button>}
                </Space>
            ),
        }
    ];
    const columns3 = [
        {
            title: '审批编号',
            dataIndex: 'approvalNumber',
            key: 'approvalNumber',
            width: 170,
            ellipsis: true
        },
        {
            title: '类型',
            dataIndex: 'approval',
            key: 'approval',
            width: 170,
            ellipsis: true
        },
        {
            title: '申请人用户名',
            dataIndex: 'applicant',
            key: 'applicant',
            width: 170,
            ellipsis: true
        },
        {
            title: '申请人类型',
            dataIndex: 'userRole',
            key: 'userRole',
            width: 170,
            filters: [
                { text: '个人', value: 'PERSONAL' },
                { text: '企业', value: 'ENTERPRISE' },
                { text: '高校', value: 'COLLEGE' },
                { text: '管理员', value: 'ADMIN' },
            ],
            filteredValue: filteredInfo.userRole || null,
            render: (text, record) => {
                let label = "";
                if (text === "PERSONAL") {
                    label = "个人";
                }
                if (text === "ENTERPRISE") {
                    label = "企业";
                }
                if (text === "COLLEGE") {
                    label = "高校";
                }
                if (text === "ADMIN") {
                    label = "管理员";
                }
                return label;
            }
        },
        {
            title: '接单时间',
            dataIndex: 'acceptTime',
            key: 'acceptTime',
            width: 200,
            ellipsis: true
        },
        {
            title: '英雄帖',
            dataIndex: 'demandNumber',
            key: 'demandNumber',
            width: 170,
            render: (text, record) => {
                return text ? <a href={`${globalInitConfig.REACT_APP_API_OPERATION_URL}demandDetail?demandNumber=${text}`}>{text}</a> : '';
            },
        },
        {
            title: '英雄帖截止时间',
            dataIndex: 'deadline',
            key: 'deadline',
            width: 200,
            ellipsis: true
        },
        {
            title: '提交时间',
            dataIndex: 'creatorTime',
            key: 'creatorTime',
            width: 200,
            sorter: true,
            ellipsis: true
        },
        {
            title: '审核滞留时间/h',
            dataIndex: 'hour',
            key: 'hour',
            width: 150,
            ellipsis: true
        },
        {
            title: '状态',
            dataIndex: 'statusId',
            key: 'statusId',
            width: 170,
            filters: [
                { text: '审核中', value: 'AdminReview' },
                { text: '已通过', value: 'PASS' },
                { text: '被驳回', value: 'Reject' },
            ],
            filteredValue: filteredInfo.statusId || null,
            render: (text, record) => {
                const { label,icon } = getStatusInfo(text);
                return <div className="progress">
                    <img src={icon}/>
                    <span>{label}</span>
                </div>;
            },
        },
        {
            title: '操作',
            key: 'action',
            width: 220,
            fixed: 'right',
            render: (_, record) => (
                <Space size="middle">
                    <Button type="link" size="small" onClick={()=>goDetail(record,"3")}>详情</Button>
                    {record.statusId === "AdminReview" && <Button type="link" size="small" onClick={()=>handlePassAction(record)}>通过</Button>}
                    {record.statusId === "AdminReview" && <Button type="link" size="small" danger onClick={()=>setRejectData(record)}>驳回</Button>}
                </Space>
            ),
        }
    ];

    const [columns, setColumns] = useState(columns1);

    useEffect(()=>{
        getTableData();
    },[currentMenu,filteredInfo,searchName]);

    const getTableData = () =>{
        if(currentMenu === "HPA"){
            setColumns(columns1);
        }
        if(currentMenu === "HTA"){
            setColumns(columns2);
        }
        if(currentMenu === "HFA"){
            setColumns(columns3);
        }
        let sort = '';
        let sortField = '';
        if(sortedInfo.columnKey){
            sort = sortedInfo.order === "ascend" ? 0 : 1;
            sortField = sortedInfo.columnKey;
        }
        axios.get(`${globalInitConfig.REACT_APP_API_BASE_URL}operation/api/demand/adminExamineList?title=${searchName}&approval=${currentMenu}&sort=${sort}&sortField=${sortField}&userRole=${filteredInfo.userRole || ''}&statusId=${filteredInfo.statusId || ''}&pageNo=1&pageSize=1000`).then(res=>{
            if(res.data.code === 200){
                setTableData(res.data.data);
            }
        })
    };

    const handleChange = (pagination, filters, sorter) => {
        setFilteredInfo(filters);
        setSortedInfo(sorter);
    };

    const goDetail = (record,key) => {
        if(key === "1"){
            window.open(`${globalInitConfig.REACT_APP_API_OPERATION_URL}publishDetail?approvalNumber=${record.approvalNumber}`)
        }
        if(key === "2"){
            window.open(`${globalInitConfig.REACT_APP_API_OPERATION_URL}respondDetail?approvalNumber=${record.approvalNumber}`)
        }
        if(key === "3"){
            window.open(`${globalInitConfig.REACT_APP_API_OPERATION_URL}deliverDetail?approvalNumber=${record.approvalNumber}`)
        }
    };

    const getStatusInfo = (status) => {
        let label = "已通过";
        let icon = SuccessSvg;
        if(status === "Reject"){
            icon = ErrorSvg;
            label = "被驳回";
        }
        if(status === "AdminReview"){
            icon = ReviewSvg;
            label = "审核中";
        }
        return { label,icon };
    };

    const handlePassAction = (obj) => {
        let params = {
            "approvalNumber": obj.approvalNumber,
            "statusId": "Pass"
        };
        axios.post(`${globalInitConfig.REACT_APP_API_BASE_URL}operation/api/demand/adminExamineDemand`,params).then(res=>{
            if(res.data.code === 200){
                getTableData();
                Message.success("操作成功");
            }else{
                Message.error(res.data.message);
            }
        })
    };

    const handleRejectAction = (form) => {
        let params = {
            "approvalNumber": rejectData.approvalNumber,
            "statusId": "Reject",
            "title": form.approvalTitle,
            "approvalLanguage": form.approvalLanguage
        };
        axios.post(`${globalInitConfig.REACT_APP_API_BASE_URL}operation/api/demand/adminExamineDemand`,params).then(res=>{
            if(res.data.code === 200){
                Message.success("操作成功");
                getTableData();
                setRejectData(null);
            }else{
                Message.error(res.data.message);
            }
        })
    };

    const currentMenuChange = (type) => {
        setCurrentMenu(type);
        setFilteredInfo({});
        setSortedInfo({});
        setSearchName('');
    };

    const onFinishFailed = (errorInfo) => {
        console.log("Failed:", errorInfo);
    };

    return (
        <>
            <div className="approval-type">
                <span className={currentMenu==="HPA"?"type type-active":"type"} onClick={()=>currentMenuChange("HPA")}>英雄帖发布</span>
                <span className={currentMenu==="HTA"?"type type-active":"type"} onClick={()=>currentMenuChange("HTA")}>揭帖审批</span>
                <span className={currentMenu==="HFA"?"type type-active":"type"} onClick={()=>currentMenuChange("HFA")}>结项审批</span>
                <Input value={searchName} addonBefore={<SearchSvg/>} placeholder="搜索~" onChange={e=>setSearchName(e.target.value)}/>
            </div>
            <Table
                rowKey="approvalNumber"
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
                                approvalTitle:'',
                                approvalLanguage:'',
                            }}
                            form={form}
                            layout="vertical"
                            onFinish={handleRejectAction}
                            onFinishFailed={onFinishFailed}
                        >
                            <Form.Item name="approvalTitle" label="标题" rules={[{ required: true ,message: "请输入，不超过10个字",max:10}]}>
                                <Input placeholder="请输入，不超过10个字"/>
                            </Form.Item>
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

export default HeroPostApproval;
