// ================================================================
// bazi/base.js - 子平术基础数据模块
// 天干地支、五行、藏干、纳音、十二长生、十神心性、纳音取象
// ================================================================

const BA_TIAN_GAN = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
const BA_DI_ZHI   = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
const TG_YIN_YANG = { "甲":"阳","乙":"阴","丙":"阳","丁":"阴","戊":"阳","己":"阴","庚":"阳","辛":"阴","壬":"阳","癸":"阴" };
const TG_WU_XING  = { "甲":"木","乙":"木","丙":"火","丁":"火","戊":"土","己":"土","庚":"金","辛":"金","壬":"水","癸":"水" };
const DZ_WU_XING  = { "子":"水","丑":"土","寅":"木","卯":"木","辰":"土","巳":"火","午":"火","未":"土","申":"金","酉":"金","戌":"土","亥":"水" };
const CANG_GAN = {
    "子": ["癸"], "丑": ["己","癸","辛"], "寅": ["甲","丙","戊"], "卯": ["乙"],
    "辰": ["戊","乙","癸"], "巳": ["丙","庚","戊"], "午": ["丁","己"], "未": ["己","丁","乙"],
    "申": ["庚","壬","戊"], "酉": ["辛"], "戌": ["戊","辛","丁"], "亥": ["壬","甲"]
};
const NAYIN_60 = [
    "海中金","海中金","炉中火","炉中火","大林木","大林木","路旁土","路旁土","剑锋金","剑锋金",
    "山头火","山头火","涧下水","涧下水","城头土","城头土","白蜡金","白蜡金","杨柳木","杨柳木",
    "泉中水","泉中水","屋上土","屋上土","霹雳火","霹雳火","松柏木","松柏木","长流水","长流水",
    "砂石金","砂石金","山下火","山下火","平地木","平地木","壁上土","壁上土","金箔金","金箔金",
    "覆灯火","覆灯火","天河水","天河水","大驿土","大驿土","钗钏金","钗钏金","桑柘木","桑柘木",
    "大溪水","大溪水","沙中土","沙中土","天上火","天上火","石榴木","石榴木","大海水","大海水"
];

// 十二长生（阳顺阴逆）
const SHI_ER_CHANG_SHENG = {
    "甲": ["亥","子","丑","寅","卯","辰","巳","午","未","申","酉","戌"],
    "乙": ["午","巳","辰","卯","寅","丑","子","亥","戌","酉","申","未"],
    "丙": ["寅","卯","辰","巳","午","未","申","酉","戌","亥","子","丑"],
    "丁": ["酉","申","未","午","巳","辰","卯","寅","丑","子","亥","戌"],
    "戊": ["寅","卯","辰","巳","午","未","申","酉","戌","亥","子","丑"],
    "己": ["酉","申","未","午","巳","辰","卯","寅","丑","子","亥","戌"],
    "庚": ["巳","午","未","申","酉","戌","亥","子","丑","寅","卯","辰"],
    "辛": ["子","亥","戌","酉","申","未","午","巳","辰","卯","寅","丑"],
    "壬": ["申","酉","戌","亥","子","丑","寅","卯","辰","巳","午","未"],
    "癸": ["卯","寅","丑","子","亥","戌","酉","申","未","午","巳","辰"]
};
const CHANG_SHENG_NAME = ["长生","沐浴","冠带","临官","帝旺","衰","病","死","墓","绝","胎","养"];

// 十神心性
const SHI_SHEN_XIN_XING = {
    "比肩": "自尊心强，独立自主，果断坚毅，有领导能力，但易固执己见，争强好胜。",
    "劫财": "热情豪爽，重义轻财，善交际，但易冲动鲁莽，财来财去。",
    "食神": "温和宽厚，才华横溢，艺术天赋，口福好，但易懒散，缺乏进取。",
    "伤官": "聪明伶俐，才华出众，叛逆创新，但易恃才傲物，口舌是非多。",
    "偏财": "慷慨大方，善交际，有商业头脑，但易浮华，不善守财。",
    "正财": "务实勤俭，重视物质，稳重踏实，但易吝啬，缺乏浪漫。",
    "七杀": "威严果断，有魄力，执行力强，但易暴躁，压力大。",
    "正官": "守规矩，有责任感，正直稳重，但易保守，缺乏变通。",
    "偏印": "聪明偏门，心思细腻，有独创性，但易孤僻，多疑。",
    "正印": "仁慈宽厚，学识渊博，有贵人庇护，但易依赖，缺乏独立。"
};

