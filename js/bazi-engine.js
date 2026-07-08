// ================================================================
// bazi/pillars.js - 四柱排盘模块
// 年柱、月柱、日柱、时柱
// ================================================================

function getYearGanZhi(y, m, d, h, mi) {
    let liChun = findJieQi(y, 315);
    let liChunJD = gregorianToJD(liChun.year, liChun.month, liChun.day, liChun.hour, liChun.minute);
    let birthJD = gregorianToJD(y, m, d, h, mi);
    let effYear = y;
    if (birthJD < liChunJD) effYear = y - 1;
    let gIdx = (effYear - 4) % 10, zIdx = (effYear - 4) % 12;
    if (gIdx < 0) gIdx += 10; if (zIdx < 0) zIdx += 12;
    return { gan: BA_TIAN_GAN[gIdx], zhi: BA_DI_ZHI[zIdx], ganZhi: BA_TIAN_GAN[gIdx] + BA_DI_ZHI[zIdx], year: effYear };
}
function getMonthGanZhi(y, m, d, h, mi) {
    const jieLons = [315, 345, 15, 45, 75, 105, 135, 165, 195, 225, 255, 285];
    const zhiMap = ["寅","卯","辰","巳","午","未","申","酉","戌","亥","子","丑"];
    let birthJD = gregorianToJD(y, m, d, h, mi);
    let possible = [];
    if (m === 1) possible = [11, 0]; else if (m === 2) possible = [0, 1]; else possible = [(m - 2) % 12, (m - 1) % 12];
    let mIdx = -1, jieQi = null;
    for (let idx of possible) {
        let jy = y; if (idx === 11 && m === 1) jy = y - 1;
        let jq = findJieQi(jy, jieLons[idx]);
        let jqJD = gregorianToJD(jq.year, jq.month, jq.day, jq.hour, jq.minute);
        let nIdx = (idx + 1) % 12, ny = jy; if (nIdx < idx) ny++;
        let njq = findJieQi(ny, jieLons[nIdx]);
        let njqJD = gregorianToJD(njq.year, njq.month, njq.day, njq.hour, njq.minute);
        if (birthJD >= jqJD && birthJD < njqJD) { mIdx = idx; jieQi = jq; break; }
    }
    if (mIdx === -1) {
        let lc = findJieQi(y, 315), lcJD = gregorianToJD(lc.year, lc.month, lc.day, lc.hour, lc.minute);
        if (birthJD < lcJD) {
            let xh = findJieQi(y - 1, 285), xhJD = gregorianToJD(xh.year, xh.month, xh.day, xh.hour, xh.minute);
            if (birthJD >= xhJD) { mIdx = 11; jieQi = xh; }
        }
    }
    if (mIdx === -1) { mIdx = (m + 1) % 12; if (mIdx < 0) mIdx += 12; }
    let zhi = zhiMap[mIdx], zIdx = dzIndex(zhi);
    let ygz = getYearGanZhi(y, m, d, h, mi), yg = ygz.gan;
    let startGan = { "甲":2,"己":2,"乙":4,"庚":4,"丙":6,"辛":6,"丁":8,"壬":8,"戊":0,"癸":0 }[yg];
    let gIdx = (startGan + mIdx) % 10;
    return { gan: BA_TIAN_GAN[gIdx], zhi, ganZhi: BA_TIAN_GAN[gIdx] + zhi, monthIndex: mIdx, jieQi };
}
function getDayGanZhi(y, m, d, h, mi) {
    let base = new Date(1900, 0, 31), target = new Date(y, m - 1, d);
    let diff = Math.floor((target - base) / 86400000);
    let gIdx = ((diff % 10) + 10) % 10, zIdx = ((diff % 12) + 12) % 12;
    return { gan: BA_TIAN_GAN[gIdx], zhi: BA_DI_ZHI[zIdx], ganZhi: BA_TIAN_GAN[gIdx] + BA_DI_ZHI[zIdx], ganIdx: gIdx, zhiIdx: zIdx };
}
function getTimeGanZhi(dayGan, hour) {
    let zIdx = Math.floor((hour + 1) / 2) % 12;
    let zhi = BA_DI_ZHI[zIdx];
    let startGan = { "甲":0,"己":0,"乙":2,"庚":2,"丙":4,"辛":4,"丁":6,"壬":6,"戊":8,"癸":8 }[dayGan];
    let gIdx = (startGan + zIdx) % 10;
    return { gan: BA_TIAN_GAN[gIdx], zhi, ganZhi: BA_TIAN_GAN[gIdx] + zhi, zhiIdx: zIdx };
}

window.getYearGanZhi = getYearGanZhi; window.getMonthGanZhi = getMonthGanZhi;
window.getDayGanZhi = getDayGanZhi; window.getTimeGanZhi = getTimeGanZhi;


// ================================================================
// bazi/shengke.js - 生克关系模块
// 十神、地支刑冲合害、天干合化
// ================================================================

function getShiShen(riGan, targetGan) {
    if (!targetGan) return "";
    let riYy = TG_YIN_YANG[riGan], tgtYy = TG_YIN_YANG[targetGan];
    let riWx = TG_WU_XING[riGan], tgtWx = TG_WU_XING[targetGan];
    let same = riYy === tgtYy;
    if (riWx === tgtWx) return same ? "比肩" : "劫财";
    if (isSheng(riWx, tgtWx)) return same ? "食神" : "伤官";
    if (isSheng(tgtWx, riWx)) return same ? "偏印" : "正印";
    if (isKe(riWx, tgtWx)) return same ? "偏财" : "正财";
    if (isKe(tgtWx, riWx)) return same ? "七杀" : "正官";
    return "";
}

function getDiZhiRelation(zhiList) {
    let he = [], chong = [], sanHe = [], xing = [], hai = [], po = [];
    let zSet = [...new Set(zhiList)];
    for (let i = 0; i < zSet.length; i++) {
        for (let j = i + 1; j < zSet.length; j++) {
            let a = zSet[i], b = zSet[j];
            if (LIU_HE[a] === b) he.push(`${a}${b}合`);
            if (LIU_CHONG[a] === b) chong.push(`${a}${b}冲`);
            if (XING[a] === b) xing.push(`${a}${b}刑`);
            if (HAI[a] === b) hai.push(`${a}${b}害`);
            if (PO[a] === b) po.push(`${a}${b}破`);
        }
    }
    for (let key in SAN_HE) {
        let z1 = key[0], z2 = key[1], z3 = key[2];
        if (zSet.includes(z1) && zSet.includes(z2) && zSet.includes(z3)) {
            sanHe.push(`${z1}${z2}${z3}三合${SAN_HE[key]}局`);
        }
    }
    return { he, chong, sanHe, xing, hai, po, hasRelation: he.length + chong.length + sanHe.length + xing.length + hai.length + po.length > 0 };
}

function getTianGanHe(ganList) {
    let he = [];
    for (let i = 0; i < ganList.length; i++) {
        for (let j = i + 1; j < ganList.length; j++) {
            let a = ganList[i], b = ganList[j];
            if (TIAN_GAN_HE[a] === b) {
                let key = a < b ? a + b : b + a;
                let hua = TIAN_GAN_HUA[key] || "";
                he.push(`${a}${b}合${hua ? '化' + hua : ''}`);
            }
        }
    }
    return he;
}

function getNayin(gz) {
    for (let i = 0; i < 60; i++) if (BA_TIAN_GAN[i % 10] + BA_DI_ZHI[i % 12] === gz) return NAYIN_60[i];
    return "未知";
}
function getXunKong(gz) {
    let gIdx = tgIndex(gz[0]), zIdx = dzIndex(gz[1]);
    let xun = (gIdx - zIdx + 12) % 12;
    return BA_DI_ZHI[(xun + 10) % 12] + BA_DI_ZHI[(xun + 11) % 12];
}

