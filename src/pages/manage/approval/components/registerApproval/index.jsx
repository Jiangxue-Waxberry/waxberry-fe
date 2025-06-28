import React, { useEffect,useState } from 'react';

import { useTranslation } from 'react-i18next';
import { Input,Table,Space,Button } from 'antd';
import axios from "axios";

import SuccessSvg from '../../img/success.svg';
import ErrorSvg from '../../img/error.svg';
import ReviewSvg from '../../img/review.svg';

import './index.scss';

const SearchSvg = () => <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="16" height="16" viewBox="0 0 16 16"><defs><clipPath id="master_svg0_760_005664"><rect x="0" y="0" width="16" height="16" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_760_005664)"><g><path d="M13.78183671875,15.22706611328125L11.57223671875,13.01746611328125C7.42799671875,16.11526611328125,1.46816671875,13.88926611328125,0.36948971875000003,8.83315611328125C-0.72918328125,3.77704611328125,3.76941671875,-0.72155488671875,8.82552671875,0.37711711328124997C13.88163671875,1.47578611328125,16.10763671875,7.43562611328125,13.00983671875,11.57986611328125L15.21853671875,13.79036611328125C15.60293671875,14.18916611328125,15.59723671875,14.82236611328125,15.20553671875,15.21406611328125C14.81383671875,15.60576611328125,14.18063671875,15.61156611328125,13.78183671875,15.22706611328125ZM2.23296671875,7.31991611328125C2.23296671875,10.12564611328125,4.50746671875,12.40016611328125,7.31319671875,12.40016611328125C10.11893671875,12.40016611328125,12.39343671875,10.12564611328125,12.39343671875,7.31991611328125C12.39343671875,4.51417611328125,10.11893671875,2.23967611328125,7.31319671875,2.23967611328125C4.50852671875,2.24018611328125,2.23487671875,4.51342611328125,2.23387671875,7.31808611328125L2.23296671875,7.31991611328125Z" fill="#1F2037" /></g></g></svg>;

const dataMap1 = [{
    key: 'school',
    label: '学校名称'
},{
    key: 'college',
    label: '学院'
},{
    key: 'major',
    label: '专业'
},{
    key: 'workNum',
    label: '学号/教职工工号'
},{
    key: 'email',
    label: '邮箱'
},{
    key: 'mobile',
    label: '手机号'
},{
    key: 'loginname',
    label: '用户名'
},{
    key: 'passwordMd',
    label: '密码'
},];
const dataMap2 = [{
    key: 'companyName',
    label: '公司名称'
},{
    key: 'uscc',
    label: '统一社会信用代码'
},{
    key: 'companyAdmin',
    label: '企业管理员用户名'
},{
    key: 'mobile',
    label: '手机号'
},{
    key: 'passwordMd',
    label: '密码'
},];
const dataMap3 = [{
    key: 'loginname',
    label: '用户名'
},{
    key: 'mobile',
    label: '手机号'
},{
    key: 'email',
    label: '邮箱'
},{
    key: 'passwordMd',
    label: '密码'
},];


