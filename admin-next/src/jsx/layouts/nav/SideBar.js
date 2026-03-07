import React, { useContext, useEffect, useReducer, useState } from "react";
import Collapse from 'react-bootstrap/Collapse';


/// Link
import { Link } from "react-router-dom";

import {MenuList} from './Menu';
import Logoutbtn from './Logoutbtn';
import {useScrollPosition} from "@n8tb1t/use-scroll-position";
import { ThemeContext } from "../../../context/ThemeContext";


const reducer = (previousState, updatedState) => ({
  ...previousState,
  ...updatedState,
});

const initialState = {
  active : "",
  activeSubmenu : "",
}

const SideBar = () => {
	const {
		iconHover,
		sidebarposition,
		headerposition,
		sidebarLayout,        
	} = useContext(ThemeContext);

  const [state, setState] = useReducer(reducer, initialState);	
	useEffect(() => {
			
	}, []);
 //For scroll
 	const [hideOnScroll, setHideOnScroll] = useState(true)
	useScrollPosition(
		({ prevPos, currPos }) => {
		  const isShow = currPos.y > prevPos.y
		  if (isShow !== hideOnScroll) setHideOnScroll(isShow)
		},
		[hideOnScroll]
	)

 
  const handleMenuActive = status => {	
    setState({active : status});		
		if(state.active === status){			
      setState({active : ""});
    }   
	}
	const handleSubmenuActive = (status) => {
		
    setState({activeSubmenu : status})
		if(state.activeSubmenu === status){
      setState({activeSubmenu : ""})
			
		}
    
	}
	// Menu dropdown list End

   // ForAction Menu
   let path = window.location.pathname;
   path = path.split("/");
   path = path[path.length - 1]; 
 
   useEffect(() => {
     MenuList.forEach((data) => {
       data.content?.forEach((item) => {        
         if(path === item.to){         
           setState({active : data.title})          
         }
         item.content?.forEach(ele => {
           if(path === ele.to){
             setState({activeSubmenu : item.title, active : data.title})
           }
         })
       })
   })
   },[path]);
 	
  return (
    <div
      className={`deznav border-right ${iconHover} ${
        sidebarposition.value === "fixed" &&
        sidebarLayout.value === "horizontal" &&
        headerposition.value === "static"
          ? hideOnScroll > 120
            ? "fixed"
            : ""
          : ""
      }`}
      style={{
        background: 'linear-gradient(180deg, #7ac142 0%, #5a9a3a 25%, #4a7a5a 50%, #3a6070 75%, #354e84 100%)'
      }}
    >
        <style>{`
            .deznav .metismenu > li > a {
                color: rgba(255,255,255,0.9) !important;
            }
            .deznav .metismenu > li:hover > a,
            .deznav .metismenu > li.mm-active > a {
                color: #fff !important;
                background: rgba(255,255,255,0.15) !important;
            }
            .deznav .metismenu ul a {
                color: rgba(255,255,255,0.8) !important;
            }
            .deznav .metismenu ul a:hover,
            .deznav .metismenu ul a.mm-active {
                color: #fff !important;
            }
            .deznav .metismenu .menu-title {
                color: rgba(255,255,255,0.5) !important;
            }
            .deznav .metismenu > li > a .menu-icon svg path {
                stroke: rgba(255,255,255,0.9);
            }
            .deznav .metismenu > li:hover > a .menu-icon svg path,
            .deznav .metismenu > li.mm-active > a .menu-icon svg path {
                stroke: #fff;
            }
        `}</style>

        <div className="deznav-scroll">
            <ul className="metismenu" id="menu">              
              {MenuList.map((data, index)=>{
                let menuClass = data.classsChange;
                  if(menuClass === "menu-title"){
                    return(
                      <li className={menuClass}  key={index} >{data.title}</li>
                    )
                  }else{
                    return(				
                      <li className={` ${ state.active === data.title ? 'mm-active' : ''} ${data.to === path ? 'mm-active' : ''}`}
                        key={index} 
                      >
                        
                        {data.content && data.content.length > 0 ?
                            <>
                              <Link to={"#"} 
                                className="has-arrow"
                                onClick={() => {handleMenuActive(data.title)}}
                                >		
                                  <div className="menu-icon">
                                    {data.iconStyle}
                                  </div>
                                  {" "}<span className="nav-text">{data.title}
                                  {
                                    data.update && data.update.length > 0 ?
                                      <span className="badge badge-xs badge-danger ms-2">{data.update}</span>
                                    :
                                    ''
                                  } 
                                </span>
                              </Link>
                              <Collapse in={state.active === data.title ? true :false}>
                                  <ul className={`${menuClass === "mm-collapse" ? "mm-show" : ""}`}>
                                    <li className="mini-dashboard">{data.extratitle}</li>
                                    {data.content && data.content.map((data,index) => {									
                                      return(	                                                                                  
                                          <li key={index}
                                            className={`${ state.activeSubmenu === data.title ? "mm-active" : ""} ${data.to === path ? 'mm-active' : ''}`}                                    
                                          >
                                            {data.content && data.content.length > 0 ?
                                                <>
                                                  <Link to={data.to} className={data.hasMenu ? 'has-arrow' : ''}
                                                    onClick={() => { handleSubmenuActive(data.title)}}
                                                  >
                                                    {data.title}
                                                  </Link>
                                                  <Collapse in={state.activeSubmenu === data.title ? true :false}>
                                                      <ul className={`${menuClass === "mm-collapse" ? "mm-show" : ""}`}>
                                                        {data.content && data.content.map((data,ind) => {
                                                          return(	                                                           
                                                            <li key={ind}>
                                                              <Link className={`${path === data.to ? "mm-active" : ""}`} to={data.to}>{data.title}</Link>
                                                            </li>                                                            
                                                          )
                                                        })}
                                                      </ul>
                                                  </Collapse>
                                                </>
                                              :
                                              <Link to={data.to} className={`${data.to === path ? 'mm-active' : ''}`} >
                                                {data.title}
                                              </Link>
                                            }
                                            
                                          </li>                                        
                                      )
                                    })}
                                  </ul>
                                </Collapse>
                            </>
                        :
                          <Link  to={data.to} className={`${data.to === path ? 'mm-active' : ''}`}>
                            <div className="menu-icon">
                                {data.iconStyle}
                            </div>
                              {" "}<span className="nav-text">{data.title}</span>
                              {
                                data.update && data.update.length > 0 ?
                                  <span className="badge badge-xs badge-danger ms-2">{data.update}</span>
                                :
                                ''
                              } 
                          </Link>
                        }
                       
                      </li>	
                    )
                }
              })}          
          </ul>
          <div className="switch-btn">
              <Logoutbtn />
          </div>

        </div>
    </div>
  );
};

export default SideBar;
