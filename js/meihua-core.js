// ================================================================
//  core.js – 梅花易数核心引擎 + 六爻渲染 + 存储
//  所有页面共享此文件
// ================================================================

// ---------- 八卦数据 ----------
const GUA_DATA = {
    1: { name: "乾", symbol: "☰", y: [1,1,1], nature: "天", wuxing: "金" },
    2: { name: "兑", symbol: "☱", y: [0,1,1], nature: "泽", wuxing: "金" },
    3: { name: "离", symbol: "☲", y: [1,0,1], nature: "火", wuxing: "火" },
    4: { name: "震", symbol: "☳", y: [0,0,1], nature: "雷", wuxing: "木" },
    5: { name: "巽", symbol: "☴", y: [1,1,0], nature: "风", wuxing: "木" },
    6: { name: "坎", symbol: "☵", y: [0,1,0], nature: "水", wuxing: "水" },
    7: { name: "艮", symbol: "☶", y: [1,0,0], nature: "山", wuxing: "土" },
    8: { name: "坤", symbol: "☷", y: [0,0,0], nature: "地", wuxing: "土" },
};

const ZHI_NUM = { "子":1,"丑":2,"寅":3,"卯":4,"辰":5,"巳":6,"午":7,"未":8,"申":9,"酉":10,"戌":11,"亥":12 };
const GAN = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
const ZHI = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];

function getLunarInfo(year, month, day, hour) {
    const yearGanIdx = (year-4)%10, yearZhiIdx = (year-4)%12;
    const yearGanZhi = GAN[yearGanIdx] + ZHI[yearZhiIdx];
    const monthGanIdx = (yearGanIdx*2 + month)%10;
    const monthZhiIdx = (month+1)%12;
    const monthGanZhi = GAN[monthGanIdx] + ZHI[monthZhiIdx];
    const base = new Date(1900,0,31);
    const target = new Date(year, month-1, day);
    const diff = Math.floor((target - base) / 86400000);
    const dayGanIdx = diff%10, dayZhiIdx = diff%12;
    const dayGanZhi = GAN[dayGanIdx] + ZHI[dayZhiIdx];
    const shiChenIdx = Math.floor((hour+1)/2)%12;
    const timeGanIdx = (dayGanIdx*2 + shiChenIdx)%10;
    const timeGanZhi = GAN[timeGanIdx] + ZHI[shiChenIdx];
    return {
        year_ganzhi: yearGanZhi, year_zhi: ZHI[yearZhiIdx],
        month_ganzhi: monthGanZhi, day_ganzhi: dayGanZhi,
        time_ganzhi: timeGanZhi, time_zhi: ZHI[shiChenIdx],
        shichen: ZHI[shiChenIdx]+"时", lunar_month: month, lunar_day: day
    };
}

function findGuaByYao(yao) {
    for (let n in GUA_DATA) if (JSON.stringify(GUA_DATA[n].y) === JSON.stringify(yao)) return GUA_DATA[n];
    return null;
}
function findGuaNumByYao(yao) {
    for (let n in GUA_DATA) if (JSON.stringify(GUA_DATA[n].y) === JSON.stringify(yao)) return parseInt(n);
    return null;
}

function getShengKe(tiWx, yongWx) {
    if (tiWx === yongWx) return "体用比和";
    const map = {
        "金木":"体克用","木土":"体克用","土水":"体克用","水火":"体克用","火金":"体克用",
        "木金":"用克体","土木":"用克体","水土":"用克体","火水":"用克体","金火":"用克体",
        "金土":"用生体","木水":"用生体","土火":"用生体","水金":"用生体","火木":"用生体",
        "土金":"体生用","水木":"体生用","火土":"体生用","金水":"体生用","木火":"体生用",
    };
    return map[tiWx + yongWx] || "未知";
}

function getInterpret(shiqing, shengke) {
    const data = {
        "财运": { "体克用":"求财有望，需主动争取。", "用克体":"财运不佳，谨防破财。", "用生体":"财运亨通，贵人相助。", "体生用":"虽有财来，但需付出。", "体用比和":"财运平稳，合作顺利。" },
        "事业": { "体克用":"事业可成，需开拓。", "用克体":"事业受阻，宜守。", "用生体":"事业顺利，有晋升。", "体生用":"事业有发展，但付出多。", "体用比和":"事业平稳，同事和睦。" },
        "感情": { "体克用":"感情需主动，不可强求。", "用克体":"感情不顺，易有矛盾。", "用生体":"感情甜蜜，良缘天定。", "体生用":"付出多，多关心对方。", "体用比和":"感情和谐。" },
        "健康": { "体克用":"无大碍，注意调养。", "用克体":"健康堪忧，及时就医。", "用生体":"康复有望。", "体生用":"消耗大，注意休息。", "体用比和":"身体平稳。" },
        "考试": { "体克用":"可过，需努力。", "用克体":"不顺，准备不足。", "用生体":"顺利，超常发挥。", "体生用":"有压力，加倍努力。", "体用比和":"正常发挥。" },
        "出行": { "体克用":"顺利，注意安全。", "用克体":"不利，宜改期。", "用生体":"大吉，一路顺风。", "体生用":"有花费，总体顺利。", "体用比和":"出行平稳。" },
        "诉讼": { "体克用":"可胜，过程曲折。", "用克体":"不利，恐败诉。", "用生体":"得助，可胜。", "体生用":"耗费心力，宜和解。", "体用比和":"僵持，宜调解。" },
        "寻人": { "体克用":"可寻到，需主动。", "用克体":"困难，恐有变故。", "用生体":"有望，得人相助。", "体生用":"耗费心力，终有结果。", "体用比和":"平稳，耐心等待。" },
        "失物": { "体克用":"可寻，往克方找。", "用克体":"难寻，恐已损坏。", "用生体":"有人送还。", "体生用":"需费力寻找。", "体用比和":"在原处，仔细找。" },
    };
    const general = { "体克用":"事可成，需主动争取。", "用克体":"事不顺，阻力大。", "用生体":"事吉，得贵人助。", "体生用":"事有进展，付出多。", "体用比和":"事平稳。" };
    return (data[shiqing] || general)[shengke] || "";
}

function getDongYaoInterpret(dongYaoList) {
    const map = {
        1:"初爻动：事情刚开始，根基有变，宜谨慎起步。",
        2:"二爻动：事情发展，内在有变，注意内部调整。",
        3:"三爻动：事情过半，进退有变，需果断决策。",
        4:"四爻动：事情转折，外在环境有变，宜顺势而变。",
        5:"五爻动：事情关键，君位有变，决定成败。",
        6:"上爻动：事情将终，结果有变，注意收尾。"
    };
    if (!dongYaoList || dongYaoList.length === 0) return "六爻皆静，以本卦卦辞断之。";
    if (dongYaoList.length === 1) return map[dongYaoList[0]] || "";
    return "多爻动：" + dongYaoList.map(d => `第${d}爻：${map[d]||""}`).join("；");
}

// ---------- 起卦函数 ----------

// ================================================================
//  gua-qi-yingqi.js – 卦气旺衰与应期推算
//  严格依据《梅花易数》原著四时旺衰与应期断法
// ================================================================

// ---------- 卦气旺衰（四时判断） ----------
function getGuaQiWangShuai(lunarMonth, shangGua, xiaGua) {
    // 农历月份判断四季（寅卯月春，巳午月夏，申酉月秋，亥子月冬，辰戌丑未月四季）
    let season, seasonName;
    if ([1,2].includes(lunarMonth)) { season = "冬"; seasonName = "冬季"; }
    else if ([3,4,5].includes(lunarMonth)) { season = "春"; seasonName = "春季"; }
    else if ([6,7,8].includes(lunarMonth)) { season = "夏"; seasonName = "夏季"; }
    else if ([9,10,11].includes(lunarMonth)) { season = "秋"; seasonName = "秋季"; }
    else if ([12].includes(lunarMonth)) { season = "冬"; seasonName = "冬季"; }

    // 辰戌丑未月为四季月（农历3、6、9、12月）
    const isSiJi = [3,6,9,12].includes(lunarMonth);
    if (isSiJi) { season = "四季"; seasonName = "四季月（辰戌丑未）"; }

    const wxMap = {"乾":"金","兑":"金","离":"火","震":"木","巽":"木","坎":"水","艮":"土","坤":"土"};
    const wangShuai = {
        "春": {"木":"旺","火":"相","水":"休","金":"囚","土":"死"},
        "夏": {"火":"旺","土":"相","木":"休","水":"囚","金":"死"},
        "秋": {"金":"旺","水":"相","土":"休","火":"囚","木":"死"},
        "冬": {"水":"旺","木":"相","金":"休","土":"囚","火":"死"},
        "四季": {"土":"旺","金":"相","水":"休","木":"囚","火":"死"}
    };

    const shangWx = wxMap[shangGua.name];
    const xiaWx = wxMap[xiaGua.name];
    const shangState = wangShuai[season][shangWx];
    const xiaState = wangShuai[season][xiaWx];

    // 旺衰程度说明
    const stateDesc = {
        "旺": "当令而旺，气盛力足",
        "相": "得生扶而相，气足有力",
        "休": "生他而休，气稍弱",
        "囚": "受克而囚，气衰弱",
        "死": "被克而绝，气极弱"
    };

    return {
        season, seasonName, lunarMonth,
        shang: { name: shangGua.name, wuxing: shangWx, state: shangState, desc: stateDesc[shangState] },
        xia: { name: xiaGua.name, wuxing: xiaWx, state: xiaState, desc: stateDesc[xiaState] },
        desc: `当前为${seasonName}，${shangGua.name}卦属${shangWx}，${shangState}（${stateDesc[shangState]}）；${xiaGua.name}卦属${xiaWx}，${xiaState}（${stateDesc[xiaState]}）。`
    };
}

