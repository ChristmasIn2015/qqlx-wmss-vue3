// webfontloader
export async function loadFonts() {
	const webFontLoader = await import(/* webpackChunkName: "webfontloader" */ "webfontloader");

	webFontLoader.load({
		google: { families: ["Roboto:100,300,400,500,700,900&display=swap"] },
	});
}
loadFonts();

// Vuetify
import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";
import { createVuetify } from "vuetify";
const vuetify = createVuetify({
	theme: {
		themes: {
			light: {
				colors: {
					primary: "#1867C0",
					secondary: "#5CBBF6",
				},
			},
		},
	},
});

// pinia
import { createPinia } from "pinia";
const pinia = createPinia();

// router
import router from "@/router";

// vue3
import App from "./App.vue";
import { createApp } from "vue";

import snackbar from "@/components/snackbar.vue";
import tableInput from "@/components/table-input.vue";
// import cabinetUnitInput from "@/components/cabinet-unit-input.vue";
// import skuInput from "@/components/sku-input.vue";
import searchInput from "@/components/search-input.vue";

const app = createApp(App);
app.use(pinia);
app.use(vuetify);

app.component("snackbar", snackbar);
app.component("table-input", tableInput);
// app.component("cabinet-unit-input", cabinetUnitInput);
// app.component("sku-input", skuInput);
app.component("search-input", searchInput);

app.use(router);

app.mount("#app");
