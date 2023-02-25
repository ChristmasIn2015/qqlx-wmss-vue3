<template>
	<div class="q-pt-md q-pb-lg">
		<div class="text-h4 text-white text-weight-bold">商品分类</div>
		<div class="text-white q-pt-sm">
			<div>1.您可以根据不同需求，设置如 “冷轧卷” “冷轧板” “管材” 等您需要的钢材分类；</div>
			<div>2.您可以在商品分类中添加商品，它们将用于内部单据、采购销售开单等；</div>
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
					<div class="col">性质</div>
					<div class="col text-right" :class="CabinetStore.getLayoutChinese(cabinet.layout)?.tip ? 'text-orange' : ''">
						{{ CabinetStore.getLayoutChinese(cabinet.layout)?.text }}

						<q-tooltip v-if="CabinetStore.getLayoutChinese(cabinet.layout)?.tip" class="text-body1">
							{{ CabinetStore.getLayoutChinese(cabinet.layout)?.tip }}
						</q-tooltip>
					</div>
				</div>
				<div class="row">
					<div class="col">过磅公式</div>
					<div class="col text-right" :class="CabinetStore.getFormulaChinese(cabinet.formula)?.tip ? 'text-orange' : ''">
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
		<div class="text-h5 text-orange text-weight-bold">快速添加</div>
		<div class="text-grey q-pt-sm">
			<span>以下是常用的钢材商品分类，您可以快速设置为您的商品分类。</span>
			<span
				>您也可以直接
				<q-btn
					push
					square
					color="orange"
					@click="
						() => {
							CabinetStore.setSchema();
							dialogCabinet = true;
						}
					"
				>
					添加
				</q-btn>
				商品分类</span
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
					class="text-orange text-weight-bold cursor-pointer"
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
					<div class="col">性质</div>
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
				<q-toolbar-title>商品分类</q-toolbar-title>

				<q-btn flat dense icon="close" @click="dialogCabinet = false" />
			</q-toolbar>

			<q-separator />

			<q-card-section>
				<q-input filled label="商品分类名称" class="q-mb-sm" v-model="CabinetStore.cabinetEditor.name">
					<template v-slot:before>
						<q-icon name="dns" />
					</template>
				</q-input>
				<q-input filled label="单位" class="q-mb-sm" v-model="CabinetStore.cabinetEditor.unit">
					<template v-slot:before>
						<q-icon name="" />
					</template>
				</q-input>
				<q-select
					filled
					label="性质"
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
				<div class="q-ml-lg q-pl-md q-mb-sm text-negative" v-if="CabinetStore.cabinetEditor.layout === ENUM_LAYOUT_CABINET.INDIVIDUAL">
					请注意，此商品分类将被设置为 “大件商品” 商品分类，当您使用其中的商品进行销售、发货时，需要单独选择一项已入库的商品进行库存扣减。
				</div>
				<q-select
					filled
					label="过磅公式"
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
			</q-card-section>

			<q-card-actions align="right">
				<q-btn
					color="orange"
					push
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
import { ENUM_ROLE_WMSS, ENUM_LAYOUT_CABINET } from "qqlx-core";
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
		message: "即将为您保留商品分类中的所有商品库存，仅商品分类会被删除，确定要这样做吗？",
		cancel: true,
	}).onOk(() => CabinetStore.delete(cabinetId));
};

// action
onMounted(() => {
	CabinetStore.get();
});
</script>
