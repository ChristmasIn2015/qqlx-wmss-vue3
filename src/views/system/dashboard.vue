<template>
    <div class="text-h5 text-primary row items-center text-weight-bold q-pl-xs q-mb-sm">
        <span>销售指标</span>
        <dialog-intro />
    </div>

    <div class="row q-pb-md">
        <q-card class="q-mx-xs q-mb-md text-body1 full-height text-primary col" square v-for="(time, index) in times">
            <q-card-section class="text-caption">
                <div class="text-h6 text-weight-bold">{{ time.text }}</div>
            </q-card-section>
            <q-separator />
            <q-card-section class="text-primary">
                <div class="row">
                    <span class="col">销售额</span>
                    <span class="col text-right"> {{ Number((time.calcu as any)[ENUM_ORDER.SALES]?.amount / 10000).toFixed(0) }} 万 </span>
                </div>
                <div class="row">
                    <span class="col">订单量</span>
                    <span class="col text-right"> {{ (time.calcu as any)[ENUM_ORDER.SALES]?.count }} 张 </span>
                </div>
            </q-card-section>

            <q-inner-loading :showing="AnalysisStore.loadding">
                <q-spinner-gears size="50px" color="primary" />
            </q-inner-loading>
            <q-tooltip class="text-body1">
                <div>
                    <span>{{ getTime(time.startTime).text }}</span>
                    ~
                    <span>{{ getTime(time.endTime).text }}</span>
                </div>
            </q-tooltip>
        </q-card>
    </div>

    <div class="row text-h5 text-weight-bold text-primary">
        <div class="col q-px-xs">公司列表</div>
        <div class="col q-px-xs">公告</div>
        <div class="col q-px-xs">仓库</div>
        <div class="col q-px-xs">货位</div>
    </div>
    <div class="row text-grey q-mb-md">
        <div class="col q-px-xs">您的数据都将保存在当前公司中</div>
        <div class="col q-px-xs">公司所有成员都将看到公告</div>
        <div class="col q-px-xs">订单打印时需要选择提货仓库</div>
        <div class="col q-px-xs">您可以看到某些仓库货位下的库存</div>
    </div>

    <div class="row text-primary">
        <div class="col q-pr-sm">
            <div class="q-mb-sm" v-for="corp in CorpStore.list.filter((e) => e.isDisabled === false)">
                <q-card square>
                    <q-card-section>
                        <div class="ellipsis row items-center" :class="corp._id === CorpStore.picked?._id ? 'text-weight-bold' : 'text-grey'">
                            <q-badge v-if="corp._id === CorpStore.picked?._id" floating color="negative">当前公司</q-badge>
                            {{ corp.name }}
                            <q-space></q-space>
                            <q-btn icon="more_horiz" padding="xs" flat>
                                <q-menu>
                                    <q-list>
                                        <q-item clickable v-close-popup @click="CorpStore.pick(corp)">
                                            <q-item-section>切换到这家</q-item-section>
                                        </q-item>
                                        <q-separator />
                                        <q-item
                                            clickable
                                            v-close-popup
                                            @click="
                                                () => {
                                                    CorpStore.setEditor(corp);
                                                    dialogCorp = true;
                                                }
                                            "
                                        >
                                            <q-item-section>修改</q-item-section>
                                        </q-item>
                                        <q-item clickable v-close-popup>
                                            <q-item-section class="text-negative" @click="CorpStore.delete(corp)">
                                                {{ corp.isDisabled ? "恢复" : "删除" }}
                                            </q-item-section>
                                        </q-item>
                                    </q-list>
                                </q-menu>
                            </q-btn>
                        </div>
                        <div class="text-grey">
                            <div class="ellipsis">公司地址：{{ corp.address || "-" }}</div>
                            <div class="ellipsis">联系方式：{{ corp.contact || "-" }}</div>
                            <div class="ellipsis row">
                                您的角色：
                                <q-space></q-space>
                                <span v-if="corp.isRoot" class="text-bold text-primary text-bold">管理员</span>
                                <span v-else>成员</span>
                            </div>
                            <div
                                class="ellipsis cursor-pointer row items-center"
                                v-if="corp._id === CorpStore.picked?._id"
                                @click="$router.push('/wmss/system/pay')"
                            >
                                有效期：
                                <q-space></q-space>
                                <span class="text-bold" :class="MarketScoAnalysisStore.isOverdue ? 'text-negative' : 'text-primary'"
                                    >{{ MarketScoAnalysisStore.message }}
                                </span>
                                <q-tooltip class="text-body1">点击购买</q-tooltip>
                            </div>
                        </div>
                    </q-card-section>
                </q-card>
            </div>
            <div class="row q-mb-sm">
                <q-btn
                    class="full-width"
                    color="primary"
                    @click="
                        () => {
                            CorpStore.setEditor();
                            dialogCorp = true;
                        }
                    "
                >
                    添加新公司
                </q-btn>
            </div>
            <div class="q-mb-sm">
                <q-btn class="full-width" color="white" text-color="negative" @click="showCorpDisabled = !showCorpDisabled">{{
                    showCorpDisabled ? "隐藏" : "最近删除"
                }}</q-btn>
            </div>
            <div v-show="showCorpDisabled">
                <div class="q-mb-sm" v-for="corp in CorpStore.list.filter((e) => e.isDisabled === true)">
                    <q-card :class="corp._id === CorpStore.picked?._id ? 'w-' : ''">
                        <q-card-section>
                            <div class="ellipsis row items-center" :class="corp._id === CorpStore.picked?._id ? 'text-weight-bold' : 'text-grey'">
                                <q-badge v-if="corp._id === CorpStore.picked?._id" floating color="negative">当前公司</q-badge>
                                {{ corp.name }}
                                <q-space></q-space>

                                <q-btn icon="more_horiz" padding="xs" flat>
                                    <q-menu>
                                        <q-item clickable v-close-popup>
                                            <q-item-section class="text-negative" @click="CorpStore.delete(corp)"> 恢复 </q-item-section>
                                        </q-item>
                                    </q-menu>
                                </q-btn>
                            </div>
                            <div class="text-grey">
                                <div class="ellipsis">联系方式：{{ corp.contact || "-" }}</div>
                                <div class="ellipsis">公司地址：{{ corp.address || "-" }}</div>
                                <div class="ellipsis">
                                    您的角色：
                                    <span v-if="corp.isRoot" class="text-bold text-negative">管理员</span>
                                    <span v-else>成员</span>
                                </div>
                            </div>
                        </q-card-section>
                    </q-card>
                </div>
            </div>
        </div>
        <div class="col q-pr-sm">
            <div class="q-mb-sm" v-for="(announce, index) in AnnounceStore.list">
                <div class="col-10">
                    <q-card square>
                        <q-card-section class="text-grey">
                            <div class="text-primary text-bold ellipsis row items-center">
                                {{ announce.content }}
                                <q-space></q-space>
                                <q-btn icon="more_horiz" padding="xs" flat>
                                    <q-menu>
                                        <q-item clickable>
                                            <q-item-section>
                                                修改
                                                <q-menu>
                                                    <q-card>
                                                        <q-card-section class="text-body1 q-pb-none">修改公告</q-card-section>
                                                        <q-card-section>
                                                            <q-input
                                                                dense
                                                                filled
                                                                borderless
                                                                type="textarea"
                                                                input-class="text-body1"
                                                                placeholder="请输入公告内容"
                                                                v-model="announce.content"
                                                            />
                                                        </q-card-section>
                                                        <q-card-actions>
                                                            <q-space></q-space>
                                                            <q-btn color="primary" v-close-popup @click="() => AnnounceStore.patch(announce)">确定</q-btn>
                                                        </q-card-actions>
                                                    </q-card>
                                                </q-menu>
                                            </q-item-section>
                                        </q-item>
                                        <q-item clickable v-close-popup>
                                            <q-item-section class="text-negative" @click="AnnounceStore.delete(announce)">删除</q-item-section>
                                        </q-item>
                                    </q-menu>
                                </q-btn>
                            </div>
                            <div class="ellipsis">公司：{{ CorpStore.picked?.name }}</div>
                        </q-card-section>
                    </q-card>
                </div>
            </div>
            <div class="row q-mb-sm">
                <q-btn class="full-width" color="primary">
                    添加新公告
                    <q-menu>
                        <q-card>
                            <q-card-section class="text-body1 q-pb-none">添加公告</q-card-section>
                            <q-card-section>
                                <q-input
                                    dense
                                    filled
                                    borderless
                                    type="textarea"
                                    input-class="text-body1"
                                    placeholder="请输入公告内容"
                                    v-model="AnnounceStore.editor.content"
                                />
                            </q-card-section>
                            <q-card-actions>
                                <q-space></q-space>
                                <q-btn color="primary" v-close-popup @click="() => AnnounceStore.post()">确定</q-btn>
                            </q-card-actions>
                        </q-card>
                    </q-menu>
                </q-btn>
            </div>
        </div>
        <div class="col q-pr-sm">
            <div class="q-mb-sm" v-for="warehouse in WarehouseStore.list.filter((e) => e.isDisabled === false)">
                <q-card>
                    <q-card-section class="text-grey">
                        <div class="text-primary ellipsis text-weight-bold row items-center">
                            <q-badge v-if="warehouse._id === CorpStore.picked?._id" floating color="negative">已选择</q-badge>
                            {{ warehouse.name }}
                            <q-space></q-space>

                            <q-btn icon="more_horiz" padding="xs" flat>
                                <q-menu>
                                    <q-item
                                        clickable
                                        v-close-popup
                                        @click="
                                            () => {
                                                WarehouseStore.setEditor(warehouse);
                                                warehouseDialog = true;
                                            }
                                        "
                                    >
                                        <q-item-section>修改</q-item-section>
                                    </q-item>
                                    <q-item clickable v-close-popup>
                                        <q-item-section
                                            class="text-negative"
                                            @click="
                                                () => {
                                                    WarehouseStore.setEditor(warehouse);
                                                    WarehouseStore.editor.isDisabled = !WarehouseStore.editor.isDisabled;
                                                    WarehouseStore.patch();
                                                }
                                            "
                                        >
                                            删除
                                        </q-item-section>
                                    </q-item>
                                </q-menu>
                            </q-btn>
                        </div>
                        <div class="ellipsis">仓库地址：{{ warehouse.address || "-" }}</div>
                        <div class="ellipsis">公司：{{ CorpStore.picked?.name }}</div>
                    </q-card-section>
                </q-card>
            </div>
            <div class="q-mb-sm">
                <q-btn
                    class="full-width"
                    color="primary"
                    @click="
                        () => {
                            WarehouseStore.setEditor();
                            warehouseDialog = true;
                        }
                    "
                >
                    添加新仓库
                </q-btn>
            </div>
            <div class="row q-mb-sm">
                <q-btn class="full-width" color="white" text-color="negative" @click="showWarehouseIsDisabled = !showWarehouseIsDisabled">
                    {{ showWarehouseIsDisabled ? "隐藏" : "最近删除" }}
                </q-btn>
            </div>
            <div v-show="showWarehouseIsDisabled">
                <div class="q-mb-sm" v-for="warehouse in WarehouseStore.list.filter((e) => e.isDisabled === true)">
                    <q-card>
                        <q-card-section class="text-grey">
                            <div class="ellipsis text-weight-bold row items-center">
                                <q-badge v-if="warehouse._id === CorpStore.picked?._id" floating color="negative">已选择</q-badge>
                                {{ warehouse.name }}
                                <q-space></q-space>
                                <q-btn icon="more_horiz" padding="xs" flat>
                                    <q-menu>
                                        <q-item clickable v-close-popup>
                                            <q-item-section
                                                class="text-negative"
                                                @click="
                                                    () => {
                                                        WarehouseStore.setEditor(warehouse);
                                                        WarehouseStore.editor.isDisabled = !WarehouseStore.editor.isDisabled;
                                                        WarehouseStore.patch();
                                                    }
                                                "
                                            >
                                                恢复
                                            </q-item-section>
                                        </q-item>
                                    </q-menu>
                                </q-btn>
                            </div>
                            <div class="ellipsis">仓库地址：{{ warehouse.address || "-" }}</div>
                            <div class="ellipsis">公司：{{ CorpStore.picked?.name }}</div>
                        </q-card-section>
                    </q-card>
                </div>
            </div>
        </div>
        <div class="col q-pr-sm">
            <div class="q-mb-sm" v-for="area in AreaStore.list.filter((e) => e.isDisabled === false)">
                <q-card>
                    <q-card-section class="text-grey">
                        <div class="text-primary ellipsis text-weight-bold row items-center">
                            {{ String(area.name).split("@")[0] }}
                            <q-space></q-space>

                            <q-btn icon="more_horiz" padding="xs" flat>
                                <q-menu>
                                    <q-item
                                        clickable
                                        v-close-popup
                                        @click="
                                            () => {
                                                AreaStore.setEditor(area);
                                                areaDialog = true;
                                            }
                                        "
                                    >
                                        <q-item-section>修改</q-item-section>
                                    </q-item>
                                    <q-item clickable v-close-popup>
                                        <q-item-section
                                            class="text-negative"
                                            @click="
                                                () => {
                                                    AreaStore.setEditor(area);
                                                    AreaStore.editor.isDisabled = !AreaStore.editor.isDisabled;
                                                    AreaStore.patch();
                                                }
                                            "
                                        >
                                            删除
                                        </q-item-section>
                                    </q-item>
                                </q-menu>
                            </q-btn>
                        </div>
                        <div class="ellipsis">{{ area.desc || "-" }}</div>
                        <div class="ellipsis">仓库：{{ area.joinWarehouse?.name || "-" }}</div>
                        <div class="ellipsis">公司：{{ CorpStore.picked?.name }}</div>
                    </q-card-section>
                </q-card>
            </div>
            <div class="q-mb-sm">
                <q-btn
                    class="full-width"
                    color="primary"
                    @click="
                        () => {
                            AreaStore.setEditor();
                            areaDialog = true;
                        }
                    "
                >
                    添加新货位
                </q-btn>
            </div>
            <div class="q-mb-sm">
                <q-btn class="full-width" color="white" text-color="negative" @click="showAreaIsDisabled = !showAreaIsDisabled">
                    {{ showAreaIsDisabled ? "隐藏" : "最近删除" }}
                </q-btn>
            </div>
            <div v-show="showAreaIsDisabled">
                <div class="row q-mb-sm" v-for="area in AreaStore.list.filter((e) => e.isDisabled === true)">
                    <q-card>
                        <q-card-section class="text-grey">
                            <div class="ellipsis text-weight-bold row items-center">
                                {{ area.name }}
                                <q-space></q-space>

                                <q-btn icon="more_horiz" padding="xs" flat>
                                    <q-menu>
                                        <q-item clickable v-close-popup>
                                            <q-item-section
                                                class="text-negative"
                                                @click="
                                                    () => {
                                                        AreaStore.setEditor(area);
                                                        AreaStore.editor.isDisabled = !AreaStore.editor.isDisabled;
                                                        AreaStore.patch();
                                                    }
                                                "
                                            >
                                                恢复
                                            </q-item-section>
                                        </q-item>
                                    </q-menu>
                                </q-btn>
                            </div>
                            <div class="ellipsis">{{ area.desc || "-" }}</div>
                            <div class="ellipsis">仓库：{{ area.joinWarehouse?.name || "-" }}</div>
                            <div class="ellipsis">公司：{{ CorpStore.picked?.name }}</div>
                        </q-card-section>
                    </q-card>
                </div>
            </div>
        </div>
    </div>

    <q-dialog v-model="dialogCorp">
        <q-card class="w-400">
            <q-toolbar>
                <q-toolbar-title>公司</q-toolbar-title>
                <q-btn dense flat icon="close" v-close-popup></q-btn>
            </q-toolbar>
            <q-separator />

            <q-card-section>
                <q-input filled label="公司名称" class="q-mb-sm" v-model="CorpStore.editor.name">
                    <template v-slot:before>
                        <q-icon name="person" />
                    </template>
                </q-input>

                <q-input filled label="联系方式" class="q-mb-sm" v-model="CorpStore.editor.contact">
                    <template v-slot:before>
                        <q-icon name="phone" />
                    </template>
                </q-input>

                <q-input filled label="公司地址" class="q-mb-sm" v-model="CorpStore.editor.address">
                    <template v-slot:before>
                        <q-icon name="event" />
                    </template>
                </q-input>
            </q-card-section>

            <q-card-actions>
                <q-space></q-space>
                <q-btn
                    color="primary"
                    push
                    square
                    @click="
                        async () => {
                            if (CorpStore.editor._id) await CorpStore.patch();
                            else await CorpStore.post();
                            dialogCorp = false;
                        }
                    "
                >
                    {{ CorpStore.editor._id ? "保存" : "新增" }}
                </q-btn>
            </q-card-actions>
        </q-card>
    </q-dialog>

    <q-dialog v-model="warehouseDialog">
        <q-card class="w-400">
            <q-toolbar class="bg-primary text-white">
                <q-toolbar-title>
                    <q-badge rounded color="pink-6" class="shadow-2 q-mr-sm"> </q-badge>
                    提货仓库
                </q-toolbar-title>
                <q-btn dense flat icon="close" v-close-popup></q-btn>
            </q-toolbar>

            <q-card-section>
                <q-input filled label="请输入仓库名称" v-model="WarehouseStore.editor.name" color="primary" class="q-mb-md" />
                <q-input filled label="请输入地址" v-model="WarehouseStore.editor.address" color="primary" />
            </q-card-section>

            <q-card-actions>
                <q-space></q-space>
                <q-btn v-if="WarehouseStore.editor._id" color="primary" v-close-popup @click="WarehouseStore.patch()"> 保存 </q-btn>
                <q-btn v-else color="primary" v-close-popup @click="WarehouseStore.post()"> 新增 </q-btn>
            </q-card-actions>
        </q-card>
    </q-dialog>

    <q-dialog v-model="areaDialog">
        <q-card class="w-400">
            <q-toolbar class="bg-primary text-white">
                <q-toolbar-title>仓库货位 </q-toolbar-title>
                <q-btn dense flat icon="close" v-close-popup></q-btn>
            </q-toolbar>

            <q-card-section>
                <q-select
                    square
                    filled
                    emit-value
                    map-options
                    label="仓库"
                    color="purple"
                    class="q-mb-md"
                    option-value="_id"
                    option-label="name"
                    placeholder="请选择仓库"
                    :options="WarehouseStore.list.filter((e) => e.isDisabled === false)"
                    v-model="AreaStore.editor.houseId"
                >
                </q-select>
                <q-input filled label="货位名称" v-model="AreaStore.editor.name" color="primary" class="q-mb-md" />
                <q-input filled label="货位描述" v-model="AreaStore.editor.desc" color="primary" />
            </q-card-section>

            <q-card-actions>
                <q-space></q-space>
                <q-btn v-if="AreaStore.editor._id" color="primary" v-close-popup @click="AreaStore.patch()"> 保存 </q-btn>
                <q-btn v-else color="primary" v-close-popup @click="AreaStore.post()"> 新增 </q-btn>
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script lang="ts" setup>
import { useRouter } from "vue-router";
import { onMounted, ref, computed } from "vue";

