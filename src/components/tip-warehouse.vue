<template>
    <div class="q-pl-xs q-mt-lg q-mb-md">
        <div class="text-h6 text-primary row items-center">
            <span>
                系统如何
                <span class="text-bold text-h4">自动计算</span>
                剩余库存？
            </span>
            <q-space></q-space>
        </div>
        <div class="text-option text-primary"></div>
    </div>

    <div class="row">
        <div class="col q-pr-md">
            <q-card class="full-height column">
                <q-card-section class="text-h6 text-primary row">
                    <div class="col">如冷轧板 1.0*1250*2500</div>
                    <div class="col text-right"><q-badge color="grey">普通商品</q-badge></div>
                </q-card-section>
                <q-separator></q-separator>
                <q-card-section>
                    <div></div>
                    <div class="row">
                        <div class="col-8">入库</div>
                        <div class="col text-right">+100 张</div>
                    </div>
                    <div class="row">
                        <div class="col-8">加工</div>
                        <div class="col text-right text-cyan">+100 张</div>
                    </div>
                    <div class="row">
                        <div class="col-8">发货</div>
                        <div class="col text-right text-pink-6">-10 张</div>
                    </div>
                </q-card-section>
                <q-space></q-space>
                <q-separator></q-separator>
                <q-card-section>
                    <div class="row">
                        <div class="col-8">自动计算剩余</div>
                        <div class="col text-right">290 张</div>
                    </div>
                </q-card-section>
            </q-card>
        </div>
        <div class="col q-pr-md">
            <q-card class="full-height column">
                <q-card-section class="text-h6 text-primary row">
                    <div class="col">如冷轧卷 1.0*1250*C</div>
                    <div class="col text-right"><q-badge color="primary">大件商品</q-badge></div>
                </q-card-section>
                <q-separator></q-separator>
                <q-card-section>
                    <div></div>
                    <div class="row">
                        <div class="col-8">入库</div>
                        <div class="col text-right">卷A +10 吨</div>
                    </div>
                    <div class="row">
                        <div class="col-8">入库</div>
                        <div class="col text-right">卷B +20 吨</div>
                    </div>
                    <div class="row">
                        <div class="col-8">领料</div>
                        <div class="col text-right text-orange">卷A -5 吨</div>
                    </div>
                    <div class="row text-grey">注意：我们采用了领料这个步骤进行下一步的加工、发货</div>
                </q-card-section>
                <q-space></q-space>
                <q-separator></q-separator>
                <q-card-section>
                    <div class="row">
                        <div class="col">自动计算剩余</div>
                        <div class="col text-right">卷A 5吨 / 卷B 20吨</div>
                    </div>
                </q-card-section>
            </q-card>
        </div>
        <div class="col q-pr-md"></div>
        <div class="col q-pr-md"></div>
        <div class="col"></div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
</script>