function RegisterApproval()  {

    const { t } = useTranslation();

    const [searchName, setSearchName] = useState('');
    const [tableData, setTableData] = useState([]);
    const [detailData, setDetailData] = useState(null);
    const [dataMap, setDataMap] = useState([]);
    const [filteredInfo, setFilteredInfo] = useState({});
    const [sortedInfo, setSortedInfo] = useState({});

    const columns = [
        {
            title: '审批编号',
            dataIndex: 'approvalCode',
            key: 'approvalCode',
            width: '15%',
            ellipsis: true
        },
        {
            title: '用户名',
            dataIndex: 'username',
            key: 'username',
            width: '15%',
            ellipsis: true
        },
        {
            title: '用户手机号',
            dataIndex: 'mobile',
            key: 'mobile',
            width: '10%',
            ellipsis: true
        },
        {
            title: '注册类型',
            dataIndex: 'userType',
            key: 'userType',
            width: '10%',
            filters: [
                { text: '个人', value: 'PERSONAL' },
                { text: '企业', value: 'ENTERPRISE' },
                { text: '高校', value: 'COLLEGE' },
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
                return label;
            }
        },
        {
            title: '提交时间',
            dataIndex: 'approvalCreateTime',
            key: 'approvalCreateTime',
            width: '15%',
            sorter: true,
            ellipsis: true
        },
        {
            title: '审核滞留时间/h',
            dataIndex: 'hour',
            key: 'hour',
            width: '10%',
            sorter: true,
            ellipsis: true
        },
        {
            title: '状态',
            dataIndex: 'approvalStatus',
            key: 'approvalStatus',
            width: '10%',
            filters: [
                { text: '审核中', value: 'PROCESS' },
                { text: '已通过', value: 'PASS' },
                { text: '被驳回', value: 'REFUSE' },
            ],
            filteredValue: filteredInfo.approvalStatus || null,
            render: (text, record) => {
                const { label,icon } = getStatusInfo(text);
                return <div className="progress">
                    <img src={icon}/>
                    <span>{label}</span>
                </div>;
            }
        },
        {
            title: '操作',
            key: 'action',
            width: '15%',
            render: (_, record) => (
                <Space size="middle">
                    <Button type="link" size="small" onClick={()=>goDetail(record)}>详情</Button>
                    {record.approvalStatus === "PROCESS" && <Button type="link" size="small" onClick={()=>handleAction(record.userId,"PASS")}>通过</Button>}
                    {record.approvalStatus === "PROCESS" && <Button type="link" size="small" danger onClick={()=>handleAction(record.userId,"REFUSE")}>驳回</Button>}
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
        axios.get(`${globalInitConfig.REACT_APP_API_BASE_URL}auth/admin/users/findProcessList?name=${searchName}&sort=${sort}&sortField=${sortField}&userType=${filteredInfo.userType || ''}&approvalStatus=${filteredInfo.approvalStatus || ''}&pageSize=1000`).then(res=>{
            if(res.data.code === 200){
                setTableData(res.data.data.content);
            }
        })
    };

    const goDetail = (record) => {
        axios.get(`${globalInitConfig.REACT_APP_API_BASE_URL}auth/admin/users/findProcessById?id=${record.id}`).then(res=>{
            if(res.data.code === 200){
                let data = res.data.data;
                data.userId = record.userId;
                data.approvalCode = record.approvalCode;
                data.approvalCreateTime = record.approvalCreateTime;
                if(data.userRole === "COLLEGE"){
                    data.userRoleName = "高校";
                    setDataMap(dataMap1);
                }
                if(data.userRole === "ENTERPRISE"){
                    data.userRoleName = "企业";
                    setDataMap(dataMap2);
                }
                if(data.userRole === "PERSONAL"){
                    data.userRoleName = "个人";
                    setDataMap(dataMap3);
                }
                const { label,icon,color,background } = getStatusInfo(record.approvalStatus);
                data.color = color;
                data.background = background;
                data.approvalStatus = record.approvalStatus;
                data.approvalStatusName = label;
                data.approvalStatusIcon = icon;
                data.passwordMd = "******";
                setDetailData(data);
            }else{
                Message.error(res.data.message);
            }
        })

    };

    const handleChange = (pagination, filters, sorter) => {
        setFilteredInfo(filters);
        setSortedInfo(sorter);
    };

    const getStatusInfo = (status) => {
        let label = "已通过";
        let icon = SuccessSvg;
        let color = "#129341";
        let background = "rgba(18, 147, 65, 0.2)";
        if(status === "REFUSE"){
            icon = ErrorSvg;
            label = "被驳回";
            color = "#FC355D";
            background = "rgba(252, 53, 93, 0.2)";
        }
        if(status === "PROCESS"){
            icon = ReviewSvg;
            label = "审核中";
            color = "#2B98FF";
            background = "rgba(43, 152, 255, 0.2)";
        }
        return { label,icon,color,background };
    };

    const handleAction = (userId,status) => {
        let params = {
            status
        };
        axios.put(`${globalInitConfig.REACT_APP_API_BASE_URL}auth/admin/users/${userId}/process`,params).then(res=>{
            if(res.data.code === 200){
                Message.success("操作成功");
                getTableData();
                setDetailData(null);
            }else{
                Message.error(res.data.message);
            }
        })
    };

    return detailData ? (
        <div className="registerApprovalDetail">
            <div className="approvalDetailContent">
                <div className="content-header">
                    <div className="user">
                        <div className="userName">{detailData.loginname}</div>
                        <div className="status" style={{color: detailData.color,background: detailData.background}}>
                            <img src={detailData.approvalStatusIcon}/>
                            {detailData.approvalStatusName}
                        </div>
                    </div>
                    <div className="info">
                        <div className="info-data">
                            <span className="label">审批编号：</span>
                            <span className="data">{detailData.approvalCode}</span>
                        </div>
                        <div className="info-data">
                            <span className="label">用户名：</span>
                            <span className="data">{detailData.loginname}</span>
                        </div>
                        <div className="info-data">
                            <span className="label">类型：</span>
                            <span className="data">{detailData.userRoleName}</span>
                        </div>
                        <div className="info-data">
                            <span className="label">提交时间：</span>
                            <span className="data">{detailData.approvalCreateTime}</span>
                        </div>
                    </div>
                </div>
                <div className="content-data">
                    <div className="data-box">
                        {dataMap.map(obj=>(
                            <div className="data-item" key={obj.key}>
                                <span className="item-label">{obj.label}</span>
                                <div className="item-data"><span>{detailData[obj.key]}</span></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {detailData.approvalStatus === "PROCESS" &&
                <div className="approvalDetailFooter">
                    <span className="btn1" onClick={() => handleAction(detailData.userId, "REFUSE")}>不通过</span>
                    <span className="btn2" onClick={() => handleAction(detailData.userId, "PASS")}>通过</span>
                </div>
            }
        </div>
    ) : (
        <>
            <div className="approval-tool">
                <Input value={searchName} addonBefore={<SearchSvg/>} placeholder="搜索~" onChange={e=>setSearchName(e.target.value)}/>
                <span className="btn">批量审批</span>
            </div>
            <Table
                rowKey="id"
                size="middle"
                columns={columns}
                dataSource={tableData}
                pagination={false}
                scroll={{ y: 'calc(100% - 46px)' }}
                onChange={handleChange}
            />
        </>
    );
}

export default RegisterApproval;
