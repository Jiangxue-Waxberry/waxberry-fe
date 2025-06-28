import React from 'react'
import Header from './header/index';
import LeftMenu from './menu/index';
import { Outlet } from 'react-router-dom';
import { useMenu } from './menu/menuContext';
const Layout=(props)=>{
    const {className="industrial-prompt-words-app",children,menuKey}=props
    //const { menuKey } = useMenu();
    return  <div className={className} >
   <Header/>
    <div className="app-content">
        <LeftMenu menu={menuKey}/>
      <Outlet/>
        </div>
        </div>
}
export default Layout
