import React, {useState,useEffect} from 'react'

import axios from 'axios';
import { message,Menu } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import IconPng from './icon.png';
import './mcp.scss';

const UserSvg = () => <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="16" height="16" viewBox="0 0 16 16"><defs><clipPath id="master_svg0_594_61799"><rect x="4" y="4" width="8" height="8" rx="0"/></clipPath></defs><g><g><rect x="0" y="0" width="16" height="16" rx="8" fill="#312B70"/></g><g clipPath="url(#master_svg0_594_61799)"><g><path d="M7.905859375,5.008424165C7.162109375,5.052174175,6.549609375,5.658424375,6.499609375,6.402169375C6.443359375,7.277179374999999,7.130859375,8.008419374999999,7.993359375,8.008419374999999C8.824609375,8.008419374999999,9.493359375,7.333429375,9.493359375,6.508429375C9.499609375,5.645924375,8.774609375,4.9584245750000004,7.905859375,5.008424165ZM7.999609375,8.495929375C6.999609375,8.495929375,5.005859375,8.995929375,5.005859375,9.995919375L5.005859375,10.745919375C5.005859375,10.883419374999999,5.118359375,10.995919375,5.255859375,10.995919375L10.743359375,10.995919375C10.880859375,10.995919375,10.993359375,10.883419374999999,10.993359375,10.745919375L10.993359375,9.989679375C10.993359375,8.995929375,8.999609375,8.495929375,7.999609375,8.495929375Z" fill="#B6B7EA"/></g></g></g></svg>;
const OverviewSvg = () => <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="16" height="16" viewBox="0 0 16 16"><defs><clipPath id="master_svg0_514_045522"><rect x="0" y="0" width="16" height="16" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_514_045522)"><g><path d="M8,15C4.13401,15,1,11.866,1,8C1,4.13401,4.13401,1,8,1C11.866,1,15,4.13401,15,8C15,11.866,11.866,15,8,15ZM8,2.4C4.90721,2.4,2.4,4.90721,2.4,8C2.4,11.0928,4.90721,13.6,8,13.6C11.0928,13.6,13.6,11.0928,13.6,8C13.6,4.90721,11.0928,2.4,8,2.4ZM8,12.2C7.6134,12.2,7.3,11.8866,7.3,11.5L7.3,6.6C7.3,6.2134,7.6134,5.9,8,5.9C8.3866,5.9,8.7,6.2134,8.7,6.6L8.7,11.5C8.7,11.8866,8.3866,12.2,8,12.2ZM8,5.2C7.60332,5.21528,7.27334,4.89799,7.27306,4.5010200000000005C7.27277,4.10405,7.6023,3.78629,7.999,3.801C8.37505,3.81495,8.67277,4.12371,8.67304,4.50002C8.67331,4.87632,8.37603,5.18551,8,5.2Z" fill="currentColor"/></g></g></svg>;
const ToolSvg = () => <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="16" height="16" viewBox="0 0 16 16"><defs><clipPath id="master_svg0_514_045515"><rect x="0" y="0" width="16" height="16" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_514_045515)"><g><path d="M14.319090625,11.148290625L11.183790625,8.013290625C11.385690625,7.449630625,11.487890625,6.860440625,11.487890625,6.256630625C11.487890625,3.372200625,9.141360625,1.025390625,6.256670625,1.025390625C5.538550625,1.025390625,4.839880625,1.170140625,4.180630625,1.455482625L3.868740625,1.590495625C3.868250625,1.590991625,3.870690625,1.5912306250000001,3.869720625,1.5917106250000002C3.840060625,1.6046296249999998,3.812300625,1.623353625,3.787980625,1.647672625C3.684820625,1.751042625,3.684820625,1.919152625,3.788490625,2.022794625C3.789950625,2.024265625,3.787020625,2.024984625,3.787980625,2.026440625L6.716920625,4.955400624999999L4.9551606249999995,6.716890625L2.085070625,3.846580625C2.080690625,3.847080625,2.076310625,3.847320625,2.070470625,3.841480625C1.948844625,3.719850625,1.751794625,3.719850625,1.630132625,3.841480625C1.597066625,3.874820625,1.5727156249999998,3.913510625,1.557637625,3.954860625C1.556182625,3.958750625,1.554231625,3.956810625,1.552297625,3.957050625L1.4554666250000001,4.180850625C1.170380625,4.839380625,1.025390625,5.538040625,1.025390625,6.256660625C1.025390625,9.140850625,3.371960625,11.487890625,6.256630625,11.487890625C6.859930625,11.487890625,7.449110625,11.385690625,8.013480625,11.183790625L11.148690625,14.318590625C11.571990625,14.741890625,12.134990625,14.975390625,12.733890625,14.975390625Q12.733890625,14.975390625,12.734390625,14.975390625C13.332790625,14.975390625,13.896290625,14.741890625,14.319590625,14.318590625C15.192890625,13.444790625,15.192890625,12.022590625,14.319090625,11.148290625ZM13.614990625,13.614090625C13.379590625,13.849590625,13.066690625,13.978990625,12.734390625,13.978990625L12.733890625,13.978990625C12.401090625,13.978990625,12.088290625,13.849590625,11.853290625,13.614090625L8.247560625,10.008840625L7.936690625,10.143130625C7.402950625,10.374220625,6.837590625,10.491450625,6.256660625,10.491450625C3.921780625,10.491450625,2.0218496249999998,8.592040625,2.0218496249999998,6.256660625C2.0218496249999998,5.932140625,2.058340625,5.612710625,2.1308306249999998,5.301320625L4.764930625,7.935920625C4.875390625,8.024010624999999,5.027160625,8.025200625,5.139560625,7.941530625L7.908930625,5.172180625C7.909900625,5.171200625,7.907940625,5.169970625,7.908930625,5.169010625C8.021800625000001,5.056130625,8.025200625,4.879990625,7.928370625,4.757630625L5.301080625,2.130560625C5.612970625,2.058320625,5.932130625,2.021835625,6.256640625,2.021835625C8.591520625000001,2.021835625,10.491470625,3.921540625,10.491470625,6.256640625C10.491470625,6.838310625,10.374190625,7.403400625,10.143110625,7.936190625L10.008820625,8.247050625L13.614490625,11.852790625C14.100090625,12.338390625,14.100090625,13.128490625,13.614990625,13.614090625Z" fill="currentColor"/></g></g></svg>;

