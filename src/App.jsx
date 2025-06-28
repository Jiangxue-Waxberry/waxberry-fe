import React, { useState, useEffect,useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider,message } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import './locales/i18n';
import {AppContext} from './context';
import { MenuContext } from './pages/waxberryAi/components/menu/menuContext';
import Index from './pages/waxberryAi/index';
import Waxberry from './pages/waxberryAi/waxberry/waxberry';
import Agent from './pages/waxberryAi/agent/agent';
import AgentRun from './pages/waxberryAi/agentRun/agentRun';
import MyWaxberry from './pages/waxberryAi/myWaxberry/myWaxberry';
import WaxberryMarket from './pages/waxberryAi/waxberryMarket/waxberryMarket';
import WaxberryDetail from './pages/waxberryAi/waxberryDetail/waxberryDetail';
import Overview from './pages/waxberryAi/overview';
import PersonalData from './pages/waxberryAi/personalData/personalData';
import IndustrialPromptWords from './pages/waxberryAi/industrialPromptWords/industrialPromptWords';
import WaxberryDevStep from './pages/waxberryAi/waxberryDevStep/waxberryDevStep';
import SmallModel from './pages/waxberryAi/smallModel/smallModel';
import IndustryResources from './pages/waxberryAi/industryResources/industryResources';
import Layout from './pages/waxberryAi/components/layout';
import Mcp from './pages/waxberryAi/mcp/mcp';
import Logout from './pages/logout';
import Callback from './pages/callback';
import Approval from './pages/manage/approval';

const pageMap = {
    industrialPromptWords: {
        menuKey: 'industrialPromptWords',
        className: 'industrial-prompt-words-app',
    },
    industryResources: {
        menuKey: 'industryResources',
        className: 'industry-resources-app',
    },
    industryKnowledge: {
        menuKey: 'industryKnowledge',
        className: 'industry-resources-app',
    },
    industrySoftware: {
        menuKey: 'industrySoftware',
        className: 'industry-resources-app',
    },
    industryStandards: {
        menuKey: 'industryStandards',
        className: 'industry-resources-app',
    },
    index:{
      menuKey:'index',
      className:'my-app'
    },
    myWaxberry:{
      menuKey:'myWaxberry',
      className:'my-app-waxberry'
    },
    waxberryMarket:{
      menuKey:'waxberryMarket',
      className:'my-app-market'
    },
    mcp: {
        menuKey: 'mcp',
        className: 'mcp-app',
    },
};
const currentPageKey = () => {
  return window.location.pathname.replace(/^\//, '');
};
const App = () => {
  const [menuInfo, setMenuInfo] = useState(null);
  const [dynamicMenu,setMenuList]=useState([])
  const [antdLocale, setAntdLocale] = useState(zhCN); // 默认中文
  const [userInfo,setUserInfo]=useState(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [menuKey,setMenuKey] =useState(currentPageKey())
  const [currentUser, setCurrentUser] = useState({});

  const layoutInfo=useMemo(()=>{
      console.log(menuKey);
    return pageMap[menuKey]||{}
  },[menuKey])
  window.Message=messageApi
  useEffect(() => {
    // 从 localStorage 读取已保存的语言设置
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      setAntdLocale(savedLanguage === 'zh' ? zhCN : enUS);
    }

  }, []);

  return (
    <ConfigProvider
      locale={antdLocale}
      theme={{
       token:{
        colorPrimary: '#5a4bff',

       }
      }}
    >
      {contextHolder}
        <AppContext.Provider value={{  userInfo,setUserInfo }}>
        <MenuContext.Provider value={{ menuInfo, setMenuInfo,dynamicMenu,setMenuList,menuKey,setMenuKey,currentUser,setCurrentUser }}>
          <Router>
            <Routes>
                <Route index element={<Navigate to="/overview" replace />} />
                <Route path="overview" element={<Overview />} />
                <Route path="waxberry" element={<Waxberry />} />
                <Route path="agent" element={<Agent />} />
                <Route path="agent_run" element={<AgentRun />} />


                <Route path="waxberry_detail" element={<WaxberryDetail />} />
                <Route path="personal_data" element={<PersonalData />} />
                <Route element={<Layout menuKey={layoutInfo.menuKey} className={layoutInfo?.className}/>}>
                    <Route path="index" element={<Index />} />
                    <Route path="myWaxberry" element={<MyWaxberry />} />
                    <Route path="waxberryMarket" element={<WaxberryMarket />} />
                    <Route path="industrialPromptWords" element={<IndustrialPromptWords />} />
                    <Route path="industryResources" element={<IndustryResources />} />
                    <Route path="industryKnowledge" element={<IndustryResources />} />
                    <Route path="industrySoftware" element={<IndustryResources />} />
                    <Route path="industryStandards" element={<IndustryResources />} />
                    <Route path="mcp" element={<Mcp />} />
                </Route>

                <Route path="waxberry_dev_step" element={<WaxberryDevStep />} />
                <Route path="small_model" element={<SmallModel />} />
                <Route path="callback" element={<Callback />} />
                <Route path="logout" element={<Logout />} />
                <Route path="approval" element={<Approval />} />
            </Routes>
          </Router>
          </MenuContext.Provider>
        </AppContext.Provider>
    </ConfigProvider>
  );
};

export default App;
