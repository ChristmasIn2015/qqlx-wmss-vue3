import { defineStore } from "pinia";
import { cloneDeep, debounce } from "lodash";

import { getMongodbBase, getPage } from "qqlx-cdk";
import { ENUM_CONTACT, ENUM_CORP, PATH_BRAND_CONTACT } from "qqlx-core";

import type { Page } from "qqlx-cdk";
import type {
    postContactDto,
    postContactRes,
    getContactDto,
    getContactRes,
    patchContactDto,
    patchContactRes,
    deleteContactDto,
    deleteContactRes,
    Contact,
} from "qqlx-core";

import { request } from "@/lib";
import { useNotifyStore } from "@/stores/quasar/notify";
const NotifyStore = useNotifyStore();

function getSchema(): Contact {
    return {
        corpId: "",
        type: ENUM_CONTACT.SALES,
        name: "",
        address: "",
        remark: "",
        isDisabled: false,
        ...getMongodbBase(),
    };
}

export const useContactStore = defineStore("Contact", {
    state: () => ({
        search: getSchema() as Contact,
        editor: getSchema() as Contact,
        listExcel: [] as Contact[],
        list: [] as Contact[],

        page: getPage(15) as Page,
        total: 0,
        loadding: false,
    }),
    actions: {
        /** @viewcatch */
        async get(page?: number) {
            try {
                // 分页
                if (page && page > 0) this.page.page = page;
                this.loadding = true;

                const dto: getContactDto = { page: this.page, search: this.search };
                const res: getContactRes = await request.get(PATH_BRAND_CONTACT, { dto });
                this.list = res.list;
                this.total = res.total;
            } catch (error) {
                NotifyStore.fail((error as Error).message);
            } finally {
                this.loadding = false;
            }
        },
        async get10() {
            const schema = this.getSchema();
            schema.name = this.search.name;
            //@ts-ignore
            schema.type = null;

            const dto: getContactDto = { page: getPage(10), search: schema };
            const res: getContactRes = await request.get(PATH_BRAND_CONTACT, { dto });
            return res;
        },
        /** @viewcatch */
        async post() {
            try {
                const excels = cloneDeep(this.listExcel);
                while (excels.length > 0) {
                    const dto: postContactDto = {
                        excels: excels.splice(0, 80).map((e) => {
                            e.type = this.search.type;
                            return e;
                        }),
                    };
                    const res: postContactRes = await request.post(PATH_BRAND_CONTACT, { dto });
                }

                this.setEditor();
                NotifyStore.success("添加成功");
            } catch (error) {
                NotifyStore.fail((error as Error).message);
            } finally {
                this.get(1);
                this.listExcel = [];
            }
        },
        /** @viewcatch */
        async patch(contact?: Contact) {
            try {
                const target = contact || this.editor;
                const dto: patchContactDto = target;
                const res: patchContactRes = await request.patch(PATH_BRAND_CONTACT, { dto });

                this.setEditor();
                NotifyStore.success("修改成功");
            } catch (error) {
                NotifyStore.fail((error as Error).message);
            } finally {
                this.get();
                this.listExcel = [];
            }
        },
        /** @viewcatch */
        async delete(contactId: string) {
            try {
                const dto: deleteContactDto = { contactId };
                const res: deleteContactRes = await request.delete(PATH_BRAND_CONTACT, { dto });
                await this.get(1);

                NotifyStore.success("删除成功");
            } catch (error) {
                NotifyStore.fail((error as Error).message);
            }
        },
        getSchema() {
            const schema: Contact = getSchema();
            return schema;
        },
        setEditor(entity?: Contact) {
            const schema = entity ? entity : this.getSchema();
            this.editor = cloneDeep(schema);
            this.search = cloneDeep(schema);
        },
    },
});
