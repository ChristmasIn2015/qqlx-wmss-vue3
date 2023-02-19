// Composables
import { createRouter, createWebHistory } from "vue-router";

const routes = [
	{
		path: "/wmss",
		redirect: "/wmss/system/setting",
		component: () => import("@/components/layout.vue"),
		children: [
			{
				path: "system",
				name: "设置",
				component: () => import("@/views/system/index.vue"),
				children: [
					{
						path: "setting",
						name: "控制台",
						component: () => import("@/views/system/setting.vue"),
						meta: { icon: "signal_cellular_alt", color: "", show: true },
					},
					// {
					// 	path: "contact",
					// 	name: "客户分析",
					// 	component: () => import("@/views/system/contact.vue"),
					// 	meta: { icon: "people", color: "", show: true },
					// },
				],
			},
			{
				path: "warehouse",
				name: "仓库",
				component: () => import("@/views/warehouse/index.vue"),
				children: [
					{
						path: "order-create",
						name: "创建内部订单",
						component: () => import("@/views/warehouse/order-create.vue"),
						meta: { icon: "mdi-truck-check", color: "indigo", show: false },
					},
					{
						path: "order-edit",
						name: "修改内部订单",
						component: () => import("@/views/warehouse/order-edit.vue"),
						meta: { icon: "mdi-truck-check", color: "indigo", show: false },
					},
					{
						path: "cabinet",
						name: "货架",
						component: () => import("@/views/warehouse/cabinet.vue"),
						meta: { icon: "dns", color: "indigo", show: true },
					},
					{
						path: "order-list",
						name: "内部订单",
						component: () => import("@/views/warehouse/order-list.vue"),
						meta: { icon: "settings_suggest", color: "indigo", show: true },
					},
					{
						path: "sku-list",
						name: "仓库明细",
						component: () => import("@/views/warehouse/sku-list.vue"),
						meta: { icon: "format_list_numbered", color: "indigo", show: true },
					},
				],
			},
			{
				path: "trade",
				name: "交易大厅",
				component: () => import("@/views/trade/index.vue"),
				children: [
					{
						path: "purchase-create",
						name: "采购开单",
						component: () => import("@/views/trade/purchase-create.vue"),
						meta: { icon: "shopping_cart", color: "primary", show: true },
					},
					{
						path: "sale-create",
						name: "销售开单",
						component: () => import("@/views/trade/sale-create.vue"),
						meta: { icon: "phone_callback", color: "pink-6", show: true },
					},
					{
						path: "order-list",
						name: "订单列表",
						component: () => import("@/views/trade/order-list.vue"),
						meta: { icon: "local_printshop", color: "pink-6", show: true },
					},
					{
						path: "order-edit",
						name: "编辑订单",
						component: () => import("@/views/trade/order-edit.vue"),
						meta: { icon: "menu", color: "pink-6", show: false },
					},
				],
			},
			{
				path: "finance",
				name: "财务中心",
				component: () => import("@/views/finance/index.vue"),
				children: [
					{
						path: "book",
						name: "资金记录",
						component: () => import("@/views/finance/book.vue"),
						meta: { icon: "money", color: "teal", show: true },
					},
					{
						path: "book-edit",
						name: "编辑资金",
						component: () => import("@/views/finance/book-edit.vue"),
						meta: { icon: "money", color: "teal", show: false },
					},
					{
						path: "book-invoice",
						name: "财务凭证",
						component: () => import("@/views/finance/book-invoice.vue"),
						meta: { icon: "how_to_vote", color: "purple-8", show: true },
					},
					{
						path: "invoice",
						name: "发票列表",
						component: () => import("@/views/finance/invoice.vue"),
						meta: { icon: "how_to_vote", color: "purple-8", show: true },
					},
					{
						path: "invoice-edit",
						name: "编辑发票",
						component: () => import("@/views/finance/invoice-edit.vue"),
						meta: { icon: "money", color: "teal", show: false },
					},
				],
			},
		],
	},
	{
		path: "/wmss/login",
		component: () => import("@/views/login/index.vue"),
	},
	{
		path: "/:catchAll(.*)",
		component: () => import("@/views/error/404.vue"),
	},
];

const router = createRouter({
	history: createWebHistory(),
	routes,
});

export default router;
