import React, { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import * as monaco from 'monaco-editor'
import '@assets/styles/code-editor.scss';
import { Terminal } from '@xterm/xterm';
import '@xterm/xterm/css/xterm.css'
import { Button } from 'antd';
import { FitAddon } from '@xterm/addon-fit';
import { useTranslation } from 'react-i18next';
const languageMap = {
    'txt': 'plaintext',
    'abap': 'abap',
    'cls': 'apex',
    'azcli': 'azcli',
    'bat': 'bat',
    'cmd': 'bat',
    'bicep': 'bicep',
    'mligo': 'cameligo',
    'clj': 'clojure',
    'cljs': 'clojure',
    'cljc': 'clojure',
    'edn': 'clojure',
    'coffee': 'coffeescript',
    'c': 'c',
    'h': 'c',
    'cpp': 'cpp',
    'cc': 'cpp',
    'cxx': 'cpp',
    'hpp': 'cpp',
    'hh': 'cpp',
    'hxx': 'cpp',
    'cs': 'csharp',
    'csx': 'csharp',
    'cake': 'csharp',
    'csp': 'csp',
    'css': 'css',
    'cypher': 'cypher',
    'cyp': 'cypher',
    'dart': 'dart',
    'dockerfile': 'dockerfile',
    'ecl': 'ecl',
    'ex': 'elixir',
    'exs': 'elixir',
    'flow': 'flow9',
    'fs': 'fsharp',
    'fsi': 'fsharp',
    'ml': 'fsharp',
    'mli': 'fsharp',
    'fsx': 'fsharp',
    'fsscript': 'fsharp',
    'ftl': 'freemarker2',
    'ftlh': 'freemarker2',
    'ftlx': 'freemarker2',
    'go': 'go',
    'graphql': 'graphql',
    'gql': 'graphql',
    'handlebars': 'handlebars',
    'hbs': 'handlebars',
    'tf': 'hcl',
    'tfvars': 'hcl',
    'hcl': 'hcl',
    'html': 'html',
    'htm': 'html',
    'shtml': 'html',
    'xhtml': 'html',
    'mdoc': 'html',
    'jsp': 'html',
    'asp': 'html',
    'aspx': 'html',
    'jshtm': 'html',
    'ini': 'ini',
    'properties': 'ini',
    'gitconfig': 'ini',
    'java': 'java',
    'jav': 'java',
    'js': 'javascript',
    'es6': 'javascript',
    'jsx': 'javascript',
    'mjs': 'javascript',
    'cjs': 'javascript',
    'jl': 'julia',
    'kt': 'kotlin',
    'kts': 'kotlin',
    'less': 'less',
    'lex': 'lexon',
    'lua': 'lua',
    'liquid': 'liquid',
    'html.liquid': 'liquid',
    'm3': 'm3',
    'i3': 'm3',
    'mg': 'm3',
    'ig': 'm3',
    'md': 'markdown',
    'markdown': 'markdown',
    'mdown': 'markdown',
    'mkdn': 'markdown',
    'mkd': 'markdown',
    'mdwn': 'markdown',
    'mdtxt': 'markdown',
    'mdtext': 'markdown',
    'mdx': 'mdx',
    's': 'mips',
    'dax': 'msdax',
    'msdax': 'msdax',
    'm': 'objective-c',
    'pas': 'pascal',
    'p': 'pascal',
    'pp': 'pascal',
    'ligo': 'pascaligo',
    'pl': 'perl',
    'pm': 'perl',
    'php': 'php',
    'php4': 'php',
    'php5': 'php',
    'phtml': 'php',
    'ctp': 'php',
    'pla': 'pla',
    'dats': 'postiats',
    'sats': 'postiats',
    'hats': 'postiats',
    'pq': 'powerquery',
    'pqm': 'powerquery',
    'ps1': 'powershell',
    'psm1': 'powershell',
    'psd1': 'powershell',
    'proto': 'proto',
    'jade': 'pug',
    'pug': 'pug',
    'py': 'python',
    'rpy': 'python',
    'pyw': 'python',
    'cpy': 'python',
    'gyp': 'python',
    'gypi': 'python',
    'qs': 'qsharp',
    'r': 'r',
    'rhistory': 'r',
    'rmd': 'r',
    'rprofile': 'r',
    'rt': 'r',
    'cshtml': 'razor',
    'redis': 'redis',
    'rst': 'restructuredtext',
    'rb': 'ruby',
    'rbx': 'ruby',
    'rjs': 'ruby',
    'gemspec': 'ruby',
    'rs': 'rust',
    'rlib': 'rust',
    'sb': 'sb',
    'scala': 'scala',
    'sc': 'scala',
    'sbt': 'scala',
    'scm': 'scheme',
    'ss': 'scheme',
    'sch': 'scheme',
    'rkt': 'scheme',
    'scss': 'scss',
    'sh': 'shell',
    'bash': 'shell',
    'sol': 'sol',
    'aes': 'aes',
    'rq': 'sparql',
    'sql': 'sql',
    'st': 'st',
    'iecst': 'st',
    'iecplc': 'st',
    'lc3lib': 'st',
    'TcPOU': 'st',
    'TcDUT': 'st',
    'TcGVL': 'st',
    'TcIO': 'st',
    'swift': 'swift',
    'sv': 'systemverilog',
    'svh': 'systemverilog',
    'v': 'verilog',
    'vh': 'verilog',
    'tcl': 'tcl',
    'twig': 'twig',
    'ts': 'typescript',
    'tsx': 'typescript',
    'cts': 'typescript',
    'mts': 'typescript',
    'tsp': 'typespec',
    'vb': 'vb',
    'wgsl': 'wgsl',
    'xml': 'xml',
    'xsd': 'xml',
    'dtd': 'xml',
    'ascx': 'xml',
    'csproj': 'xml',
    'config': 'xml',
    'props': 'xml',
    'targets': 'xml',
    'wxi': 'xml',
    'wxl': 'xml',
    'wxs': 'xml',
    'xaml': 'xml',
    'svg': 'xml',
    'svgz': 'xml',
    'opf': 'xml',
    'xslt': 'xml',
    'xsl': 'xml',
    'yaml': 'yaml',
    'yml': 'yaml',
    'json': 'json',
    'bowerrc': 'json',
    'jshintrc': 'json',
    'jscsrc': 'json',
    'eslintrc': 'json',
    'babelrc': 'json',
    'har': 'json'
};
class WebShell {
    constructor( container, prompt = '$app> ') {

        const fitAddon = new FitAddon();

        if(container){
            this.term=new Terminal()
            this.term.loadAddon(fitAddon)
            this.term.open(container)
            this.term.options.theme={
                background: '#2A2B37',   // 背景色
                // foreground: '#cccccc',   // 字体颜色
                // cursor: '#00ff00',       // 光标色
                // selection: '#555555'     // 选中文本色
            }


            fitAddon.fit();
            window.addEventListener('resize', () => {
                fitAddon.fit()
            })
            this.prompt = prompt
            this.buffer = ''
            this.promptWritten = false
            this.listeners = []

            this.term.onKey(e => this.handleKey(e))
            this.writePrompt(true)
        }

    }

    writePrompt(isInitial) {
        const prefix=isInitial?`\x1b[32m${this.prompt}\x1b[0m`:`\x1b[32m\r\n${this.prompt}\x1b[0m`
        this.term.write(prefix)
        this.promptWritten = true
    }

    handleKey(e) {
        const { key, domEvent } = e

        if (!this.promptWritten) return

        if (domEvent.key === 'Enter') {
            this.emit(this.buffer)
            this.buffer = ''
            this.writePrompt()
        } else if (domEvent.key === 'Backspace') {
            if (this.buffer.length > 0) {
                this.buffer = this.buffer.slice(0, -1)
                this.term.write('\b \b')
            }
        } else if (domEvent.key.length === 1) {
            this.buffer += key
            this.term.write(key)
        }
    }

    emit(value) {
        this.listeners.forEach(fn => fn(value))
    }

    onCommand(fn) {
        this.listeners.push(fn)
    }
}

class ShowAllOverlayWidget {
    constructor(editor, onClick) {
        this.editor = editor
        this.id = 'showAllLogs.overlay.widget'

        this.domNode = document.createElement('div')
        this.domNode.textContent = ' 显示全部日志'
        this.domNode.style.cssText = `
     position: absolute;
  left: calc(50% - 40px);
      font-size: 13px;
      color: #007acc;
      display:none;
      cursor: pointer;
      border-radius: 4px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.1);
      user-select: none;
    `
        this.domNode.onclick = onClick
    }

    getId() {
        return this.id
    }

    getDomNode() {
        return this.domNode
    }

    getPosition() {
        return {
            preference: [
                monaco.editor.OverlayWidgetPositionPreference.TOP_RIGHT_CORNER
                // 也可以是: ABOVE_RIGHT, BELOW_RIGHT, etc.
            ]
        }
    }
    show() {
        this.domNode.style.display = 'block'
    }

    hide() {
        this.domNode.style.display = 'none'
    }
}
const CodeEditor = ({
                        value,
                        onChange,
                        language = 'plaintext',
                        theme = 'vs-dark',
                        readOnly = false,
                        height = '100%',
                        options = {},
                        autoScroll = false,
                        showAll,
                        allowTerminal=false,
                        type,
                        cancel=()=>null,
                        save=()=>null,

                    }) => {
    const editorRef = useRef(null)
    const monacoContainerRef = useRef(null)
    const topZone=useRef(null)
    const bottomZone=useRef(null)
    const topZoneBackground=useRef(null)
    let autoLanguage = languageMap[language];
    const allowAutoScroll=useRef(true)
    const notShowAll=useRef(true)
    const terminalInstance=useRef(null)
    const { t } = useTranslation();
    if(autoLanguage){
        language = autoLanguage;
    }else{
        language = 'plaintext';
    }
    const setContainerStyle=()=>{
        // if(allowTerminal) return 'calc(100% - 132px)'
        // if(!readOnly) return 'calc(100% - 64px)'
        return '100%'
    }
    const setFunctionStyle=()=>{
        if(allowTerminal) return <div className="terminalContainer"><div id="terminalRef"></div></div>
        if(!readOnly) return <div className="saveFunctionContainer">
            <Button style={{marginRight:8}}>{t('drawCode.cancel')}</Button>  <Button type="primary">{t('drawCode.save')}</Button>
        </div>
        return  <div className="nullContainer"></div>
    }

    const defaultOptions = {
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: 'on',
        roundedSelection: false,
        scrollBeyondLastLine:false,
        readOnly,
        automaticLayout: true,
        formatOnPaste: true,
        formatOnType: true,
        ...options
    };
    function insertShowAllLogsButton(editor) {
        editor.changeViewZones(accessor => {
            // 清除旧 zone（可选）
            if ( topZoneBackground.current !== null) accessor.removeZone(topZoneBackground.current)

            // 创建按钮 DOM
            const dom = document.createElement('div')

            dom.style.cssText = `
      
       width:100%;
        
      `
            // 插入 zone
            topZoneBackground.current = accessor.addZone({
                afterLineNumber: 0,  // 插入到最顶部
                heightInPx: 24,
                domNode: dom,
            })
        })
    }
    const handleEditorDidMount = (editor) => {

        // 自动滚动底部
        if(autoScroll){
            const lastLineNumber = editorRef.current.getModel().getLineCount();
            editor.revealLine(lastLineNumber,monaco.editor.ScrollType.Immediate);
        }
    };

    const handleEditorChange = (value) => {
        if (onChange) {
            onChange(value);
        }
    };
    useEffect(() => {
        const editor = monaco.editor.create( monacoContainerRef.current, {
            value,
            language,
            theme,
            ...defaultOptions,
        });

        editorRef.current = editor;
        editor.changeViewZones(accessor => {


            bottomZone.current=accessor.addZone({
                afterLineNumber: editor.getModel().getLineCount(),
                heightInPx: 10,
                domNode: document.createElement('div'), // 空div即可
            })
        });

        // 监听内容变化
        if(type==='log'&&showAll){
            addShowAllButton(editor)
        }
        // if(allowTerminal){
        //     const container= document.getElementById("terminalRef")
        //     terminalInstance.current=new WebShell(container)
        //     terminalInstance.current.onCommand(cmd => {
        //         // 处理 cmd，比如调用 AI、查库、转码
        //         terminalInstance.current.term.write(`\r\n响应：你输入了 ${cmd}`)
        //     })
        // }

        // 注册 onChange 事件监听器
        editor.onDidChangeModelContent(() => {
            handleEditorChange(editor.getValue())
        });

        // 清理函数，用于组件卸载时销毁编辑器
        return () => {
            if (editorRef.current) {
                editorRef.current.dispose();
            }
        };
    }, []);

    const addShowAllButton=(editor)=>{
        if( editor.getScrollHeight() >  editor.getLayoutInfo().height&&!topZone.current) {
            topZone.current = new ShowAllOverlayWidget(editor,showAllAfter)
            insertShowAllLogsButton(editor)
            editor.addOverlayWidget( topZone.current)
            handleEditorDidMount(editor)
            editor.onDidScrollChange(e => {
                if (e.scrollTop === 0&&notShowAll.current) {
                    topZone.current.show()
                } else {
                    topZone.current.hide()
                }
            })
        }
    };

    // 监听语言变化
    useEffect(() => {
        if (editorRef.current) {
            const model = editorRef.current.getModel();
            if (model) {
                // 更新编辑器的语言
                monaco.editor.setModelLanguage(model, language);
            }
        }
    }, [language]);

    useEffect(()=>{
        editorRef.current.updateOptions({ readOnly})
    },[readOnly]);

    // 监听值变化
    useEffect(() => {
        if (editorRef.current && value) {
            const model = editorRef.current.getModel();
            if (model && model.getValue() !== value) {
                // 更新编辑器的值
                model.setValue(value || '');
                editorRef.current.changeViewZones(accessor => {
                    if (bottomZone.current !== null) {
                        accessor.removeZone(bottomZone.current)
                    }

                    // 添加新 zone
                    bottomZone.current = accessor.addZone({
                        afterLineNumber: editorRef.current.getModel().getLineCount(),
                        heightInPx: 12,
                        domNode: document.createElement('div')
                    })
                })

                // 内容改变后自动格式化
                editorRef.current.getAction('editor.action.formatDocument').run();
                // 自动滚动底部
                if(autoScroll&& allowAutoScroll.current){
                    allowAutoScroll.current=notShowAll.current
                    const lastLineNumber = model.getLineCount();
                    editorRef.current.revealLine(lastLineNumber,monaco.editor.ScrollType.Immediate);
                }

                // if(type==="log"){
                //     addShowAllButton(editorRef.current)
                // }
            }
        }
    }, [value]);

    function showAllAfter(){
        showAll()
        notShowAll.current=false
        topZone.current.hide()

        const model = editorRef.current.getModel();
        const lastLineNumber = model.getLineCount();
        editorRef.current.revealLine(lastLineNumber,monaco.editor.ScrollType.Immediate);
        editorRef.current.changeViewZones(accessor => {
            if (topZoneBackground.current !== null) {
                accessor.removeZone(topZoneBackground.current)
            }
        })
    }
    return (
        <div className="code-editor-container" style={{ height }}>
            <div ref={ monacoContainerRef}  style={{ height: setContainerStyle() }} />
            {/*{setFunctionStyle()}*/}
        </div>
    );
};

function isTextFile(fileName) {
    if(!fileName){
        return false;
    }
    let split = fileName.split('.');
    if(split.length === 1){
        return true;
    }
    return languageMap[split.pop()];
}

export { CodeEditor,isTextFile };
