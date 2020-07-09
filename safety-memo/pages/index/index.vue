<template>
	<view class="content">
		<view class="readme" @longtap="showClear = !showClear">
			随时随地记住你的备忘信息
			<text class="notes">注: 数据均储存在本地，清除缓存则会删除数据，请提前备份。</text>
		</view>
		<view class="no-data" v-if="!letterKeys.length">暂无数据</view>
		<!-- 数据列表 -->
		<view class="memo__lists" v-else>
			<view class="memo__list" v-for="letter in letterKeys" :key="letter">
				<view class="memo__list-hd">
					<text class="text">{{ letter }}</text>
					<text class="total">{{ letterLists[letter].length }}</text>
				</view>
				<view class="memo__list-bd">
					<view class="memo__item"
						v-for="(data, index) in letterLists[letter]"
						:key="data.id"
						@tap="handleOpen(data, letter, index)"
						@longtap="handleLongOpen(letter, index)"
					>
						<text class="title">{{ data.name }}</text>
					</view>
				</view>
			</view>
		</view>
		<!-- 其他 -->
		<view class="text-center" v-if="showClear">
			<view class="memo-clear" @tap="handleClear">
				<text class="g-icon">&#xe6a6;</text>
			</view>
		</view>
		<!-- 菜单 -->
		<view class="footer-container">
			<view class="footer-wrapper">
				<view class="footer-item" @tap="handleNavigator('increase')">
					<text class="g-icon">&#xe8fe;</text>
					添加
				</view>
				<view class="footer-item" @tap="handleExportData">
					<text class="g-icon">&#xe791;</text>导出</view>
				<view class="footer-item" @tap="handleImportData">
					<text class="g-icon">&#xe792;</text>导入
				</view>
			</view>
		</view>
		
		<!-- uni-popup -->
<!-- 		<uni-popup ref="showtip" type="center" :mask-click="false" @change="handleChange">
			<view class="uni-tip">
				<text class="uni-tip-title">{{ popupContent.name }}</text>
				<view class="uni-tip-content">
					<view>备忘：{{ popupContent.memo }}</view>
					<view>其他：{{ popupContent.other }}</view>
				</view>
				<view class="uni-tip-group-button">
					<text class="uni-tip-button" @click="handleCancel">取消</text>
					<text class="uni-tip-button" @click="handleModify(popupContent)">编辑</text>
				</view>
			</view>
		</uni-popup> -->
		
	</view>
</template>

<script>
import { mapMutations } from 'vuex';
import * as XLSX from 'xlsx';
import { MEMO_KEYS, MEMO_KEY_, sheet2blob, openDownload, read } from '../../static/js/utils';

