export const $ = sel => document.querySelector(sel);
export const $$ = sel => document.querySelectorAll(sel);

export function html(el, content) {
    el.innerHTML = content;
}

export function create(tag, attrs = {}) {
    const el = document.createElement(tag);
    Object.assign(el, attrs);
    return el;
}