window.getShiShen = getShiShen; window.getDiZhiRelation = getDiZhiRelation;
window.getTianGanHe = getTianGanHe; window.getNayin = getNayin; window.getXunKong = getXunKong;


// ================================================================
// bazi/wangsheng.js - 旺衰分析模块
// 月令旺衰、通根、十二长生状态
// ================================================================

function getWangShuai(riGan, monthZhi) {
    let riWx = TG_WU_XING[riGan], mWx = DZ_WU_XING[monthZhi];
    let season = ["寅","卯"].includes(monthZhi) ? "春" : ["巳","午"].includes(monthZhi) ? "夏" : ["申","酉"].includes(monthZhi) ? "秋" : ["亥","子"].includes(monthZhi) ? "冬" : "四季";
    let map = {
        "木": { "春":"旺","夏":"休","秋":"死","冬":"相","四季":"囚" },
        "火": { "春":"相","夏":"旺","秋":"囚","冬":"死","四季":"休" },
        "土": { "春":"死","夏":"相","秋":"休","冬":"囚","四季":"旺" },
        "金": { "春":"囚","夏":"死","秋":"旺","冬":"休","四季":"相" },
        "水": { "春":"休","夏":"囚","秋":"相","冬":"旺","四季":"死" }
    };
    let base = map[riWx][season];
    let gen = (CANG_GAN[monthZhi] || []).includes(riGan);
    let level = "平";
    if (base === "旺" && gen) level = "强"; else if (base === "旺") level = "偏强";
    else if (base === "相" && gen) level = "偏强"; else if (base === "相") level = "中和";
    else if (base === "休") level = "偏弱"; else if (base === "囚" || base === "死") level = "弱";
    return { baseWang: base, tongGen: gen, season, level, desc: `日主${riGan}（${riWx}）生于${monthZhi}月（${season}），月令${base}，${gen ? "地支通根" : "地支无根"}，日主${level}。` };
}

function getShiErChangSheng(riGan, zhi) {
    let zhiIdx = dzIndex(zhi);
    let arr = SHI_ER_CHANG_SHENG[riGan];
    if (!arr) return "";
    let idx = arr.indexOf(zhi);
    if (idx < 0) return "";
    return CHANG_SHENG_NAME[idx];
}

window.getWangShuai = getWangShuai; window.getShiErChangSheng = getShiErChangSheng;


// ================================================================
// bazi/pattern.js - 格局分析模块
// 月令透干取格、从格、化气格判定
// ================================================================

function getGeJu(riGan, monthZhi, monthGan, siZhu) {
    let benQi = (CANG_GAN[monthZhi] || [])[0];
    let tgList = [siZhu.year.gan, siZhu.month.gan, siZhu.day.gan, siZhu.time.gan];
    let target = monthGan, source = "月干透出";
    if (getShiShen(riGan, monthGan) !== getShiShen(riGan, benQi)) {
        for (let g of tgList) { if (g === benQi) { target = g; source = "月令本气透干"; break; } }
    }
    let ss = getShiShen(riGan, target);
    let geJu = ss;
    let desc = GE_JU_MAP[ss] || "格局不明，需综合判断。";
    return { geJu, target, source, desc };
}

window.getGeJu = getGeJu;


// ================================================================
// bazi/yongshen.js - 用神系统模块
// 调候用神（穷通宝鉴）、喜用神、忌神
// ================================================================

const TIAO_HOU = {
    "甲": { "寅":"丙癸","卯":"庚丙戊","辰":"庚丁壬","巳":"癸庚丁","午":"癸庚丁","未":"癸庚丁","申":"庚丁壬","酉":"庚丁壬","戌":"庚丁壬","亥":"庚戊丁","子":"丁庚丙","丑":"丙丁庚" },
    "乙": { "寅":"丙癸","卯":"癸丙戊","辰":"癸丙戊","巳":"癸丙戊","午":"癸丙戊","未":"癸丙戊","申":"丙癸","酉":"癸丙","戌":"丙癸","亥":"丙戊","子":"丙戊","丑":"丙戊" },
    "丙": { "寅":"壬庚","卯":"壬己","辰":"壬甲","巳":"壬庚癸","午":"壬庚","未":"壬庚","申":"壬戊","酉":"壬癸","戌":"壬甲","亥":"甲戊庚壬","子":"壬戊庚","丑":"壬甲" },
    "丁": { "寅":"甲庚","卯":"庚甲","辰":"甲庚","巳":"甲庚","午":"壬庚","未":"甲庚壬","申":"甲庚丙","酉":"甲庚丙","戌":"甲庚","亥":"甲庚","子":"甲庚","丑":"甲庚" },
    "戊": { "寅":"丙甲癸","卯":"丙甲癸","辰":"甲丙癸","巳":"甲丙癸","午":"壬甲丙","未":"癸丙甲","申":"丙癸甲","酉":"丙癸","戌":"甲丙癸","亥":"丙甲","子":"丙甲","丑":"丙甲" },
    "己": { "寅":"丙癸甲","卯":"癸丙甲","辰":"丙癸甲","巳":"癸丙","午":"癸丙","未":"癸丙","申":"丙癸","酉":"丙癸","戌":"甲丙癸","亥":"丙甲戊","子":"丙甲戊","丑":"丙甲戊" },
    "庚": { "寅":"戊甲丙","卯":"丁甲丙","辰":"甲丁","巳":"壬戊丙丁","午":"壬丙","未":"丁甲","申":"丁甲","酉":"丁甲丙","戌":"甲丁","亥":"丁甲","子":"丁甲丙","丑":"丙丁甲" },
    "辛": { "寅":"己壬庚","卯":"壬甲","辰":"壬甲","巳":"壬甲癸","午":"壬己癸","未":"壬庚甲","申":"壬甲戊","酉":"壬甲","戌":"壬甲","亥":"壬丙","子":"壬丙戊","丑":"丙壬戊甲" },
    "壬": { "寅":"庚丙戊","卯":"戊庚辛","辰":"甲庚","巳":"庚癸戊","午":"癸庚","未":"辛甲癸","申":"戊丁","酉":"甲庚","戌":"甲庚","亥":"戊庚丙","子":"戊丙","丑":"甲丙" },
    "癸": { "寅":"辛丙","卯":"庚辛","辰":"丙辛甲","巳":"辛","午":"庚辛壬","未":"庚辛壬","申":"丁甲","酉":"辛丙","戌":"辛甲壬","亥":"庚戊","子":"丙辛","丑":"丙辛" }
};

function getTiaoHou(riGan, monthZhi) {
    let th = TIAO_HOU[riGan];
    if (!th) return { yongShen: "", desc: "" };
    let ys = th[monthZhi] || "";
    let desc = ys ? `《穷通宝鉴》调候用神：${ys}。${riGan}日主生于${monthZhi}月，需${ys.split('').join('、')}调候。` : "暂无调候用神数据。";
    return { yongShen: ys, desc };
}

