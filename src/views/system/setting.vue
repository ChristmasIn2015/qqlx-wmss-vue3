<template>
    <div class="text-h5 text-primary row items-center text-weight-bold q-pl-xs q-mb-sm">
        <span>系统设置</span>
        <dialog-intro />
    </div>

    <div class="row text-primary">
        <div class="col-3 q-pr-sm">
            <q-card>
                <q-card-section class="text-center q-pt-lg cursor-pointer" @click="userDialog = true">
                    <q-avatar size="108px">
                        <img :src="UserStore.userEditor?.avator || UserStore.wxAvatorDefault" />
                    </q-avatar>
                    <div class="text-h5 text-bold q-mt-md">{{ UserStore.userEditor?.nickname }}</div>
                    <div class="text-grey">{{ UserStore.userEditor?.phone || "尚未设置手机号" }}</div>
                </q-card-section>
                <q-separator></q-separator>
                <q-card-section>
                    <div class="text-h6 text-bold row items-center">
                        相关公司
                        <q-space></q-space>
                        <q-btn square padding="xs" flat color="primary" @click="showCorpDisabled = !showCorpDisabled">
                            <q-icon :name="showCorpDisabled ? 'visibility_off' : 'visibility'"></q-icon>
                            <q-tooltip class="text-body1">
                                {{ showCorpDisabled ? "隐藏最近删除的公司" : "查看最近删除的公司" }}
                            </q-tooltip>
                        </q-btn>
                    </div>

                    <q-card square v-for="corp in CorpStore.list.filter((e) => e.isDisabled === false)" class="q-my-md">
                        <q-card-section>
                            <div class="ellipsis row items-center" :class="corp._id === CorpStore.picked?._id ? 'text-bold' : 'text-grey'">
                                {{ corp.name }}
                                <q-space></q-space>
                                <q-badge v-if="corp._id === CorpStore.picked?._id" floating color="negative">当前公司</q-badge>
                                <q-btn v-else icon="more_horiz" padding="xs" flat>
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

                    <q-btn
                        flat
                        color="primary"
                        class="full-width"
                        @click="
                            () => {
                                CorpStore.setEditor();
                                dialogCorp = true;
                            }
                        "
                    >
                        <q-icon name="add" class="q-mr-xs"></q-icon>
                        创建公司
                    </q-btn>
                </q-card-section>
                <q-separator></q-separator>
                <q-card-section v-show="showCorpDisabled">
                    <div class="text-center text-grey" v-show="CorpStore.list.filter((e) => e.isDisabled === true).length === 0">暂无已删除的公司</div>
                    <q-card class="q-mb-md" v-for="corp in CorpStore.list.filter((e) => e.isDisabled === true)">
                        <q-card-section>
                            <div class="row items-center" :class="corp._id === CorpStore.picked?._id ? 'text-weight-bold' : 'text-grey'">
                                <q-badge v-if="corp._id === CorpStore.picked?._id" floating color="negative">当前公司</q-badge>
                                <span class="ellipsis text-through">{{ corp.name }}</span>
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
                                <div class="ellipsis row">
                                    您的角色：
                                    <q-space></q-space>
                                    <span v-if="corp.isRoot" class="text-bold">管理员</span>
                                    <span v-else>成员</span>
                                </div>
                            </div>
                        </q-card-section>
                    </q-card>
                </q-card-section>
            </q-card>
            <q-btn class="q-mt-md full-width" color="negative" @click="$router.push('/wmss/login')">
                <q-icon name="logout" class="q-mr-xs"></q-icon>
                切换用户
            </q-btn>
        </div>

        <div class="col-9">
            <q-card class="q-mb-sm">
                <q-card-section class="q-pb-none">
                    <div class="text-h6 text-bold row items-center">
                        公告
                        <q-space></q-space>
                        <q-btn icon="add" square padding="xs" flat color="negative">
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
                    <div class="text-grey">所有在 @{{ CorpStore.picked?.name }} 的成员都能看见公告</div>
                </q-card-section>
                <q-card-section>
                    <q-card class="no-shadow" square v-for="(announce, index) in AnnounceStore.list">
                        <q-card-section class="text-grey q-pa-none">
                            <div class="text-primary ellipsis row items-center">
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
                        </q-card-section>
                    </q-card>
                </q-card-section>
            </q-card>

            <q-card>
                <q-card-section class="q-pb-none">
                    <div class="text-h6 text-bold row items-center">
                        提货仓库

                        <q-btn square padding="xs" flat color="primary" @click="showWarehouseIsDisabled = !showWarehouseIsDisabled">
                            <q-icon :name="showWarehouseIsDisabled ? 'visibility_off' : 'visibility'"></q-icon>
                            <q-tooltip class="text-body1">
                                {{ showWarehouseIsDisabled ? "隐藏最近删除的提货仓库" : "查看最近删除的提货仓库" }}
                            </q-tooltip>
                        </q-btn>
                        <q-space></q-space>
                        <q-btn
                            icon="add"
                            square
                            padding="xs"
                            flat
                            color="negative"
                            @click="
                                () => {
                                    WarehouseStore.setEditor();
                                    warehouseDialog = true;
                                }
                            "
                        >
                        </q-btn>
                    </div>
                    <div class="text-grey">所有在 @{{ CorpStore.picked?.name }} 中的仓库</div>
                </q-card-section>
                <q-card-section>
                    <q-card class="no-shadow" v-for="warehouse in WarehouseStore.list.filter((e) => e.isDisabled === false)">
                        <q-card-section class="text-grey q-pa-none">
                            <div class="text-primary ellipsis text-weight-bold row items-center">
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
                            <div class="ellipsis">地址：{{ warehouse.address || "-" }}</div>
                        </q-card-section>
                    </q-card>

                    <div v-show="showWarehouseIsDisabled">
                        <q-card class="no-shadow" v-for="warehouse in WarehouseStore.list.filter((e) => e.isDisabled === true)">
                            <q-card-section class="text-grey q-pa-none">
                                <div class="text-weight-bold row items-center">
                                    <span class="ellipsis text-through">{{ warehouse.name }}</span>
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
                                <div class="ellipsis">地址：{{ warehouse.address || "-" }}</div>
                            </q-card-section>
                        </q-card>
                    </div>
                </q-card-section>
            </q-card>
        </div>
    </div>

    <!-- 个人中心弹窗 -->
    <!-- 个人中心弹窗 -->
    <q-dialog v-model="userDialog" persistent>
        <q-card class="w-400">
            <q-toolbar class="bg-primary text-white">
                <q-toolbar-title>个人信息</q-toolbar-title>

                <q-btn flat dense icon="close" v-close-popup />
            </q-toolbar>

            <q-separator />

            <q-card-section>
                <q-input filled label="用户昵称" class="q-mb-sm" v-model="UserStore.userEditor.nickname">
                    <template v-slot:append> </template>
                </q-input>
            </q-card-section>

            <q-card-actions>
                <q-space></q-space>

                <q-btn color="primary" @click="UserStore.patch()">保存</q-btn>
            </q-card-actions>
        </q-card>
    </q-dialog>

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
                <q-toolbar-title> 提货仓库 </q-toolbar-title>
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
</template>

<script lang="ts" setup>
import { useRouter } from "vue-router";
import { onMounted, ref, computed } from "vue";

import { ENUM_ORDER } from "qqlx-core";
import { getTime, getRangeDay, getRangeWeek, getRangeMonth, getRangeYear } from "qqlx-cdk";

import dialogIntro from "@/components/dialog-intro.vue";
import { useUserStore } from "@/stores/user/user";
import { useAnalysisStore } from "@/stores/wmss/analysis";
import { useCorpStore } from "@/stores/brand/corp";
import { useAnnounceStore } from "@/stores/brand/announce";
import { useWarehouseStore } from "@/stores/brand/warehouse";
import { useAreaStore } from "@/stores/brand/area";
import { useMarketScoAnalysisStore } from "@/stores/market/analysis";

const UserStore = useUserStore();
const userDialog = ref(false);

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
