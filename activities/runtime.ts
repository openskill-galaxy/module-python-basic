import frameDocument from "./frame.html?raw";
import workerSource from "./worker.js?raw";

const VERSION = "0.25.0";
const runtimeFiles = {
  "pyodide.js": "text/javascript",
  "pyodide.asm.js": "text/javascript",
  "pyodide.asm.wasm": "application/wasm",
  "python_stdlib.zip": "application/zip",
  "pyodide-lock.json": "application/json",
};

async function loadFiles(signal: AbortSignal) {
  let cache: Cache | undefined;
  try {
    cache = await caches.open("openskill-python-lab-" + VERSION);
  } catch {
    // Browser settings can disable persistent caches. The current run still works.
  }
  const entries = await Promise.all(Object.entries(runtimeFiles).map(async ([name, type]) => {
    const url = new URL(import.meta.env.BASE_URL + "python-runtime/" + VERSION + "/" + name, location.href);
    let response = await cache?.match(url).catch(() => undefined);
    if (!response) {
      try {
        response = await fetch(url, { signal });
        if (!response.ok) throw new Error(String(response.status));
      } catch (error) {
        if (signal.aborted) throw error;
        throw new Error("未能读取 " + name + "。首次运行需要联网，请恢复连接后重试。");
      }
      if (cache) await cache.put(url, response.clone()).catch(() => {});
    }
    return [name, new Blob([await response.arrayBuffer()], { type })] as const;
  }));
  return Object.fromEntries(entries);
}

export interface RunResult {
  index: number;
  output: string;
  diagnostics: string;
  error: string;
}

export async function runPython(
  code: string, inputs: string[], signal: AbortSignal,
  onReady: () => void, onResult: (result: RunResult) => void,
) {
  const files = await loadFiles(signal);
  if (signal.aborted) throw new DOMException("已停止", "AbortError");
  const script = new Blob([files["pyodide.js"], "\n", files["pyodide.asm.js"], "\n", workerSource], { type: "text/javascript" });
  const frame = document.createElement("iframe");
  frame.title = "隔离的 Python 运行环境";
  frame.hidden = true;
  frame.setAttribute("sandbox", "allow-scripts");
  const channel = new MessageChannel();
  let timeout: ReturnType<typeof setTimeout>;
  try {
    await new Promise<void>((resolve, reject) => {
      const abort = () => reject(new DOMException("已停止", "AbortError"));
      signal.addEventListener("abort", abort, { once: true });
      timeout = setTimeout(() => reject(new Error("解释器启动超时，请重试。")), 30000);
      channel.port1.onmessage = ({ data }) => {
        if (data.type === "ready") {
          clearTimeout(timeout);
          timeout = setTimeout(() => reject(new Error("运行超过 5 秒，已停止。请检查循环的结束条件。")), 5000);
          onReady();
        } else if (data.type === "result") onResult(data);
        else if (data.type === "error") reject(new Error(data.message));
        else if (data.type === "done") resolve();
      };
      frame.onload = () => {
        frame.contentWindow?.postMessage({
          script, exercise: { code, inputs, files: {
            "pyodide.asm.wasm": files["pyodide.asm.wasm"],
            "python_stdlib.zip": files["python_stdlib.zip"],
            "pyodide-lock.json": files["pyodide-lock.json"],
          } },
        }, "*", [channel.port2]);
      };
      frame.srcdoc = frameDocument;
      document.body.appendChild(frame);
    });
  } finally {
    clearTimeout(timeout!);
    channel.port1.postMessage("stop");
    channel.port1.close();
    frame.remove();
  }
}
