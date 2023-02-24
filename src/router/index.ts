// Composables
import { createRouter, createWebHistory } from "vue-router";

const routes = [
	{
		path: "/wmss",
		redirect: "/wmss/system/setting",
		component: () => import("@/components/layout.vue"),
		children: [
			{
				path: "warehouse",
				name: "仓库",
				component: () => import("@/views/warehouse/index.vue"),
				children: [
					{
						path: "order-create",
						name: "创建内部订单",
						component: () => import("@/views/warehouse/order-create.vue"),
						meta: { icon: "mdi-truck-check", color: "indigo", backColorClass: "color-back-warehouse", show: false },
					},
					{
						path: "order-edit",
						name: "修改内部订单",
						component: () => import("@/views/warehouse/order-edit.vue"),
						meta: { icon: "mdi-truck-check", color: "indigo", backColorClass: "color-back-warehouse", show: false },
					},
					{
						path: "order-list",
						name: "内部订单",
						component: () => import("@/views/warehouse/order-list.vue"),
						meta: { icon: "settings_suggest", color: "indigo", backColorClass: "color-back-warehouse", show: true },
					},
					{
						path: "sku-list",
						name: "待处理",
						component: () => import("@/views/warehouse/sku-list.vue"),
						meta: { icon: "format_list_numbered", color: "indigo", backColorClass: "color-back-warehouse", show: true },
					},
					{
						path: "cabinet",
						name: "货架",
						component: () => import("@/views/warehouse/cabinet.vue"),
						meta: { icon: "dns", color: "indigo", backColorClass: "color-back-warehouse", show: true },
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
						meta: { icon: "shopping_cart", color: "primary", backColorClass: "color-back-trade", show: true },
					},
					{
						path: "sale-create",
						name: "销售开单",
						component: () => import("@/views/trade/sale-create.vue"),
						meta: { icon: "phone_callback", color: "pink-6", backColorClass: "color-back-trade", show: true },
					},
					{
						path: "order-list",
						name: "订单列表",
						component: () => import("@/views/trade/order-list.vue"),
						meta: { icon: "local_printshop", color: "pink-6", backColorClass: "color-back-trade", show: true },
					},
					{
						path: "order-edit",
						name: "编辑订单",
						component: () => import("@/views/trade/order-edit.vue"),
						meta: { icon: "menu", color: "pink-6", backColorClass: "color-back-trade", show: false },
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
						meta: { icon: "money", color: "teal", backColorClass: "color-back-finance", show: true },
					},
					{
						path: "book-edit",
						name: "编辑资金",
						component: () => import("@/views/finance/book-edit.vue"),
						meta: { icon: "money", color: "teal", backColorClass: "color-back-finance", show: false },
					},
					{
						path: "invoice",
						name: "发票列表",
						component: () => import("@/views/finance/invoice.vue"),
						meta: { icon: "how_to_vote", color: "purple-8", backColorClass: "color-back-finance", show: true },
					},
					{
						path: "book-invoice",
						name: "开票明细",
						component: () => import("@/views/finance/book2.vue"),
						meta: { icon: "receipt_long", color: "purple-8", backColorClass: "color-back-finance", show: true },
					},
					{
						path: "invoice-edit",
						name: "编辑发票",
						component: () => import("@/views/finance/invoice-edit.vue"),
						meta: { icon: "money", color: "teal", backColorClass: "color-back-finance", show: false },
					},
				],
			},

			{
				path: "system",
				name: "设置",
				component: () => import("@/views/system/index.vue"),
				children: [
					{
						path: "setting",
						name: "控制台",
						component: () => import("@/views/system/setting.vue"),
						meta: { icon: "settings", color: "primary", backColorClass: "color-back-system", show: true },
					},
					{
						path: "role",
						name: "公司成员",
						component: () => import("@/views/system/role.vue"),
						meta: { icon: "group", color: "primary", backColorClass: "color-back-system", show: true },
					},
					{
						path: "pay",
						name: "支付",
						component: () => import("@/views/system/pay.vue"),
						meta: { icon: "group", color: "primary", backColorClass: "color-back-system", show: false },
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
