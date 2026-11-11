import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import ts from 'typescript';
const cache=new Map();
export function moduleURL(file,overrides={}){
 const href=file instanceof URL?file.href:file;
 if(overrides[href])return overrides[href];
 if(cache.has(href)&&Object.keys(overrides).length===0)return cache.get(href);
 let code=ts.transpileModule(readFileSync(fileURLToPath(href),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 code=code.replace(/from (["'])([^"']+)\1/g,(_,quote,spec)=>{
  const url=spec.startsWith('.')?moduleURL(new URL(spec.endsWith('.ts')?spec:spec+'.ts',href),overrides):import.meta.resolve(spec);
  return 'from '+JSON.stringify(url);
 });
 const result='data:text/javascript;base64,'+Buffer.from(code).toString('base64');
 if(Object.keys(overrides).length===0)cache.set(href,result);
 return result;
}
export const codeURL=code=>'data:text/javascript;base64,'+Buffer.from(code).toString('base64');