function getXiYongShen(riGan, wangShuai, siZhu) {
    let riWx = TG_WU_XING[riGan];
    let level = wangShuai.level;
    let shengWo = { "金":"土","木":"水","水":"金","火":"木","土":"火" }[riWx];
    let keWo = { "金":"火","木":"金","水":"土","火":"水","土":"木" }[riWx];
    let woSheng = { "金":"水","木":"火","水":"木","火":"土","土":"金" }[riWx];
    let woKe = { "金":"木","木":"土","水":"火","火":"金","土":"水" }[riWx];
    let tongWo = riWx;
    let xiShen, yongShen, jiShen;
    if (level === "强" || level === "偏强") {
        xiShen = [woKe, woSheng, keWo]; yongShen = woKe; jiShen = [tongWo, shengWo];
    } else if (level === "弱" || level === "偏弱") {
        xiShen = [shengWo, tongWo]; yongShen = shengWo; jiShen = [woKe, woSheng, keWo];
    } else {
        xiShen = [shengWo, tongWo, woKe]; yongShen = shengWo; jiShen = [keWo];
    }
    let xiShenNames = xiShen.map(wx => {
        if (wx === shengWo) return "印（生扶）"; if (wx === tongWo) return "比劫（帮身）";
        if (wx === woKe) return "财（耗泄）"; if (wx === woSheng) return "食伤（泄秀）";
        if (wx === keWo) return "官杀（克制）"; return wx;
    });
    return {
        xiShen: xiShenNames.join("、"),
        yongShen: { "金":"金","木":"木","水":"水","火":"火","土":"土" }[yongShen] + "（" + (yongShen === shengWo ? "印" : yongShen === tongWo ? "比劫" : yongShen === woKe ? "财" : yongShen === woSheng ? "食伤" : "官杀") + "）",
        jiShenDesc: `忌神：${jiShen.map(wx=>{const m={"金":"金","木":"木","水":"水","火":"火","土":"土"};return m[wx];}).join("、")}`,
        desc: `日主${level}，喜${xiShenNames.join("、")}，用神取${yongShen === shengWo ? "印星" : yongShen === tongWo ? "比劫" : yongShen === woKe ? "财星" : yongShen === woSheng ? "食伤" : "官杀"}。`
    };
}

window.getTiaoHou = getTiaoHou; window.getXiYongShen = getXiYongShen; window.TIAO_HOU = TIAO_HOU;


// ================================================================
// bazi/minggong.js - 命宫系统模块
// 胎元、命宫、身宫
// ================================================================

function getTaiYuanMingGong(riGan, monthGZ, timeGZ, yearGZ) {
    let mg = monthGZ[0], mz = monthGZ[1];
    let mgIdx = tgIndex(mg), mzIdx = dzIndex(mz);
    let tyGan = BA_TIAN_GAN[(mgIdx + 1) % 10];
    let tyZhi = BA_DI_ZHI[(mzIdx + 3) % 12];
    let taiYuan = tyGan + tyZhi;

    let mingZhiIdx = (26 - (mzIdx + dzIndex(timeGZ[1]))) % 12;
    let mingZhi = BA_DI_ZHI[mingZhiIdx];
    let huStart = { "甲":0,"己":0,"乙":2,"庚":2,"丙":4,"辛":4,"丁":6,"壬":6,"戊":8,"癸":8 }[yearGZ[0]];
    let mingGanIdx = (huStart + mingZhiIdx) % 10;
    let mingGan = BA_TIAN_GAN[mingGanIdx];
    let mingGong = mingGan + mingZhi;

    let shenZhiIdx = (mzIdx + dzIndex(timeGZ[1]) + 1) % 12;
    let shenZhi = BA_DI_ZHI[shenZhiIdx];
    let shenGanIdx = (huStart + shenZhiIdx) % 10;
    let shenGan = BA_TIAN_GAN[shenGanIdx];
    let shenGong = shenGan + shenZhi;

    return { taiYuan, mingGong, shenGong };
}

window.getTaiYuanMingGong = getTaiYuanMingGong;


// ================================================================
// bazi/shensha.js - 神煞系统模块
// 24+项神煞及详细释义
// ================================================================

function getShenSha(dayGZ, yearGZ) {
    let dg = dayGZ[0], dz = dayGZ[1], yz = yearGZ[1];
    let res = [];
    let ty = { "甲":["丑","未"],"戊":["丑","未"],"庚":["丑","未"],"乙":["子","申"],"己":["子","申"],"丙":["亥","酉"],"丁":["亥","酉"],"壬":["巳","卯"],"癸":["巳","卯"],"辛":["午","寅"] };
    if (ty[dg] && (ty[dg].includes(dz) || ty[dg].includes(yz))) res.push({name:"天乙贵人",desc:"逢凶化吉，遇难成祥，一生贵人多助。"});
    let wc = { "甲":"巳","乙":"午","丙":"申","戊":"申","丁":"酉","己":"酉","庚":"亥","辛":"子","壬":"寅","癸":"卯" };
    if (wc[dg] && (wc[dg] === dz || wc[dg] === yz)) res.push({name:"文昌贵人",desc:"聪明好学，文采出众，利于考试功名。"});
    let th = { "申":"酉","子":"酉","辰":"酉","巳":"午","酉":"午","丑":"午","寅":"卯","午":"卯","戌":"卯","亥":"子","卯":"子","未":"子" };
    if (th[yz] === dz) res.push({name:"桃花",desc:"人缘好，感情丰富，易有异性缘。"});
    let ym = { "申":"寅","子":"寅","辰":"寅","巳":"亥","酉":"亥","丑":"亥","寅":"申","午":"申","戌":"申","亥":"巳","卯":"巳","未":"巳" };
    if (ym[yz] === dz) res.push({name:"驿马",desc:"好动不喜静，多奔波远行，变动多。"});
    let jx = { "寅":"午","午":"午","戌":"午","巳":"酉","酉":"酉","丑":"酉","申":"子","子":"子","辰":"子","亥":"卯","卯":"卯","未":"卯" };
    if (jx[yz] === dz) res.push({name:"将星",desc:"有领导才能，权威日重，掌权柄。"});
    let hg = { "寅":"戌","午":"戌","戌":"戌","巳":"丑","酉":"丑","丑":"丑","申":"辰","子":"辰","辰":"辰","亥":"未","卯":"未","未":"未" };
    if (hg[yz] === dz) res.push({name:"华盖",desc:"聪明好学，喜艺术宗教，孤高。"});
    return res;
}

