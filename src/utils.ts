export const getLanguageOfFile = (filePath: string) => {
  const extensionDotIndex = filePath.lastIndexOf(".");
  const extension = filePath.slice(extensionDotIndex + 1);

  switch (extension) {
    case "spec":
      return "spec";
    case "js":
    case "jsx":
    case "ts":
    case "tsx":
      return "javascript";
    case "vue":
    case "html":
      return "html";
    case "css":
    case "scss":
    case "less":
      return "css";
    default:
      return "javascript";
  }
};
export function spec2ts(specText: string) {
  return (
    specText
      // import
      .replace(/@use ('.*?') as ([a-z]*);/gim, "import $2 from $1;")
      // var declaration
      .replace(/^(\$.*?): (.+);/gim, "const $1 = `$2`;")
      .replace(/^:export \.(.*?)\[type\] {/gim, "export interface $1 {")

      // object declaration
      .replace(/^\.(.*?)\[type\] {/gim, "interface $1 {")
      .replace(/^:export \.(.*?) {/gim, "export const $1 = {")

      // object declaration
      .replace(/^\.(.*?) {/gim, "const $1 = {")

      // key object
      .replace(/\.(.*?) {/gim, "'$1': {")
      // var value
      .replace(/([ ]*)(.*?): (\$.*?);/gim, "$1'$2': $3,")
      // key value
      .replace(/([ ]*)(.*?): (.*?);/gim, "$1'$2': '$3',")
      //type
      .replace(/\[(.*?)\]/gim, ": $1")
      // merge
      .replace(/@include (.*?);/gim, "...$1,")
      .replace(/([ ]+})/gim, "$1,")
      .replace(/\.\.\.\./gim, "...")
      .replace(/\* {/g, "[x:string]: {")
      .replace(/'#(.*?)'/gim, "$1")
  );
}
