
const MEMO_KEYS = 'MEMO_KEYS';
const MEMO_KEY_ = 'MEMO_KEY_';
const getTime = () => {
  return new Date().getTime();
};

const random = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// 将一个sheet转成最终的excel文件的blob对象，然后利用URL.createObjectURL下载
const	sheet2blob = (XLSX, sheet, sheetName) => {
	sheetName = sheetName || 'sheet1';
	var workbook = {
			SheetNames: [sheetName],
			Sheets: {}
	};
	workbook.Sheets[sheetName] = sheet;
	// 生成excel的配置项
	var wopts = {
			bookType: 'xlsx', // 要生成的文件类型
			bookSST: false, // 是否生成Shared String Table，官方解释是，如果开启生成速度会下降，但在低版本IOS设备上有更好的兼容性
			type: 'binary'
	};
	var wbout = XLSX.write(workbook, wopts);
	var blob = new Blob([s2ab(wbout)], {type:"application/octet-stream"});
	// 字符串转ArrayBuffer
	function s2ab(s) {
			var buf = new ArrayBuffer(s.length);
			var view = new Uint8Array(buf);
			for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
			return buf;
	}
	return blob;
}

/**
 * 通用的打开下载对话框方法，没有测试过具体兼容性
 * @param url 下载地址，也可以是一个blob对象，必选
 * @param saveName 保存文件名，可选
 */
const openDownload = (url, saveName) => {
	if(typeof url == 'object' && url instanceof Blob) {
		url = URL.createObjectURL(url); // 创建blob地址
	}
	var aLink = document.createElement('a');
	aLink.href = url;
	aLink.download = saveName || 'safety-memo'; // HTML5新增的属性，指定保存文件名，可以不要后缀，注意，file:///模式下不会生效
	var event;
	if(window.MouseEvent)  {
		event = new MouseEvent('click');
	} else {
		event = document.createEvent('MouseEvents');
		event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
	}
	aLink.dispatchEvent(event);
}

// get head from excel file,return array
function get_header_row(XLSX, sheet) {
    const headers = []
    const range = XLSX.utils.decode_range(sheet['!ref'])
    let C
    const R = range.s.r /* start in the first row */
    for (C = range.s.c; C <= range.e.c; ++C) { /* walk every column in the range */
        var cell = sheet[XLSX.utils.encode_cell({ c: C, r: R })] /* find the cell in the first row */
        var hdr = 'UNKNOWN ' + C // <-- replace with your desired default
        if (cell && cell.t) hdr = XLSX.utils.format_cell(cell)
        headers.push(hdr)
    }
    return headers
}

const read = (XLSX, data, type) => {
    /* if type == 'base64' must fix data first */
    // const fixedData = fixdata(data)
    // const workbook = XLSX.read(btoa(fixedData), { type: 'base64' })
    const workbook = XLSX.read(data, { type: type });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const header = get_header_row(XLSX, worksheet);
    const results = XLSX.utils.sheet_to_json(worksheet);
    return {header, results};
}

export {
	MEMO_KEYS,
	MEMO_KEY_,
	getTime,
	random,
	sheet2blob,
	openDownload,
	read
};
