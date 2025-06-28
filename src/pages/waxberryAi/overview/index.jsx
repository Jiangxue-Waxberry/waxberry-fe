import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";

import axios from 'axios';
import moment from "moment";
import { authService } from '@services/authService';

import { useTranslation } from 'react-i18next';

import logo from '../img/logoWithoutVersion.png';

import Highlight1 from './img/highlight1.svg';
import Highlight2 from './img/highlight2.svg';
import Highlight3 from './img/highlight3.svg';
import Highlight4 from './img/highlight4.svg';

import AppIcon from './img/appIcon.svg';
import AgentIcon from './img/agentIcon.svg';
import WaxberryPlazaIcon from './img/waxberryPlaza.svg';
import HeroInvitationIcon from './img/heroInvitation.svg';
import RightIcon from './img/right.svg';

import steelSvg from "../img/steel.svg";
import lightIndustrySvg from "../img/lightIndustry.svg";
import nonferrousSvg from "../img/nonferrous.svg";
import electronSvg from "../img/electron.svg";
import petrifactionSvg from "../img/petrifaction.svg";
import carSvg from "../img/car.svg";
import chemicalIndustrySvg from "../img/chemicalIndustry.svg";
import buildingMaterialsSvg from "../img/buildingMaterials.svg";
import powerSvg from "../img/power.svg";
import machinerySvg from "../img/machinery.svg";

import DefaultPng from "../img/default.png";
import CardDefaultPng from "./img/cardDefault.jpg";

import ResearchDesign from "./img/researchDesign.png";
import ProductionManufacturing from "./img/productionManufacturing.png";
import OperationManagement from "./img/operationManagement.png";
import OperationMaintenance from "./img/operationMaintenance.png";
import IndustrialInternetPlatform from "./img/industrialInternetPlatform.png";
import SupportTechnology from "./img/supportTechnology.png";
import AllIcon from "./img/all.png";
import CommonIcon from "./img/common.png";

import wxIcon from './img/wx.svg';
import weComIcon from './img/weCom.svg';
import dyIcon from './img/dy.svg';
import wxPng from './img/wx.png';
import weComPng from './img/weCom.png';
import dyPng from './img/dy.png';
import phoneIcon from './img/phone.svg';
import addressIcon from './img/address.svg';
import emailIcon from './img/email.svg';
import policeIcon from './img/police.png';

import './index.scss';

