import React, { useEffect, useRef, useState } from 'react';
import { MathfieldElement } from 'mathlive';
import { useTranslation } from 'react-i18next';
import { CloseOutlined } from "@ant-design/icons";
import './formulaModal.scss';

function latexToReadableString(latex) {
    const latexToReadableMap = {
        // 分数
        'frac{([^}]+)}{([^}]+)}': '$1/$2',
        // 根式
        'sqrt{([^}]+)}': '√($1)',
        'sqrt\\[([^}]+)\\]\\{([^}]+)\\}': '√[$1]($2)',
        // 积分
        'int': '∫',
        'iint': '∬',
        'oint': '∮',
        // 大型运算符
        'sum': 'Σ',
        'prod': 'Π',
        // 括号
        'left\\(([^)]+)\\)right\\)': '($1)',
        'left\\[([^]]+)\\]right\\]': '[$1]',
        'left\\\\{([^}]+)\\\\}right\\\\}': '{$1}',
        // 希腊字母
        'alpha': 'α',
        'beta': 'β',
        'gamma': 'γ',
        'delta': 'δ',
        'epsilon': 'ε',
        'zeta': 'ζ',
        'eta': 'η',
        'theta': 'θ',
        'iota': 'ι',
        'kappa': 'κ',
        'lambda': 'λ',
        'mu': 'μ',
        'nu': 'ν',
        'xi': 'ξ',
        'omicron': 'ο',
        'pi': 'π',
        'rho': 'ρ',
        'sigma': 'σ',
        'tau': 'τ',
        'upsilon': 'υ',
        'phi': 'φ',
        'chi': 'χ',
        'psi': 'ψ',
        'omega': 'ω',
        'Gamma': 'Γ',
        'Delta': 'Δ',
        'Theta': 'Θ',
        'Lambda': 'Λ',
        'Sigma': 'Σ',
        'Upsilon': 'Υ',
        'Phi': 'Φ',
        'Psi': 'Ψ',
        'Omega': 'Ω',
        // 三角函数
        'sin': 'sin',
        'cos': 'cos',
        'tan': 'tan',
        'cot': 'cot',
        'sec': 'sec',
        'csc': 'csc',
        // 函数符号
        'ln': 'ln',
        'log': 'log',
        'exp': 'exp',
        'lim': 'lim',
        'sup': 'sup',
        'inf': 'inf',
        'max': 'max',
        'min': 'min',
        // 导数符号
        'frac{d}{dx}': 'd/dx',
        'frac{partial}{partial x}': '∂/∂x',
        // 运算符
        'times': '×',
        'div': '÷',
        'neq': '≠',
        'approx': '≈',
        'leq': '≤',
        'geq': '≥',
        'infty': '∞',
        'pm': '±',
        'mp': '∓',
        'cdot': '·',
        'forall': '∀',
        'exists': '∃',
        'emptyset': '∅',
        'in': '∈',
        'notin': '∉',
        'subset': '⊂',
        'supset': '⊃',
        'subseteq': '⊆',
        'supseteq': '⊇',
        'cap': '∩',
        'cup': '∪',
        'setminus': '∖',
        'to': '→',
        'mapsto': '↦',
        'implies': '⇒',
        'iff': '⇔',
        'therefore': '∴',
        'because': '∵',
        // 括号和分隔符
        'lfloor': '⌊',
        'rfloor': '⌋',
        'lceil': '⌈',
        'rceil': '⌉',
        'langle': '⟨',
        'rangle': '⟩',
        // 箭头
        'rightarrow': '→',
        'leftarrow': '←',
        'leftrightarrow': '↔',
        'Rightarrow': '⇒',
        'Leftarrow': '⇐',
        'Leftrightarrow': '⇔',
        // 其他符号
        'nabla': '∇',
        'partial': '∂',
        'Re': 'ℜ',
        'Im': 'ℑ',
        'aleph': 'ℵ',
        'hbar': 'ℏ',
        'ell': 'ℓ',
        'wp': '℘',
        'mho': '℧',
        'Zeta': 'ℨ',
        'B': 'ℬ',
        'E': 'ℰ',
        'F': 'ℱ',
        'H': 'ℋ',
        'I': 'ℐ',
        'L': 'ℒ',
        'M': 'ℳ',
        'N': 'ℕ',
        'P': 'ℙ',
        'Q': 'ℚ',
        'R': 'ℝ',
        'S': 'ℤ',
        'T': 'ℤ',
        'U': 'ℤ',
        'V': 'ℤ',
        'W': 'ℤ',
        'X': 'ℤ',
        'Y': 'ℤ',
        'Z': 'ℤ'
    };
    let readableString = latex;

    for (const [latexCommand, readable] of Object.entries(latexToReadableMap)) {
        if (latexCommand.includes('(') && latexCommand.includes(')')) {
            const regex = new RegExp(latexCommand, 'g');
            readableString = readableString.replace(regex, readable);
        } else {
            readableString = readableString.replace(new RegExp(latexCommand, 'g'), readable);
        }
    }

    readableString = readableString.replace(/\\/g, '');

    return readableString;
}

export default function FormulaModal({ onOk, onCancel }) {
    const { t } = useTranslation();
    const [latex, setLatex] = useState('');
    const divRef = useRef(null);

    useEffect(() => {
        if (!divRef.current) return;

        const mf = new MathfieldElement({
            virtualKeyboardMode: 'onfocus',
            smartMode: true,
            displayMode: true, // 块级显示模式
            packages: ['base', 'amsmath'], // 加载 amsmath 包
            macros: {
                '\\begin{align}': '\\begin{aligned}',
                '\\end{align}': '\\end{aligned}'
            }
        });

        mf.addEventListener('input', (evt) => {
            console.log(evt.target.value);
            setLatex(evt.target.value);
        });

        divRef.current.appendChild(mf);

        return () => {
            mf.remove();
        };
    }, []);

    return (
        <div className="waxberry-custom-modal">
            <div className="waxberry-modal-box">
                <div className="waxberry-modal-title">
                    <span>{t('formula')}</span>
                    <CloseOutlined onClick={onCancel} />
                </div>
                <div className="formula-content" ref={divRef} />
                <div className="waxberry-modal-footer footer-right">
                    <div className="close" onClick={onCancel}>{t('cancel')}</div>
                    <div className="ok" onClick={()=>onOk(latexToReadableString(latex))}>{t('confirm')}</div>
                </div>
            </div>
        </div>
    );
}
