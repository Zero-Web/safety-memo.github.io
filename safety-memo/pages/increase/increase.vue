<template>
	<view class="content">
		<view class="text-tips">备忘内容</view>
		<form @submit="handleSubmit">
			<view class="form-container">
				<view class="form-cell">
					<view class="form-label">序号</view>
					<view class="form-input">
						<input
							v-model="memoForm.letter"
							name="letter"
							maxlength="1"
							placeholder="请输入A-Z进行排序"
							:disabled="modifyStatus.id"
						/>
					</view>
				</view>
				<view class="form-cell">
					<view class="form-label">事项</view>
					<view class="form-input">
						<input v-model="memoForm.name" name="name" placeholder="请输入事项" />
					</view>
				</view>
				<view class="form-cell">
					<view class="form-label">备忘</view>
					<view class="form-input">
						<input v-model="memoForm.memo" :password="memoShow" name="memo" placeholder="请输入易忘" />
					</view>
					<view @click="memoShow = !memoShow">
						<text v-if="memoShow" class="g-icon">&#xe6c6;</text>
						<text v-else class="g-icon">&#xe73d;</text>
					</view>
				</view>
				<view class="form-cell">
					<view class="form-label">其他</view>
					<view class="form-input">
						<input v-model="memoForm.other" name="other" placeholder="请输入其他" />
					</view>
				</view>
			</view>
			<view class="form-button button-sp-area">
				<button type="primary" :disabled="inputEmpty" form-type="submit">提交</button>
			</view>
		</form>
	</view>
</template>

<script>
import { mapMutations } from 'vuex';
	
export default {
	data() {
		const { memoKeys, memoList } = this.$store.state;
		return {
			memoKeys: JSON.parse(JSON.stringify(memoKeys)),
			memoList: JSON.parse(JSON.stringify(memoList)),
			memoForm: {
				letter: '', name: '', memo: '', other: ''
			},
			memoShow: false,
			modifyStatus: {}
		};
	},
	computed: {
		inputEmpty() {
			const {
				letter,
				name,
				memo
			} = this.memoForm;
			return letter && name && memo ? false : true;
		}
	},
	onLoad(option) {
		if (Object.keys(option).length) { // 编辑的数据
			const { letter, index } = option;
			let modifyData = this.memoList[letter][index];
			
			this.modifyStatus = { id: modifyData.id, index }
			this.memoForm = {
				letter,
				name: modifyData.name,
				memo: modifyData.memo,
				other: modifyData.other
			};
		}
	},
	methods: {
		...mapMutations(['SetMemoKeys', 'SetMemoList']),
		handleSubmit(event) {
			
			const { memoKeys, memoList, modifyStatus, getLastId } = this;
			let { letter, name, memo, other } = event.detail.value;

			letter = letter.toUpperCase();
			if(!/^[A-Z]{1}$/.test(letter)) {
				uni.showModal({
					content: '请输入字母',
					showCancel: false,
					success: (res) => {
						this.memoForm.letter = '';
					}
				});
				return;
			}
			if (/[\u4e00-\u9fa5]/.test(memo)) {
				uni.showModal({
					content: '不能输入中文',
					showCancel: false,
					success: (res) => {
						this.memoForm.memo = '';
					}
				});
				return;
			}
			
			let id = '';
			if(modifyStatus['id']) {
				id = modifyStatus.id;
			} else {
				const newId = getLastId(memoList[letter]) + 1;
				id = `${letter}_${newId}`
			}
			let data = {
				id, name, memo, other
			}
			
			// 同步数据
			this.syncStorage(letter, data);
			this.resultForm();
		},
		/* 获取最后一条数据的id */
		getLastId(data = []) {
			const len = data.length;
			if (len === 0) {
				return 0
			}
			const lastId = data[len - 1].id
			const [, id] = lastId.split('_');
			return Number(id);
		},
		/* 同步数据 */
		syncStorage(letter, data) {
			const { memoKeys, memoList, modifyStatus, SetMemoKeys, SetMemoList } = this;
			
			if(memoKeys.includes(letter)) { // 有字母
				
				// 添加页面数据
				if (modifyStatus['id']) {
					memoList[letter][modifyStatus.index] = data;
				} else {
					memoList[letter].push(data);
				}
				// vuex数据
				SetMemoList(memoList);
				// storage数据
				uni.setStorageSync(`MEMO_KEY_${letter}`, memoList[letter]);

			} else {	// 无字母
				memoKeys.push(letter);
				SetMemoKeys(memoKeys);
				uni.setStorageSync('MEMO_KEYS', memoKeys);
				
				memoList[letter] = [data];
				SetMemoList(memoList);
				uni.setStorageSync(`MEMO_KEY_${letter}`, [data]);
			}
			
			uni.showToast({
				title: modifyStatus['id'] ? '修改成功！': '添加成功！'
			});
			// uni.hideToast();
		},
		/* 重置表单 */
		resultForm() {
			this.memoForm = {
				letter: '', name: '', memo: '', other: ''
			}
		}
	}
};
</script>

<style lang="scss">
.content {
	height: 100vh;
	background: #f4f5f6;
}
.text-tips {
	padding: 30upx 30upx 16upx;
	line-height: 1;
	color: #888;
	font-size: 28upx;
}
.form-container {
	position: relative;
	padding-left: 30upx;
	background: #fff;
}
.form-cell {
	position: relative;
	display: flex;
	align-items: center;
	@include border-1px();

	.form-label {
		flex: 0 120upx;
		font-size: 32upx;
	}
	.form-input {
		flex: 1;
		position: relative;
		input {
			width: 100%;
			height: auto;
			line-height: 1.47058824;
			color: #000;
			font-size: 32upx;
			padding: 24upx 0;
			border: 0;
			outline: 0;
			-webkit-appearance: none;
			background-color: transparent;
			-webkit-user-select: auto;
		}
	}
}
.form-button {
	margin: 60upx 0;
	button {
		width: 60%;
	}
}
</style>