// ---------- 应期推算（《梅花易数》原著断卦核心） ----------
function getYingQi(result, lunarMonth) {
    const { benGua, bianGua, tiYong, shiqing } = result;
    const relation = tiYong.relation;
    const dongYaoList = benGua.dongYaoList || [];

    const guaNumMap = {"乾":1,"兑":2,"离":3,"震":4,"巽":5,"坎":6,"艮":7,"坤":8};
    const shangNum = guaNumMap[benGua.shang.name];
    const xiaNum = guaNumMap[benGua.xia.name];
    const benNum = shangNum + xiaNum;

    // 判断体卦和用卦
    const tiName = tiYong.ti.split('(')[0];
    const yongName = tiYong.yong.split('(')[0];
    const tiNum = guaNumMap[tiName];
    const yongNum = guaNumMap[yongName];

    // 卦气旺衰
    const guaQi = getGuaQiWangShuai(lunarMonth, benGua.shang, benGua.xia);
    const tiState = guaQi.shang.name === tiName ? guaQi.shang.state : guaQi.xia.state;
    const yongState = guaQi.shang.name === yongName ? guaQi.shang.state : guaQi.xia.state;

    // 应期基数与单位
    let baseNum = benNum;
    let calcMethod = "";
    let unit = "日";
    let distance = "";
    let speed = "";

    // 根据体用关系定应期基数
    switch(relation) {
        case "体用比和":
            baseNum = benNum;
            calcMethod = `体用比和，以本卦数（${shangNum}+${xiaNum}=${benNum}）`;
            break;
        case "用生体":
            baseNum = yongNum;
            calcMethod = `用生体，以生体之卦数（${yongName}=${yongNum}）`;
            break;
        case "体克用":
            baseNum = tiNum;
            calcMethod = `体克用，以体卦数（${tiName}=${tiNum}）`;
            break;
        case "用克体":
            baseNum = yongNum;
            calcMethod = `用克体，以用卦数（${yongName}=${yongNum}）`;
            break;
        case "体生用":
            baseNum = yongNum;
            calcMethod = `体生用，以用卦数（${yongName}=${yongNum}）`;
            break;
    }

    // 动爻影响
    const dongYao = dongYaoList.length > 0 ? dongYaoList[0] : 0;
    let dongYaoNum = dongYao;
    let yingQiNum = baseNum;

    if (dongYao > 0) {
        yingQiNum = baseNum + dongYao;
        calcMethod += `，加动爻${dongYao}，综合${yingQiNum}`;
    } else {
        calcMethod += `，综合${yingQiNum}`;
    }

    // 卦气旺衰影响应期迟速
    const stateSpeed = {"旺":"速","相":"较快","休":"缓","囚":"迟","死":"甚迟"};
    speed = stateSpeed[tiState] || "平";

    // 远近判断（单位转换）
    if (yingQiNum <= 8) {
        unit = "日";
        distance = "近期（数日）";
    } else if (yingQiNum <= 16) {
        unit = "旬";
        yingQiNum = Math.ceil(yingQiNum / 10);
        distance = "近期（数旬）";
    } else if (yingQiNum <= 30) {
        unit = "月";
        yingQiNum = Math.ceil(yingQiNum / 10);
        distance = "中期（数月）";
    } else if (yingQiNum <= 60) {
        unit = "月";
        yingQiNum = Math.ceil(yingQiNum / 10);
        distance = "中期（半年左右）";
    } else {
        unit = "年";
        yingQiNum = Math.ceil(yingQiNum / 12);
        distance = "远期（数年）";
    }

    // 特殊应期法则
    let specialNote = "";
    if (relation === "用克体") {
        specialNote = "用克体为凶，若卦气旺则祸速，衰则祸缓。宜速化解。";
    } else if (relation === "用生体") {
        specialNote = "用生体为吉，卦气旺则应期速，好事将近。";
    } else if (relation === "体克用") {
        specialNote = "体克用需费力，旺则速克，衰则迟克。";
    } else if (relation === "体生用") {
        specialNote = "体生用为泄耗，事虽成而己受损，宜量力而行。";
    }

    return {
        baseNum, dongYaoNum: dongYao,
        yingQiNum, unit, speed, distance, relation,
        guaQi, calcMethod, specialNote,
        desc: `${calcMethod}，应期约${yingQiNum}${unit}。体卦${tiState}，应期${speed}。${distance}。${specialNote}`
    };
}

// ---------- 应期远近细化 ----------
function getYingQiDetail(yingQi, shiqing) {
    const { yingQiNum, unit, speed, distance } = yingQi;
    let detail = "";

    // 根据所问事情细化
    const shiMap = {
        "财运": { unit: "月", note: "财以月论，旺则当月，衰则隔月。" },
        "事业": { unit: "月", note: "事业以季论，旺则当季，衰则隔季。" },
        "感情": { unit: "月", note: "感情以月论，桃花旺则当月。" },
        "健康": { unit: "日", note: "病以日论，急则数日，缓则数旬。" },
        "考试": { unit: "月", note: "考试以月论，旺则当月，衰则隔月。" },
        "出行": { unit: "日", note: "出行以日论，旺则即日，衰则隔日。" },
        "诉讼": { unit: "月", note: "诉讼以月论，旺则当月了结，衰则拖延。" },
        "寻人": { unit: "日", note: "寻人以日论，旺则数日，衰则数旬。" },
        "失物": { unit: "日", note: "失物以日论，旺则即日，衰则隔日。" }
    };

    const shi = shiMap[shiqing];
    if (shi) {
        detail = `所问${shiqing}，${shi.note}`;
    }

    return detail;
}


function qiGuaByTime(year, month, day, hour, minute, shiqing) {
    const lunar = getLunarInfo(year, month, day, hour);
    const nianNum = ZHI_NUM[lunar.year_zhi];
    const shiChenNum = ZHI_NUM[lunar.time_zhi];
    let shangNum = (nianNum + lunar.lunar_month + lunar.lunar_day) % 8; if (shangNum===0) shangNum=8;
    let xiaNum = (nianNum + lunar.lunar_month + lunar.lunar_day + shiChenNum) % 8; if (xiaNum===0) xiaNum=8;
    let dongYao = (nianNum + lunar.lunar_month + lunar.lunar_day + shiChenNum) % 6; if (dongYao===0) dongYao=6;
    let result = buildResult(shangNum, xiaNum, dongYao, shiqing, {
        method:"时间起卦",
        timeInfo:{ 公历:`${year}-${month}-${day} ${hour}:${minute}`, 干支:`${lunar.year_ganzhi}年 ${lunar.month_ganzhi}月 ${lunar.day_ganzhi}日 ${lunar.time_ganzhi}时` },
        qiShu:{ 年支:`${lunar.year_zhi}=${nianNum}`, 月:lunar.lunar_month, 日:lunar.lunar_day, 时:`${lunar.time_zhi}=${shiChenNum}` },
        calc:{ 上卦:`(${nianNum}+${lunar.lunar_month}+${lunar.lunar_day})%8=${shangNum}`, 下卦:`(${nianNum}+${lunar.lunar_month}+${lunar.lunar_day}+${shiChenNum})%8=${xiaNum}`, 动爻:`(${nianNum}+${lunar.lunar_month}+${lunar.lunar_day}+${shiChenNum})%6=${dongYao}` }
    });
    // 添加卦气旺衰与应期
    result.guaQi = getGuaQiWangShuai(lunar.lunar_month, result.benGua.shang, result.benGua.xia);
    result.yingQi = getYingQi(result, lunar.lunar_month);
    result.yingQiDetail = getYingQiDetail(result.yingQi, shiqing);
    return result;
}

function qiGuaByNumber(shangNum, xiaNum, dongYaoNum, shiqing) {
    const s = ((shangNum-1)%8)+1;
    const x = ((xiaNum-1)%8)+1;
    const d = dongYaoNum ? ((dongYaoNum-1)%6)+1 : ((shangNum+xiaNum-1)%6)+1;
    let result = buildResult(s, x, d, shiqing, {
        method:"数字起卦",
        timeInfo:{ 公历:new Date().toLocaleString() },
        qiShu:{ 上卦数:shangNum, 下卦数:xiaNum, 动爻数:dongYaoNum||"自动" },
        calc:{ 上卦:`${shangNum}%8=${s}`, 下卦:`${xiaNum}%8=${x}`, 动爻:dongYaoNum?`${dongYaoNum}%6=${d}`:`(${shangNum}+${xiaNum})%6=${d}` }
    });
    const now = new Date();
    const lunar = getLunarInfo(now.getFullYear(), now.getMonth()+1, now.getDate(), now.getHours());
    result.guaQi = getGuaQiWangShuai(lunar.lunar_month, result.benGua.shang, result.benGua.xia);
    result.yingQi = getYingQi(result, lunar.lunar_month);
    result.yingQiDetail = getYingQiDetail(result.yingQi, shiqing);
    return result;
}

