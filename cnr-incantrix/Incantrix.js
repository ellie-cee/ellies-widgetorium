/* Copyright 2023 Chelsea and Rachel Co */
class CnRIncantrix {
    constructor(options) {
        this.screens = [];
        this.screen = 0;
        this.data = {};
        document.querySelectorAll(".incantrix-nav").forEach(nav=>{
            nav.addEventListener("click",event=>this.navigate(nav));

        });
        let perc = 100/(document.querySelectorAll("[data-incantrix-screen]").length-1);
        document.querySelectorAll("[data-incantrix-screen]").forEach((screen,index)=>{
            screen.setAttribute("data-incantrix-screen",index);
            if (screen.getAttribute("data-last-screen")) {
              screen.setAttribute("data-progress","100");  
            } else {
              screen.setAttribute("data-progress",perc*index);
            }
            this.screens.push(new IncantrixScreen(screen,index));
        });
        ;
        this.load_data();
        this.show(0);
    }

    generate_navbar(root) {
        document.querySelectorAll(root).forEach(holder=>{
            holder.innerHTML =  `
                <ul class="incantrix-nav-menu">
                    ${this.screens.map(screen=>this.navbar_template(screen.index,screen.title)).join("\n")}
                </ul>
            `;
            holder.querySelectorAll(".incantrix-menu-item").forEach(nav=>{
                 nav.addEventListener("click",event=>{
                    if (!nav.classList.contains("disabled")) {
                        this.show(parseInt(nav.getAttribute("data-screen")));
                    }
                 });
            });
        });
    }
    navbar_template(index,title) {
        return `<li data-incantrix-screen="${index}" class="incantrix-menu-item disabled">
            <span class="screen-number">${index+1}</span>
            <span class="screen-label">${title}</span>
            </li>`;
    }
    generate_navbuttons(root) {
        document.querySelectorAll(root).forEach(holder=>{
            holder.innerHTML = `
                <div class="incantrix-nav-holder" style="display: flex; justify-content: space-around;">
                    <button class="incantrix-nav-button cta grid-item-cta cta-foreward-lite-primary" data-screen-nav="back" disabled>Back</button>
                    <button class="incantrix-nav-button cta grid-item-cta cta-foreward-lite-primary" data-screen-nav="next" disabled>Next</button>
                </div>
            `;
            holder.querySelectorAll(".incantrix-nav-button").forEach(nav=>{
                nav.addEventListener("click",event=>this.navigate(nav));
            });
        });
    }

    navigate(nav) {
      if (nav.getAttribute("data-screen-nav")=="back" && this.screen>0) {
        this.show(this.screen-1);
      } else {
        this.show(this.screen+1);
      }
    }
    next() {
      if (this.screen+1<this.screens.length) {
        this.show(this.screen+1);
      }
    }
    prev() {
      if (this.screen-1>=0) {
        this.show(this.screen-1);
      }
    }
    current_screen() {
        return this.screens[this.screen];
    }
    show(screen) {
        if (this.screen==0) {
            document.querySelectorAll(".incantrix-nav-holder").forEach(nav=>nav.removeAttribute("hidden"));
        }
        if (screen>=0 && screen<this.screens.length) {
            
            this.current_screen().hide();
            this.screens[screen].show();
            this.screen = screen;
        }
        
        if (document.querySelector(".js-choose-style-heading")) {
            document.querySelector(".js-choose-style-heading").innerHTML = this.current_screen().title;
        }
        
        if (this.screen>0) {
             document.querySelectorAll('.incantrix-nav-button[data-screen-nav="back"]').forEach(button=>button.removeAttribute("disabled"));
        } else {
            document.querySelectorAll('.incantrix-nav-button[data-screen-nav="back"]').forEach(button=>button.setAttribute("disabled",""))
        }
      
        //\/ Nav Buttons
        if (this.screen+1<this.screens.length && this.current_screen().completed()) {
            document.querySelectorAll('.incantrix-nav-button[data-screen-nav="next"]').forEach(button=>button.removeAttribute("disabled"));
        } else {
            document.querySelectorAll('.incantrix-nav-button[data-screen-nav="next"]').forEach(button=>button.setAttribute("disabled",""));
        }
      
        // Nav Bars
        document.querySelectorAll(".incatrix-menu-item").forEach(item=>{
            let index = parseInt(item.getAttribute("data-screen"));
            if (this.screens[index].completed()) {
                item.classList.remove("disabled");
            } else {
                item.classList.add("disabled");
            }
            if (index == this.screen) {
                item.classList.add("active");
            } else {
                item.classList.remove("active");
            }
        });
        document.querySelector(".progress.js-progress").style.width=`${this.current_screen().screen.getAttribute("data-progress")}%`;


        document.dispatchEvent(
            new CustomEvent("Incantrix.ScreenChanged",{bubbles:true,detail:this})
         );
      if (this.current_screen().is_final()) {
        document.dispatchEvent(
            new CustomEvent("Incantrix.FinalScreen",{bubbles:true,detail:this})
         );
      }
    }
    load_data() {

    }
    Finalize() {
        
    }
}
class IncantrixScreen {
    constructor(screen,index) {        
        this.index = index;
        this.screen = screen;
        this.data = {};
        this.is_completed = false;
        this.visible_display = screen.style.display;
        this.title = screen.getAttribute("data-screen-title");
        this.load_data();
        this.setup_events();
        this.hide();
    }
    load_data() {

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
    setup_events() {

    }
    hide() {
      
      this.screen.classList.add("d-none");
      this.screen.classList.remove("d-flex");
    }
    show(incoming_data) {
      this.data = incoming_data;
      this.screen.classList.remove("d-none");
      this.screen.classList.add("d-flex");
    }
    completed() {
        
        return this.is_completed;
    }
    complete() {
      this.is_completed=true;
    }
    data() {
        return this.data;
    }
    is_final() {
      return this.screen.hasAttribute("data-final-screen");
    }
}