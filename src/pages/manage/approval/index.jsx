import React, { useEffect,useState } from 'react';

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import getCurrentUser from '@components/getCurrentUser';

import RegisterApproval from './components/registerApproval';
import WaxberryApproval from './components/waxberryApproval';
import HeroPostApproval from './components/heroPostApproval';

import { Logo } from '@pages/waxberryAi/img/svgComponent';
import RegisterSvg from './img/register.svg';
import WaxberrySvg from './img/waxberry.svg';
import HeroPostSvg from './img/heroPost.svg';

import './index.scss';

function App()  {

    const { t } = useTranslation();
    const navigate = useNavigate();

    const [currentMenu, setCurrentMenu] = useState('register');

    useEffect(()=>{
        getCurrentUser().then(userInfo => {
            if(!userInfo || userInfo.userRole !== "ADMIN"){
                navigate("/overview");
            }
        });
    },[]);

    return (
        <div className="approval-app">
            <div className="approval-left">
                <div className="logoContainer"><Logo/></div>
                <div className="approval-menu">
                    <div className={currentMenu==="register"?"menu menu-active":"menu"} onClick={()=>setCurrentMenu("register")}>
                        <img src={RegisterSvg}/>
                        <span>注册审批</span>
                    </div>
                    <div className={currentMenu==="waxberry"?"menu menu-active":"menu"} onClick={()=>setCurrentMenu("waxberry")}>
                        <img src={WaxberrySvg}/>
                        <span>纳豆审批</span>
                    </div>
                    <div className={currentMenu==="heroPost"?"menu menu-active":"menu"} onClick={()=>setCurrentMenu("heroPost")}>
                        <img src={HeroPostSvg}/>
                        <span>英雄帖审批</span>
                    </div>
                </div>
            </div>
            <div className="approval-right">
                {currentMenu === "register" && <RegisterApproval/> }
                {currentMenu === "waxberry" && <WaxberryApproval/> }
                {currentMenu === "heroPost" && <HeroPostApproval/> }
            </div>
        </div>
    );
}

export default App;
