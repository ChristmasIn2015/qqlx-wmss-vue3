import { defineStore } from "pinia";
import { cloneDeep } from "lodash";

import { MongodbSort, getMongodbBase, getPage } from "qqlx-cdk";
import { ENUM_ORDER, ENUM_LAYOUT_CABINET, ENUM_POUNDS_FORMULA, PATH_SKU } from "qqlx-core";

import type { Page } from "qqlx-cdk";
import type { getSkuDto, getSkuRes, patchSkuDto, patchSkuRes, SkuJoined, getSkuByOrderDto, getSkuByOrderRes, Sku, Order } from "qqlx-core";

import { request } from "@/lib";
import { useNotifyStore } from "@/stores/quasar/notify";
import { useAnalysisStore } from "@/stores/wmss/analysis";

const NotifyStore = useNotifyStore();
const AnalysisStore = useAnalysisStore();

function getSchema(): Sku {
    return {
        type: ENUM_ORDER.NONE,
        name: "",
        norm: "",
        unit: "",
        remark: "",

        pounds: 0,
        count: 0,
        poundsFinal: 0,
        countFinal: 0,

        price: 0,
        isConfirmed: false,
        isPriceInPounds: false,

        layout: ENUM_LAYOUT_CABINET.SUMMARY,
        formula: ENUM_POUNDS_FORMULA.NONE,

        keyCode: "",
        keyOrigin: "",
        keyFeat: "",

        corpId: "",
        warehouseId: "",
        orderId: "",
        orderContactId: "",
        orderIsDisabled: false,

        deductionSkuId: "",

        ...getMongodbBase(),
    };
}
export const useSkuStore = defineStore("Sku", {
    state: () => ({
        types: [] as ENUM_ORDER[],
        search: getSchema() as Sku,
        editor: getSchema() as Sku,
        list: [] as SkuJoined[],
        listPicked: [] as SkuJoined[],

        sortKey: "timeCreate",
        sortValue: MongodbSort.DES,
        page: getPage(),
        total: 0,
        loadding: false,
    }),
    actions: {
        /** @viewcatch */
        async get(page?: number) {
            try {
                if (page && page > 0) this.page.page = page;
                this.loadding = true;

                const dto: getSkuDto = {
                    sortKey: this.sortKey,
                    sortValue: this.sortValue,
                    types: this.types,

                    page: this.page,
                    search: this.search,
                };
                const res: getSkuRes = await request.get(PATH_SKU, { dto });
                this.list = res.list;
                this.total = res.total;
            } catch (error) {
                NotifyStore.fail((error as Error).message);
            } finally {
                this.loadding = false;
            }
        },
        sort(sortKey: string) {
            if (sortKey) {
                this.sortKey = sortKey;
            } else {
                this.sortKey = "timeCreate";
            }
            this.sortValue = this.sortValue === MongodbSort.DES ? MongodbSort.ASC : MongodbSort.DES;
            this.get(1); // async
        },
        async patch(entitys: SkuJoined[]) {
            try {
                this.loadding = true;
                for (let sku of entitys) {
                    const dto: patchSkuDto = { entity: sku };
                    const res: patchSkuRes = await request.patch(PATH_SKU, { dto });
                }
                await this.get(1);
                NotifyStore.success("修改成功");
            } catch (error) {
                NotifyStore.fail((error as Error).message);
            } finally {
                this.loadding = false;
            }
        },
        getSchema(type: ENUM_ORDER = ENUM_ORDER.NONE) {
            const schema: Sku = getSchema();
            schema.type = type;
            return schema;
        },
        setEditor(type: ENUM_ORDER = ENUM_ORDER.NONE, entity?: Sku) {
            const schema = entity ? cloneDeep(entity) : this.getSchema();
            schema.type = type;

            this.editor = schema;
            this.search = schema;
            this.listPicked = [];
        },
        getLabelByType(type: ENUM_ORDER) {
            if (type === ENUM_ORDER.GETIN) return { text: "入库", color: "positive" };
            else if (type === ENUM_ORDER.PROCESS) return { text: "加工", color: "cyan" };
            else if (type === ENUM_ORDER.MATERIAL) return { text: "领料", color: "orange" };
            else if (type === ENUM_ORDER.GETOUT) return { text: "发货", color: "pink-6" };
            else return { text: "异常", color: "grey" };
        },
        setSkuPounds(sku: SkuJoined) {
            if (sku.formula === ENUM_POUNDS_FORMULA.STEEL_PLATE) {
                sku.pounds = this.getNormPounds_1(sku.norm, sku.count);
            }
        },
        /** 根据 厚度mm *宽度mm *长度mm 计算板材重量（吨）
         */
        getNormPounds_1(norm: string, count: number): number {
            norm = String(norm).replace(/s/g, "");
            count = Number(count) || 0;

            let POUNDS = 0;
            let VOLUME = 7.85; // 1t = 1000kg = 1000000g，钢材密度 7.85g/cm^3
            norm.split("*").map((MM) => (VOLUME = VOLUME * (Number(MM) / 10))); // 1m = 100cm = 1000mm
            POUNDS = (VOLUME / 1000 / 1000) * Number(count); // 吨

            return parseInt(Math.round((POUNDS || 0) * 1000).toString()) / 1000;
        },
    },
});