let Input = null;
export default {
	components: { },
	data() {
		return {
			title: 'Hello',
			letterKeys: [],
			letterLists: {},
			showClear: false,
		};
	},
	
	onLoad() {
		// console.log(this.$store.state.memoKeys);
	},
	onShow() {
		// console.log('onShow');
		const { memoKeys, memoList } = this.$store.state;
		this.letterKeys = memoKeys;
		this.letterLists = memoList;
	},
	onPullDownRefresh() {
		setTimeout(function() {
			uni.stopPullDownRefresh();
		}, 1000);
	},
	methods: {
		...mapMutations(['SetMemoKeys', 'SetMemoList']),
		/* 跳转 */
		handleNavigator: function(link, params = {}) {
			let url = `/pages/${link}/${link}?`;
			
			if (Object.keys(params).length) {
				for (let key in params) {
					url += `${key}=${params[key]}&`;
				}
				url = url.substr(0, url.length - 1);
			}
			console.log(url)
			uni.navigateTo({ url });
		},
		/* 查看信息 */
		handleOpen(data, letter, index) {
			uni.showModal({
				title: data.name,
				content: `备忘：${data.memo}\n其他： ${data.other}`,
				cancelText: "取消",
				confirmText: "编辑",
				success: (res) => {
					if (res.confirm) {
						this.handleNavigator('increase', { letter, index })
					}
				}
			});
		},
		/* 长按删除 */
		handleLongOpen(letter, index) {
			uni.showActionSheet({
				itemList: ['删除'],
				success: (res) => {
					this.handleDelete(letter, index);
				}
			});
		},
		/* 删除数据 */
		handleDelete(letter, index) {
			const { letterKeys, letterLists, SetMemoKeys, SetMemoList } = this;
			letterLists[letter].splice(index, 1);
			
			if(letterLists[letter].length === 0) { // 对应字母全部删除
				const delIndex = letterKeys.findIndex(key => key === letter);
				letterKeys.splice(delIndex, 1);
				SetMemoKeys(letterKeys);
				uni.setStorageSync(MEMO_KEYS, letterKeys);
			
				delete letterLists[letter];
				uni.removeStorageSync(`${MEMO_KEY_}${letter}`);				
			} else {
				// storage数据
				uni.setStorageSync(`${MEMO_KEY_}${letter}`, letterLists[letter]);
			}
			// vuex数据
			SetMemoList(letterLists);

		},
		handleChange(e) { // change
			// console.log('uni.popup() handleChange' + e.show);
		},
		handleCancel() { // 取消
			// this.$refs['showtip'].close();
		},
		handleExportData() {
			const { letterKeys, letterLists } = this;
			if (!Object.keys(letterLists).length) {
				uni.showModal({
					content: '没有可导出的数据！',
					showCancel: false,
					success: (res) => {}
				});
				return;
			}
			
			let allData = [['id', 'name', 'memo', 'other']];
			letterKeys.forEach(key => {
				letterLists[key].forEach(item => {
					const { id, name, memo, other } = item;
					allData.push([id, name, memo, other]);
				});
			});
			
			var aoa = [
			    ['姓名', '性别', '年龄', '注册时间'],
			    ['张三', '男', 18, new Date()],
			    ['李四', '女', 22, new Date()]
			];
			var sheet = XLSX.utils.aoa_to_sheet(allData);
			
			const nowTime = new Date();
			const month = nowTime.getMonth() + 1;
			const date = nowTime.getDate();
			
			openDownload(sheet2blob(XLSX, sheet), `${month}-${date}.xlsx`);
		},
		handleImportData () {
			// #ifdef H5
				Input = document.createElement('input');
				Input.type = 'file';
				Input.hidden = true;
				Input.addEventListener('change', this.handleFileChange);
				document.body.appendChild(Input);
				Input.click();
			// #endif
		},
		handleFileChange(e) {
			if (!e.target.value) return;
			const file = e.target.files[0];
			const fileExt = file.name.split('.').pop().toLocaleLowerCase();
			if (file.size / 1024 / 1024 > 10) {
				uni.showModal({
					content: '文件不能超过10M',
					showCancel: false,
				});
				return;
			}
			if (!['xlsx', 'xls'].includes(fileExt)) {
				uni.showModal({
					content: '文件类型错误',
					showCancel: false,
				});
				return;
			}
			this.readFile(file);
		},
		readFile(file) {
			const reader = new FileReader(file);
			reader.readAsArrayBuffer(file);
			reader.onloadstart = e => {
				uni.showLoading({
					title: '导入中...'
				});
			}
			reader.onprogress = e => {
				let num = Math.round(e.loaded / e.total * 100)
			}
			reader.onerror = e => {
				uni.showModal({
					content: '文件读取出错',
					showCancel: false,
				});
				uni.hideLoading();
			}
			reader.onload = e => {
				let data = e.target.result;
				let { header, results } = read(XLSX, data, 'array');
				this.normalImportData(results);
			}
		},
		normalMemo(list, record) {
			const index = list.findIndex(item => item.id === record.id);
			index > -1 ? list.splice(index, 1, record) : list.push(record);
			return list;
		},
		normalImportData(list) {
			let letterKeys = JSON.parse(JSON.stringify(this.letterKeys));
			let letterLists = JSON.parse(JSON.stringify(this.letterLists));
			
			list.forEach(record => {
				const [letter] = record.id;
				// 合并keys
				!letterKeys.includes(letter) && letterKeys.push(letter);
				let newRecord = {
					id: record.id,
					name: record.name || '',
					memo: record.memo || '',
					other: record.other || '',
				}
				
				// 有对应分类
				if (letterLists[letter]) {
					let data = this.normalMemo(letterLists[letter], newRecord);
					letterLists[letter] = data;
					uni.setStorageSync(`MEMO_KEY_${letter}`, data);
				} else {
					letterLists[letter] = [newRecord];
					uni.setStorageSync(`MEMO_KEY_${letter}`, [newRecord]);
				}
			});
			uni.setStorageSync('MEMO_KEYS', letterKeys);
			this.SetMemoKeys(letterKeys);
			this.SetMemoList(letterLists);
			this.letterKeys = letterKeys;
			this.letterLists = letterLists;
			
			uni.hideLoading();
			uni.showToast({
				title: '导入成功！',
				success() {
					document.body.removeChild(Input);
					Input = null;
				}
			});
		},
		handleClear() {
			let self = this;
			uni.showModal({
				title: '提示',
				content: '即将清除所有数据，请提前备份!',
				success: function (res) {
					if (res.cancel) return;
					clearAll();
				}
			});
			
			function clearAll () {
				self.letterKeys.forEach(letter => {
					uni.removeStorageSync(`${MEMO_KEY_}${letter}`);
				});
				uni.removeStorageSync(MEMO_KEYS);
				self.SetMemoKeys([]);
				self.SetMemoList({});
				self.letterKeys = [];
				self.letterLists = {};
				self.showClear = false;
			}
		},
	},
	onBackPress() { // 监听返回
		// this.$refs['showtip'].close();
	}
};
</script>

