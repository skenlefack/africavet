import React from "react";

const Footer = (props) => {
	var d = new Date();
	return (
		<div className={`footer ${props.changefoot}`}>
			<div className="copyright">
				<p>Copyright © AfricaVET {d.getFullYear()} - Tous droits réservés | Powered by{" "}
					<a href="https://www.topnet-solutions.com" target="_blank" rel="noreferrer" style={{
						color: '#7ac142',
						fontWeight: '600'
					}}>
						TOPNET SOLUTIONS
					</a>
				</p>
			</div>
		</div>
	);
};

export default Footer;
