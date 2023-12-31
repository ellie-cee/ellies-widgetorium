//* Copyright 2023 Chelsea and Rachel Co. ellie@chelseaandrachel.com *//


class CnRSidecartDiscount {
	constructor(opts={}) {
		let defaults = {
			target:".cnr-sidecart-discount-code-holder",
            placeholder_text:"Type Discount Code here",
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
	    document.querySelector(`${this.config.target} .cnr-sc-discount-code-button`).innerHTML = "Applying..."
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
                <input type="text" name="discount-code" class="cnr-sc-discount-code-input" placeholder="${this.config.placeholder_text}" value="${this.getDiscountCode()}">
                <a class="cnr-sc-discount-code-button">${this.config.button_text}</a>
            </div>
	 	`;

	 	injection_point.querySelector(".cnr-sc-discount-code-button").addEventListener("click",event=>{
		    event.stopPropagation();
            event.preventDefault();
		    let button = document.querySelector(`${this.config.target} .cnr-sc-discount-code-button`);
            button.classList.add("active");
            button.innerHTML = "Applying...";
            window.setTimeout(()=>{
              button.classList.remove("active");
              button.innerHTML = this.config.button_text;
            },1000);

		    this.cart.attributes["_discount_code"] = injection_point.querySelector(".cnr-sc-discount-code-input").value;
            window.fetch(`/discount/${this.cart.attributes['_discount_code']}`)
              .then(response=>response.text())
              .then(text=>{
                    console.error(this.getDiscountCode());
                });
	  	});
	 }
    getDiscountCode() {
      return document.cookie.split(";")
        .map(cookieString=>cookieString.trim().split("="))
        .reduce(
            (acc,curr)=>{acc[curr[0]] = curr[1];return acc;},
          {}
        )["discount_code"]||"";
    }
  }