function getAllShenSha(dayGZ, yearGZ, monthGZ, siZhu) {
    let dg = dayGZ[0], dz = dayGZ[1], yg = yearGZ[0], yz = yearGZ[1], mg = monthGZ[0], mz = monthGZ[1];
    let zhiList = [siZhu.year.zhi, siZhu.month.zhi, siZhu.day.zhi, siZhu.time.zhi];
    let res = getShenSha(dayGZ, yearGZ);

    let tianDe = { "寅":"丁","卯":"申","辰":"壬","巳":"辛","午":"甲","未":"癸","申":"寅","酉":"丙","戌":"乙","亥":"巳","子":"庚","丑":"戊" };
    if (tianDe[mz] && (tianDe[mz] === dg || tianDe[mz] === yg || tianDe[mz] === mg)) res.push({name:"天德贵人",desc:"天地德秀之气，逢凶化吉，积德行善。"});

    let yueDe = { "寅":"丙","卯":"甲","辰":"壬","巳":"庚","午":"丙","未":"甲","申":"壬","酉":"庚","戌":"丙","亥":"甲","子":"壬","丑":"庚" };
    if (yueDe[mz] && (yueDe[mz] === dg || yueDe[mz] === yg || yueDe[mz] === mg)) res.push({name:"月德贵人",desc:"阴德之吉神，心地善良，福分深厚。"});

    let luShen = { "甲":"寅","乙":"卯","丙":"巳","丁":"午","戊":"巳","己":"午","庚":"申","辛":"酉","壬":"亥","癸":"子" };
    if (luShen[dg] && zhiList.includes(luShen[dg])) res.push({name:"禄神",desc:"养命之源，福禄寿喜，财禄丰厚。"});

    let yangRen = { "甲":"卯","乙":"寅","丙":"午","丁":"巳","戊":"午","己":"巳","庚":"酉","辛":"申","壬":"子","癸":"亥" };
    if (yangRen[dg] && zhiList.includes(yangRen[dg])) res.push({name:"羊刃",desc:"刚强果断，有魄力，但易冲动伤身。"});

    let jinYu = { "甲":"辰","乙":"巳","丙":"未","丁":"申","戊":"未","己":"申","庚":"戌","辛":"亥","壬":"丑","癸":"寅" };
    if (jinYu[dg] && zhiList.includes(jinYu[dg])) res.push({name:"金舆",desc:"富贵之车，聪明富贵，性柔貌愿。"});

    if (dayGZ === "庚辰" || dayGZ === "庚戌" || dayGZ === "壬辰" || dayGZ === "戊戌") res.push({name:"魁罡",desc:"聪明果断，刚烈不屈，掌权柄，但婚姻易有波折。"});

    let xueTang = { "甲":"亥","乙":"午","丙":"寅","丁":"酉","戊":"寅","己":"酉","庚":"巳","辛":"子","壬":"申","癸":"卯" };
    if (xueTang[dg] && zhiList.includes(xueTang[dg])) res.push({name:"学堂",desc:"聪明有学识，利于读书考试，文章振发。"});

    let ciGuan = { "甲":"寅","乙":"卯","丙":"巳","丁":"午","戊":"巳","己":"午","庚":"申","辛":"酉","壬":"亥","癸":"子" };
    if (ciGuan[dg] && zhiList.includes(ciGuan[dg])) res.push({name:"词馆",desc:"才华横溢，擅长文章诗词，学业有成。"});

    let hongLuan = { "子":"卯","丑":"寅","寅":"丑","卯":"子","辰":"亥","巳":"戌","午":"酉","未":"申","申":"未","酉":"午","戌":"巳","亥":"辰" };
    if (hongLuan[yz] && zhiList.includes(hongLuan[yz])) res.push({name:"红鸾",desc:"姻缘之星，主婚姻喜庆，感情顺利。"});

    let tianXi = { "子":"酉","丑":"申","寅":"未","卯":"午","辰":"巳","巳":"辰","午":"卯","未":"寅","申":"丑","酉":"子","戌":"亥","亥":"戌" };
    if (tianXi[yz] && zhiList.includes(tianXi[yz])) res.push({name:"天喜",desc:"喜庆之星，主生子、升迁、发财等喜事。"});

    let guChen = { "亥":"寅","子":"寅","丑":"寅","寅":"巳","卯":"巳","辰":"巳","巳":"申","午":"申","未":"申","申":"亥","酉":"亥","戌":"亥" };
    if (guChen[yz] && zhiList.includes(guChen[yz])) res.push({name:"孤辰",desc:"孤独之星，性格孤僻，六亲缘薄。"});

    let guaSu = { "亥":"戌","子":"戌","丑":"戌","寅":"丑","卯":"丑","辰":"丑","巳":"辰","午":"辰","未":"辰","申":"未","酉":"未","戌":"未" };
    if (guaSu[yz] && zhiList.includes(guaSu[yz])) res.push({name:"寡宿",desc:"寡独之星，婚姻易有波折，性格独立。"});

    if (zhiList.includes("辰")) res.push({name:"天罗",desc:"辰为天罗，主困顿阻滞，谋事难成。"});
    if (zhiList.includes("戌")) res.push({name:"地网",desc:"戌为地网，主疾病牢狱，需谨慎防范。"});

    let jieSha = { "申":"巳","子":"巳","辰":"巳","巳":"寅","酉":"寅","丑":"寅","寅":"亥","午":"亥","戌":"亥","亥":"申","卯":"申","未":"申" };
    if (jieSha[yz] && zhiList.includes(jieSha[yz])) res.push({name:"劫煞",desc:"主破财、劫难、是非，需谨慎理财。"});

    let zaiSha = { "申":"午","子":"午","辰":"午","巳":"卯","酉":"卯","丑":"卯","寅":"子","午":"子","戌":"子","亥":"酉","卯":"酉","未":"酉" };
    if (zaiSha[yz] && zhiList.includes(zaiSha[yz])) res.push({name:"灾煞",desc:"主灾病、横祸，需积德行善化解。"});

    let wangShen = { "申":"亥","子":"亥","辰":"亥","巳":"申","酉":"申","丑":"申","寅":"巳","午":"巳","戌":"巳","亥":"寅","卯":"寅","未":"寅" };
    if (wangShen[yz] && zhiList.includes(wangShen[yz])) res.push({name:"亡神",desc:"主心机深沉，智谋过人，但易有官非。"});

    let yuanChen = { "子":"未","丑":"申","寅":"酉","卯":"戌","辰":"亥","巳":"子","午":"丑","未":"寅","申":"卯","酉":"辰","戌":"巳","亥":"午" };
    if (yuanChen[yz] && zhiList.includes(yuanChen[yz])) res.push({name:"元辰",desc:"大耗之星，主破财、耗散，不善理财。"});

    let xunKong = getXunKong(dayGZ);
    if (zhiList.some(z => xunKong.includes(z))) res.push({name:"旬空",desc:"空亡之地，主虚而不实，所求之事多落空。"});

    return res;
}

window.getShenSha = getShenSha; window.getAllShenSha = getAllShenSha;


// ================================================================
// bazi/dayun.js - 大运流年模块
// 大运、小运、流年、吉凶分析
// ================================================================

function getDaYun(yearGZ, monthGZ, gender, by, bm, bd, bh, bmi) {
    let yg = yearGZ[0], yy = TG_YIN_YANG[yg];
    let isMale = gender === "男";
    let forward = (yy === "阳" && isMale) || (yy === "阴" && !isMale);
    let mg = monthGZ[0], mz = monthGZ[1];
    let mgIdx = tgIndex(mg), mzIdx = dzIndex(mz);
    let dy = [];
    for (let i = 0; i < 12; i++) {
        let gIdx = forward ? (mgIdx + i + 1) % 10 : (mgIdx - i - 1 + 10) % 10;
        let zIdx = forward ? (mzIdx + i + 1) % 12 : (mzIdx - i - 1 + 12) % 12;
        dy.push({ ganZhi: BA_TIAN_GAN[gIdx] + BA_DI_ZHI[zIdx], gan: BA_TIAN_GAN[gIdx], zhi: BA_DI_ZHI[zIdx] });
    }
    let birthJD = gregorianToJD(by, bm, bd, bh, bmi);
    let jieLons = [315, 345, 15, 45, 75, 105, 135, 165, 195, 225, 255, 285];
    let zhiMap = ["寅","卯","辰","巳","午","未","申","酉","戌","亥","子","丑"];
    let mIdx = zhiMap.indexOf(mz);
    let nearestJD = null, nearestJie = null;
    if (forward) {
        let nIdx = (mIdx + 1) % 12, ny = by; if (nIdx < mIdx) ny++;
        let nj = findJieQi(ny, jieLons[nIdx]);
        nearestJD = gregorianToJD(nj.year, nj.month, nj.day, nj.hour, nj.minute); nearestJie = nj;
    } else {
        let pIdx = (mIdx + 11) % 12, py = by; if (pIdx > mIdx) py--;
        let pj = findJieQi(py, jieLons[pIdx]);
        nearestJD = gregorianToJD(pj.year, pj.month, pj.day, pj.hour, pj.minute); nearestJie = pj;
    }
    let diff = Math.abs(nearestJD - birthJD);
    let qy = diff / 3;
    let qyY = Math.floor(qy), qyM = Math.floor((qy - qyY) * 12);
    let age = qyY;
    for (let i = 0; i < dy.length; i++) {
        dy[i].startAge = age; dy[i].endAge = age + 9;
        dy[i].startYear = by + age; dy[i].endYear = by + age + 9;
        age += 10;
    }
    return { daYun: dy, qiYunAge: qyY, qiYunMonth: qyM, isForward: forward, nearestJie };
}

