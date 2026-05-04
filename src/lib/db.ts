import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, "tutupanel.db"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nickname TEXT NOT NULL,
    content TEXT NOT NULL,
    images TEXT NOT NULL DEFAULT '[]',
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS feedings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL UNIQUE,
    nickname TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS tips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    body_md TEXT NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts (created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_feedings_date ON feedings (date);
`);

// 一次性迁移：把旧的 (date, slot) 三时段表合并为单次/天
type ColInfo = { name: string };
const cols = db.prepare("PRAGMA table_info(feedings)").all() as ColInfo[];
if (cols.some((c) => c.name === "slot")) {
  db.exec(`
    BEGIN;
    ALTER TABLE feedings RENAME TO feedings_old;
    CREATE TABLE feedings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL UNIQUE,
      nickname TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
    INSERT INTO feedings (date, nickname, created_at)
      SELECT date, MIN(nickname), MIN(created_at)
      FROM feedings_old
      GROUP BY date;
    DROP TABLE feedings_old;
    CREATE INDEX IF NOT EXISTS idx_feedings_date ON feedings (date);
    COMMIT;
  `);
}

// 首次启动：种子养兔须知
const SEED_TIPS: { title: string; body: string }[] = [
  {
    title: "⚠️ 最重要：离开前关好笼门！",
    body: `> 离开前**务必**反复确认笼门已关好、扣紧。

兔兔跑出去后果不堪设想 —— 不论是二楼草图的笼子还是北侧花园的大笼，都要检查：

- 笼门是否扣紧
- 抽屉是否推回原位
- 栅栏 / 围挡是否完好
- 所有进出口是否锁好

**离开现场前再回头看一眼**，养成习惯。`,
  },
  {
    title: "🏠 二楼笼子（景观学院二楼草图咖啡）",
    body: `## 物资位置

- **① 兔笼**：蓝色加水、白色加兔粮、内白槽加草；下两层抽屉用来换尿垫和薄膜
- **② 豚鼠偷偷的笼**：内有粮碗，外挂水瓶，底部放尿垫和薄膜
- **③ 尿垫**（白色 / 蓝色）
- **④ 手套**（铲屎、喂兔通用）
- **⑤ 薄膜**（垫在尿垫下方，方便整体兜起）
- **⑥ 粮**（袋内附小铲子）
- **⑦ 草**

## To-do

- **加水**：灌满即可，景观学院有饮水机
- **加粮**：
  - 豚鼠 ~50–100 g/天（铲 1–2 把）
  - 兔 ~100–150 g/天（铲 2–3 把）
- **加草**：
  - 豚鼠 ~50–100 g/天（抓 1–2 把）
  - 兔 ~100–150 g/天（抓 2–3 把）
- **铲屎**：抽出抽屉 + 偷偷笼下方，换尿垫与薄膜，旧的拐到楼上的垃圾桶里。**每天看一下，快满了就换，别堆太高否则卡住很难清理。**
- **物资不足**直接在群里说一声～`,
  },
  {
    title: "🌳 楼下大笼子（景观学院北侧花园）",
    body: `> 兔兔们的主要栖息地，没在草图营业的兔宝都住这里！！

## 位置

- **仓库** 与 **水龙头** 位置见喂兔指南附图
- 笼子位于景观学院北侧花园

## To-do

- **加水**：把悬挂的两个水瓶灌满即可
- **加粮**：笼内有红色食盘，一只兔 ~100–150 g/天，把食盘表层灌满即可
- **加草**：把蓝色区域的草架填满即可`,
  },
  {
    title: "📅 值班表（共 38 人次）",
    body: `| 周一 (5) | 周二 (4) | 周三 (5) | 周四 (5) |
| --- | --- | --- | --- |
| 赵豫雅 | 谢昕辰 | 李思齐 | 王依依 |
| 吴昀泽 | 郄心悦 | 张一诺 | 李添怡 |
| 许焰昕 | 林舒珂 | 黄皓 | 刘熙樊 |
| 齐殿蕊 | 贾新颖 | 杜怡然 | 李咏馨 |
| 梁瑞涵 |  | 张佳彦 | 周梓茵 |

| 周五 (5) | 周六 (4) | 周日 (5) | 机动 (5) |
| --- | --- | --- | --- |
| 陈治伃 | 梁熙语 | 尚睿卿 | 杨晗 |
| 蒙开心 | 王诗媛 | 王泓毅 | 刘晓宇 |
| 黄梓洵 | 何沐冉 | 宋宜 | 陈彦伯 |
| 单爱倪 | 叶沛霖 | 贾竺霖 | 陈镭 |
| 周佳琳 |  | 冯奥博 | 张秀滨 |`,
  },
  {
    title: "💬 其它说明",
    body: `- **物资告急 / 临时调班 / 紧急情况**：群里吼一声
- **发现兔兔生病或异常**：尽快拍照发群
- **打卡**：每天来过、加完水粮草、铲完屎、关好门，就在「喂食打卡」页打个卡，让大家知道今天已经有人来过 🐰`,
  },
];

const tipCount = db.prepare("SELECT COUNT(*) AS c FROM tips").get() as { c: number };
if (tipCount.c === 0) {
  const insert = db.prepare("INSERT INTO tips (title, body_md, updated_at) VALUES (?, ?, ?)");
  const now = Date.now();
  const tx = db.transaction(() => {
    SEED_TIPS.forEach(({ title, body }) => insert.run(title, body, now));
  });
  tx();
}

export default db;
