import { defineStore } from "pinia";
import { cloneDeep } from "lodash";

import { getMongodbBase, getPage, MongodbSort } from "qqlx-cdk";
import { ENUM_ORDER, PATH_ORDER } from "qqlx-core";

import type { Page } from "qqlx-cdk";
import type {
    postOrderDto,
    postOrderRes,
    getOrderDto,
    getOrderRes,
    getOrderGroupDto,
    getOrderGroupRes,
    putOrderDto,
    putOrderRes,
    deleteOrderDto,
    deleteOrderRes,
    OrderJoined,
    Order,
    Sku,
    getOrderInfoDto,
    getOrderInfoRes,
} from "qqlx-core";

import { request } from "@/lib";
import { useNotifyStore } from "@/stores/quasar/notify";
import { useAnalysisStore } from "@/stores/wmss/analysis";
import { useSkuStore } from "@/stores/wmss/sku";

const NotifyStore = useNotifyStore();
const AnalysisStore = useAnalysisStore();
const SkuStore = useSkuStore();

function getSchema(): Order {
    return {
        corpId: "",

        parentOrderId: "",
        parentOrderType: ENUM_ORDER.NONE,

        creatorId: "",
        contactId: "",
        managerId: "",
        accounterId: "",

        type: ENUM_ORDER.NONE,
        code: "",
        amount: 0,
        remark: "",
        isDisabled: false,
        isNotTax: false,

        amountBookOfOrder: 0,
        amountBookOfOrderRest: 0,
        amountBookOfOrderVAT: 0,
        amountBookOfOrderVATRest: 0,
        ...getMongodbBase(),
    };
}

