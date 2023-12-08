//* Copyright 2023 Chelsea and Rachel Co. ellie@chelseaandrachel.com *//


class CnRSidecartDiscount {
	constructor(opts={}) {
		let defaults = {
			target:".cnr-sidecart-discount-code-holder",
            button_text:"Apply"          
		};
		this.rebuy_content = []
		this.config = {...defaults,...opts};
		document.addEventListener("CartUpdated",(event)=>{
			this.cart = event.detail;
			this.render();
		});
 	}
	getCart(cart=null) {
		if (cart!=null) {
			this.cart = cart;
			this.render();
			return;
		}
		fetch((this.config.extended_cart)?"/cart?view=json":"/cart.js")
			.then(res=>(this.config.extended_cart)?res.text():res.json())
			.then(cart=>{
				if (this.config.extended_cart) {
					eval(cart);
					this.cart = window.cart;
				} else {
					this.cart = cart;
				}
				this.render();
			});

	}
	updateCart(payload) {
	    document.querySelector(`${this.config.target} .js-add-upd-note`).innerHTML = "Updating..."
	    fetch(`/cart/update.js`, {
	      method: 'POST',
	      credentials: 'same-origin',
	      headers: {
	        'Content-Type': 'application/json',
	        'X-Requested-With': 'xmlhttprequest'
	      },
	      body: JSON.stringify(payload)
	    }).then((response) => response.json()).then(json=>{
	     	this.render();
	    });
	 }
	 hasCode() {
	 	return this.cart.attributes['_discount_code']!=null;
	 }
	 discountCode() {
	 	return this.cart.attributes["_discount_code"]||"";
	 }
	 render() {
	 	let injection_point = document.querySelector(this.config.target);
	 	if (!injection_point) {
	 		console.error(`Injection target ${this.config.target} does not exist`);
	 	}
	 	injection_point.childNodes.forEach(node=>injection_point.removeChild(node));
	 	injection_point.innerHTML = `
	 		 <div class="cnr-sc-discount-code-wrapper">
                <input type="text" name="discount-code" class="cnr-sc-discount-code-input" placeholder="Discount Code" value="${this.discountCode()}">
                <a class="cnr-sc-discount-code-button">${this.config.button_text}</a>
            </div>
	 	`;

	 	injection_point.querySelector(".cnr-sc-discount-code-button").addEventListener("click",event=>{
		    event.stopPropagation();
            event.preventDefault();
		    
		    this.cart.attributes["_discount_code"] = injection_point.querySelector(".cnr-sc-discount-code-input").value;
            window.fetch(`/discount/${this.cart.attributes['_discount_code']}`).then(response=>{
                console.error(response);
                return response.text();
            })
                .then(text=>{
                    this.updateCart({attributes:this.cart.attributes});        
                })
		    this.updateCart({attributes:this.cart.attributes});
	  	});
	 }	  
  }