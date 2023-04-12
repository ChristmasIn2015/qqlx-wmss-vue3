// Composables
import { createRouter, createWebHistory } from "vue-router";

const routes = [
    {
        path: "/wmss",
        redirect: "/wmss/system/dashboard",
        component: () => import("@/layout/index.vue"),
        children: [
            {
                path: "system",
                name: "",
                component: () => import("@/views/system/index.vue"),
                children: [
                    {
                        path: "dashboard",
                        name: "控制台",
                        component: () => import("@/views/system/dashboard.vue"),
                        meta: { icon: "insights", color: "primary", show: true },
                    },
                    {
                        path: "role",
                        name: "公司成员",
                        component: () => import("@/views/system/role.vue"),
                        meta: { icon: "group_add", color: "primary", show: true },
                    },
                    {
                        path: "cabinet",
                        name: "商品设置",
                        component: () => import("@/views/system/cabinet.vue"),
                        meta: { icon: "dashboard_customize", color: "indigo-14", show: true },
                    },
                    {
                        path: "pay",
                        name: "礼品卡",
                        component: () => import("@/views/system/pay.vue"),
                        meta: { icon: "group", color: "primary", show: false },
                    },
                    {
                        path: "corp",
                        name: "公司详情",
                        component: () => import("@/views/system/corp.vue"),
                        meta: { icon: "group", color: "primary", show: false },
                    },
                    // {
                    //     path: "warehouse",
                    //     name: "仓库详情",
                    //     component: () => import("@/views/system/warehouse.vue"),
                    //     meta: { icon: "group", color: "primary",  show: false },
                    // },
                ],
            },
            {
                path: "warehouse",
                name: "仓库",
                component: () => import("@/views/warehouse/index.vue"),
                children: [
                    {
                        path: "order-list",
                        name: "仓库订单",
                        component: () => import("@/views/warehouse/order-list.vue"),
                        meta: { icon: "post_add", color: "indigo-14", show: true },
                    },
                    {
                        path: "order-create",
                        name: "创建仓库订单",
                        component: () => import("@/views/warehouse/order-create.vue"),
                        meta: { icon: "mdi-truck-check", color: "indigo-14", show: false },
                    },
                    {
                        path: "order-edit",
                        name: "修改仓库订单",
                        component: () => import("@/views/warehouse/order-edit.vue"),
                        meta: { icon: "mdi-truck-check", color: "indigo-14", show: false },
                    },
                    {
                        path: "sku-individual",
                        name: "大件商品",
                        component: () => import("@/views/warehouse/sku-individual.vue"),
                        meta: { icon: "content_cut", color: "indigo-14", show: true },
                    },
                    {
                        path: "sku-list",
                        name: "库存明细",
                        component: () => import("@/views/warehouse/sku-list.vue"),
                        meta: { icon: "list", color: "indigo-14", show: true },
                    },
                ],
            },
            {
                path: "trade",
                name: "交易大厅",
                component: () => import("@/views/trade/index.vue"),
                children: [
                    // {
                    // 	path: "purchase-create",
                    // 	name: "采购开单",
                    // 	component: () => import("@/views/trade/purchase-create.vue"),
                    // 	meta: { icon: "shopping_cart", color: "primary",  show: true },
                    // },
                    {
                        path: "sale-create",
                        name: "代客下单",
                        component: () => import("@/views/trade/sale-create.vue"),
                        meta: { icon: "phone_callback", color: "pink-6", show: true },
                    },
                    {
                        path: "sale-list",
                        name: "订单列表",
                        component: () => import("@/views/trade/sale-list.vue"),
                        meta: { icon: "local_printshop", color: "pink-6", show: true },
                    },
                    {
                        path: "sale-edit",
                        name: "编辑订单",
                        component: () => import("@/views/trade/sale-edit.vue"),
                        meta: { icon: "menu", color: "pink-6", show: false },
                    },
                    {
                        path: "sale-sku",
                        name: "销售明细",
                        component: () => import("@/views/trade/sale-sku.vue"),
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
                        path: "book-1002",
                        name: "收款记录",
                        component: () => import("@/views/finance/book-1002.vue"),
                        meta: { icon: "add_card", color: "teal", show: true },
                    },
                    {
                        path: "book-1002-edit",
                        name: "编辑资金",
                        component: () => import("@/views/finance/book-1002-edit.vue"),
                        meta: { icon: "money", color: "teal", show: false },
                    },
                    {
                        path: "book-1122",
                        name: "发票列表",
                        component: () => import("@/views/finance/book-1122.vue"),
                        meta: { icon: "how_to_vote", color: "purple", show: true },
                    },
                    // {
                    // 	path: "book-invoice",
                    // 	name: "开票明细",
                    // 	component: () => import("@/views/finance/book2.vue"),
                    // 	meta: { icon: "receipt_long", color: "purple",  show: true },
                    // },
                    {
                        path: "book-1122-edit",
                        name: "编辑发票",
                        component: () => import("@/views/finance/book-1122-edit.vue"),
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

router.beforeEach((to, from) => {
    if (to.path === "/wmss/login") return true;

    const token = localStorage.getItem("qqlx-token");
    if (!!token === false) return "/wmss/login";
    return true;
});

export default router;
