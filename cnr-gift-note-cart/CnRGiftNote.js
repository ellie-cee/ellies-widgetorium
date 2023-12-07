//* Copyright 2023 Chelsea and Rachel Co. ellie@chelseaandrachel.com *//


class CnRGiftNote {
	constructor(opts={}) {
		let defaults = {
			target:".cnr-sidecart-rebuy-holder",          
		};
		this.rebuy_content = []
		this.config = {...defaults,...opts};
		document.addEventListener("CartFetched",event=>{
			this.inhale();
		})
		document.addEventListener("CartUpdated",(event)=>{
			this.exhale();
		});
 	}
	getCart(cart=null) {
		if (cart!=null) {
			this.cart = cart;
			this.render();
			return;
		}
		fetch("/cart.js")
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
	 hasGift() {
	 	return this.cart.attributes['gift']!=null;
	 }
	 giftText() {
	 	return this.cart.attributes["Gift Note"]||"";
	 }
	 render() {
	 	let injection_point = document.querySelector(this.config.target);
	 	if (!injection_point) {
	 		console.error(`Injection target ${this.config.target} does not exist`);
	 	}
	 	injection_point.childNodes.forEach(node=>injection_point.removeChild(node));
	 	injection_point.innerHTML = `
	 		 <div class="gift-note-wrapper">
                <div class="gift-note-cb">
                  <input type="checkbox" name="gift" value="1" class="js-has-gift" id="gift-note"${this.hasGift()?' checked':''}>
                  <label for="gift-note">${this.config.checkbox_label_text}</label>
                </div>
                <div class="js-gift-message ${this.hasGift()?'':'d-none'}">
                  <div>
                  	<textarea rows="4" style="width:100%" name="message_text" class="js-message-text">${this.giftText()}</textarea>
                  </div>
                  <div><a class="js-add-upd-note button cta">${this.hasGift()?this.config.button_text_set:this.config.button_text_empty}</a></div>
                </div>
	 	`;

	 	injection_point.querySelector(".js-add-upd-note").addEventListener("click",event=>{
		    event.stopPropagation();
            event.preventDefault();
		    this.cart.attributes["gift"] = true;
		    this.cart.attributes["Gift Note"] = injection_point.querySelector(".js-message-text").value;
		    this.updateCart({attributes:this.cart.attributes});
	  	});
	  	injection_point.querySelector(".js-has-gift").addEventListener("click",event=>{
		    if (event.target.checked) {
		    	injection_point.querySelector(".js-gift-message").classList.remove("d-none")
		    } else {
		    	let newAttributes = {};
			    Object.keys(this.cart.attributes).forEach(k=>{
			      if (!["gift","Gift Note"].includes(k)) {
			        newAttributes[k] = this.cart.attributes[k];
			      } else {
			        newAttributes[k]=null;
			      }
			    });
			    this.cart.attributes = newAttributes;
			    this.updateCart({attributes:newAttributes});
		    }
	  });
	 }	  
  }