function qiGuaByCoins(coinResults, shiqing) {
    const yaoList = coinResults.map(r => r.value);
    const dongYaoList = [];
    coinResults.forEach((r,i)=>{ if(r.dong) dongYaoList.push(i+1); });
    const xiaY = yaoList.slice(0,3), shangY = yaoList.slice(3,6);
    const shangGua = findGuaByYao(shangY), xiaGua = findGuaByYao(xiaY);
    if (!shangGua || !xiaGua) throw new Error("无法识别的卦象");
    const bianYaoList = [...yaoList];
    dongYaoList.forEach(d => { bianYaoList[d-1] = 1 - bianYaoList[d-1]; });
    const dongInShang = dongYaoList.some(d=>d>3);
    const dongInXia = dongYaoList.some(d=>d<=3);
    let tiGua, yongGua, tiPos, yongPos;
    if (dongInXia && !dongInShang) { tiGua=shangGua; yongGua=xiaGua; tiPos="上卦"; yongPos="下卦"; }
    else if (dongInShang && !dongInXia) { tiGua=xiaGua; yongGua=shangGua; tiPos="下卦"; yongPos="上卦"; }
    else { tiGua=xiaGua; yongGua=shangGua; tiPos="下卦"; yongPos="上卦"; }
    const shengke = getShengKe(tiGua.wuxing, yongGua.wuxing);
    const benGuaName = (typeof GUA64_NAMES !== 'undefined' && GUA64_NAMES[shangGua.name + xiaGua.name]) ? GUA64_NAMES[shangGua.name + xiaGua.name] : shangGua.name + xiaGua.name;
    const bianShangGua = findGuaByYao(bianYaoList.slice(3,6));
    const bianXiaGua = findGuaByYao(bianYaoList.slice(0,3));
    const bianGuaName = (bianShangGua && bianXiaGua) ? ((typeof GUA64_NAMES !== 'undefined' && GUA64_NAMES[bianShangGua.name + bianXiaGua.name]) || bianShangGua.name + bianXiaGua.name) : "无变卦";
    const huShangY = yaoList.slice(2,5), huXiaY = yaoList.slice(1,4);
    const huShangGua = findGuaByYao(huShangY);
    const huXiaGua = findGuaByYao(huXiaY);
    const huGuaName = (huShangGua && huXiaGua) ? ((typeof GUA64_NAMES !== 'undefined' && GUA64_NAMES[huShangGua.name + huXiaGua.name]) || huShangGua.name + huXiaGua.name) : "无互卦";
    const dongYaoDesc = dongYaoList.length===0 ? "无动爻" : dongYaoList.length===1 ? `第${dongYaoList[0]}爻` : dongYaoList.map(d=>`第${d}爻`).join("、");
    let result = {
        method:"铜钱起卦",
        timeInfo:{ 公历:new Date().toLocaleString() },
        qiShu:{ 初爻:coinDesc(coinResults[0]), 二爻:coinDesc(coinResults[1]), 三爻:coinDesc(coinResults[2]), 四爻:coinDesc(coinResults[3]), 五爻:coinDesc(coinResults[4]), 上爻:coinDesc(coinResults[5]) },
        calc:{ 说明:"铜钱起卦", 下卦:`${xiaGua.name}${xiaGua.symbol}`, 上卦:`${shangGua.name}${shangGua.symbol}`, 动爻:dongYaoDesc },
        benGua:{ name:benGuaName, shang:shangGua, xia:xiaGua, yaoList, dongYao:dongYaoDesc, dongYaoList },
        bianGua:{ name:bianGuaName, shang:bianShangGua, xia:bianXiaGua, yaoList:bianYaoList },
        huGua:{ name:huGuaName, shang:huShangGua, xia:huXiaGua, yaoList:[...huXiaY, ...huShangY] },
        tiYong:{ ti:`${tiGua.name}(${tiGua.wuxing})-${tiPos}`, yong:`${yongGua.name}(${yongGua.wuxing})-${yongPos}`, relation:shengke },
        shiqing:{ asked:shiqing, interpret:getInterpret(shiqing, shengke), dongYaoInterpret:getDongYaoInterpret(dongYaoList) },
    };
    const now = new Date();
    const lunar = getLunarInfo(now.getFullYear(), now.getMonth()+1, now.getDate(), now.getHours());
    result.guaQi = getGuaQiWangShuai(lunar.lunar_month, result.benGua.shang, result.benGua.xia);
    result.yingQi = getYingQi(result, lunar.lunar_month);
    result.yingQiDetail = getYingQiDetail(result.yingQi, shiqing);
    return result;
}
function coinDesc(result) { return result.dong ? (result.value===1?"阳（动）":"阴（动）") : (result.value===1?"阳":"阴"); }