import { ENUM_ORDER } from "qqlx-core";
import { getTime, getRangeDay, getRangeWeek, getRangeMonth, getRangeYear } from "qqlx-cdk";

import dialogIntro from "@/components/dialog-intro.vue";
import { useAnalysisStore } from "@/stores/wmss/analysis";
import { useCorpStore } from "@/stores/brand/corp";
import { useAnnounceStore } from "@/stores/brand/announce";
import { useWarehouseStore } from "@/stores/brand/warehouse";
import { useAreaStore } from "@/stores/brand/area";
import { useMarketScoAnalysisStore } from "@/stores/market/analysis";

const CorpStore = useCorpStore();
const dialogCorp = ref(false);
const showCorpDisabled = ref(false);
const AnnounceStore = useAnnounceStore();

const WarehouseStore = useWarehouseStore();
const warehouseDialog = ref(false);
const showWarehouseIsDisabled = ref(false);

const AreaStore = useAreaStore();
const areaDialog = ref(false);
const showAreaIsDisabled = ref(false);

const AnalysisStore = useAnalysisStore();
const MarketScoAnalysisStore = useMarketScoAnalysisStore();

const time1 = ref({ ...getRangeDay(), text: "今日", calcu: {} });
const time2 = ref({ ...getRangeMonth(), text: "本月", calcu: {} });
const time3 = ref({ ...getRangeYear(), text: "本年", calcu: {} });
const time4 = ref({ startTime: new Date("2020/01/01").getTime(), endTime: Date.now() + 86400000, text: "全部", calcu: {} });
const times = ref([time1.value, time2.value, time3.value, time4.value]);
onMounted(async () => {
    times.value = await AnalysisStore.set(times.value as any);
});
</script>

<style scoped lang="scss"></style>
