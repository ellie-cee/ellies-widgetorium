/* 2022 Chelsea and Rachel Co. chelseaandrachel.com */

class CRDeferredDOMAction {
    constructor(condition,callback,attempts=50,timeout=500) {
        this.condition = condition;
        this.callback = callback;
        this.max_attempts = attempts;
        this.attempts = 0;
        this.interval_id = window.setInterval(()=>{
            if (this.condition()) {
                this.callback();
                this.bailout();
            } else {
                this.attempts++;
                if (this.attempts>=this.max_attempts) {
                    this.bailout();
                }
            }
        },timeout);
    }
    bailout() {
        window.clearInterval(this.interval_id);
    }
}

const dda = new CRDeferredDOMAction(
    ()=>document.querySelector(".rc-widget-injection-parent") && document.querySelector(".rc-widget-injection-parent").hasChildNodes(),
    ()=>{
 function variantChanged(selected) {
   if (selected==null) {
     return;
   }
   let variantPrice = "$0.00";

  
   if (selected.tagName=="SELECT") {
    variantPrice = selected.options[selected.selectedIndex].innerText; 
   } else {
     variantPrice = (document.querySelector("[data-radio-subsave]") && document.querySelector("[data-radio-subsave]").checked)?selected.getAttribute("data-sub-price"):selected.getAttribute("data-price");
   
     if (variantPrice) {
    
       document.querySelector("#price_material").innerText = variantPrice;
       try {
     
         document.querySelector("[data-price-onetime]").innerText = selected.getAttribute("data-price");
         sellingPlanAllocation.price
         document.querySelector("[data-price-subsave]").innerText = selected.getAttribute("data-sub-price");
       } catch(e) {
         console.error(e);
       }
     }
   }
   let label =  document.querySelector("#price_material");
   label.innerText = variantPrice;
   label.setAttribute("data-selected-id",selected.id);

     window.setTimeout(()=>{
         label.innerText = variantPrice;  
       },200);
  
    /** Update image Slider */
    var variantImage = selected.dataset.image;
    var position = -1;

    $('.product-thumbs .single-thumb').each(function() { 
      if ( $(this).data('image') == variantImage ) { 
      position = parseInt($(this).data('slick-index'));
      return;
      }
   });

   if ( position != -1 ) { 
     $('.product-thumbs').find('.js-slider-thumbs').slick('slickGoTo', position);
   }
 }
 document.addEventListener("DOMContentLoaded",(event)=>{
   document.querySelector("#productSelect").addEventListener("change",(event)=> {
     variantChanged(event.srcElement);
   });
   variantChanged(document.querySelector(".variant-option"));
   const dda = new CRDeferredDOMAction(
     ()=>document.querySelector(".rc-widget-injection-parent") && document.querySelector(".rc-widget-injection-parent").hasChildNodes(),
     ()=>{
       document.querySelectorAll(".rc_widget__option__input").forEach(element=>{
         element.addEventListener("click",(event)=>{
           let currentId =  document.querySelector("#price_material").getAttribute("data-selected-id");
           window.setTimeout(()=>variantChanged( document.querySelector(`#${currentId}`)),200);
         });
       });
       let currentId =  document.querySelector("#price_material").getAttribute("data-selected-id");
       variantChanged( document.querySelector(`#${currentId}`));
     },
     50,
     500
   );
 });

