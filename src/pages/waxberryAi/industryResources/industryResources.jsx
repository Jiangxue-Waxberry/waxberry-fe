

import Header from '../components/header/index';
import LeftMenu from '../components/menu/index';
import { useMenu } from '../components/menu/menuContext';
import axios from 'axios';
import { message, Tree,Table,Spin} from 'antd';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import React, {useState,useEffect,useRef} from 'react'
import Classification1Svg from './img/classification1.jsx';
import Classification2Svg from './img/classification2.jsx';
import LibrarySvg from './img/library.jsx';
import DataSvg from './img/data.jsx';
import noComment from '@/pages/waxberryAi/img/noContent.png'
import './industryResources.scss';

const IndustryResources =(props)=>  {
    const { t } = useTranslation();
    const [treeData, setTreeData] = useState([]);
    const [selectedKeys, setSelectedKeys] = useState([]);
    const [expandedKeys, setExpandedKeys] = useState([]);
    const [selectTreeData,setSelecteTreeData] = useState(null)
    const [columns,setColumns] = useState([])
    const [tableData,setTableData] = useState([])
    const [loading,setLoading]= useState(false)
    const [treeLoading,setTreeLoading]=useState(false)
    const [messageApi, contextHolder] = message.useMessage();
    const {menuInfo} = useMenu()
    const location = useLocation();
    const [isEmptyData,setIsEmptyData]=useState(true)
    const [tableDataLoading,setTableDataLoading]=useState(false)
    const [pageInfo,setPageInfo]=useState({
        currentPage:1,
        pageSize:10,
    })
    const [total,setTotal]=useState(0)
    useEffect(()=>{
        console.log(menuInfo,location.pathname)

        getTreeData()
    },[menuInfo,location.pathname])
   useEffect(()=>{
    if(total!==0){
        getNodeInfo(selectTreeData)
    }

   },[pageInfo])
   function stripLeadingSlash(path) {
    return path.replace(/^\/+/, '');
  }
    function getTreeData() {
        if(menuInfo){
            setTreeLoading(true)
            axios.post(globalInitConfig.REACT_APP_API_BASE_URL + 'mgr//industryResources/getCategoryAuthoritiesNode',{
                id:menuInfo.id
            }).then(res => {
                const data = res.data;
                if (data.code === 200) {
                    let jsonData = JSON.parse(data.data);
                    console.log(jsonData,'?')
                    const treeData=[jsonData]
                    convertTree(treeData);
                    setTreeData(treeData)
                    setTreeLoading(false)
                }
            });
        }

    }
function tableChange(pagination){
         console.log(pagination)
         setPageInfo({...pageInfo,currentPage:pagination.current})
}
  function  convertTree(data){
        data.forEach(item=>{
            let icon = "";
            const map={
                '1':"classification",
                '2':'data'
            }
            item.modelId=item.libraryDataModelId
            item.type=item.nodeType?map[item.nodeType]:'library'
            switch (item.type) {
                case "classification":
                    if(item.parentId){
                        icon = <Classification2Svg/>;
                    }else{
                        icon = <Classification1Svg/>
                    }
                    break;
                case 'library':
                    icon = <LibrarySvg/>;
                    break;
                case 'data':
                    icon = <DataSvg/>;
                    break;
                default:
                    break;
            }
            item.icon = icon;
            if(item.children){
                convertTree(item.children);
            }
        })
    }

  function  treeSelect(selectedKeys,{node}) {
    console.log(node)
        if(node.type === "data") {
            setSelectedKeys(selectedKeys)
            setSelecteTreeData(node)
           console.log(node,)
           getNodeInfo(node)
        }else messageApi.info(t('industryResources.treeDataTypeInfo'))
    }
    function openImage(imageUrl) {
        const newWindow = window.open('about:blank', '_blank'); // 打开一个空白页面
        newWindow.document.write(`<img src="${imageUrl}" alt="image" />`);
        newWindow.document.close(); // 关闭文档流
      }
  function getNodeInfo(node){
    const body={
        "modelId": node.modelId,
        "categoryId":node.id
    }
    setLoading(true)
    setIsEmptyData(true)
    setTableDataLoading(true)
    axios.post(globalInitConfig.REACT_APP_API_BASE_URL + 'mgr/industryResources/findIndustryResourcesHead', body).then(res => {
        const data = res.data;
        if (data.code === 200) {

            const columnsInfo=JSON.parse(data.data)
            console.log(columnsInfo)
           if(columnsInfo) {
            setColumns(columnsInfo.columnList.map(item=>{
                const columnConfig={
                    key:item.columnName,
                    dataIndex:item.columnName,
                    title:item.name,

                }
                if(item.columnName==="FUJIAN_D5LI"){
                     const render= (obj) => {

                     return <span style={{cursor:'pointer'}} onClick={()=>{
                        openImage(obj.downloadUrl+obj.fileId)
                       // window.open(obj.downloadUrl+obj.fileId)
                     }}>{obj.fileName}</span>
                    }
                    columnConfig.render=render
                }

                return columnConfig
            }))
            axios.post(globalInitConfig.REACT_APP_API_BASE_URL + 'mgr//industryResources/findIndustryResourcesList', {
                ...body,...pageInfo,
                type:node.type

            }).then(res=>{
                setTableDataLoading(false)
                  if (res.data.code === 200) {
                    const tableDataInfo=JSON.parse(res.data.data)
                    console.log(tableDataInfo)
                   setTotal(tableDataInfo.libraryDateCount)
                   if(tableDataInfo.data.length>0){
                    setIsEmptyData(false)
                   }else setIsEmptyData(true)
                   setTableData( tableDataInfo.data.map(item=>{
                        return {
                            key:item.ID,
                            ...item
                        }
                    }))
                    setLoading(false)


                  }else setIsEmptyData(true)
            })
           }else{
            setLoading(false)
           }

        }
    });
  }
  function  treeExpand(expandedKeys) {
    setExpandedKeys(expandedKeys)

    }




        return (

                    <div className="app-content-right right_bj">
                        <div className="content-header">
                            <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="24" height="24" viewBox="0 0 24 24"><defs><clipPath id="master_svg0_280_35835"><rect x="0" y="0" width="24" height="24" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_280_35835)"><g><path d="M14,2L6,2C4.895431,1.999999821186,4.000000357628,2.89543,4,4L4,20C4.000000357628,21.1046,4.895431,22,6,22L18,22C19.104599999999998,22,20,21.1046,20,20L20,8L14,2ZM13,3.5L18.5,9L13,9L13,3.5Z" fill="currentColor"/></g></g></svg>
                           {t('industryResources.title')}
                        </div>
                        <div className="content-data">
                            <div className="content-data-left">
                            {treeLoading?<div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:"center"}}>
                                <Spin />
                            </div>:<Tree
                                showIcon
                                treeData={treeData}
                                fieldNames={{
                                    title: 'name',
                                    key: 'id',
                                    children: 'children'
                                }}
                                expandedKeys={expandedKeys}
                                selectedKeys={selectedKeys}
                                onSelect={treeSelect}
                                onExpand={treeExpand}
                            />}
                            </div>


                            <div className="content-data-right">
                              {
                                isEmptyData?<div className="null-content">
                                    <div className="emptyData">
                                        {
                                            tableDataLoading? <Spin size="large" />:<>
                                                 <img style={{height:120,width:120}} src={noComment}/>
                                                 <div style={{marginTop:6}}>{t('industryResources.noContent')}</div>
                                            </>
                                        }

                                    </div>
                                </div>
                                :<Table
                                columns={columns}
                                dataSource={tableData}
                                onChange={tableChange}

                                loading={loading}
                                scroll={{ x: 'max-content' }}
                            />
                              }

                            </div>
                        </div>
                    </div>


        );
    }

export default IndustryResources;