const Mcp =(props)=>  {
    const { t } = useTranslation();
    const [total,setTotal]=useState(0);
    const [mcpDataList,setMcpDataList]=useState([]);
    const [mcpData,setMcpData]=useState(null);
    const [current, setCurrent] = useState('overview');

    useEffect(()=>{
        getIndustrialPrompts();
    },[]);

    const items = [{
        key: 'overview',
        label: t('mcp.overview'),
        icon: <OverviewSvg />
    },{
        key: 'tool',
        label: t('mcp.tool'),
        icon: <ToolSvg />
    }];

    const getIndustrialPrompts = () =>{
        axios.get(`${globalInitConfig.REACT_APP_API_BASE_URL}mgr/industrialPrompts/getAll?title=&sort=desc&creatorId=`).then(res=>{
            if(res.data.code === 200){
                let data = res.data.data.prompts || [];
                setMcpDataList(data);
                setTotal(data.length);
            }
        });
    };

    const mcpClick = (item) =>{
        setMcpData(item);
    };

    const menuClick = e => {
        setCurrent(e.key);
    };

    return (

        <div className="app-content-right right_bj">
            <div className="content-header">
                <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="24" height="24" viewBox="0 0 24 24"><defs><clipPath id="master_svg0_514_044905"><rect x="0" y="0" width="24" height="24" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_514_044905)"><g><path d="M20.0067,2C20.5547,2,21,2.444,21,2.992L21,21.008C20.9956,21.5546,20.5532,21.9964,20.0067,22L3.993333,22C3.445251,22,3.000735641,21.5561,3,21.008L3,2.992C3.00436056,2.445431,3.446759,2.00362635,3.993333,2L20.0067,2ZM17.3333,18L6.66667,18L6.66667,20L17.3333,20L17.3333,18ZM17.3333,14.6667L6.66667,14.6667L6.66667,16.6667L17.3333,16.6667L17.3333,14.6667ZM12.66667,4L7,4L7,13L9.83333,11L12.66667,13L12.66667,4Z" fill="currentColor"/></g></g></svg>
                <span>{t('mcp.title')}{!mcpData && <span className="count">{total}</span>}</span>
            </div>
            {mcpData ?
                <div className="content-data-detail">
                    <div className="title">
                        <img src={IconPng} width={24} height={24}/>
                        <span className="label" title={mcpData.title}>{mcpData.title}</span>
                    </div>
                    <Menu onClick={menuClick} selectedKeys={[current]} mode="horizontal" items={items} />
                    {current === "overview" && <div className="overview-content">
                        <span className="detail-desc">{mcpData.content}</span>
                        <div className="detail-label">
                            <ToolSvg/><span>{t('mcp.tool')}</span>
                        </div>
                    </div>}
                    <div className="tool-content">
                        <div className="tool-data">
                            <span className="data-title">web_search_exa</span>
                            <span className="data-desc">Search the web using Exa Al- performs real-time web searches and canscrape content from specific URLs. Supports configurable result countsand returns the content from the most relevant websites.</span>
                        </div>
                        <div className="tool-data">
                            <span className="data-title">research_paper_search</span>
                            <span className="data-desc">Search across 100M+ research papers with full text access using Exa AIperforms targeted academic paper searches with deep research contentcoverage. Returns detailed information about relevant academic papersincluding titles, authors, publication dates, and full text excerpts. Controlthe number of results and character counts returned to balancecomprehensiveness with conciseness based on your task requirements.</span>
                        </div>
                    </div>
                </div> :
                <div className="content-data">
                    {mcpDataList.map(item=>(
                        <div key={item.id} className="data" onClick={()=>mcpClick(item)}>
                            <div className="title">
                                <img src={IconPng} width={24} height={24}/>
                                <span className="label" title={item.title}>{item.title}</span>
                            </div>
                            <div className="info">{item.content}</div>
                            <div className='tags'>
                                <span className='tag'>测试</span>
                                <span className='tag'>测试</span>
                                <span className='tag'>测试</span>
                            </div>
                            <div className="promptWordFooter">
                                <span className="view"><EyeOutlined/>{t('mcp.view')}</span>
                                <div className="publisher">
                                    <UserSvg/><span>{item.creatorName}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            }
        </div>


    );
};

export default Mcp;