// 纳音取象详解
const NAYIN_XIANG = {
    "海中金": "宝藏龙宫，珠孕蛟室，虽能变化，但处于沉潜之时，需待时而发。",
    "炉中火": "以天地为炉，阴阳为炭，光辉宇宙，陶冶乾坤，需木生方旺。",
    "大林木": "枝干撼风，柯条撑月，耸壑昂霄之德，凌云蔽日之功，需金雕琢。",
    "路旁土": "大地连途，平田万顷，禾稼赖以滋生，草木由之畅茂，需水滋润。",
    "剑锋金": "白帝司权，刚由百炼，红光射于斗牛，白刃凝于霜雪，锐不可当。",
    "山头火": "野焚燎原，延烧极目，依稀天际斜晖，仿佛山头落日，需风助势。",
    "涧下水": "山环细浪，雪涌飞湍，相连南北之流，对峙坎离之脉，清澄喜金。",
    "城头土": "天京玉垒，帝里金城，龙盘千里之形，虎踞四维之势，需木疏土。",
    "白蜡金": "昆山片玉，洛浦遗金，交栖日月之光，凝聚阴阳之气，喜火炼成器。",
    "杨柳木": "隋堤袅娜，汉苑轻盈，万缕不蚕之丝，千条不针之带，喜水润生。",
    "泉中水": "寒泉清冽，取养不穷，八家凿之以同饮，万民资之以生活，喜金生发。",
    "屋上土": "头砖瓦，壁栋梁，雄鸡唱午之时，野鹤啼昏之处，需木支撑。",
    "霹雳火": "一缕毫光，九天号令，电掣金蛇之势，云驱铁马之奔，势猛如雷。",
    "松柏木": "泼雪凑霜，参天覆地，风撼笙篁之奏，雨余旌旆之张，傲雪凌霜。",
    "长流水": "滔滔不竭，势极东南，洋洋东流，归於海，喜金生助。",
    "砂石金": "刚利果敢，威严肃杀，如矿砂之金，需火炼方成器皿。",
    "山下火": "草间熠耀，花理荧煌，寒林缀叶之光，隔幔穿花之焰，微光闪烁。",
    "平地木": "地上茂材，人间屋木，花蕊娇艳，果实成熟，喜雨露滋润。",
    "壁上土": "恃栋依梁，兴门立户，却暑御寒之德，遮霜护雪之功，需木依托。",
    "金箔金": "润色杯盘，增光宫室，打薄须借乎别金，描彩必假乎水力，喜水木。",
    "覆灯火": "金盏衔光，玉台吐艳，照日月不照之处，明天地未明之时，喜木为芯。",
    "天河水": "沛然作霖，寸土不滋，而昆仑之上有天潢，银河之畔有星汉，喜土为堤。",
    "大驿土": "堂堂大道，坦坦平途，九州无所不通，万国无行不至，喜木疏通。",
    "钗钏金": "美容首饰，增娇腻质，偎红倚翠之珍，枕玉眠香之宝，喜水木光泽。",
    "桑柘木": "缯彩镃基，绮罗根本，士民飘飘之袂，圣贤楚楚之衣，喜金剪裁。",
    "大溪水": "惊涛拍岸，骇浪浮天，光涵万里之宽，碧倒千山之影，喜金涵养。",
    "沙中土": "浪涛所积，波渚所凝，龙蛇盘隐之宫，陵谷变迁之地，喜金木疏凿。",
    "天上火": "温暖山海，辉光宇宙，阳德丽天之照，阴精离海之明，喜木为薪。",
    "石榴木": "性辛如姜，花红似火，数颗枝头，累累多子，喜金砍削成器。",
    "大海水": "总纳百川，汪洋无际，含藏金玉，波澜起伏，喜木为舟。"
};

// 格局释义
const GE_JU_MAP = {
    "正官": "月令本气或透干为正官，主贵气、守规矩、有责任感。官星得用，仕途有望。",
    "七杀": "月令本气或透干为七杀，主威严、果断、有魄力。杀重需制化，食神制杀或印化杀为权。",
    "正印": "月令本气或透干为正印，主仁慈、学识、有贵人庇护。印旺需财破，否则易懒散。",
    "偏印": "月令本气或透干为偏印，主聪明、偏门技艺、心思细腻。枭神夺食需防。",
    "正财": "月令本气或透干为正财，主务实、勤俭、重视物质生活。财旺需身旺方能任财。",
    "偏财": "月令本气或透干为偏财，主慷慨、善交际、有商业头脑。偏财旺宜经商。",
    "食神": "月令本气或透干为食神，主温和、才华、口福、艺术天赋。食神生财，富贵自然来。",
    "伤官": "月令本气或透干为伤官，主聪明、叛逆、才华横溢。伤官配印，贵不可言。"
};