function getXiaoYun(gender, yearGZ, startAge, count) {
    let yg = yearGZ[0], yy = TG_YIN_YANG[yg];
    let isMale = gender === "男";
    let forward = (yy === "阳" && isMale) || (yy === "阴" && !isMale);
    let startGanIdx = tgIndex(yearGZ[0]);
    let startZhiIdx = dzIndex(yearGZ[1]);
    let xy = [];
    for (let i = 0; i < count; i++) {
        let gIdx = forward ? (startGanIdx + i + 1) % 10 : (startGanIdx - i - 1 + 10) % 10;
        let zIdx = forward ? (startZhiIdx + i + 1) % 12 : (startZhiIdx - i - 1 + 12) % 12;
        xy.push({ ganZhi: BA_TIAN_GAN[gIdx] + BA_DI_ZHI[zIdx], age: startAge + i });
    }
    return xy;
}

function getLiuNian(startYear, count) {
    let ln = [];
    for (let i = 0; i < count; i++) {
        let year = startYear + i;
        let gIdx = (year - 4) % 10, zIdx = (year - 4) % 12;
        if (gIdx < 0) gIdx += 10; if (zIdx < 0) zIdx += 12;
        ln.push({ year, ganZhi: BA_TIAN_GAN[gIdx] + BA_DI_ZHI[zIdx] });
    }
    return ln;
}

function getDaYunJiXiong(riGan, riWx, daYun, wangShuai) {
    let res = [];
    for (let i = 0; i < Math.min(6, daYun.length); i++) {
        let dy = daYun[i];
        let ss = getShiShen(riGan, dy.gan);
        let level = wangShuai.level;
        let jiXiong = "平", desc = "";
        if (level === "强" || level === "偏强") {
            if (["财","食伤","官杀"].some(k=>ss.includes(k))) { jiXiong = "吉"; desc = "泄耗得力，运势通畅"; }
            else if (["印","比劫"].some(k=>ss.includes(k))) { jiXiong = "凶"; desc = "比劫争财，印星过重"; }
        } else if (level === "弱" || level === "偏弱") {
            if (["印","比劫"].some(k=>ss.includes(k))) { jiXiong = "吉"; desc = "印比生扶，运势转好"; }
            else if (["财","食伤","官杀"].some(k=>ss.includes(k))) { jiXiong = "凶"; desc = "克泄交加，运势低迷"; }
        } else { jiXiong = "平"; desc = "运势平稳，宜守不宜攻"; }
        res.push({ ganZhi: dy.ganZhi, shiShen: ss, jiXiong, desc, age: `${dy.startAge}-${dy.endAge}岁` });
    }
    return res;
}

window.getDaYun = getDaYun; window.getXiaoYun = getXiaoYun;
window.getLiuNian = getLiuNian; window.getDaYunJiXiong = getDaYunJiXiong;


// ================================================================
// bazi/liuqin.js - 六亲分析模块
// 父母、配偶、子女、兄弟姐妹
// ================================================================

function getLiuQin(riGan, gender, siZhu, shiShen) {
    let res = {};
    let ssList = [shiShen.year.gan, shiShen.month.gan, shiShen.day.gan, shiShen.time.gan];
    let hasCai = ssList.some(s => s && s.includes("财"));
    let hasGuan = ssList.some(s => s && s.includes("官"));
    let hasYin = ssList.some(s => s && s.includes("印"));
    let hasShi = ssList.some(s => s && s.includes("食") || s && s.includes("伤"));
    let hasBi = ssList.some(s => s && s.includes("比") || s && s.includes("劫"));

    if (gender === "男") {
        res.father = hasCai ? "偏财透干，父缘深厚，父亲有能力。" : "父缘一般，需多关心父亲健康。";
        res.mother = hasYin ? "正印透干，母慈子孝，母亲庇护。" : "母缘一般，需独立自强。";
        res.wife = ssList.some(s=>s==="正财") ? "正财为妻，妻贤内助，婚姻稳定。" : hasCai ? "偏财为妻，感情丰富，需专一。" : "妻缘待看，宜晚婚或经人介绍。";
        res.children = hasShi ? "食伤为子女，子女缘厚，子女聪明。" : "子嗣待看，需结合大运流年。";
        res.brother = hasBi ? "比劫为兄弟，兄弟多助，但易争财。" : "兄弟缘薄，宜独立发展。";
    } else {
        res.father = ssList.some(s=>s==="正财") ? "正财为父，父缘深厚。" : "父缘一般。";
        res.mother = ssList.some(s=>s==="偏印") ? "偏印为母，母缘深厚。" : hasYin ? "正印为母，母慈女孝。" : "母缘一般。";
        res.husband = hasGuan ? "正官为夫，夫星明现，有望嫁得良缘。" : "夫缘待看，宜主动争取。";
        res.children = hasShi ? "食神为女，伤官为子，子女缘厚。" : "子女缘待看。";
        res.brother = hasBi ? "比劫为姐妹，姐妹多助。" : "姐妹缘薄。";
    }
    return res;
}

window.getLiuQin = getLiuQin;


// ================================================================
// bazi/zhuanxiang.js - 专项分析模块
// 婚姻、事业、健康、财运
// ================================================================

function getZhuanXiang(riGan, gender, siZhu, shiShen, wangShuai, shenSha) {
    let res = { marriage: "", career: "", health: "", wealth: "" };
    let ssList = [shiShen.year.gan, shiShen.month.gan, shiShen.day.gan, shiShen.time.gan];
    let hasCai = ssList.some(s => s && s.includes("财"));
    let hasGuan = ssList.some(s => s && s.includes("官"));
    let hasYin = ssList.some(s => s && s.includes("印"));
    let hasShi = ssList.some(s => s && (s.includes("食") || s.includes("伤")));
    let hasBi = ssList.some(s => s && (s.includes("比") || s.includes("劫")));
    let hasSha = ssList.some(s => s && s.includes("杀"));

    // 婚姻
    if (gender === "男") {
        if (hasCai) res.marriage = "财星明现，异性缘佳，婚姻有望。正财为妻，偏财为情人，需专一为宜。若财多身弱，则易为情所困。";
        else if (hasShi) res.marriage = "食伤生财，可通过才华吸引异性，但需防口舌伤感情。食伤旺则克官杀，不利婚姻稳定。";
        else res.marriage = "财星不显，婚姻需耐心等待，宜通过长辈介绍或晚婚。命中无财，需大运流年补之。";
    } else {
        if (hasGuan) res.marriage = "官星明现，夫缘深厚，有望嫁得良缘。正官为正夫，七杀为偏夫，官杀混杂需防感情波折。";
        else if (hasCai) res.marriage = "财生官星，可助夫兴家，但需防财多身弱。无官看财，财旺可生官。";
        else res.marriage = "官星不显，婚姻需主动争取，宜晚婚。命中无官，需大运流年补之。";
    }

    // 事业
    if (hasGuan && hasYin) res.career = "官印相生，利于仕途公职，有掌权之象。印化杀生身，权威日重，宜从政、管理、行政。";
    else if (hasCai && hasGuan) res.career = "财官相生，利于经商管理，富贵双全。财生官旺，宜从商、金融、投资。";
    else if (hasShi && hasCai) res.career = "食伤生财，利于技艺、艺术、创作、自由职业。才华横溢，靠专长立身。";
    else if (hasBi && hasCai) res.career = "比劫夺财，事业竞争激烈，需合作共事。不宜单打独斗，宜合伙经营。";
    else if (hasYin) res.career = "印星护身，利于学术、教育、文化、研究。宜从事教师、学者、研究员等职业。";
    else if (hasSha && hasYin) res.career = "杀印相生，威权显赫，宜军警、司法、外科医生等武职。";
    else res.career = "事业需结合大运流年具体分析，当前宜积累经验，提升技能，等待时机。";

    // 健康
    let riWx = TG_WU_XING[riGan];
    let weakWx = wangShuai.level === "弱" || wangShuai.level === "偏弱" ? riWx : "";
    if (weakWx === "木") res.health = "木弱，需注意肝胆、筋骨、神经系统。宜早睡早起，多食绿色蔬菜，少饮酒。";
    else if (weakWx === "火") res.health = "火弱，需注意心脏、眼睛、血液循环。宜保持心情愉快，避免过度劳累。";
    else if (weakWx === "土") res.health = "土弱，需注意脾胃、消化系统。宜饮食规律，少食生冷油腻。";
    else if (weakWx === "金") res.health = "金弱，需注意肺、呼吸系统、大肠。宜多做深呼吸，避免吸烟。";
    else if (weakWx === "水") res.health = "水弱，需注意肾、泌尿系统、生殖系统。宜多饮水，避免熬夜。";
    else res.health = "日主不弱，身体素质尚可，注意劳逸结合，保持规律作息即可。";

    // 财运
    if (hasCai && (wangShuai.level === "强" || wangShuai.level === "偏强")) res.wealth = "身旺财旺，财运亨通，可主动求财。宜投资、创业，把握机遇。";
    else if (hasCai && (wangShuai.level === "弱" || wangShuai.level === "偏弱")) res.wealth = "身弱财旺，财多身弱，需合作求财或等待身旺大运。不宜冒险投资，宜稳健理财。";
    else if (!hasCai) res.wealth = "财星不显，财运平稳，需靠技艺或工资收入。宜提升技能，靠专长赚钱。";
    else res.wealth = "财运中等，需结合大运流年把握时机。宜开源节流，积少成多。";

    return res;
}