export const useOrderStore = defineStore("Order", {
    state: () => ({
        search: getSchema() as Order,
        editor: getSchema() as OrderJoined,
        list: [] as OrderJoined[],

        loadding: false,
        sortKey: "timeCreate",
        sortValue: MongodbSort.DES,
        page: getPage(15),
        timeQuasarPicked: { from: `${new Date().getFullYear()}/01/01`, to: new Date().toLocaleString().split(" ")[0] },
        total: 0,
        group: {
            amount: 0,
            amountBookOfOrder: 0,
            amountBookOfOrderRest: 0,
            amountBookOfOrderVAT: 0,
            amountBookOfOrderVATRest: 0,
        },

        // 是否可以复核、结清
        requireManagerId: false,
        requireAccounterId: false,

        // 用于结清资金
        listPicked: [] as OrderJoined[],

        // 打印列设置
        columnNameShow: true,
        columnCountShow: true,
        columnUnitShow: true,
        columnPoundsShow: true,
        columnPriceShow: true,
        columnPriceAllShow: true,
        columnPriceReverseShow: false, // 从售价数量，逆向推断单价
        columnRemarkShow: true,

        columnKeyOriginShow: false,
        columnKeyFeatShow: false,
        columnKeyCodeShow: false,
        columnKeyWarehouseShow: false,
        columnKeyHouseShow: false,
    }),
    actions: {
        /** @viewcatch */
        async get(page?: number) {
            try {
                if (page && page > 0) this.page.page = page;
                this.loadding = true;

                const dto: getOrderDto = {
                    page: this.page,
                    search: this.search,
                    requireManagerId: this.requireManagerId,
                    requireAccounterId: this.requireAccounterId,
                    sortKey: this.sortKey,
                    sortValue: this.sortValue,
                    joinSku: ![ENUM_ORDER.PURCHASE, ENUM_ORDER.SALES].includes(this.search.type),
                };
                const res: getOrderRes = await request.get(PATH_ORDER, { dto });
                this.list = res.list.map((order) => {
                    order.timeContractString = new Date(order.timeContract).toLocaleString();
                    return order;
                });
                this.total = res.total;

                // group
                this.getOrderGroup(dto); // async
            } catch (error) {
                NotifyStore.fail((error as Error).message);
            } finally {
                this.loadding = false;
            }
        },
        async getOrderGroup(dto: getOrderGroupDto) {
            try {
                const group: getOrderGroupRes = await request.get(PATH_ORDER + "/group", { dto });
                this.group = group;
            } catch (error) {
                this.group = {
                    amount: 0,
                    amountBookOfOrder: 0,
                    amountBookOfOrderRest: 0,
                    amountBookOfOrderVAT: 0,
                    amountBookOfOrderVATRest: 0,
                };
            }
        },
        async geOrderWidthSku(): Promise<OrderJoined[]> {
            const page = cloneDeep(this.page);
            page.page = 1;
            page.pageSize = this.total;
            if (page.endTime - page.startTime > 86400000 * 90) throw new Error(`最多选择90天`);

            this.loadding = true;
            const dto: getOrderDto = {
                page: page,
                search: this.search,
                requireManagerId: this.requireManagerId,
                requireAccounterId: this.requireAccounterId,
                sortKey: this.sortKey,
                sortValue: this.sortValue,
                joinSku: true,
            };
            const res: getOrderRes = await request.get(PATH_ORDER, { dto });
            return res.list;
        },
        sort(sortKey: string, joinSku: boolean = false) {
            if (sortKey) {
                this.sortKey = sortKey;
            } else {
                this.sortKey = "timeCreate";
            }
            this.sortValue = this.sortValue === MongodbSort.DES ? MongodbSort.ASC : MongodbSort.DES;
            this.get(1, joinSku); // async
        },
        /** @viewcatch */
        async post(skuList?: Sku[]): Promise<{ _id: string; code: string }> {
            const info = {
                _id: "",
                code: "",
            };
            try {
                this.loadding = true;
                const dto: postOrderDto = { schema: this.editor, skuList };
                const res: postOrderRes = await request.post(PATH_ORDER, { dto });
                info._id = res._id;
                info.code = res.code;
                this.loadding = false;

                NotifyStore.success("创建成功");

                // SkuStore.setEditor();
                SkuStore.listPicked = [];
                // await AnalysisStore.get();
            } catch (error) {
                NotifyStore.fail((error as Error).message);
            } finally {
                this.loadding = false;
                return info;
            }
        },
        /** @viewcatch */
        async put(entity?: OrderJoined, skuList?: Sku[]) {
            let code = "";
            try {
                this.loadding = true;
                const target = entity || this.editor;
                const dto: putOrderDto = { entity: target, skuList };
                const res: putOrderRes = await request.put(PATH_ORDER, { dto });
                NotifyStore.success("修改成功");

                // await AnalysisStore.get();
                code = target.code;
            } catch (error) {
                NotifyStore.fail((error as Error).message);
            } finally {
                this.loadding = false;
                return code;
            }
        },
        /** @viewcatch */
        async delete(orderId: string) {
            try {
                this.loadding = true;
                const dto: deleteOrderDto = { orderId };
                const res: deleteOrderRes = await request.delete(PATH_ORDER, { dto });

                NotifyStore.success("操作成功");
                // await AnalysisStore.get();
            } catch (error) {
                NotifyStore.fail((error as Error).message);
            } finally {
                this.loadding = false;
            }
        },
        async getSku(order: Order) {
            const dto: getOrderInfoDto = { orderId: order._id };
            const res: getOrderInfoRes = await request.get(PATH_ORDER + "/info", { dto });
            return res;
        },
        getSchema(type: ENUM_ORDER = ENUM_ORDER.NONE) {
            const schema: Order = getSchema();
            schema.type = type;
            return schema;
        },
        setEditor(entity?: Order) {
            const schema = entity ? cloneDeep(entity) : this.getSchema();
            this.editor = schema;
            this.search.type = schema.type;
            this.search.code = "";
            this.search.isNotTax = false;

            this.requireManagerId = false;
            this.requireAccounterId = false;
            this.sortKey = "timeCreate";
            this.sortValue = MongodbSort.DES;
        },
    },
});