// 地支关系
const LIU_HE = { "子":"丑","丑":"子","寅":"亥","亥":"寅","卯":"戌","戌":"卯","辰":"酉","酉":"辰","巳":"申","申":"巳","午":"未","未":"午" };
const LIU_CHONG = { "子":"午","午":"子","丑":"未","未":"丑","寅":"申","申":"寅","卯":"酉","酉":"卯","辰":"戌","戌":"辰","巳":"亥","亥":"巳" };
const SAN_HE = { "申子辰": "水局", "亥卯未": "木局", "寅午戌": "火局", "巳酉丑": "金局" };
const XING = { "子":"卯","卯":"子","寅":"巳","巳":"申","申":"寅","丑":"戌","戌":"未","未":"丑","辰":"辰","午":"午","酉":"酉","亥":"亥" };
const HAI = { "子":"未","未":"子","丑":"午","午":"丑","寅":"巳","巳":"寅","卯":"辰","辰":"卯","申":"亥","亥":"申","酉":"戌","戌":"酉" };
const PO = { "子":"酉","酉":"子","午":"卯","卯":"午","巳":"申","申":"巳","寅":"亥","亥":"寅","辰":"丑","丑":"辰","戌":"未","未":"戌" };
const TIAN_GAN_HE = { "甲":"己","己":"甲","乙":"庚","庚":"乙","丙":"辛","辛":"丙","丁":"壬","壬":"丁","戊":"癸","癸":"戊" };
const TIAN_GAN_HUA = { "甲己":"土","乙庚":"金","丙辛":"水","丁壬":"木","戊癸":"火" };

function tgIndex(g) { return BA_TIAN_GAN.indexOf(g); }
function dzIndex(z) { return BA_DI_ZHI.indexOf(z); }
function isSheng(from, to) { return { "木":"火","火":"土","土":"金","金":"水","水":"木" }[from] === to; }
function isKe(from, to) { return { "木":"土","土":"水","水":"火","火":"金","金":"木" }[from] === to; }

// 暴露全局
window.BA_TIAN_GAN = BA_TIAN_GAN; window.BA_DI_ZHI = BA_DI_ZHI;
window.TG_YIN_YANG = TG_YIN_YANG; window.TG_WU_XING = TG_WU_XING;
window.DZ_WU_XING = DZ_WU_XING; window.CANG_GAN = CANG_GAN;
window.NAYIN_60 = NAYIN_60; window.SHI_ER_CHANG_SHENG = SHI_ER_CHANG_SHENG;
window.CHANG_SHENG_NAME = CHANG_SHENG_NAME; window.SHI_SHEN_XIN_XING = SHI_SHEN_XIN_XING;
window.NAYIN_XIANG = NAYIN_XIANG; window.GE_JU_MAP = GE_JU_MAP;
window.LIU_HE = LIU_HE; window.LIU_CHONG = LIU_CHONG; window.SAN_HE = SAN_HE;
window.XING = XING; window.HAI = HAI; window.PO = PO;
window.TIAN_GAN_HE = TIAN_GAN_HE; window.TIAN_GAN_HUA = TIAN_GAN_HUA;
window.tgIndex = tgIndex; window.dzIndex = dzIndex;
window.isSheng = isSheng; window.isKe = isKe;


// ================================================================
// bazi/calendar.js - 天文历法模块
// 节气计算、真太阳时、儒略日转换
// ================================================================