window.getZhuanXiang = getZhuanXiang;


// ================================================================
// bazi/ziwei.js - 紫微斗数简化模块
// ================================================================

const ZI_WEI_GONG = ["命宫","兄弟","夫妻","子女","财帛","疾厄","迁移","仆役","官禄","田宅","福德","父母"];

function getZiWeiPan(birthYear, birthMonth, birthDay, birthHour, gender) {
    let yearGanIdx = (birthYear - 4) % 10;
    let yearZhiIdx = (birthYear - 4) % 12;
    let hourIdx = Math.floor((birthHour + 1) / 2) % 12;
    let mingIdx = (2 + birthMonth - 1 - hourIdx + 12) % 12;
    let shenIdx = (2 + birthMonth - 1 + hourIdx) % 12;
    let wuXingJu = ["水二局","木三局","金四局","土五局","火六局"][(birthYear + birthMonth) % 5];

    let gongWei = [];
    for (let i = 0; i < 12; i++) {
        let gongIdx = (mingIdx + i) % 12;
        let stars = [];
        if (i === 0) stars.push("紫微");
        if (i === 1) stars.push("天机");
        if (i === 3) stars.push("太阳");
        if (i === 4) stars.push("武曲");
        if (i === 5) stars.push("天同");
        if (i === 7) stars.push("廉贞");
        if (i === 6) stars.push("天府");
        if (i === 9) stars.push("太阴");
        if (gongIdx === shenIdx) stars.push("身宫");
        let seed = (birthYear + birthMonth + birthDay + i) % 100;
        if (seed % 7 === 0) stars.push("文昌");
        if (seed % 11 === 0) stars.push("文曲");
        if (seed % 13 === 0) stars.push("天魁");
        if (seed % 17 === 0) stars.push("天钺");
        if (seed % 3 === 0) stars.push("火星");
        if (seed % 5 === 0) stars.push("铃星");
        gongWei.push({ gong: ZI_WEI_GONG[i], zhi: BA_DI_ZHI[gongIdx], stars, isMing: i === 0, isShen: gongIdx === shenIdx });
    }
    return { mingIdx, shenIdx, wuXingJu, gongWei, note: "此为简化版紫微斗数排盘，仅供参考学习。完整排盘需安十四主星、辅星、四化、大限等复杂算法。" };
}

window.getZiWeiPan = getZiWeiPan; window.ZI_WEI_GONG = ZI_WEI_GONG;


// ================================================================
// bazi/congge.js - 从格与化气格判定模块
// ================================================================

function getCongGe(riGan, siZhu, cangGan, wangShuai) {
    const riWx = TG_WU_XING[riGan];
    const allGan = [siZhu.year.gan, siZhu.month.gan, siZhu.time.gan];
    const allZhi = [siZhu.year.zhi, siZhu.month.zhi, siZhu.day.zhi, siZhu.time.zhi];

    let congType = "";
    let desc = "";
    let isCongGe = false;

    // 统计十神
    let yinCount = 0, biJieCount = 0, caiCount = 0, guanCount = 0, shiCount = 0;
    allGan.forEach(g => {
        const ss = getShiShen(riGan, g);
        if (ss && ss.includes("印")) yinCount++;
        if (ss && (ss.includes("比") || ss.includes("劫"))) biJieCount++;
        if (ss && ss.includes("财")) caiCount++;
        if (ss && (ss.includes("官") || ss.includes("杀"))) guanCount++;
        if (ss && (ss.includes("食") || ss.includes("伤"))) shiCount++;
    });

    // 检查地支藏干
    let hasRoot = false;
    allZhi.forEach(z => {
        const cg = CANG_GAN[z] || [];
        cg.forEach(g => {
            const ss = getShiShen(riGan, g);
            if (ss && (ss.includes("印") || ss.includes("比") || ss.includes("劫"))) {
                hasRoot = true;
            }
        });
    });

    // 从强格：日主极旺，印比多，无财官食伤或极弱
    if ((wangShuai.level === "强" || wangShuai.level === "偏强") && 
        (yinCount + biJieCount >= 3) && caiCount === 0 && guanCount === 0 && shiCount === 0) {
        congType = "从强格";
        desc = "日主极旺，满盘印比，无财官食伤克泄，为从强格。喜印比生扶，忌财官食伤克泄。行印比运则富贵，行克泄运则破败。";
        isCongGe = true;
    }
    // 从弱格系列：日主弱极，无印比生扶
    else if ((wangShuai.level === "弱" || wangShuai.level === "偏弱") && 
             !hasRoot && yinCount === 0 && biJieCount === 0) {
        if (caiCount >= 2 && guanCount === 0 && shiCount === 0) {
            congType = "从财格";
            desc = "日主弱极，财星独旺，无印比生扶，为从财格。喜财食伤，忌印比。行财运则大发，行印比运则破财。";
        } else if (guanCount >= 2 && caiCount === 0 && shiCount === 0) {
            congType = "从杀格";
            desc = "日主弱极，官杀独旺，无印比生扶，为从杀格。喜官杀财，忌印比食伤。行官杀运则显达，行印比运则灾病。";
        } else if (shiCount >= 2 && caiCount === 0 && guanCount === 0) {
            congType = "从儿格";
            desc = "日主弱极，食伤独旺，无印比生扶，为从儿格。喜食伤财，忌印比官杀。行食伤运则名利双收，行印运则困顿。";
        } else {
            congType = "从弱格";
            desc = "日主弱极，财官食伤旺，无印比生扶，为从弱格。喜克泄耗，忌生扶。行财官食伤运则顺遂，行印比运则多阻。";
        }
        isCongGe = true;
    }

    return { congType, desc, isCongGe, stats: { yinCount, biJieCount, caiCount, guanCount, shiCount, hasRoot } };
}

