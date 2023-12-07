//* Copyright 2023 Chelsea and Rachel Co. ellie@chelseaandrachel.com *//


class CnRRebuyJail {
	constructor(opts={}) {
		let defaults = {
			target:".cnr-sidecart-rebuy-holder",
			jail:".rebuy-jail"          
		};
		this.rebuy_content = [];
		this.config = {...defaults,...opts};
		document.addEventListener("CartFetched",event=>{
			this.incarcerate();
		})
		document.addEventListener("CartUpdated",(event)=>{
			this.parole();
		});
 	}
	swap(source,target) {
		source.querySelectorAll("[data-rebuy-id]").forEach(widget=>{
			source.removeChild(widget);
			target.appendChild(widget);
		});
	}
	incarcerate() {
		this.swap(document.querySelector(this.config.target),document.querySelector(this.config.jail));
	}
	parole() {
		this.swap(document.querySelector(this.config.jail),document.querySelector(this.config.target));
	}
	
}