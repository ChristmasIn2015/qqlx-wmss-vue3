import { defineStore } from "pinia";
import { cloneDeep } from "lodash";

import { getMongodbBase, getPage, MongodbSort, getTimeGap } from "qqlx-cdk";
import { ENUM_PROJECT, PATH_MARKET_SCO_ANALYSIS } from "qqlx-core";

import type { getScoAnalysisDto, getScoAnalysisRes, ScheduleCardOrderJoined } from "qqlx-core";

import { request } from "@/lib";
import { useNotifyStore } from "@/stores/quasar/notify";
const NotifyStore = useNotifyStore();

export const useMarketScoAnalysisStore = defineStore("MarketScoAnalysis", {
    state: () => ({
        result: null as getScoAnalysisRes | null,
        message: "",
        isOverdue: false,
    }),
    actions: {
        /** @viewcatch */
        async get() {
            try {
                const corpId = localStorage.getItem("qqlx-corp-id") as string;
                const dto: getScoAnalysisDto = { corpId };
                const res: getScoAnalysisRes = await request.get(PATH_MARKET_SCO_ANALYSIS, { dto });
                this.result = res;

                const active = this.result.lastActiveSCO;
                const now = Date.now();
                const deadline = active ? active.timeCreate + (active.joinCard?.schedule || 0) : 0;
                this.message = now > deadline ? "已过期" : "剩余 " + getTimeGap(deadline, now);
                this.isOverdue = now > deadline;
            } catch (error) {
                NotifyStore.fail((error as Error).message);
            }
        },
    },
});
