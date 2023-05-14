<template>
    <q-table
        style="min-height: 700px; max-height: 700px"
        row-key="_id"
        dense
        :rows-per-page-options="[ContactStore.page.pageSize]"
        :rows="ContactStore.list"
        :columns="[
            { name: 'name', field: 'name', label: '名称', align: 'left', style: 'font-size: 16px; width: 300px; max-width: 300px;' },
            { name: 'remark', field: 'remark', label: '备注', align: 'left', style: 'font-size: 16px; width: 150px;' },
            { name: 'address', field: 'address', label: '联系方式', align: 'left', style: 'font-size: 16px; width: 150px; max-width: 150px;' },
            {
                name: 'timeCreateString',
                field: 'timeCreateString',
                align: 'left',
                label: '类型',
                style: 'font-size: 16px; width: 270px; max-width: 270px; padding: 0 8px;',
            },
        ]"
    >
        <template v-slot:header-cell-timeCreateString="props">
            <q-th key="timeCreateString" :props="props">
                <q-btn padding="xs" flat color="negative">
                    <span>{{ MAP_ENUM_CONTACT.get(ContactStore.search.type)?.text }}</span>
                    <q-icon name="expand_more"></q-icon>
                    <q-menu>
                        <q-list>
                            <q-item
                                clickable
                                v-close-popup
                                @click="
                                    () => {
                                        ContactStore.search.type = ENUM_CONTACT.SALES;
                                        ContactStore.get(1);
                                    }
                                "
                            >
                                <q-item-section>客户</q-item-section>
                            </q-item>
                            <q-item
                                clickable
                                v-close-popup
                                @click="
                                    () => {
                                        ContactStore.search.type = ENUM_CONTACT.PURCHASE;
                                        ContactStore.get(1);
                                    }
                                "
                            >
                                <q-item-section>供应商</q-item-section>
                            </q-item>
                        </q-list>
                    </q-menu>
                </q-btn>
            </q-th>
        </template>
        <template v-slot:top="props">
            <div class="col q-mb-md">
                <q-input
                    dense
                    standout
                    clearable
                    color="primary"
                    placeholder="请输入客户名称、联系方式、备注"
                    v-model="ContactStore.search.name"
                    :loading="ContactStore.loadding"
                    @blur="ContactStore.get(1)"
                >
                    <template v-slot:before>
                        <q-icon name="search" />
                    </template>
                </q-input>
            </div>
            <div class="col text-right q-mb-md">
                <q-btn
                    class="q-ml-sm"
                    push
                    square
                    label="最近删除"
                    :color="ContactStore.search.isDisabled ? 'primary' : ''"
                    :text-color="ContactStore.search.isDisabled ? '' : 'black'"
                    @click="
                        () => {
                            ContactStore.search.isDisabled = !ContactStore.search.isDisabled;
                            ContactStore.get(1);
                        }
                    "
                />
                <span v-if="ContactStore.listExcel.length > 0">
                    <q-btn class="q-ml-sm" push square :label="`保存 ${ContactStore.listExcel.length}项`" color="primary" @click="() => ContactStore.post()" />
                    <q-btn class="q-ml-sm text-negative" push square label="清空" @click="() => (ContactStore.listExcel = [])" />
                    <q-btn class="q-ml-sm" push square label="批量导入">
                        <q-menu>
                            <q-list>
                                <q-item clickable @click="NotifyStore.download()">
                                    <q-item-section>下载模板</q-item-section>
                                </q-item>
                                <q-item clickable>
                                    <q-item-section>
                                        <q-file
                                            dense
                                            borderless
                                            accept=".xlsx, .xls"
                                            v-model="filePicking"
                                            label="选择文件"
                                            @update:model-value="filePickNext"
                                        />
                                    </q-item-section>
                                </q-item>
                            </q-list>
                        </q-menu>
                    </q-btn>
                </span>
                <q-btn class="q-ml-sm" push square color="negative" label="继续添加" @click="() => ContactStore.listExcel.push(ContactStore.getSchema())" />
            </div>
        </template>
        <template v-slot:top-row>
            <q-tr v-for="(schema, index) in ContactStore.listExcel">
                <q-td>
                    <q-input square filled v-model="schema.name" dense clearable color="primary" placeholder="请输入名称" />
                </q-td>
                <q-td>
                    <q-input square filled v-model="schema.remark" dense clearable color="primary" placeholder="请输入备注" />
                </q-td>
                <q-td>
                    <q-input square filled v-model="schema.address" dense clearable color="primary" placeholder="请输入联系方式" />
                </q-td>
                <q-td>
                    <div class="row items-center">
                        <span class="q-pl-xs">保存为 {{ MAP_ENUM_CONTACT.get(ContactStore.search.type)?.text }}</span>
                        <q-space></q-space>
                        <q-btn icon="close" dense class="text-negative" flat @click="() => ContactStore.listExcel.splice(index, 1)"> </q-btn>
                    </div>
                </q-td>
            </q-tr>
        </template>
        <template v-slot:body="props">
            <q-tr :props="props">
                <q-td key="name" :props="props" class="ellipsis"> {{ props.row.name }} </q-td>
                <q-td key="remark" :props="props"> {{ props.row.remark }} </q-td>
                <q-td key="address" :props="props" class="ellipsis"> {{ props.row.address }} </q-td>
                <q-td key="timeCreateString" :props="props">
                    <div class="row items-center">
                        <span>
                            <q-chip color="primary" dense class="text-white" square>{{ MAP_ENUM_CONTACT.get(props.row.type)?.text }}</q-chip>
                        </span>
                        <q-space></q-space>
                        <q-btn dense icon="more_horiz" class="q-ml-sm" flat>
                            <q-menu anchor="top left">
                                <q-item clickable>
                                    <q-item-section
                                        v-close-popup
                                        @click="
                                            () => {
                                                ContactStore.setEditor(props.row);
                                                dialogPatch = true;
                                            }
                                        "
                                    >
                                        修改
                                    </q-item-section>
                                </q-item>
                                <q-item clickable>
                                    <q-item-section class="text-negative" v-close-popup @click="ContactStore.delete(props.row._id)">
                                        {{ props.row.isDisabled ? "恢复" : "删除" }}
                                    </q-item-section>
                                </q-item>
                            </q-menu>
                        </q-btn>
                        <q-btn dense push square class="q-ml-sm" color="primary" v-close-popup @click="$emit('pick', cloneDeep(props.row))"> 选择 </q-btn>
                    </div>
                </q-td>
            </q-tr>
        </template>
        <template v-slot:bottom="props">
            <q-pagination
                square
                size="16px"
                color="white"
                class="q-my-sm"
                text-color="black"
                active-color="primary"
                active-text-color="white"
                v-model="ContactStore.page.page"
                :max-pages="10"
                :max="Math.ceil(ContactStore.total / ContactStore.page.pageSize)"
                @update:model-value="(value) => ContactStore.get(value)"
            />
            <q-space></q-space>
            <span>共 {{ ContactStore.total }} 项</span>
        </template>
    </q-table>

    <q-dialog v-model="dialogPatch">
        <q-card class="w-400">
            <q-toolbar class="bg-primary text-white">
                <q-toolbar-title>修改</q-toolbar-title>
                <q-btn dense flat icon="close" v-close-popup></q-btn>
            </q-toolbar>

            <q-card-section>
                <q-input class="q-mb-sm" filled label="名称" v-model="ContactStore.editor.name" color="primary">
                    <template v-slot:before>
                        <q-icon name="person" />
                    </template>
                </q-input>
                <q-input class="q-mb-sm" filled label="联系方式" v-model="ContactStore.editor.address" color="primary">
                    <template v-slot:before>
                        <q-icon name="" />
                    </template>
                </q-input>
                <q-input class="q-mb-sm" filled label="备注" v-model="ContactStore.editor.remark" color="primary">
                    <template v-slot:before>
                        <q-icon name="" />
                    </template>
                </q-input>
                <q-select
                    v-model="ContactStore.editor.type"
                    filled
                    map-options
                    emit-value
                    option-value="value"
                    :options="
                        [...MAP_ENUM_CONTACT].map((e) => ({
                            label: e[1].text,
                            value: e[1].value,
                        }))
                    "
                >
                    <template v-slot:before>
                        <q-icon name="" />
                    </template>
                </q-select>
            </q-card-section>

            <q-card-actions>
                <q-space></q-space>
                <q-btn
                    color="primary"
                    @click="
                        async () => {
                            await ContactStore.patch();
                            dialogPatch = false;
                        }
                    "
                    >保存</q-btn
                >
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script lang="ts" setup>
import { onMounted, ref, computed } from "vue";
import { cloneDeep, debounce } from "lodash";
import { MAP_ENUM_CONTACT, ENUM_CONTACT } from "qqlx-core";
import * as XLSX from "xlsx";

import { useNotifyStore } from "@/stores/quasar/notify";
import { useContactStore } from "@/stores/brand/contact";

const NotifyStore = useNotifyStore();

const ContactStore = useContactStore();
const filePicking = ref(null);
const filePickNext = async (file: File) => {
    if (!file) return;
    const reader = new FileReader(); // WebAPI
    reader.onload = async () => {
        try {
            const workbook = XLSX.read(reader.result, { type: "binary" });
            const sheet = workbook.Sheets["客户导入"];
            if (!sheet) throw new Error(`找不到表格 [客户导入] !`);
            const rowJsonList: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet);

            // 1.批量上传客户
            const uploading = [];
            for (let i in rowJsonList) {
                const row = rowJsonList[i];
                const schema = ContactStore.getSchema();
                schema.name = String(row["@客户名称"]);
                schema.address = String(row["@联系方式"] || "");
                schema.remark = String(row["@备注"] || "");
                uploading.push(schema);
            }
            ContactStore.listExcel = uploading;
        } catch (error) {
            NotifyStore.fail((error as Error).message);
        }
    };
    reader.readAsBinaryString(file);
};
const dialogPatch = ref(false);

// action
onMounted(async () => {
    await ContactStore.get(1);
});
</script>
