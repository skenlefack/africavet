import React, {  useState } from "react";
/// React router dom
import { Link } from "react-router-dom";
// import { ThemeContext } from "../../../context/ThemeContext";


export function  NavMenuToggle(){
	setTimeout(()=>{	
		let mainwrapper = document.querySelector("#main-wrapper");
		if(mainwrapper.classList.contains('menu-toggle')){
			mainwrapper.classList.remove("menu-toggle");
		}else{
			mainwrapper.classList.add("menu-toggle");
		}
	},200);
}


const NavHader = () => {
  const [toggle, setToggle] = useState(false);
  return (
    <div className="nav-header" style={{
      background: 'linear-gradient(135deg, #7ac142 0%, #5a9a3a 100%)'
    }}>
      <Link to="/dashboard" className="brand-logo">
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '8px'
          }}>
            <img
              src="/favicon-africavet.png"
              alt="AfricaVET"
              style={{ width: '28px', height: '28px', objectFit: 'contain' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
          <span style={{
            fontSize: '18px',
            fontWeight: '700',
            color: 'white'
          }}>
            AfricaVET
          </span>
      </Link>

      <div
        className="nav-control"
        onClick={() => {
          setToggle(!toggle);
          NavMenuToggle();
        }}
      >
        <div className={`hamburger ${toggle ? "is-active" : ""}`}>
          <span className="line" style={{ background: 'white' }}></span>
          <span className="line" style={{ background: 'white' }}></span>
          <span className="line" style={{ background: 'white' }}></span>
        </div>
      </div>
    </div>
  );
};

export default NavHader;
