import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(Vuex);

export default new Vuex.Store({
	state: {
		test: 1,
		memoKeys: [],
		memoList: {},
		// {
		// 	"A": [
		// 		{
		// 			id: 'a_1',
		// 			name: '名称',
		// 			memo: '备忘',
		// 			other: '其他'
		// 		}
		// 	],
		// 	"B": [
		// 		{
		// 			id: 'b_1',
		// 			name: '逼格',
		// 			memo: 'bilibili',
		// 			other: '哔哩哩'
		// 		}
		// 	]
		// },
	},
	mutations: {
		
		SetMemoKeys: (state, keys) => {
			keys.sort((a, b) => a.charCodeAt() - b.charCodeAt());
			state.memoKeys = keys;
		},
		SetMemoList: (state, record) => {
			let keys = Object.keys(record).sort((a, b) => a.charCodeAt() - b.charCodeAt());
			let sortRecord = {};
			keys.forEach((key) => sortRecord[key] = record[key]);
			state.memoList = sortRecord;
		},
		addTest(state) {
			state.test++;
		}
	},
	actions: {},
});
