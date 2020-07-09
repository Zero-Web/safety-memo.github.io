<script>
	import { mapMutations } from 'vuex';
	export default {
		onLaunch: function() {
			// console.log('App Launch')
			const memoKeys = uni.getStorageSync('MEMO_KEYS') || [];
			this.$store.commit('SetMemoKeys', memoKeys);
			
			let memoList = {};
			memoKeys.forEach((letter) => {
				memoList[letter] = uni.getStorageSync(`MEMO_KEY_${letter}`);
			});
			this.$store.commit('SetMemoList', memoList);
		},
		onShow: function() {
			// console.log('App Show')
		},
		onHide: function() {
			// console.log('App Hide')
		},
		// methods: {
		// 	...mapMutations(['SetMemoKeys', 'SetMemoList'])
		// }
	}
</script>

<style>
	/*每个页面公共css */
	/* #ifdef H5 */
	body {
		max-width: 750px;
		margin: 0 auto;
		background: #f4f5f6;
	}
	/* #endif */
</style>
