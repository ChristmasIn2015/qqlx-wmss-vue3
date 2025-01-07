import { defineStore } from "pinia";
import { cloneDeep } from "lodash";

import { MongodbSort, getMongodbBase, getPage } from "qqlx-cdk";
import { ENUM_ORDER, ENUM_LAYOUT_CABINET, ENUM_POUNDS_FORMULA, PATH_SKU } from "qqlx-core";

import type { Page } from "qqlx-cdk";
import type {
  getSkuDto,
  getSkuRes,
  patchSkuDto,
  patchSkuRes,
  SkuJoined,
  getOrderInfoDto,
  getOrderInfoRes,
  Sku,
  Order,
} from "qqlx-core";

import { request } from "@/lib";
import { useNotifyStore } from "@/stores/quasar/notify";
import { getPage2 } from "@/lib/time";

const NotifyStore = useNotifyStore();

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

    keyOrigin: "",
    keyFeat: "",
    keyCode: "",

    corpId: "",
    warehouseId: "",
    keyHouse: "",

    areaId: "",
    orderId: "",
    orderContactId: "",
    orderIsDisabled: false,

    deductionSkuId: "",

    ...getMongodbBase(),
  };
}

const columns = [
  { name: "timeCreateString", field: "timeCreateString", label: "时间", align: "left", style: NotifyStore.fontStyle },
  { name: "layout", field: "layout", label: "库存类型", align: "left" },
  { name: "name", field: "name", label: "品名", align: "left", style: NotifyStore.fontStyle },
  { name: "norm", field: "norm", label: "规格", align: "left", style: NotifyStore.fontStyle },
  { name: "formula", field: "formula", label: "用途", align: "center" },
  { name: "count", field: "count", label: "数量", style: NotifyStore.fontStyle },
  { name: "pounds", field: "pounds", label: "过磅", style: NotifyStore.fontStyle },
  { name: "poundsFinal", field: "poundsFinal", label: "剩余重量", style: NotifyStore.fontStyle },
  { name: "keyOrigin", field: "keyOrigin", label: "产地", align: "left", style: NotifyStore.fontStyle },
  { name: "keyFeat", field: "keyFeat", label: "材质", align: "left", style: NotifyStore.fontStyle },
  { name: "keyCode", field: "keyCode", label: "捆包号", align: "left", style: NotifyStore.fontStyle },
  { name: "warehouseId", field: "warehouseId", label: "仓库", align: "left", style: NotifyStore.fontStyle },
  { name: "keyHouse", field: "keyHouse", label: "货位号", align: "left", style: NotifyStore.fontStyle },
  { name: "price", field: "price", label: "单价", style: NotifyStore.fontStyle },
  { name: "remark", field: "remark", label: "备注", style: NotifyStore.fontStyle },
  { name: "orderContactId", field: "orderContactId", label: "客户", align: "left", style: NotifyStore.fontStyle },
  { name: "orderId", field: "orderId", label: "订单编号", align: "left", style: NotifyStore.fontStyle },
  { name: "_id", field: "_id", label: "操作", align: "left", style: NotifyStore.fontStyle },
];
function getColumnsVisable() {
  const columns_local: string[] = [];
  const cache_key = "qqlx-sku-columns";
  const cache = localStorage.getItem(cache_key);

  if (!cache) {
    const caches = [
      "name",
      "norm",
      "formula",
      "count",
      "pounds",
      "poundsFinal",
      "poundsSaleing",
      "keyOrigin",
      "keyFeat",
      "keyCode",
      "warehouseId",
      "keyHouse",
      "_id",
    ].join(";");
    localStorage.setItem(cache_key, caches.toString());
  }

  localStorage
    .getItem(cache_key)
    ?.toString()
    .split(";")
    .map((column_name) => {
      const isMatch = columns.find((e) => e.name === column_name);
      if (isMatch) columns_local.push(column_name);
    });

  return columns_local;
}
getColumnsVisable();

export const useSkuStore = defineStore("Sku", {
  state: () => ({
    types: [] as ENUM_ORDER[],
    search: getSchema() as Sku,
    editor: getSchema() as Sku,
    list: [] as SkuJoined[],
    listPicked: [] as SkuJoined[],

    sortKey: "timeCreate",
    sortValue: MongodbSort.DES,
    page: getPage2(),
    total: 0,
    loadding: false,

    dialog: false,
    dialogTitle: "",
    dialogMore: false,
    dialogSkuList: [] as SkuJoined[],

    columns: columns,
    columnsVisiable: getColumnsVisable(),
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
    async getSkuRelaOrder(deductionSkuId: string): Promise<SkuJoined[]> {
      let skus: SkuJoined[] = [];
      try {
        this.loadding = true;
        const dto = { deductionSkuId };
        const res: SkuJoined[] = await request.get(PATH_SKU + "/rela-order", { dto });
        skus = res;
      } catch (error) {
        //
      } finally {
        this.loadding = false;
        return skus;
      }
    },
    /** 弹窗查看Sku */
    dialogSku(skuList: SkuJoined[], option = { title: "商品信息", more: false }) {
      this.dialogSkuList = cloneDeep(skuList || []);
      this.dialogTitle = option?.title || "";
      this.dialogMore = option?.more || false;
      this.dialog = true;
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
    },
    getLabelByType(type: ENUM_ORDER) {
      if (type === ENUM_ORDER.GETIN) return { text: "入库", color: "positive" };
      else if (type === ENUM_ORDER.PROCESS) return { text: "加工", color: "positive" };
      else if (type === ENUM_ORDER.MATERIAL) return { text: "领料", color: "orange" };
      else if (type === ENUM_ORDER.GETOUT) return { text: "发货", color: "orange" };
      else if (type === ENUM_ORDER.SALES) return { text: "销售", color: "pink-6" };
      else if (type === ENUM_ORDER.PURCHASE) return { text: "采购", color: "cyan" };
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
          POUNDS = (_VOLUME / 1000 / 1000) * Number(count); // 吨
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
        case ENUM_POUNDS_FORMULA.TS_WFGG_REGULAR: {
          const norms = norm.split("*").map((MM) => Number(MM) || 0);
          const D = norms[0]; // 外直径
          const h = norms[1]; // 厚度
          POUNDS = (D - h) * h * VOLUME * PAI * count; // kg

          const l = norms[2]; // 长度
          POUNDS *= l / 1000;

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
        case ENUM_POUNDS_FORMULA.TS_FG_REGULAR: {
          const norms = norm.split("*").map((MM) => Number(MM) || 0);
          const W = norms[0];
          const h = norms[1];
          POUNDS = W * 4 * h * VOLUME * count; // kg

          const l = norms[2]; // 长度
          POUNDS *= l / 1000;

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
        case ENUM_POUNDS_FORMULA.TS_JXFG_REGULAR: {
          const norms = norm.split("*").map((MM) => Number(MM) || 0);
          const W = norms[0];
          const H = norms[1];
          const h = norms[2];
          POUNDS = (((W + H) * 2) / PAI - h) * h * VOLUME * PAI * count; // kg

          const l = norms[3]; // 长度
          POUNDS *= l / 1000;

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

    /** local */
    setColumnsVisable() {
      localStorage.setItem("qqlx-sku-columns", this.columnsVisiable.join(";"));
    },
  },
});
