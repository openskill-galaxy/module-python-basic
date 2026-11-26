import catalog from "./catalog.json";

export const exerciseTitles: Readonly<Record<string, string>> = catalog;

export interface Sample {
  input: string;
  expected: string;
  hint: string;
}

export interface Exercise {
  task: string;
  starter: string;
  samples: Sample[];
  challenge: Sample;
}

export const exercises: Record<string, Exercise> = {
  "mod-python-basic-l-1": {
    task: "一行输入是若干天的阅读页数（非负整数，以空格分隔）。补全带类型注解的函数，求这些天的平均页数。输出保留一位小数；没有任何记录时输出“暂无记录”。",
    starter: `def mean_pages(pages: list[int]) -> float | None:
    # 在这里计算平均值，空列表返回 None
    return None

pages = [int(value) for value in input().split()]
average = mean_pages(pages)
print("暂无记录" if average is None else f"{average:.1f}")`,
    samples: [
      { input: "8 11 8", expected: "9.0", hint: "计算总页数后，除数应当是记录的天数；输出要保留一位小数。" },
      { input: "2 3", expected: "2.5", hint: "平均数可以是小数，检查除法有没有丢掉小数部分。" },
      { input: "0 0", expected: "0.0", hint: "两天各读零页仍然有记录。判断没有记录时，应检查列表是否为空。" },
      { input: "", expected: "暂无记录", hint: "空行得到空列表，应在除法前返回 None。" },
    ],
    challenge: { input: "3 6 6 7", expected: "5.5", hint: "记录数量改变后仍应按全部天数求平均，并保留一位小数。" },
  },
  "mod-python-basic-l-2": {
    task: "读入一行用空格分隔的英文标签，转成小写、去重并按字母排序，用一个空格连接后输出。空行输出空行。",
    starter: 'tags = input().lower().split()\n# 让每个标签只保留一次，再排序输出\nprint(" ".join(tags))',
    samples: [
      { input: "Python web PYTHON api", expected: "api python web", hint: "先统一大小写，再去重并排序。集合的遍历顺序不保证是字母顺序。" },
      { input: "JS js JS", expected: "js", hint: "大小写不同的同一个标签只应保留一次。" },
      { input: "", expected: "", hint: "没有标签时保持空输出，不要打印列表括号或提示文字。" },
    ],
    challenge: { input: "delta BETA alpha Delta beta", expected: "alpha beta delta", hint: "这一组同时有混合大小写、重复项和乱序项，三步都要处理。" },
  },
  "mod-python-basic-l-3": {
    task: "第一行给出 A、B 两个账户的初始积分。第二行是按顺序发生的变动，如 A:5 B:-3。用 make_counter 为两个账户各创建一个闭包，每次调用后输出该账户的新积分，每个结果占一行。没有变动时保持空输出。",
    starter: `def make_counter(start):
    def change(amount):
        # 保存更新后的余额，供同一账户下一次使用
        return start + amount
    return change

a, b = map(int, input().split())
accounts = {"A": make_counter(a), "B": make_counter(b)}
for event in input().split():
    name, amount = event.split(":")
    print(accounts[name](int(amount)))`,
    samples: [
      { input: "10 30\nA:5 A:-2", expected: "15\n13", hint: "同一闭包的第二次调用应从上次余额开始。修改外层变量时要注意 nonlocal。" },
      { input: "0 100\nA:3 B:-4 A:0 B:5", expected: "3\n96\n3\n101", hint: "交替操作两个账户时，它们各自保留一份状态；变动为零也要输出余额。" },
      { input: "5 9\n", expected: "", hint: "只有起始余额时，还没有任何一笔变动需要输出。" },
    ],
    challenge: { input: "-2 7\nB:-10 A:5 B:4 A:-6", expected: "-3\n3\n1\n-3", hint: "账户可能从负数开始，也可能减到负数，仍要分别累计。" },
  },
  "mod-python-basic-l-4": {
    task: "第一行给出每批最多容纳的记录数（正整数）。第二行是以空格分隔的记录 ID。补全生成器，按原顺序逐批产出记录，每批输出一行，行内以单个空格分隔。最后不足一批也要保留；记录为空时保持空输出。",
    starter: `def batches(records, size):
    # 缓存一批记录，满一批就 yield；检查最后的余量
    group = list(records)
    if group:
        yield group

size = int(input())
for group in batches(iter(input().split()), size):
    print(" ".join(group))`,
    samples: [
      { input: "2\nX1 X2 X3 X4 X5", expected: "X1 X2\nX3 X4\nX5", hint: "满两条就产出并清空当前批，最后的单条记录也要产出。" },
      { input: "2\nx x y z", expected: "x x\ny z", hint: "批次正好装满时，不要重复产出或追加空批；重复 ID 仍是独立记录。" },
      { input: "3\n", expected: "", hint: "迭代器从一开始就没有记录，结束时不需要产出批次。" },
    ],
    challenge: { input: "1\nB A A", expected: "B\nA\nA", hint: "每批只有一条时，每条记录都应该独占一行，重复的也要保留。" },
  },
  "mod-python-basic-l-5": {
    task: "首行是变动笔数，接下来每行依次给出仓库、货号（均为英文标识）和整数变动量。用给出的不可变数据类作为字典键，累计每个仓库内每种货物的变动。按仓库、再按货号升序，每组输出一行“仓库 货号 净变动量”。净变动为零的组也要输出；没有变动时保持空输出。",
    starter: `from dataclasses import dataclass

@dataclass(frozen=True, order=True)
class StockKey:
    warehouse: str
    sku: str

totals = {}
for _ in range(int(input())):
    warehouse, sku, delta = input().split()
    key = StockKey(warehouse, sku)
    totals[key] = int(delta)  # 将先前的变动也计入这一组
for key in sorted(totals):
    print(key.warehouse, key.sku, totals[key])`,
    samples: [
      { input: "4\nB pen 4\nA pen 3\nA pen -1\nA bag 5", expected: "A bag 5\nA pen 2\nB pen 4", hint: "同名货物在不同仓库分别统计。同一个键再次出现时，应更新原有合计。" },
      { input: "2\nC box 4\nC box -4", expected: "C box 0", hint: "正负两笔抵消后，这组货物仍有变动记录，应保留净值零。" },
      { input: "0", expected: "", hint: "笔数为零时字典为空，不应输出表头或合计行。" },
    ],
    challenge: { input: "5\nN s -2\nW a 7\nN s 2\nW a 1\nN a 3", expected: "N a 3\nN s 0\nW a 8", hint: "检查两个排序字段、抵消成零的组以及在输入中不相邻的同组记录。" },
  },
  "mod-python-basic-l-6": {
    task: "标准输入是一份完整、合法的 pyproject.toml。使用 Python 3.11 标准库 tomllib 读取 tool.pytest.ini_options 下的 testpaths 字符串数组。按配置顺序逐行输出目录名；键缺失时输出“未配置”，显式空数组则输出“无目录”。",
    starter: `import sys
import tomllib

config = tomllib.loads(sys.stdin.read())
# 找到 pytest 的配置表；用键是否存在区分缺失和空数组
print("未配置")`,
    samples: [
      { input: '[project]\nname = "inventory"\n\n[tool.pytest.ini_options]\ntestpaths = ["tests/unit", "tests/integration"]', expected: "tests/unit\ntests/integration", hint: "TOML 解析后是嵌套字典；按数组原顺序逐行打印，避免把整个列表作为一行。" },
      { input: '[tool.coverage.run]\ntestpaths = ["other"]', expected: "未配置", hint: "只读取 pytest 所在的表，其他工具恰好同名的字段不能代替它。" },
      { input: "[tool.pytest.ini_options]\ntestpaths = []", expected: "无目录", hint: "空列表也代表键已设置。先判断键是否存在，再判断数组长度。" },
    ],
    challenge: { input: "[tool.pytest.ini_options]\ntestpaths = [\n  \"integration\", # 慢测\n  \"unit tests\",\n]", expected: "integration\nunit tests", hint: "TOML 数组可以换行并带注释，带空格的目录名是单个字符串。" },
  },
  "mod-python-basic-l-7": {
    task: "用标准库 json 读取一行订单数组。将 status 为 paid 的所有 amount 相加并输出整数总额。空数组的总额为 0，负数表示退款。",
    starter: 'import json\n\norders = json.loads(input())\n# 只累加已支付订单，退款也计入总额\nprint(len(orders))',
    samples: [
      { input: '[{"status":"paid","amount":25},{"status":"pending","amount":11},{"status":"paid","amount":8}]', expected: "33", hint: "只对已支付记录的金额求和；订单条数与金额是两个不同的量。" },
      { input: "[]", expected: "0", hint: "空订单数组的金额合计为零。" },
      { input: '[{"status":"paid","amount":10},{"status":"paid","amount":-3}]', expected: "7", hint: "退款的金额已经是负数，应带符号参与累加。" },
    ],
    challenge: { input: "[{\"status\":\"paid\",\"amount\":0},{\"status\":\"pending\",\"amount\":99},{\"status\":\"paid\",\"amount\":-6}]", expected: "-6", hint: "核对退款后的负总额，待支付金额不应抵消它。" },
  },
} satisfies Record<keyof typeof catalog, Exercise>;
