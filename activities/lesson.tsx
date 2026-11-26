import { useEffect, useRef, useState } from "react";
import { exercises, exerciseTitles, type Exercise } from "./exercises";
import { runPython, type RunResult } from "./runtime";

type RunMode = "sample" | "challenge" | "custom";

interface Checkpoint {
  code: string;
  suite: string;
  challenge: boolean;
}

export const lessonIds = Object.keys(exercises);

export default function LessonActivity({ lessonId }: { lessonId: string }) {
  const exercise = exercises[lessonId];
  if (!exercise) return null;
  return <PythonExercise exercise={exercise} lessonId={lessonId} />;
}

function PythonExercise({ exercise, lessonId }: { exercise: Exercise; lessonId: string }) {
  const key = "osg:module-python-basic:python-draft:" + lessonId;
  const [code, setCode] = useState(() => {
    try { return localStorage.getItem(key) ?? exercise.starter; } catch { return exercise.starter; }
  });
  const passKey = "osg:module-python-basic:python-pass:" + lessonId;
  const [lastPass, setLastPass] = useState<Checkpoint | null>(() => {
    try {
      const record = JSON.parse(localStorage.getItem(passKey) || "null");
      return record && typeof record.code === "string" && typeof record.suite === "string" &&
        typeof record.challenge === "boolean" ? record : null;
    } catch { return null; }
  });
  const suite = JSON.stringify([...exercise.samples, exercise.challenge].map(({ input, expected }) => [input, expected]));
  const verified = lastPass?.code === code && lastPass.suite === suite;
  const [draftFailed, setDraftFailed] = useState(false);
  const [input, setInput] = useState(exercise.samples[0].input);
  const [mode, setMode] = useState<RunMode>("sample");
  const [status, setStatus] = useState("");
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<RunResult[]>([]);
  const active = useRef<AbortController>();
  useEffect(() => () => active.current?.abort(), []);

  function changeCode(value: string) {
    setCode(value);
    setResults([]);
    setStatus("");
    try {
      localStorage.setItem(key, value);
      setDraftFailed(false);
    } catch {
      setDraftFailed(true);
    }
  }

  function stop() {
    active.current?.abort();
    active.current = undefined;
    setRunning(false);
    setStatus("已停止，可以修改代码后重新运行。");
  }

  function saveCheckpoint(record: Checkpoint | null) {
    setLastPass(record);
    try {
      if (record) localStorage.setItem(passKey, JSON.stringify(record));
      else if (localStorage.getItem(passKey) === JSON.stringify(lastPass)) localStorage.removeItem(passKey);
    } catch { /* The result remains available in the current tab. */ }
  }

  async function run(mode: RunMode) {
    if (active.current) return;
    const controller = new AbortController();
    active.current = controller;
    setMode(mode);
    setRunning(true);
    setResults([]);
    setStatus("正在准备 Python 解释器…");
    const checks = mode === "challenge" ? [exercise.challenge] : exercise.samples;
    const inputs = mode === "custom" ? [input] : checks.map((sample) => sample.input);
    let passed = 0;
    try {
      await runPython(code, inputs, controller.signal,
        () => setStatus("正在运行 Python…"),
        (result) => {
          if (controller.signal.aborted) return;
          const actual = result.output.replace(/\r\n/g, "\n").replace(/\n$/, "");
          if (!result.error && actual === checks[result.index]?.expected) passed++;
          setResults((previous) => [...previous, result]);
        },
      );
      if (controller.signal.aborted) return;
      if (mode === "custom") {
        setStatus("运行结束");
      } else if (mode === "challenge") {
        const correct = passed === 1;
        setStatus(correct ? "新输入通过" : "新输入未通过");
        saveCheckpoint({ code, suite, challenge: correct });
      } else {
        setStatus(`通过 ${passed} / ${inputs.length} 个样例`);
        if (passed === inputs.length) saveCheckpoint({ code, suite, challenge: verified && lastPass.challenge });
        else if (verified) saveCheckpoint(null);
      }
    } catch (error) {
      if (!controller.signal.aborted) setStatus(error instanceof Error ? error.message : "运行失败，请重试。");
    } finally {
      if (active.current === controller) {
        setRunning(false);
        active.current = undefined;
      }
    }
  }

  const display = (value: string) => value || "（空）";
  return (
    <section id="python-practice" aria-labelledby="practice-title" className="card p-4 sm:p-6 space-y-4 print:hidden">
      <h2 id="practice-title" className="text-lg font-semibold text-body">Python 编程练习 · {exerciseTitles[lessonId]}</h2>
      <p className="text-sm text-muted">{exercise.task}</p>
      <details className="text-sm text-muted">
        <summary className="cursor-pointer">查看 {exercise.samples.length} 个输入输出样例</summary>
        <ol className="mt-2 space-y-2">
          {exercise.samples.map((sample, index) => <li key={index} className="rounded-lg bg-surface-2 p-2">
            样例 {index + 1} 输入 <code className="whitespace-pre-wrap break-all">{display(sample.input)}</code><br />预期输出 <code className="whitespace-pre-wrap break-all">{display(sample.expected)}</code>
          </li>)}
        </ol>
      </details>
      <div>
        <label htmlFor="python-source" className="text-sm font-semibold text-body">Python 代码</label>
        <textarea id="python-source" rows={6} className="input mt-1 w-full font-mono text-sm leading-relaxed" spellCheck={false} autoCapitalize="off" autoCorrect="off" value={code} readOnly={running} onChange={(e) => changeCode(e.target.value)} />
      </div>
      {draftFailed && <p className="text-sm text-muted">浏览器未能保存草稿，离开前请复制代码。</p>}
      {verified && <p className="text-sm font-semibold text-body">{lastPass.challenge ? "此版本已通过公开样例和新输入" : "此版本已通过全部公开样例"}</p>}
      <p className="text-xs text-muted">首次运行约需下载 12 MiB 的 CPython 3.11 环境。浏览器保留缓存后可离线练习。</p>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className="btn-primary text-sm" disabled={running} onClick={() => run("sample")}>检查全部样例</button>
        {verified && <button type="button" className="btn-ghost text-sm" disabled={running}
          onClick={() => run("challenge")}>用一组新输入检验</button>}
        {running && <button type="button" className="btn-ghost text-sm" onClick={stop}>停止运行</button>}
      </div>
      <details className="text-sm">
        <summary className="cursor-pointer text-muted">使用自己的输入</summary>
        <label htmlFor="python-input" className="block mt-2 font-semibold">标准输入</label>
        <textarea id="python-input" rows={2} value={input} disabled={running} onChange={(e) => setInput(e.target.value)} className="input my-2 w-full font-mono text-sm" />
        <button type="button" className="btn-ghost text-sm" disabled={running} onClick={() => run("custom")}>运行我的输入</button>
      </details>
      <p role="status" className="text-sm font-semibold text-body">{status}</p>
      {results.map((item) => {
        const actual = item.output.replace(/\r\n/g, "\n").replace(/\n$/, "");
        const sample = mode === "challenge" ? exercise.challenge : exercise.samples[item.index];
        return <div key={item.index} className="bg-surface-2 rounded-lg p-3 text-sm space-y-1">
          {mode !== "custom" && <p className="font-semibold">{mode === "challenge" ? "新输入" : `样例 ${item.index + 1}`} · {item.error ? "运行错误" : actual === sample.expected ? "通过" : "输出不符"}</p>}
          {mode !== "custom" && <p>输入 <code className="whitespace-pre-wrap break-all">{display(sample.input)}</code><br />预期输出 <code className="whitespace-pre-wrap break-all">{display(sample.expected)}</code></p>}
          <p>实际输出</p><pre className="whitespace-pre-wrap break-words font-mono">{display(actual)}</pre>
          {mode !== "custom" && (item.error || actual !== sample.expected) && <p className="text-muted">{sample.hint}</p>}
          {(item.error || item.diagnostics) && <pre className="whitespace-pre-wrap break-words font-mono">{[item.diagnostics, item.error].filter(Boolean).join("\n")}</pre>}
        </div>;
      })}
    </section>
  );
}