// ---------- 化气格判定 ----------
function getHuaQiGe(siZhu, riGan) {
    const tgList = [siZhu.year.gan, siZhu.month.gan, siZhu.day.gan, siZhu.time.gan];
    const monthZhi = siZhu.month.zhi;

    const huaQiMap = {
        "甲己": { hua: "土", month: ["辰","戌","丑","未","巳","午"], ke: "木" },
        "乙庚": { hua: "金", month: ["申","酉","辰","戌","丑","未"], ke: "火" },
        "丙辛": { hua: "水", month: ["亥","子","申","酉","辰","丑"], ke: "土" },
        "丁壬": { hua: "木", month: ["寅","卯","亥","子","未","辰"], ke: "金" },
        "戊癸": { hua: "火", month: ["巳","午","寅","卯","戌","未"], ke: "水" }
    };

    let result = { isHuaQi: false, type: "", huaShen: "", desc: "" };

    for (let i = 0; i < tgList.length; i++) {
        for (let j = i + 1; j < tgList.length; j++) {
            const a = tgList[i], b = tgList[j];
            const key1 = a + b, key2 = b + a;
            const config = huaQiMap[key1] || huaQiMap[key2];
            if (!config) continue;

            // 检查是否临月令
            const isMonth = config.month.includes(monthZhi);
            // 检查化神是否透出（天干有化神五行）
            const huaShen = config.hua;
            const huaTou = tgList.some(g => TG_WU_XING[g] === huaShen);
            // 检查是否有克制化神之神（天干有克化神五行）
            const keHuaWx = config.ke;
            const hasKe = tgList.some(g => TG_WU_XING[g] === keHuaWx);
            // 检查日干是否参与合化
            const riParticipate = (a === riGan || b === riGan);

            if (isMonth && !hasKe && riParticipate) {
                result = {
                    isHuaQi: true,
                    type: `${a}${b}化${huaShen}格`,
                    huaShen,
                    ganHe: a + b,
                    desc: `${a}与${b}相合，日干${riGan}参与合化，生于${monthZhi}月，化神${huaShen}当令，为${a}${b}化${huaShen}格。喜${huaShen}及生${huaShen}之五行，忌${keHuaWx}克制。化气成格者，富贵非凡。`
                };
                return result;
            }
        }
    }

    return result;
}

window.getCongGe = getCongGe;
window.getHuaQiGe = getHuaQiGe;


// ================================================================
// bazi/rizhu-qiangruo.js - 日主强弱三要素详析
// ================================================================

function getRiZhuQiangRuoDetail(riGan, siZhu, cangGan) {
    const riWx = TG_WU_XING[riGan];

    // 1. 得令（月令是否生扶日主）
    const monthZhi = siZhu.month.zhi;
    const monthWx = DZ_WU_XING[monthZhi];
    const shengWo = { "金":"土","木":"水","水":"金","火":"木","土":"火" }[riWx];
    const tongWo = riWx;

    let deLing = "";
    let deLingScore = 0;
    let deLingDesc = "";

    if (monthWx === tongWo) {
        deLing = "得令（月令比劫）";
        deLingScore = 2;
        deLingDesc = `月令${monthZhi}属${monthWx}，与日主${riGan}（${riWx}）同类，日主得令而旺。`;
    } else if (monthWx === shengWo) {
        deLing = "得令（月令印星）";
        deLingScore = 1.5;
        deLingDesc = `月令${monthZhi}属${monthWx}，生扶日主${riGan}（${riWx}），日主得令而相。`;
    } else if (isKe(monthWx, riWx)) {
        deLing = "失令（月令官杀）";
        deLingScore = -1.5;
        deLingDesc = `月令${monthZhi}属${monthWx}，克制日主${riGan}（${riWx}），日主失令而囚。`;
    } else if (isKe(riWx, monthWx)) {
        deLing = "失令（月令财星）";
        deLingScore = -1;
        deLingDesc = `月令${monthZhi}属${monthWx}，日主${riGan}（${riWx}）克之而泄气，失令而休。`;
    } else if (isSheng(riWx, monthWx)) {
        deLing = "失令（月令食伤）";
        deLingScore = -1;
        deLingDesc = `月令${monthZhi}属${monthWx}，日主${riGan}（${riWx}）生之而泄气，失令而休。`;
    } else {
        deLing = "平令";
        deLingScore = 0;
        deLingDesc = `月令${monthZhi}与日主${riGan}（${riWx}）关系平淡。`;
    }

    // 2. 得地（地支通根）
    let deDi = [];
    let deDiScore = 0;
    const zhiList = [siZhu.year.zhi, siZhu.month.zhi, siZhu.day.zhi, siZhu.time.zhi];
    const zhiPos = ["年支", "月令", "日支", "时支"];

    // 本气通根
    const rootZhi = {
        "甲": ["寅","卯","辰","亥"],
        "乙": ["寅","卯","辰","亥"],
        "丙": ["巳","午","未","寅"],
        "丁": ["巳","午","未","寅"],
        "戊": ["辰","戌","丑","未","巳","午"],
        "己": ["辰","戌","丑","未","巳","午"],
        "庚": ["申","酉","戌","丑","辰"],
        "辛": ["申","酉","戌","丑","辰"],
        "壬": ["亥","子","丑","申"],
        "癸": ["亥","子","丑","申"]
    };

    const roots = rootZhi[riGan] || [];
    zhiList.forEach((z, idx) => {
        if (roots.includes(z)) {
            const pos = zhiPos[idx];
            const weight = idx === 1 ? 1.5 : idx === 3 ? 1.0 : idx === 2 ? 1.2 : 0.5;
            deDi.push({ pos, zhi: z, type: "本气通根", weight });
            deDiScore += weight;
        }
        // 藏干通根
        const cg = CANG_GAN[z] || [];
        cg.forEach((g, cidx) => {
            if (g === riGan) {
                const pos = zhiPos[idx];
                const weight = (idx === 1 ? 0.8 : idx === 3 ? 0.5 : 0.3) * (cidx === 0 ? 1 : cidx === 1 ? 0.6 : 0.3);
                deDi.push({ pos, zhi: z, type: `藏干${cidx===0?'本气':cidx===1?'中气':'余气'}`, weight });
                deDiScore += weight;
            }
        });
    });

    if (deDi.length === 0) {
        deDi.push({ pos: "地支", zhi: "", type: "无根", weight: 0 });
    }

    // 3. 得势（天干帮扶）
    let deShi = [];
    let deShiScore = 0;
    const ganList = [siZhu.year.gan, siZhu.month.gan, siZhu.time.gan];
    const ganPos = ["年干", "月干", "时干"];

    ganList.forEach((g, idx) => {
        const ss = getShiShen(riGan, g);
        if (ss && (ss.includes("印") || ss.includes("比") || ss.includes("劫"))) {
            const pos = ganPos[idx];
            const weight = idx === 1 ? 1.0 : 0.5;
            deShi.push({ pos, gan: g, shiShen: ss, weight });
            deShiScore += weight;
        }
    });

    if (deShi.length === 0) {
        deShi.push({ pos: "天干", gan: "", shiShen: "无助", weight: 0 });
    }

    // 综合评分
    const totalScore = deLingScore + deDiScore + deShiScore;
    let level = "中和";
    if (totalScore >= 4) level = "极强";
    else if (totalScore >= 2.5) level = "强";
    else if (totalScore >= 1.5) level = "偏强";
    else if (totalScore >= 0.5) level = "中和偏弱";
    else if (totalScore >= -0.5) level = "偏弱";
    else if (totalScore >= -2) level = "弱";
    else level = "极弱";

    return {
        deLing, deLingScore, deLingDesc,
        deDi, deDiScore,
        deShi, deShiScore,
        totalScore, level,
        desc: `得令：${deLing}（+${deLingScore.toFixed(1)}）；得地：${deDi.filter(d=>d.type!=='无根').map(d=>d.pos+d.zhi+d.type).join('、')}（+${deDiScore.toFixed(1)}）；得势：${deShi.filter(d=>d.shiShen!=='无助').map(d=>d.pos+d.gan).join('、')}（+${deShiScore.toFixed(1)}）。综合${totalScore.toFixed(1)}分，日主${level}。`
    };
}

