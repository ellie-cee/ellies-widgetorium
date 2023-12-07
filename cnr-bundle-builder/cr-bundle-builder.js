class CnRBundleBuilder {
    constructor(options) {

        this.config = {
          ...this.defaults,
          ...options,
        }
        this.products = [];
        this.by_options = {};
        this.current_filter = "All";
        this.cart = [];
        this.bundle_variants = this.config.bundle_variants;
        this.discount_multiplier= this.config.discount_multiplier;
        this.id = this.bundleID = crypto.randomUUID();
        this.add_products();

        document.addEventListener("DOMContentLoaded",()=>{
          this.setup_events();
        });
        this.filter("All");
        this.update_progress();
  
    }
    defaults = {
      max_items:4,
      bundle_variants:[],
      discount_multiplier:{},
      product_selector:".collection-product",

    }
    add_products() {
        document.querySelectorAll(this.config.product_selector).forEach(product=>{
          let available_sizes = {};
          JSON.parse(product.getAttribute("data-variants")).forEach(variant=>{
            variant.product_id = product.getAttribute("data-product-id");
            let optkey = variant.option1.split(" ")[0];
            available_sizes[optkey] = true;
            
            if (variant.available) {
               
               if (this.by_options[optkey]) {
                    this.by_options[optkey].push(variant)
                } else {
                    this.by_options[optkey] = [variant];
                }
            }
          });
          product.setAttribute("data-available-sizes",Object.keys(available_sizes).map(size=>size.split(" ")[0]).join(","));
        });
        
    }
    update_progress() {
      let items = this.cart_item_count();
      let shortfall = parseInt(this.max_items)-items;
      document.querySelector(".cnr-bb-num-to-go").innerHTML = `&nbsp;${shortfall}&nbsp;`;
      document.querySelector(".cnr-bb-progress").style.width=`${(items/this.max_items)*100}%`;
      let price = this.cart.reduce((a,b)=>a+(b.price*b.quantity),0).toFixed(2);
      let discount = this.cart.reduce((a,b)=>a+(this.discount_multiplier[this.max_items]*b.quantity),0).toFixed(2);
      document.querySelector(".cnr-bb-current-price").innerHTML = "$"+(parseFloat(price-discount)).toFixed(2);
      document.querySelector(".cnr-bb-compared-price").innerHTML = "$"+price;
      
      if (items==this.max_items) {
        document.querySelectorAll(".cnr-bb-add-to-box").forEach(button=>button.disabled=true);
        document.querySelectorAll("span.plus").forEach(plus=>plus.style.cursor="not-allowed");
        document.querySelectorAll("span.plus").forEach(plus=>plus.style.pointerEvents="none");
        document.querySelector(".cnr-bb-add-to-cart-box").classList.remove("d-none");
        document.querySelector(".num-to-go-button").classList.add("d-none");
        document.querySelector(".bb-nothero-hero").scrollIntoView({behavior: "smooth"})
      } else {
        document.querySelectorAll(".cnr-bb-add-to-box").forEach(button=>button.disabled=false);
         document.querySelectorAll("span.plus").forEach(plus=>plus.style.cursor="default");
        document.querySelectorAll("span.plus").forEach(plus=>plus.style.pointerEvents="auto");
        document.querySelector(".num-to-go-button").classList.remove("d-none");
        document.querySelector(".cnr-bb-add-to-cart-box").classList.add("d-none");
      }
      
      document.querySelectorAll(".cnr-bb-number-button").forEach(button=>{
         if (parseInt(button.value)<items) {
           button.disabled = true;
         } else {
           button.disabled = false;
         }
       });
      document.querySelector(".cnr-bb-progress-heading").innerHTML = `${this.max_items} Diaper Box`;

      if (parseInt(this.max_items) == 4) {
        document.querySelector(".cnr-bb-upgrade").style.display = "inline";
      } else {
        document.querySelector(".cnr-bb-upgrade").style.display="none";
      }
      
      
    }
    setup_events() {
      
      document.querySelectorAll(".cnr-bb-size-dropdown").forEach(option=>{
        option.addEventListener("change",(event)=>{
          this.filter(option.options[option.selectedIndex].value);
        });
      });
      document.querySelectorAll(".cnr-bb-size-option-radio").forEach(option=>{
        option.addEventListener("click",(event)=>{
          this.filter(option.value);
        });
      });
      document.querySelectorAll(".cnr-bb-variants").forEach(select=>{
        select.addEventListener("change",(event)=>{
          this.quantity_options(select);
        });
      });
      document.addEventListener("ItemQuantityChanged",(event)=>{
        this.update_quantity(event.detail);  
      });

      document.querySelectorAll(".cnr-bb-add-to-box").forEach(button=>{
        button.addEventListener("click",(event)=>{
          this.add_item(button);
        })
      });

      document.querySelectorAll(".cnr-bb-bb-box-button,.cnr-bb-number-button").forEach(button=>{
        
        button.addEventListener("click",event=>{
          this.max_items = parseInt(button.getAttribute("data-box"));
          this.update_progress();
          document.querySelector("section.bb-mix-and-match").classList.remove("d-none");
          document.querySelector("section.bb-mix-and-match-hero").classList.add("d-none");
          document.querySelector(`.cnr-bb-number-button[value="${button.getAttribute("data-box")}"]`).checked = true;
          this.filter(this.current_filter);
        });
      });
      document.querySelector(".cnr-bb-add-to-cart-box").addEventListener("click",event=>{
        this.finalize();
      });
    }
    add_item(item) {
      let product_id = item.getAttribute("data-product-id");
      let select = document.querySelector(`.cnr-bb-variants[data-product-id="${product_id}"]`);
      let variant = select.options[select.selectedIndex];
      this.cart.push({
        id:variant.value,
        quantity:parseInt(document.querySelector(`.quantity-selector[data-product-id="${product_id}"]`))||1,
        price:parseFloat(variant.getAttribute("data-price")),
        title:document.querySelector(`.bb-product-grid-item[data-product-id="${product_id}"]`).getAttribute("data-title")
      });
      this.quantity_options(select);
      this.update_progress();
    }
    update_quantity(item) {
      
      let product_id = item.getAttribute("data-product-id");
      let select = document.querySelector(`.cnr-bb-variants[data-product-id="${product_id}"]`);
      let variant_id = select.options[select.selectedIndex].value;
      if (item.value<=0) {
        this.cart = this.cart.filter(item=>item.id!=variant_id);
      } else {
        let cart_index = this.cart.findIndex(item=>item.id==select.options[select.selectedIndex].value);
        this.cart[cart_index].quantity = parseInt(item.value);
      }
      this.quantity_options(select);
      this.update_progress();
      
    }
    cart_item_count() {
      return this.cart.reduce((a,b)=>a+b.quantity,0);
    }
    quantity_options(select) {
    
      let product_id = select.getAttribute("data-product-id");
      let selector = `[data-product-id="${product_id}"]`;
      let variant = select.options[select.selectedIndex];
      if (!variant) {
        let gi = document.querySelector(`.bb-product-grid-item[data-product-id="${product_id}"]`);
        console.error("no variants for ",gi);
        
        gi.style.display="none";
        return;
      }
      let cart_item = this.cart.find(item=>item.id==variant.value);
      let m = document.querySelector(`.cnr-bb-product-price${selector}`);
      if (cart_item) {
        document.querySelector(`.cnr-bb-add-to-box${selector}`).style.display="none";
        document.querySelector(`.pdp-qty-button${selector}`).style.display="block";
        m.innerHTML = `$${((cart_item.price-this.discount_multiplier[this.max_items])*cart_item.quantity).toFixed(2)}`;
        document.querySelector(`.quantity-selector${selector}`).value = cart_item.quantity;
      } else {
        document.querySelector(`.cnr-bb-add-to-box${selector}`).style.display="block";
        document.querySelector(`.pdp-qty-button${selector}`).style.display="none";
        m.innerHTML = `$${(parseFloat(variant.getAttribute("data-price"))-this.discount_multiplier[this.max_items]).toFixed(2)}`;
      }
      
    }
    filter(filterVal) {
      this.current_filter = filterVal;
      document.querySelectorAll(".collection-product").forEach(product=>{
        if (filterVal=="All" || product.getAttribute("data-available-sizes").split(",").includes(filterVal)) {
          product.style.display="inherit";
          let variants = [];
          
          if (filterVal=="All") {
            
           Object.keys(this.by_options).forEach(filter=>variants = variants.concat(
              this.by_options[filter].filter(v=>v.product_id==product.getAttribute("data-product-id"))
           )); 
          } else {
            variants = this.by_options[filterVal].filter(v=>v.product_id==product.getAttribute("data-product-id"));
          }
          
          let select = document.querySelector(`.cnr-bb-variants[data-product-id="${product.getAttribute("data-product-id")}"]`);
          if (select) {
           select.innerHTML="";
           let selected_variants = variants.filter(item=>(item.option2.startsWith("10") || item.option2.startsWith("12")) && item.available);
     
           selected_variants.forEach(variant=>{
             let opt = document.createElement("OPTION");
             opt.value = variant.id;
             opt.innerHTML = variant.public_title;
             opt.setAttribute("data-price",(variant.price/100).toFixed(2));
             if (variant.selling_plan_allocations.length) {
               opt.setAttribute("data-sub-price",(variant.selling_plan_allocations[0].price/100).toFixed(2))
             } else {
               opt.setAttribute("data-sub-price","0.0");
             }
             if (this.cart.find(item=>item.id==variant.id)) {
               opt.selected = true;
             }
             select.appendChild(opt);
           });
          if (selected_variants.length<1) {
                product.style.display="none";
          } else {
            select.classList.remove("d-none");
          }
          this.quantity_options(select);
            
          }
          
        } else {
          product.style.display="none";
        }
      });
    }
    finalize() {

      let items = this.cart.map(item=>{
          return {
            id:item.id,
            quantity:item.quantity,
            properties:{
              "_bundleID":this.id,
              "_boxSize":this.max_items,
              '_bundleType':'mixmatch'
            }
          }
        });
      items.unshift(
        {
          id:this.bundle_variants[this.max_items],
          properties:{
            '_bundleParentID':this.id,
            '_bundleType':'mixmatch',
            Contents:this.cart.map(item=>`${item.quantity} x ${item.title}`).join("\n")
          },
          quantity:1,
        }
      );
      let payload = {
        attributes:{
          "test":"yams",
        },
        items:items,
      };
       window.fetch('/cart/add.js', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })
            .then((response) => response.json())
            .then((product) => goCart.fetchAndOpenCart())
            .catch((error) => {
               
            });
    }
    load_subscriptions() {
        fetch("https://static.rechargecdn.com/store/tykables.myshopify.com/product/2020-12/products.json")
          .then(response=>response.json())
          .then(json=>{
            this.subscriptions = {};
                  json.products.forEach(entry=>{
                    var product = Object.values(entry)[0];
                    if (product.subscription_options.storefront_purchase_options!="onetime" && product.selling_plan_groups.length){
                        var options = product.selling_plan_groups[0].selling_plans.map(plan=>{
                        return {id:plan.selling_plan_id,label:plan.selling_plan_name};
                      });
                      this.subscriptions[product.external_product_id] = {
                          group_id:product.selling_plan_groups[0].selling_plan_group_id,
                          options:options,
                          subscription_options:product.subscription_options
                        };
                      }
                  });
          })
          .catch(error=>console.error(error));
                                                           
      }
}