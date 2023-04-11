import { defineStore } from "pinia";
import { cloneDeep } from "lodash";

import { getMongodbBase } from "qqlx-cdk";
import { ENUM_POUNDS_FORMULA, MAP_ENUM_POUNDS_FORMULA, ENUM_LAYOUT_CABINET, MAP_ENUM_LAYOUT_CABINET, PATH_CABINET } from "qqlx-core";
import type {
    postCabinetDto,
    postCabinetRes,
    getCabinetDto,
    getCabinetRes,
    patchCabinetDto,
    patchCabinetRes,
    deleteCabinetDto,
    deleteCabinetRes,
    Cabinet,
} from "qqlx-core";

import { request } from "@/lib";
import { useNotifyStore } from "@/stores/quasar/notify";
const NotifyStore = useNotifyStore();

function getSchema(): Cabinet {
    return {
        corpId: "",
        name: "",
        unit: "",
        formula: ENUM_POUNDS_FORMULA.NONE,
        layout: ENUM_LAYOUT_CABINET.SUMMARY,
        ...getMongodbBase(),
    };
}

const recommand1 = getSchema();
recommand1.name = "冷轧卷";
recommand1.unit = "个";
recommand1.layout = ENUM_LAYOUT_CABINET.INDIVIDUAL;

const recommand2 = getSchema();
recommand2.name = "冷轧板";
recommand2.unit = "张";
recommand2.formula = ENUM_POUNDS_FORMULA.STEEL_PLATE;

const recommand3 = getSchema();
recommand3.name = "费用";

export const useCabinetStore = defineStore("Cabinet", {
    state: () => ({
        picked: getSchema(),
        editor: getSchema(),
        search: getSchema(),
        list: [] as Cabinet[],
        loadding: false,
        //
        recommands: [recommand1, recommand2, recommand3],
    }),
    actions: {
        async get() {
            const dto: getCabinetDto = null;
            const res: getCabinetRes = await request.get(PATH_CABINET);
            this.list = res.sort((p: Cabinet, n: Cabinet) => -(p.timeUpdate - n.timeUpdate));
        },
        /** @viewcatch */
        async post() {
            try {
                this.loadding = true;
                const dto: postCabinetDto = this.editor;
                const res: postCabinetRes = await request.post(PATH_CABINET, { dto });
                await this.get();

                if (this.editor.name) this.setEditor();
                NotifyStore.success("创建成功");
            } catch (error) {
                NotifyStore.fail((error as Error).message);
            } finally {
                this.loadding = false;
            }
        },
        /** @viewcatch */
        async patch() {
            try {
                this.loadding = true;
                const dto: patchCabinetDto = this.editor;
                const res: patchCabinetRes = await request.patch(PATH_CABINET, { dto });
                await this.get();
                NotifyStore.success("修改成功");
            } catch (error) {
                NotifyStore.fail((error as Error).message);
            } finally {
                this.loadding = false;
            }
        },
        /** @viewcatch */
        async delete(cabinetId: string) {
            try {
                const dto: deleteCabinetDto = { cabinetId };
                const res: deleteCabinetRes = await request.delete(PATH_CABINET, { dto });
                await this.get();
                NotifyStore.success("删除成功");
            } catch (error) {
                NotifyStore.fail((error as Error).message);
            }
        },
        getSchema() {
            const schema: Cabinet = getSchema();
            return schema;
        },
        setEditor(entity?: Cabinet) {
            const schema = cloneDeep(entity || this.getSchema());
            this.picked = schema;
            this.editor = schema;
            this.search = schema;
        },
    },
});