function gregorianToJD(y, m, d, h, mi) {
    if (m <= 2) { y -= 1; m += 12; }
    let A = Math.floor(y / 100);
    let B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + (h + mi / 60) / 24 + B - 1524.5;
}
function jdToDateTime(jd) {
    jd += 0.5;
    let Z = Math.floor(jd), F = jd - Z, A = Z;
    if (Z >= 2299161) { let a = Math.floor((Z - 1867216.25) / 36524.25); A = Z + 1 + a - Math.floor(a / 4); }
    let B = A + 1524, C = Math.floor((B - 122.1) / 365.25), D = Math.floor(365.25 * C);
    let E = Math.floor((B - D) / 30.6001);
    let day = B - D - Math.floor(30.6001 * E);
    let month = E < 14 ? E - 1 : E - 13;
    let year = month > 2 ? C - 4716 : C - 4715;
    let hour = F * 24, h = Math.floor(hour), mi = Math.floor((hour - h) * 60);
    return { year, month, day, hour: h, minute: mi };
}
function sunLongitude(jd) {
    let T = (jd - 2451545.0) / 36525;
    let L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
    let M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
    let Mr = M * Math.PI / 180;
    let C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mr)
          + (0.019993 - 0.000101 * T) * Math.sin(2 * Mr)
          + 0.000289 * Math.sin(3 * Mr);
    let lam = L0 + C;
    lam = lam % 360; if (lam < 0) lam += 360;
    return lam;
}
function findJieQi(year, targetLon) {
    let month = 1;
    if (targetLon === 315) month = 2; else if (targetLon === 345) month = 3; else if (targetLon === 15) month = 4;
    else if (targetLon === 45) month = 5; else if (targetLon === 75) month = 6; else if (targetLon === 105) month = 7;
    else if (targetLon === 135) month = 8; else if (targetLon === 165) month = 9; else if (targetLon === 195) month = 10;
    else if (targetLon === 225) month = 11; else if (targetLon === 255) month = 12; else if (targetLon === 285) month = 1;
    let jd = gregorianToJD(year, month, 1, 0, 0), step = 0.5;
    let prevLon = sunLongitude(jd), prevJD = jd; jd += step;
    while (true) {
        let lon = sunLongitude(jd), p = prevLon, c = lon;
        if (c < p && p - c > 180) c += 360; else if (p < c && c - p > 180) p += 360;
        if ((p <= targetLon && c >= targetLon) || (p >= targetLon && c <= targetLon)) {
            let ratio = Math.abs(targetLon - p) / Math.abs(c - p);
            let jd0 = prevJD + ratio * step;
            for (let i = 0; i < 8; i++) {
                let l0 = sunLongitude(jd0), l1 = sunLongitude(jd0 + 0.0001), dl = l1 - l0;
                if (Math.abs(dl) > 180) { if (l0 > 180) l0 -= 360; else l1 -= 360; dl = l1 - l0; }
                let f = l0 - targetLon, df = dl / 0.0001;
                if (Math.abs(df) < 1e-10) break;
                let jd1 = jd0 - f / df;
                if (Math.abs(jd1 - jd0) < 0.00001) break;
                jd0 = jd1;
            }
            return jdToDateTime(jd0);
        }
        prevLon = lon; prevJD = jd; jd += step;
        if (jd > gregorianToJD(year + 2, 1, 1, 0, 0)) break;
    }
    return null;
}
function getTrueSolarTime(y, m, d, h, mi, longitude) {
    let lonCorr = (longitude - 120) * 4;
    let date = new Date(y, m - 1, d), start = new Date(y, 0, 1);
    let N = Math.floor((date - start) / 86400000) + 1;
    let B = 360 * (N - 81) / 364, Br = B * Math.PI / 180;
    let eot = 9.87 * Math.sin(2 * Br) - 7.53 * Math.cos(Br) - 1.5 * Math.sin(Br);
    let total = lonCorr + eot;
    let totalMin = h * 60 + mi + total;
    let th = Math.floor(totalMin / 60), tmi = Math.floor(totalMin % 60);
    let td = d, tm = m, ty = y;
    while (th < 0) { th += 24; td -= 1; if (td < 1) { tm -= 1; if (tm < 1) { ty -= 1; tm = 12; } td = new Date(ty, tm, 0).getDate(); } }
    while (th >= 24) { th -= 24; td += 1; let dim = new Date(ty, tm, 0).getDate(); if (td > dim) { td = 1; tm += 1; if (tm > 12) { ty += 1; tm = 1; } } }
    return { year: ty, month: tm, day: td, hour: th, minute: tmi };
}

window.gregorianToJD = gregorianToJD; window.jdToDateTime = jdToDateTime;
window.sunLongitude = sunLongitude; window.findJieQi = findJieQi;
window.getTrueSolarTime = getTrueSolarTime;


// ================================================================
// bazi/wuxing.js - 五行统计与纳音取象模块
// ================================================================

function getWuXingStats(siZhu, cangGan) {
    let stats = { "金":0, "木":0, "水":0, "火":0, "土":0 };
    let tianGanWuXing = { "甲":"木","乙":"木","丙":"火","丁":"火","戊":"土","己":"土","庚":"金","辛":"金","壬":"水","癸":"水" };
    for (let key of ['year','month','day','time']) {
        let gan = siZhu[key].gan;
        stats[tianGanWuXing[gan]] += 1;
    }
    for (let key of ['year','month','day','time']) {
        let zhi = siZhu[key].zhi;
        let cg = cangGan[key] || [];
        for (let i = 0; i < cg.length; i++) {
            let weight = i === 0 ? 1 : i === 1 ? 0.6 : 0.3;
            stats[tianGanWuXing[cg[i]]] += weight;
        }
    }
    let maxWx = Object.keys(stats).reduce((a,b) => stats[a] > stats[b] ? a : b);
    let minWx = Object.keys(stats).reduce((a,b) => stats[a] < stats[b] ? a : b);
    return { stats, max: maxWx, min: minWx, desc: `五行分布：金${stats['金'].toFixed(1)}、木${stats['木'].toFixed(1)}、水${stats['水'].toFixed(1)}、火${stats['火'].toFixed(1)}、土${stats['土'].toFixed(1)}。最旺${maxWx}，最弱${minWx}。` };
}

function getNayinXiang(nayin) {
    return NAYIN_XIANG[nayin] || "";
}

window.getWuXingStats = getWuXingStats; window.getNayinXiang = getNayinXiang;
