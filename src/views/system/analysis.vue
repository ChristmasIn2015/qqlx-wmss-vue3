<template>
    <div class="q-pl-xs q-mb-sm">
        <div class="text-h5 text-primary text-weight-bold row items-center">
            <q-btn icon="arrow_back" fab flat style="margin-left: -14px" @click="$router.back()"></q-btn>
            <span>回款分析</span>
            <q-space></q-space>
        </div>
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
                { name: 'contactId', field: 'contactId', label: '', align: 'left', style: NotifyStore.cellStyle },
                { name: 'count', field: 'count', label: '', align: 'right', style: NotifyStore.cellStyle },
                { name: 'amountOrder', field: 'amountOrder', label: '', align: 'right', style: NotifyStore.cellStyle },
                { name: 'rate', field: 'rate', label: '', align: 'right', style: NotifyStore.cellStyle },
                { name: 'amountBookOfOrder', field: 'amountBookOfOrder', label: '', align: 'right', style: NotifyStore.cellStyle },
                { name: 'amountBookOfOrderRest', field: 'amountBookOfOrderRest', label: '', align: 'right', style: NotifyStore.cellStyle },
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
                    <q-th key="rate" class="text-right">
                        <span>收款进度</span>
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
                                AnalysisStore.sortValue = AnalysisStore.sortValue === MongodbSort.DES ? MongodbSort.ASC : MongodbSort.DES;
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
                    <q-td key="amountOrder" :props="props" :class="props.row.amountOrder <= 1 ? 'text-grey' : ''">
                        {{ props.row.amountOrder.toLocaleString("zh", { minimumFractionDigits: 2 }) }}
                    </q-td>
                    <q-td key="rate" :props="props">
                        <span v-if="props.row.amountOrder > 0"> {{ Math.ceil((props.row.amountBookOfOrder / props.row.amountOrder) * 100) }}% </span>
                    </q-td>
                    <q-td key="amountBookOfOrder" :props="props" class="text-grey">
                        {{ props.row.amountBookOfOrder.toLocaleString("zh", { minimumFractionDigits: 2 }) }}
                    </q-td>
                    <q-td key="amountBookOfOrderRest" :props="props" :class="props.row.amountBookOfOrderRest <= 1 ? 'text-grey' : 'text-negative text-bold'">
                        {{ props.row.amountBookOfOrderRest.toLocaleString("zh", { minimumFractionDigits: 2 }) }}
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
