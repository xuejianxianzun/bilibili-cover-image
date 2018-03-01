// ==UserScript==
// @name		获取哔哩哔哩视频的封面图片 get bilibili cover image
// @namespace	http://saber.love/?p=3259
// @version		1.9.0
// @description	在视频列表上以及视频播放页面，按 ctrl+鼠标右键 ，就会在新窗口打开这个视频的封面图
// @author		雪见仙尊 xuejianxianzun
// @include		*://*bilibili.com/*
// @license 	MIT
// @icon 		https://www.bilibili.com/favicon.ico
// @run-at		document-end
// ==/UserScript==

'use strict';

let is_found = false;
let ownsName = ['scrollx', 'groom-module', 'card-live-module', 'rank-item', 'spread-module', 'card-timing-module', 'l-item', 'v', 'vb', 'v-item', 'small-item', 'cover-normal', 'common-lazy-img', 'biref-img', 'game-groom-m', 'i-pin-c', 'anchor-item', 'room-cover-wrapper', 'room-card-item', 'special-module', 'chief-recom-item', 'bangumi-info-wrapper', 'similar-list-child', 'v1-bangumi-list-part-child', 'lv-preview', 'recom-item', 'misl-ep-img', 'media-info-inner', 'matrix', 'bangumi-list', 'bilibili-player-recommend-left', 'bilibili-player-ending-panel-box-recommend', 'album-top', 'm-recommend-item']; // 这里的class都是列表项本身
let parentsName = ['bm-v-list', 'rlist', 'topic-preview']; // 这里的class是列表项的父元素
let reg1 = /\/\/.*(?=")/;

// 获取触发右键菜单的元素
let contextmenuTarget;
document.body.addEventListener('contextmenu', function (e) {
	let my_e = e || window.event;
	if (my_e.ctrlKey) { // 每次点击进行初始化
		contextmenuTarget = my_e.target;
		//开始获取封面图
		is_found = false;
		getCoverImage(my_e.target);
	}
});

// 判断是否含有当前class
function hasClass(element, className) {
	return element.classList.contains(className);
}

// 获取子元素的背景图片
function getBG(element, find_class) {
	if (find_class !== 0) { // 0为元素自身，即不查找子元素
		element = element.querySelector(find_class);
	}
	return reg1.exec(element.style.backgroundImage)[0];
}

function getCoverImage(element) {
	// 首先测试当前元素是否符合要求
	for (let i = 0; i < ownsName.length; i++) {
		if (hasClass(element, ownsName[i])) {
			if (ownsName[i] === 'anchor-item') { //直播列表上部分
				openCoverImage(getBG(element, '.anchor-cover'));
			} else if (ownsName[i] === 'room-cover-wrapper') { //直播列表下部分
				openCoverImage(getBG(element, '.room-cover'));
			} else if (ownsName[i] === 'room-card-item') { //直播分类页面的列表
				openCoverImage(getBG(element, '.cover'));
			} else if (ownsName[i] === 'album-top') { //相册封面
				openCoverImage(getBG(element, '.album-img'));
			} else if (ownsName[i] === 'video-block') {
				openCoverImage(getBG(element, '.video-preview'));
			} else if (ownsName[i] === 'bilibili-player-ending-panel-box-recommend') {
				openCoverImage(getBG(element, '.bilibili-player-ending-panel-box-recommend-img'));
			} else if (ownsName[i] === 'm-recommend-item') {
				openCoverImage(getBG(element, 0));
			} else {
				openCoverImage(element.querySelector('img').src);
			}
			is_found = true;
			break;
		}
	}
	if (is_found === false) {
		// 之后测试父元素是否符合要求
		let parentNode = element.parentNode;
		for (let i = 0; i < parentsName.length; i++) {
			if (hasClass(parentNode, parentsName[i])) {
				// 获取父元素的子节点
				let childrens = parentNode.childNodes;
				for (let j = 0; j < childrens.length; j++) {
					if (childrens[j] === element) {
						openCoverImage(element.querySelector('img').src);
						is_found = true;
						break;
					}
				}
			}
		}
		if (is_found === false) {
			// 如果没有到BODY，则循环返回父元素进行查找
			if (parentNode.tagName !== 'BODY') {
				return getCoverImage(parentNode);
			} else {
				// 如果到了BODY仍然没有找到，尝试直接获取视频播放页的封面。优先级要低，如果放在前面的话，用户点击播放页面的其他封面就不起作用了
				// 尝试直接获取储存封面图的IMG标签
				let cover_img = document.querySelector('.cover_image');
				if (cover_img !== null) {
					openCoverImage(cover_img.src);
					return false;
				}
				// 有些视频要从meta中获取封面图
				let meta_info = document.querySelector('meta[itemprop="image"]');
				if (meta_info !== null) {
					openCoverImage(meta_info.content);
					return false;
				}
				// 番剧播放页，使用另一个meta
				let bangumi_meta_info = document.querySelector('meta[property="og:image"]');
				if (bangumi_meta_info !== null) {
					openCoverImage(bangumi_meta_info.content);
					return false;
				}
				// 以上规则里都找不到时，直接取img的src
				if (contextmenuTarget.tagName === 'IMG') {
					openCoverImage(contextmenuTarget.src);
					return false;
				}
				// 最后也没找到
				console.log('cover not found');
				return false;
			}
		}
	}
}

function openCoverImage(url) {
	let coverImageBigUrl = url;
	// 去除url中的裁剪标识
	if (url.indexOf('@') > -1) { //处理以@做裁剪标识的url
		coverImageBigUrl = url.split('@')[0];
	}
	if (url.indexOf('jpg_') > -1) { //处理以_做裁剪标识的url
		coverImageBigUrl = url.split('jpg_')[0] + 'jpg'; //默认所有图片都是jpg格式的。如果不是jpg，则可能会出错
	}
	if (url.indexOf('png_') > -1) { //处理以_做裁剪标识的url
		coverImageBigUrl = url.split('png_')[0] + 'png';
	}
	if (url.indexOf('/320_200/') > -1) { //有时裁剪标识是在后缀名之前的 目前主要发现的是“番剧”板块的列表里有，但尚不清楚其他地方的情况
		coverImageBigUrl = url.replace('/320_200', '');
	}
	window.open(coverImageBigUrl);
}