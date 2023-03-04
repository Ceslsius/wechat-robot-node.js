/**
 *   Wechaty - https://github.com/wechaty/wechaty
 *
 *   @copyright 2021 Wechaty Contributors <https://github.com/wechaty>
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 *
 */
/* eslint-disable */
// @ts-nocheck
import type * as PUPPET   from 'wechaty-puppet'

import {
  PuppetXp,
}               from '../src/mod.js'

import qrcodeTerminal from 'qrcode-terminal'
import dtkSdk from 'dtk-nodejs-api-sdk'
let idx = 0
let pageSize = 10
let pageId = 0
let timer = null
let itemList = []
let time = 600000

/**
 *
 * 1. Declare your Bot!
 *
 */
const puppet = new PuppetXp()

/**
 *
 * 2. Register event handlers for Bot
 *
 */

puppet
  .on('logout', onLogout)
  .on('login',  onLogin)
  .on('scan',   onScan)
  .on('error',  onError)
  .on('message', onMessage)

/**
 *
 * 3. Start the bot!
 *
 */
puppet.start()
  .catch(async e => {
    console.error('Bot start() fail:', e)
    await puppet.stop()
    process.exit(-1)
  })

/**
 *
 * 4. You are all set. ;-]
 *
 */

/**
 *
 * 5. Define Event Handler Functions for:
 *  `scan`, `login`, `logout`, `error`, and `message`
 *
 */
function onScan (payload: PUPPET.payloads.EventScan) {
  if (payload.qrcode) {
    const qrcodeImageUrl = [
      'https://wechaty.js.org/qrcode/',
      encodeURIComponent(payload.qrcode),
    ].join('')
    console.info('StarterBot', 'onScan: %s(%s) - %s', payload.status, qrcodeImageUrl)

    qrcodeTerminal.generate(payload.qrcode, { small: true })  // show qrcode on console
    console.info(`[${payload.status}] ${payload.qrcode}\nScan QR Code above to log in: `)
  } else {
    console.info(`[${payload.status}]`)
  }
}

function onLogin (payload: PUPPET.payloads.EventLogin) {
  console.info(`${payload.contactId} login`)
}

function onLogout (payload: PUPPET.payloads.EventLogout) {
  console.info(`${payload.contactId} logouted`)
}

function onError (payload: PUPPET.payloads.EventError) {
  console.error('Bot error:', payload.data)
  /*
  if (bot.logonoff()) {
    bot.say('Wechaty error: ' + e.message).catch(console.error)
  }
  */
}

/**
 *
 * 6. The most important handler is for:
 *    dealing with Messages.
 *
 */
async function onMessage ({
  messageId,
}: PUPPET.payloads.EventMessage) {
  const {
    fromId,
    roomId,
    text,
  } = await puppet.messagePayload(messageId)
  if (/ding/i.test(text || '')) {
    await puppet.messageSendText(roomId! || fromId!, 'dong')
  }
  console.log(puppet.messagePayload(messageId))
  if(fromId == 'wxid_gkc181kbu5bd22'){
    // 夏日可畏微信号发来的消息
    if(text == '1'){
      console.log("开始发送")
      await puppet.messageSendText('wxid_gkc181kbu5bd22', '开始发送')
      handleStart()
    } else if (text == '2') {
      console.log("停止发送")
      await puppet.messageSendText('wxid_gkc181kbu5bd22', '停止发送')
      hanldeEnd()
    } else if (text == '0'){
      console.log("索引清零")
      await puppet.messageSendText('wxid_gkc181kbu5bd22', '索引清零')
      idx = 0
      pageId = 0
      itemList = []
    } else if (text.includes('time')){
      console.log("修改发送间隔",text.replace(/[^0-9]/ig, "") * 60000)
      await puppet.messageSendText('wxid_gkc181kbu5bd22', '修改发送间隔成功')
      time = text.replace(/[^0-9]/ig, "") * 60000
    } else if (text.includes('idx')){
      console.log("修改索引",text.replace(/[^0-9]/ig, ""))
      await puppet.messageSendText('wxid_gkc181kbu5bd22', '修改索引成功')
      idx = Number(text.replace(/[^0-9]/ig, ""))
      pageId = 0
      itemList = []
    }
  }
}

/**
 *
 * 7. Output the Welcome Message
 *
 */
const welcome = `
Puppet Version: ${puppet.version()}

Please wait... I'm trying to login in...

`
console.info(welcome)

/*
 *  @checkSign: 1 默认老版本验签  2 新版验签
 *  @appKey: 用户填写 appkey
 *  @appSecret: 用户填写 appSecret
 */
const sdk = new dtkSdk({ appKey: '60e806a122805', appSecret: '314745da894633d7bbf54c8311958b8c', checkSign: 1 });
/**
 * 获取商品信息(转链)
 */
function apiGetGoodsTicket(goodsId:any) {
  return sdk.request('https://openapi.dataoke.com/api/tb-service/get-privilege-link', {
    method: 'GET',
    /* 注意:form 里面就不用传appKey与appSecret  */
    form: { goodsId, version: 'v1.3.1' },
  })
}
/**
 * 根据淘口令获取商品信息
 */
function apiGetGoodsInfo(content:any) {
  return sdk.request('https://openapi.dataoke.com/api/tb-service/parse-content', {
    method: 'GET',
    /* 注意:form 里面就不用传appKey与appSecret  */
    form: { content, version: 'v1.3.1' },
  })
}
/**
 * 获取折上折商品信息
 */
function apiGetLikeGoods() {
  return sdk.request('https://openapi.dataoke.com/api/goods/super-discount-goods', {
    method: 'GET',
    /* 注意:form 里面就不用传appKey与appSecret  */
    form: { 
      pageSize,
      pageId,
      sort: 0,
      version: 'v1.3.1'
    },
  })
}

async function handleStart(){
  if(timer != null){
    clearInterval(timer)
  }
  // 一分钟执行一次
  timer = setInterval(() => {
    sendMessage()
  },time)
}
async function hanldeEnd(){
  clearInterval(timer)
}
async function sendMessage(){
  let txt = ''
  const _idx = idx % 10
  if((idx >= ((pageId * pageSize) - 1)) || itemList.length == 0){
    pageId = Math.floor(idx / 10) + 1
    const res = await apiGetLikeGoods()
    if(res.code == 0){
      itemList = res.data.list
    }
  }
  const res2 = await apiGetGoodsTicket(itemList[_idx].goodsId)
  if(res2.code == 0){
    // txt = decodeURIComponent(`${itemList[_idx].dtitle || itemList[_idx].dtitle}%0A卷后价：${res2.data.actualPrice}元起%0A${res2.data.tpwd}`)
    txt = decodeURIComponent(`${itemList[_idx].dtitle || itemList[_idx].dtitle}%0A券后价：${res2.data.actualPrice}元起%0A${res2.data.shortUrl}`)
  } else {
    console.log("网络错误",res2.msg)
    idx++
    return
  }
  if(!txt){
    await puppet.messageSendText('wxid_gkc181kbu5bd22', '网络错误')
    return
  }
  // await puppet.messageSendText('wxid_gkc181kbu5bd22', txt)
  await puppet.messageSendText('24777416763@chatroom', txt)
  await puppet.messageSendText('24827326691@chatroom', txt)
  console.log("发送成功",idx)
  await puppet.messageSendText('wxid_gkc181kbu5bd22', '发送成功' + idx)
  idx ++
}