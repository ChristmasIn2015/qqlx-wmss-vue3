import { defineStore } from "pinia";
import { cloneDeep } from "lodash";

import { getMongodbBase } from "qqlx-cdk";
import { PATH_BRAND_AREA } from "qqlx-core";

import type { postAreaDto, postAreaRes, getAreaDto, getAreaRes, patchAreaDto, patchAreaRes, Area } from "qqlx-core";

import { request } from "@/lib";
import { useNotifyStore } from "@/stores/quasar/notify";
import { useWarehouseStore } from "@/stores/brand/warehouse";
const NotifyStore = useNotifyStore();
const WarehouseStore = useWarehouseStore();

function getSchema(): Area {
    return {
        corpId: "",
        houseId: "",
        name: "",
        desc: "",
        isDisabled: false,
        ...getMongodbBase(),
    };
}

export const useAreaStore = defineStore("Area", {
    state: () => ({
        editor: getSchema(),
        list: [] as Area[],
    }),
    actions: {
        async get() {
            const dto: getAreaDto = null;
            const res: getAreaRes = await request.get(PATH_BRAND_AREA);
            this.list = res.map((e) => {
                e.joinWarehouse && (e.name += ` @${e.joinWarehouse?.name}`);
                return e;
            });
        },
        /** @viewcatch */
        async post() {
            try {
                const dto: postAreaDto = this.editor;
                const res: postAreaRes = await request.post(PATH_BRAND_AREA, { dto });
                await this.get();
                NotifyStore.success("添加成功");
            } catch (error) {
                NotifyStore.fail((error as Error).message);
            }
        },
        /** @viewcatch */
        async patch() {
            try {
                const dto: patchAreaDto = this.editor;
                const res: patchAreaRes = await request.patch(PATH_BRAND_AREA, { dto });
                await this.get();
                NotifyStore.success("修改成功");
            } catch (error) {
                NotifyStore.fail((error as Error).message);
            }
        },
        getSchema() {
            const schema: Area = getSchema();
            return schema;
        },
        setEditor(target?: Area) {
            const schema = target ? cloneDeep(target) : this.getSchema();
            !target && (schema.houseId = WarehouseStore.picked?._id || "");
            this.editor = schema;
        },
    },
});
