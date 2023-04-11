<template>
    <!-- 公司 -->
    <!-- 公司 -->
    <!-- 公司 -->
    <!-- 公司 -->
    <div class="q-pl-xs q-mb-md">
        <div class="text-h5 text-primary text-weight-bold row items-center">
            <q-btn icon="arrow_back" fab flat style="margin-left: -12px" @click="$router.push('/wmss')"></q-btn>
            <span>公司</span>
        </div>
        <div class="text-option text-primary">
            当前使用数据，如订单信息、库存信息等，都将会保存在
            <span class="text-weight-bold">@{{ CorpStore.picked?.name }}</span>
            中， 您可以
            <q-btn
                push
                square
                outline
                color="negative"
                @click="
                    () => {
                        CorpStore.setEditor();
                        dialogCorp = true;
                    }
                "
            >
                添加
            </q-btn>
            属于您的新公司。您也可以查看
            <q-btn push square color="primary" @click="disableCorp = !disableCorp"> {{ disableCorp ? "返回" : "最近删除" }} </q-btn>
        </div>
    </div>

    <div class="row">
        <q-card
            v-for="corp in CorpStore.list.filter((e) => e.isDisabled === disableCorp)"
            class="w-200 q-mr-md q-mb-md"
            :class="corp._id === CorpStore.picked?._id ? 'w-325' : ''"
        >
            <q-card-section>
                <div class="text-h6 ellipsis" :class="corp._id === CorpStore.picked?._id ? 'text-weight-bold' : 'text-grey'">
                    {{ corp.name }}
                    <q-badge v-if="corp.isRoot" floating color="negative">管理员</q-badge>
                    <q-badge v-else floating color="grey">成员</q-badge>
                </div>
                <div class="text-grey ellipsis">{{ corp.contact || "-" }}</div>
                <div class="text-grey ellipsis">{{ corp.address || "-" }}</div>
            </q-card-section>
            <q-card-actions>
                <q-space></q-space>
                <q-btn icon="more_horiz" flat>
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
            </q-card-actions>
        </q-card>
    </div>

    <!-- 公告 -->
    <!-- 公告 -->
    <!-- 公告 -->
    <!-- 公告 -->
    <div class="q-pl-xs q-mb-lg q-mt-lg text-primary">
        <div class="text-h5 text-weight-bold">公告</div>
        <div class="text-option">
            所有
            <span class="text-weight-bold">@{{ CorpStore.picked?.name }}</span>
            中的成员都将会看到您发布的公告， 您可以
            <q-btn square color="negative" outline>
                添加
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
            公告
        </div>
        <div class="text-option" v-if="AnnounceStore.list.length === 0">当前暂无公告。</div>
    </div>

    <div class="shadow-1">
        <div v-for="(announce, index) in AnnounceStore.list">
            <q-card class="no-shadow" square>
                <q-card-section class="row">
                    <div class="col ellipsis">{{ announce.content }}</div>
                    <div class="col text-right">
                        <a class="q-ml-md text-primary cursor-pointer">
                            编辑

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
                        </a>
                        <a class="q-ml-md text-negative cursor-pointer" @click="AnnounceStore.delete(announce)"> 删除 </a>
                    </div>
                </q-card-section>
            </q-card>
            <q-separator></q-separator>
        </div>
    </div>

    <q-dialog v-model="dialogCorp" persistent>
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
</template>

<script lang="ts" setup>
import { onMounted, ref, computed } from "vue";

import { useCorpStore } from "@/stores/brand/corp";
import { useAnnounceStore } from "@/stores/brand/announce";

const CorpStore = useCorpStore();
const dialogCorp = ref(false);
const disableCorp = ref(false);

const AnnounceStore = useAnnounceStore();
const announceContent = ref("");

onMounted(() => {
    AnnounceStore.get();
});
</script>

<style scoped lang="scss"></style>
