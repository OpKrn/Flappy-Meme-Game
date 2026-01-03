import{r as g}from"./chunk-JMJ3UQ3L-NvGUjwXk.js";if(typeof window<"u"){const r={};globalThis.process??(globalThis.process={});const t=globalThis.process.env??{};globalThis.process.env=new Proxy(Object.assign({},r,t),{get(n,o){return o in n?n[o]:void 0},has(){return!0}})}if(typeof window<"u"){const r={};globalThis.process??(globalThis.process={});const t=globalThis.process.env??{};globalThis.process.env=new Proxy(Object.assign({},r,t),{get(n,o){return o in n?n[o]:void 0},has(){return!0}})}const m="data-render-id";function C(r,t){const n=Math.max(r,t),o=`
    <svg width="${n}" height="${n}" viewBox="0 0 895 895" preserveAspectRatio="xMidYMid slice" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="895" height="895" fill="#E9E7E7"/>
<g>
<line x1="447.505" y1="-23" x2="447.505" y2="901" stroke="#C0C0C0" stroke-width="1.00975"/>
<line x1="889.335" y1="447.505" x2="5.66443" y2="447.505" stroke="#C0C0C0" stroke-width="1.00975"/>
<line x1="889.335" y1="278.068" x2="5.66443" y2="278.068" stroke="#C0C0C0" stroke-width="1.00975"/>
<line x1="889.335" y1="57.1505" x2="5.66443" y2="57.1504" stroke="#C0C0C0" stroke-width="1.00975"/>
<line x1="61.8051" y1="883.671" x2="61.8051" y2="6.10572e-05" stroke="#C0C0C0" stroke-width="1.00975"/>
<line x1="282.495" y1="907" x2="282.495" y2="-30" stroke="#C0C0C0" stroke-width="1.00975"/>
<line x1="611.495" y1="907" x2="611.495" y2="-30" stroke="#C0C0C0" stroke-width="1.00975"/>
<line x1="832.185" y1="883.671" x2="832.185" y2="6.10572e-05" stroke="#C0C0C0" stroke-width="1.00975"/>
<line x1="889.335" y1="827.53" x2="5.66443" y2="827.53" stroke="#C0C0C0" stroke-width="1.00975"/>
<line x1="889.335" y1="606.613" x2="5.66443" y2="606.612" stroke="#C0C0C0" stroke-width="1.00975"/>
<line x1="4.3568" y1="4.6428" x2="889.357" y2="888.643" stroke="#C0C0C0" stroke-width="1.00975"/>
<line x1="-0.3568" y1="894.643" x2="894.643" y2="0.642772" stroke="#C0C0C0" stroke-width="1.00975"/>
<circle cx="447.5" cy="441.5" r="163.995" stroke="#C0C0C0" stroke-width="1.00975"/>
<circle cx="447.911" cy="447.911" r="237.407" stroke="#C0C0C0" stroke-width="1.00975"/>
<circle cx="448" cy="442" r="384.495" stroke="#C0C0C0" stroke-width="1.00975"/>
</g>
</svg>
`;return`data:image/svg+xml;utf8,${encodeURIComponent(o)}`}function v(r){const t=g.useRef(null);return r&&"instance"in r?t:r??t}const M=g.forwardRef(function({as:t,children:n,renderId:o,onError:y,...k},f){const p=t==="img"?{...k,onError:e=>{typeof y=="function"&&y(e);const s=e.currentTarget,{width:l,height:a}=s.getBoundingClientRect();s.dataset.hasFallback="1",s.onerror=null,s.src=C(Math.round(l)||128,Math.round(a)||128),s.style.objectFit="cover"}}:k,c=v(f);return g.useEffect(()=>{const e=c&&"current"in c?c.current:null;if(!e)return;if(t!=="img"){const l=()=>{const{width:d,height:i}=e.getBoundingClientRect();return C(Math.round(d)||128,Math.round(i)||128)},a=()=>{e.dataset.hasFallback="1",e.style.backgroundImage=`url("${l()}")`,e.style.backgroundSize="cover"},u=()=>{const d=getComputedStyle(e).backgroundImage,i=/url\(["']?(.+?)["']?\)/.exec(d),h=i==null?void 0:i[1];if(!h)return;const b=new Image;b.onerror=a,b.src=h};u();const w=new ResizeObserver(([d])=>{if(!e.dataset.hasFallback)return;const{width:i,height:h}=d.contentRect;e.style.backgroundImage=`url("${C(Math.round(i)||128,Math.round(h)||128)}")`});w.observe(e);const x=new MutationObserver(u);return x.observe(e,{attributes:!0,attributeFilter:["style","class"]}),()=>{w.disconnect(),x.disconnect()}}if(!e.dataset.hasFallback)return;const s=new ResizeObserver(([l])=>{const{width:a,height:u}=l.contentRect;e.src=C(Math.round(a)||128,Math.round(u)||128)});return s.observe(e),()=>s.disconnect()},[t,c]),g.createElement(t,Object.assign({},p,{ref:c,...o?{[m]:o}:void 0}),n)});export{M as C};
