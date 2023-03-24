import {
  FileTabs,
  SandpackStack,
  useActiveCode,
  useSandpack
} from "@codesandbox/sandpack-react";
import MonacoEditor, { Monaco } from "@monaco-editor/react";
import { useEffect, useRef, useState } from "react";
import { getLanguageOfFile, spec2ts } from "./utils";
import "monaco-editor/dist/language/typescript/languageFeatures";
export function Editor() {
  const { code, updateCode } = useActiveCode();
  const { sandpack } = useSandpack();
  const [isReady, setIsReady] = useState<any>({});
  const monacoRef = useRef(null);
  const monaco = monacoRef.current as Monaco;
  const typescriptRef = useRef(null);
  const typescript = typescriptRef.current as any;
  const tsModelRef = useRef();
  const tsModel = tsModelRef.current;
  const specModelRef = useRef();
  const specModel = specModelRef.current;
  const language = getLanguageOfFile(sandpack.activeFile);
  const tsFile = `file://${sandpack.activeFile}.ts`;
  const [validation, setValidation] = useState([]);
  useEffect(() => {
    if (isReady.monaco) {
      if (sandpack.activeFile.endsWith("spec")) {
        if (!monaco.editor.getModel(tsFile)) {
          console.log("init tsModel");
          spec2ts(code);
          console.log(monaco.editor);
          tsModelRef.current = monaco.editor.createModel(
            spec2ts(code),
            "typescript",
            tsFile
          );
          setIsReady((isReady) => ({ ...isReady, tsModel: true }));
          if (!typescript) {
            monaco.languages.typescript.getTypeScriptWorker().then((w) => {
              w().then(async (r) => {
                typescriptRef.current = r;
                console.log("init typescript");
                setIsReady((isReady) => ({ ...isReady, typescript: true }));
              });
            });
          }
        }
      }
    }
  }, [isReady.monaco, sandpack.activeFile]);
  useEffect(() => {
    async function run() {
      const baseLang = await monaco.languages
        .getLanguages()
        .find((p) => p.id === "scss")
        .loader();
      // here is the monaco instance
      // do something before editor is mounted
      // const lang = merge(customTokenizer, baseLang.language);
      const lang = baseLang.language;
      monaco.languages.register({
        id: "spec",
        extensions: [".spec"],
        aliases: ["Spec", "sass", "scss"],
        mimetypes: ["text/x-spec", "text/spec"]
      });

      monaco.languages.setMonarchTokensProvider("spec", lang);
    }
    if (isReady.monaco) {
      run();
    }
  }, [isReady.monaco]);
  useEffect(() => {
    async function run() {
      if (isReady.typescript) {
        console.log(Object.keys(typescript));
        // console.log(
        //   await typescript.getScriptText(`file://${sandpack.activeFile}.ts`)
        // );
      }
    }
    run();
  }, [isReady.typescript]);
  useEffect(() => {
    console.log("isReady", isReady);
    async function run() {
      if (isReady.tsModel && isReady.specModel && isReady.typescript) {
        tsModel.setValue(spec2ts(code));
        const suggestions = await typescript.getSuggestionDiagnostics(tsFile);
        const semantic = await typescript.getSemanticDiagnostics(tsFile);
        const syntactic = await typescript.getSyntacticDiagnostics(tsFile);
        const compiler = await typescript.getCompilerOptionsDiagnostics(tsFile);
        const messages = suggestions.concat(
          semantic.concat(syntactic.concat(compiler))
        );

        setValidation(
          messages.map((d) => d.messageText.messageText || d.messageText)
        );
      }
    }
    run();
  }, [isReady.tsModel, isReady.specModel, isReady.typescript, code]);
  // console.log(sandpack.activeFile, monacoRef);
  return (
    <SandpackStack style={{ flex: "1", height: "100%", margin: 0 }}>
      <FileTabs />
      <div style={{ height: "200px" }}>
        {validation.map((v, idx) => (
          <div key={idx}>{v}</div>
        ))}
      </div>
      <MonacoEditor
        width="100%"
        height="100vh"
        language={language}
        theme="vs-dark"
        key={sandpack.activeFile}
        beforeMount={(monaco) => {
          if (!isReady.monaco) {
            monacoRef.current = monaco;
            console.log("init monaco");
            setIsReady((isReady) => ({ ...isReady, monaco: true }));
          }
        }}
        onMount={(editor) => {
          console.log("init specModel");
          specModelRef.current = editor.getModel();
          setIsReady((isReady) => ({ ...isReady, specModel: true }));
        }}
        defaultValue={code}
        onChange={(value) => updateCode(value || "")}
        options={{
          // quickSuggestions: {
          //   other: false,
          //   comments: false,
          //   strings: false
          // },
          // parameterHints: {
          //   enabled: false
          // },
          // suggestOnTriggerCharacters: false,
          // acceptSuggestionOnEnter: "off",
          // tabCompletion: "off",
          wordBasedSuggestions: false
        }}
      />
    </SandpackStack>
  );
}
