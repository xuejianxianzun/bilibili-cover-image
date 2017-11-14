// ==UserScript==
// @name		获取哔哩哔哩视频的封面图片 get bilibili cover image
// @namespace	http://saber.love/?p=3259
// @version		1.6.0
// @description	在视频列表上以及视频播放页面，按 ctrl+鼠标右键 ，就会在新窗口打开这个视频的封面图
// @author		雪见仙尊 xuejianxianzun
// @include		*://*bilibili.com/*
// @icon        http://saber.love/favicon.ico
// @license 	MIT
// @icon 		https://www.bilibili.com/favicon.ico
// @run-at		document-end
// ==/UserScript==

'use strict'
// 获取触发右键菜单的元素
document.body.addEventListener("contextmenu", function(e) {
	var e = e || window.event;
	if (e.ctrlKey) {
		getCoverImage(e.target);
	}
});

// 判断是否含有当前class
let hasClass = (function() {
	let div = document.createElement("div");
	if ("classList" in div && typeof div.classList.contains === "function") {
		return function(elem, className) {
			return elem.classList.contains(className);
		};
	} else {
		return function(elem, className) {
			let classes = elem.className.split(/\s+/);
			for (let i = 0; i < classes.length; i++) {
				if (classes[i] === className) {
					return true;
				}
			}
			return false;
		};
	}
})();

let ownsName = ["scrollx", "groom-module", "card-live-module", "rank-item", "spread-module", "card-timing-module", "l-item", "v", "vb", "v-item", "anchor-card", "small-item", "cover-normal", "common-lazy-img", "biref-img", "game-groom-m", "i-pin-c"]; // 这里的class都是列表项本身
let parentsName = ["bm-v-list", "rlist"]; // 这里的class是列表项的父元素

function getCoverImage(element) {
	/*if (element.nodeName === "IMG") { // 当前元素是img的情况
		openCoverImage(element.src);
	}*/
	if (element.nodeName === "BODY") { // 当前元素是body的情况
		// 尝试获取视频播放页的封面图
		let cover_image = document.body.querySelector("img.cover_image");
		if (!!cover_image) {
			openCoverImage(cover_image.src);
		} else {
			console.log("body, none");
		}
		return false;
	} else {
		let finded = false;
		// 测试当前元素是否符合要求
		for (let i = 0; i < ownsName.length; i++) {
			if (hasClass(element, ownsName[i])) {
				// console.log(ownsName[i]);
				if (ownsName[i] === "anchor-card") { //anchor-card这个class是直播页面的
					if (!!element.style.backgroundImage) {
						openCoverImage(/\/\/.*(?=")/.exec(element.style.backgroundImage)[0]);
					} else {
						openCoverImage(/\/\/.*(?=")/.exec(element.querySelector(".room-cover").style.backgroundImage)[0]);
					}
				} else if (ownsName[i] === "video-block") {
					openCoverImage(/\/\/.*(?=")/.exec(element.querySelector(".video-preview").style.backgroundImage)[0]);
				} else {
					openCoverImage(element.querySelector("img").src);
				}
				finded = true;
				break;
			}
		}
		// 测试父元素是否符合要求
		let parentNode = element.parentNode;
		for (let i = 0; i < parentsName.length; i++) {
			if (hasClass(parentNode, parentsName[i])) {
				// 获取父元素的子节点
				let childrens = parentNode.childNodes;
				for (let j = 0; j < childrens.length; j++) {
					if (childrens[j] === element) {
						openCoverImage(element.querySelector("img").src);
						finded = true;
						break;
					}
				}
			}
		}
		// 如果都没有找到，则返回父元素
		if (finded === false) {
			return getCoverImage(parentNode);
		}
	}
}

function openCoverImage(url) {
	let coverImageBigUrl = url;
	// 去除url中的裁剪标识
	if (url.indexOf("@") > -1) { //处理以@做裁剪标识的url
		coverImageBigUrl = url.split("@")[0];
	}
	if (url.indexOf("jpg_") > -1) { //处理以_做裁剪标识的url
		coverImageBigUrl = url.split("jpg_")[0] + "jpg"; //默认所有图片都是jpg格式的。如果不是jpg，则可能会出错
	}
	if (url.indexOf("png_") > -1) { //处理以_做裁剪标识的url
		coverImageBigUrl = url.split("png_")[0] + "png";
	}
	if (url.indexOf("/320_200/") > -1) { //有时裁剪标识是在后缀名之前的 目前主要发现的是“番剧”板块的列表里有，但尚不清楚其他地方的情况
		coverImageBigUrl = url.replace("/320_200", "");
	}
	window.open(coverImageBigUrl);
}