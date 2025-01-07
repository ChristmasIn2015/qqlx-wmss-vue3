import { defineStore } from "pinia";
import { cloneDeep, debounce } from "lodash";

import { MongodbSort, getMongodbBase, getPage, getTimeGap } from "qqlx-cdk";
import {
  PATH_ORDER_ANALYSIS,
  PATH_CONTACT_ANALYSIS,
  PATH_SKU_ANALYSIS,
  ENUM_ORDER,
  OrderAnalysis,
  getOrderAnalysisDto,
  getOrderAnalysisRes,
  getContactAnalysisDto,
  getContactAnalysisRes,
  getSkuAnalysisDto,
  getSkuAnalysisRes,
} from "qqlx-core";

import { request } from "@/lib";
import { getPage2 } from "@/lib/time";

export const useAnalysisStore = defineStore("Analysis", {
  state: () => ({
    page: getPage2(),

    sortKey: "amountBookOfOrderRest",
    sortValue: MongodbSort.DES,
    loadding: false,
  }),
  actions: {
    async getOrderAnalysis(dto: getOrderAnalysisDto): Promise<OrderAnalysis> {
      const res: getOrderAnalysisRes = await request.get(PATH_ORDER_ANALYSIS, { dto });
      return res;
    },
    async getContactAnalysis(dto: getContactAnalysisDto): Promise<getContactAnalysisRes> {
      dto = { ...dto, sortKey: this.sortKey, sortValue: this.sortValue };
      const res: getContactAnalysisRes = await request.get(PATH_CONTACT_ANALYSIS, { dto });
      return res;
    },
    async getSkuAnalysis(dto: getSkuAnalysisDto = null): Promise<getSkuAnalysisRes> {
      const res: getSkuAnalysisRes = await request.get(PATH_SKU_ANALYSIS, { dto });
      return res;
    },
  },
});
