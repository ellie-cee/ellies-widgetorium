//* Copyright 2023 Chelsea and Rachel Co ellie@xhelseaandrachel.com *//

class CnRVariantPicker {
	defaults = {
		"type":"button",
		target_class:".cnr-pdp-variant-option",
		variants:[], // {{ product.variants | json}}
		options:[], // {{ product.options | json }}
		optnames:["option1","option2","option3"],
		display_logic:(variant)=>console.log("display logic"),
		update_form:(variant)=>{
			let idform =  document.querySelector('form[action="/cart/add"] input[name="id"]');
			if (idform) {
				idform.value = variant.id;
			}
		}
	}
	constructor(options={}) {
		this.config = {...this.defaults,...options};
		if (this.config.type=="select") {
			document.querySelectorAll(this.config.target_class).forEach(select=>{
				button.addEventListener("change",event=>{
					this.process_selects();
				});
			});
		} else {
			document.querySelectorAll(this.config.target_class).forEach(button=>{
				button.addEventListener("click",event=>{
					this.process_buttons();
				});
			});
		}
	}
	process_options(selected_string) {
        console.error("selected",selected_string);
        console.error("avauilable",this.config.optnames.map(opt=>this.config.variants[0][opt]).filter(value=>value!=null).join("-"));
		let selected_variant = this.config.variants.find(
			variant=>selected_string==this.config.optnames.map(opt=>variant[opt]).filter(value=>value!=null).join("-")
		);
		if (selected_variant) {
			this.config.update_form(selected_variant);
			this.config.display_logic(selected_variant);
		}
	}
	process_buttons() {
		return this.process_options(
			Array.from(document.querySelectorAll(`${this.config.target_class}:checked`)).map((item)=>item.value).join("-")
		);
	}
	process_selects() {
		return this.process_options(
    		Array.from(document.querySelectorAll(`${this.config.target_class}`)).map(item=>item.options[item.selectedIndex].value).join("-")
        );
	}

}