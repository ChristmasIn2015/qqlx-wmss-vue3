<template>
    <div class="q-pl-xs q-mb-md">
        <div class="text-h5 text-primary text-weight-bold row items-center">
            <q-btn icon="arrow_back" fab flat style="margin-left: -12px" @click="$router.back()"></q-btn>
            <span>操作明细</span>
            <q-space></q-space>
        </div>
        <div class="text-option text-primary q-my-sm">您可以在此看到订单的操作记录</div>
    </div>

    <q-card square>
        <q-table
            style="min-height: 660px"
            separator="cell"
            row-key="_id"
            dense
            :rows="ClueStore.list"
            :rows-per-page-options="[0]"
            :columns="[
                { name: 'content', field: 'content', label: '操作', align: 'left' },
                { name: 'timeCreateString', field: 'timeCreateString', label: '创建时间', style: NotifyStore.cellStyle },
            ]"
        >
            <template v-slot:header="props">
                <q-tr :props="props">
                    <q-th :props="props" key="content">
                        <q-input square filled dense clearable placeholder="关键词搜索" v-model="ClueStore.search.content" @blur="ClueStore.get(1)" />
                    </q-th>
                    <q-th :props="props" key="timeCreateString">
                        <span>时间</span>
                    </q-th>
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
                    v-model="ClueStore.page.page"
                    :max-pages="10"
                    :max="Math.ceil(ClueStore.total / ClueStore.page.pageSize)"
                    @update:model-value="(value) => ClueStore.get(value)"
                />
                <q-space></q-space>
                <span>共 {{ ClueStore.total }} 项</span>
            </template>
        </q-table>

        <q-inner-loading :showing="ClueStore.loadding">
            <q-spinner-gears size="50px" color="primary" />
        </q-inner-loading>
    </q-card>
</template>

<script lang="ts" setup>
import * as XLSX from "xlsx";
import { MongodbSort } from "qqlx-cdk";
import { cloneDeep, debounce } from "lodash";
import { onMounted, watch, ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";

import { ENUM_LAYOUT_CABINET } from "qqlx-core";

import { useNotifyStore } from "@/stores/quasar/notify";
import { useClueStore } from "@/stores/wmss/clue";

const route = useRoute();
const NotifyStore = useNotifyStore();
const ClueStore = useClueStore();

// action
onMounted(async () => {
    // 根据路由进行搜索
    const { content } = route.query;
    content && (ClueStore.search.content = content as string);
    await ClueStore.get(1);
});
</script>

<style lang="sass"></style>