export default function App() {

    const [waxberryList, setWaxberryList] = useState([]);
    const [hoveredIndex, setHoveredIndex] = useState(0);
    const [recommendations, setRecommendations] = useState([]);

    useEffect(() => {
        getWaxberryList();
        getRecommendations();
    }, []);

    const getWaxberryList = () => {
        axios.get(`${globalInitConfig.REACT_APP_API_BASE_URL}mgr/agent/agent/findHomePageWaxberry`).then(res=>{
            if(res.data.code === 200){
                setWaxberryList(res.data.data.content)
            }
        });
    };

    const gotoLogin=(url)=>{
        authService.login(url);
    };

    const agentMenuList = [
        {id: 1,name: '电子行业',icon: electronSvg},
        {id: 2,name: '有色行业',icon: nonferrousSvg},
        {id: 3,name: '机械行业',icon: machinerySvg},
        {id: 4,name: '石化行业',icon: petrifactionSvg},
        {id: 5,name: '汽车行业',icon: carSvg},
        {id: 6,name: '化工行业',icon: chemicalIndustrySvg},
        {id: 7,name: '建材行业',icon: buildingMaterialsSvg},
        {id: 8,name: '电力行业',icon: powerSvg},
        {id: 9,name: '轻工行业',icon: lightIndustrySvg},
        {id: 10,name: '钢铁行业',icon: steelSvg},
    ];

    const getBgUrl = (coverFileId) => {
        return coverFileId ? `${globalInitConfig.REACT_APP_API_FS_URL}file/download/${coverFileId}` : CardDefaultPng;
    };

    const getGroupImg = (name) => {
        if(name === "钢铁行业") return <img src={steelSvg}/>;
        if(name === "轻工行业") return <img src={lightIndustrySvg}/>;
        if(name === "有色行业") return <img src={nonferrousSvg}/>;
        if(name === "电子行业") return <img src={electronSvg}/>;
        if(name === "石化行业") return <img src={petrifactionSvg}/>;
        if(name === "汽车行业") return <img src={carSvg}/>;
        if(name === "化工行业") return <img src={chemicalIndustrySvg}/>;
        if(name === "建材行业") return <img src={buildingMaterialsSvg}/>;
        if(name === "电力行业") return <img src={powerSvg}/>;
        if(name === "机械行业") return <img src={machinerySvg}/>;
    };

    const categories = [
        { icon: AllIcon, label: "全部", value: "" },
        { icon: ResearchDesign, label: "研发", value: "Research" },
        { icon: ProductionManufacturing, label: "生产", value: "Production" },
        { icon: OperationManagement, label: "供应", value: "Supply" },
        { icon: OperationMaintenance, label: "销售", value: "Sales" },
        { icon: IndustrialInternetPlatform, label: "服务", value: "Service" },
        { icon: SupportTechnology, label: "财务", value: "Finance" },
        { icon: CommonIcon, label: "通用", value: "General" }
    ];

    const getRecommendations = () => {
        axios.get(`${globalInitConfig.REACT_APP_API_BASE_URL}operation/api/demand/findHomePageDemand`).then(res => {
            if (res.data.code === 200) {
                setRecommendations(res.data.data.content);
            }
        })
    };

    return (
        <div className="my-app-overview">
            <div className="hero">
                <div className="hero-header">
                    <img src={logo} width={116} height={30}/>
                    <span className="login" onClick={()=>gotoLogin("/index")}>免费使用</span>
                </div>
                <div className="hero-content">
                    <span className="title">工业的智能应用开发及部署平台</span>
                    <div className="labels">
                        <span>专业</span>｜<span>可靠</span>｜<span>便捷</span>｜<span>智能</span>
                    </div>
                    <span className="login" onClick={()=>gotoLogin("/index")}>免费使用</span>
                </div>
                <div className="hero-footer">
                    <div className="highlights">
                        <div className="data">
                            <img src={Highlight1}/>
                            <div className="info">
                                <span className="label">开源&免费</span>
                                <span className="desc">代码开源，平台免费使用</span>
                            </div>
                        </div>
                        <div className="data">
                            <img src={Highlight2}/>
                            <div className="info">
                                <span className="label">deepseek v3</span>
                                <span className="desc">支持deepseek v3    671B</span>
                            </div>
                        </div>
                        <div className="data">
                            <img src={Highlight3}/>
                            <div className="info">
                                <span className="label">面向交付&无代码</span>
                                <span className="desc">输入多模态信息让大模型交付结果</span>
                            </div>
                        </div>
                        <div className="data">
                            <img src={Highlight4}/>
                            <div className="info">
                                <span className="label">强大的交付生态</span>
                                <span className="desc">工业领域深耕20+生态伙伴</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="functions">
                <div className="function" onClick={()=>gotoLogin("/myWaxberry")}>
                    <div className="function-label">
                        <img src={AppIcon}/>
                        <span>工业APP</span>
                        <img src={RightIcon} className="right"/>
                    </div>
                    <span className="desc">您可以把自己的算法封装到软件中，也可以通过大模型的能力协同完成算法的开发。在本模块中，您不需要考虑编码的实现，我将自动完成所有代码的实现。</span>
                </div>
                <div className="function" onClick={()=>gotoLogin("/myWaxberry")}>
                    <div className="function-label">
                        <img src={AgentIcon}/>
                        <span>工业智能体</span>
                        <img src={RightIcon} className="right"/>
                    </div>
                    <span className="desc">与人工智能一起开发属于自己的工业智能体。智能体可自动智能分析业务需求，自主调用文件读写、代码生成、软件执行等工具，自主实现您定义的工业智能体逻辑。</span>
                </div>
                <div className="function" onClick={()=>gotoLogin("/waxberryMarket")}>
                    <div className="function-label">
                        <img src={WaxberryPlazaIcon}/>
                        <span>纳豆广场</span>
                        <img src={RightIcon} className="right"/>
                    </div>
                    <span className="desc">杨梅市场海量纳豆，包含APP、Agent。覆盖研发设计、生产制造、设备运维等全工业场景，均可灵活调用，更支持按需定制，满足你的个性化需求！</span>
                </div>
                <div className="function" onClick={()=>gotoLogin(`${globalInitConfig.REACT_APP_API_OPERATION_URL}demandHall`)}>
                    <div className="function-label">
                        <img src={HeroInvitationIcon}/>
                        <span>英雄帖</span>
                        <img src={RightIcon} className="right"/>
                    </div>
                    <span className="desc">依据需求定制，助力解决工业场景中的各类难题，精准匹配个性化业务诉求 ，为工业创新与业务突破招募 “解题英雄”，携手攻克行业痛点，激发工业数智化转型新可能。</span>
                </div>
            </div>
            <div className="curated-resources">
                <span className="curated-resources-title">发现更好资源</span>
                <div className="curated-resources-type">
                    {agentMenuList.map(item=>(
                        <div key={item.id} className="type-item">
                            <img src={item.icon}/>
                            <span className="type">{item.name}</span>
                        </div>
                    ))}
                </div>
                <div className="curated-resources-list">
                    {waxberryList.map((waxberry, index) => (
                        <div
                            key={waxberry.id}
                            className={`card ${hoveredIndex === index ? 'hovered' : ''}`}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(0)}
                            onClick={()=>gotoLogin("/waxberryMarket")}
                            style={{backgroundImage: `url(${getBgUrl(waxberry.coverFileId)})`}}
                        >
                            <div className="card-info">
                                <div className="name-box">
                                    {hoveredIndex === index && <img src={waxberry.imgeFileId ? `${globalInitConfig.REACT_APP_API_FS_URL}file/download/${waxberry.imgeFileId}` : DefaultPng} width="32" height="32"/>}
                                    <span className="name">{waxberry.name}</span>
                                    <div className="type">
                                        {getGroupImg(waxberry.groupId)}<span>{waxberry.groupId}</span>
                                    </div>
                                </div>
                                <span className="card-desc">{waxberry.discription}</span>
                                <div className="card-tags">
                                    {waxberry.agentLabel && waxberry.agentLabel.split(",").map(label=>(
                                        <span className="tag" key={label}>{label}</span>
                                    ))}
                                </div>
                            </div>
                            <span className="tryNow">立即试用</span>
                        </div>
                    ))}
                </div>
                <span className="more" onClick={()=>gotoLogin("/waxberryMarket")}>查看更多</span>
            </div>
            <div className="hero2">
                <div className="hero-content">
                    <span className="title">杨梅工业，以智赋能，重塑工业未来</span>
                    <span className="desc">面向工业的智能体应用开发与部署平台，创建工业know-how个体与世界制造的新生态</span>
                </div>
            </div>
            <div className="curated-resources">
                <span className="curated-resources-title">工业烽烟起，敢为破局人</span>
                <div className="curated-resources-group">
                    {categories.map((category, index) => (
                        <div key={index} className="group-item">
                            <img src={category.icon} width={80} height={80}/>
                            <div className="group-label">{category.label}</div>
                        </div>
                    ))}
                </div>
                <div className="auto-scroll-container">
                    <div className="auto-list" style={{animation: `scroll ${recommendations.length*3}s linear infinite`}}>
                        {recommendations.map((item, index) => (
                            <div
                                key={index}
                                onClick={() =>gotoLogin(`${globalInitConfig.REACT_APP_API_OPERATION_URL}demandHall`)}
                                className="recommendation-card"
                            >
                                <div className="recommendation-card-content">
                                    <div className="card-info">
                                        <span className="card-title">{item.title}</span>
                                        <span className="card-description">{item.description}</span>
                                    </div>
                                    <div className="company">
                                        <img
                                            src={`${globalInitConfig.REACT_APP_API_FS_URL}file/download/${item.subjectType === "personal" ? item.avatarUrl : item.logoId}`}
                                            className="company-icon"
                                        />
                                        <span className="company-name">{item.subjectType === "personal" ? item.sendUser : item.companyName}</span>
                                    </div>
                                    <div className="tag">
                                        {item.label && item.label.split(",").map(tag => (
                                            <span key={tag} className="tag-item">{tag}</span>
                                        ))}
                                        <span className="method">{item.budgetType === "0" ? "面议" : "￥" + item.budgetAmount}</span>
                                    </div>
                                </div>
                                <div className="card-footer">
                                    <span className="deadline">截止时间: {moment(item.deadline).format("YYYY-MM-DD")}</span>
                                    {item.platformDelivery === "1" && <span className="delivery">平台交付</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <span className="more" onClick={()=>gotoLogin(`${globalInitConfig.REACT_APP_API_OPERATION_URL}demandHall`)}>查看更多</span>
            </div>
            <div className="partners">
                <span className="partners-title">生态合作伙伴</span>
                <div className="partners-list-box">
                    <div className="partners-list">
                        {Array.from({ length: 42 }, (_, i) => (
                            <img
                                key={i + 1}
                                src={require(`./img/partner${i + 1}.png`)}
                                alt={`Partner ${i + 1}`}
                            />
                        ))}
                    </div>
                    <div className="partners-list-end">
                        <img src={require(`./img/partner43.svg`)} />
                        <img src={require(`./img/partner44.svg`)} />
                        <img src={require(`./img/partner45.svg`)} />
                        <img src={require(`./img/partner46.svg`)} />
                        <img src={require(`./img/partner47.svg`)} />
                        <img src={require(`./img/partner48.svg`)} />
                        <img src={require(`./img/partner49.svg`)} />
                    </div>
                </div>
            </div>
            <div className="overview-footer">
                <div className="overview-footer-content">
                    <div className="footer-info">
                        <div className="info-content">
                            <img src={logo} width={183} height={46}/>
                            <div className="info-data">
                                <span className="info-title">以智赋能，重塑工业未来</span>
                                <span className="info-desc">成为全球领先面向工业的智能体应用开发与部署平台，创建工业know-how个体与世界制造的新生态</span>
                            </div>
                        </div>
                        <div className="info-help">
                            <div className="network">
                                <div className="box">
                                    <img src={wxIcon}/>
                                    <div className="box-hover"><img src={wxPng}/></div>
                                </div>
                                <div className="box">
                                    <img src={weComIcon}/>
                                    <div className="box-hover"><img src={weComPng}/></div>
                                </div>
                                <div className="box">
                                    <img src={dyIcon}/>
                                    <div className="box-hover"><img src={dyPng}/></div>
                                </div>
                            </div>
                            <div className="contact">
                                <span className="contact-label">链接</span>
                                <div className="contact-list">
                                    <span className="contact-data" onClick={()=>window.open("https://gitee.com/jiangxue-waxberry")}>gitte</span>
                                    <span className="contact-data" onClick={()=>window.open("https://github.com/orgs/Jiangxue-Waxberry")}>github</span>
                                    <span className="contact-data" onClick={()=>gotoLogin("/waxberryMarket")}>纳豆广场</span>
                                    <span className="contact-data" onClick={()=>gotoLogin(`${globalInitConfig.REACT_APP_API_OPERATION_URL}demandHall`)}>英雄帖</span>
                                </div>
                            </div>
                            <div className="contact">
                                <span className="contact-label">关于我们</span>
                                <div className="contact-list">
                                    <span className="contact-data">
                                        <img src={phoneIcon}/>
                                        <span>010-59756895</span>
                                    </span>
                                    <span className="contact-data">
                                        <img src={addressIcon}/>
                                        <span>北京市朝阳区恒通商务园B37A</span>
                                    </span>
                                    <span className="contact-data">
                                        <img src={emailIcon}/>
                                        <span>info@localhost</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="overview-footer-bottom">
                    <div className="address">北京工业软件产业创新中心</div>
                    <div className="address">京ICP备2023XXXXXXXXXXXXX号-1</div>
                    <div className="address">京B2-2024XXXX</div>
                    <div className="address"><img src={policeIcon} width={14} height={14}/>京公网安备1101020XXXXXX</div>
                </div>
            </div>
        </div>
    );
}
