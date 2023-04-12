import { defineStore } from "pinia";
import { cloneDeep, debounce } from "lodash";

import { getMongodbBase, getPage, getTimeGap } from "qqlx-cdk";
import { PATH_ORDER_ANALYSIS, ENUM_ORDER, getOrderAnalysisDto, getOrderAnalysisRes } from "qqlx-core";

import { request } from "@/lib";
import { useNotifyStore } from "@/stores/quasar/notify";
import { useConfigStore } from "@/stores/brand/config";

const NotifyStore = useNotifyStore();
const Config = useConfigStore();

type ViewOrderAna = {
    startTime: number;
    endTime: number;
    text: string;
    calcu: Record<ENUM_ORDER, { amount: number; count: number }>;
};

export const useAnalysisStore = defineStore("Analysis", {
    state: () => ({
        timeQuasarPicked: { from: `${new Date().getFullYear()}/01/01`, to: new Date().toLocaleString().split(" ")[0] },
        page: getPage(),
        loadding: false,
    }),
    actions: {
        async set(dto: ViewOrderAna[]): Promise<ViewOrderAna[]> {
            this.loadding = true;
            const res: getOrderAnalysisRes = await request.get(PATH_ORDER_ANALYSIS, { dto });
            this.loadding = false;
            return dto.map((time, index) => ({ ...time, ...res[index] }));
        },
    },
});
