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
            else if (type === ENUM_ORDER.PROCESS) return { text: "加工", color: "positive" };
            else if (type === ENUM_ORDER.MATERIAL) return { text: "领料", color: "orange" };
            else if (type === ENUM_ORDER.GETOUT) return { text: "发货", color: "orange" };
            else if (type === ENUM_ORDER.SALES) return { text: "销售", color: "pink-6" };
            else return { text: "异常", color: "grey" };
        },
        setSkuPounds(sku: SkuJoined) {
            sku.pounds = this.getNormPounds(sku.norm, sku.count, sku.formula);
        },
        getNormPounds(norm: string, count: number, formula: ENUM_POUNDS_FORMULA): number {
            const VOLUME = 0.00785; // g/cm^3
            const PAI = 3.1415926; // 圆周率
            norm = String(norm).replace(/s/g, "");
            count = Number(count) || 0;

            let POUNDS = 0;
            switch (formula) {
                case ENUM_POUNDS_FORMULA.TS_PLATE: {
                    let _VOLUME = 7.85; // 1t = 1000kg = 1000000g，钢材密度 7.85g/cm^3
                    norm.split("*").map((MM) => (_VOLUME = _VOLUME * (Number(MM) / 10))); // 1m = 100cm = 1000mm
                    POUNDS = (VOLUME / 1000 / 1000) * Number(count); // 吨
                    break;
                }
                case ENUM_POUNDS_FORMULA.TS_WFGG: {
                    const norms = norm.split("*").map((MM) => Number(MM) || 0);
                    const D = norms[0]; // 外直径
                    const h = norms[1]; // 厚度
                    POUNDS = (D - h) * h * VOLUME * PAI * count; // kg
                    POUNDS /= 1000;
                    break;
                }
                case ENUM_POUNDS_FORMULA.TS_FG: {
                    const norms = norm.split("*").map((MM) => Number(MM) || 0);
                    const W = norms[0];
                    const h = norms[1];
                    POUNDS = W * 4 * h * VOLUME * count; // kg
                    POUNDS /= 1000;
                    break;
                }
                case ENUM_POUNDS_FORMULA.TS_JXFG: {
                    const norms = norm.split("*").map((MM) => Number(MM) || 0);
                    const W = norms[0];
                    const H = norms[1];
                    const h = norms[2];
                    POUNDS = (((W + H) * 2) / PAI - h) * h * VOLUME * PAI * count; // kg
                    POUNDS /= 1000;
                    break;
                }
                case ENUM_POUNDS_FORMULA.TS_DBJG: {
                    const norms = norm.split("*").map((MM) => Number(MM) || 0);
                    const H = norms[0];
                    const h1 = norms[1];
                    POUNDS = (H + H - h1) * h1 * VOLUME * Number(count); // kg
                    POUNDS /= 1000;
                    break;
                }
                case ENUM_POUNDS_FORMULA.TS_BDBJG: {
                    const norms = norm.split("*").map((MM) => Number(MM) || 0);
                    const H = norms[0];
                    const B = norms[1];
                    const h1 = norms[2];
                    POUNDS = (H + B - h1) * h1 * VOLUME * Number(count); // kg
                    POUNDS /= 1000;
                    break;
                }
                case ENUM_POUNDS_FORMULA.TS_HXG: {
                    const norms = norm.split("*").map((MM) => Number(MM) || 0);
                    const H = norms[0];
                    const B = norms[1];
                    const h1 = norms[2];
                    const b1 = norms[3];
                    POUNDS = ((H - b1 * 2) * h1 + 2 * B * b1) * VOLUME * Number(count); // kg
                    POUNDS /= 1000;
                    break;
                }
            }

            return parseInt(Math.round((POUNDS || 0) * 1000).toString()) / 1000;
        },
    },
});
