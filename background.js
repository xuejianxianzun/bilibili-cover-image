chrome.contextMenus.create({
	'title': '获取封面图片',
	'contexts': ['all'],
	'id': 'getCoverImage',
	'documentUrlPatterns': ['*://*.bilibili.com/*']
});

chrome.contextMenus.onClicked.addListener(function(info, tab) { //第二个参数是tab对象
    if (info.menuItemId == 'getCoverImage') {       //info.menuItemId里面就是被点击的菜单项的id
        chrome.tabs.sendMessage(tab.id, 'getCoverImage', function(response) {});
    }
});