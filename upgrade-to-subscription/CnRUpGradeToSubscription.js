class CnRUpGradeToSubscription {
  constructor(options) {
  	this.config = {...this.defaults,...options};
  	this.load_subs();
  	document.addEventListener("CartUpdated",event=>this.render(event.detail));
  }
  defaults  = {
		'cart_item_selector':'.go-cart-item__single',
		'upgrade_text':'Upgrade To Autoship & Save up to 25%',
		'downgrade_text':'Converting to One-Time Purchase',
		'upgrading_text':'Upgrading to Autoship',
		'updating_text':'Updating Autoship',
    'shop':'wild-planet-food.myshopify',
		'onetime_text':'One-time Purchase',
		'update_cart':(obj)=>goCart.fetchCart()
	}
	render(cart={}) {
		this.cart();
	  let subscription_items = cart.items.reduce((a,b)=>{
	  	return (b.selling_plan_allocation && b.selling_plan_allocation.selling_plan)?a+b.quantity:a;
	  },0);

		document.querySelectorAll(this.config.cart_item_selector).forEach((element)=>{
			let eligible_item = element.querySelector("[data-upgradeable-item]");
			if (eligible_item) {
      	let product = this.subscriptions[eligible_item.getAttribute("data-line-item-product")];

      	if (!product || product.subscription_options.storefront_purchase_options=="inactive") {
      				return;
    		}
				if (eligible_item.getAttribute("data-selling-plan")) {
					this.insert_delivery_schedule(eligible_item,eligible_item.getAttribute("data-selling-plan"));
				} else {
					this.insert_upgrade_button(eligible_item,subscription_items);
				} 
			}
		});
    document.dispatchEvent(
    	new CustomEvent("CartUpdated2",{bubbles:true,detail:cart})
    );
	}	
	insert_upgrade_button(element,esubs) {
		while(element.firstChild) {
			element.removeChild(element.firstChild);
		}
    let psubs = esubs+parseInt(element.getAttribute("data-quantity"));
    let discount = 10;
    if (psubs==2) {
    	discount=15;
    } else if (psubs>=3) {
    	discount=25
    }
      
		let button  = document.createElement("button");
		button.setAttribute("data-line-item-key",element.getAttribute("data-line-item-key"));
		button.setAttribute("data-line",element.getAttribute("data-line"));
		button.innerHTML = `${this.config.upgrade_text.replace("##amount",discount)}`;
		button.classList.add("go-cart__button","cr-upgrade-to-subscription-widget-button");
		button.addEventListener("click",(event)=>{
			this.upgrade_to_subscription(event.srcElement);
		});
		element.appendChild(button);
	}
	insert_delivery_schedule(element,current_id) {
		while(element.firstChild) {
            element.removeChild(element.firstChild);
        }

		let select = document.createElement("select");
	 	select.setAttribute("data-line-item-key",element.getAttribute("data-line-item-key"));
    select.setAttribute("data-line",element.getAttribute("data-line"));
		select.classList.add("cr-upgrade-to-subscription-widget-select");
    let otgroup = document.createElement("optgroup");
     	otgroup.label = this.config.onetime_text;
    let otv = document.createElement("option");
      	otv.value="";
      	otv.text=this.config.onetime_text;
      	otgroup.appendChild(otv);
      	select.appendChild(otgroup);
    let subgroup = document.createElement("optgroup");
      	subgroup.label="Subscribe and Save";
		this.subscriptions[element.getAttribute("data-line-item-product")].options.forEach((option)=>{
			let opt = document.createElement("option");
			opt.value=option.id;
			opt.text=option.label;
			if (current_id==option.id) {
				 opt.selected = "true";
			}
			subgroup.appendChild(opt);
		});
    select.appendChild(subgroup);
    element.appendChild(select);
		select.addEventListener("change",(event)=>{
			this.update_subscription(event.srcElement);
		});
		
	}
	upgrade_to_subscription(element) {
		let eligible_item = element.parentNode;
    let product = this.subscriptions[eligible_item.getAttribute("data-line-item-product")];
		eligible_item.removeChild(element);
		this.display_notice(eligible_item,this.config.upgrading_text);
      	eligible_item.setAttribute("data-selling-plan",product.options[0].id);
      this.postCart("change",
      	{id:eligible_item.getAttribute('data-line-item-key'),quantity:0}
      ).then((json)=>{
        this.postCart("add",{
             'id':eligible_item.getAttribute('data-line-item-key'),
             'line':eligible_item.getAttribute("data-line"),
             'selling_plan':product.options[0].id,
              'quantity':eligible_item.getAttribute("data-quantity")
        }).then((json)=>this.updateCart());
      });
	}

	async postCart (action, itemsData) {
    const cartResponse = await fetch(`/cart/${action}.js`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'xmlhttprequest'
      },
      body: JSON.stringify(itemsData)
    }).then((response) => {
      return response.json()
    });

    return cartResponse
  }
  
	update_subscription(element) {
		let eligible_item = element.parentNode;
		let value = element.options[element.selectedIndex].value;
      
    	if (value) {
      	eligible_item.setAttribute("data-selling-plan",value);
      	this.display_notice(eligible_item,this.config.updating_text);

				this.postCart(
					"change",
	      	{
	      		id:eligible_item.getAttribute('data-line-item-key'),
	      		selling_plan:value,
	      	})
	      	.then((json)=>this.updateCart());
		} else {
			this.postCart(
				"change",{
      		id:eligible_item.getAttribute('data-line-item-key'),
      		selling_plan:value,
      	})
      	.then((json)=>this.updateCart());
			this.display_notice(eligible_item,this.config.downgrade_text);
      eligible_item.setAttribute("data-selling-plan",'');
		}
	}
	display_notice(element,text) {
  	while(element.firstChild) {
    	element.removeChild(element.firstChild);
    }
		let notice = document.createElement("span");
		notice.classList.add("cr_upgrade_to_selection_widget-notification");
		notice.innerHTML = text;
		element.appendChild(notice);
	}
	dispatch(detail) {
		let ev = new CustomEvent("SubscriptionUpgrade",{bubbles:true,detail:detail});
		document.dispatchEvent(ev);
	}
	updateCart() {
  		goCart.fetchCart();
  }
  loadSubs() {
  	fetch(`https://static.rechargecdn.com/store/${this.config.shop}/product/2020-12/products.json`)
  		.then(response=>response.json())
  		.then(json=>{
  			
  	  		let subscriptions = {};
  		  	json.products.forEach(entry=>{
  	          let product = Object.values(entry)[0];
  	          if (product.subscription_options.storefront_purchase_options!="onetime" && product.selling_plan_groups.length){
  	              let options = product.selling_plan_groups[0].selling_plans.map(plan=>{
  	              return {id:plan.selling_plan_id,label:plan.selling_plan_name};
  	            });
  	            subscriptions[product.external_product_id] = {
  	              group_id:product.selling_plan_groups[0].selling_plan_group_id,
  	              options:options,
  							  subscription_options:product.subscription_options
  	          	};
  	          }
  	  		});

  				cr_subscription_upgrade_widget.render(event.detail);
  			});
  		})
  		.catch(error=>console.error(error));
  }
}