<style lang="scss">
	.content {
		margin-bottom: 100rpx;
		height: 100%;
		background: #f4f5f6;
	}

.readme {
	padding: 30upx;
	font-size: 36upx;
	.notes {
		display: block;
		margin: 10px 0;
		color: #999;
		font-size: 24upx;
	}
}
.memo__lists {
	.memo__list {
		background: #fff;
		.memo__list-hd {
			position: relative;
			display: flex;
			justify-content: space-between;
			padding: 20upx 30upx;
			color: #353535;
			font-size: 24upx;
			background-color: #eee;
			@include border-1px();
		}
		.memo__list-bd {
			position: relative;
			padding: 0 30upx;
			@include border-1px();
		}
	}
}
.memo__list-hd {
	.total {
		color: #999;
	}
}
.memo__list-bd {
	.memo__item {
		position: relative;
		font-size: 30upx;
		@include border-1px();
		&:last-of-type:after {
			display: none;
		}
		.title {
			display: block;
			padding: 30upx 0;
			color: #333;
		}
	}
}

.footer-container {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	background: #fff;
	.footer-wrapper {
		display: flex;
		align-items: center;
		justify-content: space-around;
		height: 88upx;
		.footer-item {
			color: #459ae9;
			font-size: 30upx;
		}
	}
}

.no-data {
	display: block;
	padding: 100upx;
	text-align: center;
}

/* 提示窗口 */
.uni-tip {
	/* #ifndef APP-NVUE */
	display: flex;
	flex-direction: column;
	/* #endif */
	margin: auto;
	padding: 15px;
	width: calc(100% - 90px);
	background-color: #fff;
	border-radius: 10px;
}

.uni-tip-title {
	margin-bottom: 15px;
	text-align: center;
	font-weight: bold;
	font-size: 16px;
	color: #333;
}

.uni-tip-content {
	/* padding: 15px;
*/
	font-size: 14px;
	color: #666;
}

.uni-tip-group-button {
	/* #ifndef APP-NVUE */
	display: flex;
	/* #endif */
	flex-direction: row;
	margin-top: 20px;
}

.uni-tip-button {
	flex: 1;
	text-align: center;
	font-size: 14px;
	color: #3b4144;
	&:last-child {
		color: #459ae9;
	}
}
.memo-clear {
	display: inline-block;
	@include extend-click();
	color: #666;
}
</style>
