//* Copyright 2021 Chelsea and Rachel Co. ellie@chelseaandrachel.com *//


class CnRShippingMotivator {
	constructor(opts={}) {
		let defaults = {
			extended_cart:false,
			context:"sidecart",
			target:".cnr-shipping-motivator-holder",
			shipping_threshold:100,
			shipping_text:"You're $##amount## away from Free Shipping!",
			shipping_reached_text:"You've unlocked free shipping!",
			gwp_enabled:false,
			gwp_threshold:150,
			gwp_text:"You're $##amount## away from a free gift",
			gwp_met_text:"You've unlocked free shipping and a free gift!",
			gwp_indicator_text:"Free gift"
			shipping_indicator_text:"Free Shipping",
			cart_total:0,
			item_applicable_amount:(item)=>return (item.quantity*item.discounted_price),
		};
		this.config = {...defaults,...opts};
		this.shortfall = this.config.threshold;
		this.cart_total = 0;
		this.perc = 0;
		this.goal_met = false;
		this.mode = "shipping";
		document.addEventListener("CartUpdated",(event)=>{
			this.cart = event.detail;
			this.render();
		});
	}
	motivatorText() {
		return ((this.mode=="shipping"?)this.config.shipping_text:this.config.gwp_text).replace("##amount##",this.shortfall);
	} 
	goalMetText() {
		return (this.mode=="shipping")?this.config.shipping_met_text:this.config.gwp_met_text;
	}
	indicatorText() {
		return (this.mode=="shipping")?this.config.shipping_indicator:this.config.gwp_indicator;
	}
	calculate() {
			this.cart_total = (this.cart.items.reduce((sum,item)=>sum+this.config.item_applicable_amount(item))/100,0).toFixed(2);
			this.shortfall = this.config.threshold - this.cart_total;
			if (this.shortfall<=0) {
				if (this.config.gwp_enabled) {
					this.mode="gwp";
					this.shortfall = this.config.gwp_threshold - this.cart_total;
					if (this.shortfall<=0) {
						this.shortfall = 0;
						this.perc = 100;
						this.goal_met = true;
					} else {
							this.perc = ((this.cart_total/this.threshold)*100).toFixed(2);
							this.goal_met = false;
					}

				} else  {
					this.mode="shipping";
					this.shortfall = 0;
					this.perc = 100;
					this.goal_met = true;
				}
				
			} else {
				this.mode="shipping";
				this.perc = ((this.cart_total/this.threshold)*100).toFixed(2);
			}
	}
	render() {
	 	let injection_point = document.querySelector(this.config.target);
	 	if (!injection_point) {
	 		console.error(`Injection target ${this.config.target} does not exist`);
	 	}
	 	injection_point.childNodes.forEach(node=>injection_point.removeChild(node));
	 	injection_point.innerHTML = `
	 		<div class="go-cart-shipping--message js-go-cart-shipping--message">
     		<div class="go-cart-shipping-full js-go-cart-shipping-full${this.goal_met:'':' d-none'}"><strong>${this.goalMetText()}</strong></div>
     		<div class="go-cart-shipping-start js-go-cart-shipping-start${this.goal_met?' d-none':''}">
     			${this.motivatorText()}
      	</div>
      </div>
      <div class="go-cart-shipping--meter js-go-cart-shipping--meter${this.goal_met?' d-none':''}">
      	<div class="go-cart-shipping--meter-fill js-go-cart-shipping--meter-fill" style="width: ${this.perc}%;"></div>
      </div>
      <div class="go-cart-benefits-bar columns-1 js-go-cart-benefits-bar">
   	  	<div class="go-cart-benefits-item go-cart-benefit-freeshipping">
    	  	<div class="go-cart-benefits-bar-point"></div>
     			<span>${this.indicatorText()}</span>
    	  </div>
      </div>
	 	`;
	}	  
	getCart(cart=null) {
		if (cart!=null) {
			this.cart = cart;
			this.render();
			return;
		}
		fetch(this.config.extended_cart?"/cart?view=json":"/cart.js")
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
}