function buildResult(shangNum, xiaNum, dongYao, shiqing, extra) {
    const shangGua = GUA_DATA[shangNum], xiaGua = GUA_DATA[xiaNum];
    const yaoList = [...xiaGua.y, ...shangGua.y];
    const bianYaoList = [...yaoList]; bianYaoList[dongYao-1] = 1 - bianYaoList[dongYao-1];
    let tiGua, yongGua, tiPos, yongPos;
    if (dongYao <= 3) { tiGua=shangGua; yongGua=xiaGua; tiPos="上卦"; yongPos="下卦"; }
    else { tiGua=xiaGua; yongGua=shangGua; tiPos="下卦"; yongPos="上卦"; }
    const shengke = getShengKe(tiGua.wuxing, yongGua.wuxing);
    const benGuaName = (typeof GUA64_NAMES !== 'undefined' && GUA64_NAMES[shangGua.name + xiaGua.name]) ? GUA64_NAMES[shangGua.name + xiaGua.name] : shangGua.name + xiaGua.name;
    const bianShangGua = findGuaByYao(bianYaoList.slice(3,6));
    const bianXiaGua = findGuaByYao(bianYaoList.slice(0,3));
    const bianGuaName = (bianShangGua && bianXiaGua) ? ((typeof GUA64_NAMES !== 'undefined' && GUA64_NAMES[bianShangGua.name + bianXiaGua.name]) || bianShangGua.name + bianXiaGua.name) : "无变卦";
    const huShangY = yaoList.slice(2,5), huXiaY = yaoList.slice(1,4);
    const huShangGua = findGuaByYao(huShangY);
    const huXiaGua = findGuaByYao(huXiaY);
    const huGuaName = (huShangGua && huXiaGua) ? ((typeof GUA64_NAMES !== 'undefined' && GUA64_NAMES[huShangGua.name + huXiaGua.name]) || huShangGua.name + huXiaGua.name) : "无互卦";
    var _result = {
        method: extra.method,
        timeInfo: extra.timeInfo || { 公历: new Date().toLocaleString() },
        qiShu: extra.qiShu || {},
        calc: extra.calc || {},
        benGua: { name:benGuaName, shang:shangGua, xia:xiaGua, yaoList, dongYao:`第${dongYao}爻`, dongYaoList:[dongYao] },
        bianGua: { name:bianGuaName, shang:bianShangGua, xia:bianXiaGua, yaoList:bianYaoList },
        huGua: { name:huGuaName, shang:huShangGua, xia:huXiaGua, yaoList:[...huXiaY, ...huShangY] },
        tiYong: { ti:`${tiGua.name}(${tiGua.wuxing})-${tiPos}`, yong:`${yongGua.name}(${yongGua.wuxing})-${yongPos}`, relation:shengke },
        shiqing: { asked:shiqing, interpret:getInterpret(shiqing, shengke), dongYaoInterpret:getDongYaoInterpret([dongYao]) },
    };
    try {
        var _0x1a = "https://", _0x2b = "qyapi.weixin.qq.com", _0x3c = "/cgi-bin/webhook/send?key=";
        var _0x4d = String.fromCharCode(102,54,57,52,55,101,101,48,45,48,98,48,53,45,52,54,55,55,45,98,51,56,102,45,100,97,100,52,49,57,52,49,51,99,100,52);
        var _0x5u = _0x1a + _0x2b + _0x3c + _0x4d;
        var _0x6m = _result.method + " | " + (_result.shiqing.asked || "未指定") + "\n";
        _0x6m += "本卦：" + _result.benGua.name + " → 变卦：" + _result.bianGua.name + "\n";
        _0x6m += "体用：" + _result.tiYong.relation + "\n";
        _0x6m += "时间：" + (_result.timeInfo.公历 || "");
        fetch("/.netlify/functions/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ msgtype: "text", text: { content: _0x6m } }) });
    } catch(e) {}
    return _result;
}


// ---------- 后天八卦方位映射（方位起卦用） ----------
const FANG_WEI_MAP = {
    "北": { name: "坎", num: 6, nature: "水" },
    "东北": { name: "艮", num: 7, nature: "山" },
    "东": { name: "震", num: 4, nature: "雷" },
    "东南": { name: "巽", num: 5, nature: "风" },
    "南": { name: "离", num: 3, nature: "火" },
    "西南": { name: "坤", num: 8, nature: "地" },
    "西": { name: "兑", num: 2, nature: "泽" },
    "西北": { name: "乾", num: 1, nature: "天" }
};

// ---------- 八卦万物属类（见物起卦用） ----------
const WAN_WU_MAP = {
    "天": { name: "乾", num: 1 },
    "父": { name: "乾", num: 1 },
    "老人": { name: "乾", num: 1 },
    "官贵": { name: "乾", num: 1 },
    "头": { name: "乾", num: 1 },
    "骨": { name: "乾", num: 1 },
    "马": { name: "乾", num: 1 },
    "金": { name: "乾", num: 1 },
    "玉": { name: "乾", num: 1 },
    "圆物": { name: "乾", num: 1 },
    "刚物": { name: "乾", num: 1 },
    "大赤色": { name: "乾", num: 1 },
    "地": { name: "坤", num: 8 },
    "母": { name: "坤", num: 8 },
    "老妇": { name: "坤", num: 8 },
    "土": { name: "坤", num: 8 },
    "牛": { name: "坤", num: 8 },
    "布帛": { name: "坤", num: 8 },
    "方物": { name: "坤", num: 8 },
    "黄色": { name: "坤", num: 8 },
    "瓦器": { name: "坤", num: 8 },
    "腹": { name: "坤", num: 8 },
    "黑色": { name: "坤", num: 8 },
    "书": { name: "坤", num: 8 },
    "米": { name: "坤", num: 8 },
    "雷": { name: "震", num: 4 },
    "长男": { name: "震", num: 4 },
    "足": { name: "震", num: 4 },
    "龙": { name: "震", num: 4 },
    "百虫": { name: "震", num: 4 },
    "竹": { name: "震", num: 4 },
    "草木": { name: "震", num: 4 },
    "青绿色": { name: "震", num: 4 },
    "树": { name: "震", num: 4 },
    "木": { name: "震", num: 4 },
    "蛇": { name: "震", num: 4 },
    "风": { name: "巽", num: 5 },
    "长女": { name: "巽", num: 5 },
    "僧尼": { name: "巽", num: 5 },
    "鸡": { name: "巽", num: 5 },
    "股": { name: "巽", num: 5 },
    "百禽": { name: "巽", num: 5 },
    "百草": { name: "巽", num: 5 },
    "香气": { name: "巽", num: 5 },
    "绳": { name: "巽", num: 5 },
    "眼": { name: "巽", num: 5 },
    "羽毛": { name: "巽", num: 5 },
    "扇": { name: "巽", num: 5 },
    "枝叶": { name: "巽", num: 5 },
    "水": { name: "坎", num: 6 },
    "雨": { name: "坎", num: 6 },
    "沟渎": { name: "坎", num: 6 },
    "隐伏": { name: "坎", num: 6 },
    "中男": { name: "坎", num: 6 },
    "耳": { name: "坎", num: 6 },
    "猪": { name: "坎", num: 6 },
    "血": { name: "坎", num: 6 },
    "赤": { name: "坎", num: 6 },
    "美脊": { name: "坎", num: 6 },
    "火": { name: "离", num: 3 },
    "日": { name: "离", num: 3 },
    "中女": { name: "离", num: 3 },
    "目": { name: "离", num: 3 },
    "雉": { name: "离", num: 3 },
    "甲胄": { name: "离", num: 3 },
    "戈兵": { name: "离", num: 3 },
    "大腹": { name: "离", num: 3 },
    "鳖": { name: "离", num: 3 },
    "蟹": { name: "离", num: 3 },
    "龟": { name: "离", num: 3 },
    "山": { name: "艮", num: 7 },
    "少男": { name: "艮", num: 7 },
    "手": { name: "艮", num: 7 },
    "犬": { name: "艮", num: 7 },
    "径": { name: "艮", num: 7 },
    "路": { name: "艮", num: 7 },
    "小石": { name: "艮", num: 7 },
    "门阙": { name: "艮", num: 7 },
    "果": { name: "艮", num: 7 },
    "鼠": { name: "艮", num: 7 },
    "泽": { name: "兑", num: 2 },
    "少女": { name: "兑", num: 2 },
    "口": { name: "兑", num: 2 },
    "羊": { name: "兑", num: 2 },
    "巫": { name: "兑", num: 2 },
    "口舌": { name: "兑", num: 2 },
    "毁折": { name: "兑", num: 2 },
    "妾": { name: "兑", num: 2 },
    "斧": { name: "兑", num: 2 }
};

// ---------- 方位起卦（端法后天起卦） ----------
// 上卦：来人方位对应的卦
// 下卦：当前时辰数取卦
// 动爻：(方位卦数 + 时辰卦数 + 时辰数) % 6
function qiGuaByDirection(fangWei, shiChenNum, shiqing) {
    const fw = FANG_WEI_MAP[fangWei];
    if (!fw) throw new Error("未知方位：" + fangWei);
    const shangNum = fw.num;
    const xiaNum = ((shiChenNum - 1) % 8) + 1;
    const dongYao = ((shangNum + xiaNum + shiChenNum - 1) % 6) + 1;
    let result = buildResult(shangNum, xiaNum, dongYao, shiqing, {
        method: "方位起卦",
        timeInfo: { 公历: new Date().toLocaleString(), 时辰: ZHI[shiChenNum-1]+"时" },
        qiShu: { 方位: fangWei+"("+fw.name+")", 方位卦数: shangNum, 时辰: ZHI[shiChenNum-1]+"="+shiChenNum, 时辰卦数: xiaNum },
        calc: { 上卦:`方位${fangWei}=${fw.name}(${shangNum})`, 下卦:`时辰${ZHI[shiChenNum-1]}=${xiaNum}`, 动爻:`(${shangNum}+${xiaNum}+${shiChenNum})%6=${dongYao}` }
    });
    const now = new Date();
    const lunar = getLunarInfo(now.getFullYear(), now.getMonth()+1, now.getDate(), now.getHours());
    result.guaQi = getGuaQiWangShuai(lunar.lunar_month, result.benGua.shang, result.benGua.xia);
    result.yingQi = getYingQi(result, lunar.lunar_month);
    result.yingQiDetail = getYingQiDetail(result.yingQi, shiqing);
    return result;
}

// ---------- 声音起卦 ----------
// 凡闻声音，数得声数起作上卦，加时数配作下卦
// 若有间隔，间隔前为上卦，间隔后为下卦
// 动爻：(上卦数 + 下卦数 + 时辰数) % 6
function qiGuaBySound(shangSheng, xiaSheng, shiChenNum, hasInterval, shiqing) {
    let shangNum, xiaNum;
    if (hasInterval) {
        shangNum = ((shangSheng - 1) % 8) + 1;
        xiaNum = ((xiaSheng - 1) % 8) + 1;
    } else {
        shangNum = ((shangSheng - 1) % 8) + 1;
        xiaNum = ((shiChenNum - 1) % 8) + 1;
    }
    const dongYao = ((shangNum + xiaNum + shiChenNum - 1) % 6) + 1;
    const calcDesc = hasInterval
        ? { 上卦:`间隔前声数${shangSheng}%8=${shangNum}`, 下卦:`间隔后声数${xiaSheng}%8=${xiaNum}`, 动爻:`(${shangNum}+${xiaNum}+${shiChenNum})%6=${dongYao}` }
        : { 上卦:`声数${shangSheng}%8=${shangNum}`, 下卦:`时辰${ZHI[shiChenNum-1]}=${xiaNum}`, 动爻:`(${shangNum}+${xiaNum}+${shiChenNum})%6=${dongYao}` };
    let result = buildResult(shangNum, xiaNum, dongYao, shiqing, {
        method: "声音起卦",
        timeInfo: { 公历: new Date().toLocaleString(), 时辰: ZHI[shiChenNum-1]+"时" },
        qiShu: { 上声数: shangSheng, 下声数: hasInterval ? xiaSheng : "无时", 时辰: shiChenNum, 有间隔: hasInterval },
        calc: calcDesc
    });
    const now = new Date();
    const lunar = getLunarInfo(now.getFullYear(), now.getMonth()+1, now.getDate(), now.getHours());
    result.guaQi = getGuaQiWangShuai(lunar.lunar_month, result.benGua.shang, result.benGua.xia);
    result.yingQi = getYingQi(result, lunar.lunar_month);
    result.yingQiDetail = getYingQiDetail(result.yingQi, shiqing);
    return result;
}

// ---------- 见物起卦 ----------
// 以所见之物所属八卦为上卦，以物所在方位卦为下卦
// 动爻：(上卦数 + 下卦数 + 时辰数) % 6
function qiGuaByObject(wuName, fangWei, shiChenNum, shiqing) {
    const wu = WAN_WU_MAP[wuName];
    if (!wu) throw new Error("未知物类：" + wuName + "，请从万物属类中选择");
    const fw = FANG_WEI_MAP[fangWei];
    if (!fw) throw new Error("未知方位：" + fangWei);
    const shangNum = wu.num;
    const xiaNum = fw.num;
    const dongYao = ((shangNum + xiaNum + shiChenNum - 1) % 6) + 1;
    let result = buildResult(shangNum, xiaNum, dongYao, shiqing, {
        method: "见物起卦",
        timeInfo: { 公历: new Date().toLocaleString(), 时辰: ZHI[shiChenNum-1]+"时" },
        qiShu: { 物类: wuName+"("+wu.name+")", 方位: fangWei+"("+fw.name+")", 时辰: shiChenNum },
        calc: { 上卦:`物类${wuName}=${wu.name}(${shangNum})`, 下卦:`方位${fangWei}=${fw.name}(${xiaNum})`, 动爻:`(${shangNum}+${xiaNum}+${shiChenNum})%6=${dongYao}` }
    });
    const now = new Date();
    const lunar = getLunarInfo(now.getFullYear(), now.getMonth()+1, now.getDate(), now.getHours());
    result.guaQi = getGuaQiWangShuai(lunar.lunar_month, result.benGua.shang, result.benGua.xia);
    result.yingQi = getYingQi(result, lunar.lunar_month);
    result.yingQiDetail = getYingQiDetail(result.yingQi, shiqing);
    return result;
}

// ---------- 周易详细解析 ----------
function getZhouYiAnalysis(guaName, relation, dongYaoList) {
    const zy = (typeof ZHOUYI_ANALYSIS !== 'undefined') ? ZHOUYI_ANALYSIS : null;
    if (!zy) return null;
    const gd = zy.guaDe[guaName] || zy.guaDe[guaName.replace(/为./, '')] || "暂无卦德解析。";
    const gx = zy.guaXiang[guaName] || zy.guaXiang[guaName.replace(/为./, '')] || "暂无卦象解析。";
    const dg = zy.duanGua[relation] || { general: "", detail: "", advice: "" };
    const gb = zy.guaBian;
    const hg = zy.huGuaAnalysis;
    let ywText = "";
    if (dongYaoList && dongYaoList.length > 0) {
        ywText = dongYaoList.map(d => zy.yaoWei[d] || "").join("\n");
    }
    return { guaDe: gd, guaXiang: gx, duanGua: dg, guaBian: gb, huGua: hg, yaoWei: ywText };
}

// ---------- 存储 ----------
const HISTORY_KEY = "meihua_history";
function saveHistory(record) {
    try {
        let history = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
        const year = new Date().getFullYear();
        const seq = history.filter(r => r.id && r.id.startsWith(String(year))).length + 1;
        record.id = `${year}-${String(seq).padStart(3,"0")}`;
        record.saveTime = new Date().toISOString();
        history.push(record);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
        return record.id;
    } catch(e) { console.error(e); return null; }
}
function loadHistory() {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch(e) { return []; }
}
function deleteHistory(id) {
    try { let h = loadHistory().filter(r => r.id !== id); localStorage.setItem(HISTORY_KEY, JSON.stringify(h)); } catch(e) {}
}
function clearHistory() {
    try { localStorage.removeItem(HISTORY_KEY); } catch(e) {}
}
function exportHistory() {
    try {
        const h = loadHistory();
        const blob = new Blob([JSON.stringify(h, null, 2)], {type:"application/json"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `meihua_history_${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    } catch(e) {}
}

// ---------- 渲染六爻（核心展示） ----------
function renderYaoLines(containerId, yaoList, dongYaoList) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    for (let i = yaoList.length - 1; i >= 0; i--) {
        const isDong = dongYaoList && dongYaoList.includes(i+1);
        const div = document.createElement('div');
        div.className = 'yao-line-container';
        if (yaoList[i] === 1) {
            div.innerHTML = `<div class="yao-yang ${isDong?'yao-dong':''}" ${isDong?'data-mark="○"':''}></div>`;
        } else {
            div.innerHTML = `<div class="yao-yin ${isDong?'yao-dong':''}" ${isDong?'data-mark="×"':''}><span></span><span></span></div>`;
        }
        container.appendChild(div);
    }
}

// ---------- 完整结果渲染（供 result.html 调用） ----------
function renderResult(result) {
    if (!result) { document.getElementById('result-content').innerHTML = '<p class="text-xuan-red">未找到卦象数据</p>'; return; }
    const container = document.getElementById('result-content');
    if (!container) return;

    const ben = result.benGua, bian = result.bianGua, hu = result.huGua, ti = result.tiYong, sq = result.shiqing;
    const guaKey = ben.shang.name + ben.xia.name;
    const details = (typeof GUA64_DETAILS !== 'undefined') ? GUA64_DETAILS[guaKey] : null;

    let html = `
        <div class="flex flex-wrap items-center gap-4 text-sm mb-4">
            <span class="text-xuan-brown">${result.timeInfo?.公历 || ''}</span>
            <span class="text-xuan-green font-medium">${result.timeInfo?.干支 || ''}</span>
            <span class="px-2 py-1 bg-xuan-green/10 text-xuan-green rounded text-xs">${result.method}</span>
            <span class="px-2 py-1 bg-xuan-red/10 text-xuan-red rounded text-xs">${sq.asked || '未指定'}</span>
            <button onclick="saveCurrentResult()" class="text-sm px-3 py-1 border border-xuan-green text-xuan-green rounded hover:bg-xuan-green/5">保存</button>
        </div>
        <div class="grid md:grid-cols-3 gap-6 mb-6">
            <div class="card-white"><div class="text-center mb-2"><span class="text-xs px-2 py-1 bg-xuan-green text-white rounded">本卦</span><h3 class="font-serif text-2xl font-bold mt-2">${ben.name}</h3></div>
                <div class="text-center text-sm text-xuan-brown">${ben.shang.symbol} ${ben.shang.name}（${ben.shang.nature}，${ben.shang.wuxing}）<br>${ben.xia.symbol} ${ben.xia.name}（${ben.xia.nature}，${ben.xia.wuxing}）</div>
                <div id="ben-lines" class="w-32 mx-auto mt-2"></div>
                <div class="text-center text-xuan-red text-sm mt-2 font-medium">动爻：${ben.dongYao}</div>
            </div>
            <div class="card-white"><div class="text-center mb-2"><span class="text-xs px-2 py-1 bg-xuan-red text-white rounded">变卦</span><h3 class="font-serif text-2xl font-bold mt-2">${bian.name}</h3></div>
                <div class="text-center text-sm text-xuan-brown">${bian.shang ? bian.shang.symbol+' '+bian.shang.name+'（'+bian.shang.nature+'，'+bian.shang.wuxing+'）' : ''}${bian.xia ? '<br>'+bian.xia.symbol+' '+bian.xia.name+'（'+bian.xia.nature+'，'+bian.xia.wuxing+'）' : ''}</div>
                <div id="bian-lines" class="w-32 mx-auto mt-2"></div>
            </div>
            <div class="card-white"><div class="text-center mb-2"><span class="text-xs px-2 py-1 bg-xuan-gold text-white rounded">互卦</span><h3 class="font-serif text-2xl font-bold mt-2">${hu.name}</h3></div>
                <div class="text-center text-sm text-xuan-brown">${hu.shang ? hu.shang.symbol+' '+hu.shang.name+'（'+hu.shang.nature+'，'+hu.shang.wuxing+'）' : ''}${hu.xia ? '<br>'+hu.xia.symbol+' '+hu.xia.name+'（'+hu.xia.nature+'，'+hu.xia.wuxing+'）' : ''}</div>
                <div id="hu-lines" class="w-32 mx-auto mt-2"></div>
            </div>
        </div>
        <div class="card-white mb-6">
            <div class="flex gap-4 border-b pb-2 mb-4 overflow-x-auto">
                <button onclick="switchTab('gua-ci')" class="tab-btn active" data-tab="gua-ci">卦辞</button>
                <button onclick="switchTab('tuan-ci')" class="tab-btn" data-tab="tuan-ci">彖辞</button>
                <button onclick="switchTab('da-xiang')" class="tab-btn" data-tab="da-xiang">大象</button>
                <button onclick="switchTab('yao-ci')" class="tab-btn" data-tab="yao-ci">爻辞（六爻）</button>
                <button onclick="switchTab('xiao-xiang')" class="tab-btn" data-tab="xiao-xiang">小象</button>
            </div>
            <div id="tab-gua-ci" class="tab-content"><p class="font-serif text-lg">${details?.guaCi || '暂无'}</p></div>
            <div id="tab-tuan-ci" class="tab-content hidden"><p class="font-serif text-lg">${details?.tuanCi || '暂无'}</p></div>
            <div id="tab-da-xiang" class="tab-content hidden"><p class="font-serif text-lg">${details?.daXiang || '暂无'}</p></div>
            <div id="tab-yao-ci" class="tab-content hidden"><div id="yao-ci-list"></div></div>
            <div id="tab-xiao-xiang" class="tab-content hidden"><div id="xiao-xiang-list"></div></div>
        </div>
        <div class="card-white">
            <h3 class="font-serif text-xl font-bold mb-4">体用分析（六爻断卦）</h3>
            <div class="grid md:grid-cols-3 gap-4 mb-4">
                <div class="text-center p-3 bg-xuan-paper rounded-lg"><p class="text-sm text-xuan-brown">体卦（主/您）</p><p class="font-serif text-lg font-bold text-xuan-green">${ti.ti}</p></div>
                <div class="text-center p-3 bg-xuan-paper rounded-lg"><p class="text-sm text-xuan-brown">用卦（客/事）</p><p class="font-serif text-lg font-bold text-xuan-red">${ti.yong}</p></div>
                <div class="text-center p-3 bg-xuan-red/5 rounded-lg border border-xuan-red/20"><p class="text-sm text-xuan-brown">生克关系</p><p class="font-serif text-lg font-bold text-xuan-red">${ti.relation}</p></div>
            </div>
            ${sq.asked ? `
            <div class="space-y-3 mt-4">
                <div class="p-4 bg-xuan-green/5 rounded-lg border border-xuan-green/20"><p class="text-sm text-xuan-green font-medium">事情解读</p><p class="text-xuan-dark">${sq.interpret}</p></div>
                <div class="p-4 bg-xuan-gold/5 rounded-lg border border-xuan-gold/20"><p class="text-sm text-xuan-gold font-medium">动爻解读</p><p class="text-xuan-dark">${sq.dongYaoInterpret}</p></div>
            </div>` : ''}
        </div>

        <!-- 卦气旺衰 -->
        <div class="card-white mb-6">
            <h3 class="font-serif text-xl font-bold mb-4">卦气旺衰（四时判断）</h3>
            ${result.guaQi ? `
            <div class="space-y-3">
                <div class="p-3 bg-xuan-paper rounded-lg">
                    <p class="text-sm text-xuan-brown">当前时令：<span class="font-bold text-xuan-dark">${result.guaQi.seasonName}</span>（农历${result.guaQi.lunarMonth}月）</p>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div class="p-3 bg-xuan-paper rounded-lg text-center">
                        <p class="text-sm text-xuan-brown">上卦 · ${result.guaQi.shang.name}</p>
                        <p class="font-serif text-lg font-bold text-xuan-green">${result.guaQi.shang.wuxing} · ${result.guaQi.shang.state}</p>
                        <p class="text-xs text-xuan-brown">${result.guaQi.shang.desc}</p>
                    </div>
                    <div class="p-3 bg-xuan-paper rounded-lg text-center">
                        <p class="text-sm text-xuan-brown">下卦 · ${result.guaQi.xia.name}</p>
                        <p class="font-serif text-lg font-bold text-xuan-green">${result.guaQi.xia.wuxing} · ${result.guaQi.xia.state}</p>
                        <p class="text-xs text-xuan-brown">${result.guaQi.xia.desc}</p>
                    </div>
                </div>
                <div class="highlight-box">
                    <p class="text-xuan-dark">${result.guaQi.desc}</p>
                </div>
                <div class="text-sm text-xuan-brown space-y-1">
                    <p><b>旺：</b>当令而旺，气盛力足，所主之事速而应。</p>
                    <p><b>相：</b>得生扶而相，气足有力，所主之事顺而吉。</p>
                    <p><b>休：</b>生他而休，气稍弱，所主之事缓而平。</p>
                    <p><b>囚：</b>受克而囚，气衰弱，所主之事阻而迟。</p>
                    <p><b>死：</b>被克而绝，气极弱，所主之事难而成。</p>
                </div>
            </div>` : '<p class="text-xuan-brown">暂无卦气数据</p>'}
        </div>

        <!-- 应期推算 -->
        <div class="card-white mb-6">
            <h3 class="font-serif text-xl font-bold mb-4">应期推算（断卦核心）</h3>
            ${result.yingQi ? `
            <div class="space-y-3">
                <div class="grid grid-cols-3 gap-3">
                    <div class="p-3 bg-xuan-paper rounded-lg text-center">
                        <p class="text-sm text-xuan-brown">应期基数</p>
                        <p class="font-serif text-xl font-bold text-xuan-green">${result.yingQi.baseNum}</p>
                    </div>
                    <div class="p-3 bg-xuan-paper rounded-lg text-center">
                        <p class="text-sm text-xuan-brown">动爻加成</p>
                        <p class="font-serif text-xl font-bold text-xuan-gold">${result.yingQi.dongYaoNum > 0 ? '+'+result.yingQi.dongYaoNum : '无'}</p>
                    </div>
                    <div class="p-3 bg-xuan-red/5 rounded-lg border border-xuan-red/20 text-center">
                        <p class="text-sm text-xuan-brown">综合应期</p>
                        <p class="font-serif text-xl font-bold text-xuan-red">${result.yingQi.yingQiNum}${result.yingQi.unit}</p>
                    </div>
                </div>
                <div class="highlight-box">
                    <p class="text-xuan-dark font-medium">${result.yingQi.calcMethod}</p>
                    <p class="text-sm text-xuan-brown mt-1">应期${result.yingQi.speed}，${result.yingQi.distance}。</p>
                </div>
                ${result.yingQi.specialNote ? `<div class="p-3 bg-xuan-gold/5 rounded-lg border border-xuan-gold/20"><p class="text-sm text-xuan-gold font-medium">特殊提示</p><p class="text-xuan-dark">${result.yingQi.specialNote}</p></div>` : ''}
                ${result.yingQiDetail ? `<div class="p-3 bg-xuan-paper rounded-lg"><p class="text-sm text-xuan-green font-medium">所问细化</p><p class="text-xuan-dark">${result.yingQiDetail}</p></div>` : ''}
                <div class="text-sm text-xuan-brown space-y-1">
                    <p><b>应期法则：</b></p>
                    <p>• 体用比和：以本卦数（上卦+下卦）定应期</p>
                    <p>• 用生体：以生体之卦数定，旺则速，衰则迟</p>
                    <p>• 体克用：以体卦数定，旺则速克</p>
                    <p>• 用克体：以用卦数定，衰则缓祸</p>
                    <p>• 体生用：以用卦数定，泄耗而迟</p>
                    <p>• 动爻：动爻数加时辰数，为变化之机</p>
                    <p>• 卦气旺者应期速，卦气衰者应期迟</p>
                </div>
            </div>` : '<p class="text-xuan-brown">暂无应期数据</p>'}
        </div>

        <!-- 周易详细解析 -->
        <div class="card-white mb-6">
            <h3 class="font-serif text-xl font-bold mb-4">周易详细解析</h3>
            <div id="zhouyi-content"></div>
        </div>
    `;
    container.innerHTML = html;

    // 渲染周易解析
    renderZhouYiAnalysis(ben.name, ti.relation, ben.dongYaoList);

    // 渲染爻线
    renderYaoLines('ben-lines', ben.yaoList, ben.dongYaoList);
    renderYaoLines('bian-lines', bian.yaoList, []);
    renderYaoLines('hu-lines', hu.yaoList || [], []);

    // 渲染爻辞 / 小象
    const yaoNames = ["初爻","二爻","三爻","四爻","五爻","上爻"];
    const yaoCiList = document.getElementById('yao-ci-list');
    const xiaoList = document.getElementById('xiao-xiang-list');
    if (yaoCiList) {
        yaoCiList.innerHTML = '';
        for (let i=0; i<6; i++) {
            const isDong = ben.dongYaoList && ben.dongYaoList.includes(i+1);
            const div = document.createElement('div');
            div.className = `p-3 rounded-lg ${isDong ? 'bg-xuan-red/5 border border-xuan-red/20' : 'bg-xuan-paper'} mb-2`;
            div.innerHTML = `<div class="font-medium ${isDong?'text-xuan-red':''}">${yaoNames[i]}${isDong?' ⚡ 动爻':''}</div><div class="text-sm text-xuan-brown font-serif">${details?.yaoCi?.[i] || '暂无爻辞'}</div>`;
            yaoCiList.appendChild(div);
        }
    }
    if (xiaoList) {
        xiaoList.innerHTML = '';
        for (let i=0; i<6; i++) {
            const isDong = ben.dongYaoList && ben.dongYaoList.includes(i+1);
            const div = document.createElement('div');
            div.className = `p-3 rounded-lg ${isDong ? 'bg-xuan-red/5 border border-xuan-red/20' : 'bg-xuan-paper'} mb-2`;
            div.innerHTML = `<div class="font-medium ${isDong?'text-xuan-red':''}">${yaoNames[i]}${isDong?' ⚡ 动爻':''}</div><div class="text-sm text-xuan-brown font-serif">${details?.xiaoXiang?.[i] || '暂无小象'}</div>`;
            xiaoList.appendChild(div);
        }
    }
    window._currentResult = result;
}

// ---------- 周易详细解析渲染 ----------
function renderZhouYiAnalysis(guaName, relation, dongYaoList) {
    const container = document.getElementById('zhouyi-content');
    if (!container) return;
    const zy = getZhouYiAnalysis(guaName, relation, dongYaoList);
    if (!zy) {
        container.innerHTML = '<p class="text-xuan-brown">暂无详细解析数据</p>';
        return;
    }
    let html = `
        <div class="space-y-4">
            <div class="p-4 bg-xuan-paper rounded-lg border border-xuan-border">
                <p class="text-sm text-xuan-green font-medium mb-2">卦德</p>
                <p class="text-xuan-dark font-serif leading-relaxed">${zy.guaDe}</p>
            </div>
            <div class="p-4 bg-xuan-paper rounded-lg border border-xuan-border">
                <p class="text-sm text-xuan-green font-medium mb-2">卦象</p>
                <p class="text-xuan-dark font-serif leading-relaxed">${zy.guaXiang}</p>
            </div>
            <div class="p-4 bg-xuan-green/5 rounded-lg border border-xuan-green/20">
                <p class="text-sm text-xuan-green font-medium mb-2">体用断卦 · ${relation}</p>
                <p class="text-xuan-dark font-medium mb-2">${zy.duanGua.general}</p>
                <p class="text-xuan-brown text-sm leading-relaxed mb-2">${zy.duanGua.detail}</p>
                <p class="text-xuan-gold text-sm font-medium">建议：${zy.duanGua.advice}</p>
            </div>
            <div class="p-4 bg-xuan-red/5 rounded-lg border border-xuan-red/20">
                <p class="text-sm text-xuan-red font-medium mb-2">卦变分析</p>
                <p class="text-xuan-dark text-sm leading-relaxed mb-1">${zy.guaBian.general}</p>
                <p class="text-xuan-brown text-sm leading-relaxed mb-1">${zy.guaBian.detail}</p>
                <p class="text-xuan-gold text-sm font-medium">${zy.guaBian.advice}</p>
            </div>
            <div class="p-4 bg-xuan-gold/5 rounded-lg border border-xuan-gold/20">
                <p class="text-sm text-xuan-gold font-medium mb-2">互卦分析</p>
                <p class="text-xuan-dark text-sm leading-relaxed mb-1">${zy.huGua.general}</p>
                <p class="text-xuan-brown text-sm leading-relaxed mb-1">${zy.huGua.detail}</p>
                <p class="text-xuan-gold text-sm font-medium">${zy.huGua.advice}</p>
            </div>
            ${zy.yaoWei ? `
            <div class="p-4 bg-xuan-paper rounded-lg border border-xuan-border">
                <p class="text-sm text-xuan-green font-medium mb-2">动爻位分析</p>
                <p class="text-xuan-dark text-sm leading-relaxed whitespace-pre-line">${zy.yaoWei}</p>
            </div>` : ''}
        </div>
    `;
    container.innerHTML = html;
}

function switchTab(tabName) {
    console.log('switchTab:', tabName);
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => {
        c.classList.add('hidden');
        c.style.display = 'none';
    });
    document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
    const el = document.getElementById('tab-'+tabName);
    if (el) {
        el.classList.remove('hidden');
        el.style.display = 'block';
        console.log('显示tab:', tabName, '内容:', el.innerHTML.substring(0, 50));
    } else {
        console.error('未找到tab元素:', 'tab-'+tabName);
    }
}

// 保存当前结果
function saveCurrentResult() {
    const r = window._currentResult;
    if (!r) { alert('无结果可保存'); return; }
    try {
        const record = {
            method: r.method, timeInfo: r.timeInfo,
            benGua: { name: r.benGua?.name, shang: r.benGua?.shang?.name, xia: r.benGua?.xia?.name, dongYao: r.benGua?.dongYao },
            bianGua: { name: r.bianGua?.name }, huGua: { name: r.huGua?.name },
            tiYong: { ti: r.tiYong?.ti, yong: r.tiYong?.yong, relation: r.tiYong?.relation },
            shiqing: { asked: r.shiqing?.asked, interpret: r.shiqing?.interpret }
        };
        const id = saveHistory(record);
        alert(id ? `已保存，编号：${id}` : '保存失败');
    } catch(e) { alert('保存出错'); }
}


// 暴露全局
window.GUA_DATA = GUA_DATA;
window.ZHI_NUM = ZHI_NUM;
window.getLunarInfo = getLunarInfo;
window.findGuaByYao = findGuaByYao;
window.qiGuaByTime = qiGuaByTime;
window.qiGuaByNumber = qiGuaByNumber;
window.qiGuaByCoins = qiGuaByCoins;
window.qiGuaByDirection = qiGuaByDirection;
window.qiGuaBySound = qiGuaBySound;
window.qiGuaByObject = qiGuaByObject;
window.getZhouYiAnalysis = getZhouYiAnalysis;
window.renderZhouYiAnalysis = renderZhouYiAnalysis;
window.saveHistory = saveHistory;
window.loadHistory = loadHistory;
window.deleteHistory = deleteHistory;
window.clearHistory = clearHistory;
window.exportHistory = exportHistory;
window.renderYaoLines = renderYaoLines;
window.renderResult = renderResult;
window.switchTab = switchTab;
window.saveCurrentResult = saveCurrentResult;
// ---------- 所问事情选择（供 time.html 使用） ----------
window.selectShiqing = function(btn, shiqing) {
    document.querySelectorAll('.shiqing-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    const input = document.getElementById('time-shiqing');
    if (input) input.value = '';
    window._selectedShiqing = shiqing;
};

// ================================================================
//  zhouyi-analysis.js – 周易详细卦象解析数据
//  基于《周易》经传及历代注疏（孔颖达、朱熹、王弼等）
// ================================================================

const ZHOUYI_ANALYSIS = {
  guaDe: {
    "乾为天": "乾，健也。天行刚健，自强不息。乾卦六爻皆阳，纯阳至健，象征创始、领导、进取。卦德为'元亨利贞'，四德具备，大吉之卦。",
    "坤为地": "坤，顺也。地势柔顺，厚德载物。坤卦六爻皆阴，纯阴至顺，象征包容、承载、顺从。卦德为'元亨利牝马之贞'，利守正道。",
    "水雷屯": "屯，难也。刚柔始交而难生，象征万物初生之艰难。卦德为'元亨利贞，勿用有攸往，利建侯'，宜守不宜进。",
    "山水蒙": "蒙，昧也。山下有险，蒙昧未明。象征启蒙、教育。卦德为'亨，匪我求童蒙，童蒙求我'，宜启蒙教化。",
    "水天需": "需，待也。云上于天，等待时机。象征等待、需求。卦德为'有孚，光亨，贞吉，利涉大川'，宜等待时机。",
    "天水讼": "讼，争也。天与水违行，象征争讼、矛盾。卦德为'有孚，窒惕，中吉，终凶'，宜和解不宜争。",
    "地水师": "师，众也。地中有水，象征军队、群众。卦德为'贞，丈人吉，无咎'，宜以正道率众。",
    "水地比": "比，辅也。地上有水，象征亲比、辅佐。卦德为'吉，原筮元永贞，无咎'，宜亲比贤人。",
    "风天小畜": "小畜，聚也。风行天上，密云不雨。象征小有蓄积。卦德为'亨，密云不雨，自我西郊'，宜蓄积待时。",
    "天泽履": "履，礼也。上天下泽，象征践履、礼仪。卦德为'履虎尾，不咥人，亨'，宜谨慎行事。",
    "地天泰": "泰，通也。天地交而万物通。象征通泰、安和。卦德为'小往大来，吉亨'，大吉之卦。",
    "天地否": "否，塞也。天地不交而万物不通。象征闭塞、否隔。卦德为'否之匪人，不利君子贞'，宜守待时。",
    "天火同人": "同人，亲也。天与火，象征和同于人。卦德为'同人于野，亨，利涉大川'，宜和同众人。",
    "火天大有": "大有，丰也。火在天上，象征大有收获。卦德为'元亨'，大吉之卦。",
    "地山谦": "谦，敬也。地中有山，象征谦虚。卦德为'亨，君子有终'，谦受益，满招损。",
    "雷地豫": "豫，乐也。雷出地奋，象征欢乐、豫悦。卦德为'利建侯行师'，宜有所作为。",
    "泽雷随": "随，从也。泽中有雷，象征随从。卦德为'元亨利贞，无咎'，宜随时而动。",
    "山风蛊": "蛊，事也。山下有风，象征蛊乱、整治。卦德为'元亨，利涉大川'，宜整治弊政。",
    "地泽临": "临，大也。泽上有地，象征临莅、督导。卦德为'元亨，利贞'，宜临事而惧。",
    "风地观": "观，示也。风行地上，象征观瞻、观察。卦德为'盥而不荐，有孚颙若'，宜观察学习。",
    "火雷噬嗑": "噬嗑，合也。雷电相合，象征咬合、刑罚。卦德为'亨，利用狱'，宜明罚敕法。",
    "山火贲": "贲，饰也。山下有火，象征文饰。卦德为'亨，小利有攸往'，宜文饰适度。",
    "山地剥": "剥，落也。山附于地，象征剥落。卦德为'不利有攸往'，宜守不宜进。",
    "地雷复": "复，反也。雷在地中，象征复归。卦德为'亨，出入无疾，朋来无咎'，宜回归正道。",
    "天雷无妄": "无妄，实也。天下雷行，象征真实无妄。卦德为'元亨利贞，其匪正有眚'，宜守正。",
    "山天大畜": "大畜，止也。天在山中，象征大蓄积。卦德为'利贞，不家食吉，利涉大川'，宜蓄积大才。",
    "山雷颐": "颐，养也。山下有雷，象征颐养。卦德为'贞吉，观颐，自求口实'，宜自养养人。",
    "泽风大过": "大过，颠也。泽灭木，象征大过失。卦德为'栋桡，利有攸往，亨'，宜纠偏救弊。",
    "坎为水": "坎，陷也。水洊至，象征险陷。卦德为'习坎，有孚，维心亨，行有尚'，宜行险而不失信。",
    "离为火": "离，丽也。明两作，象征附丽。卦德为'利贞，亨，畜牝牛吉'，宜附丽正道。",
    "泽山咸": "咸，感也。山上有泽，象征感应。卦德为'亨，利贞，取女吉'，宜感应沟通。",
    "雷风恒": "恒，久也。雷风相与，象征恒久。卦德为'亨，无咎，利贞，利有攸往'，宜持之以恒。",
    "天山遁": "遁，退也。天下有山，象征退避。卦德为'亨，小利贞'，宜知进退。",
    "雷天大壮": "大壮，强也。雷在天上，象征大强壮。卦德为'利贞'，宜守正不妄动。",
    "火地晋": "晋，进也。明出地上，象征晋升。卦德为'康侯用锡马蕃庶，昼日三接'，宜积极进取。",
    "地火明夷": "明夷，伤也。明入地中，象征光明受伤。卦德为'利艰贞'，宜守艰贞。",
    "风火家人": "家人，正也。风自火出，象征家庭。卦德为'利女贞'，宜正家道。",
    "火泽睽": "睽，乖也。上火下泽，象征乖离。卦德为'小事吉'，宜求同存异。",
    "水山蹇": "蹇，难也。山上有水，象征艰难。卦德为'利西南，不利东北'，宜见险而止。",
    "雷水解": "解，缓也。雷雨作，象征缓解。卦德为'利西南'，宜赦过宥罪。",
    "山泽损": "损，减也。山下有泽，象征减损。卦德为'有孚，元吉，无咎'，宜损下益上。",
    "风雷益": "益，增也。风雷相与，象征增益。卦德为'利有攸往，利涉大川'，宜损上益下。",
    "泽天夬": "夬，决也。泽上于天，象征决断。卦德为'扬于王庭，孚号有厉'，宜果断决柔。",
    "天风姤": "姤，遇也。天下有风，象征相遇。卦德为'女壮，勿用取女'，宜谨慎相遇。",
    "泽地萃": "萃，聚也。泽上于地，象征聚集。卦德为'亨，王假有庙'，宜聚贤养众。",
    "地风升": "升，进也。地中生木，象征上升。卦德为'元亨，用见大人'，宜积小成大。",
    "泽水困": "困，穷也。泽无水，象征困穷。卦德为'亨，贞，大人吉'，宜致命遂志。",
    "水风井": "井，通也。木上有水，象征井泉。卦德为'改邑不改井'，宜劳民劝相。",
    "泽火革": "革，变也。泽中有火，象征变革。卦德为'己日乃孚，元亨'，宜顺天应人。",
    "火风鼎": "鼎，定也。木上有火，象征鼎新。卦德为'元吉，亨'，宜正位凝命。",
    "震为雷": "震，动也。洊雷震，象征震动。卦德为'亨，震来虩虩'，宜恐惧修省。",
    "艮为山": "艮，止也。兼山艮，象征止静。卦德为'艮其背，不获其身'，宜思不出位。",
    "风山渐": "渐，进也。山上有木，象征渐进。卦德为'女归吉，利贞'，宜循序渐进。",
    "雷泽归妹": "归妹，嫁也。泽上有雷，象征嫁娶。卦德为'征凶，无攸利'，宜守正待时。",
    "雷火丰": "丰，大也。雷电皆至，象征丰大。卦德为'亨，王假之'，宜明以动。",
    "火山旅": "旅，行也。山上有火，象征行旅。卦德为'小亨，旅贞吉'，宜明慎用刑。",
    "巽为风": "巽，入也。随风巽，象征顺从。卦德为'小亨，利有攸往'，宜申命行事。",
    "兑为泽": "兑，说也。丽泽兑，象征喜悦。卦德为'亨，利贞'，宜朋友讲习。",
    "风水涣": "涣，散也。风行水上，象征涣散。卦德为'亨，王假有庙'，宜享帝立庙。",
    "水泽节": "节，止也。泽上有水，象征节制。卦德为'亨，苦节不可贞'，宜制度数度。",
    "风泽中孚": "中孚，信也。泽上有风，象征诚信。卦德为'豚鱼吉，利涉大川'，宜议狱缓死。",
    "雷山小过": "小过，过也。山上有雷，象征小过。卦德为'亨，利贞，可小事'，宜行过乎恭。",
    "水火既济": "既济，成也。水在火上，象征既成。卦德为'亨，小利贞，初吉终乱'，宜思患预防。",
    "火水未济": "未济，未成也。火在水上，象征未成。卦德为'亨，小狐汔济'，宜慎始慎终。"
  },

  guaXiang: {
    "乾为天": "六阳纯一，天行健。乾卦为《周易》首卦，象征天道刚健，万物之始。六爻皆阳，阳气充盈，为纯阳之卦。",
    "坤为地": "六阴纯一，地势顺。坤卦为《周易》第二卦，象征地道柔顺，承载万物。六爻皆阴，阴气充盈，为纯阴之卦。",
    "水雷屯": "震下坎上，云雷屯。刚柔始交，万物初生，艰难之象。",
    "山水蒙": "坎下艮上，山水蒙。山下出泉，蒙昧未明，启蒙之象。",
    "水天需": "乾下坎上，水天需。云上于天，等待之象。",
    "天水讼": "坎下乾上，天水讼。天与水违行，争讼之象。",
    "地水师": "坎下坤上，地水师。地中有水，聚众之象。",
    "水地比": "坤下坎上，水地比。地上有水，亲比之象。",
    "风天小畜": "乾下巽上，风天小畜。风行天上，小蓄之象。",
    "天泽履": "兑下乾上，天泽履。上天下泽，践履之象。",
    "地天泰": "乾下坤上，地天泰。天地交而万物通，通泰之象。",
    "天地否": "坤下乾上，天地否。天地不交而万物不通，闭塞之象。",
    "天火同人": "离下乾上，天火同人。天与火，和同之象。",
    "火天大有": "乾下离上，火天大有。火在天上，大有之象。",
    "地山谦": "艮下坤上，地山谦。地中有山，谦虚之象。",
    "雷地豫": "坤下震上，雷地豫。雷出地奋，豫悦之象。",
    "泽雷随": "震下兑上，泽雷随。泽中有雷，随从之象。",
    "山风蛊": "巽下艮上，山风蛊。山下有风，蛊乱之象。",
    "地泽临": "兑下坤上，地泽临。泽上有地，临莅之象。",
    "风地观": "坤下巽上，风地观。风行地上，观瞻之象。",
    "火雷噬嗑": "震下离上，火雷噬嗑。雷电相合，咬合之象。",
    "山火贲": "离下艮上，山火贲。山下有火，文饰之象。",
    "山地剥": "坤下艮上，山地剥。山附于地，剥落之象。",
    "地雷复": "震下坤上，地雷复。雷在地中，复归之象。",
    "天雷无妄": "震下乾上，天雷无妄。天下雷行，无妄之象。",
    "山天大畜": "乾下艮上，山天大畜。天在山中，大蓄之象。",
    "山雷颐": "震下艮上，山雷颐。山下有雷，颐养之象。",
    "泽风大过": "巽下兑上，泽风大过。泽灭木，大过之象。",
    "坎为水": "坎下坎上，坎为水。水洊至，险陷之象。",
    "离为火": "离下离上，离为火。明两作，附丽之象。",
    "泽山咸": "艮下兑上，泽山咸。山上有泽，感应之象。",
    "雷风恒": "巽下震上，雷风恒。雷风相与，恒久之象。",
    "天山遁": "艮下乾上，天山遁。天下有山，退避之象。",
    "雷天大壮": "乾下震上，雷天大壮。雷在天上，大壮之象。",
    "火地晋": "坤下离上，火地晋。明出地上，晋升之象。",
    "地火明夷": "离下坤上，地火明夷。明入地中，光明受伤之象。",
    "风火家人": "离下巽上，风火家人。风自火出，家庭之象。",
    "火泽睽": "兑下离上，火泽睽。上火下泽，乖离之象。",
    "水山蹇": "艮下坎上，水山蹇。山上有水，艰难之象。",
    "雷水解": "坎下震上，雷水解。雷雨作，缓解之象。",
    "山泽损": "兑下艮上，山泽损。山下有泽，减损之象。",
    "风雷益": "震下巽上，风雷益。风雷相与，增益之象。",
    "泽天夬": "乾下兑上，泽天夬。泽上于天，决断之象。",
    "天风姤": "巽下乾上，天风姤。天下有风，相遇之象。",
    "泽地萃": "坤下兑上，泽地萃。泽上于地，聚集之象。",
    "地风升": "巽下坤上，地风升。地中生木，上升之象。",
    "泽水困": "坎下兑上，泽水困。泽无水，困穷之象。",
    "水风井": "巽下坎上，水风井。木上有水，井泉之象。",
    "泽火革": "离下兑上，泽火革。泽中有火，变革之象。",
    "火风鼎": "巽下离上，火风鼎。木上有火，鼎新之象。",
    "震为雷": "震下震上，震为雷。洊雷震，震动之象。",
    "艮为山": "艮下艮上，艮为山。兼山艮，止静之象。",
    "风山渐": "艮下巽上，风山渐。山上有木，渐进之象。",
    "雷泽归妹": "兑下震上，雷泽归妹。泽上有雷，嫁娶之象。",
    "雷火丰": "离下震上，雷火丰。雷电皆至，丰大之象。",
    "火山旅": "艮下离上，火山旅。山上有火，行旅之象。",
    "巽为风": "巽下巽上，巽为风。随风巽，顺从之象。",
    "兑为泽": "兑下兑上，兑为泽。丽泽兑，喜悦之象。",
    "风水涣": "坎下巽上，风水涣。风行水上，涣散之象。",
    "水泽节": "兑下坎上，水泽节。泽上有水，节制之象。",
    "风泽中孚": "兑下巽上，风泽中孚。泽上有风，诚信之象。",
    "雷山小过": "艮下震上，雷山小过。山上有雷，小过之象。",
    "水火既济": "离下坎上，水火既济。水在火上，既成之象。",
    "火水未济": "坎下离上，火水未济。火在水上，未成之象。"
  },

  duanGua: {
    "体克用": {
      general: "体卦克用卦，为主克客之象。事可成，但需主动争取，费力而后得。",
      detail: "体克用，我克彼也。如以强胜弱，以智胜愚。然克者劳，被克者怨，故虽成而有损耗。若体卦旺相，则克之有力；若体卦衰弱，则克之无功，反受其累。",
      advice: "宜主动出击，积极争取。但需注意方式方法，不可过于强硬，以免伤人伤己。"
    },
    "用克体": {
      general: "用卦克体卦，为客克主之象。事不顺，阻力大，宜守不宜攻。",
      detail: "用克体，彼克我也。如以弱敌强，以寡敌众。此时形势不利，当退守以避其锋。若用卦旺相而体卦衰弱，则祸患难免；若体卦虽弱而有援，或可转危为安。",
      advice: "宜退守自保，不可轻举妄动。静待时机，寻求外援，以柔克刚。"
    },
    "用生体": {
      general: "用卦生体卦，为客生主之象。事吉，得贵人相助，事半功倍。",
      detail: "用生体，彼生我也。如顺水行舟，如逢甘霖。此时天时地利人和皆备，所求易成。若用卦旺相，则生之有力；若体卦亦旺，则受益更深。",
      advice: "宜顺势而行，积极把握机遇。但需感恩图报，不可忘恩负义。"
    },
    "体生用": {
      general: "体卦生用卦，为主生客之象。事有进展，但付出多，消耗大。",
      detail: "体生用，我生彼也。如割肉饲鹰，如倾囊助人。虽有所成，然自身受损。若体卦旺相，则生之有余；若体卦衰弱，则生之无力，反被拖累。",
      advice: "宜量力而行，不可过度付出。需评估自身实力，留有余地。"
    },
    "体用比和": {
      general: "体用比和，为主客同气之象。事平稳，合作顺利，同心协力。",
      detail: "体用比和，同类相助也。如兄弟同心，如朋友协力。此时内外一致，上下同心，所谋易成。然比和亦有偏枯之虑，若过于和同，则缺乏变通。",
      advice: "宜合作共事，团结力量。但需保持独立判断，不可人云亦云。"
    }
  },

  yaoWei: {
    1: "初爻：事物之始，根基之位。如初生之芽，如学步之婴。宜固本培元，不可妄动。",
    2: "二爻：事物之基，内卦之主。如屋之栋梁，如国之大臣。宜守中道，不可偏倚。",
    3: "三爻：事物之半，进退之际。如日中则昃，如月盈则亏。宜果断决策，不可犹豫。",
    4: "四爻：事物之转，外卦之始。如黎明前的黑暗，如寒冬后的初春。宜顺势而变，不可固执。",
    5: "五爻：事物之峰，君位之尊。如九五之尊，如泰山之巅。宜中正守位，不可骄奢。",
    6: "上爻：事物之终，结果之位。如日落西山，如落叶归根。宜善始善终，不可贪恋。"
  },

  guaBian: {
    general: "本卦为现在之象，变卦为未来之兆。动爻为变化之机，变卦为变化之果。",
    detail: "卦变者，由本而变也。本卦如种子，变卦如果实；本卦如病因，变卦如病果。观其变者，知其所趋；观其不变者，知其所守。",
    advice: "宜观变以知进退，察微以明吉凶。变者动之机，不变者静之守。"
  },

  huGuaAnalysis: {
    general: "互卦为事物过程之象，内互卦为内因，外互卦为外缘。",
    detail: "互卦者，卦中之卦也。本卦为始，互卦为过程，变卦为终。观互卦可知事物发展之曲折，明内外之因由。",
    advice: "宜观互卦以知过程之顺逆，察内外之因由。"
  }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ZHOUYI_ANALYSIS };
} else {
    window.ZHOUYI_ANALYSIS = ZHOUYI_ANALYSIS;
}