<template>
	<div class="q-pt-md q-pb-lg">
		<div class="text-h5 text-white text-weight-bold">货架</div>
		<div class="text-white q-pt-sm">
			<div>1.您可以根据不同需求，设置不同的货架；如 “钢卷” “板材” “管材” 等您需要的钢材分类；</div>
			<div>2.您可以在货架中添加商品，它们将用于制定采购计划、销售开单、内部领料、发货编辑等；</div>
			<div>3.货架中的商品，其库存将会在 “发货” “入库” “领料” “加工” 后，自动计算，您可以点击明细查看详细库存变动情况；</div>
		</div>
	</div>

	<div class="row">
		<q-card v-for="cabinet in CabinetStore.cabinetList" class="w-200 q-mr-sm q-mb-sm shadow-15">
			<q-toolbar>
				<q-toolbar-title>
					{{ cabinet.name }}
				</q-toolbar-title>

				<q-btn dense icon="more_vert" flat>
					<q-menu>
						<q-list>
							<q-item
								clickable
								v-close-popup
								@click="
									() => {
										CabinetStore.setSchema(cabinet);
										dialogCabinet = true;
									}
								"
							>
								<q-item-section>修改</q-item-section>
							</q-item>
							<q-separator />
							<q-item clickable v-close-popup>
								<q-item-section class="text-negative" @click="deleteConfirm(cabinet._id)">删除</q-item-section>
							</q-item>
						</q-list>
					</q-menu>
				</q-btn>
			</q-toolbar>
			<q-card-section class="text-grey q-pt-none">
				<div class="row">
					<div class="col">单位</div>
					<div class="col text-right">{{ cabinet.unit }}</div>
				</div>
				<div class="row">
					<div class="col">商品开单</div>
					<div class="col text-right" :class="CabinetStore.getLayoutChinese(cabinet.layout)?.tip ? 'text-indigo' : ''">
						{{ CabinetStore.getLayoutChinese(cabinet.layout)?.text }}

						<q-tooltip v-if="CabinetStore.getLayoutChinese(cabinet.layout)?.tip" class="text-body1">
							{{ CabinetStore.getLayoutChinese(cabinet.layout)?.tip }}
						</q-tooltip>
					</div>
				</div>
				<div class="row">
					<div class="col">过磅公式</div>
					<div class="col text-right" :class="CabinetStore.getFormulaChinese(cabinet.formula)?.tip ? 'text-indigo' : ''">
						{{ CabinetStore.getFormulaChinese(cabinet.formula)?.text }}
						<q-tooltip v-if="CabinetStore.getFormulaChinese(cabinet.formula)?.tip" class="text-body1">
							{{ CabinetStore.getFormulaChinese(cabinet.formula)?.tip }}
						</q-tooltip>
					</div>
				</div>
			</q-card-section>
		</q-card>
	</div>

	<div class="q-pt-xl q-pb-lg">
		<div class="text-h5 text-indigo text-weight-bold">快速添加</div>
		<div class="text-grey q-pt-sm">
			<span>以下是常用的钢材货架，您可以快速设置为您的货架。</span>
			<span
				>您也可以直接
				<q-btn
					push
					glossy
					square
					class="q-mx-sm"
					color="indigo"
					@click="
						() => {
							CabinetStore.setSchema();
							dialogCabinet = true;
						}
					"
				>
					添加
				</q-btn>
				货架</span
			>
		</div>
	</div>

	<div class="row">
		<q-card v-for="cabinet in CabinetStore.cabinetListRecommand" class="w-200 q-mr-sm q-mb-sm bg-grey-2">
			<q-toolbar>
				<q-toolbar-title>
					{{ cabinet.name }}
				</q-toolbar-title>
				<a
					class="text-indigo text-weight-bold cursor-pointer"
					@click="
						() => {
							CabinetStore.setSchema(cabinet);
							CabinetStore.post(); //async
						}
					"
				>
					快速添加
				</a>
			</q-toolbar>
			<q-card-section class="text-grey q-pt-none">
				<div class="row">
					<div class="col">单位</div>
					<div class="col text-right">{{ cabinet.unit }}</div>
				</div>
				<div class="row">
					<div class="col">商品开单</div>
					<div class="col text-right">
						{{ CabinetStore.getLayoutChinese(cabinet.layout)?.text }}
						<q-tooltip v-if="CabinetStore.getLayoutChinese(cabinet.layout)?.tip" class="text-body1">
							{{ CabinetStore.getLayoutChinese(cabinet.layout)?.tip }}
						</q-tooltip>
					</div>
				</div>
				<div class="row">
					<div class="col">过磅公式</div>
					<div class="col text-right">
						{{ CabinetStore.getFormulaChinese(cabinet.formula)?.text }}

						<q-tooltip v-if="CabinetStore.getFormulaChinese(cabinet.formula)?.tip" class="text-body1">
							{{ CabinetStore.getFormulaChinese(cabinet.formula)?.tip }}
						</q-tooltip>
					</div>
				</div>
			</q-card-section>
		</q-card>
	</div>

	<q-dialog v-model="dialogCabinet" persistent>
		<q-card class="w-400">
			<q-toolbar>
				<q-toolbar-title>货架</q-toolbar-title>

				<q-btn flat dense icon="close" @click="dialogCabinet = false" />
			</q-toolbar>

			<q-separator />

			<q-card-section>
				<q-input filled label="货架名称" class="q-mb-sm" v-model="CabinetStore.cabinetEditor.name">
					<template v-slot:before>
						<q-icon name="dns" />
					</template>
				</q-input>
				<q-input filled label="商品单位" class="q-mb-sm" v-model="CabinetStore.cabinetEditor.unit">
					<template v-slot:before>
						<q-icon name="" />
					</template>
				</q-input>
				<q-select
					filled
					label="商品过磅公式"
					class="q-mb-sm"
					v-model="CabinetStore.cabinetEditor.formula"
					emit-value
					map-options
					option-label="text"
					:options="CabinetStore.OPTION_ENUM_POUNDS_FORMULA"
				>
					<template v-slot:before>
						<q-icon name="" />
					</template>
				</q-select>
				<q-select
					filled
					label="商品开单"
					class="q-mb-sm"
					v-model="CabinetStore.cabinetEditor.layout"
					emit-value
					map-options
					option-label="text"
					:options="CabinetStore.OPTION_ENUM_LAYOUT_CABINET"
				>
					<template v-slot:before>
						<q-icon name="" />
					</template>
				</q-select>
			</q-card-section>

			<q-card-actions align="right">
				<q-btn
					color="indigo"
					push
					glossy
					square
					@click="
						async () => {
							if (CabinetStore.cabinetEditor._id) await CabinetStore.patch();
							else await CabinetStore.post();
							dialogCabinet = false;
						}
					"
				>
					{{ CabinetStore.cabinetEditor._id ? "保存" : "新增" }}
				</q-btn>
			</q-card-actions>
		</q-card>
	</q-dialog>
</template>

<script lang="ts" setup>
import { onMounted, ref, computed } from "vue";
import { Notify, useQuasar } from "quasar";
import { ENUM_ROLE_WMSS, MAP_ENUM_ROLE_WMSS } from "qqlx-core";
import type { RoleWMSSJoined } from "qqlx-core/dto/wmss/role";

import { useNotifyStore } from "@/stores/notify";
import { useUserStore } from "@/stores/user";
import { useCorpStore } from "@/stores/corp";
import { useCabinetStore } from "@/stores/cabinet";

const NotifyStore = useNotifyStore();
const CabinetStore = useCabinetStore();

const dialogCabinet = ref(false);

const $q = NotifyStore.getQuasarStore();
const deleteConfirm = (cabinetId: string) => {
	$q.dialog({
		title: "重要确认",
		message: "即将为您保留货架中的所有商品库存，仅货架会被删除，确定要这样做吗？",
		cancel: true,
	}).onOk(() => CabinetStore.delete(cabinetId));
};

// action
onMounted(() => {
	CabinetStore.get();
});
</script>
