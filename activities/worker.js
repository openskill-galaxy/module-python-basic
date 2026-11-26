// Appended to the local Pyodide scripts inside an opaque-origin worker.
self.onmessage = async ({ data: { files, code, inputs } }) => {
  const send = self.postMessage.bind(self);
  try {
    // Pyodide requests its binary, lockfile and standard library by URL.
    // Supply the already-downloaded files without giving the worker network access.
    const base = "https://python-runtime.invalid/";
    self.fetch = async (resource) => {
      const url = new URL(resource.url || resource, base);
      const blob = url.origin === new URL(base).origin && files[url.pathname.slice(1)];
      if (!blob) throw new Error("该软件包不在本地 Python 运行环境内");
      return new Response(blob, { headers: { "Content-Type": blob.type } });
    };
    const python = await loadPyodide({ indexURL: base });
    send({ type: "ready" });
    for (const [index, input] of inputs.entries()) {
      const lines = input.split(/\r?\n/);
      python.setStdin({ stdin: () => lines.shift() });
      const decoder = new TextDecoder();
      let output = "";
      let errorOutput = "";
      let bytes = 0;
      function append(buffer, isError) {
        bytes += buffer.length;
        if (bytes > 16384) throw new Error("输出超过 16 KiB，请减少打印内容。");
        const text = decoder.decode(buffer, { stream: true });
        if (isError) errorOutput += text;
        else output += text;
        return buffer.length;
      }
      python.setStdout({ write: (buffer) => append(buffer, false) });
      python.setStderr({ write: (buffer) => append(buffer, true) });
      const globals = python.toPy({ __name__: "__main__" });
      let error = "";
      try {
        const result = python.runPython(code, { globals, filename: "practice.py" });
        result?.destroy?.();
      } catch (exception) {
        const detail = String(exception.message || exception);
        const start = detail.indexOf('File "practice.py"');
        error = (start >= 0 ? detail.slice(start) : detail).slice(-1800);
      } finally {
        python.runPython("import sys; sys.stdout.flush(); sys.stderr.flush()");
        globals.destroy();
      }
      send({ type: "result", index, output, diagnostics: errorOutput, error });
    }
    send({ type: "done" });
  } catch (error) {
    send({ type: "error", message: String(error.message || error).slice(-1000) });
  }
};
