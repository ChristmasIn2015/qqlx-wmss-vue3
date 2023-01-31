// Composables
import { createRouter, createWebHistory } from "vue-router";

const routes = [
	{
		path: "",
		component: () => import("@/layouts/default.vue"),
		redirect: "/view/system/setting",
		children: [
			{
				path: "/view/system",
				name: "",
				component: () => import("@/views/system/index.vue"),
				children: [
					{
						path: "contact",
						name: "通讯录",
						component: () => import("@/views/system/contact.vue"),
						meta: { icon: "mdi-account-box", color: "" },
					},
					{
						path: "cabinet",
						name: "货架",
						component: () => import("@/views/system/cabinet.vue"),
						meta: { icon: "mdi-file-cabinet", color: "" },
					},
					{
						path: "setting",
						name: "设置",
						component: () => import("@/views/system/setting.vue"),
						meta: { icon: "mdi-cog", color: "" },
					},
				],
			},
			{
				path: "/view/purchase",
				name: "采购",
				component: () => import("@/views/purchase/index.vue"),
				children: [
					{
						path: "create",
						name: "添加单据",
						component: () => import("@/views/purchase/create.vue"),
						meta: { icon: "mdi-cart-outline", color: "" },
					},
					{
						path: "list",
						name: "单据列表",
						component: () => import("@/views/purchase/list.vue"),
						meta: { icon: "mdi-file-multiple-outline", color: "" },
					},
					{
						path: "certification",
						name: "付款凭证",
						component: () => import("@/views/purchase/certification.vue"),
						meta: { icon: "mdi-cash-minus", color: "" },
					},
				],
			},
			{
				path: "/view/warehouse",
				name: "仓库",
				component: () => import("@/views/purchase/index.vue"),
				children: [
					{
						path: "getin",
						name: "入库单",
						component: () => import("@/views/warehouse/getin.vue"),
						meta: { icon: "mdi-truck-check", color: "" },
					},
					{
						path: "material",
						name: "厂房领料",
						component: () => import("@/views/warehouse/material.vue"),
						meta: { icon: "mdi-human-dolly", color: "" },
					},
					{
						path: "process",
						name: "厂房加工",
						component: () => import("@/views/warehouse/process.vue"),
						meta: { icon: "mdi-hammer-wrench", color: "" },
					},
					{
						path: "getout",
						name: "发货单",
						component: () => import("@/views/warehouse/getout.vue"),
						meta: { icon: "mdi-dolly", color: "" },
					},
				],
			},
			{
				path: "/view/sales",
				name: "销售",
				component: () => import("@/views/sales/index.vue"),
				children: [
					{
						path: "create",
						name: "创建订单",
						component: () => import("@/views/sales/create.vue"),
						meta: { icon: "mdi-phone-in-talk", color: "" },
					},
					{
						path: "list",
						name: "订单列表",
						component: () => import("@/views/sales/list.vue"),
						meta: { icon: "mdi-file-document-multiple-outline", color: "" },
					},
					{
						path: "certification",
						name: "收款凭证",
						component: () => import("@/views/sales/certification.vue"),
						meta: { icon: "mdi-cash-plus", color: "" },
					},
				],
			},
			{
				path: "/view/finance",
				name: "财务",
				component: () => import("@/views/sales/index.vue"),
				children: [
					{
						path: "ledger",
						name: "资金记录",
						component: () => import("@/views/finance/ledger.vue"),
						meta: { icon: "mdi-cash", color: "" },
					},
					{
						path: "invoice",
						name: "发票",
						component: () => import("@/views/finance/invoice.vue"),
						meta: { icon: "mdi-receipt-text-plus", color: "" },
					},
				],
			},
		],
	},
	{
		path: "/:catchAll(.*)",
		component: () => import("@/layouts/404.vue"),
	},
];

const router = createRouter({
	history: createWebHistory(process.env.BASE_URL),
	routes,
});

export default router;
