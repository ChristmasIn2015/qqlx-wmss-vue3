import { defineStore } from "pinia";
import { cloneDeep } from "lodash";

import { getMongodbBase, getPage } from "qqlx-cdk";
import { ENUM_CORP, PATH_BRAND_CORP } from "qqlx-core";

import type { Page } from "qqlx-cdk";
import type { postCorpDto, postCorpRes, getCorpDto, getCorpRes, patchCorpDto, patchCorpRes, deleteCorpDto, deleteCorpRes, Corp, BrandRole } from "qqlx-core";

import { request } from "@/lib";
import { useNotifyStore } from "@/stores/quasar/notify";
import { useWarehouseStore } from "@/stores/brand/warehouse";
import { useMarketScoAnalysisStore } from "@/stores/market/analysis";
import { useAnnounceStore } from "@/stores/brand/announce";
import { useAreaStore } from "@/stores/brand/area";

const NotifyStore = useNotifyStore();
const AnnounceStore = useAnnounceStore();
const WarehouseStore = useWarehouseStore();
const AreaStore = useAreaStore();
const MarketScoAnalysisStore = useMarketScoAnalysisStore();

function getSchema(): Corp {
    return {
        userId: "",
        type: ENUM_CORP.COMPANY,
        name: "",
        address: "",
        contact: "",
        isDisabled: false,
        ...getMongodbBase(),
    };
}

export const useCorpStore = defineStore("Corp", {
    state: () => ({
        picked: getSchema() as Corp,
        editor: getSchema() as Corp,
        list: [] as (Corp & { isRoot: boolean })[],
    }),
    actions: {
        async get() {
            const dto: getCorpDto = null;
            const res: getCorpRes = await request.get(PATH_BRAND_CORP);
            this.list = res;
        },
        /** @viewcatch */
        async post() {
            try {
                const dto: postCorpDto = this.editor;
                const res: postCorpRes = await request.post(PATH_BRAND_CORP, { dto });
                await this.get();
                NotifyStore.success("添加成功");
            } catch (error) {
                NotifyStore.fail((error as Error).message);
            }
        },
        async patch() {
            try {
                const dto: patchCorpDto = this.editor;
                const res: patchCorpRes = await request.patch(PATH_BRAND_CORP, { dto });
                await this.get();
                NotifyStore.success("修改成功");
            } catch (error) {
                NotifyStore.fail((error as Error).message);
            }
        },
        /** @viewcatch */
        async delete(corp: Corp) {
            try {
                const dto: deleteCorpDto = { entityId: corp._id };
                const res: deleteCorpRes = await request.delete(PATH_BRAND_CORP, { dto });
                await this.get();
                NotifyStore.success("操作成功");
            } catch (error) {
                NotifyStore.fail((error as Error).message);
            }
        },
        /** @viewcatch */
        async pick(corp?: Corp) {
            try {
                if (!corp) return;
                this.picked = cloneDeep(corp);
                document.title = this.picked.name;
                localStorage.setItem("qqlx-corp-id", this.picked._id);
                NotifyStore.success(`正在使用 @${this.picked.name}`);

                await WarehouseStore.get();
                WarehouseStore.pick(WarehouseStore.list.find((e) => e.isDisabled === false));
                await AnnounceStore.get();
                await MarketScoAnalysisStore.get();
                await AreaStore.get();
            } catch (error) {
                NotifyStore.fail((error as Error).message);
            }
        },
        getSchema() {
            const schema: Corp = getSchema();
            return schema;
        },
        setEditor(target?: Corp) {
            const schema = target ? cloneDeep(target) : this.getSchema();
            this.editor = schema;
        },
    },
});