window.getRiZhuQiangRuoDetail = getRiZhuQiangRuoDetail;


// ================================================================
// bazi/liunian-dayun.js - 流年与大运关系模块
// ================================================================

function getLiuNianDaYunRelation(riGan, riZhi, daYun, siZhu) {
    let relations = [];

    daYun.forEach((dy, idx) => {
        const dyGan = dy.gan, dyZhi = dy.zhi;
        const dyGZ = dy.ganZhi;

        // 大运与年柱关系
        if (LIU_CHONG[dyZhi] === siZhu.year.zhi) {
            relations.push({
                type: "大运冲年柱",
                daYun: dyGZ,
                target: "年柱" + siZhu.year.ganZhi,
                desc: `大运${dyGZ}冲年柱${siZhu.year.ganZhi}，主祖业变动、长辈不安、离乡背井。`,
                jiXiong: "凶"
            });
        }
        if (LIU_HE[dyZhi] === siZhu.year.zhi) {
            relations.push({
                type: "大运合年柱",
                daYun: dyGZ,
                target: "年柱" + siZhu.year.ganZhi,
                desc: `大运${dyGZ}合年柱${siZhu.year.ganZhi}，主贵人扶持、祖业荫庇。`,
                jiXiong: "吉"
            });
        }

        // 大运与月柱关系
        if (LIU_CHONG[dyZhi] === siZhu.month.zhi) {
            relations.push({
                type: "大运冲月柱",
                daYun: dyGZ,
                target: "月柱" + siZhu.month.ganZhi,
                desc: `大运${dyGZ}冲月柱${siZhu.month.ganZhi}，主父母不安、事业变动、兄弟反目。`,
                jiXiong: "凶"
            });
        }

        // 大运与日柱关系（最重要）
        if (LIU_CHONG[dyZhi] === siZhu.day.zhi) {
            relations.push({
                type: "大运冲日柱（天克地冲）",
                daYun: dyGZ,
                target: "日柱" + siZhu.day.ganZhi,
                desc: `大运${dyGZ}冲日柱${siZhu.day.ganZhi}，此为天克地冲，主本人重大变动、婚姻波折、健康堪忧，需特别注意。`,
                jiXiong: "大凶"
            });
        }
        if (LIU_HE[dyZhi] === siZhu.day.zhi) {
            relations.push({
                type: "大运合日柱",
                daYun: dyGZ,
                target: "日柱" + siZhu.day.ganZhi,
                desc: `大运${dyGZ}合日柱${siZhu.day.ganZhi}，主婚姻喜庆、合作顺利、贵人相助。`,
                jiXiong: "吉"
            });
        }

        // 大运与时柱关系
        if (LIU_CHONG[dyZhi] === siZhu.time.zhi) {
            relations.push({
                type: "大运冲时柱",
                daYun: dyGZ,
                target: "时柱" + siZhu.time.ganZhi,
                desc: `大运${dyGZ}冲时柱${siZhu.time.ganZhi}，主子女不安、晚年变动、事业晚节不保。`,
                jiXiong: "凶"
            });
        }
    });

    return relations;
}

function getLiuNianRelation(riGan, riZhi, liuNianGZ, siZhu) {
    let relations = [];
    const lnGan = liuNianGZ[0], lnZhi = liuNianGZ[1];

    const checkRelation = (targetGZ, targetName, targetZhi) => {
        if (LIU_CHONG[lnZhi] === targetZhi) {
            relations.push({
                type: `流年冲${targetName}`,
                liuNian: liuNianGZ,
                target: targetName + targetGZ,
                desc: `流年${liuNianGZ}冲${targetName}${targetGZ}，主该年${targetName}所主之事有变动。`,
                jiXiong: targetName === "日柱" ? "大凶" : "凶"
            });
        }
        if (LIU_HE[lnZhi] === targetZhi) {
            relations.push({
                type: `流年合${targetName}`,
                liuNian: liuNianGZ,
                target: targetName + targetGZ,
                desc: `流年${liuNianGZ}合${targetName}${targetGZ}，主该年${targetName}所主之事有喜庆。`,
                jiXiong: "吉"
            });
        }
        if (isKe(TG_WU_XING[lnGan], TG_WU_XING[targetGZ[0]])) {
            relations.push({
                type: `流年克${targetName}天干`,
                liuNian: liuNianGZ,
                target: targetName + targetGZ,
                desc: `流年${liuNianGZ}天干克${targetName}${targetGZ}天干，主该年有压力、克制之事。`,
                jiXiong: "凶"
            });
        }
    };

    checkRelation(siZhu.year.ganZhi, "年柱", siZhu.year.zhi);
    checkRelation(siZhu.month.ganZhi, "月柱", siZhu.month.zhi);
    checkRelation(siZhu.day.ganZhi, "日柱", siZhu.day.zhi);
    checkRelation(siZhu.time.ganZhi, "时柱", siZhu.time.zhi);

    return relations;
}

function getSuiYunBingLin(daYunGZ, liuNianGZ) {
    if (daYunGZ === liuNianGZ) {
        return {
            isBingLin: true,
            desc: `岁运并临：大运${daYunGZ}与流年${liuNianGZ}相同，此为重大关口，主该年吉凶加倍，需特别注意健康与安危。`,
            jiXiong: "大凶/大吉"
        };
    }
    return { isBingLin: false, desc: "", jiXiong: "" };
}

function getTianKeDiChong(daYunGZ, liuNianGZ, dayGZ) {
    let results = [];
    const dyGan = daYunGZ[0], dyZhi = daYunGZ[1];
    const lnGan = liuNianGZ[0], lnZhi = liuNianGZ[1];
    const dGan = dayGZ[0], dZhi = dayGZ[1];

    if (isKe(TG_WU_XING[lnGan], TG_WU_XING[dGan]) && LIU_CHONG[lnZhi] === dZhi) {
        results.push({
            type: "流年天克地冲日柱",
            desc: `流年${liuNianGZ}天克地冲日柱${dayGZ}，此为重大关口，主该年本人有重大变故，婚姻、健康、事业皆需防。`,
            jiXiong: "大凶"
        });
    }

    if (isKe(TG_WU_XING[dyGan], TG_WU_XING[dGan]) && LIU_CHONG[dyZhi] === dZhi) {
        results.push({
            type: "大运天克地冲日柱",
            desc: `大运${daYunGZ}天克地冲日柱${dayGZ}，主该运十年本人多灾多难，需特别注意。`,
            jiXiong: "大凶"
        });
    }

    if (isKe(TG_WU_XING[lnGan], TG_WU_XING[dyGan]) && LIU_CHONG[lnZhi] === dyZhi) {
        results.push({
            type: "流年天克地冲大运",
            desc: `流年${liuNianGZ}天克地冲大运${daYunGZ}，主该年运势动荡，好事变坏，坏事更坏。`,
            jiXiong: "凶"
        });
    }

    return results;
}

window.getLiuNianDaYunRelation = getLiuNianDaYunRelation;
window.getLiuNianRelation = getLiuNianRelation;
window.getSuiYunBingLin = getSuiYunBingLin;
window.getTianKeDiChong = getTianKeDiChong;
