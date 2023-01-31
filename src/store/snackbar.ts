import { defineStore } from "pinia";

export const useSnackbarStore = defineStore("Snackbar", {
	state: () => ({
		isSuccess: false,
		successMessage: "",
		// successTimer: -1,

		isFail: false,
		failMessage: "",
		// failTimer: -1,
	}),
	actions: {
		setSuccess(message: string) {
			this.successMessage = message;
			this.isSuccess = true;

			// if (this.successTimer) clearTimeout(this.successTimer);
			// this.successTimer = window.setTimeout(() => this.clearSuccess(), 5000);
		},
		clearSuccess() {
			this.isSuccess = false;
			this.successMessage = "";
			// this.successTimer = -1;
		},
		setFail(message: string) {
			this.failMessage += message + "<br/>";
			this.isFail = true;

			// if (this.failTimer) clearTimeout(this.failTimer);
			// this.failTimer = window.setTimeout(() => this.clearFail(), 5000);
		},
		clearFail() {
			this.isFail = false;
			this.failMessage = "";
			// this.failTimer = -1;
		},
	},
});
