<template>
    <div class="q-pl-xs q-mb-md">
        <div class="text-h5 text-primary text-weight-bold row items-center">
            <q-btn icon="arrow_back" fab flat style="margin-left: -12px" @click="$router.back()"></q-btn>
            <span>回款分析</span>
            <q-space></q-space>
        </div>
        <div class="text-option text-primary q-my-sm"></div>
    </div>

    <q-card square>
        <q-table
            style="min-height: 660px"
            separator="cell"
            row-key="_id"
            dense
            :rows="AnalysisStore.listContact"
            :rows-per-page-options="[0]"
            :columns="[
                { name: 'contactId', field: 'contactId', label: '', align: 'left' },
                { name: 'count', field: 'count', label: '', align: 'right' },
                { name: 'amountOrder', field: 'amountOrder', label: '', align: 'right' },
                { name: 'amountBookOfOrder', field: 'amountBookOfOrder', label: '', align: 'right' },
                { name: 'amountBookOfOrderRest', field: 'amountBookOfOrderRest', label: '', align: 'right' },
            ]"
        >
            <template v-slot:header="props">
                <q-tr :props="props">
                    <q-th :props="props" key="contactId">
                        <q-btn class="q-px-sm" flat square color="negative" style="margin-left: -6px" @click="contactDialog = true">
                            {{ contactPicked._id ? contactPicked.name : "点击筛选客户" }}
                        </q-btn>
                        <q-btn
                            v-if="contactPicked._id"
                            flat
                            square
                            padding="xs"
                            color="negative"
                            @click="
                                () => {
                                    contactPicked = ContactStore.getSchema();
                                    AnalysisStore.search.contactId = '';
                                    AnalysisStore.getContactAnalysis(1);
                                }
                            "
                        >
                            <q-icon name="close"></q-icon>
                        </q-btn>
                    </q-th>

                    <q-th
                        key="count"
                        class="text-right cursor-pointer"
                        :class="{ 'text-negative': AnalysisStore.sortKey === 'count' }"
                        @click="
                            () => {
                                AnalysisStore.sortKey = 'count';
                                AnalysisStore.sortValue = AnalysisStore.sortValue === MongodbSort.DES ? MongodbSort.ASC : MongodbSort.DES;
                                AnalysisStore.getContactAnalysis(1);
                            }
                        "
                    >
                        <span>所有订单数量</span>
                        <q-icon :name="AnalysisStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
                    </q-th>
                    <q-th
                        key="amountOrder"
                        class="text-right cursor-pointer"
                        :class="{ 'text-negative': AnalysisStore.sortKey === 'amountOrder' }"
                        @click="
                            () => {
                                AnalysisStore.sortKey = 'amountOrder';
                                AnalysisStore.sortValue = AnalysisStore.sortValue === MongodbSort.DES ? MongodbSort.ASC : MongodbSort.DES;
                                AnalysisStore.getContactAnalysis(1);
                            }
                        "
                    >
                        <span>累计应收款</span>
                        <q-icon :name="AnalysisStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
                    </q-th>
                    <q-th
                        key="amountBookOfOrder"
                        class="text-right cursor-pointer"
                        :class="{ 'text-negative': AnalysisStore.sortKey === 'amountBookOfOrder' }"
                        @click="
                            () => {
                                AnalysisStore.sortKey = 'amountBookOfOrder';
                                AnalysisStore.sortValue = AnalysisStore.sortValue === MongodbSort.DES ? MongodbSort.ASC : MongodbSort.DES;
                                AnalysisStore.getContactAnalysis(1);
                            }
                        "
                    >
                        <span>累计已收款</span>
                        <q-icon :name="AnalysisStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
                    </q-th>
                    <q-th
                        key="amountBookOfOrderRest"
                        class="text-right cursor-pointer"
                        :class="{ 'text-negative': AnalysisStore.sortKey === 'amountBookOfOrderRest' }"
                        @click="
                            () => {
                                AnalysisStore.sortKey = 'amountBookOfOrderRest';
                                AnalysisStore.sortValue = MongodbSort.DES ? MongodbSort.ASC : MongodbSort.DES;
                                AnalysisStore.getContactAnalysis(1);
                            }
                        "
                    >
                        <span>还应收款</span>
                        <q-icon :name="AnalysisStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
                    </q-th>
                </q-tr>
            </template>

            <template v-slot:body="props">
                <q-tr>
                    <q-td key="contactId" :props="props">{{ props.row.joinContact?.name }} </q-td>
                    <q-td key="count" :props="props">{{ props.row.count }} </q-td>
                    <q-td key="amountOrder" :props="props">{{ props.row.amountOrder.toFixed(2) }} </q-td>
                    <q-td key="amountBookOfOrder" :props="props">{{ props.row.amountBookOfOrder.toFixed(2) }} </q-td>
                    <q-td key="amountBookOfOrderRest" :props="props">{{ props.row.amountBookOfOrderRest.toFixed(2) }} </q-td>
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
                    v-model="AnalysisStore.page.page"
                    :max-pages="10"
                    :max="Math.ceil(AnalysisStore.total / AnalysisStore.page.pageSize)"
                    @update:model-value="(value) => AnalysisStore.getContactAnalysis(value)"
                />
                <q-space></q-space>
                <span>共 {{ AnalysisStore.total }} 项</span>
            </template>
        </q-table>

        <q-inner-loading :showing="AnalysisStore.loadding">
            <q-spinner-gears size="50px" color="primary" />
        </q-inner-loading>
    </q-card>

    <q-dialog v-model="contactDialog" position="bottom">
        <q-card class="w-1000">
            <q-toolbar class="bg-primary text-white">
                <q-toolbar-title class="text-weight-bold">通讯录</q-toolbar-title>
                <q-btn dense flat icon="close" v-close-popup></q-btn>
            </q-toolbar>
            <q-separator class="q-mb-md" />

            <list-contact
                @pick="
                    (value) => {
                        contactPicked = value;
                        AnalysisStore.search.contactId = value;
                        AnalysisStore.getContactAnalysis(1);
                    }
                "
            ></list-contact>
        </q-card>
    </q-dialog>
</template>

<script lang="ts" setup>
import * as XLSX from "xlsx";
import { MongodbSort } from "qqlx-cdk";
import { cloneDeep, debounce } from "lodash";
import { onMounted, watch, ref, computed } from "vue";
import { ENUM_LAYOUT_CABINET } from "qqlx-core";

import listContact from "@/components/list-contact.vue";
import { useNotifyStore } from "@/stores/quasar/notify";
import { useAnalysisStore } from "@/stores/wmss/analysis";
import { useContactStore } from "@/stores/brand/contact";

const NotifyStore = useNotifyStore();
const AnalysisStore = useAnalysisStore();
const ContactStore = useContactStore();

const contactPicked = ref(ContactStore.getSchema());
const contactDialog = ref(false);
onMounted(async () => {
    AnalysisStore.search.contactId = "";
    await AnalysisStore.getContactAnalysis(1);
});
</script>

<style lang="sass"></style>
